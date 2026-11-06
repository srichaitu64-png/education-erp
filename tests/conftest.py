"""Test database bootstrap and isolated API sessions.

Fixture setup uses a dedicated disposable-database administrator connection.
The application itself always connects as the NOBYPASSRLS erp_app role, so
HTTP tests exercise the same forced-RLS boundary as production.
"""
import asyncio
import os
import secrets
from typing import AsyncGenerator

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("INITIAL_SUPERADMIN_PASSWORD", "AdminSecurePassword2026!")
os.environ.setdefault("TEST_OTP_ADMIN_PASSWORD", "OtpAdminSecurePassword2026!")

# Ensure the FastAPI engine uses the disposable test database, never a developer DB.
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = os.getenv(
        "TEST_DATABASE_URL",
        "postgresql+asyncpg://erp_app:erp_app_pass@127.0.0.1:5433/education_erp_test",
    )

from app.core.config import settings
from app.database.base import Base
from app.database.rls import enable_row_level_security
from app.database.seed import seed_initial_data
from app.core.security import hash_password
from app.modules.identity.models import User, Role, UserRole
from app.main import app

if not settings.TEST_ADMIN_DATABASE_URL:
    raise RuntimeError(
        "TEST_ADMIN_DATABASE_URL must point to the disposable test database using "
        "a database administrator account. Do not use this fixture against production."
    )

bootstrap_engine = create_async_engine(
    settings.TEST_ADMIN_DATABASE_URL,
    echo=False,
    poolclass=NullPool,
)
BootstrapSessionLocal = async_sessionmaker(
    bind=bootstrap_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def pytest_sessionstart(session):
    """Create the disposable schema and seed test-only accounts as database admin."""
    async def _setup():
        async with bootstrap_engine.begin() as conn:
            await conn.execute(text("""
                DO $$
                BEGIN
                  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'erp_app') THEN
                    CREATE ROLE erp_app WITH LOGIN PASSWORD 'erp_app_pass'
                      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
                  END IF;
                END
                $$;
            """))
            await conn.execute(text(
                "ALTER ROLE erp_app WITH LOGIN PASSWORD 'erp_app_pass' "
                "NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS"
            ))
            await conn.execute(text("GRANT CONNECT ON DATABASE education_erp_test TO erp_app"))
            await conn.execute(text("GRANT USAGE ON SCHEMA public TO erp_app"))
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
            await enable_row_level_security(conn)
            await conn.execute(text("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO erp_app"))
            await conn.execute(text("GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO erp_app"))
            await conn.execute(text(
                "ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO erp_app"
            ))
            await conn.execute(text(
                "ALTER DEFAULT PRIVILEGES IN SCHEMA public "
                "GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO erp_app"
            ))

        async with BootstrapSessionLocal() as db:
            await seed_initial_data(db)
            admin_email = "admin@platform.erp.in"
            admin = (
                await db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": admin_email})
            ).first()
            if not admin:
                test_admin = User(
                    email=admin_email,
                    hashed_password=hash_password(os.environ["INITIAL_SUPERADMIN_PASSWORD"]),
                    full_name="Test Platform Super Administrator",
                    is_active=True,
                    is_superadmin=True,
                    must_change_password=False,
                )
                db.add(test_admin)
                await db.flush()
                test_admin_id = test_admin.id
            else:
                test_admin_id = admin.id

            super_role = (
                await db.execute(
                    text("SELECT id FROM roles WHERE code = 'SUPER_ADMIN' AND tenant_id IS NULL")
                )
            ).first()
            if super_role:
                assignment = (
                    await db.execute(
                        text("""
                            SELECT id FROM user_roles
                            WHERE user_id = :user_id AND role_id = :role_id AND tenant_id IS NULL
                        """),
                        {"user_id": test_admin_id, "role_id": super_role.id},
                    )
                ).first()
                if not assignment:
                    db.add(UserRole(user_id=test_admin_id, role_id=super_role.id, tenant_id=None))

                otp_email = "otp-admin@platform.erp.in"
                otp_user = (
                    await db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": otp_email})
                ).first()
                if not otp_user:
                    otp_admin = User(
                        email=otp_email,
                        hashed_password=hash_password(os.environ["TEST_OTP_ADMIN_PASSWORD"]),
                        full_name="Test OTP Recovery Administrator",
                        is_active=True,
                        is_superadmin=True,
                        must_change_password=False,
                    )
                    db.add(otp_admin)
                    await db.flush()
                    otp_user_id = otp_admin.id
                else:
                    otp_user_id = otp_user.id
                otp_assignment = (
                    await db.execute(
                        text("""
                            SELECT id FROM user_roles
                            WHERE user_id = :user_id AND role_id = :role_id AND tenant_id IS NULL
                        """),
                        {"user_id": otp_user_id, "role_id": super_role.id},
                    )
                ).first()
                if not otp_assignment:
                    db.add(UserRole(user_id=otp_user_id, role_id=super_role.id, tenant_id=None))
            await db.commit()

    asyncio.run(_setup())


def pytest_sessionfinish(session, exitstatus):
    """Drop only the disposable test schema."""
    async def _teardown():
        async with bootstrap_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await bootstrap_engine.dispose()

    asyncio.run(_teardown())


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Privileged fixture session for arranging isolated test data only."""
    async with BootstrapSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[httpx.AsyncClient, None]:
    """HTTP client uses the application's real NOBYPASSRLS database connection."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
