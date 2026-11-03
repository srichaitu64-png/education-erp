import uuid
from typing import Optional, List
from sqlalchemy import Boolean, ForeignKey, Index, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Tenant(Base, TimestampMixin):
    """
    Core Tenant (Institution or Group) model.
    Represents an independent school, PU college, or degree college organization.
    """
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    institution_type: Mapped[str] = mapped_column(
        String(64), nullable=False, default="school"
    )  # "school", "pu_college", "degree_college", "composite_group"
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="active"
    )  # "active", "trial", "suspended", "expired"

    # Contact & Location
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India")

    # White-Label Branding
    logo_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    favicon_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    primary_color: Mapped[str] = mapped_column(String(16), default="#1E40AF")
    secondary_color: Mapped[str] = mapped_column(String(16), default="#F59E0B")
    custom_domain: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    subdomain: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)

    # Configuration & Settings JSON
    settings: Mapped[dict] = mapped_column(JSON, default=dict)

    # Relationships
    campuses: Mapped[List["Campus"]] = relationship("Campus", back_populates="tenant", cascade="all, delete-orphan")
    domains: Mapped[List["TenantDomain"]] = relationship("TenantDomain", back_populates="tenant", cascade="all, delete-orphan")


class Campus(Base, TimestampMixin):
    """
    Branch or Campus location belonging to a Tenant.
    """
    __tablename__ = "campuses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="campuses")

    __table_args__ = (
        Index("idx_campus_tenant_code", "tenant_id", "code", unique=True),
    )


class TenantDomain(Base, TimestampMixin):
    """
    Custom domains mapped to an institution tenant.
    """
    __tablename__ = "tenant_domains"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="domains")

