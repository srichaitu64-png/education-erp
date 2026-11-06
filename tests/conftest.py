import asyncio
import os
import uuid
import pytest
import pytest_asyncio
from typing import AsyncGenerator
import httpx
from sqlalchemy import text, select
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Set test environment
os.environ["ENVIRONMENT"] = "testing"
TEST_OTP_ADMIN_PASSWORD = f"Aa!{uuid.uuid4().hex}2026"
os.environ["TEST_OTP_ADMIN_PASSWORD"] = TEST_OTP_ADMIN_PASSWORD
from app.core.config import settings
from app.database.base import Base
from app.database.session import get_db, set_current_tenant_id
from app.database.rls import enable_row_level_security
from app.database.seed import seed_initial_data
from app.core.security import hash_password, verify_password
from app.modules.identity.models import User, Role, UserRole
from app.main import app

# Dedicated test database engine using NullPool so each test event loop gets fresh connections
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


def pytest_sessionstart(session):
    """Synchronous session start hook to build schema and seed test database."""
    async def _setup():
        async with test_engine.begin() as conn:
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
            await enable_row_level_security(conn)

        async with TestAsyncSessionLocal() as s:
            await seed_initial_data(s)

            # Provision deterministic platform credentials only inside the disposable test DB.
            # Production seeding never receives or uses this test password.
            admin_email = "admin@platform.erp.in"
            admin_result = await s.execute(select(User).where(User.email == admin_email))
            test_admin = admin_result.scalars().first()
            if not test_admin:
                test_admin = User(
                    email=admin_email,
                    hashed_password=hash_password("AdminSecurePassword2026!"),
                    full_name="Test Platform Super Administrator",
                    is_active=True,
                    is_superadmin=True,
                    must_change_password=False,
                )
                s.add(test_admin)
                await s.flush()
            else:
                test_admin.hashed_password = hash_password("AdminSecurePassword2026!")
                test_admin.is_active = True
                test_admin.is_superadmin = True
                test_admin.must_change_password = False

            role_result = await s.execute(
                select(Role).where(Role.code == "SUPER_ADMIN", Role.tenant_id.is_(None))
            )
            super_role = role_result.scalars().first()
            if super_role:
                otp_admin_email = "otp-admin@platform.erp.in"
                otp_result = await s.execute(select(User).where(User.email == otp_admin_email))
                otp_admin = otp_result.scalars().first()
                if not otp_admin:
                    otp_admin = User(
                        email=otp_admin_email,
                        hashed_password=hash_password(TEST_OTP_ADMIN_PASSWORD),
                        full_name="Test OTP Recovery Administrator",
                        is_active=True,
                        is_superadmin=True,
                        must_change_password=False,
                    )
                    s.add(otp_admin)
                    await s.flush()
                else:
                    otp_admin.hashed_password = hash_password("OTPAdminSecurePassword2026!")
                    otp_admin.is_active = True
                    otp_admin.is_superadmin = True
                    otp_admin.must_change_password = False
                otp_assignment = await s.execute(
                    select(UserRole).where(
                        UserRole.user_id == otp_admin.id,
                        UserRole.role_id == super_role.id,
                        UserRole.tenant_id.is_(None),
                    )
                )
                if not otp_assignment.scalars().first():
                    s.add(UserRole(user_id=otp_admin.id, role_id=super_role.id, tenant_id=None))

                assignment_result = await s.execute(
                    select(UserRole).where(
                        UserRole.user_id == test_admin.id,
                        UserRole.role_id == super_role.id,
                        UserRole.tenant_id.is_(None),
                    )
                )
                if not assignment_result.scalars().first():
                    s.add(UserRole(user_id=test_admin.id, role_id=super_role.id, tenant_id=None))
            await s.commit()
            assert test_admin.is_superadmin is True
            assert verify_password("AdminSecurePassword2026!", test_admin.hashed_password)

    asyncio.run(_setup())


def pytest_sessionfinish(session, exitstatus):
    """Teardown test database."""
    async def _teardown():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await test_engine.dispose()

    asyncio.run(_teardown())


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a clean database session for each test."""
    async with TestAsyncSessionLocal() as session:
        app.dependency_overrides[get_db] = lambda: session
        yield session
        await session.rollback()
        app.dependency_overrides.pop(get_db, None)
        set_current_tenant_id(None)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[httpx.AsyncClient, None]:
    """Asynchronous HTTP test client."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
