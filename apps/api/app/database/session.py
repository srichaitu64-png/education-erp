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
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield a tenant-aware session. RLS context is session-scoped so it survives
    endpoint commits and refreshes, then explicitly cleared before the pooled
    connection is returned.
    """
    async with AsyncSessionLocal() as session:
        tenant_id = get_current_tenant_id()
        try:
            await session.execute(
                text("SELECT set_config('app.current_tenant_id', :tenant_id, false)"),
                {"tenant_id": str(tenant_id) if tenant_id else ""}
            )
            await session.execute(text("SELECT set_config('app.current_user_id', '', false)"))
            # Persist the request scope before route code starts committing.
            await session.commit()
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            try:
                await session.execute(text("SELECT set_config('app.current_tenant_id', '', false)"))
                await session.execute(text("SELECT set_config('app.current_user_id', '', false)"))
                await session.commit()
            except Exception:
                await session.rollback()
            await session.close()
