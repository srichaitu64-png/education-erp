import uuid
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.modules.identity.models import User
from app.modules.subscriptions.models import (
    SubscriptionPlan,
    FeatureCatalog,
    PlanFeature,
    Subscription,
    TenantFeatureOverride
)
from app.modules.subscriptions.schemas import (
    SubscriptionPlanCreate,
    SubscriptionPlanOut,
    FeatureCatalogOut,
    FeatureOverrideRequest,
    FeatureOverrideRevokeRequest
)
from app.modules.subscriptions.service import EntitlementService
from app.modules.tenants.models import Tenant, Campus
from app.modules.tenants.schemas import TenantCreate, TenantOut, CampusOut
from app.security.deps import get_current_superadmin

router = APIRouter(prefix="/platform", tags=["Platform Super Admin"])


@router.post("/tenants", response_model=TenantOut)
async def create_tenant(
    req: TenantCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin endpoint to register and onboard an institution tenant.
    Creates default campus and assigns initial subscription plan.
    """
    # Check for code duplication
    stmt = select(Tenant).where(Tenant.code == req.code.lower().strip())
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Institution with code '{req.code}' already exists."
        )

    tenant = Tenant(
        name=req.name,
        code=req.code.lower().strip(),
        institution_type=req.institution_type,
        email=req.email,
        phone=req.phone,
        address=req.address,
        city=req.city,
        state=req.state,
        postal_code=req.postal_code,
        country=req.country,
        primary_color=req.primary_color,
        secondary_color=req.secondary_color,
        subdomain=req.subdomain or req.code.lower().strip(),
        custom_domain=req.custom_domain,
        status="active"
    )
    db.add(tenant)
    await db.flush()

    # Create default Main Campus
    main_campus = Campus(
        tenant_id=tenant.id,
        name=f"{tenant.name} - Main Campus",
        code="MAIN",
        is_main=True,
        address=tenant.address,
        contact_email=tenant.email,
        contact_phone=tenant.phone
    )
    db.add(main_campus)

    # Assign Initial Subscription Plan
    plan_code = req.initial_plan_code or "TRIAL"
    stmt_plan = select(SubscriptionPlan).where(SubscriptionPlan.code == plan_code)
    res_plan = await db.execute(stmt_plan)
    plan = res_plan.scalars().first()

    if not plan:
        # Fallback to Starter or create default starter if not seeded
        stmt_plan = select(SubscriptionPlan).order_by(SubscriptionPlan.tier.asc())
        res_plan = await db.execute(stmt_plan)
        plan = res_plan.scalars().first()

    if plan:
        now = datetime.now(timezone.utc)
        sub = Subscription(
            tenant_id=tenant.id,
            plan_id=plan.id,
            status="trial" if plan.tier == 0 else "active",
            billing_cycle="annual",
            starts_at=now,
            ends_at=now + timedelta(days=365 if plan.tier > 0 else 30),
            trial_ends_at=now + timedelta(days=30) if plan.tier == 0 else None
        )
        db.add(sub)

    await db.commit()
    await db.refresh(tenant)

    # Load campuses for output
    stmt_campuses = select(Campus).where(Campus.tenant_id == tenant.id)
    res_campuses = await db.execute(stmt_campuses)
    campuses = res_campuses.scalars().all()

    return TenantOut(
        id=tenant.id,
        name=tenant.name,
        code=tenant.code,
        institution_type=tenant.institution_type,
        status=tenant.status,
        email=tenant.email,
        phone=tenant.phone,
        address=tenant.address,
        city=tenant.city,
        state=tenant.state,
        postal_code=tenant.postal_code,
        country=tenant.country,
        primary_color=tenant.primary_color,
        secondary_color=tenant.secondary_color,
        subdomain=tenant.subdomain,
        custom_domain=tenant.custom_domain,
        campuses=[CampusOut.model_validate(c) for c in campuses]
    )


@router.get("/tenants", response_model=List[TenantOut])
async def list_tenants(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Super Admin: List all registered institutions."""
    stmt = select(Tenant).options(selectinload(Tenant.campuses)).order_by(Tenant.created_at.desc())
    res = await db.execute(stmt)
    tenants = res.scalars().all()

    out = []
    for t in tenants:
        out.append(
            TenantOut(
                id=t.id,
                name=t.name,
                code=t.code,
                institution_type=t.institution_type,
                status=t.status,
                email=t.email,
                phone=t.phone,
                address=t.address,
                city=t.city,
                state=t.state,
                postal_code=t.postal_code,
                country=t.country,
                primary_color=t.primary_color,
                secondary_color=t.secondary_color,
                subdomain=t.subdomain,
                custom_domain=t.custom_domain,
                campuses=[CampusOut.model_validate(c) for c in t.campuses]
            )
        )
    return out


@router.get("/features", response_model=List[FeatureCatalogOut])
async def list_features(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Super Admin: List all platform features in catalog."""
    stmt = select(FeatureCatalog).order_by(FeatureCatalog.module, FeatureCatalog.min_plan_tier)
    res = await db.execute(stmt)
    features = res.scalars().all()
    return [FeatureCatalogOut.model_validate(f) for f in features]


@router.get("/plans", response_model=List[SubscriptionPlanOut])
async def list_plans(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Super Admin: List all subscription plans with included features."""
    stmt = select(SubscriptionPlan).options(selectinload(SubscriptionPlan.features)).order_by(SubscriptionPlan.tier.asc())
    res = await db.execute(stmt)
    plans = res.scalars().all()

    out = []
    for p in plans:
        out.append(
            SubscriptionPlanOut(
                id=p.id,
                code=p.code,
                name=p.name,
                tier=p.tier,
                description=p.description,
                price_monthly_inr=float(p.price_monthly_inr),
                price_annual_inr=float(p.price_annual_inr),
                max_students=p.max_students,
                max_staff=p.max_staff,
                max_campuses=p.max_campuses,
                max_storage_mb=p.max_storage_mb,
                is_active=p.is_active,
                is_custom=p.is_custom,
                included_features=[pf.feature_id for pf in p.features if pf.is_included]
            )
        )
    return out


@router.post("/entitlements/override")
async def apply_feature_override(
    req: FeatureOverrideRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin: Unlock or Lock a specific feature for a single institution
    without altering the global plan. Supports ALLOW and DENY overrides.
    """
    entitlement_svc = EntitlementService(db)
    override = await entitlement_svc.apply_feature_override(
        tenant_id=req.tenant_id,
        feature_id=req.feature_id,
        override_status=req.override_status.upper(),
        reason=req.reason,
        expires_at=req.expires_at,
        performed_by=admin.id
    )
    return {
        "status": "success",
        "message": f"Feature '{req.feature_id}' override '{req.override_status}' applied successfully.",
        "override_id": str(override.id),
        "expires_at": override.expires_at.isoformat() if override.expires_at else None
    }


@router.post("/entitlements/revoke")
async def revoke_feature_override(
    req: FeatureOverrideRevokeRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Super Admin: Revoke an institution feature override."""
    entitlement_svc = EntitlementService(db)
    success = await entitlement_svc.revoke_feature_override(
        tenant_id=req.tenant_id,
        feature_id=req.feature_id,
        performed_by=admin.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active override found for this tenant and feature."
        )
    return {"status": "success", "message": f"Feature '{req.feature_id}' override revoked."}
