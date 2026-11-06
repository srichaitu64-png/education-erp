import asyncio
import os
import pytest
import pytest_asyncio
from typing import AsyncGenerator
import httpx
from sqlalchemy import text
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Set test environment before importing application settings.
os.environ["ENVIRONMENT"] = "testing"
os.environ["INITIAL_SUPERADMIN_PASSWORD"] = "AdminSecurePassword2026!"

from app.core.config import settings
from app.database.base import Base
from app.database.session import get_db, set_current_tenant_id
from app.database.rls import enable_row_level_security
from app.database.seed import seed_initial_data
from app.main import app

# HTTP requests use the restricted NOBYPASSRLS application role.
test_engine = create_async_engine(
    settings.TEST_DATABASE_URL,
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

# Schema management and deterministic test data use a separate administrative connection.
admin_url = settings.TEST_ADMIN_DATABASE_URL or settings.DATABASE_URL
admin_engine = create_async_engine(admin_url, echo=False, poolclass=NullPool)
AdminAsyncSessionLocal = async_sessionmaker(
    bind=admin_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)


def pytest_sessionstart(session):
    """Create schema and seed test data before enforcing RLS policies."""
    async def _setup():
        async with admin_engine.begin() as conn:
            await conn.execute(text("""
                DO $$
                BEGIN
                  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'erp_app') THEN
                    CREATE ROLE erp_app WITH LOGIN PASSWORD 'erp_app_pass' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
                  END IF;
                  GRANT USAGE, CREATE ON SCHEMA public TO erp_app;
                  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_app;
                  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_app;
                  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO erp_app;
                  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO erp_app;
                END
                $$;
            """))
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        async with AdminAsyncSessionLocal() as session:
            await seed_initial_data(session)

        async with admin_engine.begin() as conn:
            await enable_row_level_security(conn)

    asyncio.run(_setup())


def pytest_sessionfinish(session, exitstatus):
    """Teardown the isolated test database."""
    async def _teardown():
        async with admin_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
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
