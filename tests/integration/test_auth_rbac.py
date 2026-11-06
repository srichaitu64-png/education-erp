import uuid
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.modules.identity.models import User, Role, Permission, UserRole
from app.modules.tenants.models import Tenant


@pytest.mark.asyncio
async def test_argon2id_password_hashing():
    """Verify Argon2id cryptographic password hashing and verification."""
    password = "SuperStrongPassword2026!"
    hashed = hash_password(password)

    assert hashed.startswith("$argon2id$")
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False


@pytest.mark.asyncio
async def test_authentication_login_flow(client, db_session: AsyncSession):
    """Verify authentication API: credential validation, JWT tokens, and user profile."""
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    email = f"teacher_{uuid.uuid4().hex[:6]}@akshara.edu.in"
    password = "TeacherPassword#123"

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name="Radha Sharma",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(user)
    await db_session.flush()
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code == "our-school-demo"))).scalars().first()
    assert tenant is not None, "OUR SCHOOL demo tenant must be seeded for authentication tests"
    principal_role = (
        await db_session.execute(
            select(Role).where(Role.code == "PRINCIPAL", Role.tenant_id.is_(None))
        )
    ).scalars().first()
    assert principal_role is not None, "Global PRINCIPAL role template must be seeded"
    db_session.add(UserRole(user_id=user.id, role_id=principal_role.id, tenant_id=tenant.id))
    tenant_code = tenant.code
    await db_session.commit()

    # 1. Test invalid password
    resp_bad = await client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword", "tenant_code": tenant_code})
    assert resp_bad.status_code == 401

    # 2. Test valid login
    resp_ok = await client.post("/api/v1/auth/login", json={"email": email, "password": password, "tenant_code": tenant_code})
    assert resp_ok.status_code == 200
    data = resp_ok.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["full_name"] == "Radha Sharma"

    # 3. Test /auth/me with the access token
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    resp_me = await client.get("/api/v1/auth/me", headers=headers)
    assert resp_me.status_code == 200
    assert resp_me.json()["id"] == str(user.id)


@pytest.mark.asyncio
async def test_superadmin_privilege_enforcement(client, db_session: AsyncSession):
    """Verify that regular users cannot access Platform Super Admin endpoints."""
    await db_session.execute(text("SET LOCAL app.is_superadmin = 'true'"))

    regular_user = User(
        email=f"regular_{uuid.uuid4().hex[:6]}@school.in",
        hashed_password=hash_password("Pass123!"),
        full_name="Regular Staff",
        is_active=True,
        is_superadmin=False
    )
    superadmin_user = User(
        email=f"admin_{uuid.uuid4().hex[:6]}@platform.in",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Platform Admin",
        is_active=True,
        is_superadmin=True
    )
    db_session.add_all([regular_user, superadmin_user])
    await db_session.flush()
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code == "our-school-demo"))).scalars().first()
    assert tenant is not None
    regular_role = (
        await db_session.execute(
            select(Role).where(Role.code == "INSTITUTION_ADMIN", Role.tenant_id.is_(None))
        )
    ).scalars().first()
    super_role = (
        await db_session.execute(
            select(Role).where(Role.code == "SUPER_ADMIN", Role.tenant_id.is_(None))
        )
    ).scalars().first()
    assert regular_role is not None and super_role is not None
    db_session.add_all([
        UserRole(user_id=regular_user.id, role_id=regular_role.id, tenant_id=tenant.id),
        UserRole(user_id=superadmin_user.id, role_id=super_role.id, tenant_id=None),
    ])
    regular_email = regular_user.email
    superadmin_email = superadmin_user.email
    tenant_code = tenant.code
    await db_session.commit()

    # Login regular user
    r_reg = await client.post("/api/v1/auth/login", json={"email": regular_email, "password": "Pass123!", "tenant_code": tenant_code})
    reg_token = r_reg.json()["access_token"]

    # Attempt to list tenants as regular user -> MUST BE 403 FORBIDDEN
    resp_forbidden = await client.get(
        "/api/v1/platform/tenants",
        headers={"Authorization": f"Bearer {reg_token}"}
    )
    assert resp_forbidden.status_code == 403
    assert "Super Admin privileges" in resp_forbidden.json()["detail"]

    # Login superadmin
    r_adm = await client.post("/api/v1/auth/login", json={"email": superadmin_email, "password": "AdminPass123!"})
    adm_token = r_adm.json()["access_token"]

    # Call as superadmin -> MUST SUCCEED (200)
    resp_ok = await client.get(
        "/api/v1/platform/tenants",
        headers={"Authorization": f"Bearer {adm_token}"}
    )
    assert resp_ok.status_code == 200
    assert isinstance(resp_ok.json(), list)

