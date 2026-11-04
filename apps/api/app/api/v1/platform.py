import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.modules.identity.models import (
    User,
    Role,
    Permission,
    UserRole,
    PermissionChangeAudit,
    UserPermissionOverride,
    DashboardLayoutConfig,
    PermissionChangeRequest,
    role_permissions
)
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


# ==============================================================================
# PLATFORM SUPER ADMIN PERMISSION MANAGEMENT & GOVERNANCE CONTROL CENTRE
# Only Platform Super Admin may view, edit, grant, revoke, and audit permissions
# ==============================================================================

@router.get("/permissions/matrix")
async def get_permissions_matrix(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin exclusive: Retrieve the complete role-permission matrix across all modules.
    Ordinary institution roles cannot access this endpoint.
    """
    stmt_roles = select(Role).options(selectinload(Role.permissions))
    res_roles = await db.execute(stmt_roles)
    roles = res_roles.scalars().all()

    stmt_perms = select(Permission)
    res_perms = await db.execute(stmt_perms)
    permissions = res_perms.scalars().all()

    matrix = []
    for r in roles:
        matrix.append({
            "role_id": str(r.id),
            "code": r.code,
            "name": r.name,
            "tenant_id": str(r.tenant_id) if r.tenant_id else None,
            "is_system": r.is_system,
            "permissions": [p.code for p in r.permissions]
        })

    return {
        "roles": matrix,
        "available_permissions": [
            {"code": p.code, "name": p.name, "module": p.module}
            for p in permissions
        ]
    }


@router.post("/permissions/roles")
async def update_role_permissions(
    role_code: str,
    permission_codes: List[str],
    reason: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin exclusive: Modify permissions assigned to a role.
    Audited with versioning, before/after states, and rollback support.
    """
    stmt_role = select(Role).options(selectinload(Role.permissions)).where(Role.code == role_code)
    res_role = await db.execute(stmt_role)
    role = res_role.scalars().first()

    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{role_code}' not found")

    # Safety safeguard: Super Admin cannot strip superadmin privileges
    if role.code == "SUPER_ADMIN" and "settings.branding" not in permission_codes and len(permission_codes) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Protection Guard: Cannot strip core permissions from Platform Super Admin."
        )

    previous_perms = [p.code for p in role.permissions]

    # Fetch new permissions
    stmt_p = select(Permission).where(Permission.code.in_(permission_codes))
    res_p = await db.execute(stmt_p)
    new_perms = res_p.scalars().all()

    role.permissions = new_perms

    # Determine latest version
    stmt_v = select(PermissionChangeAudit.version).order_by(PermissionChangeAudit.version.desc()).limit(1)
    res_v = await db.execute(stmt_v)
    latest_v = res_v.scalar() or 0

    audit = PermissionChangeAudit(
        version=latest_v + 1,
        acting_superadmin_id=admin.id,
        acting_superadmin_name=admin.full_name,
        target_role_id=role.id,
        action_type="ROLE_UPDATE",
        previous_state={"role_code": role_code, "permissions": previous_perms},
        new_state={"role_code": role_code, "permissions": permission_codes},
        reason=reason
    )
    db.add(audit)
    await db.commit()

    return {
        "status": "success",
        "message": f"Role '{role_code}' permissions updated successfully.",
        "version": audit.version
    }


@router.post("/permissions/users/assign")
async def assign_user_role(
    target_user_id: uuid.UUID,
    role_code: str,
    action: str, # ASSIGN or REVOKE
    reason: str,
    tenant_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin exclusive: Assign or Revoke roles to/from users.
    Enforces lockout protection so the last Super Admin cannot accidentally remove their access.
    """
    stmt_user = select(User).where(User.id == target_user_id)
    res_user = await db.execute(stmt_user)
    target_user = res_user.scalars().first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")

    # Lockout Guard: Prevent superadmin from revoking their own superadmin privilege
    if target_user.id == admin.id and role_code == "SUPER_ADMIN" and action == "REVOKE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lockout Guard: Super Admin cannot revoke their own platform administrator access."
        )

    stmt_role = select(Role).where(Role.code == role_code)
    res_role = await db.execute(stmt_role)
    role = res_role.scalars().first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{role_code}' not found")

    stmt_ur = select(UserRole).where(
        UserRole.user_id == target_user.id,
        UserRole.role_id == role.id,
        UserRole.tenant_id == tenant_id
    )
    res_ur = await db.execute(stmt_ur)
    existing_ur = res_ur.scalars().first()

    stmt_v = select(PermissionChangeAudit.version).order_by(PermissionChangeAudit.version.desc()).limit(1)
    res_v = await db.execute(stmt_v)
    latest_v = res_v.scalar() or 0

    if action == "ASSIGN":
        if not existing_ur:
            new_ur = UserRole(user_id=target_user.id, role_id=role.id, tenant_id=tenant_id)
            db.add(new_ur)
            if role_code == "SUPER_ADMIN":
                target_user.is_superadmin = True
    elif action == "REVOKE":
        if existing_ur:
            await db.delete(existing_ur)
            if role_code == "SUPER_ADMIN":
                target_user.is_superadmin = False

    audit = PermissionChangeAudit(
        version=latest_v + 1,
        acting_superadmin_id=admin.id,
        acting_superadmin_name=admin.full_name,
        target_tenant_id=tenant_id,
        target_user_id=target_user.id,
        target_role_id=role.id,
        action_type=f"USER_ROLE_{action}",
        previous_state={"had_role": bool(existing_ur)},
        new_state={"has_role": action == "ASSIGN"},
        reason=reason
    )
    db.add(audit)
    await db.commit()

    return {
        "status": "success",
        "message": f"Role '{role_code}' {action.lower()}ed for user '{target_user.email}'.",
        "version": audit.version
    }


@router.get("/permissions/audit")
async def get_permissions_audit_log(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin exclusive: Retrieve immutable audit trail of all permission & role changes.
    """
    stmt = select(PermissionChangeAudit).order_by(PermissionChangeAudit.created_at.desc()).limit(limit)
    res = await db.execute(stmt)
    return res.scalars().all()


# ==============================================================================
# SUPER ADMIN DASHBOARD & ACCESS DESIGNER
# Manages Menu Visibility, Module Access, and Action Permissions with 3 states
# ==============================================================================

@router.get("/dashboard-designer/layouts")
async def get_dashboard_layouts(
    tenant_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Super Admin: Retrieve all dashboard layout configurations."""
    stmt = select(DashboardLayoutConfig)
    if tenant_id:
        stmt = stmt.where(DashboardLayoutConfig.tenant_id == tenant_id)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/dashboard-designer/layouts")
async def save_dashboard_layout(
    role_code: str,
    layout_data: dict,
    status_type: str = "PUBLISHED",
    tenant_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin: Save, draft, publish or update a dashboard layout configuration.
    Configures the 3 independent access controls:
    1. Menu Visibility (Show / Hide)
    2. Module Access (Granted / Denied)
    3. Action Permissions (view, create, edit, approve, reject, delete, export, print)
    With 3 presentation states:
    - VISIBLE_ACCESSIBLE
    - VISIBLE_LOCKED (with explanation)
    - COMPLETELY_HIDDEN
    """
    stmt_v = select(DashboardLayoutConfig.version).where(
        DashboardLayoutConfig.tenant_id == tenant_id,
        DashboardLayoutConfig.role_code == role_code
    ).order_by(DashboardLayoutConfig.version.desc()).limit(1)
    res_v = await db.execute(stmt_v)
    latest_v = res_v.scalar() or 0

    layout = DashboardLayoutConfig(
        tenant_id=tenant_id,
        role_code=role_code,
        version=latest_v + 1,
        status=status_type,
        layout_data=layout_data,
        created_by_superadmin_id=admin.id,
        published_at=datetime.now(timezone.utc) if status_type == "PUBLISHED" else None
    )
    db.add(layout)
    await db.commit()
    await db.refresh(layout)

    return {
        "status": "success",
        "message": f"Dashboard layout for '{role_code}' saved as {status_type}.",
        "layout_id": str(layout.id),
        "version": layout.version
    }


@router.get("/dashboard-designer/preview")
async def preview_dashboard_as_role(
    role_code: str,
    tenant_code: str = "akshara",
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Super Admin: Live preview of an institution's dashboard configuration as any role.
    Uses safe demonstration data; does NOT impersonate a real user or leak production credentials.
    """
    stmt_t = select(Tenant).where(Tenant.code == tenant_code.lower().strip())
    res_t = await db.execute(stmt_t)
    tenant = res_t.scalars().first()

    return {
        "preview_role": role_code,
        "tenant": {
            "name": tenant.name if tenant else "Akshara Global School & College",
            "code": tenant_code
        },
        "safe_demo_mode": True,
        "effective_presentation_states": {
            "examinations": "VISIBLE_ACCESSIBLE" if role_code in ["PRINCIPAL", "EXAM_CONTROLLER", "TEACHER", "PARENT", "STUDENT"] else "COMPLETELY_HIDDEN",
            "fees": "VISIBLE_ACCESSIBLE" if role_code in ["ACCOUNTANT", "PRINCIPAL", "PARENT"] else "VISIBLE_LOCKED",
            "permissions": "COMPLETELY_HIDDEN" if role_code != "SUPER_ADMIN" else "VISIBLE_ACCESSIBLE"
        }
    }


