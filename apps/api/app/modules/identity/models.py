import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import Boolean, ForeignKey, Index, String, Table, Column, JSON, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

# Association table between Roles and Permissions
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)


class User(Base, TimestampMixin):
    """
    Global user account. A user can belong to one or more tenants through UserRole.
    Super Admins have platform-level access.
    """
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superadmin: Mapped[bool] = mapped_column(Boolean, default=False)
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    password_changed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    roles: Mapped[List["UserRole"]] = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")


class Permission(Base, TimestampMixin):
    """
    Granular permission definitions (e.g. students.view, fees.collect).
    """
    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    module: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    roles: Mapped[List["Role"]] = relationship("Role", secondary=role_permissions, back_populates="permissions")


class Role(Base, TimestampMixin):
    """
    Role definition. Tenant-specific roles have tenant_id set; global template roles have tenant_id=None.
    """
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)

    permissions: Mapped[List["Permission"]] = relationship("Permission", secondary=role_permissions, back_populates="roles")
    user_roles: Mapped[List["UserRole"]] = relationship("UserRole", back_populates="role")

    __table_args__ = (
        Index("idx_role_tenant_code", "tenant_id", "code", unique=True),
    )


class UserRole(Base, TimestampMixin):
    """
    Assignment of a Role to a User within a specific Tenant and optional Campus.
    """
    __tablename__ = "user_roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="CASCADE"), nullable=True, index=True
    )

    user: Mapped["User"] = relationship("User", back_populates="roles")
    role: Mapped["Role"] = relationship("Role", back_populates="user_roles")

    __table_args__ = (
        Index("idx_user_tenant_role", "user_id", "tenant_id", "role_id", unique=True),
    )


class PermissionChangeAudit(Base, TimestampMixin):
    """
    Immutable audit log of all permission, role and scope assignments.
    Records acting Super Admin, target tenant, target user/role, previous state,
    new state, reason, and supports rollback to a previous version.
    """
    __tablename__ = "permission_change_audits"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, index=True)
    acting_superadmin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    acting_superadmin_name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    target_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    target_role_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    action_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True
        # ROLE_CREATE, ROLE_UPDATE, PERMISSION_ASSIGN, PERMISSION_REVOKE,
        # USER_ROLE_ASSIGN, USER_ROLE_REVOKE, SCOPE_SET, TEMP_PERMISSION_SET, ROLLBACK
    )
    previous_state: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    new_state: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class UserPermissionOverride(Base, TimestampMixin):
    """
    Fine-grained user permission override with scope and expiry.
    Enforces deny-by-default and explicit scope constraints.
    """
    __tablename__ = "user_permission_overrides"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    permission_code: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    is_granted: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Scopes: tenant, campus, department, programme, class, section, subject, assigned_students, own_child, assigned_route
    scope_type: Mapped[str] = mapped_column(String(64), default="tenant", nullable=False)
    scope_value: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    granted_by_superadmin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)


class DashboardLayoutConfig(Base, TimestampMixin):
    """
    Super Admin Access & Dashboard Designer configurations.
    Manages menu visibility (Show/Hide), module access (Accessible/Inaccessible),
    and action permissions per institution role with 3 presentation states:
    - VISIBLE_ACCESSIBLE
    - VISIBLE_LOCKED (with explanation)
    - COMPLETELY_HIDDEN
    """
    __tablename__ = "dashboard_layout_configs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    role_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="PUBLISHED", nullable=False) # DRAFT, PUBLISHED, ARCHIVED
    layout_data: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_by_superadmin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_dashboard_layout_tenant_role", "tenant_id", "role_code", "version"),
    )


class PermissionChangeRequest(Base, TimestampMixin):
    """
    Permission change request submitted by Institution Admins to Platform Super Admin.
    Ordinary institution roles cannot edit privileges themselves.
    """
    __tablename__ = "permission_change_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    requested_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_role_code: Mapped[str] = mapped_column(String(64), nullable=False)
    requested_changes: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    justification: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="PENDING", nullable=False) # PENDING, APPROVED, REJECTED
    reviewed_by_superadmin_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    reviewer_comments: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)


class PlatformSupportAccessSession(Base, TimestampMixin):
    """
    Consent-based, audited, time-limited tenant support access session.
    Platform Super Admins CANNOT silently read private student/staff/financial
    records of an institution without an approved, unexpired support ticket.
    """
    __tablename__ = "platform_support_access_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ticket_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_by_platform_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    approved_by_institution_admin_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    scope: Mapped[str] = mapped_column(String(64), default="READ_ONLY_DIAGNOSTICS", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="REQUESTED", nullable=False) # REQUESTED, APPROVED, REJECTED, EXPIRED, REVOKED
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class PlatformAuditAction(Base, TimestampMixin):
    """
    Immutable audit log for all Platform Administrator operations:
    Tenant onboarding, plan changes, suspensions, config changes, and support sessions.
    """
    __tablename__ = "platform_audit_actions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    admin_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True, index=True
    )
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)


class PasswordResetToken(Base, TimestampMixin):
    """
    Secure one-time password reset tokens and temporary activation tokens.
    Token values are stored ONLY as cryptographic SHA-256 hashes.
    """
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    token_type: Mapped[str] = mapped_column(String(32), default="RESET", nullable=False) # RESET, FIRST_LOGIN, OTP
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    user: Mapped["User"] = relationship("User")


class UserSession(Base, TimestampMixin):
    """
    Tracks active user devices and sessions for account security auditing and revocation.
    """
    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    session_token_hash: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    device_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_active_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User")


class AccountSecurityEvent(Base, TimestampMixin):
    """
    Immutable security audit trail for authentication, password changes,
    administrative resets, account lockouts, and session revocations.
    """
    __tablename__ = "account_security_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tenant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True, index=True
    )
    event_type: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
        # PASSWORD_CHANGE, FIRST_LOGIN_SETUP, ADMIN_RESET, FORGOT_REQUEST, RESET_CONFIRM,
        # LOGIN_SUCCESS, LOGIN_FAILED, ACCOUNT_LOCKED, SESSIONS_REVOKED
    )
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    actor_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    user: Mapped["User"] = relationship("User")




