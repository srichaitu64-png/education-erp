import pytest
import uuid
from datetime import date, datetime, timezone
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tenants.models import Tenant, Campus
from app.modules.academic.models import (
    AcademicSection,
    StudentSectionEnrolment,
    StaffDutyAssignment,
    HallTicket,
    ConsolidatedFeeReportSnapshot
)
from app.modules.finance.models import FeeStructure, FeeInvoice, FeePayment, FeeReceipt
from app.modules.examinations.models import Examination
from app.modules.attendance.models import InstitutionAttendanceConfig, DailyAttendanceRecord


@pytest.mark.asyncio
async def test_academic_sections_cross_tenant_rls_isolation(db_session: AsyncSession):
    """Verify Tenant B cannot read, update, or delete Tenant A's academic sections."""
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()

    # Create tenants as superadmin
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    t_a_code = f"t-a-{uuid.uuid4().hex[:6]}"
    t_b_code = f"t-b-{uuid.uuid4().hex[:6]}"
    t_a = Tenant(id=tenant_a_id, name="Tenant A", code=t_a_code, email=f"{t_a_code}@example.com")
    t_b = Tenant(id=tenant_b_id, name="Tenant B", code=t_b_code, email=f"{t_b_code}@example.com")
    db_session.add_all([t_a, t_b])
    await db_session.flush()

    # Tenant A creates an academic section under erp_app non-superuser role
    await db_session.execute(text("SET ROLE erp_app"))
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'false', true)"))
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_a_id)}
    )
    sec_a = AcademicSection(
        tenant_id=tenant_a_id,
        academic_year="2026-2027",
        course_level="School",
        class_name="Class 10",
        stream="General",
        section_code="A",
        max_capacity=40,
        enrolled_count=1
    )
    db_session.add(sec_a)
    await db_session.flush()
    sec_a_id = sec_a.id

    # Expire session cache so queries go directly to PostgreSQL RLS engine
    db_session.expire_all()

    # Switch session to Tenant B under erp_app role
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_b_id)}
    )

    # 1. READ: Tenant B must not see Tenant A's section
    stmt_b = select(AcademicSection).where(AcademicSection.id == sec_a_id)
    res_b = await db_session.execute(stmt_b)
    assert res_b.scalar_one_or_none() is None, "Tenant B leaked Tenant A's academic section!"

    # 2. UPDATE: Tenant B must not be able to update Tenant A's section
    stmt_upd = (
        text("UPDATE academic_sections SET room_number = 'HACKED' WHERE id = :sec_id")
    )
    res_upd = await db_session.execute(stmt_upd, {"sec_id": str(sec_a_id)})
    assert res_upd.rowcount == 0, "Tenant B was able to modify Tenant A's academic section!"

    # 3. DELETE: Tenant B must not be able to delete Tenant A's section
    stmt_del = text("DELETE FROM academic_sections WHERE id = :sec_id")
    res_del = await db_session.execute(stmt_del, {"sec_id": str(sec_a_id)})
    assert res_del.rowcount == 0, "Tenant B was able to delete Tenant A's academic section!"

    # 4. UNATHENTICATED / CLEARED CONTEXT PROBE
    db_session.expire_all()
    await db_session.execute(text("SELECT set_config('app.current_tenant_id', '', true)"))
    res_cleared = await db_session.execute(stmt_b)
    assert res_cleared.scalar_one_or_none() is None, "Cleared tenant context leaked section!"

    await db_session.execute(text("RESET ROLE"))


@pytest.mark.asyncio
async def test_student_section_enrolments_cross_tenant_rls(db_session: AsyncSession):
    """Verify StudentSectionEnrolment table is strictly isolated by tenant."""
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()

    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    t_a_code = f"t-a-sis-{uuid.uuid4().hex[:6]}"
    t_b_code = f"t-b-sis-{uuid.uuid4().hex[:6]}"
    t_a = Tenant(id=tenant_a_id, name="Tenant A SIS", code=t_a_code, email=f"{t_a_code}@example.com")
    t_b = Tenant(id=tenant_b_id, name="Tenant B SIS", code=t_b_code, email=f"{t_b_code}@example.com")
    db_session.add_all([t_a, t_b])
    await db_session.flush()

    # As Tenant A, create section and enrolment under erp_app role
    await db_session.execute(text("SET ROLE erp_app"))
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'false', true)"))
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_a_id)}
    )
    sec_a = AcademicSection(
        tenant_id=tenant_a_id,
        academic_year="2026-2027",
        course_level="PU College",
        class_name="I PUC",
        stream="PCMB",
        section_code="A"
    )
    db_session.add(sec_a)
    await db_session.flush()

    enrol_a = StudentSectionEnrolment(
        tenant_id=tenant_a_id,
        section_id=sec_a.id,
        student_id=uuid.uuid4(),
        student_name="Confidential Student A",
        admission_number="ADM-A-001"
    )
    db_session.add(enrol_a)
    await db_session.flush()
    enrol_a_id = enrol_a.id

    db_session.expire_all()

    # Switch to Tenant B under erp_app role
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_b_id)}
    )

    # Tenant B query must return None
    res_b = await db_session.execute(
        select(StudentSectionEnrolment).where(StudentSectionEnrolment.id == enrol_a_id)
    )
    assert res_b.scalar_one_or_none() is None, "Tenant B leaked Tenant A's student enrolment!"

    # Unauthenticated query must return None
    db_session.expire_all()
    await db_session.execute(text("SELECT set_config('app.current_tenant_id', '', true)"))
    res_none = await db_session.execute(
        select(StudentSectionEnrolment).where(StudentSectionEnrolment.id == enrol_a_id)
    )
    assert res_none.scalar_one_or_none() is None, "Unauthenticated query leaked enrolment!"

    await db_session.execute(text("RESET ROLE"))


@pytest.mark.asyncio
async def test_staff_duty_assignments_cross_tenant_rls(db_session: AsyncSession):
    """Verify StaffDutyAssignment table is strictly isolated by tenant."""
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()

    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    t_a_code = f"t-a-stf-{uuid.uuid4().hex[:6]}"
    t_b_code = f"t-b-stf-{uuid.uuid4().hex[:6]}"
    t_a = Tenant(id=tenant_a_id, name="Tenant A Staff", code=t_a_code, email=f"{t_a_code}@example.com")
    t_b = Tenant(id=tenant_b_id, name="Tenant B Staff", code=t_b_code, email=f"{t_b_code}@example.com")
    db_session.add_all([t_a, t_b])
    await db_session.flush()

    # Tenant A creates section and duty assignment under erp_app role
    await db_session.execute(text("SET ROLE erp_app"))
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'false', true)"))
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_a_id)}
    )
    sec_a = AcademicSection(
        tenant_id=tenant_a_id,
        academic_year="2026-2027",
        course_level="School",
        class_name="Class 8",
        stream="General",
        section_code="B"
    )
    db_session.add(sec_a)
    await db_session.flush()

    duty_a = StaffDutyAssignment(
        tenant_id=tenant_a_id,
        staff_id=uuid.uuid4(),
        staff_name="Prof. Sharma",
        duty_role="SUBJECT_TEACHER",
        section_id=sec_a.id,
        subject_code="MATH-101",
        subject_name="Mathematics",
        assigned_by_user_id=uuid.uuid4(),
        assigned_by_name="Principal"
    )
    db_session.add(duty_a)
    await db_session.flush()
    duty_a_id = duty_a.id

    db_session.expire_all()

    # Switch to Tenant B under erp_app role
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_b_id)}
    )

    # Tenant B query must return None
    res_b = await db_session.execute(
        select(StaffDutyAssignment).where(StaffDutyAssignment.id == duty_a_id)
    )
    assert res_b.scalar_one_or_none() is None, "Tenant B leaked Tenant A's staff duty assignment!"

    await db_session.execute(text("RESET ROLE"))


@pytest.mark.asyncio
async def test_hall_tickets_and_fee_snapshots_rls(db_session: AsyncSession):
    """Verify HallTicket and ConsolidatedFeeReportSnapshot are strictly isolated."""
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()

    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'true', true)"))
    t_a_code = f"t-a-exm-{uuid.uuid4().hex[:6]}"
    t_b_code = f"t-b-exm-{uuid.uuid4().hex[:6]}"
    t_a = Tenant(id=tenant_a_id, name="Tenant A Exam", code=t_a_code, email=f"{t_a_code}@example.com")
    t_b = Tenant(id=tenant_b_id, name="Tenant B Exam", code=t_b_code, email=f"{t_b_code}@example.com")
    db_session.add_all([t_a, t_b])
    await db_session.flush()

    # Tenant A creates exam and hall ticket under erp_app role
    await db_session.execute(text("SET ROLE erp_app"))
    await db_session.execute(text("SELECT set_config('app.is_superadmin', 'false', true)"))
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_a_id)}
    )

    exam_a = Examination(
        tenant_id=tenant_a_id,
        name="Annual Board Exam 2026",
        code=f"EXAM-{uuid.uuid4().hex[:6]}",
        category="final",
        academic_year="2026-2027",
        target_class="Class 10",
        target_section="A",
        subject_code="ENG-101",
        subject_name="English Core",
        exam_date=date(2026, 12, 1),
        start_time="09:00 AM",
        end_time="12:00 PM",
        max_marks=100.0,
        passing_marks=35.0
    )
    db_session.add(exam_a)
    await db_session.flush()

    ticket_a = HallTicket(
        tenant_id=tenant_a_id,
        examination_id=exam_a.id,
        student_id=uuid.uuid4(),
        ticket_number=f"HT-{uuid.uuid4().hex[:8].upper()}",
        admission_number="ADM-A-009",
        student_name="Exam Candidate A",
        class_name="Class 10",
        section_code="A",
        exam_centre="Campus Main",
        room_number="Room 101",
        seat_number="S-12",
        qr_verification_code="SECURE-PAYLOAD-A",
        issued_by_name="Controller"
    )
    snapshot_a = ConsolidatedFeeReportSnapshot(
        tenant_id=tenant_a_id,
        snapshot_code=f"SNAP-{uuid.uuid4().hex[:8].upper()}",
        academic_year="2026-2027",
        submitted_by_user_id=uuid.uuid4(),
        submitted_by_name="Accountant A",
        total_students=100,
        total_assigned_fees=5000000.0,
        total_concessions=200000.0,
        net_payable=4800000.0,
        total_collected=4500000.0,
        total_outstanding=300000.0,
        collection_percentage=93.75,
        fully_paid_count=90,
        partially_paid_count=8,
        unpaid_count=2,
        snapshot_records=[]
    )
    db_session.add_all([ticket_a, snapshot_a])
    await db_session.flush()

    ticket_a_id = ticket_a.id
    snapshot_a_id = snapshot_a.id

    db_session.expire_all()

    # Switch to Tenant B under erp_app role
    await db_session.execute(
        text("SELECT set_config('app.current_tenant_id', :tid, true)"),
        {"tid": str(tenant_b_id)}
    )

    # Tenant B query must return None for both
    res_ticket = await db_session.execute(select(HallTicket).where(HallTicket.id == ticket_a_id))
    assert res_ticket.scalar_one_or_none() is None, "Tenant B leaked Tenant A's hall ticket!"

    res_snap = await db_session.execute(
        select(ConsolidatedFeeReportSnapshot).where(ConsolidatedFeeReportSnapshot.id == snapshot_a_id)
    )
    assert res_snap.scalar_one_or_none() is None, "Tenant B leaked Tenant A's fee snapshot!"

    await db_session.execute(text("RESET ROLE"))
