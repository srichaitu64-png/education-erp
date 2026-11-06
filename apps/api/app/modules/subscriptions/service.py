import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.subscriptions.models import (
    Subscription,
    SubscriptionPlan,
    FeatureCatalog,
    PlanFeature,
    TenantFeatureOverride,
    FeatureUsage,
    SubscriptionAuditLog
)


class FeatureAccessResult(BaseModel):
    is_enabled: bool
    feature_id: str
    feature_name: str
    required_plan: str
    current_plan: str
    lock_reason: Optional[str] = None
    override_active: bool = False
    override_status: Optional[str] = None
    upgrade_url: Optional[str] = None


class EntitlementService:
    """
    Central Subscription Entitlement and Feature Locking Engine.
    Enforces subscription plans, institution-specific overrides, and usage limits.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_tenant_subscription(self, tenant_id: uuid.UUID) -> Optional[Subscription]:
        """Fetch the current subscription for a tenant with its plan loaded."""
        stmt = (
            select(Subscription)
            .options(selectinload(Subscription.plan).selectinload(SubscriptionPlan.features))
            .where(Subscription.tenant_id == tenant_id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def is_feature_enabled(self, tenant_id: uuid.UUID, feature_id: str) -> bool:
        """
        Evaluate if a feature is enabled for a given tenant.
        Precedence:
          1. Tenant Feature Override (DENY -> False immediately)
          2. Tenant Feature Override (ALLOW -> True if within valid date range)
          3. Subscription Plan Entitlement (if subscription is active or within grace period)
        """
        access = await self.check_feature_access(tenant_id, feature_id)
        return access.is_enabled

    async def check_feature_access(self, tenant_id: uuid.UUID, feature_id: str) -> FeatureAccessResult:
        """Detailed evaluation of feature access with plan context and lock reasons."""
        now = datetime.now(timezone.utc)

        # 1. Fetch feature details
        stmt_feat = select(FeatureCatalog).where(FeatureCatalog.id == feature_id)
        res_feat = await self.db.execute(stmt_feat)
        feature = res_feat.scalars().first()
        if not feature:
            return FeatureAccessResult(
                is_enabled=False,
                feature_id=feature_id,
                feature_name="Unknown Feature",
                required_plan="Enterprise",
                current_plan="None",
                lock_reason="Feature does not exist in platform catalog."
            )

        # Determine required plan description from min_plan_tier
        tier_names = {
            0: "Free Trial",
            1: "Starter",
            2: "Standard",
            3: "Professional",
            4: "Premium",
            5: "Enterprise",
            6: "Custom"
        }
        required_plan_name = tier_names.get(feature.min_plan_tier, "Enterprise")

        # 2. Check for Institution-Specific Override
        stmt_override = select(TenantFeatureOverride).where(
            and_(
                TenantFeatureOverride.tenant_id == tenant_id,
                TenantFeatureOverride.feature_id == feature_id,
                TenantFeatureOverride.is_active == True,
                TenantFeatureOverride.starts_at <= now,
                or_(
                    TenantFeatureOverride.expires_at == None,
                    TenantFeatureOverride.expires_at >= now
                )
            )
        )
        res_override = await self.db.execute(stmt_override)
        override = res_override.scalars().first()

        # Explicit DENY takes absolute precedence
        if override and override.override_status == "DENY":
            return FeatureAccessResult(
                is_enabled=False,
                feature_id=feature_id,
                feature_name=feature.name,
                required_plan=required_plan_name,
                current_plan="Custom Policy",
                lock_reason=f"Feature access explicitly restricted by administrator: {override.reason}",
                override_active=True,
                override_status="DENY"
            )

        # Explicit ALLOW unlocks the feature
        if override and override.override_status == "ALLOW":
            return FeatureAccessResult(
                is_enabled=True,
                feature_id=feature_id,
                feature_name=feature.name,
                required_plan=required_plan_name,
                current_plan="Institution Override",
                override_active=True,
                override_status="ALLOW"
            )

        # 3. Check Subscription & Plan Entitlement
        subscription = await self.get_tenant_subscription(tenant_id)
        if not subscription:
            return FeatureAccessResult(
                is_enabled=False,
                feature_id=feature_id,
                feature_name=feature.name,
                required_plan=required_plan_name,
                current_plan="None",
                lock_reason="No active subscription found for this institution.",
                upgrade_url=f"/dashboard/subscription/upgrade?feature={feature_id}"
            )

        # Check subscription status
        valid_statuses = ("active", "trial")
        if subscription.status not in valid_statuses:
            # Check if within grace period
            in_grace = (
                subscription.status == "grace_period" and
                subscription.grace_ends_at and
                subscription.grace_ends_at >= now
            )
            if not in_grace:
                return FeatureAccessResult(
                    is_enabled=False,
                    feature_id=feature_id,
                    feature_name=feature.name,
                    required_plan=required_plan_name,
                    current_plan=subscription.plan.name,
                    lock_reason=f"Subscription is currently {subscription.status}.",
                    upgrade_url=f"/dashboard/subscription/renew?tenant={tenant_id}"
                )

        # Check if plan contains this feature
        plan = subscription.plan
        plan_feature_map = {pf.feature_id: pf.is_included for pf in plan.features}
        # An explicit plan-feature row is authoritative, including an explicit
        # exclusion. Tier-based fallback is retained for older plans/catalog rows
        # that have not yet been materialized in the association table.
        is_included = (
            plan_feature_map[feature_id]
            if feature_id in plan_feature_map
            else plan.tier >= feature.min_plan_tier
        )

        if is_included:
            return FeatureAccessResult(
                is_enabled=True,
                feature_id=feature_id,
                feature_name=feature.name,
                required_plan=required_plan_name,
                current_plan=plan.name
            )

        return FeatureAccessResult(
            is_enabled=False,
            feature_id=feature_id,
            feature_name=feature.name,
            required_plan=required_plan_name,
            current_plan=plan.name,
            lock_reason=f"Feature '{feature.name}' is locked. Available in {required_plan_name} plan.",
            upgrade_url=f"/dashboard/subscription/upgrade?feature={feature_id}"
        )

    async def get_tenant_entitlements(self, tenant_id: uuid.UUID) -> Dict[str, Any]:
        """Return complete catalogue with enabled/locked status for tenant dashboard."""
        stmt_all = select(FeatureCatalog)
        res_all = await self.db.execute(stmt_all)
        all_features = res_all.scalars().all()

        subscription = await self.get_tenant_subscription(tenant_id)
        current_plan_name = subscription.plan.name if subscription else "None"
        current_plan_tier = subscription.plan.tier if subscription else -1

        entitlements = []
        for feat in all_features:
            access = await self.check_feature_access(tenant_id, feat.id)
            entitlements.append({
                "feature_id": feat.id,
                "name": feat.name,
                "module": feat.module,
                "category": feat.category,
                "description": feat.description,
                "is_enabled": access.is_enabled,
                "required_plan": access.required_plan,
                "lock_reason": access.lock_reason,
                "upgrade_url": access.upgrade_url,
                "override_active": access.override_active
            })

        return {
            "tenant_id": str(tenant_id),
            "current_plan": current_plan_name,
            "current_tier": current_plan_tier,
            "subscription_status": subscription.status if subscription else "inactive",
            "features": entitlements
        }

    async def apply_feature_override(
        self,
        tenant_id: uuid.UUID,
        feature_id: str,
        override_status: str,
        reason: str,
        expires_at: Optional[datetime],
        performed_by: Optional[uuid.UUID] = None
    ) -> TenantFeatureOverride:
        """Super Admin command: Apply an institution-specific feature override."""
        stmt = select(TenantFeatureOverride).where(
            and_(
                TenantFeatureOverride.tenant_id == tenant_id,
                TenantFeatureOverride.feature_id == feature_id
            )
        )
        res = await self.db.execute(stmt)
        override = res.scalars().first()

        now = datetime.now(timezone.utc)
        if override:
            override.override_status = override_status
            override.reason = reason
            override.starts_at = now
            override.expires_at = expires_at
            override.is_active = True
            override.created_by = performed_by
        else:
            override = TenantFeatureOverride(
                tenant_id=tenant_id,
                feature_id=feature_id,
                override_status=override_status,
                reason=reason,
                starts_at=now,
                expires_at=expires_at,
                is_active=True,
                created_by=performed_by
            )
            self.db.add(override)

        # Log audit entry
        audit = SubscriptionAuditLog(
            tenant_id=tenant_id,
            action=f"FEATURE_OVERRIDE_{override_status}",
            performed_by=performed_by,
            details={
                "feature_id": feature_id,
                "override_status": override_status,
                "reason": reason,
                "expires_at": expires_at.isoformat() if expires_at else None
            }
        )
        self.db.add(audit)
        await self.db.commit()
        await self.db.refresh(override)
        return override

    async def revoke_feature_override(
        self,
        tenant_id: uuid.UUID,
        feature_id: str,
        performed_by: Optional[uuid.UUID] = None
    ) -> bool:
        """Super Admin command: Revoke an institution feature override."""
        stmt = select(TenantFeatureOverride).where(
            and_(
                TenantFeatureOverride.tenant_id == tenant_id,
                TenantFeatureOverride.feature_id == feature_id,
                TenantFeatureOverride.is_active == True
            )
        )
        res = await self.db.execute(stmt)
        override = res.scalars().first()
        if not override:
            return False

        override.is_active = False

        audit = SubscriptionAuditLog(
            tenant_id=tenant_id,
            action="FEATURE_OVERRIDE_REVOKED",
            performed_by=performed_by,
            details={"feature_id": feature_id}
        )
        self.db.add(audit)
        await self.db.commit()
        return True

    async def check_usage_limit(
        self,
        tenant_id: uuid.UUID,
        metric_name: str,
        requested_increment: int = 1
    ) -> bool:
        """Check if tenant has remaining capacity under its quota."""
        subscription = await self.get_tenant_subscription(tenant_id)
        if not subscription:
            return False

        plan = subscription.plan
        max_allowed = {
            "students": plan.max_students,
            "staff": plan.max_staff,
            "campuses": plan.max_campuses,
            "storage_mb": plan.max_storage_mb
        }.get(metric_name)

        if max_allowed is None:
            return True  # Unlimited or unmetered

        stmt = select(FeatureUsage).where(
            and_(
                FeatureUsage.tenant_id == tenant_id,
                FeatureUsage.metric_name == metric_name
            )
        )
        res = await self.db.execute(stmt)
        usage = res.scalars().first()
        current_val = usage.current_value if usage else 0

        return (current_val + requested_increment) <= max_allowed

