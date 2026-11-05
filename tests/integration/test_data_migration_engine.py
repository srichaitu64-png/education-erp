import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.security import create_access_token
from app.modules.tenants.models import Tenant
from app.modules.identity.models import User
from app.modules.academic.models import Student
from app.modules.migration.models import MigrationBatchLog


async def get_migration_auth_headers(db_session: AsyncSession, tenant_code: str = "our-school-demo"):
    target_code = "our-school-demo" if tenant_code == "akshara" else tenant_code
    stmt_tenant = select(Tenant).where(or_(Tenant.code == target_code, Tenant.code == tenant_code))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None, f"Tenant {tenant_code} must exist"

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    return {"Authorization": f"Bearer {token}"}, tenant


@pytest.mark.asyncio
async def test_migration_csv_templates(client: AsyncClient):
    """Verify template CSV downloads for all supported modules."""
    for module in ["STUDENTS", "FEES", "STAFF", "ATTENDANCE", "EXAMINATIONS"]:
        res = await client.get(f"/api/v1/migration/templates/{module}")
        assert res.status_code == 200, f"Template for {module} failed: {res.text}"
        assert "text/csv" in res.headers.get("content-type", "")
        assert f"EducationOS_{module}_Template.csv" in res.headers.get("content-disposition", "")
        content = res.text
        lines = content.strip().split("\n")
        assert len(lines) >= 2, f"Template {module} must have header and sample row"
        assert len(lines[0].split(",")) >= 3

    # Test unsupported module
    bad_res = await client.get("/api/v1/migration/templates/UNKNOWN_MODULE")
    assert bad_res.status_code == 400


@pytest.mark.asyncio
async def test_migration_validation_clean_and_duplicate_detection(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Test pre-ingestion validation:
    - Identifies clean rows
    - Flags missing mandatory fields (first_name, class_name)
    - Discovers exact duplicate admission numbers against existing database records
    """
    headers, tenant = await get_migration_auth_headers(db_session, "akshara")

    # Seed an existing student in this tenant
    seed_adm = f"ADM-TEST-EXISTING-{uuid.uuid4().hex[:4].upper()}"
    existing_student = Student(
        tenant_id=tenant.id,
        admission_number=seed_adm,
        first_name="Existing",
        last_name="Student",
        class_name="Class 10",
        section_or_stream="A",
        guardian_phone="+91 91111 22222",
        status="ACTIVE"
    )
    db_session.add(existing_student)
    await db_session.commit()

    # Prepare payload with:
    # 1. Clean new record
    # 2. Duplicate record (same admission number)
    # 3. Invalid record (missing first_name)
    payload = {
        "target_module": "STUDENTS",
        "import_type": "STUDENT_MASTER",
        "records": [
            {
                "admission_number": f"ADM-TEST-NEW-{uuid.uuid4().hex[:4].upper()}",
                "first_name": "Pooja",
                "last_name": "Hegde",
                "class_name": "Class 10",
                "section_or_stream": "B",
                "guardian_phone": "+91 93333 44444"
            },
            {
                "admission_number": seed_adm,
                "first_name": "Existing",
                "last_name": "Student Duplicate",
                "class_name": "Class 10",
                "section_or_stream": "A"
            },
            {
                "admission_number": f"ADM-TEST-ERR-{uuid.uuid4().hex[:4].upper()}",
                "first_name": "",  # missing!
                "last_name": "Incomplete",
                "class_name": "Class 10"
            }
        ]
    }

    res = await client.post("/api/v1/migration/validate", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["is_valid"] is False  # contains errors
    assert data["total_records"] == 3
    assert data["duplicate_candidates_count"] == 1
    assert data["errors_count"] == 1
    assert data["clean_records_count"] == 1

    # Verify duplicate candidate payload
    dup = data["duplicate_candidates"][0]
    assert dup["admission_number"] == seed_adm
    assert dup["match_type"] == "EXACT"
    assert dup["existing_id"] == str(existing_student.id)


@pytest.mark.asyncio
async def test_migration_chunked_execution_with_conflict_policies(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Test bulk execution under SKIP, OVERWRITE, and MERGE conflict policies.
    Verify database records and audit logging in migration_batch_logs.
    """
    headers, tenant = await get_migration_auth_headers(db_session, "akshara")

    unique_suffix = uuid.uuid4().hex[:6].upper()
    existing_adm = f"ADM-CONF-{unique_suffix}"
    new_adm = f"ADM-NEW-{unique_suffix}"

    # 1. Seed initial student
    st = Student(
        tenant_id=tenant.id,
        admission_number=existing_adm,
        first_name="InitialFirst",
        last_name="InitialLast",
        class_name="Class 8",
        section_or_stream="A",
        guardian_phone="",  # blank for MERGE test
        parent_email="initial@school.edu.in",
        status="ACTIVE"
    )
    db_session.add(st)
    await db_session.commit()

    # 2. Test SKIP Policy
    skip_payload = {
        "target_module": "STUDENTS",
        "import_type": "STUDENT_MASTER",
        "file_name": "test_skip.csv",
        "conflict_policy": "SKIP",
        "records": [
            {
                "admission_number": existing_adm,
                "first_name": "AttemptedOverwrittenFirst",
                "last_name": "AttemptedOverwrittenLast",
                "class_name": "Class 8",
                "section_or_stream": "A"
            },
            {
                "admission_number": new_adm,
                "first_name": "BrandNew",
                "last_name": "Candidate",
                "class_name": "Class 8",
                "section_or_stream": "B",
                "guardian_phone": "+91 99999 11111"
            }
        ]
    }
    res_skip = await client.post("/api/v1/migration/execute", json=skip_payload, headers=headers)
    assert res_skip.status_code == 201, res_skip.text
    skip_data = res_skip.json()
    assert skip_data["status"] == "SUCCESS"
    assert skip_data["total_records"] == 2
    assert skip_data["imported_count"] == 1
    assert skip_data["skipped_count"] == 1

    # Verify existing record was NOT changed
    res_check = await db_session.execute(
        select(Student).where(Student.tenant_id == tenant.id, Student.admission_number == existing_adm)
    )
    st_check = res_check.scalars().first()
    assert st_check.first_name == "InitialFirst"

    # Verify new student was created
    res_new = await db_session.execute(
        select(Student).where(Student.tenant_id == tenant.id, Student.admission_number == new_adm)
    )
    st_new = res_new.scalars().first()
    assert st_new is not None
    assert st_new.first_name == "BrandNew"

    # 3. Test OVERWRITE Policy
    overwrite_payload = {
        "target_module": "STUDENTS",
        "import_type": "STUDENT_MASTER",
        "file_name": "test_overwrite.csv",
        "conflict_policy": "OVERWRITE",
        "records": [
            {
                "admission_number": existing_adm,
                "first_name": "OverwrittenFirst",
                "last_name": "OverwrittenLast",
                "class_name": "Class 9",
                "section_or_stream": "C",
                "guardian_name": "Updated Guardian"
            }
        ]
    }
    res_ow = await client.post("/api/v1/migration/execute", json=overwrite_payload, headers=headers)
    assert res_ow.status_code == 201, res_ow.text
    ow_data = res_ow.json()
    assert ow_data["imported_count"] == 1
    assert ow_data["skipped_count"] == 0

    await db_session.refresh(st_check)
    assert st_check.first_name == "OverwrittenFirst"
    assert st_check.class_name == "Class 9"
    assert st_check.guardian_name == "Updated Guardian"

    # 4. Test MERGE Policy
    merge_payload = {
        "target_module": "STUDENTS",
        "import_type": "STUDENT_MASTER",
        "file_name": "test_merge.csv",
        "conflict_policy": "MERGE",
        "records": [
            {
                "admission_number": existing_adm,
                "first_name": "IgnoredBecauseExistingHasValue",
                "guardian_phone": "+91 97777 66666",  # Was empty, should merge
                "parent_email": "new_email@ignore.com"  # Already had email, should not overwrite
            }
        ]
    }
    res_mg = await client.post("/api/v1/migration/execute", json=merge_payload, headers=headers)
    assert res_mg.status_code == 201, res_mg.text

    await db_session.refresh(st_check)
    assert st_check.guardian_phone == "+91 97777 66666"
    assert st_check.parent_email == "initial@school.edu.in"

    # 5. Verify batch audit log listing
    res_batches = await client.get("/api/v1/migration/batches?target_module=STUDENTS", headers=headers)
    assert res_batches.status_code == 200, res_batches.text
    batches = res_batches.json()
    assert len(batches) >= 3
    assert all(b["target_module"] == "STUDENTS" for b in batches)
    assert all(b["tenant_id"] == str(tenant.id) for b in batches)

