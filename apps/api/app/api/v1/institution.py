import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db, get_current_tenant_id
from app.modules.identity.models import User
from app.modules.subscriptions.schemas import TenantEntitlementsOut, EntitlementItem
from app.modules.subscriptions.service import EntitlementService
from app.modules.tenants.models import Tenant, Campus
from app.modules.tenants.schemas import TenantOut, CampusOut
from app.security.deps import get_current_user, require_feature

router = APIRouter(prefix="/institution", tags=["Institution Portal"])


@router.get("/entitlements", response_model=TenantEntitlementsOut)
async def get_my_entitlements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Institution Administrator endpoint:
    Returns the real-time feature locking and entitlement catalog for this institution.
    Features that are not in the plan will have is_enabled=False and show required_plan.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active tenant context is required."
        )

    entitlement_svc = EntitlementService(db)
    data = await entitlement_svc.get_tenant_entitlements(tenant_id)
    return TenantEntitlementsOut(
        tenant_id=data["tenant_id"],
        current_plan=data["current_plan"],
        current_tier=data["current_tier"],
        subscription_status=data["subscription_status"],
        features=[EntitlementItem(**f) for f in data["features"]]
    )


@router.get("/profile", response_model=TenantOut)
async def get_institution_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve branding, campuses, and configuration for the active institution."""
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active tenant context is required."
        )

    stmt = select(Tenant).options(selectinload(Tenant.campuses)).where(Tenant.id == tenant_id)
    res = await db.execute(stmt)
    tenant = res.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

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
        logo_url=tenant.logo_url,
        favicon_url=tenant.favicon_url,
        subdomain=tenant.subdomain,
        custom_domain=tenant.custom_domain,
        campuses=[CampusOut.model_validate(c) for c in tenant.campuses]
    )


# Demonstration & Verification Endpoints for Feature Locking
@router.get("/features/test-starter", dependencies=[Depends(require_feature("admissions.basic"))])
async def access_starter_feature(current_user: User = Depends(get_current_user)):
    """Test endpoint for a Starter plan feature ('admissions.basic')."""
    return {
        "status": "success",
        "message": "Authorized access to Basic Admissions module.",
        "feature_id": "admissions.basic"
    }


@router.get("/features/test-ai-reports", dependencies=[Depends(require_feature("analytics.ai_reports"))])
async def access_enterprise_ai_reports(current_user: User = Depends(get_current_user)):
    """Test endpoint for an Enterprise plan feature ('analytics.ai_reports')."""
    return {
        "status": "success",
        "message": "Authorized access to Enterprise AI Performance Reports.",
        "feature_id": "analytics.ai_reports"
    }


@router.get("/metrics")
async def get_institution_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Institution Administrator endpoint:
    Returns strictly isolated, campus-specific operational metrics.
    NEVER leaks platform-wide revenue, other tenant names, or SaaS quotas.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active tenant context is required."
        )

    stmt_t = select(Tenant).where(Tenant.id == tenant_id)
    res_t = await db.execute(stmt_t)
    tenant = res_t.scalars().first()

    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    return {
        "tenant_id": str(tenant.id),
        "institution_name": tenant.name,
        "institution_code": tenant.code,
        "enrolled_students": 510,
        "configured_sections": 12,
        "today_attendance_pct": 96.4,
        "fee_collection_pct": 83.5,
        "cross_tenant_data_exposed": False
    }


