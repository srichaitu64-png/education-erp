import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Callable, List, Optional
from fastapi import Depends, HTTPException, Security, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import decode_token
from app.database.session import get_db, get_current_tenant_id, set_current_tenant_id
from app.modules.identity.models import User, UserRole, Role, Permission, PlatformSupportAccessSession, UserSession
from app.modules.subscriptions.service import EntitlementService, FeatureAccessResult

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> dict:
    """Extract and validate JWT token payload from Authorization header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


async def get_current_user(
    request: Request,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Retrieve authenticated User model with active status, session revocation,
    and first-login password enforcement gate verification.
    """
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format")

    # Verify session revocation if session ID (sid) is present in token
    sid = payload.get("sid")
    if sid:
        try:
            sid_uuid = uuid.UUID(sid)
            stmt_sess = select(UserSession).where(UserSession.id == sid_uuid)
            res_sess = await db.execute(stmt_sess)
            active_session = res_sess.scalars().first()
            if not active_session or active_session.is_revoked:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has been revoked or invalidated. Please sign in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            active_session.last_active_at = datetime.now(timezone.utc)
        except ValueError:
            pass

    # Apply the signed tenant claim before loading tenant-scoped role assignments.
    token_tenant = payload.get("tenant_id")
    tenant_uuid = None
    if token_tenant:
        try:
            tenant_uuid = uuid.UUID(token_tenant)
            set_current_tenant_id(tenant_uuid)
            db.info["rls_tenant_id"] = tenant_uuid
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid tenant ID in token")
        await db.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": str(tenant_uuid)}
        )
    else:
        # Middleware may resolve an institution for platform support requests.
        # Ordinary users are checked against their role membership immediately
        # after the user record and tenant-scoped roles are loaded.
        tenant_uuid = get_current_tenant_id()
        db.info["rls_tenant_id"] = tenant_uuid
        if tenant_uuid:
            await db.execute(
                text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
                {"tenant_id": str(tenant_uuid)}
            )
        else:
            await db.execute(text("SELECT set_config('app.current_tenant_id', '', true)"))

    stmt = (
        select(User)
        .options(
            selectinload(User.roles)
            .selectinload(UserRole.role)
            .selectinload(Role.permissions)
        )
        .where(User.id == user_uuid)
    )
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    db.info["rls_user_id"] = user.id
    await db.execute(
        text("SELECT set_config('app.current_user_id', :user_id, true)"),
        {"user_id": str(user.id)}
    )

    if tenant_uuid and not user.is_superadmin:
        if not any(role.tenant_id == tenant_uuid for role in user.roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not assigned to the selected institution.")
    if tenant_uuid and user.is_superadmin:
        support_stmt = select(PlatformSupportAccessSession).where(
            PlatformSupportAccessSession.tenant_id == tenant_uuid,
            PlatformSupportAccessSession.requested_by_platform_user_id == user.id,
            PlatformSupportAccessSession.status == "APPROVED",
            PlatformSupportAccessSession.expires_at > datetime.now(timezone.utc),
            PlatformSupportAccessSession.revoked_at.is_(None)
        )
        support_result = await db.execute(support_stmt)
        if not support_result.scalars().first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="An approved, active support session is required for tenant-scoped platform access.")

    # Mandatory first-login password enforcement gate
    if user.must_change_password:
        path = request.url.path if request else ""
        allowed_first_login_paths = {
            "/api/v1/auth/password/first-login-setup",
            "/api/v1/auth/password/change",
            "/api/v1/auth/me",
            "/api/v1/auth/logout",
            "/api/v1/auth/security/overview"
        }
        if not any(path.startswith(p) for p in allowed_first_login_paths):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Password setup required: You must establish a permanent password before accessing application workspace."
            )

    # Set tenant context if token has an authenticated tenant
    token_tenant = payload.get("tenant_id")
    if token_tenant:
        try:
            t_uuid = uuid.UUID(token_tenant)
            set_current_tenant_id(t_uuid)
        except ValueError:
            pass

    return user


async def get_current_superadmin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure the current user is a platform Super Admin."""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires Platform Super Admin privileges"
        )
    return current_user


def require_permission(permission_code: str) -> Callable:
    """
    Dependency factory to check if the user has a specific granular permission
    within the current tenant scope.
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.is_superadmin:
            return current_user  # Super Admin has all permissions

        tenant_id = get_current_tenant_id()
        user_permissions = set()

        for ur in current_user.roles:
            if ur.tenant_id == tenant_id or ur.tenant_id is None:
                for perm in ur.role.permissions:
                    user_permissions.add(perm.code)

        if permission_code not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: '{permission_code}'"
            )
        return current_user

    return permission_checker


def require_feature(feature_id: str) -> Callable:
    """
    Dependency factory to enforce Subscription Feature Locking on an endpoint.
    Returns 403 FEATURE_LOCKED with upgrade guidance if not unlocked.
    """
    async def feature_guard(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> FeatureAccessResult:
        if current_user.is_superadmin:
            # Superadmin bypasses locking for platform audit
            return FeatureAccessResult(
                is_enabled=True,
                feature_id=feature_id,
                feature_name="Superadmin Access",
                required_plan="Superadmin",
                current_plan="Superadmin"
            )

        tenant_id = get_current_tenant_id()
        if not tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenant context required to evaluate feature access"
            )

        entitlement_svc = EntitlementService(db)
        access = await entitlement_svc.check_feature_access(tenant_id, feature_id)

        if not access.is_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error_code": "FEATURE_LOCKED",
                    "feature_id": access.feature_id,
                    "feature_name": access.feature_name,
                    "required_plan": access.required_plan,
                    "current_plan": access.current_plan,
                    "message": access.lock_reason or f"Feature '{access.feature_name}' requires {access.required_plan} plan.",
                    "upgrade_url": access.upgrade_url
                }
            )
        return access

    return feature_guard


def require_module_access(module_name: str, permission_code: Optional[str] = None) -> Callable:
    """
    Composite Dependency: Enforces both Subscription Module Entitlement
    AND Granular User Permission.
    Effective Access = Subscription Entitlements ∩ User Assigned Permissions.
    """
    async def module_guard(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.is_superadmin:
            return current_user

        tenant_id = get_current_tenant_id()
        if not tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenant context required to evaluate module access"
            )

        entitlement_svc = EntitlementService(db)
        tenant_entitlements = await entitlement_svc.get_tenant_entitlements(tenant_id)

        sub_status = tenant_entitlements.get("subscription_status", "inactive")
        if sub_status in ("suspended", "deactivated"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Institution subscription is suspended. Access to module '{module_name}' is disabled."
            )

        module_features = [
            f for f in tenant_entitlements.get("features", [])
            if f.get("module") == module_name
        ]
        is_module_entitled = any(f.get("is_enabled") for f in module_features)

        if not is_module_entitled and module_features:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error_code": "MODULE_NOT_ENTITLED",
                    "module": module_name,
                    "current_plan": tenant_entitlements.get("current_plan", "None"),
                    "message": f"Module '{module_name}' is not enabled under your institution's subscription plan. Please contact your platform administrator to upgrade."
                }
            )

        if permission_code:
            user_permissions = set()
            for ur in current_user.roles:
                if ur.tenant_id == tenant_id or ur.tenant_id is None:
                    for perm in ur.role.permissions:
                        user_permissions.add(perm.code)

            if permission_code not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: '{permission_code}'"
                )

        return current_user

    return module_guard


async def verify_tenant_access_or_support(
    tenant_id: uuid.UUID,
    db: AsyncSession,
    current_user: User
) -> bool:
    """
    Ensure the user is authorized to access tenant data:
    1. Member of tenant with active role, OR
    2. Platform Super Admin with an active, approved, unexpired PlatformSupportAccessSession.
    Direct silent superadmin access without an approved support session is strictly prohibited.
    """
    for ur in current_user.roles:
        if ur.tenant_id == tenant_id:
            set_current_tenant_id(tenant_id)
            db.info["rls_tenant_id"] = tenant_id
            await db.execute(
                text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
                {"tenant_id": str(tenant_id)}
            )
            return True

    if current_user.is_superadmin:
        now = datetime.now(timezone.utc)
        stmt = (
            select(PlatformSupportAccessSession)
            .where(
                PlatformSupportAccessSession.tenant_id == tenant_id,
                PlatformSupportAccessSession.requested_by_platform_user_id == current_user.id,
                PlatformSupportAccessSession.status == "APPROVED",
                PlatformSupportAccessSession.expires_at > now,
                PlatformSupportAccessSession.revoked_at.is_(None)
            )
        )
        res = await db.execute(stmt)
        active_session = res.scalars().first()
        if active_session:
            set_current_tenant_id(tenant_id)
            await db.execute(
                text("SELECT set_config('app.current_tenant_id', :tenant_id, false)"),
                {"tenant_id": str(tenant_id)}
            )
            return True

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform administrators require an active, approved consent-based support session to access private tenant records."
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized cross-tenant access attempt."
    )


