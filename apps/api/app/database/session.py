from contextvars import ContextVar
from typing import AsyncGenerator, Optional
import uuid

from sqlalchemy import event, text
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# Coroutine-local tenant identity. Never accept this value directly from a client;
# it is populated only after validating the signed access token.
current_tenant_context: ContextVar[Optional[uuid.UUID]] = ContextVar(
    "current_tenant_context", default=None
)


def get_current_tenant_id() -> Optional[uuid.UUID]:
    return current_tenant_context.get()


def set_current_tenant_id(tenant_id: Optional[uuid.UUID]) -> None:
    current_tenant_context.set(tenant_id)


class RLSAsyncSession(AsyncSession):
    """Async session that reapplies request-scoped RLS context after every commit."""

    async def set_rls_context(
        self,
        tenant_id: Optional[uuid.UUID],
        is_superadmin: bool = False,
    ) -> None:
        self.info["_rls_context_enabled"] = True
        self.info["_rls_tenant_id"] = str(tenant_id) if tenant_id else ""
        self.info["_rls_is_superadmin"] = bool(is_superadmin)
        set_current_tenant_id(tenant_id)
        await self.execute(
            text("SELECT set_config('app.is_superadmin', :flag, true)"),
            {"flag": "true" if is_superadmin else "false"},
        )
        await self.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": str(tenant_id) if tenant_id else ""},
        )


@event.listens_for(RLSAsyncSession.sync_session_class, "after_begin")
def _reapply_rls_context_after_begin(sync_session, transaction, connection):
    """Transaction-local PostgreSQL settings must be restored after internal commits."""
    if not sync_session.info.get("_rls_context_enabled"):
        return
    connection.execute(
        text("SELECT set_config('app.is_superadmin', :flag, true)"),
        {"flag": "true" if sync_session.info.get("_rls_is_superadmin") else "false"},
    )
    connection.execute(
        text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
        {"tenant_id": sync_session.info.get("_rls_tenant_id", "")},
    )


# NullPool in tests prevents asyncpg connections from crossing pytest event loops.
_engine_options = {"echo": settings.ENVIRONMENT == "development_verbose"}
if settings.ENVIRONMENT == "testing":
    _engine_options["poolclass"] = NullPool
else:
    _engine_options.update(pool_size=15, max_overflow=20, pool_pre_ping=True)

engine = create_async_engine(settings.DATABASE_URL, **_engine_options)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=RLSAsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a DB session with sanitized, request-scoped PostgreSQL RLS settings."""
    async with AsyncSessionLocal() as session:
        await session.set_rls_context(get_current_tenant_id(), is_superadmin=False)
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            # Clear the session's retained scope before its connection is returned.
            await session.set_rls_context(None, is_superadmin=False)
            await session.rollback()
            set_current_tenant_id(None)
            await session.close()
