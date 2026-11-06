import uuid
from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenants.models import Tenant
from app.modules.identity.models import User, Role, UserRole, PasswordResetToken, UserSession
from app.core.security import create_access_token, hash_password, hash_token, generate_secure_token


@pytest.fixture
async def setup_security_fixture(db_session: AsyncSession):
    """
    Creates test tenants, roles, and users across multi-tenant boundaries:
    - Platform Owner (is_superadmin=True)
    - Platform Developer (DEVELOPER role, is_superadmin=False)
    - Tenant A:
        - Tenant A Admin (INSTITUTION_ADMIN)
        - Tenant A Teacher (TEACHER)
        - Tenant A Student (STUDENT)
    - Tenant B:
        - Tenant B Admin (INSTITUTION_ADMIN)
        - Tenant B Teacher (TEACHER)
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    # 1. Tenants
    tenant_a = Tenant(
        name="Alpha International School",
        code=f"alpha_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="admin@alpha.edu",
        status="active"
    )
    tenant_b = Tenant(
        name="Beta University College",
        code=f"beta_{uuid.uuid4().hex[:6]}",
        institution_type="degree",
        email="admin@beta.edu",
        status="active"
    )
    db_session.add_all([tenant_a, tenant_b])
    await db_session.flush()

    # 2. Roles
    role_platform_dev = Role(name="Platform Developer", code="DEVELOPER", is_system=True)
    role_inst_admin = Role(name="Institution Admin", code="INSTITUTION_ADMIN", is_system=True)
    role_teacher = Role(name="Teacher", code="TEACHER", is_system=True)
    role_student = Role(name="Student", code="STUDENT", is_system=True)
    db_session.add_all([role_platform_dev, role_inst_admin, role_teacher, role_student])
    await db_session.flush()

    # 3. Users
    platform_owner = User(
        email=f"owner_{uuid.uuid4().hex[:6]}@educationos.internal",
        hashed_password=hash_password("Owner#Pass2026"),
        full_name="Platform Owner Admin",
        is_active=True,
        is_superadmin=True
    )
    platform_dev = User(
        email=f"dev_{uuid.uuid4().hex[:6]}@educationos.internal",
        hashed_password=hash_password("Dev#Pass2026"),
        full_name="Platform Developer",
        is_active=True,
        is_superadmin=False
    )
    tenant_a_admin = User(
        email=f"admin_a_{uuid.uuid4().hex[:6]}@alpha.edu",
        hashed_password=hash_password("Alpha#Admin2026"),
        full_name="Alpha Administrator",
        is_active=True,
        is_superadmin=False
    )
    tenant_a_teacher = User(
        email=f"teacher_a_{uuid.uuid4().hex[:6]}@alpha.edu",
        hashed_password=hash_password("Alpha#Teach2026"),
        full_name="Alpha Teacher",
        is_active=True,
        is_superadmin=False
    )
    tenant_a_student = User(
        email=f"student_a_{uuid.uuid4().hex[:6]}@alpha.edu",
        hashed_password=hash_password("Alpha#Stud2026"),
        full_name="Alpha Student",
        is_active=True,
        is_superadmin=False
    )
    tenant_b_admin = User(
        email=f"admin_b_{uuid.uuid4().hex[:6]}@beta.edu",
        hashed_password=hash_password("Beta#Admin2026"),
        full_name="Beta Administrator",
        is_active=True,
        is_superadmin=False
    )
    tenant_b_teacher = User(
        email=f"teacher_b_{uuid.uuid4().hex[:6]}@beta.edu",
        hashed_password=hash_password("Beta#Teach2026"),
        full_name="Beta Teacher",
        is_active=True,
        is_superadmin=False
    )

    db_session.add_all([
        platform_owner, platform_dev,
        tenant_a_admin, tenant_a_teacher, tenant_a_student,
        tenant_b_admin, tenant_b_teacher
    ])
    await db_session.flush()

    # User Roles
    db_session.add_all([
        UserRole(user_id=platform_dev.id, role_id=role_platform_dev.id, tenant_id=None),
        UserRole(user_id=tenant_a_admin.id, role_id=role_inst_admin.id, tenant_id=tenant_a.id),
        UserRole(user_id=tenant_a_teacher.id, role_id=role_teacher.id, tenant_id=tenant_a.id),
        UserRole(user_id=tenant_a_student.id, role_id=role_student.id, tenant_id=tenant_a.id),
        UserRole(user_id=tenant_b_admin.id, role_id=role_inst_admin.id, tenant_id=tenant_b.id),
        UserRole(user_id=tenant_b_teacher.id, role_id=role_teacher.id, tenant_id=tenant_b.id),
    ])
    await db_session.commit()

    return {
        "tenant_a": tenant_a,
        "tenant_b": tenant_b,
        "platform_owner": platform_owner,
        "platform_dev": platform_dev,
        "tenant_a_admin": tenant_a_admin,
        "tenant_a_teacher": tenant_a_teacher,
        "tenant_a_student": tenant_a_student,
        "tenant_b_admin": tenant_b_admin,
        "tenant_b_teacher": tenant_b_teacher,
    }


@pytest.mark.asyncio
async def test_01_self_service_password_change_success(client, setup_security_fixture, db_session: AsyncSession):
    """1. Self-service password change with correct credentials succeeds."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    token = create_access_token(subject=str(teacher.id), tenant_id=str(setup_security_fixture["tenant_a"].id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/password/change",
        headers=headers,
        json={
            "current_password": "Alpha#Teach2026",
            "new_password": "NewStrong#Password2026",
            "confirm_password": "NewStrong#Password2026"
        }
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "successfully" in data["message"].lower()

    # Verify user in DB has updated timestamp
    await db_session.refresh(teacher)
    assert teacher.password_changed_at is not None
    assert teacher.must_change_password is False


@pytest.mark.asyncio
async def test_02_incorrect_current_password_rejected(client, setup_security_fixture):
    """2. Incorrect current password rejected with 400 Bad Request."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    token = create_access_token(subject=str(teacher.id), tenant_id=str(setup_security_fixture["tenant_a"].id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/password/change",
        headers=headers,
        json={
            "current_password": "WrongPassword#999",
            "new_password": "BrandNew#Pass2026",
            "confirm_password": "BrandNew#Pass2026"
        }
    )
    assert resp.status_code == 400
    assert "verification failed" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_03_weak_password_rejected_by_policy(client, setup_security_fixture):
    """3. Weak password rejected according to enterprise policy."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    token = create_access_token(subject=str(teacher.id), tenant_id=str(setup_security_fixture["tenant_a"].id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token}"}

    weak_passwords = [
        "short1!",       # too short (< 8 chars)
        "alllowercase1!", # missing uppercase
        "ALLUPPERCASE1!", # missing lowercase
        "NoDigitsHere!",  # missing digits
        "NoSpecialChar1", # missing special char
        "password123",   # common weak password
    ]

    for weak_p in weak_passwords:
        resp = await client.post(
            "/api/v1/auth/password/change",
            headers=headers,
            json={
                "current_password": "Alpha#Teach2026",
                "new_password": weak_p,
                "confirm_password": weak_p
            }
        )
        assert resp.status_code == 400, f"Expected rejection for '{weak_p}', got {resp.status_code}"


@pytest.mark.asyncio
async def test_04_mismatched_confirmation_rejected(client, setup_security_fixture):
    """4. Mismatched confirmation password rejected with 400 Bad Request."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    token = create_access_token(subject=str(teacher.id), tenant_id=str(setup_security_fixture["tenant_a"].id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/password/change",
        headers=headers,
        json={
            "current_password": "Alpha#Teach2026",
            "new_password": "Valid#Password2026",
            "confirm_password": "Different#Password2026"
        }
    )
    assert resp.status_code == 400
    assert "do not match" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_05_expired_reset_token_rejected(client, setup_security_fixture, db_session: AsyncSession):
    """5. Expired reset token rejected with 400 Bad Request."""
    student = setup_security_fixture["tenant_a_student"]
    raw_token = generate_secure_token(32)
    token_hashed = hash_token(raw_token)

    # Insert an expired token
    expired_token = PasswordResetToken(
        user_id=student.id,
        token_hash=token_hashed,
        token_type="RESET",
        expires_at=datetime.now(timezone.utc) - timedelta(minutes=10),
        is_used=False
    )
    db_session.add(expired_token)
    await db_session.commit()

    resp = await client.post(
        "/api/v1/auth/password/reset-confirm",
        json={
            "token": raw_token,
            "new_password": "BrandNew#ResetPass2026",
            "confirm_password": "BrandNew#ResetPass2026"
        }
    )
    assert resp.status_code == 400
    assert "expired" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_06_reused_reset_token_rejected(client, setup_security_fixture, db_session: AsyncSession):
    """6. Reused reset token rejected with 400 Bad Request."""
    student = setup_security_fixture["tenant_a_student"]
    raw_token = generate_secure_token(32)
    token_hashed = hash_token(raw_token)

    used_token = PasswordResetToken(
        user_id=student.id,
        token_hash=token_hashed,
        token_type="RESET",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        is_used=True,
        used_at=datetime.now(timezone.utc) - timedelta(minutes=2)
    )
    db_session.add(used_token)
    await db_session.commit()

    resp = await client.post(
        "/api/v1/auth/password/reset-confirm",
        json={
            "token": raw_token,
            "new_password": "BrandNew#ResetPass2026",
            "confirm_password": "BrandNew#ResetPass2026"
        }
    )
    assert resp.status_code == 400
    assert "already been used" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_07_institution_admin_cannot_reset_platform_superadmin(client, setup_security_fixture):
    """7. Institution admin cannot reset platform superadmin account (403 Forbidden)."""
    admin_a = setup_security_fixture["tenant_a_admin"]
    platform_owner = setup_security_fixture["platform_owner"]
    tenant_a = setup_security_fixture["tenant_a"]

    token = create_access_token(
        subject=str(admin_a.id),
        tenant_id=str(tenant_a.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/admin/reset-user-password",
        headers=headers,
        json={
            "target_user_id": str(platform_owner.id),
            "reason": "Unauthorized attempt to reset platform owner"
        }
    )
    assert resp.status_code == 403
    assert "platform owner" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_08_platform_developer_cannot_reset_platform_owner(client, setup_security_fixture):
    """8. Platform Developer cannot reset Platform Owner credentials (403 Forbidden)."""
    platform_dev = setup_security_fixture["platform_dev"]
    platform_owner = setup_security_fixture["platform_owner"]

    token = create_access_token(
        subject=str(platform_dev.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/admin/reset-user-password",
        headers=headers,
        json={
            "target_user_id": str(platform_owner.id),
            "reason": "Platform dev attempting owner reset"
        }
    )
    assert resp.status_code == 403
    assert "platform developer cannot reset platform owner" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_09_parent_or_student_cannot_reset_other_accounts(client, setup_security_fixture):
    """9. Non-administrative users (student, parent, teacher) receive 403 when invoking admin reset."""
    student_a = setup_security_fixture["tenant_a_student"]
    teacher_a = setup_security_fixture["tenant_a_teacher"]
    tenant_a = setup_security_fixture["tenant_a"]

    token = create_access_token(
        subject=str(student_a.id),
        tenant_id=str(tenant_a.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/admin/reset-user-password",
        headers=headers,
        json={
            "target_user_id": str(teacher_a.id),
            "reason": "Student attempt"
        }
    )
    assert resp.status_code == 403
    assert "authority" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_10_cross_tenant_reset_rejected(client, setup_security_fixture):
    """10. Tenant A Admin cannot reset user belonging to Tenant B (403 Forbidden)."""
    admin_a = setup_security_fixture["tenant_a_admin"]
    teacher_b = setup_security_fixture["tenant_b_teacher"]
    tenant_a = setup_security_fixture["tenant_a"]

    token = create_access_token(
        subject=str(admin_a.id),
        tenant_id=str(tenant_a.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/admin/reset-user-password",
        headers=headers,
        json={
            "target_user_id": str(teacher_b.id),
            "reason": "Cross-tenant intrusion attempt"
        }
    )
    assert resp.status_code == 403
    assert "tenant isolation violation" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_11_brute_force_account_lockout(client, setup_security_fixture, db_session: AsyncSession):
    """11. 5 failed login attempts causes account lockout for 15 minutes."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    teacher.failed_login_attempts = 0
    teacher.locked_until = None
    await db_session.commit()

    # Perform 5 consecutive failed logins
    for i in range(5):
        resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": teacher.email,
                "password": f"InvalidPassword#{i}"
            }
        )
        assert resp.status_code == 401

    # Verify user state in DB is now locked
    await db_session.refresh(teacher)
    assert teacher.failed_login_attempts >= 5
    assert teacher.locked_until is not None
    assert teacher.locked_until > datetime.now(timezone.utc)

    # 6th attempt must be rejected with 403 Forbidden or 423 Locked
    resp_locked = await client.post(
        "/api/v1/auth/login",
        json={
            "email": teacher.email,
            "password": "Alpha#Teach2026"
        }
    )
    assert resp_locked.status_code in (403, 423)
    assert "locked" in resp_locked.json()["detail"].lower()


@pytest.mark.asyncio
async def test_12_first_login_mandatory_password_setup(client, setup_security_fixture, db_session: AsyncSession):
    """12. First-login credentials flagged with must_change_password enforced."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    teacher.must_change_password = True
    await db_session.commit()

    token = create_access_token(subject=str(teacher.id), tenant_id=str(setup_security_fixture["tenant_a"].id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token}"}

    # Verify profile reports must_change_password=True
    me_resp = await client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["must_change_password"] is True

    # Complete first-login setup
    setup_resp = await client.post(
        "/api/v1/auth/password/first-login-setup",
        headers=headers,
        json={
            "current_password": "Alpha#Teach2026",
            "new_password": "FirstLogin#Completed2026",
            "confirm_password": "FirstLogin#Completed2026"
        }
    )
    assert setup_resp.status_code == 200
    assert setup_resp.json()["must_change_password"] is False

    await db_session.refresh(teacher)
    assert teacher.must_change_password is False


@pytest.mark.asyncio
async def test_13_session_revocation_terminates_active_sessions(client, setup_security_fixture, db_session: AsyncSession):
    """13. Session revocation terminates active sessions and records security event."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    token = create_access_token(subject=str(teacher.id), tenant_id=str(setup_security_fixture["tenant_a"].id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token}"}

    # Insert a dummy session
    session_1 = UserSession(
        user_id=teacher.id,
        session_token_hash="dummy_hash_1",
        ip_address="192.168.1.50",
        user_agent="Firefox Linux",
        device_name="Workstation A",
        is_revoked=False,
        last_active_at=datetime.now(timezone.utc)
    )
    session_2 = UserSession(
        user_id=teacher.id,
        session_token_hash="dummy_hash_2",
        ip_address="192.168.1.51",
        user_agent="Mobile Chrome",
        device_name="Smartphone B",
        is_revoked=False,
        last_active_at=datetime.now(timezone.utc)
    )
    db_session.add_all([session_1, session_2])
    await db_session.commit()

    # Call revoke all others
    revoke_resp = await client.post(
        "/api/v1/auth/security/sessions/revoke-all-others",
        headers=headers
    )
    assert revoke_resp.status_code == 200
    msg = revoke_resp.json()["message"].lower()
    assert "terminated" in msg or "revoked" in msg

    # Verify both sessions marked is_revoked = True
    await db_session.refresh(session_1)
    await db_session.refresh(session_2)
    assert session_1.is_revoked is True
    assert session_2.is_revoked is True


@pytest.mark.asyncio
async def test_14_unauthorized_tenant_selection_rejected(client, setup_security_fixture):
    """14. Tenant A member attempting login with Tenant B code is rejected with 403 Forbidden."""
    teacher_a = setup_security_fixture["tenant_a_teacher"]
    tenant_b = setup_security_fixture["tenant_b"]

    resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": teacher_a.email,
            "password": "Alpha#Teach2026",
            "tenant_code": tenant_b.code
        }
    )
    assert resp.status_code == 403
    assert "unauthorized tenant selection" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_15_first_login_setup_rejected_when_not_flagged(client, setup_security_fixture, db_session: AsyncSession):
    """15. Calling first-login setup on account with must_change_password=False is rejected (400)."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    teacher.must_change_password = False
    await db_session.commit()

    token = create_access_token(subject=str(teacher.id), tenant_id=str(setup_security_fixture["tenant_a"].id), is_superadmin=False)
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post(
        "/api/v1/auth/password/first-login-setup",
        headers=headers,
        json={
            "current_password": "Alpha#Teach2026",
            "new_password": "NewStrong#Pass2026",
            "confirm_password": "NewStrong#Pass2026"
        }
    )
    assert resp.status_code == 400
    assert "not flagged" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_16_revoked_session_jwt_rejected_at_endpoint(client, setup_security_fixture, db_session: AsyncSession):
    """16. JWT carrying a revoked session ID is rejected immediately with 401 Unauthorized."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    session_id = uuid.uuid4()

    # Create active session in DB
    user_sess = UserSession(
        id=session_id,
        user_id=teacher.id,
        session_token_hash="dummy_token_hash",
        ip_address="127.0.0.1",
        last_active_at=datetime.now(timezone.utc),
        is_revoked=False
    )
    db_session.add(user_sess)
    await db_session.commit()

    # Issue access token bound to session_id
    token = create_access_token(
        subject=str(teacher.id),
        tenant_id=str(setup_security_fixture["tenant_a"].id),
        session_id=str(session_id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Request succeeds while session is active
    resp_valid = await client.get("/api/v1/auth/me", headers=headers)
    assert resp_valid.status_code == 200

    # Revoke the session
    user_sess.is_revoked = True
    await db_session.commit()

    # Old JWT token must now be rejected with 401 Unauthorized
    resp_revoked = await client.get("/api/v1/auth/me", headers=headers)
    assert resp_revoked.status_code == 401
    assert "revoked" in resp_revoked.json()["detail"].lower()


@pytest.mark.asyncio
async def test_17_first_login_gate_blocks_general_endpoints(client, setup_security_fixture, db_session: AsyncSession):
    """17. User with must_change_password=True is blocked from general endpoints (403)."""
    teacher = setup_security_fixture["tenant_a_teacher"]
    tenant_a = setup_security_fixture["tenant_a"]
    teacher.must_change_password = True
    await db_session.commit()

    token = create_access_token(
        subject=str(teacher.id),
        tenant_id=str(tenant_a.id),
        is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Allowed endpoint: /api/v1/auth/me
    resp_me = await client.get("/api/v1/auth/me", headers=headers)
    assert resp_me.status_code == 200

    # Blocked endpoint: /api/v1/academic/sections
    resp_blocked = await client.get("/api/v1/academic/sections", headers=headers)
    assert resp_blocked.status_code == 403
    assert "password setup required" in resp_blocked.json()["detail"].lower()

