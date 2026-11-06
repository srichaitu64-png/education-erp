import uuid
from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, Role, UserRole, Permission, PlatformSupportAccessSession
from app.modules.attendance.models import DailyAttendanceRecord, InstitutionAttendanceConfig
from app.core.security import create_access_token, hash_password


@pytest.mark.asyncio
async def test_01_two_administrative_layers_strictly_separated(client, db_session: AsyncSession):
    """
    AUDIT REQUIREMENT 1: Separate the two administrative layers.
    PLATFORM LEVEL (Platform Owner, Super Admin, Developer, Support) vs
    INSTITUTION LEVEL (Chairman, Principal, Accountant, Teacher, Parent, Student).
    Institution users cannot access platform management endpoints.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant = Tenant(
        name="Cambridge International Academy",
        code=f"cambridge_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="principal@cambridge.edu",
        status="active"
    )
    db_session.add(tenant)
    await db_session.flush()

    # 1. Institution Admin User
    inst_admin = User(
        email=f"inst_admin_{uuid.uuid4().hex[:6]}@cambridge.edu",
        hashed_password=hash_password("Pass#1234"),
        full_name="Institution Administrator",
        is_active=True,
        is_superadmin=False
    )
    # 2. Platform Owner / Super Admin User
    platform_owner = User(
        email=f"owner_{uuid.uuid4().hex[:6]}@educationos.io",
        hashed_password=hash_password("Root#1234"),
        full_name="Platform Owner",
        is_active=True,
        is_superadmin=True
    )
    db_session.add_all([inst_admin, platform_owner])
    await db_session.commit()

    token_inst = create_access_token(subject=str(inst_admin.id), tenant_id=str(tenant.id), is_superadmin=False)
    token_owner = create_access_token(subject=str(platform_owner.id), is_superadmin=True)

    # Institution user attempting to access platform tenant onboarding: MUST BE 403
    resp_inst_tenants = await client.get("/api/v1/platform/tenants", headers={"Authorization": f"Bearer {token_inst}"})
    assert resp_inst_tenants.status_code == 403, "Institution admin accessed platform tenant list!"

    # Platform owner accessing platform tenant onboarding: MUST BE 200
    resp_owner_tenants = await client.get("/api/v1/platform/tenants", headers={"Authorization": f"Bearer {token_owner}"})
    assert resp_owner_tenants.status_code == 200, "Platform owner could not access platform tenant list!"


@pytest.mark.asyncio
async def test_02_platform_developer_least_privilege_and_support_consent(client, db_session: AsyncSession):
    """
    AUDIT REQUIREMENT 4: Platform Developer must not automatically receive unrestricted access
    to institutional data. Any exceptional support access must be explicitly authorized,
    tenant-scoped, time-limited, audited and revocable.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant = Tenant(
        name="Delhi Public School",
        code=f"dps_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="support@dps.edu",
        status="active"
    )
    db_session.add(tenant)
    await db_session.flush()

    platform_dev = User(
        email=f"dev_{uuid.uuid4().hex[:6]}@educationos.io",
        hashed_password=hash_password("Dev#1234"),
        full_name="Platform Developer",
        is_active=True,
        is_superadmin=False  # Developer is NOT root superadmin
    )
    platform_owner = User(
        email=f"owner_{uuid.uuid4().hex[:6]}@educationos.io",
        hashed_password=hash_password("Owner#1234"),
        full_name="Platform Owner",
        is_active=True,
        is_superadmin=True
    )
    db_session.add_all([platform_dev, platform_owner])
    await db_session.commit()

    token_dev = create_access_token(subject=str(platform_dev.id), is_superadmin=False)
    token_owner = create_access_token(subject=str(platform_owner.id), is_superadmin=True)

    # 1. Platform Developer trying to access platform-wide tenant management: MUST BE 403
    resp_dev_platform = await client.get("/api/v1/platform/tenants", headers={"Authorization": f"Bearer {token_dev}"})
    assert resp_dev_platform.status_code == 403, "Platform Developer accessed platform management without superadmin privileges!"

    # 2. Platform Developer directly trying to access tenant's institutional profile without tenant context: MUST BE 400
    resp_dev_direct = await client.get("/api/v1/institution/profile", headers={"Authorization": f"Bearer {token_dev}"})
    assert resp_dev_direct.status_code == 400, "Platform Developer accessed tenant data without tenant context!"

    # 3. Superadmin requests support access for Developer
    resp_req = await client.post(
        f"/api/v1/platform/support-sessions/request?tenant_id={tenant.id}&reason=Investigate+grade+discrepancy",
        headers={"Authorization": f"Bearer {token_owner}"}
    )
    assert resp_req.status_code == 200
    session_id = resp_req.json()["session_id"]

    # 3. Approve support session with 60-minute expiry
    resp_app = await client.post(
        f"/api/v1/platform/support-sessions/{session_id}/approve",
        headers={"Authorization": f"Bearer {token_owner}"}
    )
    assert resp_app.status_code == 200
    assert "APPROVED" in resp_app.json()["message"]

    # 4. Revoke support session
    resp_rev = await client.post(
        f"/api/v1/platform/support-sessions/{session_id}/revoke",
        headers={"Authorization": f"Bearer {token_owner}"}
    )
    assert resp_rev.status_code == 200
    assert "REVOKED" in resp_rev.json()["message"]


@pytest.mark.asyncio
async def test_03_institution_admin_cannot_promote_to_platform_owner(client, db_session: AsyncSession):
    """
    AUDIT REQUIREMENT 4: Do not allow an institution administrator to create or promote
    themselves or others to Platform Owner / Super Admin.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant = Tenant(name="Loyola College", code=f"loyola_{uuid.uuid4().hex[:6]}", institution_type="degree_college", email="admin@loyola.edu", status="active")
    db_session.add(tenant)
    await db_session.flush()

    inst_user = User(
        email=f"inst_{uuid.uuid4().hex[:6]}@loyola.edu",
        hashed_password=hash_password("Pass#1234"),
        full_name="Institution User",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(inst_user)
    await db_session.commit()

    token_inst = create_access_token(subject=str(inst_user.id), tenant_id=str(tenant.id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token_inst}"}

    # Attempt to assign Super Admin permission or invoke permission matrix API
    resp_matrix = await client.get("/api/v1/platform/permissions/matrix", headers=headers)
    assert resp_matrix.status_code == 403, "Institution user accessed platform permissions matrix!"

    resp_assign = await client.post("/api/v1/platform/permissions/users/assign", headers=headers, json={
        "user_id": str(inst_user.id),
        "target_tenant_id": str(tenant.id),
        "role_codes": ["SUPER_ADMIN"]
    })
    assert resp_assign.status_code == 403, "Institution user promoted account to SUPER_ADMIN!"


@pytest.mark.asyncio
async def test_04_tenant_data_isolation_multi_tenant(client, db_session: AsyncSession):
    """
    AUDIT REQUIREMENT 3: Tenant isolation across students, attendance, and institution profiles.
    Tenant A can never see Tenant B's data under any circumstance.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant_1 = Tenant(name="National Public School", code=f"nps_{uuid.uuid4().hex[:6]}", institution_type="school", email="info@nps.edu", status="active")
    tenant_2 = Tenant(name="Bishop Cotton Boys School", code=f"cottons_{uuid.uuid4().hex[:6]}", institution_type="school", email="info@cottons.edu", status="active")
    db_session.add_all([tenant_1, tenant_2])
    await db_session.flush()

    user_1 = User(email=f"admin_{uuid.uuid4().hex[:6]}@nps.edu", hashed_password=hash_password("Pass#1234"), full_name="NPS Admin", is_active=True, is_superadmin=False)
    user_2 = User(email=f"admin_{uuid.uuid4().hex[:6]}@cottons.edu", hashed_password=hash_password("Pass#1234"), full_name="Cottons Admin", is_active=True, is_superadmin=False)
    db_session.add_all([user_1, user_2])
    role_1 = Role(name="Tenant A Administrator", code="INSTITUTION_ADMIN", tenant_id=tenant_1.id, is_system=False)
    role_2 = Role(name="Tenant B Administrator", code="INSTITUTION_ADMIN", tenant_id=tenant_2.id, is_system=False)
    db_session.add_all([role_1, role_2])
    await db_session.flush()
    db_session.add_all([
        UserRole(user_id=user_1.id, role_id=role_1.id, tenant_id=tenant_1.id),
        UserRole(user_id=user_2.id, role_id=role_2.id, tenant_id=tenant_2.id),
    ])
    await db_session.commit()

    token_1 = create_access_token(subject=str(user_1.id), tenant_id=str(tenant_1.id), is_superadmin=False)
    token_2 = create_access_token(subject=str(user_2.id), tenant_id=str(tenant_2.id), is_superadmin=False)

    # 1. Profile isolation
    resp_1 = await client.get("/api/v1/institution/profile", headers={"Authorization": f"Bearer {token_1}"})
    resp_2 = await client.get("/api/v1/institution/profile", headers={"Authorization": f"Bearer {token_2}"})
    assert resp_1.status_code == 200
    assert resp_2.status_code == 200
    assert resp_1.json()["name"] == "National Public School"
    assert resp_2.json()["name"] == "Bishop Cotton Boys School"
    assert resp_1.json()["id"] != resp_2.json()["id"]

    # 2. Attendance config isolation
    # Update Tenant 1 to DAILY_ONLY
    await client.put("/api/v1/attendance/config", headers={"Authorization": f"Bearer {token_1}"}, json={"attendance_mode": "DAILY_ONLY"})
    # Update Tenant 2 to PERIOD_WISE_ONLY
    await client.put("/api/v1/attendance/config", headers={"Authorization": f"Bearer {token_2}"}, json={"attendance_mode": "PERIOD_WISE_ONLY"})

    # Verify Tenant 1 config is DAILY_ONLY and has NOT overwritten Tenant 2
    cfg_1 = (await client.get("/api/v1/attendance/config", headers={"Authorization": f"Bearer {token_1}"})).json()
    cfg_2 = (await client.get("/api/v1/attendance/config", headers={"Authorization": f"Bearer {token_2}"})).json()
    assert cfg_1["attendance_mode"] == "DAILY_ONLY"
    assert cfg_2["attendance_mode"] == "PERIOD_WISE_ONLY"


@pytest.mark.asyncio
async def test_05_platform_metrics_revenue_not_leaked_to_institutions(client, db_session: AsyncSession):
    """
    AUDIT REQUIREMENT 2 & 6: Platform Owner gets SaaS MRR/ARR analytics;
    Institution users only see institution-level student/fee metrics.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant = Tenant(name="Oxford College of Science", code=f"oxford_{uuid.uuid4().hex[:6]}", institution_type="degree_college", email="info@oxford.edu", status="active")
    db_session.add(tenant)
    await db_session.flush()

    user = User(email=f"principal_{uuid.uuid4().hex[:6]}@oxford.edu", hashed_password=hash_password("Pass#1234"), full_name="Principal Oxford", is_active=True, is_superadmin=False)
    owner = User(email=f"owner_{uuid.uuid4().hex[:6]}@educationos.io", hashed_password=hash_password("Owner#1234"), full_name="Platform Owner", is_active=True, is_superadmin=True)
    db_session.add_all([user, owner])
    tenant_role = Role(name="Institution Principal", code="PRINCIPAL", tenant_id=tenant.id, is_system=False)
    db_session.add(tenant_role)
    await db_session.flush()
    db_session.add(UserRole(user_id=user.id, role_id=tenant_role.id, tenant_id=tenant.id))
    await db_session.commit()

    token_user = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=False)
    token_owner = create_access_token(subject=str(owner.id), is_superadmin=True)

    # 1. Platform Owner gets platform metrics
    resp_owner = await client.get("/api/v1/platform/metrics", headers={"Authorization": f"Bearer {token_owner}"})
    assert resp_owner.status_code == 200
    data_owner = resp_owner.json()
    assert "total_tenants" in data_owner
    assert "mrr_inr" in data_owner

    # 2. Institution user gets 403 on platform metrics
    resp_user = await client.get("/api/v1/platform/metrics", headers={"Authorization": f"Bearer {token_user}"})
    assert resp_user.status_code == 403

    # 3. Institution user gets their own metrics without platform MRR
    resp_inst = await client.get("/api/v1/institution/metrics", headers={"Authorization": f"Bearer {token_user}"})
    assert resp_inst.status_code == 200
    data_inst = resp_inst.json()
    assert "mrr_inr" not in data_inst
    assert "total_tenants" not in data_inst
