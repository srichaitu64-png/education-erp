import uuid
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.modules.tenants.models import Tenant
from app.modules.identity.models import User, Role, UserRole
from app.core.security import hash_password

@pytest.mark.asyncio
async def test_01_platform_owner_universal_login(client: httpx.AsyncClient):
    """
    Requirement 1 & 2: Platform Owner signs in via universal /login using either username or email.
    Backend identifies root authority, routes to /platform, and enforces PLATFORM authority.
    """
    # 1. Login with username
    res1 = await client.post("/api/v1/auth/login", json={
        "username": "admin@platform.erp.in",
        "password": "AdminSecurePassword2026!"
    })
    assert res1.status_code == 200, f"Login failed: {res1.text}"
    data1 = res1.json()
    assert data1["authority_level"] == "PLATFORM"
    assert data1["destination"] == "/platform"
    assert data1["primary_role"] == "SUPER_ADMIN"
    assert data1["user"]["is_superadmin"] is True
    assert "access_token" in data1
    assert "refresh_token" in data1

    # 2. Login with email
    res2 = await client.post("/api/v1/auth/login", json={
        "username": "admin@platform.erp.in",
        "password": "AdminSecurePassword2026!"
    })
    assert res2.status_code == 200, f"Login failed: {res2.text}"
    data2 = res2.json()
    assert data2["authority_level"] == "PLATFORM"
    assert data2["destination"] == "/platform"
    assert data2["primary_role"] == "SUPER_ADMIN"
    assert data2["user"]["is_superadmin"] is True


@pytest.mark.asyncio
async def test_02_all_institutional_roles_universal_login(client: httpx.AsyncClient):
    """
    Requirement 1 & 2: Institutional users sign in via universal /login without selecting role or tenant.
    Backend resolves identity, tenant, and primary role, returning exact destination URL.
    """
    test_personas = [
        ("chairman@ourschool.edu.in", "ChairmanSecure2026!", "CHAIRMAN_DIRECTOR", "/app"),
        ("chairman@ourschool.edu.in", "ChairmanSecure2026!", "CHAIRMAN_DIRECTOR", "/app"),
        ("principal@ourschool.edu.in", "PrincipalSecurePassword2026!", "PRINCIPAL", "/app"),
        ("principal@ourschool.edu.in", "PrincipalSecurePassword2026!", "PRINCIPAL", "/app"),
        ("accountant@ourschool.edu.in", "AccountantSecure2026!", "ACCOUNTANT", "/app"),
        ("accountant@ourschool.edu.in", "AccountantSecure2026!", "ACCOUNTANT", "/app"),
        ("exams@ourschool.edu.in", "ExamController2026!", "EXAM_CONTROLLER", "/app"),
        ("exams@ourschool.edu.in", "ExamController2026!", "EXAM_CONTROLLER", "/app"),
        ("teacher.physics@ourschool.edu.in", "TeacherPhysics2026!", "TEACHER", "/app"),
        ("teacher.physics@ourschool.edu.in", "TeacherPhysics2026!", "TEACHER", "/app"),
        ("librarian@ourschool.edu.in", "LibrarianSecure2026!", "LIBRARIAN", "/app"),
        ("librarian@ourschool.edu.in", "LibrarianSecure2026!", "LIBRARIAN", "/app"),
        ("student.rahul@ourschool.edu.in", "StudentRahul2026!", "STUDENT", "/app"),
        ("student.rahul@ourschool.edu.in", "StudentRahul2026!", "STUDENT", "/app"),
        ("parent.rahul@ourschool.edu.in", "ParentRahul2026!", "PARENT", "/app"),
        ("parent.rahul@ourschool.edu.in", "ParentRahul2026!", "PARENT", "/app"),
    ]

    for identifier, password, expected_role, expected_dest in test_personas:
        res = await client.post("/api/v1/auth/login", json={
            "username": identifier,
            "password": password,
            "tenant_code": "our-school-demo"
        })
        assert res.status_code == 200, f"Persona login failed for {identifier}: {res.text}"
        data = res.json()
        assert data["authority_level"] == "INSTITUTION", f"Expected INSTITUTION authority for {identifier}"
        assert data["primary_role"] == expected_role, f"Role mismatch for {identifier}: got {data['primary_role']}, expected {expected_role}"
        assert data["destination"] == expected_dest, f"Destination mismatch for {identifier}: got {data['destination']}, expected {expected_dest}"
        assert data["tenant_info"] is not None
        assert data["tenant_info"]["code"] == "our-school-demo"
        assert data["user"]["is_superadmin"] is False


@pytest.mark.asyncio
async def test_03_invalid_password_returns_401(client: httpx.AsyncClient):
    """
    Invalid credentials must return 401 with generic error message.
    """
    res = await client.post("/api/v1/auth/login", json={
        "username": "principal@ourschool.edu.in",
        "password": "WrongPassword999!",
        "tenant_code": "our-school-demo"
    })
    assert res.status_code == 401
    assert "username or password" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_04_brute_force_account_lockout(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    5 failed login attempts triggers brute force lockout (HTTP 403 / 429).
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    test_user_email = f"brute_test_{uuid.uuid4().hex[:6]}@ourschool.edu.in"
    test_user = User(
        email=test_user_email,
        hashed_password=hash_password("RealSecurePassword123!"),
        full_name="Brute Test User",
        is_active=True,
        is_superadmin=False,
        failed_login_attempts=0
    )
    db_session.add(test_user)
    await db_session.commit()

    # Fail 4 times -> 401
    for attempt in range(4):
        res = await client.post("/api/v1/auth/login", json={
            "username": test_user_email,
            "password": "WrongPassword!"
        })
        assert res.status_code == 401

    # 5th failure -> triggers lockout
    res5 = await client.post("/api/v1/auth/login", json={
        "username": test_user_email,
        "password": "WrongPassword!"
    })
    assert res5.status_code in (401, 403, 429)

    # Subsequent attempt while locked -> rejected with lockout detail
    res6 = await client.post("/api/v1/auth/login", json={
        "username": test_user_email,
        "password": "WrongPassword!"
    })
    assert res6.status_code in (403, 429)
    assert "locked" in res6.json()["detail"].lower()


@pytest.mark.asyncio
async def test_05_suspended_tenant_login_blocked(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Users belonging to a suspended institution are blocked at login (HTTP 403).
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    suspended_tenant = Tenant(
        name="Suspended Model School",
        code=f"susp_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="admin@suspended.edu",
        status="suspended"
    )
    db_session.add(suspended_tenant)
    await db_session.flush()

    user_email = f"user_{uuid.uuid4().hex[:6]}@suspended.edu"
    susp_user = User(
        email=user_email,
        hashed_password=hash_password("UserPassword2026!"),
        full_name="Suspended Tenant User",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(susp_user)
    await db_session.flush()

    role = Role(
        name="Staff",
        code="STAFF",
        tenant_id=suspended_tenant.id,
        is_system=False
    )
    db_session.add(role)
    await db_session.flush()

    user_role = UserRole(
        user_id=susp_user.id,
        role_id=role.id,
        tenant_id=suspended_tenant.id
    )
    db_session.add(user_role)
    await db_session.commit()

    res = await client.post("/api/v1/auth/login", json={
        "username": user_email,
        "password": "UserPassword2026!",
        "tenant_code": inst_code
    })
    assert res.status_code == 403
    assert "suspended" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_06_effective_access_intersects_subscription_and_permissions(client: httpx.AsyncClient):
    """
    Requirement 5: Effective Access = Subscription Entitlements ∩ User Assigned Permissions.
    TokenResponse returns entitled_modules and effective_permissions computed by the backend.
    """
    res = await client.post("/api/v1/auth/login", json={
        "username": "principal@ourschool.edu.in",
        "password": "PrincipalSecurePassword2026!",
        "tenant_code": "our-school-demo"
    })
    assert res.status_code == 200
    data = res.json()
    assert "entitled_modules" in data
    assert isinstance(data["entitled_modules"], list)
    assert len(data["entitled_modules"]) > 0
    assert "students" in data["entitled_modules"] or "examinations" in data["entitled_modules"] or "attendance" in data["entitled_modules"]

    assert "effective_permissions" in data
    assert isinstance(data["effective_permissions"], list)
    assert len(data["effective_permissions"]) > 0
