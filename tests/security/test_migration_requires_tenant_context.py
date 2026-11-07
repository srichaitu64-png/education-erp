import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.modules.identity.models import User


@pytest.mark.asyncio
async def test_migration_endpoints_fail_closed_without_tenant_context(
    client: AsyncClient,
    db_session: AsyncSession,
):
    """A platform account without an explicitly selected tenant cannot migrate data."""
    result = await db_session.execute(
        select(User).where(User.is_superadmin.is_(True)).limit(1)
    )
    platform_admin = result.scalars().first()
    assert platform_admin is not None, "A seeded platform administrator is required"

    token = create_access_token(
        subject=str(platform_admin.id),
        is_superadmin=True,
    )
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "target_module": "STUDENTS",
        "import_type": "STUDENT_MASTER",
        "file_name": "tenant_context_required.csv",
        "conflict_policy": "SKIP",
        "records": [
            {
                "admission_number": "MUST-NOT-BE-WRITTEN",
                "first_name": "Unsafe",
                "last_name": "Fallback",
                "class_name": "Class 1",
            }
        ],
    }

    validate_response = await client.post(
        "/api/v1/migration/validate",
        json=payload,
        headers=headers,
    )
    assert validate_response.status_code == 403
    assert "institution context" in validate_response.text.lower()

    execute_response = await client.post(
        "/api/v1/migration/execute",
        json=payload,
        headers=headers,
    )
    assert execute_response.status_code == 403
    assert "institution context" in execute_response.text.lower()

    batches_response = await client.get(
        "/api/v1/migration/batches",
        headers=headers,
    )
    assert batches_response.status_code == 403
    assert "institution context" in batches_response.text.lower()
