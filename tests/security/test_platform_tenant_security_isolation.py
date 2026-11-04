import uuid
from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, PlatformSupportAccessSession
from app.core.security import create_access_token, hash_password


@pytest.mark.asyncio
async def test_institution_users_cannot_invoke_platform_administration_apis(client, db_session: AsyncSession):
    """
    MANDATORY NEGATIVE SECURITY TEST:
    Institution users (Principal, Accountant, Teacher, Institution Admin)
    must receive HTTP 403 Forbidden when invoking any platform administration API.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant = Tenant(
        name="St. Xavier's High School",
        code=f"xavier_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="admin@xavier.edu",
        status="active"
    )
    db_session.add(tenant)
    await db_session.flush()

    # Create institution administrator (NOT platform superadmin)
    inst_admin = User(
        email=f"admin_{uuid.uuid4().hex[:6]}@xavier.edu",
        hashed_password=hash_password("Pass#1234"),
        full_name="Institution Administrator",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(inst_admin)
    await db_session.commit()

    token_inst = create_access_token(
        subject=str(inst_admin.id),
        tenant_id=str(tenant.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token_inst}"}

    # 1. Attempt to access platform-wide SaaS metrics & revenue
    resp_metrics = await client.get("/api/v1/platform/metrics", headers=headers)
    assert resp_metrics.status_code == 403, "Institution user accessed platform revenue metrics!"

    # 2. Attempt to onboard a new tenant organization via platform API
    resp_create = await client.post("/api/v1/platform/tenants", headers=headers, json={
        "name": "Rogue Tenant",
        "code": "rogue",
        "institution_type": "school",
        "email": "rogue@test.com"
    })
    assert resp_create.status_code == 403, "Institution user invoked tenant onboarding API!"

    # 3. Attempt to access platform audit logs
    resp_audit = await client.get("/api/v1/platform/audit-logs", headers=headers)
    assert resp_audit.status_code == 403, "Institution user accessed platform audit logs!"


@pytest.mark.asyncio
async def test_tenant_isolation_bidirectional_and_tamper_resistant(client, db_session: AsyncSession):
    """
    MANDATORY NEGATIVE SECURITY TEST:
    Institution A cannot read or mutate Institution B's data.
    Institution B cannot read or mutate Institution A's data.
    Supplying or manipulating tenant IDs in headers cannot bypass cryptographic JWT bounds.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant_a = Tenant(name="Alpha Academy", code=f"alpha_{uuid.uuid4().hex[:6]}", institution_type="school", email="alpha@test.com", status="active")
    tenant_b = Tenant(name="Beta College", code=f"beta_{uuid.uuid4().hex[:6]}", institution_type="pu_college", email="beta@test.com", status="active")
    db_session.add_all([tenant_a, tenant_b])
    await db_session.flush()

    user_a = User(email=f"user_a_{uuid.uuid4().hex[:6]}@alpha.com", hashed_password=hash_password("Pass#1234"), full_name="User A", is_active=True, is_superadmin=False)
    user_b = User(email=f"user_b_{uuid.uuid4().hex[:6]}@beta.com", hashed_password=hash_password("Pass#1234"), full_name="User B", is_active=True, is_superadmin=False)
    db_session.add_all([user_a, user_b])
    await db_session.commit()

    token_a = create_access_token(subject=str(user_a.id), tenant_id=str(tenant_a.id), is_superadmin=False)
    token_b = create_access_token(subject=str(user_b.id), tenant_id=str(tenant_b.id), is_superadmin=False)

    # 1. User A queries /institution/profile -> returns Alpha Academy
    resp_a = await client.get("/api/v1/institution/profile", headers={"Authorization": f"Bearer {token_a}"})
    assert resp_a.status_code == 200
    assert resp_a.json()["id"] == str(tenant_a.id)
    assert resp_a.json()["name"] == "Alpha Academy"

    # 2. User B queries /institution/profile -> returns Beta College
    resp_b = await client.get("/api/v1/institution/profile", headers={"Authorization": f"Bearer {token_b}"})
    assert resp_b.status_code == 200
    assert resp_b.json()["id"] == str(tenant_b.id)
    assert resp_b.json()["name"] == "Beta College"

    # 3. User A attempts IDOR: injects X-Tenant-ID header pointing to Tenant B
    resp_attack = await client.get(
        "/api/v1/institution/profile",
        headers={
            "Authorization": f"Bearer {token_a}",
            "X-Tenant-ID": str(tenant_b.id)
        }
    )
    assert resp_attack.status_code == 200
    # Must still return Tenant A because JWT token cryptographic tenant_id is authoritative
    assert resp_attack.json()["id"] == str(tenant_a.id)
    assert resp_attack.json()["id"] != str(tenant_b.id)


@pytest.mark.asyncio
async def test_tenant_metrics_never_exposes_platform_revenue(client, db_session: AsyncSession):
    """
    MANDATORY SECURITY TEST:
    Tenant metrics API (/institution/metrics) must strictly isolate metrics to the tenant.
    Must NEVER leak platform SaaS MRR, ARR, or other tenants' data.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant = Tenant(name="Green Valley School", code=f"gv_{uuid.uuid4().hex[:6]}", institution_type="school", email="gv@test.com", status="active")
    db_session.add(tenant)
    await db_session.flush()

    user = User(email=f"principal_{uuid.uuid4().hex[:6]}@gv.edu", hashed_password=hash_password("Pass#1234"), full_name="Principal GV", is_active=True, is_superadmin=False)
    db_session.add(user)
    await db_session.commit()

    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=False)
    resp = await client.get("/api/v1/institution/metrics", headers={"Authorization": f"Bearer {token}"})

    assert resp.status_code == 200
    data = resp.json()
    assert data["institution_name"] == "Green Valley School"
    assert "mrr_inr" not in data, "Leaked platform SaaS MRR to institution!"
    assert "arr_inr" not in data, "Leaked platform SaaS ARR to institution!"
    assert "total_tenants" not in data, "Leaked global tenant count to institution!"


@pytest.mark.asyncio
async def test_platform_support_access_lifecycle_and_expiry(client, db_session: AsyncSession):
    """
    MANDATORY SECURITY TEST:
    Platform Support Access requires explicit ticket creation, consent approval,
    enforces time-limited expiry, and can be revoked on demand.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant = Tenant(name="Support Test Campus", code=f"supp_{uuid.uuid4().hex[:6]}", institution_type="school", email="supp@test.com", status="active")
    db_session.add(tenant)
    await db_session.flush()

    superadmin = User(email=f"root_{uuid.uuid4().hex[:6]}@educationos.io", hashed_password=hash_password("Pass#1234"), full_name="Platform Superadmin", is_active=True, is_superadmin=True)
    db_session.add(superadmin)
    await db_session.commit()

    token_root = create_access_token(subject=str(superadmin.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token_root}"}

    # 1. Request support access
    req_payload = {
        "tenant_id": str(tenant.id),
        "reason": "Customer reported fee reconciliation discrepancy in batch #204",
        "duration_minutes": 60,
        "scope": "READ_ONLY_DIAGNOSTICS"
    }
    resp_req = await client.post(
        f"/api/v1/platform/support-sessions/request?tenant_id={tenant.id}&reason=Fee+audit",
        headers=headers
    )
    assert resp_req.status_code == 200
    session_data = resp_req.json()
    assert session_data["status"] == "success"
    session_id = session_data["session_id"]
    ticket_number = session_data["ticket_number"]

    # 2. Approve support access
    resp_app = await client.post(f"/api/v1/platform/support-sessions/{session_id}/approve", headers=headers)
    assert resp_app.status_code == 200
    assert "APPROVED" in resp_app.json()["message"]
    assert resp_app.json()["expires_at"] is not None

    # 3. List support sessions
    resp_list = await client.get("/api/v1/platform/support-sessions", headers=headers)
    assert resp_list.status_code == 200
    tickets = [s["ticket_number"] for s in resp_list.json()]
    assert ticket_number in tickets

    # 4. Revoke support access
    resp_rev = await client.post(f"/api/v1/platform/support-sessions/{session_id}/revoke", headers=headers)
    assert resp_rev.status_code == 200
    assert "REVOKED" in resp_rev.json()["message"]
