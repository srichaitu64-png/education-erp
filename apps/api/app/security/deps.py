import uuid
from typing import AsyncGenerator, Callable, List, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import decode_token
from app.database.session import get_db, set_current_tenant_id, get_current_tenant_id
from app.modules.identity.models import User, UserRole, Role, Permission
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
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Retrieve the authenticated User model and verify active status."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format")

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

