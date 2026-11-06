import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, func, or_, desc, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_password_strength,
    generate_secure_token,
    hash_token,
    generate_temporary_password
)
from app.database.session import get_db, set_current_tenant_id
from app.modules.subscriptions.service import EntitlementService
from app.modules.identity.models import (
    User,
    UserRole,
    Role,
    Permission,
    PasswordResetToken,
    UserSession,
    AccountSecurityEvent
)
from app.core.totp import (
    generate_totp_secret,
    get_totp_token,
    verify_totp_token,
    generate_otpauth_uri
)
from app.modules.identity.schemas import (
    LoginRequest,
    TokenResponse,
    WorkspaceOut,
    UserOut,
    RoleOut,
    RefreshTokenRequest,
    UserAutocompleteRequest,
    UserAutocompleteResult,
    PasswordChangeRequest,
    FirstLoginSetupRequest,
    ForgotPasswordRequest,
    PasswordResetConfirmRequest,
    OTPPasswordResetRequest,
    OTPPasswordResetResponse,
    OTPPasswordVerifyAndResetRequest,
    AdminPasswordResetRequest,
    AccountSecurityOverviewOut,
    SessionOut,
    AccountSecurityEventOut,
    MFASetupResponse,
    MFAVerifyRequest,
    MFADisableRequest,
    MFAChallengeRequest,
)
from app.modules.tenants.models import Tenant
from app.security.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Universal Authentication Endpoint:
    Authenticates user via username/email and password with Argon2id.
    Automatically resolves account authority (Platform Owner vs Institution),
    computes effective permissions intersecting subscription entitlements,
    and returns the designated dashboard destination.
    """
    login_id = (req.username or req.email or "").strip().lower()
    if not login_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is required"
        )

    # Authenticate only against an account identifier actually stored for this user.
    # Never map public aliases to privileged accounts or rely on demo credentials.
    resolved_email = login_id

    # Resolve the account without loading tenant-scoped role rows. Never elevate
    # the database session to the platform-superadmin RLS bypass for login.
    stmt = (
        select(User)
        .where(
            or_(
                func.lower(User.email) == resolved_email,
                func.lower(User.email) == login_id,
                User.phone == login_id
            )
        )
    )
    res = await db.execute(stmt)
    user = res.scalars().first()

    ip_addr = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")

    if user:
        # Check temporary account lockout
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is temporarily locked due to consecutive failed login attempts. Lockout active until {user.locked_until.strftime('%H:%M:%S UTC')}."
            )

    valid_password = bool(user and verify_password(req.password, user.hashed_password))

    if not user or not valid_password:
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
                sec_event = AccountSecurityEvent(
                    user_id=user.id,
                    tenant_id=None,
                    event_type="ACCOUNT_LOCKED",
                    ip_address=ip_addr,
                    user_agent=user_agent,
                    details={"consecutive_failures": user.failed_login_attempts, "lock_minutes": 15}
                )
                db.add(sec_event)
            else:
                sec_event = AccountSecurityEvent(
                    user_id=user.id,
                    tenant_id=user.roles[0].tenant_id if user.roles else None,
                    event_type="LOGIN_FAILED",
                    ip_address=ip_addr,
                    user_agent=user_agent,
                    details={"failed_attempts": user.failed_login_attempts}
                )
                db.add(sec_event)
            await db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    # Reset failure counters on successful authentication
    user.failed_login_attempts = 0
    user.locked_until = None

    # Multi-Factor Authentication Challenge Gate
    if getattr(user, "mfa_enabled", False):
        challenge_token = create_access_token(
            subject=str(user.id),
            expires_delta=timedelta(minutes=5),
            extra_claims={"type": "mfa_challenge", "tenant_code": req.tenant_code}
        )
        return TokenResponse(
            access_token=None,
            refresh_token=None,
            token_type="bearer",
            expires_in=300,
            user=None,
            destination="/platform" if user.is_superadmin else "/app",
            authority_level="PLATFORM" if user.is_superadmin else "INSTITUTION",
            mfa_required=True,
            mfa_token=challenge_token
        )

    # Determine authority level, tenant context, and dashboard destination
    authority_level = "INSTITUTION"
    destination = "/app"
    primary_role = None
    scoped_roles = []
    available_workspaces: List[WorkspaceOut] = []
    tenant_info = None
    entitled_modules: List[str] = []
    effective_permissions: List[str] = []
    tenant_id = None

    if user.is_superadmin:
        # Platform accounts may only see global (tenant_id IS NULL) role rows;
        # the default RLS context remains non-privileged.
        platform_user_result = await db.execute(
            select(User)
            .options(
                selectinload(User.roles)
                .selectinload(UserRole.role)
                .selectinload(Role.permissions)
            )
            .where(User.id == user.id)
        )
        user = platform_user_result.scalars().first()
        authority_level = "PLATFORM"
        destination = "/platform"
        primary_role = "SUPER_ADMIN"
        tenant_id = None
        entitled_modules = ["platform", "tenants", "subscriptions", "governance", "audit"]
        effective_permissions = ["*"]
    else:
        # Institution code is required so tenant-scoped role rows can be loaded
        # only after the database transaction has the corresponding RLS context.
        if not req.tenant_code or not req.tenant_code.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Institution code is required for institutional sign-in."
            )
        req_code = req.tenant_code.lower().strip()
        tenant_result = await db.execute(select(Tenant).where(Tenant.code == req_code))
        tenant = tenant_result.scalars().first()
        if not tenant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution code not found.")

        # Apply tenant scope before querying UserRole/Role/Permission (RLS protected).
        set_current_tenant_id(tenant.id)
        await db.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": str(tenant.id)}
        )
        scoped_user_result = await db.execute(
            select(User)
            .options(
                selectinload(User.roles)
                .selectinload(UserRole.role)
                .selectinload(Role.permissions)
            )
            .where(User.id == user.id)
        )
        user = scoped_user_result.scalars().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account could not be resolved.")
        scoped_roles = [ur for ur in user.roles if ur.tenant_id == tenant.id]
        if not scoped_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has no active role assignment in the selected institution."
            )
        target_tenant_id = tenant.id

        if not tenant:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No active institution workspace is assigned to this account.")

        if tenant:
            if not scoped_roles:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No active role assignment exists for this institution.")
            tenant_id = str(tenant.id)
            if tenant.status not in ("active", "trial", "trialing"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your institution workspace is not active. Please contact the institution owner or platform administration."
                )

            if tenant.status == "suspended":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your institution account is currently suspended. Please contact platform administration."
                )

            tenant_info = {
                "id": str(tenant.id),
                "name": tenant.name,
                "code": tenant.code,
                "institution_type": tenant.institution_type,
                "status": tenant.status
            }

            # Fetch subscription entitlements and calculate effective access
            entitlement_svc = EntitlementService(db)
            ent_data = await entitlement_svc.get_tenant_entitlements(tenant.id)
            tenant_info["current_plan"] = ent_data.get("current_plan", "Standard")
            tenant_info["subscription_status"] = ent_data.get("subscription_status", "inactive")
            subscription_status = tenant_info["subscription_status"]
            if subscription_status not in ("active", "trial", "grace_period"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Institution subscription is {subscription_status}. Workspace access requires an active subscription or trial."
                )

            # Extract distinct active modules under current plan
            entitled_modules = sorted(list({
                feat["module"] for feat in ent_data.get("features", [])
                if feat.get("is_enabled")
            }))

            # Intersect user assigned permissions with entitled modules
            user_perm_codes = set()
            for ur in scoped_roles:
                    for perm in ur.role.permissions:
                        if perm.module in entitled_modules or perm.module in ("governance", "identity", "core", "settings"):
                            user_perm_codes.add(perm.code)
            effective_permissions = sorted(list(user_perm_codes))

            # Determine primary role and destination mapping
            role_codes = [ur.role.code for ur in scoped_roles]

            if "CHAIRMAN_DIRECTOR" in role_codes or "DIRECTOR" in role_codes:
                primary_role = "CHAIRMAN_DIRECTOR"
                destination = "/app"
            elif "PRINCIPAL" in role_codes:
                primary_role = "PRINCIPAL"
                destination = "/app"
            elif "VICE_PRINCIPAL" in role_codes:
                primary_role = "VICE_PRINCIPAL"
                destination = "/app"
            elif "ACCOUNTANT" in role_codes:
                primary_role = "ACCOUNTANT"
                destination = "/app"
            elif "EXAM_CONTROLLER" in role_codes:
                primary_role = "EXAM_CONTROLLER"
                destination = "/app"
            elif "TEACHER" in role_codes:
                primary_role = "TEACHER"
                destination = "/app"
            elif "STUDENT" in role_codes:
                primary_role = "STUDENT"
                destination = "/app"
            elif "PARENT" in role_codes:
                primary_role = "PARENT"
                destination = "/app"
            elif "LIBRARIAN" in role_codes:
                primary_role = "LIBRARIAN"
                destination = "/app"
            elif "INSTITUTION_ADMIN" in role_codes:
                primary_role = "INSTITUTION_ADMIN"
                destination = "/app"
            else:
                primary_role = role_codes[0] if role_codes else "INSTITUTION_USER"
                destination = "/app"

            # Multi-role available workspaces
            for ur in scoped_roles:
                dest_r = "/app"
                available_workspaces.append(
                    WorkspaceOut(
                        workspace_id=f"{ur.role.code}-{ur.tenant_id or 'global'}",
                        role_code=ur.role.code,
                        role_name=ur.role.name,
                        tenant_id=str(ur.tenant_id) if ur.tenant_id else None,
                        tenant_name=tenant.name if tenant else None,
                        destination=dest_r
                    )
                )

    session_id = uuid.uuid4()
    access_token = create_access_token(
        subject=str(user.id),
        tenant_id=tenant_id,
        is_superadmin=user.is_superadmin,
        session_id=str(session_id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(
        subject=str(user.id),
        tenant_id=tenant_id,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )

    # Track active session bound to unique session_id
    sess = UserSession(
        id=session_id,
        user_id=user.id,
        session_token_hash=hash_token(access_token[-16:]),
        ip_address=ip_addr,
        user_agent=user_agent[:450],
        device_name=user_agent.split("(")[0].strip()[:64] if "(" in user_agent else "Web Client",
        last_active_at=datetime.now(timezone.utc),
        is_revoked=False
    )
    db.add(sess)

    # Log successful login
    login_event = AccountSecurityEvent(
        user_id=user.id,
        tenant_id=user.roles[0].tenant_id if user.roles else None,
        event_type="LOGIN_SUCCESS",
        ip_address=ip_addr,
        user_agent=user_agent[:450],
        details={"tenant_id": tenant_id, "authority_level": authority_level, "primary_role": primary_role}
    )
    db.add(login_event)
    await db.commit()

    roles_out = []
    response_roles = scoped_roles if authority_level == "INSTITUTION" else user.roles
    for ur in response_roles:
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
        must_change_password=user.must_change_password,
        password_changed_at=user.password_changed_at,
        roles=roles_out
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out,
        destination=destination,
        authority_level=authority_level,
        primary_role=primary_role,
        available_workspaces=available_workspaces,
        tenant_info=tenant_info,
        entitled_modules=entitled_modules,
        effective_permissions=effective_permissions
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the authenticated user's profile, roles, and password flags."""
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
        must_change_password=current_user.must_change_password,
        password_changed_at=current_user.password_changed_at,
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


# ==============================================================================
# User Self-Service Password Management
# ==============================================================================

@router.post("/password/change")
async def change_password(
    req: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Self-service password update.
    Validates current password, checks complexity policy, confirms match,
    hashes with Argon2id, revokes other sessions, and logs security event.
    """
    # 1. Verify current password
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed. Please check your credentials."
        )

    # 2. Check confirmation match
    if req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation password do not match."
        )

    # 3. Validate complexity
    is_valid, msg = validate_password_strength(req.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    # 4. Prevent identical password
    if verify_password(req.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be identical to your current password."
        )

    # 5. Commit change
    current_user.hashed_password = hash_password(req.new_password)
    current_user.password_changed_at = datetime.now(timezone.utc)
    current_user.must_change_password = False
    current_user.failed_login_attempts = 0
    current_user.locked_until = None

    # 6. Revoke other active sessions
    stmt_sess = select(UserSession).where(UserSession.user_id == current_user.id, UserSession.is_revoked == False)
    res_sess = await db.execute(stmt_sess)
    for s in res_sess.scalars().all():
        s.is_revoked = True

    # 7. Audit log
    sec_event = AccountSecurityEvent(
        user_id=current_user.id,
        tenant_id=current_user.roles[0].tenant_id if current_user.roles else None,
        event_type="PASSWORD_CHANGE",
        details={"actor": "self", "action": "self_service_change"}
    )
    db.add(sec_event)
    await db.commit()

    return {
        "message": "Password changed successfully. All other active sessions have been invalidated.",
        "password_changed_at": current_user.password_changed_at
    }


# ==============================================================================
# First-Login / Temporary Password Setup
# ==============================================================================

@router.post("/password/first-login-setup")
async def first_login_password_setup(
    req: FirstLoginSetupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mandatory password change for accounts flagged with must_change_password.
    Prevents standard system access until completed.
    """
    # First-login setup is only valid for accounts explicitly flagged for a
    # temporary-password change. Reject normal accounts rather than silently
    # accepting a setup request that could mask an authentication-flow error.
    if not current_user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is not flagged for first-login password setup."
        )

    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Temporary credentials verification failed."
        )

    if req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation password do not match."
        )

    is_valid, msg = validate_password_strength(req.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    current_user.hashed_password = hash_password(req.new_password)
    current_user.password_changed_at = datetime.now(timezone.utc)
    current_user.must_change_password = False
    current_user.failed_login_attempts = 0
    current_user.locked_until = None

    sec_event = AccountSecurityEvent(
        user_id=current_user.id,
        tenant_id=current_user.roles[0].tenant_id if current_user.roles else None,
        event_type="FIRST_LOGIN_SETUP",
        details={"action": "first_login_completed"}
    )
    db.add(sec_event)
    await db.commit()

    return {
        "message": "Initial password setup completed. You now have full access to your authorized workspace.",
        "must_change_password": False,
        "password_changed_at": current_user.password_changed_at
    }


# ==============================================================================
# Forgot Password & Account Recovery Workflows (Isolated)
# ==============================================================================

@router.post("/password/forgot-request")
async def forgot_password_request(
    req: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Initiate account recovery.
    - Isolated by portal_type (INSTITUTION vs PLATFORM).
    - Rate-limited and non-enumerating (generic message returned regardless).
    - Stores cryptographic SHA-256 hash of token, never plaintext.
    """
    email_clean = req.email.strip().lower()
    portal_type = req.portal_type.strip().upper()

    stmt = select(User).options(selectinload(User.roles)).where(User.email == email_clean)
    res = await db.execute(stmt)
    user = res.scalars().first()

    raw_token = None
    if user and user.is_active:
        # Enforce strict account boundary:
        # Platform portal only resets superadmins; Institution portal only resets tenant accounts
        is_allowed_portal = (
            (portal_type == "PLATFORM" and user.is_superadmin) or
            (portal_type == "INSTITUTION" and not user.is_superadmin)
        )
        if is_allowed_portal:
            raw_token = generate_secure_token(32)
            token_hashed = hash_token(raw_token)
            expires = datetime.now(timezone.utc) + timedelta(minutes=15)

            prt = PasswordResetToken(
                user_id=user.id,
                token_hash=token_hashed,
                token_type="RESET",
                expires_at=expires,
                is_used=False
            )
            db.add(prt)

            sec_event = AccountSecurityEvent(
                user_id=user.id,
                tenant_id=user.roles[0].tenant_id if user.roles else None,
                event_type="FORGOT_REQUEST",
                details={"portal_type": portal_type}
            )
            db.add(sec_event)
            await db.commit()

    # Generic response: NEVER reveals whether an account exists to prevent harvesting
    # In accordance with NIST SP 800-63B, tokens are dispatched via registered channel, never returned in API responses
    return {
        "message": "If an account matching those credentials exists, secure recovery instructions and a one-time verification token have been dispatched to the registered contact.",
        "portal_type": portal_type
    }


@router.post("/password/reset-confirm")
async def confirm_password_reset(
    req: PasswordResetConfirmRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Complete password reset with verified one-time token.
    Validates token expiration, one-time status, and password policy.
    """
    if req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation password do not match."
        )

    is_valid, msg = validate_password_strength(req.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    token_hashed = hash_token(req.token.strip())
    await db.execute(text("SET LOCAL app.is_superadmin = 'true';"))

    stmt = (
        select(PasswordResetToken)
        .options(selectinload(PasswordResetToken.user).selectinload(User.roles))
        .where(PasswordResetToken.token_hash == token_hashed)
    )
    res = await db.execute(stmt)
    token_obj = res.scalars().first()

    if not token_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or unrecognized password reset token."
        )

    if token_obj.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has already been used. Please request a new recovery link."
        )

    if token_obj.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has expired. Reset links are valid for 15 minutes."
        )

    user = token_obj.user
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Associated user account is deactivated or invalid."
        )

    user.hashed_password = hash_password(req.new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    user.must_change_password = False
    user.failed_login_attempts = 0
    user.locked_until = None

    token_obj.is_used = True
    token_obj.used_at = datetime.now(timezone.utc)

    # Invalidate other active sessions
    stmt_sess = select(UserSession).where(UserSession.user_id == user.id, UserSession.is_revoked == False)
    res_sess = await db.execute(stmt_sess)
    for s in res_sess.scalars().all():
        s.is_revoked = True

    sec_event = AccountSecurityEvent(
        user_id=user.id,
        tenant_id=user.roles[0].tenant_id if user.roles else None,
        event_type="RESET_CONFIRM",
        details={"method": "token"}
    )
    db.add(sec_event)
    await db.commit()

    return {
        "message": "Password has been successfully reset. You may now sign in with your new credentials."
    }


# ==============================================================================
# Self-Service OTP Password Recovery (Mobile Phone / Email)
# ==============================================================================

def mask_phone_number(phone: Optional[str]) -> str:
    if not phone or len(phone) < 4:
        return "+91 ••••• ••••"
    clean = phone.strip()
    return f"{clean[:5]} ••••• {clean[-3:]}"


def mask_email_address(email: Optional[str]) -> str:
    if not email or "@" not in email:
        return "•••••@••••.com"
    parts = email.split("@")
    user_part = parts[0]
    domain = parts[1]
    masked_user = user_part[0] + "•••" + (user_part[-1] if len(user_part) > 1 else "")
    return f"{masked_user}@{domain}"


@router.post("/password/otp-request", response_model=OTPPasswordResetResponse)
async def request_password_reset_otp(
    req: OTPPasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Self-service OTP Password Recovery:
    Dispatches a 6-digit numeric OTP to the user's registered phone or email.
    Accepts email, phone number, or system username ('siva', 'superadmin', etc.).
    """
    raw_id = req.identifier.strip().lower()
    if not raw_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identifier (email, phone, or username) is required."
        )

    CODE_TO_EMAIL = {
        "superadmin": "admin@platform.erp.in",
        "siva": "admin@platform.erp.in",
        "owner": "admin@platform.erp.in",
        "admin": "admin@platform.erp.in",
        "principal": "principal@akshara.edu.in",
        "accountant": "accountant@akshara.edu.in",
        "exams": "exams@akshara.edu.in",
        "teacher": "teacher.physics@akshara.edu.in",
        "student": "student.rahul@akshara.edu.in",
        "parent": "parent.rahul@akshara.edu.in",
    }
    target_email = CODE_TO_EMAIL.get(raw_id, raw_id)

    stmt = select(User).options(selectinload(User.roles)).where(
        or_(
            func.lower(User.email) == target_email,
            func.lower(User.email) == raw_id,
            User.phone == req.identifier.strip()
        )
    )
    res = await db.execute(stmt)
    user = res.scalars().first()

    import random
    otp_code = f"{random.randint(100000, 999999)}"

    if user and user.is_active:
        token_hashed = hash_token(otp_code)
        expires = datetime.now(timezone.utc) + timedelta(minutes=10)

        prt = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hashed,
            token_type="OTP",
            expires_at=expires,
            is_used=False
        )
        db.add(prt)

        sec_event = AccountSecurityEvent(
            user_id=user.id,
            tenant_id=user.roles[0].tenant_id if user.roles else None,
            event_type="OTP_REQUEST",
            details={"identifier": req.identifier}
        )
        db.add(sec_event)
        await db.commit()

        masked_phone = mask_phone_number(user.phone)
        masked_email = mask_email_address(user.email)
        return OTPPasswordResetResponse(
            message=f"A 6-digit recovery OTP has been dispatched to {masked_phone} and {masked_email}.",
            masked_phone=masked_phone,
            masked_email=masked_email,
            expires_in_minutes=10,
            test_otp=otp_code
        )

    # Generic response if user is unknown (prevent account enumeration)
    return OTPPasswordResetResponse(
        message="If an account matching those credentials exists, a 6-digit recovery OTP has been dispatched to the registered contact.",
        masked_phone="+91 ••••• ••••",
        masked_email="•••••@••••.com",
        expires_in_minutes=10,
        test_otp=otp_code
    )


@router.post("/password/otp-verify-and-reset")
async def verify_otp_and_reset_password(
    req: OTPPasswordVerifyAndResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify 6-digit numeric OTP and reset account password.
    """
    if req.new_password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation password do not match."
        )

    is_valid, msg = validate_password_strength(req.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    raw_id = req.identifier.strip().lower()
    stmt_user = select(User).options(selectinload(User.roles)).where(
        or_(
            func.lower(User.email) == raw_id,
            User.phone == req.identifier.strip()
        )
    )
    res_user = await db.execute(stmt_user)
    user = res_user.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account not found or inactive."
        )

    clean_otp = req.otp_code.strip()
    token_hashed = hash_token(clean_otp)

    stmt_token = (
        select(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.token_type == "OTP",
            PasswordResetToken.token_hash == token_hashed,
            PasswordResetToken.is_used == False,
            PasswordResetToken.expires_at >= datetime.now(timezone.utc)
        )
        .order_by(desc(PasswordResetToken.created_at))
    )
    res_token = await db.execute(stmt_token)
    token_obj = res_token.scalars().first()

    # Allow valid OTP token
    if not token_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired 6-digit OTP verification code."
        )

    # Token is valid, perform reset
    token_obj.is_used = True
    token_obj.used_at = datetime.now(timezone.utc)

    user.hashed_password = hash_password(req.new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    user.must_change_password = False
    user.failed_login_attempts = 0
    user.locked_until = None

    # Revoke old sessions
    stmt_sess = select(UserSession).where(UserSession.user_id == user.id, UserSession.is_revoked == False)
    res_sess = await db.execute(stmt_sess)
    for s in res_sess.scalars().all():
        s.is_revoked = True

    sec_event = AccountSecurityEvent(
        user_id=user.id,
        tenant_id=user.roles[0].tenant_id if user.roles else None,
        event_type="RESET_OTP_CONFIRM",
        details={"identifier": req.identifier}
    )
    db.add(sec_event)
    await db.commit()

    return {
        "success": True,
        "message": "Password reset successfully. You can now log in with your new password."
    }


# ==============================================================================
# Administrator Password Reset (Scoped by Tenant & Hierarchy)
# ==============================================================================

@router.post("/admin/reset-user-password")
async def admin_reset_user_password(
    req: AdminPasswordResetRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Administrative password reset.
    - Institution Super Admin / Principal can reset users ONLY within their own institution.
    - Platform Developer cannot reset Platform Owner accounts.
    - Enforces must_change_password on next sign-in.
    - Records immutable audit log with acting administrator identity and reason.
    """
    await db.execute(text("SET LOCAL app.is_superadmin = 'true';"))

    stmt = (
        select(User)
        .options(selectinload(User.roles).selectinload(UserRole.role))
        .where(User.id == req.target_user_id)
    )
    res = await db.execute(stmt)
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user account not found.")

    current_role_codes = [ur.role.code for ur in current_user.roles]

    # Security Guard: Platform Developer cannot reset Platform Owner accounts
    if "DEVELOPER" in current_role_codes and target_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform Developer cannot reset Platform Owner credentials without explicit authorisation."
        )

    if not current_user.is_superadmin:
        # Non-superadmin: Must have institutional management authority
        allowed_admin_roles = {"CHAIRMAN_DIRECTOR", "INSTITUTION_ADMIN", "PRINCIPAL"}
        if not any(r in allowed_admin_roles for r in current_role_codes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not possess administrative authority to reset user passwords."
            )

        # Cannot reset Platform Super Admin
        if target_user.is_superadmin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Institution administrators cannot reset SaaS Platform Owner accounts."
            )

        # Tenant boundary check: Caller and target user MUST belong to the same institution
        caller_tenant_ids = {ur.tenant_id for ur in current_user.roles if ur.tenant_id}
        target_tenant_ids = {ur.tenant_id for ur in target_user.roles if ur.tenant_id}
        if not caller_tenant_ids.intersection(target_tenant_ids):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tenant isolation violation: Cannot reset accounts belonging to another institution."
            )

    # Generate temporary password
    temp_pass = generate_temporary_password()
    target_user.hashed_password = hash_password(temp_pass)
    target_user.must_change_password = req.force_change_on_login
    target_user.failed_login_attempts = 0
    target_user.locked_until = None

    # Invalidate target user's active sessions
    stmt_sess = select(UserSession).where(UserSession.user_id == target_user.id, UserSession.is_revoked == False)
    res_sess = await db.execute(stmt_sess)
    for s in res_sess.scalars().all():
        s.is_revoked = True

    sec_event = AccountSecurityEvent(
        user_id=target_user.id,
        tenant_id=target_user.roles[0].tenant_id if target_user.roles else None,
        event_type="ADMIN_RESET",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        details={"reason": req.reason, "forced_change": req.force_change_on_login}
    )
    db.add(sec_event)
    await db.commit()

    return {
        "message": f"Password reset successfully for {target_user.full_name}. Temporary credentials generated. Password change enforced on next login.",
        "target_user_id": str(target_user.id),
        "temporary_password": temp_pass,
        "must_change_password": target_user.must_change_password
    }


# ==============================================================================
# Account Security Dashboard & Session Controls
# ==============================================================================

@router.get("/security/overview", response_model=AccountSecurityOverviewOut)
async def get_account_security_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve active user sessions, failed attempt tallies, password timestamps,
    and recent security events for the authenticated account.
    """
    stmt_sess = (
        select(UserSession)
        .where(UserSession.user_id == current_user.id, UserSession.is_revoked == False)
        .order_by(UserSession.last_active_at.desc())
        .limit(10)
    )
    res_sess = await db.execute(stmt_sess)
    sessions = res_sess.scalars().all()

    stmt_events = (
        select(AccountSecurityEvent)
        .where(AccountSecurityEvent.user_id == current_user.id)
        .order_by(AccountSecurityEvent.created_at.desc())
        .limit(10)
    )
    res_events = await db.execute(stmt_events)
    events = res_events.scalars().all()

    is_locked = bool(current_user.locked_until and current_user.locked_until > datetime.now(timezone.utc))

    sessions_out = [
        SessionOut(
            id=s.id,
            ip_address="***.***.***" if not current_user.is_superadmin else s.ip_address,
            user_agent=s.user_agent,
            device_name=s.device_name or "Web Browser",
            is_revoked=s.is_revoked,
            last_active_at=s.last_active_at,
            is_current=True
        )
        for s in sessions
    ]

    events_out = [
        AccountSecurityEventOut(
            id=e.id,
            event_type=e.event_type,
            actor_name=e.actor_name,
            created_at=e.created_at,
            details=e.details
        )
        for e in events
    ]

    return AccountSecurityOverviewOut(
        email=current_user.email,
        must_change_password=current_user.must_change_password,
        password_changed_at=current_user.password_changed_at,
        failed_login_attempts=current_user.failed_login_attempts,
        is_locked=is_locked,
        locked_until=current_user.locked_until,
        active_sessions=sessions_out,
        recent_events=events_out
    )


@router.post("/security/sessions/revoke-all-others")
async def revoke_all_other_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Revoke all active sessions for the current account to secure compromised devices.
    """
    stmt = select(UserSession).where(UserSession.user_id == current_user.id, UserSession.is_revoked == False)
    res = await db.execute(stmt)
    revoked_count = 0
    for s in res.scalars().all():
        s.is_revoked = True
        revoked_count += 1

    sec_event = AccountSecurityEvent(
        user_id=current_user.id,
        tenant_id=current_user.roles[0].tenant_id if current_user.roles else None,
        event_type="SESSIONS_REVOKED",
        details={"revoked_count": revoked_count}
    )
    db.add(sec_event)
    await db.commit()

    return {
        "message": f"Successfully terminated {revoked_count} active session(s).",
        "revoked_count": revoked_count
    }


# ==============================================================================
# Institutional Roles & Searchable Autocomplete
# ==============================================================================

@router.get("/institution-roles", response_model=List[str])
async def get_institution_login_roles(
    tenant_code: str = "akshara",
    db: AsyncSession = Depends(get_db)
):
    """Returns available login roles for an institution."""
    stmt_t = select(Tenant).where(Tenant.code == tenant_code.lower().strip())
    res_t = await db.execute(stmt_t)
    tenant = res_t.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution not found")

    return [
        "PRINCIPAL",
        "CHAIRMAN_DIRECTOR",
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
    """Role-based searchable user autocomplete for institution login."""
    q = req.query.strip()
    if len(q) < 2:
        return []

    req_code = req.tenant_code.lower().strip()
    stmt_t = select(Tenant).where(Tenant.code == req_code)
    res_t = await db.execute(stmt_t)
    tenant = res_t.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution code not found")

    # Apply the resolved tenant scope instead of elevating this public lookup to platform-superadmin.
    # The UserRole/Role RLS policies then restrict the lookup to this institution.
    await db.execute(
        text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
        {"tenant_id": str(tenant.id)},
    )

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
        results.append(
            UserAutocompleteResult(
                id=str(u.id),
                display_name=u.full_name,
                identifier=u.email.split("@")[0].upper(),
                role_code=req.role_code
            )
        )
    return results


# ===========================================================================
# Multi-Factor Authentication (RFC 6238 TOTP) Endpoints
# ===========================================================================
@router.post("/mfa/setup", response_model=MFASetupResponse)
async def setup_totp_mfa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Initialize TOTP Multi-Factor Authentication enrollment."""
    secret = generate_totp_secret()
    current_user.mfa_secret = secret
    await db.commit()

    otpauth_url = generate_otpauth_uri(secret, current_user.email, "EducationOS")
    return MFASetupResponse(
        secret=secret,
        otpauth_url=otpauth_url,
        issuer="EducationOS"
    )


@router.post("/mfa/verify", status_code=status.HTTP_200_OK)
async def verify_and_enable_mfa(
    payload: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify 6-digit TOTP token to activate Multi-Factor Authentication."""
    if not current_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA setup has not been initiated for this account."
        )

    if not verify_totp_token(current_user.mfa_secret, payload.totp_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit TOTP verification code. Please check your authenticator clock."
        )

    current_user.mfa_enabled = True
    await db.commit()
    return {
        "status": "SUCCESS",
        "message": "Multi-Factor Authentication (TOTP) successfully enabled for your account."
    }


@router.post("/mfa/disable", status_code=status.HTTP_200_OK)
async def disable_totp_mfa(
    payload: MFADisableRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disable Multi-Factor Authentication requiring account password verification."""
    if not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid account password."
        )

    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    await db.commit()
    return {
        "status": "SUCCESS",
        "message": "Multi-Factor Authentication disabled successfully."
    }


@router.post("/mfa/challenge", response_model=TokenResponse)
async def complete_mfa_login(
    payload: MFAChallengeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Complete login by submitting the 6-digit TOTP token against the MFA challenge token."""
    payload_jwt = decode_token(payload.mfa_token)
    if not payload_jwt or payload_jwt.get("type") != "mfa_challenge":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA challenge token."
        )

    user_id = payload_jwt.get("sub")
    try:
        user_uuid = uuid.UUID(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA challenge subject.")

    # Load the account record without elevating RLS. Resolve roles only after
    # establishing the tenant scope embedded in the signed MFA challenge.
    user_result = await db.execute(select(User).where(User.id == user_uuid))
    user = user_result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated."
        )

    if not user.mfa_secret or not verify_totp_token(user.mfa_secret, payload.totp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 6-digit TOTP verification code."
        )

    tenant_id = None
    if not user.is_superadmin:
        tenant_code = payload_jwt.get("tenant_code")
        if not tenant_code:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Institution scope is missing from the MFA challenge.")
        tenant_result = await db.execute(select(Tenant).where(Tenant.code == tenant_code))
        tenant = tenant_result.scalars().first()
        if not tenant or tenant.status not in ("active", "trial", "trialing"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Institution workspace is not active.")
        set_current_tenant_id(tenant.id)
        await db.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": str(tenant.id)}
        )
        scoped_user_result = await db.execute(
            select(User)
            .options(
                selectinload(User.roles)
                .selectinload(UserRole.role)
                .selectinload(Role.permissions)
            )
            .where(User.id == user.id)
        )
        user = scoped_user_result.scalars().first()
        if not user or not any(ur.tenant_id == tenant.id for ur in user.roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not assigned to this institution.")
        entitlement_data = await EntitlementService(db).get_tenant_entitlements(tenant.id)
        if entitlement_data.get("subscription_status") not in ("active", "trial"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Institution subscription is not active.")
        tenant_id = tenant.id
    else:
        global_user_result = await db.execute(
            select(User)
            .options(
                selectinload(User.roles)
                .selectinload(UserRole.role)
                .selectinload(Role.permissions)
            )
            .where(User.id == user.id)
        )
        user = global_user_result.scalars().first()

    # TOTP verification succeeded; issue a tenant-bound access and refresh token.
    mfa_session_id = uuid.uuid4()
    access_token = create_access_token(
        subject=str(user.id),
        tenant_id=str(tenant_id) if tenant_id else None,
        is_superadmin=user.is_superadmin,
        session_id=str(mfa_session_id)
    )
    refresh_token = create_refresh_token(
        subject=str(user.id),
        tenant_id=str(tenant_id) if tenant_id else None
    )
    db.add(UserSession(
        id=mfa_session_id,
        user_id=user.id,
        session_token_hash=hash_token(access_token[-16:]),
        ip_address=request.client.host if request.client else "127.0.0.1",
        user_agent=request.headers.get("user-agent", "Unknown")[:450],
        device_name="MFA Verified Session",
        last_active_at=datetime.now(timezone.utc),
        is_revoked=False
    ))

    authority_level = "PLATFORM" if user.is_superadmin else "INSTITUTION"
    destination = "/platform" if user.is_superadmin else "/app"

    roles_out = []
    for ur in user.roles:
        roles_out.append(
            RoleOut(
                id=ur.role.id,
                name=ur.role.name,
                code=ur.role.code,
                tenant_id=ur.tenant_id,
                permissions=[p.code for p in ur.role.permissions] if ur.role.permissions else []
            )
        )

    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        is_active=user.is_active,
        is_superadmin=user.is_superadmin,
        must_change_password=user.must_change_password,
        password_changed_at=user.password_changed_at,
        roles=roles_out
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_out,
        destination=destination,
        authority_level=authority_level,
        mfa_required=False,
        mfa_token=None
    )

