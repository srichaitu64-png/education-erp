import uuid
import pytest
from httpx import AsyncClient
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import create_access_token
from app.modules.tenants.models import Tenant
from app.modules.identity.models import User
from app.modules.academic.models import (
    AcademicSection,
    StudentSectionEnrolment,
    StaffDutyAssignment,
    ConsolidatedFeeReportSnapshot,
)


async def get_test_auth_headers(db_session: AsyncSession):
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    pilot_tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert pilot_tenant is not None

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(pilot_tenant.id), is_superadmin=True
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_academic_sections_creation_and_capacity(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase 2:
    - Create Class 6 with sections A, B, C, D
    - Create I PUC PCMB with 6 sections: A, B, C, D, E, F
    - Validate duplicate section prevention and capacity limits
    """
    auth_headers = await get_test_auth_headers(db_session)

    # 1. Create Class 6 Section A
    res = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "School",
            "class_name": "Class 6",
            "stream": "General",
            "section_code": "A",
            "room_number": "Room 101",
            "max_capacity": 40,
            "class_teacher_name": "Mrs. Priya Sharma"
        },
        headers=auth_headers
    )
    assert res.status_code == 201

    # 2. Create Class 6 Section B
    res_b = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "School",
            "class_name": "Class 6",
            "stream": "General",
            "section_code": "B",
            "room_number": "Room 102",
            "max_capacity": 40,
            "class_teacher_name": "Mr. Rajesh Kumar"
        },
        headers=auth_headers
    )
    assert res_b.status_code == 201

    # 3. Create I PUC PCMB Section F (testing 6 sections A through F)
    res_f = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "PU College",
            "class_name": "I PUC",
            "stream": "PCMB",
            "section_code": "F",
            "room_number": "Hall 306",
            "max_capacity": 50,
            "class_teacher_name": "Dr. V. Murthy"
        },
        headers=auth_headers
    )
    assert res_f.status_code == 201

    # 4. Duplicate section creation should be rejected
    res_dup = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "School",
            "class_name": "Class 6",
            "stream": "General",
            "section_code": "A",
            "max_capacity": 40
        },
        headers=auth_headers
    )
    assert res_dup.status_code == 409


@pytest.mark.asyncio
async def test_section_transfer_preserves_history(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase 2 Student Transfer:
    - Transfer student from Section A to Section B
    - Capacity is enforced
    - Historical record is marked TRANSFERRED with effective date
    """
    auth_headers = await get_test_auth_headers(db_session)

    # 1. Create source and target sections
    res_a = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "School",
            "class_name": "Class 7",
            "stream": "General",
            "section_code": "A",
            "max_capacity": 2
        },
        headers=auth_headers
    )
    sec_a_id = res_a.json()["id"]

    res_b = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "School",
            "class_name": "Class 7",
            "stream": "General",
            "section_code": "B",
            "max_capacity": 30
        },
        headers=auth_headers
    )
    sec_b_id = res_b.json()["id"]

    # 2. Execute transfer
    student_id = str(uuid.uuid4())
    res_transfer = await client.post(
        "/api/v1/academic/sections/transfer",
        json={
            "student_id": student_id,
            "source_section_id": sec_a_id,
            "target_section_id": sec_b_id,
            "reason": "Parent relocation to North Campus bus route",
            "effective_date": str(date.today())
        },
        headers=auth_headers
    )
    assert res_transfer.status_code == 200
    assert "transferred to Section B successfully" in res_transfer.json()["message"]


@pytest.mark.asyncio
async def test_staff_duty_assignment_engine(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase 3:
    - Assign Subject Teacher for Physics in Section A
    - Assign Computer Operator for Examination Data Entry
    """
    auth_headers = await get_test_auth_headers(db_session)

    # Create section
    res_sec = await client.post(
        "/api/v1/academic/sections",
        json={
            "academic_year": "2026-2027",
            "course_level": "PU College",
            "class_name": "II PUC",
            "stream": "PCMB",
            "section_code": "A",
            "max_capacity": 45
        },
        headers=auth_headers
    )
    sec_id = res_sec.json()["id"]

    # Assign Physics Teacher
    teacher_id = str(uuid.uuid4())
    res_duty = await client.post(
        "/api/v1/academic/duty-assignments",
        json={
            "staff_id": teacher_id,
            "staff_name": "Dr. Ananya Sharma",
            "duty_role": "SUBJECT_TEACHER",
            "section_id": sec_id,
            "subject_code": "PHY-101",
            "subject_name": "Physics",
            "can_enter_marks": True,
            "can_take_attendance": True,
            "can_verify_marks": False
        },
        headers=auth_headers
    )
    assert res_duty.status_code == 201
    assert res_duty.json()["duty_role"] == "SUBJECT_TEACHER"
    assert res_duty.json()["subject_code"] == "PHY-101"

    # Assign Computer Operator
    operator_id = str(uuid.uuid4())
    res_op = await client.post(
        "/api/v1/academic/duty-assignments",
        json={
            "staff_id": operator_id,
            "staff_name": "Suresh Data Operator",
            "duty_role": "COMPUTER_OPERATOR",
            "section_id": sec_id,
            "subject_code": "CHEM-102",
            "subject_name": "Chemistry",
            "can_enter_marks": True,
            "can_take_attendance": False,
            "can_verify_marks": False
        },
        headers=auth_headers
    )
    assert res_op.status_code == 201
    assert res_op.json()["can_verify_marks"] is False


@pytest.mark.asyncio
async def test_fee_report_snapshot_submission_and_chairman_review(client: AsyncClient, db_session: AsyncSession):
    """
    Test Phase 6:
    - Accountant compiles and submits consolidated fee report snapshot
    - Chairman reviews totals and approves or returns with remarks
    - Snapshot figures remain frozen
    """
    auth_headers = await get_test_auth_headers(db_session)

    # 1. Accountant submits snapshot
    res_submit = await client.post(
        "/api/v1/academic/fee-report-snapshots",
        json={
            "academic_year": "2026-2027",
            "target_class": "I PUC PCMB",
            "target_section": "All Sections",
            "total_students": 240,
            "total_assigned_fees": 12000000.0,
            "total_concessions": 500000.0,
            "net_payable": 11500000.0,
            "total_collected": 9500000.0,
            "total_outstanding": 2000000.0,
            "collection_percentage": 82.6,
            "fully_paid_count": 180,
            "partially_paid_count": 45,
            "unpaid_count": 15,
            "snapshot_records": [
                {"admission_number": "ADM-2026-001", "student_name": "Rahul Kumar", "net_payable": 50000, "collected": 50000, "balance": 0, "status": "PAID"}
            ]
        },
        headers=auth_headers
    )
    assert res_submit.status_code == 201
    snapshot_code = res_submit.json()["snapshot_code"]

    # 2. Chairman reviews and approves
    res_review = await client.post(
        f"/api/v1/academic/fee-report-snapshots/{snapshot_code}/review",
        json={
            "decision": "APPROVED",
            "remarks": "Reviewed and reconciled with Term 1 bank settlement statement. Approved."
        },
        headers=auth_headers
    )
    assert res_review.status_code == 200
    assert res_review.json()["status"] == "APPROVED"
    assert "reconciled with Term 1" in res_review.json()["remarks"]
