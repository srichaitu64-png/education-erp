import asyncio
import os
import subprocess
import sys
from typing import AsyncGenerator, Optional
import httpx
import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Set test environment before importing application settings.
os.environ["ENVIRONMENT"] = "testing"
os.environ["INITIAL_SUPERADMIN_PASSWORD"] = "AdminSecurePassword2026!"

from app.core.config import settings
from app.database.session import get_db, get_current_tenant_id, set_current_tenant_id
from app.database.rls import enable_row_level_security
from app.database.seed import seed_initial_data
from app.main import app

# Explicit disposable test database allowlist to prevent accidental target of dev/prod databases
DISPOSABLE_TEST_DB_ALLOWLIST = {
    "education_erp_test",
    "education_erp_mig_cycle_test",
    "education_erp_alembic_check_test",
}


def validate_disposable_test_database(url: Optional[str], param_name: str) -> str:
    """
    Verify that a database URL strictly targets an allowed disposable test database.
    Prevents destructive operations against development or production databases.
    """
    if not url:
        raise RuntimeError(
            f"CRITICAL SAFETY VIOLATION: {param_name} is not set. "
            "Test execution requires explicit, non-fallback configuration targeting disposable databases."
        )
    clean_url = url.split("?")[0]
    db_name = clean_url.rstrip("/").split("/")[-1]
    if db_name in ("education_erp_dev", "education_erp_prod", "education_erp") or db_name not in DISPOSABLE_TEST_DB_ALLOWLIST:
        raise RuntimeError(
            f"CRITICAL SAFETY VIOLATION: {param_name} attempted to target non-disposable database '{db_name}'. "
            f"Tests are strictly forbidden from targeting development or production databases. Allowed: {DISPOSABLE_TEST_DB_ALLOWLIST}"
        )
    return url


# Validate URLs and fail immediately if TEST_ADMIN_DATABASE_URL is missing or unsafe
test_url = validate_disposable_test_database(settings.TEST_DATABASE_URL, "TEST_DATABASE_URL")
admin_url = validate_disposable_test_database(settings.TEST_ADMIN_DATABASE_URL, "TEST_ADMIN_DATABASE_URL")

# HTTP requests and RLS assertion tests use the restricted NOBYPASSRLS application role.
test_engine = create_async_engine(
    test_url,
    echo=False,
    poolclass=NullPool
)
TestAsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Schema management, migrations, and deterministic seed data use a dedicated test administrator connection.
admin_engine = create_async_engine(admin_url, echo=False, poolclass=NullPool)
AdminAsyncSessionLocal = async_sessionmaker(
    bind=admin_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)


def pytest_sessionstart(session):
    """
    Prepare isolated disposable test database using full Alembic migrations.
    Replaces destructive Base.metadata.drop_all/create_all with authentic migration execution.
    """
    async def _setup():
        # 1. Clean public schema
        async with admin_engine.begin() as conn:
            await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
            await conn.execute(text("CREATE SCHEMA public;"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO erp_test_admin;"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO erp_app;"))

        # 2. Run complete Alembic migration graph from base to head
        api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api"))
        mig_result = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"db_url={admin_url}", "upgrade", "head"],
            cwd=api_dir,
            capture_output=True,
            text=True,
            env=dict(os.environ)
        )
        if mig_result.returncode != 0:
            raise RuntimeError(
                f"Alembic migration failed during test session initialization: {mig_result.stderr or mig_result.stdout}"
            )

        # 3. Seed deterministic initial test data using administrative session
        async with AdminAsyncSessionLocal() as session:
            await seed_initial_data(session)

        # 4. Enforce Row-Level Security policies on all tenant tables
        async with admin_engine.begin() as conn:
            await enable_row_level_security(conn)
            # Grant privileges on all migrated tables and sequences to application role
            await conn.execute(text("GRANT USAGE ON SCHEMA public TO erp_app;"))
            await conn.execute(text("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_app;"))
            await conn.execute(text("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_app;"))
            await conn.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO erp_app;"))
            await conn.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO erp_app;"))

    asyncio.run(_setup())


def pytest_sessionfinish(session, exitstatus):
    """Teardown the isolated test database safely."""
    async def _teardown():
        try:
            async with admin_engine.begin() as conn:
                await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
                await conn.execute(text("CREATE SCHEMA public;"))
                await conn.execute(text("GRANT ALL ON SCHEMA public TO erp_test_admin;"))
                await conn.execute(text("GRANT ALL ON SCHEMA public TO erp_app;"))
        except Exception:
            pass
        finally:
            await test_engine.dispose()
            await admin_engine.dispose()

    asyncio.run(_teardown())


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Administrative session for test data setup and assertions."""
    async with AdminAsyncSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def app_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Direct session using the restricted application role for RLS assertions."""
    async with TestAsyncSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """HTTP client whose requests execute with the restricted application DB role."""
    async def override_get_db():
        async with TestAsyncSessionLocal() as session:
            session.info["rls_tenant_id"] = get_current_tenant_id()
            session.info["rls_user_id"] = None
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                set_current_tenant_id(None)

    app.dependency_overrides[get_db] = override_get_db
    transport = httpx.ASGITransport(app=app)
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as ac:
            yield ac
    finally:
        app.dependency_overrides.pop(get_db, None)
        set_current_tenant_id(None)
