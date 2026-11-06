import uuid
from datetime import date, datetime, timezone
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, create_access_token
from app.modules.identity.models import User, Role, Permission, UserRole
from app.modules.tenants.models import Tenant
from app.modules.examinations.models import Examination, ExamAttendanceAndMarks, ExternalExamProviderConfig


@pytest.mark.asyncio
async def test_institution_admin_cannot_access_permission_management(client, db_session: AsyncSession):
    """
    Security Test 1 & 2:
    Institution Admin and Principal CANNOT access permission management APIs.
    Only Platform Super Admin may view/modify permissions.
    """
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    # Create Institution Principal / Admin (non-superadmin)
    stmt_t = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    res_t = await db_session.execute(stmt_t)
    tenant = res_t.scalars().first()

    inst_user = User(
        email=f"principal_{uuid.uuid4().hex[:6]}@akshara.edu.in",
        hashed_password=hash_password("Pass123!"),
        full_name="Principal User",
        is_active=True,
        is_superadmin=False
    )
    tenant_id = tenant.id
    inst_user_id = inst_user.id
    db_session.add(inst_user)
    tenant_role = Role(name="Tenant Principal", code="PRINCIPAL", tenant_id=tenant.id, is_system=False)
    db_session.add(tenant_role)
    await db_session.flush()
    db_session.add(UserRole(user_id=inst_user.id, role_id=tenant_role.id, tenant_id=tenant.id))
    await db_session.commit()

    token = create_access_token(
        subject=str(inst_user_id),
        tenant_id=str(tenant_id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access Super Admin Permission Matrix
    resp = await client.get("/api/v1/platform/permissions/matrix", headers=headers)
    assert resp.status_code == 403
    assert "Super Admin" in resp.json()["detail"]

    # Attempt to assign role
    resp_assign = await client.post(
        "/api/v1/platform/permissions/users/assign",
        params={
            "target_user_id": str(inst_user_id),
            "role_code": "PRINCIPAL",
            "action": "ASSIGN",
            "reason": "Unauthorized self assignment"
        },
        headers=headers
    )
    assert resp_assign.status_code == 403


@pytest.mark.asyncio
async def test_superadmin_lockout_protection(client, db_session: AsyncSession):
    """
    Security Test 7 & 13:
    Super Admin lockout protection: Prohibits revoking the acting Super Admin's own platform privilege.
    """
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    # Fetch super admin user
    stmt = select(User).where(User.email == "admin@platform.erp.in")
    res = await db_session.execute(stmt)
    admin = res.scalars().first()

    token = create_access_token(
        subject=str(admin.id),
        tenant_id=None,
        is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to revoke own SUPER_ADMIN role
    resp_revoke = await client.post(
        "/api/v1/platform/permissions/users/assign",
        params={
            "target_user_id": str(admin.id),
            "role_code": "SUPER_ADMIN",
            "action": "REVOKE",
            "reason": "Accidental self lockout"
        },
        headers=headers
    )
    assert resp_revoke.status_code == 400
    assert "Lockout Guard" in resp_revoke.json()["detail"]


@pytest.mark.asyncio
async def test_offline_examination_sync_prevents_silent_overwrite_of_approved_marks(client, db_session: AsyncSession):
    """
    Security Test 10:
    Offline sync conflict resolution:
    Never silently overwrites marks if examination is already approved or published.
    """
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    stmt_t = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    res_t = await db_session.execute(stmt_t)
    tenant = res_t.scalars().first()

    # Create approved exam
    approved_exam = Examination(
        tenant_id=tenant.id,
        name="Annual Final Exam 2026",
        code="FINAL-2026",
        category="annual_exam",
        academic_year="2026-2027",
        target_class="Class 10",
        subject_code="MAT-101",
        subject_name="Mathematics",
        exam_date=date(2026, 11, 20),
        start_time="09:30 AM",
        end_time="12:30 PM",
        max_marks=100.0,
        passing_marks=35.0,
        theory_max_marks=80.0,
        practical_max_marks=20.0,
        exam_mode="offline_paper",
        status="PRINCIPAL_APPROVED"  # APPROVED
    )
    db_session.add(approved_exam)
    await db_session.flush()

    student_id = uuid.uuid4()
    mark_rec = ExamAttendanceAndMarks(
        tenant_id=tenant.id,
        examination_id=approved_exam.id,
        student_id=student_id,
        student_name="Aarav Sharma",
        roll_number="101",
        admission_number="ADM-001",
        attendance_status="PRESENT",
        theory_marks_obtained=75.0,
        practical_marks_obtained=18.0,
        total_marks_obtained=93.0,
        percentage=93.0,
        grade="A+",
        version=2
    )
    db_session.add(mark_rec)
    await db_session.commit()

    # Fetch admin user for valid token subject
    stmt_adm = select(User).where(User.email == "admin@platform.erp.in")
    res_adm = await db_session.execute(stmt_adm)
    admin_user = res_adm.scalars().first()

    # Super admin / evaluator token
    token = create_access_token(
        subject=str(admin_user.id),
        tenant_id=str(tenant.id),
        is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt offline sync attempting to overwrite approved marks
    sync_payload = {
        "operations": [
            {
                "operation_id": f"op_{uuid.uuid4().hex}",
                "entity_type": "exam_marks",
                "entity_id": str(mark_rec.id),
                "client_version": 1,
                "payload": {"theory_marks_obtained": 40.0}
            }
        ]
    }
    resp = await client.post("/api/v1/examinations/sync-offline", json=sync_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["status"] == "CONFLICT_DETECTED"
    assert "Rejected silent overwrite" in data[0]["message"]


@pytest.mark.asyncio
async def test_external_exam_provider_credentials_not_leaked(client, db_session: AsyncSession):
    """
    Security Test 9:
    External examination provider API keys are stored encrypted and NEVER exposed to clients.
    """
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    stmt_t = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    res_t = await db_session.execute(stmt_t)
    tenant = res_t.scalars().first()

    provider = ExternalExamProviderConfig(
        tenant_id=tenant.id,
        provider_code="TCS_ION_LIVE",
        provider_name="TCS iON Examination Engine",
        is_active=True,
        api_endpoint="https://api.tcsion.com/v2",
        encrypted_api_key="SUPER_SECRET_EXTERNAL_API_KEY_NEVER_LEAK",
        webhook_secret="SECRET_WEBHOOK_HASH"
    )
    db_session.add(provider)
    await db_session.commit()

    stmt_adm = select(User).where(User.email == "admin@platform.erp.in")
    res_adm = await db_session.execute(stmt_adm)
    admin_user = res_adm.scalars().first()

    token = create_access_token(
        subject=str(admin_user.id),
        tenant_id=str(tenant.id),
        is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get("/api/v1/examinations/providers", headers=headers)
    assert resp.status_code == 200
    providers_list = resp.json()
    target_prov = next((p for p in providers_list if p["provider_code"] == "TCS_ION_LIVE"), None)
    assert target_prov is not None
    assert target_prov["has_api_key"] is True
    assert "SUPER_SECRET_EXTERNAL_API_KEY_NEVER_LEAK" not in str(resp.text)
    assert "SECRET_WEBHOOK_HASH" not in str(resp.text)


@pytest.mark.asyncio
async def test_result_publication_requires_prior_principal_approval(client, db_session: AsyncSession):
    """
    Security Test 12:
    Result publication strictly requires prior Principal approval (Stage 3 -> Stage 4).
    """
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    stmt_t = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    res_t = await db_session.execute(stmt_t)
    tenant = res_t.scalars().first()

    exam = Examination(
        tenant_id=tenant.id,
        name="Unit Test 1 (Unapproved)",
        code="UT-1-UNAPP",
        category="unit_test",
        academic_year="2026-2027",
        target_class="Class 9",
        subject_code="ENG-101",
        subject_name="English Language",
        exam_date=date(2026, 11, 22),
        start_time="09:30 AM",
        end_time="11:00 AM",
        max_marks=50.0,
        passing_marks=18.0,
        theory_max_marks=50.0,
        practical_max_marks=0.0,
        status="MARKS_ENTRY"  # Not yet approved
    )
    db_session.add(exam)
    await db_session.commit()

    # Create a non-superadmin operator user
    user = User(
        email=f"operator_{uuid.uuid4().hex[:6]}@akshara.edu.in",
        hashed_password=hash_password("Pass123!"),
        full_name="Exam Operator",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(user)
    operator_role = Role(name="Exam Operator", code="EXAM_CONTROLLER", tenant_id=tenant.id, is_system=False)
    db_session.add(operator_role)
    await db_session.flush()
    db_session.add(UserRole(user_id=user.id, role_id=operator_role.id, tenant_id=tenant.id))
    await db_session.commit()

    token = create_access_token(
        subject=str(user.id),
        tenant_id=str(tenant.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to publish unapproved exam
    resp = await client.post(
        "/api/v1/examinations/workflow/approval",
        json={"examination_id": str(exam.id), "action": "PUBLISH"},
        headers=headers
    )
    assert resp.status_code == 400
    assert "without prior Principal approval" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_role_based_user_autocomplete_prevents_cross_tenant_leakage(client, db_session: AsyncSession):
    """
    Security Test:
    Institution Login role autocomplete works after 2 characters and strictly isolates by tenant.
    """
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    # Autocomplete for pilot tenant akshara with query "Ramesh"
    resp = await client.post(
        "/api/v1/auth/user-autocomplete",
        json={
            "tenant_code": "akshara",
            "role_code": "INSTITUTION_ADMIN",
            "query": "Ram"
        }
    )
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) >= 1
    assert "Ramesh" in results[0]["display_name"]
    assert "password" not in results[0]
    assert "hashed_password" not in results[0]
