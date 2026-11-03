import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, Numeric, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class SubscriptionPlan(Base, TimestampMixin):
    """
    SaaS Subscription Plans (Free Trial, Starter, Standard, Professional, Premium, Enterprise, Custom).
    """
    __tablename__ = "subscription_plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    tier: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 0=Trial, 1=Starter, 2=Std, 3=Pro, 4=Prem, 5=Ent
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Pricing in INR
    price_monthly_inr: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    price_annual_inr: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)

    # Usage Limits
    max_students: Mapped[int] = mapped_column(Integer, default=300)
    max_staff: Mapped[int] = mapped_column(Integer, default=30)
    max_campuses: Mapped[int] = mapped_column(Integer, default=1)
    max_storage_mb: Mapped[int] = mapped_column(Integer, default=5000)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)

    features: Mapped[List["PlanFeature"]] = relationship("PlanFeature", back_populates="plan", cascade="all, delete-orphan")
    subscriptions: Mapped[List["Subscription"]] = relationship("Subscription", back_populates="plan")


class FeatureCatalog(Base, TimestampMixin):
    """
    Central registry of platform capabilities that can be locked/unlocked.
    """
    __tablename__ = "feature_catalog"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # e.g., 'analytics.ai_reports'
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    module: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    min_plan_tier: Mapped[int] = mapped_column(Integer, default=1)
    default_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    is_addon: Mapped[bool] = mapped_column(Boolean, default=False)

    plan_features: Mapped[List["PlanFeature"]] = relationship("PlanFeature", back_populates="feature")


class PlanFeature(Base, TimestampMixin):
    """
    Association between Subscription Plans and Features.
    """
    __tablename__ = "plan_features"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscription_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    feature_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("feature_catalog.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_included: Mapped[bool] = mapped_column(Boolean, default=True)

    plan: Mapped["SubscriptionPlan"] = relationship("SubscriptionPlan", back_populates="features")
    feature: Mapped["FeatureCatalog"] = relationship("FeatureCatalog", back_populates="plan_features")

    __table_args__ = (
        Index("idx_plan_feature", "plan_id", "feature_id", unique=True),
    )


class Subscription(Base, TimestampMixin):
    """
    Institution's active or historical subscription.
    """
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscription_plans.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(32), default="active", nullable=False, index=True
    )  # "trial", "active", "past_due", "grace_period", "suspended", "expired", "cancelled"
    billing_cycle: Mapped[str] = mapped_column(String(16), default="annual")  # "monthly", "annual"
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    trial_ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    grace_ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=True)

    plan: Mapped["SubscriptionPlan"] = relationship("SubscriptionPlan", back_populates="subscriptions")


class TenantFeatureOverride(Base, TimestampMixin):
    """
    Institution-specific override allowing or denying a feature regardless of plan.
    Supports time-bound trials, custom add-ons, or emergency restrictions.
    """
    __tablename__ = "tenant_feature_overrides"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    feature_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("feature_catalog.id", ondelete="CASCADE"), nullable=False, index=True
    )
    override_status: Mapped[str] = mapped_column(
        String(16), nullable=False
    )  # "ALLOW" or "DENY" (DENY takes absolute precedence)
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )  # None means perpetual until revoked
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        Index("idx_tenant_feature_override", "tenant_id", "feature_id", unique=True),
    )


class FeatureUsage(Base, TimestampMixin):
    """
    Tracks consumption against quota limits (e.g. students, storage, SMS).
    """
    __tablename__ = "feature_usage"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    metric_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    current_value: Mapped[int] = mapped_column(Integer, default=0)
    limit_value: Mapped[int] = mapped_column(Integer, default=0)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    period_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_tenant_metric_usage", "tenant_id", "metric_name", unique=True),
    )


class SubscriptionAuditLog(Base):
    """
    Immutable audit history of subscription and entitlement modifications.
    """
    __tablename__ = "subscription_audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(64), nullable=False)  # "OVERRIDE_APPLIED", "OVERRIDE_REVOKED", "PLAN_CHANGED"
    performed_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
