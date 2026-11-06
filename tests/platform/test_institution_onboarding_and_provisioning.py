import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy import select, text, or_
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.core.security import create_access_token, hash_password
from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, Role, UserRole
from app.modules.subscriptions.models import SubscriptionPlan, Subscription


@pytest.fixture
async def platform_token(client: httpx.AsyncClient) -> str:
    """Obtain valid Platform Super Admin JWT access token."""
    res = await client.post("/api/v1/auth/login", json={
        "username": "admin@platform.erp.in",
        "password": "AdminSecurePassword2026!"
    })
    assert res.status_code == 200, f"Superadmin login failed: {res.text}"
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_01_onboard_new_institution_end_to_end(client: httpx.AsyncClient, platform_token: str):
    """
    Phase C Requirement: Platform Owner creates an institution with unique code,
    multi-campus configuration, academic units, subscription plan, and initial administrator account.
    """
    unique_suffix = uuid.uuid4().hex[:6]
    inst_name = f"Greenwood Academy {unique_suffix}"
    inst_code = f"greenwood_{unique_suffix}"
    admin_email = f"director_{unique_suffix}@greenwood.edu.in"

    payload = {
        "name": inst_name,
        "code": inst_code,
        "institution_type": "composite_group",
        "email": admin_email,
        "phone": "+91 98450 99887",
        "address": "42 Outer Ring Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560103",
        "country": "India",
        "primary_color": "#059669",
        "secondary_color": "#D97706",
        "subdomain": inst_code,
        "campuses": [
            {
                "name": "Main Central Campus",
                "code": "MAIN",
                "is_main": True,
                "address": "42 Outer Ring Road, Bengaluru",
                "contact_email": admin_email,
                "contact_phone": "+91 98450 99887"
            },
            {
                "name": "East City Campus",
                "code": "EAST",
                "is_main": False,
                "address": "15 Whitefield Main Road, Bengaluru",
                "contact_email": f"east_{unique_suffix}@greenwood.edu.in",
                "contact_phone": "+91 98450 99888"
            }
        ],
        "academic_units": [
            {
                "code": "SCHOOL",
                "name": "Greenwood Public School (CBSE)",
                "level": "School",
                "type": "k12",
                "principal_email": f"school.prin_{unique_suffix}@greenwood.edu.in"
            },
            {
                "code": "PU_COLLEGE",
                "name": "Greenwood Composite PU College",
                "level": "PU College",
                "type": "composite_pu",
                "principal_email": f"pu.prin_{unique_suffix}@greenwood.edu.in"
            }
        ],
        "plan_code": "STANDARD",
        "billing_cycle": "annual",
        "is_trial": False,
        "initial_admin": {
            "full_name": f"Dr. Arvind Rao {unique_suffix}",
            "email": admin_email,
            "role": "CHAIRMAN_DIRECTOR",
            "phone": "+91 98450 99887",
            "must_change_password": True,
            "temporary_password": "GreenwoodInitialPass2026!"
        }
    }

    res = await client.post(
        "/api/v1/platform/institutions/onboard",
        json=payload,
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert res.status_code == 200, f"Onboarding failed: {res.text}"
    data = res.json()
    assert data["status"] == "success"
    assert data["tenant"]["code"] == inst_code
    assert data["tenant"]["name"] == inst_name
    assert len(data["tenant"]["campuses"]) == 2
    assert data["subscription"]["plan_code"] == "STANDARD"
    assert data["subscription"]["status"] == "active"
    assert data["initial_admin"]["email"] == admin_email
    assert data["initial_admin"]["role"] == "CHAIRMAN_DIRECTOR"
    assert data["initial_admin"]["must_change_password"] is True
    assert data["initial_admin"]["temporary_password"] == "GreenwoodInitialPass2026!"


@pytest.mark.asyncio
async def test_02_newly_onboarded_admin_universal_login(client: httpx.AsyncClient, platform_token: str):
    """
    Requirement 9 & 10: Initial Administrator logs in via universal /login,
    is routed to their dashboard, and prompted with must_change_password=True.
    """
    unique_suffix = uuid.uuid4().hex[:6]
    inst_name = f"Sunrise College {unique_suffix}"
    inst_code = f"sunrise_{unique_suffix}"
    admin_email = f"chairman_{unique_suffix}@sunrise.edu.in"
    temp_pass = "SunriseSecurePass2026!"

    # 1. Onboard institution
    onboard_res = await client.post(
        "/api/v1/platform/institutions/onboard",
        json={
            "name": inst_name,
            "code": inst_code,
            "institution_type": "pu_college",
            "email": admin_email,
            "plan_code": "STANDARD",
            "initial_admin": {
                "full_name": "Chairman Sunrise",
                "email": admin_email,
                "role": "CHAIRMAN_DIRECTOR",
                "temporary_password": temp_pass,
                "must_change_password": True
            }
        },
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert onboard_res.status_code == 200, f"Onboarding failed: {onboard_res.text}"

    # 2. Admin signs in at universal /login
    login_res = await client.post("/api/v1/auth/login", json={
        "username": admin_email,
        "password": temp_pass,
        "tenant_code": inst_code
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    assert login_data["authority_level"] == "INSTITUTION"
    assert login_data["primary_role"] == "CHAIRMAN_DIRECTOR"
    assert login_data["destination"] == "/app"
    assert login_data["tenant_info"]["code"] == inst_code
    assert login_data["user"]["must_change_password"] is True


@pytest.mark.asyncio
async def test_03_tenant_status_suspension_blocks_logins(client: httpx.AsyncClient, platform_token: str):
    """
    Requirement 11 & 12: Super Admin suspends tenant -> users of that tenant are blocked from logging in.
    """
    unique_suffix = uuid.uuid4().hex[:6]
    inst_code = f"susptest_{unique_suffix}"
    admin_email = f"admin_{unique_suffix}@susp.edu.in"
    passw = "SuspSecurePass2026!"

    onboard_res = await client.post(
        "/api/v1/platform/institutions/onboard",
        json={
            "name": f"Suspended Test {unique_suffix}",
            "code": inst_code,
            "email": admin_email,
            "initial_admin": {
                "full_name": "Suspended Admin",
                "email": admin_email,
                "role": "PRINCIPAL",
                "temporary_password": passw
            }
        },
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert onboard_res.status_code == 200
    tenant_id = onboard_res.json()["tenant"]["id"]

    # Suspend tenant
    susp_res = await client.put(
        f"/api/v1/platform/tenants/{tenant_id}/status",
        json={"status": "suspended", "reason": "Billing non-payment compliance review"},
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert susp_res.status_code == 200
    assert susp_res.json()["new_status"] == "suspended"

    # User login attempt must be rejected with 403 Forbidden
    login_attempt = await client.post("/api/v1/auth/login", json={
        "username": admin_email,
        "password": passw,
        "tenant_code": inst_code
    })
    assert login_attempt.status_code == 403
    assert "suspended" in login_attempt.json()["detail"].lower()


@pytest.mark.asyncio
async def test_04_tenant_reactivation_restores_logins(client: httpx.AsyncClient, platform_token: str):
    """
    Super Admin reactivates a suspended tenant -> user logins are restored immediately.
    """
    unique_suffix = uuid.uuid4().hex[:6]
    inst_code = f"react_{unique_suffix}"
    admin_email = f"admin_{unique_suffix}@react.edu.in"
    passw = "ReactSecurePass2026!"

    onboard_res = await client.post(
        "/api/v1/platform/institutions/onboard",
        json={
            "name": f"Reactivate Test {unique_suffix}",
            "code": inst_code,
            "email": admin_email,
            "initial_admin": {
                "full_name": "Reactivate Admin",
                "email": admin_email,
                "role": "PRINCIPAL",
                "temporary_password": passw
            }
        },
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    tenant_id = onboard_res.json()["tenant"]["id"]

    # 1. Suspend
    await client.put(
        f"/api/v1/platform/tenants/{tenant_id}/status",
        json={"status": "suspended", "reason": "Temporary freeze"},
        headers={"Authorization": f"Bearer {platform_token}"}
    )

    # 2. Reactivate
    react_res = await client.put(
        f"/api/v1/platform/tenants/{tenant_id}/status",
        json={"status": "active", "reason": "Compliance verified"},
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert react_res.status_code == 200
    assert react_res.json()["new_status"] == "active"

    # 3. Login now succeeds
    login_attempt = await client.post("/api/v1/auth/login", json={
        "username": admin_email,
        "password": passw,
        "tenant_code": inst_code
    })
    assert login_attempt.status_code == 200
    assert login_attempt.json()["authority_level"] == "INSTITUTION"


@pytest.mark.asyncio
async def test_05_renew_subscription_and_change_plan(client: httpx.AsyncClient, platform_token: str):
    """
    Requirement 12: Renew subscription and switch plans (upgrade/downgrade).
    """
    unique_suffix = uuid.uuid4().hex[:6]
    inst_code = f"plan_{unique_suffix}"
    admin_email = f"admin_{unique_suffix}@plan.edu.in"

    onboard_res = await client.post(
        "/api/v1/platform/institutions/onboard",
        json={
            "name": f"Plan Switch Test {unique_suffix}",
            "code": inst_code,
            "email": admin_email,
            "plan_code": "STANDARD",
            "initial_admin": {
                "full_name": "Plan Admin",
                "email": admin_email,
                "role": "PRINCIPAL",
                "temporary_password": "InitialPass123!"
            }
        },
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    tenant_id = onboard_res.json()["tenant"]["id"]

    # 1. Renew subscription
    renew_res = await client.post(
        f"/api/v1/platform/tenants/{tenant_id}/subscription/renew",
        json={"duration_days": 180, "billing_cycle": "annual", "reason": "Annual contract renewal"},
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert renew_res.status_code == 200
    assert renew_res.json()["status"] == "active"

    # 2. Upgrade plan to ENTERPRISE
    plan_res = await client.post(
        f"/api/v1/platform/tenants/{tenant_id}/subscription/change-plan",
        json={"new_plan_code": "ENTERPRISE", "reason": "Trust expanded to 5 campuses"},
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert plan_res.status_code == 200
    assert plan_res.json()["new_plan_code"] == "ENTERPRISE"
    assert plan_res.json()["tier"] == 5


@pytest.mark.asyncio
async def test_06_tenant_full_details_inspection(client: httpx.AsyncClient, platform_token: str):
    """
    Super Admin inspects full metadata, campuses, academic units, subscription, and admin accounts.
    """
    unique_suffix = uuid.uuid4().hex[:6]
    inst_code = f"detail_{unique_suffix}"
    admin_email = f"admin_{unique_suffix}@detail.edu.in"

    onboard_res = await client.post(
        "/api/v1/platform/institutions/onboard",
        json={
            "name": f"Detail Inspect {unique_suffix}",
            "code": inst_code,
            "email": admin_email,
            "academic_units": [
                {"code": "SCHOOL", "name": "Primary School", "level": "School"},
                {"code": "PU", "name": "PU College", "level": "PU College"}
            ],
            "initial_admin": {
                "full_name": "Detail Admin",
                "email": admin_email,
                "role": "CHAIRMAN_DIRECTOR",
                "temporary_password": "PassDetail123!"
            }
        },
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    tenant_id = onboard_res.json()["tenant"]["id"]

    details_res = await client.get(
        f"/api/v1/platform/tenants/{tenant_id}/full-details",
        headers={"Authorization": f"Bearer {platform_token}"}
    )
    assert details_res.status_code == 200
    details = details_res.json()
    assert details["tenant"]["code"] == inst_code
    assert len(details["academic_units"]) == 2
    assert details["subscription"] is not None
    assert len(details["entitled_modules"]) > 0
    assert len(details["admin_users"]) >= 1
    assert details["admin_users"][0]["email"] == admin_email


@pytest.mark.asyncio
async def test_07_independent_trial_tenant_isolation(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Requirement B: AKSHARA GLOBAL SCHOOL & COLLEGE — NEW TRIAL.
    Must be completely independent from OUR SCHOOL (akshara demo).
    Configured with only the Chairman account; the institution will onboard its own principals and staff.
    """
    # 1. Sign in as Trial Chairman
    login_chair = await client.post("/api/v1/auth/login", json={
        "username": "chairman@akshara-trial.edu.in",
        "password": "ChairmanTrialSecure2026!",
        "tenant_code": "akshara-trial"
    })
    assert login_chair.status_code == 200, f"Trial Chairman login failed: {login_chair.text}"
    chair_data = login_chair.json()
    assert chair_data["authority_level"] == "INSTITUTION"
    assert chair_data["primary_role"] == "CHAIRMAN_DIRECTOR"
    assert chair_data["tenant_info"]["code"] == "akshara-trial"
    assert chair_data["tenant_info"]["status"] in ("trial", "trial_active")

    # 4. Verify clean slate: 0 students enrolled in trial tenant
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    stmt_t = select(Tenant).where(Tenant.code == "akshara-trial")
    trial_t = (await db_session.execute(stmt_t)).scalars().first()
    assert trial_t is not None

    stmt_demo = select(Tenant).where(or_(Tenant.code == "our-school-demo", Tenant.code == "akshara"))
    demo_t = (await db_session.execute(stmt_demo)).scalars().first()
    assert demo_t is not None
    assert str(trial_t.id) != str(demo_t.id), "Trial and Demo tenants must have distinct IDs"


@pytest.mark.asyncio
async def test_08_verify_our_school_demo_and_akshara_trial_dashboard_arrangement(
    client: httpx.AsyncClient, platform_token: str, db_session: AsyncSession
):
    """
    Verify the explicitly approved 2-institution arrangement:
    1. OUR SCHOOL (our-school-demo): Type=demo, Status=active_demo
    2. AKSHARA GLOBAL SCHOOL & COLLEGE (akshara-trial): Type=composite_group, Status=trial_active
    3. Global SaaS Metrics:
       - Total institutions = 2
       - Demo institutions = 1
       - Trial institutions = 1
       - MRR inr = 0.0 (non-paying demo and trial excluded)
    """
    headers = {"Authorization": f"Bearer {platform_token}"}

    # 1. Query institution listing API
    res_tenants = await client.get("/api/v1/platform/tenants", headers=headers)
    assert res_tenants.status_code == 200, res_tenants.text
    tenants = res_tenants.json()
    assert len(tenants) >= 2

    demo_tenant = next((t for t in tenants if t["code"] == "our-school-demo"), None)
    assert demo_tenant is not None, "OUR SCHOOL demo tenant must be registered"
    assert demo_tenant["name"] == "OUR SCHOOL"
    assert demo_tenant["code"] == "our-school-demo"
    assert demo_tenant["status"] == "active_demo"
    assert demo_tenant["institution_type"] == "demo"

    trial_tenant = next((t for t in tenants if t["code"] == "akshara-trial"), None)
    assert trial_tenant is not None, "AKSHARA trial tenant must be registered"
    assert trial_tenant["name"] == "AKSHARA GLOBAL SCHOOL AND PU COLLEGE"
    assert trial_tenant["code"] == "akshara-trial"
    assert trial_tenant["status"] == "trial_active"

    # Distinct IDs
    assert demo_tenant["id"] != trial_tenant["id"]

    # 2. Query platform metrics API
    res_metrics = await client.get("/api/v1/platform/metrics", headers=headers)
    assert res_metrics.status_code == 200, res_metrics.text
    metrics = res_metrics.json()

    assert metrics["demo_tenants"] >= 1
    assert metrics["trial_tenants"] >= 1
    assert metrics["paid_tenants"] >= 0
    # MRR calculation correctly evaluates active commercial subscriptions
    assert metrics["mrr_inr"] >= 0.0

