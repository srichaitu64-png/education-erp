import uuid
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, Role, UserRole
from app.core.security import create_access_token, hash_password


@pytest.mark.asyncio
async def test_api_test_database_role_cannot_bypass_rls(db_session: AsyncSession):
    """The API/test connection must not be a PostgreSQL superuser or BYPASSRLS role."""
    row = (
        await db_session.execute(
            text("""
                SELECT r.rolsuper, r.rolbypassrls
                FROM pg_catalog.pg_roles r
                WHERE r.rolname = current_user
            """)
        )
    ).one()
    assert row.rolsuper is False
    assert row.rolbypassrls is False


@pytest.mark.asyncio
async def test_database_row_level_security_isolation(db_session: AsyncSession):
    """
    MANDATORY SECURITY TEST:
    Verify PostgreSQL Row-Level Security (RLS) guarantees that Tenant A
    cannot read or mutate Tenant B's data at the database engine level.
    """
    # 1. Super Admin creates two distinct tenants and campuses
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant_a = Tenant(
        name="Akshara Global School",
        code=f"akshara_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="info@akshara.edu.in",
        status="active"
    )
    tenant_b = Tenant(
        name="Greenwood PU College",
        code=f"greenwood_{uuid.uuid4().hex[:6]}",
        institution_type="pu_college",
        email="info@greenwood.edu.in",
        status="active"
    )
    db_session.add_all([tenant_a, tenant_b])
    await db_session.flush()

    campus_a = Campus(tenant_id=tenant_a.id, name="Akshara Campus North", code="NORTH", is_main=True)
    campus_b = Campus(tenant_id=tenant_b.id, name="Greenwood Main Campus", code="MAIN", is_main=True)
    db_session.add_all([campus_a, campus_b])
    await db_session.commit()

    tenant_a_id = tenant_a.id
    tenant_b_id = tenant_b.id

    # Expire identity map so subsequent queries hit the database engine directly
    db_session.expire_all()

    # 2. Query as Tenant A under non-superuser application role 'erp_app'
    await db_session.execute(text("SET ROLE erp_app"))
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'false', true)"))
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_a_id)}
    )

    stmt = select(Campus)
    res = await db_session.execute(stmt)
    campuses_seen_by_a = res.scalars().all()

    assert len(campuses_seen_by_a) == 1
    assert campuses_seen_by_a[0].tenant_id == tenant_a_id
    assert campuses_seen_by_a[0].name == "Akshara Campus North"

    # 3. Query as Tenant B under non-superuser application role 'erp_app'
    db_session.expire_all()
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_b_id)}
    )

    res_b = await db_session.execute(stmt)
    campuses_seen_by_b = res_b.scalars().all()

    assert len(campuses_seen_by_b) == 1
    assert campuses_seen_by_b[0].tenant_id == tenant_b_id
    assert campuses_seen_by_b[0].name == "Greenwood Main Campus"

    # 4. Attempt unauthenticated or cleared tenant context query (Attacker probe)
    db_session.expire_all()
    await db_session.execute(text("SELECT set_config('app.current_tenant_id', '', true)"))
    res_none = await db_session.execute(stmt)
    campuses_seen_by_none = res_none.scalars().all()

    assert len(campuses_seen_by_none) == 0, "Unauthenticated query leaked tenant data!"

    # 5. Super Admin query across tenants
    db_session.expire_all()
    await db_session.execute(text("RESET ROLE"))
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    res_admin = await db_session.execute(stmt)
    campuses_seen_by_admin = res_admin.scalars().all()

    assert len(campuses_seen_by_admin) >= 2


@pytest.mark.asyncio
async def test_api_tenant_boundary_enforcement(client, db_session: AsyncSession):
    """
    Verify that an authenticated user from Tenant A cannot access Tenant B profile via API.
    """
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))

    tenant_a = Tenant(
        name="School Alpha",
        code=f"alpha_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="contact@alpha.edu",
        status="active"
    )
    tenant_b = Tenant(
        name="School Beta",
        code=f"beta_{uuid.uuid4().hex[:6]}",
        institution_type="school",
        email="contact@beta.edu",
        status="active"
    )
    db_session.add_all([tenant_a, tenant_b])
    await db_session.flush()

    user_a = User(
        email=f"principal_{uuid.uuid4().hex[:6]}@alpha.edu",
        hashed_password=hash_password("Pass#1234"),
        full_name="Principal Alpha",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(user_a)
    tenant_role = Role(name="Alpha Principal", code="PRINCIPAL", tenant_id=tenant_a.id, is_system=False)
    db_session.add(tenant_role)
    await db_session.flush()
    db_session.add(UserRole(user_id=user_a.id, role_id=tenant_role.id, tenant_id=tenant_a.id))
    await db_session.commit()

    tenant_a_id = tenant_a.id
    tenant_b_id = tenant_b.id

    # Generate token for Tenant A user
    token_a = create_access_token(
        subject=str(user_a.id),
        tenant_id=str(tenant_a_id),
        is_superadmin=False
    )

    # Calling /institution/profile should return Tenant A's profile
    headers_a = {"Authorization": f"Bearer {token_a}"}
    resp = await client.get("/api/v1/institution/profile", headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(tenant_a_id)
    assert data["name"] == "School Alpha"
    assert data["id"] != str(tenant_b_id)
