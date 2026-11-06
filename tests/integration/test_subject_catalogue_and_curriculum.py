import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.core.security import create_access_token
from app.modules.tenants.models import Tenant
from app.modules.identity.models import User, Role, UserRole
from app.modules.academic.models import (
    SubjectCatalog,
    InstitutionSubject,
    ClassSubjectMapping,
)
from app.modules.examinations.models import Examination
from app.core.security import hash_password
from datetime import date


async def get_test_auth_headers(db_session: AsyncSession, tenant_code: str = "our-school-demo"):
    stmt_tenant = select(Tenant).where(Tenant.code.in_([tenant_code, "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None, f"Tenant {tenant_code} not found"

    stmt_user = select(User).where(User.email == "principal@akshara.edu.in")
    tenant_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert tenant_admin is not None

    token = create_access_token(
        subject=str(tenant_admin.id), tenant_id=str(tenant.id), is_superadmin=False
    )
    return {"Authorization": f"Bearer {token}"}, tenant.id


@pytest.mark.asyncio
async def test_global_subject_catalogue_listing_and_custom_creation(client: AsyncClient, db_session: AsyncSession):
    """
    Verify global catalogue subjects are visible and creating a custom subject succeeds.
    """
    headers, tenant_id = await get_test_auth_headers(db_session)

    # 1. List catalog subjects
    res = await client.get("/api/v1/academic/subjects", headers=headers)
    assert res.status_code == 200
    subjects = res.json()
    assert len(subjects) >= 10  # Standard seeded subjects
    codes = [s["code"] for s in subjects]
    assert "PHY-101" in codes
    assert "CHEM-102" in codes
    assert "MATH-103" in codes

    # Shared global catalogue entries are readable but immutable to tenant admins.
    physics = next(subject for subject in subjects if subject["code"] == "PHY-101")
    global_update = await client.put(
        f"/api/v1/academic/subjects/{physics['id']}",
        json={"name": "Tenant Attempt to Rename Physics"},
        headers=headers
    )
    assert global_update.status_code == 403
    global_archive = await client.delete(
        f"/api/v1/academic/subjects/{physics['id']}",
        headers=headers
    )
    assert global_archive.status_code == 403

    # 2. Create custom subject
    res_custom = await client.post(
        "/api/v1/academic/subjects",
        json={
            "code": "ROBO-401",
            "name": "Robotics & Embedded Systems",
            "category": "Vocational",
            "institution_level": "PU College",
            "has_theory": True,
            "has_practical": True,
            "default_theory_max": 60,
            "default_practical_max": 40,
            "default_pass_marks": 35,
            "credits": 4,
            "description": "Hands-on robotics laboratory"
        },
        headers=headers
    )
    assert res_custom.status_code == 201
    custom_obj = res_custom.json()
    assert custom_obj["code"] == "ROBO-401"
    assert custom_obj["is_global"] is False

    # 3. Duplicate code prevention
    res_dup = await client.post(
        "/api/v1/academic/subjects",
        json={
            "code": "ROBO-401",
            "name": "Duplicate Robotics",
            "category": "Vocational",
            "institution_level": "PU College",
            "has_theory": True,
            "has_practical": False,
            "default_theory_max": 100,
            "default_practical_max": 0,
            "default_pass_marks": 35,
            "credits": 3
        },
        headers=headers
    )
    assert res_dup.status_code == 409


@pytest.mark.asyncio
async def test_load_standard_catalogue_template_into_institution(client: AsyncClient, db_session: AsyncSession):
    """
    Test idempotent adoption of standard subjects into institution repository.
    """
    headers, tenant_id = await get_test_auth_headers(db_session)

    res = await client.post(
        "/api/v1/academic/subjects/templates/load-standard",
        json={"board": "KARNATAKA_PU_CBSE", "include_languages": True},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["adopted_count"] >= 10

    # Running it again is idempotent (adopted_count 0)
    res_again = await client.post(
        "/api/v1/academic/subjects/templates/load-standard",
        json={"board": "KARNATAKA_PU_CBSE", "include_languages": True},
        headers=headers
    )
    assert res_again.status_code == 200
    assert res_again.json()["adopted_count"] == 0

    # List institution subjects
    res_inst = await client.get("/api/v1/academic/institution-subjects", headers=headers)
    assert res_inst.status_code == 200
    inst_subs = res_inst.json()
    assert len(inst_subs) >= 10


@pytest.mark.asyncio
async def test_curriculum_mapping_and_marks_validation(client: AsyncClient, db_session: AsyncSession):
    """
    Test mapping subjects to a class, marks validation (theory pass > max fails),
    and duplicate mapping rejection (409 Conflict).
    """
    headers, tenant_id = await get_test_auth_headers(db_session)

    # 1. Validation failure: theory pass marks > theory max marks
    res_invalid = await client.post(
        "/api/v1/academic/curriculum/map",
        json={
            "academic_year": "2026-2027",
            "institution_level": "PU College",
            "class_name": "I PUC",
            "stream": "PCMB",
            "subject_code": "PHY-101",
            "is_compulsory": True,
            "has_theory": True,
            "has_practical": True,
            "theory_max_marks": 70,
            "practical_max_marks": 30,
            "total_max_marks": 100,
            "theory_pass_marks": 75,  # Exceeds 70!
            "practical_pass_marks": 10,
            "total_pass_marks": 35,
            "assigned_teacher_name": "Dr. V. Murthy"
        },
        headers=headers
    )
    assert res_invalid.status_code == 422
    assert "Theory passing marks" in res_invalid.json()["detail"]

    # 2. Valid mapping for Physics
    res_map = await client.post(
        "/api/v1/academic/curriculum/map",
        json={
            "academic_year": "2026-2027",
            "institution_level": "PU College",
            "class_name": "I PUC",
            "stream": "PCMB",
            "subject_code": "PHY-101",
            "is_compulsory": True,
            "has_theory": True,
            "has_practical": True,
            "theory_max_marks": 70,
            "practical_max_marks": 30,
            "total_max_marks": 100,
            "theory_pass_marks": 25,
            "practical_pass_marks": 10,
            "total_pass_marks": 35,
            "weekly_periods": 6,
            "assigned_teacher_name": "Dr. V. Murthy"
        },
        headers=headers
    )
    assert res_map.status_code == 201
    phy_mapping = res_map.json()
    assert phy_mapping["subject_code"] == "PHY-101"
    assert phy_mapping["total_max_marks"] == 100
    assert phy_mapping["assigned_teacher_name"] == "Dr. V. Murthy"

    # 3. Duplicate mapping rejection (409 Conflict)
    res_dup_map = await client.post(
        "/api/v1/academic/curriculum/map",
        json={
            "academic_year": "2026-2027",
            "institution_level": "PU College",
            "class_name": "I PUC",
            "stream": "PCMB",
            "subject_code": "PHY-101",
            "is_compulsory": True,
            "has_theory": True,
            "has_practical": True,
            "theory_max_marks": 70,
            "practical_max_marks": 30,
            "total_max_marks": 100,
            "theory_pass_marks": 25,
            "practical_pass_marks": 10,
            "total_pass_marks": 35
        },
        headers=headers
    )
    assert res_dup_map.status_code == 409
    assert "already mapped" in res_dup_map.json()["detail"]

    # 4. Map Chemistry as second subject
    res_chem = await client.post(
        "/api/v1/academic/curriculum/map",
        json={
            "academic_year": "2026-2027",
            "institution_level": "PU College",
            "class_name": "I PUC",
            "stream": "PCMB",
            "subject_code": "CHEM-102",
            "is_compulsory": True,
            "has_theory": True,
            "has_practical": True,
            "theory_max_marks": 70,
            "practical_max_marks": 30,
            "total_max_marks": 100,
            "theory_pass_marks": 25,
            "practical_pass_marks": 10,
            "total_pass_marks": 35,
            "assigned_teacher_name": "Prof. S. Joshi"
        },
        headers=headers
    )
    assert res_chem.status_code == 201
    chem_mapping = res_chem.json()

    # 5. List curriculum for I PUC PCMB
    res_list = await client.get(
        "/api/v1/academic/curriculum?academic_year=2026-2027&class_name=I PUC&stream=PCMB",
        headers=headers
    )
    assert res_list.status_code == 200
    curriculum = res_list.json()
    assert len(curriculum) >= 2
    curriculum_codes = [c["subject_code"] for c in curriculum]
    assert "PHY-101" in curriculum_codes
    assert "CHEM-102" in curriculum_codes

    # 6. Update assessment scheme
    res_update = await client.put(
        f"/api/v1/academic/curriculum/mappings/{phy_mapping['id']}",
        json={
            "theory_max_marks": 80,
            "practical_max_marks": 20,
            "total_max_marks": 100,
            "theory_pass_marks": 28,
            "practical_pass_marks": 7,
            "total_pass_marks": 35,
            "assigned_teacher_name": "Dr. V. Murthy (HOD)"
        },
        headers=headers
    )
    assert res_update.status_code == 200
    updated_obj = res_update.json()
    assert updated_obj["theory_max_marks"] == 80
    assert updated_obj["assigned_teacher_name"] == "Dr. V. Murthy (HOD)"

    # 7. Reorder curriculum
    res_reorder = await client.patch(
        "/api/v1/academic/curriculum/reorder",
        json={"mapping_ids": [chem_mapping["id"], phy_mapping["id"]]},
        headers=headers
    )
    assert res_reorder.status_code == 200

    # 8. Delete mapping
    res_del = await client.delete(
        f"/api/v1/academic/curriculum/mappings/{chem_mapping['id']}",
        headers=headers
    )
    assert res_del.status_code == 200
    assert res_del.json()["status"] in ["DELETED", "ARCHIVED"]


@pytest.mark.asyncio
async def test_tenant_isolation_on_custom_subjects_and_curriculum(client: AsyncClient, db_session: AsyncSession, app_db_session: AsyncSession):
    """
    Verify multi-tenant isolation: Tenant B cannot access or modify Tenant A's custom subjects or curriculum.
    """
    headers_a, tenant_a_id = await get_test_auth_headers(db_session, "our-school-demo")

    # Tenant A creates custom subject
    res_a = await client.post(
        "/api/v1/academic/subjects",
        json={
            "code": "ADV-AERO-901",
            "name": "Aerospace Dynamics Tenant A",
            "category": "Core Science",
            "institution_level": "Degree College",
            "has_theory": True,
            "has_practical": False,
            "default_theory_max": 100,
            "default_practical_max": 0,
            "default_pass_marks": 40,
            "credits": 5
        },
        headers=headers_a
    )
    assert res_a.status_code == 201
    subject_a_id = res_a.json()["id"]

    # Now simulate Tenant B
    tenant_b = Tenant(
        id=uuid.uuid4(),
        name="Global St. Marys Academy",
        code="st-marys-test",
        email="admin@stmarys.test.edu",
        status="active"
    )
    db_session.add(tenant_b)
    await db_session.commit()

    tenant_b_user = User(
        email="principal@stmarys.test.edu",
        hashed_password=hash_password("TenantBPassword123!"),
        full_name="Tenant B Principal",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(tenant_b_user)
    await db_session.flush()
    principal_role = (await db_session.execute(
        select(Role).where(Role.code == "PRINCIPAL", Role.tenant_id == None)
    )).scalars().first()
    assert principal_role is not None
    db_session.add(UserRole(user_id=tenant_b_user.id, role_id=principal_role.id, tenant_id=tenant_b.id))
    await db_session.commit()

    token_b = create_access_token(
        subject=str(tenant_b_user.id), tenant_id=str(tenant_b.id), is_superadmin=False
    )
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Tenant B lists subjects: global subjects are visible, but Tenant A's ADV-AERO-901 must NOT be visible
    res_b_list = await client.get("/api/v1/academic/subjects", headers=headers_b)
    assert res_b_list.status_code == 200
    b_subjects = res_b_list.json()
    b_codes = [s["code"] for s in b_subjects]
    assert "PHY-101" in b_codes  # Global visible
    assert "ADV-AERO-901" not in b_codes  # Tenant A isolated!

    # Tenant B attempting to delete Tenant A's subject must return 404
    res_b_del = await client.delete(f"/api/v1/academic/subjects/{subject_a_id}", headers=headers_b)
    assert res_b_del.status_code == 404

    # Even setting the legacy custom GUC must not grant a cross-tenant RLS bypass.
    await app_db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
        {"tenant_id": str(tenant_b.id)}
    )
    await app_db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    isolated_subject = await app_db_session.get(SubjectCatalog, uuid.UUID(subject_a_id))
    assert isolated_subject is None


@pytest.mark.asyncio
async def test_subject_curriculum_rbac_forbidden(client: AsyncClient, db_session: AsyncSession):
    """
    Verify RBAC security: regular users without curriculum.manage receive 403 Forbidden.
    """
    stmt_tenant = select(Tenant).where(Tenant.code == "our-school-demo")
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None

    # Create a user with no curriculum permissions
    user_student = User(
        email=f"student_{uuid.uuid4().hex[:6]}@akshara.edu.in",
        hashed_password=hash_password("Password123!"),
        full_name="Test Student",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(user_student)
    await db_session.flush()
    student_role = (await db_session.execute(
        select(Role).where(Role.code == "STUDENT", Role.tenant_id == None)
    )).scalars().first()
    assert student_role is not None
    db_session.add(UserRole(user_id=user_student.id, role_id=student_role.id, tenant_id=tenant.id))
    await db_session.commit()

    token_student = create_access_token(
        subject=str(user_student.id), tenant_id=str(tenant.id), is_superadmin=False
    )
    headers_student = {"Authorization": f"Bearer {token_student}"}

    # Attempting to map subject to curriculum without curriculum.manage returns 403
    res_forbidden = await client.post(
        "/api/v1/academic/curriculum/map",
        json={
            "academic_year": "2026-2027",
            "institution_level": "PU College",
            "class_name": "I PUC",
            "stream": "PCMB",
            "subject_code": "PHY-101",
            "is_compulsory": True
        },
        headers=headers_student
    )
    assert res_forbidden.status_code == 403
    assert "curriculum.manage" in res_forbidden.json()["detail"]


@pytest.mark.asyncio
async def test_curriculum_soft_archive_with_scheduled_examinations(client: AsyncClient, db_session: AsyncSession):
    """
    Verify safe archival: when examination schedules exist for a class & subject,
    deleting the curriculum mapping archives it (is_active=False) rather than hard deletion,
    preserving examination schedules and grade history.
    """
    headers, tenant_id = await get_test_auth_headers(db_session)

    # 1. Map Math to Class 10
    res_map = await client.post(
        "/api/v1/academic/curriculum/map",
        json={
            "academic_year": "2026-2027",
            "institution_level": "School",
            "class_name": "Class 10",
            "stream": "General",
            "subject_code": "MATH-103",
            "is_compulsory": True,
            "has_theory": True,
            "has_practical": False,
            "theory_max_marks": 100,
            "practical_max_marks": 0,
            "total_max_marks": 100,
            "theory_pass_marks": 35,
            "practical_pass_marks": 0,
            "total_pass_marks": 35
        },
        headers=headers
    )
    assert res_map.status_code in [201, 200]
    mapping_id = res_map.json()["id"]

    # 2. Add an Examination record for Class 10 MATH-103
    exam = Examination(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        name="Mid-Term Mathematics 2026",
        code=f"EXAM-{uuid.uuid4().hex[:6].upper()}",
        category="half_yearly_exam",
        academic_year="2026-2027",
        target_class="Class 10",
        subject_code="MATH-103",
        subject_name="Pure & Applied Mathematics",
        exam_date=date(2026, 11, 25),
        start_time="09:30 AM",
        end_time="12:30 PM",
        max_marks=100.0,
        passing_marks=35.0,
        theory_max_marks=100.0,
        practical_max_marks=0.0,
        status="SCHEDULED"
    )
    db_session.add(exam)
    await db_session.commit()

    # 3. Delete the curriculum mapping
    res_del = await client.delete(
        f"/api/v1/academic/curriculum/mappings/{mapping_id}",
        headers=headers
    )
    assert res_del.status_code == 200
    del_data = res_del.json()
    assert del_data["status"] == "ARCHIVED"
    assert "safely archived" in del_data["message"]

    # 4. Verify in DB that the mapping still exists but is_active is False
    mapping_obj = await db_session.get(ClassSubjectMapping, uuid.UUID(mapping_id))
    assert mapping_obj is not None
    assert mapping_obj.is_active is False
