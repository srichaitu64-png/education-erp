import asyncio
import os
import pytest
import pytest_asyncio
from typing import AsyncGenerator
import httpx
from sqlalchemy import text
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Set test environment
os.environ["ENVIRONMENT"] = "testing"
from app.core.config import settings
from app.database.base import Base
from app.database.session import get_db, set_current_tenant_id
from app.database.rls import enable_row_level_security
from app.database.seed import seed_initial_data
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
