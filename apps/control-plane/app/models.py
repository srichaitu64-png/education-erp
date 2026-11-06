from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Institution(Base):
    __tablename__ = "platform_institutions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(48), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    institution_type: Mapped[str] = mapped_column(String(32))
    deployment_mode: Mapped[str] = mapped_column(String(32))  # managed | customer_cloud
    cloud_provider: Mapped[str | None] = mapped_column(String(32), nullable=True)
    cloud_account_ref: Mapped[str | None] = mapped_column(String(200), nullable=True)  # reference only; never credentials
    primary_domain: Mapped[str | None] = mapped_column(String(253), nullable=True, unique=True)
    status: Mapped[str] = mapped_column(String(24), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Deployment(Base):
    __tablename__ = "platform_deployments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id: Mapped[str] = mapped_column(ForeignKey("platform_institutions.id", ondelete="CASCADE"), index=True)
    mode: Mapped[str] = mapped_column(String(32))
    region: Mapped[str] = mapped_column(String(64))
    endpoint: Mapped[str | None] = mapped_column(String(500), nullable=True)
    database_secret_ref: Mapped[str | None] = mapped_column(String(200), nullable=True)
    storage_secret_ref: Mapped[str | None] = mapped_column(String(200), nullable=True)
    desired_version: Mapped[str] = mapped_column(String(40), default="1.0.0")
    current_version: Mapped[str | None] = mapped_column(String(40), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="REQUESTED")
    last_health_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Subscription(Base):
    __tablename__ = "platform_subscriptions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id: Mapped[str] = mapped_column(ForeignKey("platform_institutions.id", ondelete="CASCADE"), index=True)
    plan_code: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(24), default="TRIAL")
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    grace_days: Mapped[int] = mapped_column(Integer, default=7)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ModuleEntitlement(Base):
    __tablename__ = "platform_module_entitlements"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id: Mapped[str] = mapped_column(ForeignKey("platform_institutions.id", ondelete="CASCADE"), index=True)
    module_code: Mapped[str] = mapped_column(String(64))
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    __table_args__ = (UniqueConstraint("institution_id", "module_code", name="uq_institution_module"),)


class SoftwareRelease(Base):
    __tablename__ = "platform_releases"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    version: Mapped[str] = mapped_column(String(40), unique=True)
    image_digest: Mapped[str] = mapped_column(String(200))
    signature_ref: Mapped[str] = mapped_column(String(500))
    channel: Mapped[str] = mapped_column(String(24), default="stable")
    migration_level: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(24), default="PUBLISHED")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Rollout(Base):
    __tablename__ = "platform_rollouts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    release_id: Mapped[str] = mapped_column(ForeignKey("platform_releases.id", ondelete="RESTRICT"))
    channel: Mapped[str] = mapped_column(String(24))
    stage: Mapped[str] = mapped_column(String(24), default="CANARY")
    percentage: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(24), default="PLANNED")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SupportGrant(Base):
    __tablename__ = "platform_support_grants"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    institution_id: Mapped[str] = mapped_column(ForeignKey("platform_institutions.id", ondelete="CASCADE"), index=True)
    requested_by: Mapped[str] = mapped_column(String(160))
    approved_by: Mapped[str | None] = mapped_column(String(160), nullable=True)
    reason: Mapped[str] = mapped_column(Text)
    scopes: Mapped[list] = mapped_column(JSON, default=list)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AuditEvent(Base):
    __tablename__ = "platform_audit_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor: Mapped[str] = mapped_column(String(160))
    action: Mapped[str] = mapped_column(String(100), index=True)
    resource_type: Mapped[str] = mapped_column(String(80))
    resource_id: Mapped[str] = mapped_column(String(80))
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
