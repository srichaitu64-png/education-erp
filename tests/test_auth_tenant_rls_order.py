import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.security.deps import get_current_user


def _result(value):
    return SimpleNamespace(scalars=lambda: SimpleNamespace(first=lambda: value))


@pytest.mark.asyncio
async def test_tenant_rls_is_set_on_open_session_before_roles_are_loaded():
    user_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    user = SimpleNamespace(
        id=user_id,
        is_active=True,
        is_superadmin=False,
        must_change_password=False,
        roles=[SimpleNamespace(tenant_id=tenant_id)],
    )
    db = SimpleNamespace(execute=AsyncMock(side_effect=[
        _result(user),       # Global user lookup
        SimpleNamespace(),  # Set tenant RLS context
        SimpleNamespace(),  # Keep superadmin disabled
        _result(user),       # Reload roles after RLS context is set
    ]))
    request = SimpleNamespace(url=SimpleNamespace(path="/api/v1/institution/profile"))

    result = await get_current_user(
        request=request,
        payload={"sub": str(user_id), "tenant_id": str(tenant_id)},
        db=db,
    )

    assert result is user
    assert db.execute.await_count == 4
    tenant_context_sql = str(db.execute.await_args_list[1].args[0])
    superadmin_sql = str(db.execute.await_args_list[2].args[0])
    assert "app.current_tenant_id" in tenant_context_sql
    assert "app.is_superadmin" in superadmin_sql
    assert db.execute.await_args_list[1].kwargs["params"]["tenant_id"] == str(tenant_id)


@pytest.mark.asyncio
async def test_malformed_tenant_claim_is_rejected():
    user_id = uuid.uuid4()
    user = SimpleNamespace(
        id=user_id,
        is_active=True,
        is_superadmin=False,
        must_change_password=False,
        roles=[],
    )
    db = SimpleNamespace(execute=AsyncMock(return_value=_result(user)))
    request = SimpleNamespace(url=SimpleNamespace(path="/api/v1/institution/profile"))

    with pytest.raises(HTTPException) as exc:
        await get_current_user(
            request=request,
            payload={"sub": str(user_id), "tenant_id": "not-a-uuid"},
            db=db,
        )

    assert exc.value.status_code == 401
    assert db.execute.await_count == 1


@pytest.mark.asyncio
async def test_platform_rls_elevation_occurs_only_after_user_record_is_loaded():
    user_id = uuid.uuid4()
    user = SimpleNamespace(
        id=user_id,
        is_active=True,
        is_superadmin=True,
        must_change_password=False,
        roles=[],
    )
    db = SimpleNamespace(execute=AsyncMock(side_effect=[
        _result(user),
        SimpleNamespace(),  # Clear tenant context
        SimpleNamespace(),  # Enable platform RLS after DB user check
        _result(user),
    ]))
    request = SimpleNamespace(url=SimpleNamespace(path="/api/v1/platform/overview"))

    result = await get_current_user(
        request=request,
        payload={"sub": str(user_id), "tenant_id": None},
        db=db,
    )

    assert result is user
    elevation_sql = str(db.execute.await_args_list[2].args[0])
    assert "app.is_superadmin" in elevation_sql
    assert "'true'" in elevation_sql
