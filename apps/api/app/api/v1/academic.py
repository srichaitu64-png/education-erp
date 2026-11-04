import uuid
from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.database.session import get_db, get_current_tenant_id
from app.security.deps import get_current_user
from app.modules.identity.models import User
from app.modules.tenants.models import Tenant
from app.modules.academic.models import (
    AcademicSection,
    StudentSectionEnrolment,
    StaffDutyAssignment,
    HallTicket,
    ConsolidatedFeeReportSnapshot,
)
from app.modules.academic.schemas import (
    AcademicSectionCreate,
    AcademicSectionResponse,
    SectionTransferRequest,
    StaffDutyAssignmentCreate,
    StaffDutyAssignmentResponse,
    HallTicketCreateRequest,
    HallTicketResponse,
    FeeReportSnapshotSubmit,
    FeeReportSnapshotReview,
)

router = APIRouter(prefix="/academic", tags=["Academic Operations & Duty Assignments"])


@router.get("/sections", response_model=List[AcademicSectionResponse])
async def list_academic_sections(
    academic_year: str = "2026-2027",
    class_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List all configured academic sections for the institution."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    query = select(AcademicSection).where(
        AcademicSection.tenant_id == tenant_id,
        AcademicSection.academic_year == academic_year
    )
    if class_name:
        query = query.where(AcademicSection.class_name == class_name)
    
    result = await db.execute(query.order_by(AcademicSection.class_name, AcademicSection.section_code))
    return result.scalars().all()


@router.post("/sections", response_model=AcademicSectionResponse, status_code=status.HTTP_201_CREATED)
async def create_academic_section(
    payload: AcademicSectionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Create a new academic section (e.g. Class 6 Section D, or I PUC PCMB Section F).
    Prevents duplicate section codes within the same academic level and enforces capacity limit.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    dup_check = await db.execute(
        select(AcademicSection).where(
            AcademicSection.tenant_id == tenant_id,
            AcademicSection.academic_year == payload.academic_year,
            AcademicSection.class_name == payload.class_name,
            AcademicSection.stream == payload.stream,
            AcademicSection.section_code == payload.section_code.upper()
        )
    )
    if dup_check.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Section '{payload.section_code.upper()}' already exists for {payload.class_name} ({payload.academic_year})."
        )
    
    section = AcademicSection(
        tenant_id=tenant_id,
        academic_year=payload.academic_year,
        course_level=payload.course_level,
        class_name=payload.class_name,
        stream=payload.stream,
        section_code=payload.section_code.upper(),
        room_number=payload.room_number,
        max_capacity=payload.max_capacity,
        enrolled_count=0,
        class_teacher_name=payload.class_teacher_name,
        status="ACTIVE"
    )
    db.add(section)
    await db.commit()
    await db.refresh(section)
    return section


@router.post("/sections/transfer", status_code=status.HTTP_200_OK)
async def transfer_student_section(
    payload: SectionTransferRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Transfer a student from one section to another.
    Enforces target section capacity and preserves historical attendance, marks, and fee records.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    target_sec = await db.get(AcademicSection, payload.target_section_id)
    if not target_sec or target_sec.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target section not found.")
    
    if target_sec.enrolled_count >= target_sec.max_capacity:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Target section '{target_sec.section_code}' has reached its maximum capacity of {target_sec.max_capacity} students."
        )

    # 2. Update existing active enrolment
    active_enrolment = await db.execute(
        select(StudentSectionEnrolment).where(
            StudentSectionEnrolment.student_id == payload.student_id,
            StudentSectionEnrolment.section_id == payload.source_section_id,
            StudentSectionEnrolment.status == "ACTIVE"
        )
    )
    enrolment = active_enrolment.scalars().first()
    if enrolment:
        enrolment.status = "TRANSFERRED"
        enrolment.transfer_reason = payload.reason
        enrolment.transfer_effective_date = payload.effective_date
        enrolment.transfer_approved_by = user.full_name

    # 3. Create new enrolment in target section
    new_enrolment = StudentSectionEnrolment(
        tenant_id=tenant_id,
        section_id=payload.target_section_id,
        student_id=payload.student_id,
        student_name=enrolment.student_name if enrolment else "Enrolled Student",
        admission_number=enrolment.admission_number if enrolment else "ADM-TRANSFER",
        enrolment_date=payload.effective_date,
        status="ACTIVE"
    )
    db.add(new_enrolment)

    # 4. Update capacity counters
    target_sec.enrolled_count += 1
    source_sec = await db.get(AcademicSection, payload.source_section_id)
    if source_sec and source_sec.enrolled_count > 0:
        source_sec.enrolled_count -= 1

    await db.commit()
    return {
        "status": "SUCCESS",
        "message": f"Student transferred to Section {target_sec.section_code} successfully. Historical records preserved.",
        "effective_date": payload.effective_date.isoformat(),
        "target_enrolled_count": target_sec.enrolled_count
    }


@router.post("/duty-assignments", response_model=StaffDutyAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def assign_staff_duty(
    payload: StaffDutyAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Assign staff responsibilities (Class Teacher, Subject Teacher, Computer Operator).
    Enforces scoped access control: e.g. Physics Teacher only enters marks for assigned sections.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    section = await db.get(AcademicSection, payload.section_id)
    if not section or section.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned section not found.")
    
    assignment = StaffDutyAssignment(
        tenant_id=tenant_id,
        staff_id=payload.staff_id,
        staff_name=payload.staff_name,
        duty_role=payload.duty_role,
        section_id=payload.section_id,
        subject_code=payload.subject_code,
        subject_name=payload.subject_name,
        examination_id=payload.examination_id,
        can_enter_marks=payload.can_enter_marks,
        can_take_attendance=payload.can_take_attendance,
        can_verify_marks=payload.can_verify_marks,
        effective_from=payload.effective_from,
        effective_until=payload.effective_until,
        assigned_by_user_id=user.id,
        assigned_by_name=user.full_name,
        is_active=True
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.post("/fee-report-snapshots", status_code=status.HTTP_201_CREATED)
async def submit_fee_report_snapshot(
    payload: FeeReportSnapshotSubmit,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Accountant submits a formal consolidated fee report snapshot to the Chairman/Director.
    Captures exact frozen figures at submission time.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    snapshot_code = f"FEE-SNAP-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    snapshot = ConsolidatedFeeReportSnapshot(
        tenant_id=tenant_id,
        snapshot_code=snapshot_code,
        academic_year=payload.academic_year,
        target_class=payload.target_class,
        target_section=payload.target_section,
        submitted_by_user_id=user.id,
        submitted_by_name=user.full_name,
        submitted_at=datetime.now(timezone.utc),
        total_students=payload.total_students,
        total_assigned_fees=payload.total_assigned_fees,
        total_concessions=payload.total_concessions,
        net_payable=payload.net_payable,
        total_collected=payload.total_collected,
        total_outstanding=payload.total_outstanding,
        collection_percentage=payload.collection_percentage,
        fully_paid_count=payload.fully_paid_count,
        partially_paid_count=payload.partially_paid_count,
        unpaid_count=payload.unpaid_count,
        snapshot_records=payload.snapshot_records,
        review_status="SUBMITTED"
    )
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)
    return {
        "status": "SUBMITTED",
        "snapshot_code": snapshot_code,
        "submitted_at": snapshot.submitted_at.isoformat(),
        "message": "Consolidated fee report snapshot submitted to Chairman / Director for review."
    }


@router.post("/fee-report-snapshots/{snapshot_code}/review", status_code=status.HTTP_200_OK)
async def review_fee_report_snapshot(
    snapshot_code: str,
    payload: FeeReportSnapshotReview,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Chairman / Director reviews a submitted fee report snapshot: Accepts or Returns with remarks.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    result = await db.execute(
        select(ConsolidatedFeeReportSnapshot).where(
            ConsolidatedFeeReportSnapshot.tenant_id == tenant_id,
            ConsolidatedFeeReportSnapshot.snapshot_code == snapshot_code
        )
    )
    snapshot = result.scalars().first()
    if not snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee report snapshot not found.")

    snapshot.review_status = payload.decision
    snapshot.reviewed_by_user_id = user.id
    snapshot.reviewed_by_name = user.full_name
    snapshot.reviewed_at = datetime.now(timezone.utc)
    snapshot.review_remarks = payload.remarks

    await db.commit()
    return {
        "status": snapshot.review_status,
        "snapshot_code": snapshot_code,
        "reviewed_by": user.full_name,
        "remarks": payload.remarks
    }
