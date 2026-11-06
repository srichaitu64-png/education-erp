import uuid
import pytest
from datetime import date
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.security import create_access_token
from app.modules.tenants.models import Tenant
from app.modules.identity.models import User, Role, UserRole
from app.modules.academic.models import (
    AcademicSection,
    Student,
    StudentSectionEnrolment,
    StaffDutyAssignment,
    HallTicket,
    AdmissionApplication
)
from app.modules.examinations.models import Examination


async def get_test_auth_headers(db_session: AsyncSession, tenant_code: str = "our-school-demo"):
    target_code = "our-school-demo" if tenant_code == "akshara" else tenant_code
    stmt_tenant = select(Tenant).where(or_(Tenant.code == target_code, Tenant.code == tenant_code))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None, f"Tenant {tenant_code} must exist"

    login_email = "chairman@akshara-trial.edu.in" if tenant_code == "akshara-trial" else "chairman@ourschool.edu.in"
    stmt_user = select(User).where(User.email == login_email)
    institution_head = (await db_session.execute(stmt_user)).scalars().first()
    assert institution_head is not None

    token = create_access_token(
        subject=str(institution_head.id), tenant_id=str(tenant.id), is_superadmin=False
    )
    return {"Authorization": f"Bearer {token}"}, tenant


@pytest.mark.asyncio
async def test_canonical_student_lifecycle_and_enrolment(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase D - Canonical Student Master (SIS):
    1. Create section 'Class 9 Section A'
    2. Register a new student into Class 9 Section A with automatic admission number generation
    3. Verify automatic StudentSectionEnrolment creation and section capacity increment
    4. Query student list with class filtering and pagination
    5. Retrieve complete 360-degree student profile
    6. Update student details
    7. Verify duplicate admission number rejection
    """
    headers, tenant = await get_test_auth_headers(db_session, "akshara")

    # 1. Ensure target section exists
    sec_res = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "School",
            "class_name": "Class 9",
            "stream": "General",
            "section_code": "A",
            "room_number": "Room 201",
            "max_capacity": 40,
            "class_teacher_name": "Mrs. Kavita Rao"
        },
        headers=headers
    )
    # 201 if created, 409 if already exists
    assert sec_res.status_code in (201, 409)

    # 2. Register student
    reg_payload = {
        "first_name": "Siddharth",
        "last_name": "Nair",
        "date_of_birth": "2011-03-25",
        "gender": "MALE",
        "blood_group": "A+",
        "father_name": "Narayan Nair",
        "mother_name": "Lakshmi Nair",
        "guardian_name": "Narayan Nair",
        "father_mobile": "+91 99887 76655",
        "parent_email": "narayan.nair@example.com",
        "academic_year": "2026-2027",
        "institution_level": "School",
        "class_name": "Class 9",
        "section_or_stream": "A",
        "roll_number": "901",
        "fee_balance": 15000.0,
        "attendance_pct": 96.5,
        "status": "ACTIVE"
    }
    create_res = await client.post("/api/v1/academic/students", json=reg_payload, headers=headers)
    assert create_res.status_code == 201
    st_data = create_res.json()
    student_id = st_data["id"]
    adm_no = st_data["admission_number"]
    assert adm_no.startswith("ADM-")
    assert st_data["first_name"] == "Siddharth"
    assert st_data["class_name"] == "Class 9"

    # 3. Verify student section enrolment was created
    enrol_stmt = select(StudentSectionEnrolment).where(
        StudentSectionEnrolment.student_id == uuid.UUID(student_id),
        StudentSectionEnrolment.status == "ACTIVE"
    )
    enrol = (await db_session.execute(enrol_stmt)).scalars().first()
    assert enrol is not None
    assert enrol.admission_number == adm_no

    # 4. Query student list
    list_res = await client.get("/api/v1/academic/students?class_name=Class 9", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    found = any(s["id"] == student_id for s in list_data["items"])
    assert found

    # 5. Retrieve 360 profile
    detail_res = await client.get(f"/api/v1/academic/students/{student_id}", headers=headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["admission_number"] == adm_no
    assert len(detail_data["enrolments"]) >= 1

    # 6. Update student details
    update_res = await client.put(
        f"/api/v1/academic/students/{student_id}",
        json={"emergency_contact": "+91 99887 76655", "blood_group": "A-"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["emergency_contact"] == "+91 99887 76655"
    assert update_res.json()["blood_group"] == "A-"

    # 7. Duplicate admission number rejection
    dup_res = await client.post(
        "/api/v1/academic/students",
        json={
            "admission_number": adm_no,
            "first_name": "Clone",
            "last_name": "Student",
            "class_name": "Class 9",
            "section_or_stream": "A"
        },
        headers=headers
    )
    assert dup_res.status_code == 409


@pytest.mark.asyncio
async def test_prospective_admissions_workflow_and_enrolment(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase D - Admissions Workflow:
    1. Submit prospective application
    2. List applications and verify PENDING status
    3. Approve application -> auto-creates canonical Student and section enrolment
    4. Confirm application status changed to APPROVED with enrolled_student_id
    """
    headers, tenant = await get_test_auth_headers(db_session, "akshara")

    # 1. Submit application
    app_res = await client.post(
        "/api/v1/academic/admissions",
        json={
            "applicant_name": "Aditya Kulkarni",
            "level": "School",
            "target_class": "Class 9",
            "parent_name": "Girish Kulkarni",
            "parent_phone": "+91 98440 99887",
            "parent_email": "girish.kulkarni@example.com",
            "date_of_birth": "2011-06-18",
            "gender": "MALE",
            "address": "45, Temple Road, Malleshwaram, Bengaluru"
        },
        headers=headers
    )
    assert app_res.status_code == 201
    app_data = app_res.json()
    app_id = app_data["id"]
    assert app_data["status"] == "PENDING"
    assert app_data["application_number"].startswith("APP-")

    # 2. List applications
    list_res = await client.get("/api/v1/academic/admissions?status_filter=PENDING", headers=headers)
    assert list_res.status_code == 200
    apps = list_res.json()
    assert any(a["id"] == app_id for a in apps)

    # 3. Approve application
    approve_res = await client.post(
        f"/api/v1/academic/admissions/{app_id}/approve",
        json={
            "section_code": "A",
            "academic_year": "2026-2027",
            "review_notes": "All documents verified and admission test cleared."
        },
        headers=headers
    )
    assert approve_res.status_code == 200
    appr_data = approve_res.json()
    assert appr_data["status"] == "APPROVED"
    new_student_id = appr_data["student_id"]
    new_adm_no = appr_data["admission_number"]

    # 4. Verify canonical student exists
    st_res = await client.get(f"/api/v1/academic/students/{new_student_id}", headers=headers)
    assert st_res.status_code == 200
    st_data = st_res.json()
    assert st_data["first_name"] == "Aditya"
    assert st_data["last_name"] == "Kulkarni"
    assert st_data["admission_number"] == new_adm_no


@pytest.mark.asyncio
async def test_staff_directory_and_duty_assignments(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase D - Staff Directory & Duty Assignments:
    1. Query staff directory for institution
    2. Assign duty (Subject Teacher for Class 9 Section A)
    3. Query duty assignments with filters
    """
    headers, tenant = await get_test_auth_headers(db_session, "akshara")

    # 1. Staff directory
    staff_res = await client.get("/api/v1/academic/staff", headers=headers)
    assert staff_res.status_code == 200
    staff_list = staff_res.json()
    assert len(staff_list) > 0

    # Get a staff user
    staff_user = staff_list[0]
    staff_id = staff_user["id"]

    # Get a section
    sec_stmt = select(AcademicSection).where(AcademicSection.tenant_id == tenant.id)
    sec = (await db_session.execute(sec_stmt)).scalars().first()
    assert sec is not None

    # 2. Assign duty
    duty_payload = {
        "staff_id": staff_id,
        "staff_name": staff_user["full_name"],
        "duty_role": "SUBJECT_TEACHER",
        "section_id": str(sec.id),
        "subject_code": "MATH-101",
        "subject_name": "Mathematics",
        "can_enter_marks": True,
        "can_take_attendance": True
    }
    assign_res = await client.post("/api/v1/academic/duty-assignments", json=duty_payload, headers=headers)
    assert assign_res.status_code == 201

    # 3. Query duty assignments
    query_res = await client.get(f"/api/v1/academic/duty-assignments?staff_id={staff_id}", headers=headers)
    assert query_res.status_code == 200
    duties = query_res.json()
    assert len(duties) >= 1
    assert any(d["duty_role"] == "SUBJECT_TEACHER" for d in duties)


@pytest.mark.asyncio
async def test_hall_tickets_batch_generation_and_verification(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase D - Examination Hall Tickets:
    1. Retrieve an existing examination
    2. Batch generate hall tickets for students in target class
    3. List generated hall tickets
    4. Verify hall ticket authenticity via QR code endpoint
    """
    headers, tenant = await get_test_auth_headers(db_session, "akshara")

    # 1. Get or create examination
    exam_stmt = select(Examination).where(Examination.tenant_id == tenant.id, Examination.target_class == "Class 10-A")
    exam = (await db_session.execute(exam_stmt)).scalars().first()
    if not exam:
        exam = Examination(
            tenant_id=tenant.id,
            name="Mid-Term Examination 2026",
            code="EXAM-MID-10",
            category="unit_test",
            academic_year="2026-2027",
            target_class="Class 10-A",
            subject_code="MATH-10",
            subject_name="Mathematics",
            exam_date=date(2026, 11, 20),
            start_time="09:30 AM",
            end_time="12:30 PM",
            max_marks=100.0,
            passing_marks=35.0,
            theory_max_marks=70.0,
            practical_max_marks=30.0,
            status="SCHEDULED"
        )
        db_session.add(exam)
        await db_session.commit()
        await db_session.refresh(exam)

    # 2. Batch generate hall tickets
    gen_res = await client.post(
        "/api/v1/academic/hall-tickets/generate",
        json={
            "examination_id": str(exam.id),
            "class_name": "Class 10-A",
            "room_number": "Hall 101",
            "enforce_fee_clearance": False
        },
        headers=headers
    )
    assert gen_res.status_code == 201
    assert gen_res.json()["status"] == "SUCCESS"

    # 3. List hall tickets
    list_res = await client.get(f"/api/v1/academic/hall-tickets?examination_id={exam.id}", headers=headers)
    assert list_res.status_code == 200
    tickets = list_res.json()
    assert len(tickets) >= 1

    sample_ticket = tickets[0]
    ticket_no = sample_ticket["ticket_number"]
    qr_code = sample_ticket["qr_verification_code"]

    # 4. Verify QR code
    verify_res = await client.get(f"/api/v1/academic/hall-tickets/verify/{ticket_no}")
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["valid"] is True
    assert v_data["student_name"] == sample_ticket["student_name"]


@pytest.mark.asyncio
async def test_portal_me_contextual_profile(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase D - Student & Parent Portal Context:
    Calling GET /api/v1/academic/portal/me returns contextual profile,
    attendance summary, fee summary, and active hall tickets.
    """
    headers, tenant = await get_test_auth_headers(db_session, "akshara")

    student_user = (await db_session.execute(
        select(User).where(User.email == "student.rahul@ourschool.edu.in")
    )).scalars().first()
    assert student_user is not None
    student_token = create_access_token(
        subject=str(student_user.id), tenant_id=str(tenant.id), is_superadmin=False
    )
    student_headers = {"Authorization": f"Bearer {student_token}"}
    portal_res = await client.get("/api/v1/academic/portal/me", headers=student_headers)
    assert portal_res.status_code == 200
    p_data = portal_res.json()
    assert "user_id" in p_data
    assert p_data["student_profile"] is not None
    assert "fee_summary" in p_data
    assert "attendance_summary" in p_data


@pytest.mark.asyncio
async def test_cross_tenant_student_isolation_rls(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase D - Strict Row-Level Security on Canonical Students:
    Students registered in 'akshara' must NOT be accessible or modifiable
    under 'akshara-trial' tenant context.
    """
    # 1. Get akshara student
    headers_akshara, tenant_akshara = await get_test_auth_headers(db_session, "akshara")
    list_res = await client.get("/api/v1/academic/students", headers=headers_akshara)
    assert list_res.status_code == 200
    akshara_students = list_res.json()["items"]
    assert len(akshara_students) > 0
    target_student = akshara_students[0]
    target_student_id = target_student["id"]

    # 2. Authenticate as akshara-trial
    headers_trial, tenant_trial = await get_test_auth_headers(db_session, "akshara-trial")

    # 3. List students in akshara-trial -> must be 0 (clean slate)
    trial_list_res = await client.get("/api/v1/academic/students", headers=headers_trial)
    assert trial_list_res.status_code == 200
    assert trial_list_res.json()["total"] == 0

    # 4. Attempt to access akshara's student using akshara-trial credentials -> 404 NOT FOUND
    access_res = await client.get(f"/api/v1/academic/students/{target_student_id}", headers=headers_trial)
    assert access_res.status_code == 404

    # 5. Attempt to update akshara's student using akshara-trial credentials -> 404 NOT FOUND
    tamper_res = await client.put(
        f"/api/v1/academic/students/{target_student_id}",
        json={"first_name": "Tampered"},
        headers=headers_trial
    )
    assert tamper_res.status_code == 404
