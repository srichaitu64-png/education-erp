from contextvars import ContextVar
from typing import AsyncGenerator, Optional
import uuid
from sqlalchemy import text
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


class RLSAsyncSession(AsyncSession):
    """Reapply transaction-local RLS context after commits and rollbacks.

    Tenant and privilege GUCs must survive ORM code that commits more than once
    during a request, but must never leak to the next pooled connection user.
    """

    async def set_rls_context(
        self,
        tenant_id: Optional[uuid.UUID],
        is_superadmin: bool = False,
    ) -> None:
        self.info["_rls_context_enabled"] = True
        self.info["_rls_tenant_id"] = str(tenant_id) if tenant_id else ""
        self.info["_rls_is_superadmin"] = bool(is_superadmin)
        set_current_tenant_id(tenant_id)
        await self._apply_rls_context()

    async def _apply_rls_context(self) -> None:
        if not self.info.get("_rls_context_enabled"):
            return
        await super().execute(
            text("SELECT set_config('app.is_superadmin', :flag, true)"),
            {"flag": "true" if self.info.get("_rls_is_superadmin") else "false"},
        )
        await super().execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": self.info.get("_rls_tenant_id", "")},
        )

    async def commit(self) -> None:
        await super().commit()
        await self._apply_rls_context()

    async def rollback(self) -> None:
        await super().rollback()
        await self._apply_rls_context()


# Primary asynchronous SQLAlchemy engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development_verbose"),
    pool_size=15,
    max_overflow=20,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=RLSAsyncSession,
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
        tenant_id = get_current_tenant_id()
        await session.set_rls_context(tenant_id, is_superadmin=False)
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            # Clear request-scoped RLS context before returning the connection to the pool.
            await session.set_rls_context(None, is_superadmin=False)
            await session.rollback()
            set_current_tenant_id(None)
            await session.close()
