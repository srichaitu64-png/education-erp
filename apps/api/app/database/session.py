from contextvars import ContextVar
from typing import AsyncGenerator, Optional
import uuid
from sqlalchemy import text
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings

# Thread-safe / Coroutine-safe Context Variable for current tenant
current_tenant_context: ContextVar[Optional[uuid.UUID]] = ContextVar(
    "current_tenant_context", default=None
)


def get_current_tenant_id() -> Optional[uuid.UUID]:
    return current_tenant_context.get()


def set_current_tenant_id(tenant_id: Optional[uuid.UUID]) -> None:
    current_tenant_context.set(tenant_id)


# Primary asynchronous SQLAlchemy engine. NullPool in tests prevents asyncpg
# connections from being reused across pytest's per-test event loops.
_engine_options = {
    "echo": settings.ENVIRONMENT == "development_verbose",
}
if settings.ENVIRONMENT == "testing":
    _engine_options["poolclass"] = NullPool
else:
    _engine_options.update(
        pool_size=15,
        max_overflow=20,
        pool_pre_ping=True,
    )
engine = create_async_engine(settings.DATABASE_URL, **_engine_options)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding a tenant-aware async database session.
    Configures PostgreSQL RLS session setting when tenant context is active,
    and sanitizes pooled connection state on every acquisition.
    """
    async with AsyncSessionLocal() as session:
        # Sanitize pooled connection state to prevent cross-request leakage
        await session.execute(text("SELECT set_config('app.is_superadmin', 'false', true)"))
        tenant_id = get_current_tenant_id()
        if tenant_id:
            # Set PostgreSQL session variable for Row-Level Security safely using set_config
            await session.execute(
                text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
                {"tenant_id": str(tenant_id)}
            )
        else:
            await session.execute(text("SELECT set_config('app.current_tenant_id', '', true)"))
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            # Clear request-scoped tenant context before the async task is reused.
            set_current_tenant_id(None)
            await session.close()
