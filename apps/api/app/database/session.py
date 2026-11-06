from contextvars import ContextVar
from typing import AsyncGenerator, Optional
import uuid
from sqlalchemy import text, event
from sqlalchemy.orm import Session
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

@event.listens_for(Session, "after_begin")
def _apply_transaction_rls_context(session, transaction, connection):
    """Reapply request RLS context for every transaction, including post-commit refreshes."""
    tenant_id = session.info.get("rls_tenant_id")
    user_id = session.info.get("rls_user_id")
    connection.execute(
        text("""
            SELECT
                set_config('app.current_tenant_id', :tenant_id, true),
                set_config('app.current_user_id', :user_id, true)
        """),
        {
            "tenant_id": str(tenant_id) if tenant_id else "",
            "user_id": str(user_id) if user_id else "",
        },
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield a tenant-aware session. RLS settings are reapplied transaction-locally
    by the Session after_begin hook, so they survive commits and refreshes without
    leaking across pooled connections.
    """
    async with AsyncSessionLocal() as session:
        session.info["rls_tenant_id"] = get_current_tenant_id()
        session.info["rls_user_id"] = None
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            session.info.pop("rls_tenant_id", None)
            session.info.pop("rls_user_id", None)
            try:
                await session.execute(
                    text("SELECT set_config('app.current_tenant_id', '', true), set_config('app.current_user_id', '', true)")
                )
                await session.commit()
            except Exception:
                await session.rollback()
            await session.close()
            set_current_tenant_id(None)
