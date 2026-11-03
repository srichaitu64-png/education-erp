import uuid
from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.modules.identity.models import User
from app.modules.tenants.models import Tenant
from app.modules.subscriptions.models import Subscription, SubscriptionPlan, TenantFeatureOverride
from app.modules.subscriptions.service import EntitlementService


@pytest.mark.asyncio
async def test_feature_locking_engine_enforcement(client, db_session: AsyncSession):
    """
    MANDATORY SUBSCRIPTION TEST:
    Verify that an institution on a Starter Plan gets FEATURE_LOCKED (HTTP 403)
    when attempting to call an Enterprise feature ('analytics.ai_reports').
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    # 1. Fetch Starter Plan
    stmt = select(SubscriptionPlan).where(SubscriptionPlan.code == "STARTER")
    res = await db_session.execute(stmt)
    starter_plan = res.scalars().first()

    # 2. Create Tenant on Starter Plan
    tenant = Tenant(
        name="Small Primary School",
        code=f"small_school_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="admin@smallschool.edu",
        status="active"
    )
    db_session.add(tenant)
    await db_session.flush()

    user = User(
        email=f"principal_{uuid.uuid4().hex[:6]}@smallschool.edu",
        hashed_password=hash_password("Pass#1234"),
        full_name="Small School Principal",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(user)

    now = datetime.now(timezone.utc)
    sub = Subscription(
        tenant_id=tenant.id,
        plan_id=starter_plan.id,
        status="active",
        billing_cycle="annual",
        starts_at=now,
        ends_at=now + timedelta(days=365)
    )
    db_session.add(sub)
    await db_session.commit()

    token = create_access_token(
        subject=str(user.id),
        tenant_id=str(tenant.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Call Starter feature ('admissions.basic') -> MUST SUCCEED (HTTP 200)
    resp_starter = await client.get("/api/v1/institution/features/test-starter", headers=headers)
    assert resp_starter.status_code == 200
    assert resp_starter.json()["status"] == "success"

    # 4. Call Enterprise feature ('analytics.ai_reports') -> MUST BE LOCKED (HTTP 403)
    resp_locked = await client.get("/api/v1/institution/features/test-ai-reports", headers=headers)
    assert resp_locked.status_code == 403
    err = resp_locked.json()["detail"]
    assert err["error_code"] == "FEATURE_LOCKED"
    assert err["feature_id"] == "analytics.ai_reports"
    assert err["required_plan"] == "Enterprise"
    assert err["current_plan"] == "Starter Plan"
    assert "upgrade_url" in err


@pytest.mark.asyncio
async def test_institution_specific_feature_override(client, db_session: AsyncSession):
    """
    Verify Super Admin institution-specific override:
    Unlocks an Enterprise feature for a Starter institution without changing its global plan.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    stmt = select(SubscriptionPlan).where(SubscriptionPlan.code == "STARTER")
    res = await db_session.execute(stmt)
    starter_plan = res.scalars().first()

    tenant = Tenant(
        name="Pilot School",
        code=f"pilot_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="director@pilotschool.edu",
        status="active"
    )
    db_session.add(tenant)
    await db_session.flush()

    user = User(
        email=f"director_{uuid.uuid4().hex[:6]}@pilotschool.edu",
        hashed_password=hash_password("Pass#1234"),
        full_name="Director Pilot",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(user)

    now = datetime.now(timezone.utc)
    sub = Subscription(
        tenant_id=tenant.id,
        plan_id=starter_plan.id,
        status="active",
        billing_cycle="annual",
        starts_at=now,
        ends_at=now + timedelta(days=365)
    )
    db_session.add(sub)
    await db_session.commit()

    token = create_access_token(
        subject=str(user.id),
        tenant_id=str(tenant.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Enterprise feature is locked initially
    r_initial = await client.get("/api/v1/institution/features/test-ai-reports", headers=headers)
    assert r_initial.status_code == 403

    # Super Admin applies an ALLOW override for 30 days
    entitlement_svc = EntitlementService(db_session)
    await entitlement_svc.apply_feature_override(
        tenant_id=tenant.id,
        feature_id="analytics.ai_reports",
        override_status="ALLOW",
        reason="Special 30-Day Pilot Evaluation",
        expires_at=now + timedelta(days=30)
    )

    # Calling Enterprise feature NOW -> MUST SUCCEED (HTTP 200)
    r_override = await client.get("/api/v1/institution/features/test-ai-reports", headers=headers)
    assert r_override.status_code == 200
    assert r_override.json()["status"] == "success"

    # Revoke override
    await entitlement_svc.revoke_feature_override(tenant_id=tenant.id, feature_id="analytics.ai_reports")

    # Feature is locked again
    r_revoked = await client.get("/api/v1/institution/features/test-ai-reports", headers=headers)
    assert r_revoked.status_code == 403


@pytest.mark.asyncio
async def test_deny_override_precedence(db_session: AsyncSession):
    """
    Verify that an explicit DENY override takes precedence over an ordinary plan entitlement.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    stmt = select(SubscriptionPlan).where(SubscriptionPlan.code == "ENTERPRISE")
    res = await db_session.execute(stmt)
    enterprise_plan = res.scalars().first()

    tenant = Tenant(
        name="Enterprise Academy",
        code=f"ent_{uuid.uuid4().hex[:6]}",
        institution_type="degree_college",
        email="contact@enterprise.edu",
        status="active"
    )
    db_session.add(tenant)
    await db_session.flush()

    now = datetime.now(timezone.utc)
    sub = Subscription(
        tenant_id=tenant.id,
        plan_id=enterprise_plan.id,
        status="active",
        billing_cycle="annual",
        starts_at=now,
        ends_at=now + timedelta(days=365)
    )
    db_session.add(sub)
    await db_session.commit()

    entitlement_svc = EntitlementService(db_session)

    # In Enterprise plan, 'analytics.ai_reports' is enabled by default
    assert await entitlement_svc.is_feature_enabled(tenant.id, "analytics.ai_reports") is True

    # Apply explicit DENY override due to policy restriction
    await entitlement_svc.apply_feature_override(
        tenant_id=tenant.id,
        feature_id="analytics.ai_reports",
        override_status="DENY",
        reason="Administrative investigation pending",
        expires_at=None
    )

    # DENY must take absolute precedence over the Enterprise subscription!
    access = await entitlement_svc.check_feature_access(tenant.id, "analytics.ai_reports")
    assert access.is_enabled is False
    assert access.override_status == "DENY"
    assert "Administrative investigation pending" in access.lock_reason
