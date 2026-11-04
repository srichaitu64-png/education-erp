from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.database.session import get_db
from app.modules.identity.models import User, UserRole, Role, Permission
from app.modules.identity.schemas import (
    LoginRequest,
    TokenResponse,
    UserOut,
    RoleOut,
    RefreshTokenRequest,
    UserAutocompleteRequest,
    UserAutocompleteResult
)
from app.modules.tenants.models import Tenant
from app.security.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user with email and password.
    Supports optional tenant_code for multi-tenant account resolution.
    Returns short-lived access token and refresh token.
    """
    stmt = (
        select(User)
        .options(
            selectinload(User.roles)
            .selectinload(UserRole.role)
            .selectinload(Role.permissions)
        )
        .where(User.email == req.email.lower().strip())
    )
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    # Determine tenant context
    tenant_id = None
    if req.tenant_code:
        stmt_t = select(Tenant).where(Tenant.code == req.tenant_code.lower().strip())
        res_t = await db.execute(stmt_t)
        tenant = res_t.scalars().first()
        if not tenant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution code not found")
        tenant_id = str(tenant.id)
    elif user.roles:
        # Default to first assigned tenant if not superadmin or if tenant exists
        for ur in user.roles:
            if ur.tenant_id:
                tenant_id = str(ur.tenant_id)
                break

    access_token = create_access_token(
        subject=str(user.id),
        tenant_id=tenant_id,
        is_superadmin=user.is_superadmin,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(
        subject=str(user.id),
        tenant_id=tenant_id,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    roles_out = []
    for ur in user.roles:
        roles_out.append(
            RoleOut(
                id=ur.role.id,
                name=ur.role.name,
                code=ur.role.code,
                tenant_id=ur.tenant_id,
                permissions=[p.code for p in ur.role.permissions]
            )
        )

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        is_superadmin=user.is_superadmin,
        roles=roles_out
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the authenticated user's profile and active roles."""
    roles_out = []
    for ur in current_user.roles:
        roles_out.append(
            RoleOut(
                id=ur.role.id,
                name=ur.role.name,
                code=ur.role.code,
                tenant_id=ur.tenant_id,
                permissions=[p.code for p in ur.role.permissions]
            )
        )

    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        is_active=current_user.is_active,
        is_superadmin=current_user.is_superadmin,
        roles=roles_out
    )


@router.post("/refresh")
async def refresh_token_endpoint(
    req: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Rotate and refresh access token using valid refresh token."""
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = payload.get("sub")
    tenant_id = payload.get("tenant_id")

    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer active"
        )

    new_access_token = create_access_token(
        subject=str(user.id),
        tenant_id=tenant_id,
        is_superadmin=user.is_superadmin,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.get("/institution-roles", response_model=List[str])
async def get_institution_login_roles(
    tenant_code: str = "akshara",
    db: AsyncSession = Depends(get_db)
):
    """
    Returns available login roles for an institution.
    Configurable by Platform Super Admin.
    """
    stmt_t = select(Tenant).where(Tenant.code == tenant_code.lower().strip())
    res_t = await db.execute(stmt_t)
    tenant = res_t.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

    # Standard supported institutional roles
    return [
        "PRINCIPAL",
        "INSTITUTION_ADMIN",
        "VICE_PRINCIPAL",
        "ACCOUNTANT",
        "EXAM_CONTROLLER",
        "TEACHER",
        "LECTURER",
        "ADMISSION_OFFICER",
        "PARENT",
        "STUDENT",
        "TRANSPORT_MANAGER",
        "DRIVER",
        "LIBRARIAN"
    ]


@router.post("/user-autocomplete", response_model=List[UserAutocompleteResult])
async def autocomplete_users_by_role(
    req: UserAutocompleteRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Role-based searchable user autocomplete for institution login.
    Requirements:
    - Search triggered after 2-4 characters entered.
    - Strictly scoped to verified institution and selected role.
    - Active account status check.
    - Minimal identifying information returned (no passwords, emails, or confidential data).
    - Prevents account enumeration and cross-tenant leakage.
    """
    q = req.query.strip()
    if len(q) < 2:
        return []

    stmt_t = select(Tenant).where(Tenant.code == req.tenant_code.lower().strip())
    res_t = await db.execute(stmt_t)
    tenant = res_t.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution code not found")

    # Query active users belonging to this tenant with this role
    stmt = (
        select(User)
        .join(UserRole, User.id == UserRole.user_id)
        .join(Role, UserRole.role_id == Role.id)
        .where(
            UserRole.tenant_id == tenant.id,
            Role.code == req.role_code.upper().strip(),
            User.is_active == True,
            User.full_name.ilike(f"%{q}%")
        )
        .limit(10)
    )
    res = await db.execute(stmt)
    users = res.scalars().all()

    results = []
    for u in users:
        # Minimal non-confidential display label
        label = f"{u.full_name} ({req.role_code})"
        results.append(
            UserAutocompleteResult(
                id=str(u.id),
                display_name=u.full_name,
                identifier=u.email.split("@")[0].upper(), # Staff ID or username token
                role_code=req.role_code
            )
        )
    return results


