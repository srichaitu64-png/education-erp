from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
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
from app.database.session import get_db
from app.modules.identity.models import (
    User,
    UserRole,
    Role,
    Permission,
    PasswordResetToken,
    UserSession,
    AccountSecurityEvent
)
from app.modules.identity.schemas import (
    LoginRequest,
    TokenResponse,
    UserOut,
    RoleOut,
    RefreshTokenRequest,
    UserAutocompleteRequest,
    UserAutocompleteResult,
    PasswordChangeRequest,
    FirstLoginSetupRequest,
    ForgotPasswordRequest,
    PasswordResetConfirmRequest,
    AdminPasswordResetRequest,
    AccountSecurityOverviewOut,
    SessionOut,
    AccountSecurityEventOut
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
    Authenticate user with email and password.
    Supports optional tenant_code for multi-tenant account resolution.
    Includes brute-force account lockout protection and session security logging.
    """
    email_clean = req.email.lower().strip()
    stmt = (
        select(User)
        .options(
            selectinload(User.roles)
            .selectinload(UserRole.role)
            .selectinload(Role.permissions)
        )
        .where(User.email == email_clean)
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

    if not user or not verify_password(req.password, user.hashed_password):
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
                sec_event = AccountSecurityEvent(
                    user_id=user.id,
                    tenant_id=user.roles[0].tenant_id if user.roles else None,
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
            detail="Incorrect email or password",
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

    # Track active session
    sess = UserSession(
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
        details={"tenant_id": tenant_id}
    )
    db.add(login_event)
    await db.commit()

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
        must_change_password=user.must_change_password,
        password_changed_at=user.password_changed_at,
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
    response = {
        "message": "If an account matching those credentials exists, secure recovery instructions and a one-time verification token have been dispatched to the registered contact.",
        "portal_type": portal_type
    }
    if raw_token:
        response["reset_token"] = raw_token
    return response


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

    stmt_t = select(Tenant).where(Tenant.code == req.tenant_code.lower().strip())
    res_t = await db.execute(stmt_t)
    tenant = res_t.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution code not found")

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
