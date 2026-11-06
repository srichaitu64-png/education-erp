import uuid
import secrets
from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, text
from sqlalchemy.orm import selectinload, joinedload

from app.database.session import get_db, get_current_tenant_id, set_current_tenant_id
from app.security.deps import get_current_user, require_permission
from app.modules.identity.models import User, UserRole, Role
from app.modules.tenants.models import Tenant
from app.modules.finance.models import FeeInvoice
from app.modules.attendance.models import DailyAttendanceRecord
from app.modules.examinations.models import Examination, ExamAttendanceAndMarks
from app.modules.academic.models import (
    AcademicSection,
    StudentSectionEnrolment,
    StaffDutyAssignment,
    HallTicket,
    ConsolidatedFeeReportSnapshot,
    Student,
    AdmissionApplication,
    SubjectCatalog,
    InstitutionSubject,
    ClassSubjectMapping,
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
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentDetailResponse,
    StudentListOut,
    AdmissionApplicationCreate,
    AdmissionApplicationResponse,
    AdmissionApproveRequest,
    StaffUserOut,
    PortalMeResponse,
    SubjectCatalogCreate,
    SubjectCatalogUpdate,
    SubjectCatalogOut,
    InstitutionSubjectCreate,
    InstitutionSubjectOut,
    ClassSubjectMappingCreate,
    ClassSubjectMappingUpdate,
    ClassSubjectMappingOut,
    ReorderCurriculumRequest,
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


# ===========================================================================
# Canonical Student Master (SIS) Endpoints
# ===========================================================================
@router.get("/students", response_model=StudentListOut)
async def list_students(
    search: Optional[str] = None,
    class_name: Optional[str] = None,
    section_code: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    List students enrolled in the active institution with filtering, searching and pagination.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    query = select(Student).where(Student.tenant_id == tenant_id)
    if status_filter:
        query = query.where(Student.status == status_filter)
    else:
        query = query.where(Student.status != "ARCHIVED")

    if class_name:
        query = query.where(Student.class_name == class_name)
    if section_code:
        query = query.where(Student.section_or_stream == section_code)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Student.first_name.ilike(search_pattern),
                Student.last_name.ilike(search_pattern),
                Student.admission_number.ilike(search_pattern),
                Student.parent_email.ilike(search_pattern),
                Student.father_name.ilike(search_pattern)
            )
        )

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    skip = max(0, (page - 1) * page_size)
    stmt = query.order_by(Student.class_name, Student.section_or_stream, Student.admission_number).offset(skip).limit(page_size)
    results = (await db.execute(stmt)).scalars().all()
    return StudentListOut(
        items=[StudentResponse.model_validate(s) for s in results],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    payload: StudentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Register a student into the canonical student master.
    Auto-generates unique admission number if not provided.
    Automatically assigns and enrols into matching academic section if configured.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    adm_no = payload.admission_number
    if not adm_no:
        count_res = await db.execute(
            select(func.count(Student.id)).where(Student.tenant_id == tenant_id)
        )
        total_students = count_res.scalar_one() or 0
        adm_no = f"ADM-{datetime.now().year}-{total_students + 1:04d}"
    else:
        dup = await db.execute(
            select(Student).where(Student.tenant_id == tenant_id, Student.admission_number == adm_no)
        )
        if dup.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Admission number '{adm_no}' is already registered in this institution."
            )

    student = Student(
        tenant_id=tenant_id,
        admission_number=adm_no,
        pen_number=payload.pen_number,
        registration_number=payload.registration_number,
        first_name=payload.first_name,
        middle_name=payload.middle_name,
        last_name=payload.last_name,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        blood_group=payload.blood_group,
        father_name=payload.father_name,
        mother_name=payload.mother_name,
        guardian_name=payload.guardian_name,
        father_mobile=payload.father_mobile,
        mother_mobile=payload.mother_mobile,
        guardian_phone=payload.guardian_phone,
        parent_email=payload.parent_email,
        emergency_contact=payload.emergency_contact,
        door_street=payload.door_street,
        city_town=payload.city_town,
        district_state=payload.district_state,
        pincode=payload.pincode,
        academic_year=payload.academic_year,
        institution_level=payload.institution_level,
        class_name=payload.class_name,
        section_or_stream=payload.section_or_stream,
        roll_number=payload.roll_number,
        admission_date=payload.admission_date,
        status=payload.status or "ACTIVE",
        masked_aadhaar=payload.masked_aadhaar,
        fee_balance=payload.fee_balance,
        attendance_pct=payload.attendance_pct
    )
    db.add(student)
    await db.flush()

    # Automatically find section and create StudentSectionEnrolment if section exists
    sec_stmt = select(AcademicSection).where(
        AcademicSection.tenant_id == tenant_id,
        AcademicSection.academic_year == payload.academic_year,
        AcademicSection.class_name == payload.class_name,
        AcademicSection.section_code == payload.section_or_stream.upper()
    )
    sec_res = await db.execute(sec_stmt)
    matching_sec = sec_res.scalars().first()
    if matching_sec:
        enrol = StudentSectionEnrolment(
            tenant_id=tenant_id,
            section_id=matching_sec.id,
            student_id=student.id,
            student_name=f"{student.first_name} {student.last_name}",
            admission_number=student.admission_number,
            roll_number=student.roll_number,
            enrolment_date=student.admission_date,
            status="ACTIVE"
        )
        db.add(enrol)
        matching_sec.enrolled_count += 1

    await db.commit()
    await db.refresh(student)
    return student


@router.get("/students/{student_id}", response_model=StudentDetailResponse)
async def get_student_details(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Retrieve complete 360-degree student profile including enrolments, fee status, and attendance."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    student = await db.get(Student, student_id)
    if not student or student.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student record not found.")

    # Enrolments
    enrol_res = await db.execute(
        select(StudentSectionEnrolment).where(StudentSectionEnrolment.student_id == student_id)
    )
    enrolments = [
        {
            "id": str(e.id),
            "section_id": str(e.section_id),
            "enrolment_date": e.enrolment_date.isoformat(),
            "status": e.status,
            "roll_number": e.roll_number
        }
        for e in enrol_res.scalars().all()
    ]

    # Fee Invoices
    inv_res = await db.execute(
        select(FeeInvoice).where(
            FeeInvoice.tenant_id == tenant_id,
            or_(FeeInvoice.student_id == student_id, FeeInvoice.admission_number == student.admission_number)
        )
    )
    invoices = [
        {
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "fee_title": inv.fee_title,
            "total_amount": inv.total_amount,
            "paid_amount": inv.paid_amount,
            "balance_amount": inv.balance_amount,
            "status": inv.status,
            "due_date": inv.due_date.isoformat() if inv.due_date else None
        }
        for inv in inv_res.scalars().all()
    ]

    # Daily Attendance Records
    att_res = await db.execute(
        select(DailyAttendanceRecord).where(
            DailyAttendanceRecord.tenant_id == tenant_id,
            DailyAttendanceRecord.student_id == student_id
        ).order_by(DailyAttendanceRecord.attendance_date.desc()).limit(15)
    )
    recent_att = [
        {
            "date": a.attendance_date.isoformat(),
            "status": a.status,
            "remarks": a.absence_reason or ""
        }
        for a in att_res.scalars().all()
    ]

    resp = StudentDetailResponse.model_validate(student)
    resp.enrolments = enrolments
    resp.fee_invoices = invoices
    resp.recent_attendance = recent_att
    return resp


@router.put("/students/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: uuid.UUID,
    payload: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update canonical student record attributes."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    student = await db.get(Student, student_id)
    if not student or student.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, val)

    await db.commit()
    await db.refresh(student)
    return student


@router.delete("/students/{student_id}", status_code=status.HTTP_200_OK)
async def withdraw_student(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Soft-delete / mark student as WITHDRAWN."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    student = await db.get(Student, student_id)
    if not student or student.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    student.status = "WITHDRAWN"
    await db.commit()
    return {"status": "SUCCESS", "message": f"Student {student.first_name} {student.last_name} marked as WITHDRAWN."}


# ===========================================================================
# Admissions Workflow Endpoints
# ===========================================================================
@router.get("/admissions", response_model=List[AdmissionApplicationResponse])
async def list_admission_applications(
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List prospective student admission applications."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    stmt = select(AdmissionApplication).where(AdmissionApplication.tenant_id == tenant_id)
    if status_filter:
        stmt = stmt.where(AdmissionApplication.status == status_filter)
    stmt = stmt.order_by(AdmissionApplication.submission_date.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/admissions", response_model=AdmissionApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_admission_application(
    payload: AdmissionApplicationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Submit a prospective student admission application."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    count_res = await db.execute(
        select(func.count(AdmissionApplication.id)).where(AdmissionApplication.tenant_id == tenant_id)
    )
    total_apps = count_res.scalar_one() or 0
    app_no = f"APP-{datetime.now().year}-{total_apps + 1:04d}"

    app_entry = AdmissionApplication(
        tenant_id=tenant_id,
        application_number=app_no,
        applicant_name=payload.applicant_name,
        level=payload.level,
        target_class=payload.target_class,
        parent_name=payload.parent_name,
        parent_phone=payload.parent_phone,
        parent_email=payload.parent_email,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        address=payload.address,
        submission_date=date.today(),
        status="PENDING"
    )
    db.add(app_entry)
    await db.commit()
    await db.refresh(app_entry)
    return app_entry


@router.post("/admissions/{admission_id}/approve", status_code=status.HTTP_200_OK)
async def approve_admission_application(
    admission_id: uuid.UUID,
    payload: AdmissionApproveRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Approve an admission application:
    Automatically enrolls the applicant as a canonical Student and registers section enrolment.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    app_entry = await db.get(AdmissionApplication, admission_id)
    if not app_entry or app_entry.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admission application not found.")

    if app_entry.status == "APPROVED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application is already approved.")

    parts = app_entry.applicant_name.strip().split(" ", 1)
    f_name = parts[0]
    l_name = parts[1] if len(parts) > 1 else "Student"

    count_res = await db.execute(
        select(func.count(Student.id)).where(Student.tenant_id == tenant_id)
    )
    total_students = count_res.scalar_one() or 0
    adm_no = f"ADM-{datetime.now().year}-{total_students + 1:04d}"

    new_student = Student(
        tenant_id=tenant_id,
        admission_number=adm_no,
        first_name=f_name,
        last_name=l_name,
        date_of_birth=app_entry.date_of_birth,
        gender=app_entry.gender,
        father_name=app_entry.parent_name,
        guardian_name=app_entry.parent_name,
        father_mobile=app_entry.parent_phone,
        guardian_phone=app_entry.parent_phone,
        parent_email=app_entry.parent_email,
        door_street=app_entry.address,
        academic_year=payload.academic_year,
        institution_level=app_entry.level,
        class_name=app_entry.target_class,
        section_or_stream=payload.section_code,
        admission_date=date.today(),
        status="ACTIVE"
    )
    db.add(new_student)
    await db.flush()

    app_entry.status = "APPROVED"
    app_entry.reviewed_by = user.full_name
    app_entry.review_notes = payload.review_notes or "Admission approved and student enrolled."
    app_entry.enrolled_student_id = new_student.id

    sec_stmt = select(AcademicSection).where(
        AcademicSection.tenant_id == tenant_id,
        AcademicSection.academic_year == payload.academic_year,
        AcademicSection.class_name == app_entry.target_class,
        AcademicSection.section_code == payload.section_code.upper()
    )
    sec_res = await db.execute(sec_stmt)
    matching_sec = sec_res.scalars().first()
    if matching_sec:
        enrol = StudentSectionEnrolment(
            tenant_id=tenant_id,
            section_id=matching_sec.id,
            student_id=new_student.id,
            student_name=app_entry.applicant_name,
            admission_number=adm_no,
            enrolment_date=date.today(),
            status="ACTIVE"
        )
        db.add(enrol)
        matching_sec.enrolled_count += 1

    await db.commit()
    return {
        "status": "APPROVED",
        "message": f"Application approved! Student enrolled successfully with Admission Number {adm_no}.",
        "student_id": str(new_student.id),
        "admission_number": adm_no
    }


# ===========================================================================
# Faculty / Staff Directory & Duties Endpoints
# ===========================================================================
@router.get("/duty-assignments", response_model=List[StaffDutyAssignmentResponse])
async def list_staff_duty_assignments(
    staff_id: Optional[uuid.UUID] = None,
    section_id: Optional[uuid.UUID] = None,
    duty_role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List staff duty assignments with optional staff/section/role filters."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    stmt = select(StaffDutyAssignment).where(
        StaffDutyAssignment.tenant_id == tenant_id,
        StaffDutyAssignment.is_active == True
    )
    if staff_id:
        stmt = stmt.where(StaffDutyAssignment.staff_id == staff_id)
    if section_id:
        stmt = stmt.where(StaffDutyAssignment.section_id == section_id)
    if duty_role:
        stmt = stmt.where(StaffDutyAssignment.duty_role == duty_role)

    stmt = stmt.order_by(StaffDutyAssignment.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/staff", response_model=List[StaffUserOut])
async def list_institution_staff(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List faculty and staff members active within the institution."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    stmt = (
        select(User, Role.code)
        .join(UserRole, User.id == UserRole.user_id)
        .join(Role, UserRole.role_id == Role.id)
        .where(UserRole.tenant_id == tenant_id, User.is_active == True)
    )
    res = await db.execute(stmt)
    staff_list = []
    seen_ids = set()
    for u, role_code in res.all():
        if u.id not in seen_ids:
            seen_ids.add(u.id)
            staff_list.append(
                StaffUserOut(
                    id=u.id,
                    full_name=u.full_name,
                    email=u.email,
                    role=role_code,
                    is_active=u.is_active
                )
            )
    return staff_list


# ===========================================================================
# Hall Tickets Endpoints
# ===========================================================================
@router.post("/hall-tickets/generate", status_code=status.HTTP_201_CREATED)
async def generate_hall_tickets(
    payload: HallTicketCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Batch generate official examination hall tickets for students in class/section."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    exam = await db.get(Examination, payload.examination_id)
    if not exam or exam.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examination not found.")

    query = select(Student).where(
        Student.tenant_id == tenant_id,
        Student.class_name == payload.class_name,
        Student.status == "ACTIVE"
    )
    if payload.section_code:
        query = query.where(Student.section_or_stream == payload.section_code)

    students = (await db.execute(query)).scalars().all()
    if not students:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active students found for target class/section.")

    generated_count = 0
    for idx, s in enumerate(students):
        existing = await db.execute(
            select(HallTicket).where(
                HallTicket.tenant_id == tenant_id,
                HallTicket.examination_id == payload.examination_id,
                HallTicket.student_id == s.id
            )
        )
        if existing.scalars().first():
            continue

        exam_name = getattr(exam, "name", None) or getattr(exam, "title", "Examination")
        ticket_no = f"HT-{exam.id.hex[:6].upper()}-{s.admission_number}"
        seat_no = f"S-{(idx + 1):03d}"
        # Random bearer secret: do not derive QR credentials from public ticket data.
        qr_code = secrets.token_urlsafe(32)

        ht = HallTicket(
            tenant_id=tenant_id,
            examination_id=payload.examination_id,
            student_id=s.id,
            ticket_number=ticket_no,
            admission_number=s.admission_number,
            student_name=f"{s.first_name} {s.last_name}",
            class_name=s.class_name,
            section_code=s.section_or_stream,
            exam_centre="Pilot Institution Main Campus",
            room_number=payload.room_number or "Hall 101",
            seat_number=seat_no,
            eligibility_status="ELIGIBLE" if (not payload.enforce_fee_clearance or s.fee_balance <= 0) else "PENDING_FEE_APPROVAL",
            qr_verification_code=qr_code,
            timetable_snapshot=[{
                "exam_title": exam_name,
                "exam_date": exam.exam_date.isoformat() if exam.exam_date else "",
                "subject": exam.subject_code or "Core"
            }],
            issued_by_name=user.full_name,
            is_revoked=False
        )
        db.add(ht)
        generated_count += 1

    await db.commit()
    exam_name = getattr(exam, "name", None) or getattr(exam, "title", "Examination")
    return {
        "status": "SUCCESS",
        "message": f"Generated {generated_count} hall tickets for examination '{exam_name}'.",
        "generated_count": generated_count
    }


@router.get("/hall-tickets", response_model=List[HallTicketResponse])
async def list_hall_tickets(
    examination_id: Optional[uuid.UUID] = None,
    class_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List generated examination hall tickets."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    stmt = select(HallTicket).where(HallTicket.tenant_id == tenant_id)
    if examination_id:
        stmt = stmt.where(HallTicket.examination_id == examination_id)
    if class_name:
        stmt = stmt.where(HallTicket.class_name == class_name)
    stmt = stmt.order_by(HallTicket.class_name, HallTicket.seat_number)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/hall-tickets/verify/{ticket_number}")
async def verify_hall_ticket(
    ticket_number: str,
    tenant_id: uuid.UUID = Query(...),
    verification_code: str = Query(..., min_length=24, max_length=128),
    db: AsyncSession = Depends(get_db)
):
    """Public QR verification requires both tenant scope and the ticket's bearer secret."""
    set_current_tenant_id(tenant_id)
    db.info["rls_tenant_id"] = tenant_id
    await db.execute(
        text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
        {"tenant_id": str(tenant_id)}
    )
    stmt = select(HallTicket).where(
        HallTicket.tenant_id == tenant_id,
        HallTicket.ticket_number == ticket_number,
        HallTicket.qr_verification_code == verification_code,
    )
    res = await db.execute(stmt)
    ht = res.scalars().first()
    if not ht:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid or unrecognized hall ticket.")

    return {
        "valid": not ht.is_revoked and ht.eligibility_status == "ELIGIBLE",
        "ticket_number": ht.ticket_number,
        "student_name": ht.student_name,
        "admission_number": ht.admission_number,
        "class_name": ht.class_name,
        "section_code": ht.section_code,
        "seat_number": ht.seat_number,
        "room_number": ht.room_number,
        "eligibility_status": ht.eligibility_status,
        "is_revoked": ht.is_revoked
    }


# ===========================================================================
# Student & Parent Portal Context Endpoint
# ===========================================================================
@router.get("/portal/me", response_model=PortalMeResponse)
async def get_portal_my_profile(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Contextual profile endpoint for Student and Parent portals.
    Resolves student record from authenticated user context, returning attendance summary,
    fee balance, recent exam marks, and active hall tickets.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    user_role = "SUPER_ADMIN" if getattr(user, "is_superadmin", False) else (
        getattr(user.roles[0], "role", None).code if user.roles and getattr(user.roles[0], "role", None) else "STUDENT"
    )

    student_stmt = select(Student).where(
        Student.tenant_id == tenant_id,
        or_(
            Student.parent_email == user.email,
            Student.emergency_contact == user.email,
            Student.admission_number.ilike(f"%{user.email.split('@')[0]}%")
        )
    )
    res = await db.execute(student_stmt)
    student = res.scalars().first()

    if not student:
        fallback_stmt = select(Student).where(Student.tenant_id == tenant_id).limit(1)
        student = (await db.execute(fallback_stmt)).scalars().first()

    student_profile = StudentResponse.model_validate(student) if student else None

    fee_summary = None
    att_summary = None
    marks_list = []
    tickets = []

    if student:
        fee_summary = {
            "fee_balance": student.fee_balance,
            "status": "PAID" if student.fee_balance <= 0 else "PARTIAL"
        }
        att_summary = {
            "attendance_pct": student.attendance_pct,
            "status": "GOOD" if student.attendance_pct >= 75.0 else "SHORTAGE"
        }
        marks_stmt = select(ExamAttendanceAndMarks).where(
            ExamAttendanceAndMarks.tenant_id == tenant_id,
            ExamAttendanceAndMarks.student_id == student.id
        ).limit(10)
        m_res = await db.execute(marks_stmt)
        marks_list = [
            {
                "subject": m.subject_name or m.subject_code,
                "marks_obtained": m.marks_obtained,
                "max_marks": m.max_marks,
                "grade": m.grade,
                "percentage": m.percentage
            }
            for m in m_res.scalars().all()
        ]
        ht_stmt = select(HallTicket).where(
            HallTicket.tenant_id == tenant_id,
            HallTicket.student_id == student.id
        )
        tickets = (await db.execute(ht_stmt)).scalars().all()

    return PortalMeResponse(
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user_role,
        student_profile=student_profile,
        attendance_summary=att_summary,
        fee_summary=fee_summary,
        recent_marks=marks_list,
        hall_tickets=[HallTicketResponse.model_validate(t) for t in tickets]
    )


# ===========================================================================
# Production-Grade Subject Catalogue & Curriculum Management Endpoints
# ===========================================================================

@router.get("/subjects", response_model=List[SubjectCatalogOut])
async def list_subject_catalogue(
    category: Optional[str] = None,
    search: Optional[str] = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    List subjects in the catalogue accessible to the active tenant.
    Returns global system subjects (tenant_id IS NULL) + custom subjects created by this tenant.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else None)

    stmt = select(SubjectCatalog).where(
        or_(
            SubjectCatalog.tenant_id == None,
            SubjectCatalog.tenant_id == tenant_id
        )
    )
    if active_only:
        stmt = stmt.where(SubjectCatalog.is_active == True)
    if category and category != "ALL":
        stmt = stmt.where(SubjectCatalog.category == category)
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(SubjectCatalog.code).like(term),
                func.lower(SubjectCatalog.name).like(term),
                func.lower(SubjectCatalog.category).like(term)
            )
        )
    stmt = stmt.order_by(SubjectCatalog.category.asc(), SubjectCatalog.code.asc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/subjects", response_model=SubjectCatalogOut, status_code=status.HTTP_201_CREATED)
async def create_subject_catalogue_entry(
    payload: SubjectCatalogCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """
    Create a custom subject in the master catalogue for the active institution.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else None)
    clean_code = payload.code.strip().upper()

    # Check for duplicate code in tenant scope or global catalog
    stmt_check = select(SubjectCatalog).where(
        SubjectCatalog.code == clean_code,
        or_(SubjectCatalog.tenant_id == tenant_id, SubjectCatalog.tenant_id == None)
    )
    res_check = await db.execute(stmt_check)
    existing = res_check.scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A subject with code '{clean_code}' already exists in the catalogue ({existing.name})."
        )

    # Validate marks
    if payload.has_practical and payload.default_practical_max <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Subjects with practicals must have default practical marks greater than zero."
        )

    subject = SubjectCatalog(
        tenant_id=tenant_id,
        code=clean_code,
        name=payload.name.strip(),
        category=payload.category,
        description=payload.description,
        has_practical=payload.has_practical,
        default_theory_max=payload.default_theory_max,
        default_practical_max=payload.default_practical_max if payload.has_practical else 0.0,
        credits=payload.credits,
        is_active=payload.is_active,
        created_by=user.id
    )
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.get("/subjects/{subject_id}", response_model=SubjectCatalogOut)
async def get_subject_catalogue_entry(
    subject_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get single catalogue subject by ID."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else None)
    subject = await db.get(SubjectCatalog, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    if subject.tenant_id is not None and subject.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    if subject.tenant_id is not None and subject.tenant_id != tenant_id and not user.is_superadmin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access to subject forbidden.")
    return subject


@router.put("/subjects/{subject_id}", response_model=SubjectCatalogOut)
async def update_subject_catalogue_entry(
    subject_id: uuid.UUID,
    payload: SubjectCatalogUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """Update catalogue subject details."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else None)
    subject = await db.get(SubjectCatalog, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    if subject.tenant_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Global catalogue subjects are read-only for institutions. Create an institution-specific subject instead.")
    if subject.tenant_id is not None and subject.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    if subject.tenant_id is not None and subject.tenant_id != tenant_id and not user.is_superadmin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify other institution's subject.")

    if payload.name is not None:
        subject.name = payload.name.strip()
    if payload.category is not None:
        subject.category = payload.category
    if payload.description is not None:
        subject.description = payload.description
    if payload.has_practical is not None:
        subject.has_practical = payload.has_practical
    if payload.default_theory_max is not None:
        subject.default_theory_max = payload.default_theory_max
    if payload.default_practical_max is not None:
        subject.default_practical_max = payload.default_practical_max
    if payload.credits is not None:
        subject.credits = payload.credits
    if payload.is_active is not None:
        subject.is_active = payload.is_active
    subject.updated_by = user.id

    await db.commit()
    await db.refresh(subject)
    return subject


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_200_OK)
async def archive_or_delete_subject(
    subject_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """
    Safely archive or delete a subject.
    If the subject has active class mappings or exam marks, soft-archives it (is_active = False).
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else None)
    subject = await db.get(SubjectCatalog, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    if subject.tenant_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Global catalogue subjects cannot be archived by an institution.")
    if subject.tenant_id is not None and subject.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")

    # Check if subject is adopted in institution_subjects
    stmt_inst = select(InstitutionSubject).where(
        InstitutionSubject.subject_id == subject_id,
        InstitutionSubject.tenant_id == tenant_id
    )
    inst_subj = (await db.execute(stmt_inst)).scalars().first()

    has_mappings = False
    if inst_subj:
        stmt_map = select(ClassSubjectMapping).where(
            ClassSubjectMapping.institution_subject_id == inst_subj.id,
            ClassSubjectMapping.tenant_id == tenant_id,
            ClassSubjectMapping.is_active == True
        )
        has_mappings = (await db.execute(stmt_map)).scalars().first() is not None

    if has_mappings:
        subject.is_active = False
        if inst_subj:
            inst_subj.is_active = False
        await db.commit()
        return {
            "status": "ARCHIVED",
            "message": f"Subject '{subject.code}' is currently assigned in curriculum; archived safely from catalogue."
        }

    # Soft delete subject
    subject.is_active = False
    if inst_subj:
        inst_subj.is_active = False
    await db.commit()
    return {
        "status": "ARCHIVED",
        "message": f"Subject '{subject.code}' successfully archived from catalogue."
    }


@router.post("/subjects/templates/load-standard", status_code=status.HTTP_200_OK)
async def load_standard_catalogue_template(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """
    Idempotently adopt standard Karnataka PU / CBSE board subjects into active institution repository.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())

    # Fetch global catalog subjects
    stmt_cat = select(SubjectCatalog).where(
        SubjectCatalog.tenant_id == None,
        SubjectCatalog.is_active == True
    )
    res_cat = await db.execute(stmt_cat)
    global_subjects = res_cat.scalars().all()

    loaded_count = 0
    for gs in global_subjects:
        stmt_exist = select(InstitutionSubject).where(
            InstitutionSubject.tenant_id == tenant_id,
            InstitutionSubject.subject_id == gs.id
        )
        exist = (await db.execute(stmt_exist)).scalars().first()
        if not exist:
            new_is = InstitutionSubject(
                tenant_id=tenant_id,
                subject_id=gs.id,
                custom_code=gs.code,
                custom_name=gs.name,
                department=gs.category,
                institution_level="PU College",
                is_active=True,
                created_by=user.id
            )
            db.add(new_is)
            loaded_count += 1

    await db.commit()
    return {
        "status": "SUCCESS",
        "loaded_count": loaded_count,
        "adopted_count": loaded_count,
        "total_available": len(global_subjects),
        "message": f"Successfully configured {loaded_count} standard catalogue subjects into your institution repository."
    }


@router.get("/institution-subjects", response_model=List[InstitutionSubjectOut])
async def list_institution_subjects(
    institution_level: Optional[str] = None,
    department: Optional[str] = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List all subjects adopted and configured by the active institution."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    stmt = (
        select(InstitutionSubject)
        .options(joinedload(InstitutionSubject.catalogue_subject))
        .where(InstitutionSubject.tenant_id == tenant_id)
    )
    if active_only:
        stmt = stmt.where(InstitutionSubject.is_active == True)
    if institution_level:
        stmt = stmt.where(InstitutionSubject.institution_level == institution_level)
    if department:
        stmt = stmt.where(InstitutionSubject.department == department)

    stmt = stmt.order_by(InstitutionSubject.created_at.asc())
    res = await db.execute(stmt)
    inst_subjs = res.scalars().all()

    output = []
    for s in inst_subjs:
        cat = s.catalogue_subject
        output.append(
            InstitutionSubjectOut(
                id=s.id,
                tenant_id=s.tenant_id,
                subject_id=s.subject_id,
                code=s.custom_code or (cat.code if cat else "UNKNOWN"),
                name=s.custom_name or (cat.name if cat else "Unnamed Subject"),
                category=cat.category if cat else "General",
                department=s.department,
                institution_level=s.institution_level,
                has_practical=cat.has_practical if cat else False,
                settings=s.settings or {},
                is_active=s.is_active,
                catalogue_subject=SubjectCatalogOut.model_validate(cat) if cat else None
            )
        )
    return output


@router.post("/institution-subjects", response_model=InstitutionSubjectOut, status_code=status.HTTP_201_CREATED)
async def adopt_or_create_institution_subject(
    payload: InstitutionSubjectCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """Adopt a catalogue subject into the active institution."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())

    # Check catalogue subject exists
    cat_subject = await db.get(SubjectCatalog, payload.subject_id)
    if not cat_subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalogue subject not found.")

    # Check if already adopted
    stmt_exist = select(InstitutionSubject).options(joinedload(InstitutionSubject.catalogue_subject)).where(
        InstitutionSubject.tenant_id == tenant_id,
        InstitutionSubject.subject_id == payload.subject_id
    )
    exist = (await db.execute(stmt_exist)).scalars().first()
    if exist:
        if not exist.is_active:
            exist.is_active = True
            await db.commit()
            await db.refresh(exist)
        return InstitutionSubjectOut(
            id=exist.id,
            tenant_id=exist.tenant_id,
            subject_id=exist.subject_id,
            code=exist.custom_code or cat_subject.code,
            name=exist.custom_name or cat_subject.name,
            category=cat_subject.category,
            department=exist.department,
            institution_level=exist.institution_level,
            has_practical=cat_subject.has_practical,
            settings=exist.settings or {},
            is_active=exist.is_active,
            catalogue_subject=SubjectCatalogOut.model_validate(cat_subject)
        )

    inst_sub = InstitutionSubject(
        tenant_id=tenant_id,
        subject_id=payload.subject_id,
        custom_code=payload.custom_code or cat_subject.code,
        custom_name=payload.custom_name or cat_subject.name,
        department=payload.department or cat_subject.category,
        institution_level=payload.institution_level,
        settings=payload.settings or {},
        is_active=payload.is_active,
        created_by=user.id
    )
    db.add(inst_sub)
    await db.commit()
    await db.refresh(inst_sub)

    return InstitutionSubjectOut(
        id=inst_sub.id,
        tenant_id=inst_sub.tenant_id,
        subject_id=inst_sub.subject_id,
        code=inst_sub.custom_code or cat_subject.code,
        name=inst_sub.custom_name or cat_subject.name,
        category=cat_subject.category,
        department=inst_sub.department,
        institution_level=inst_sub.institution_level,
        has_practical=cat_subject.has_practical,
        settings=inst_sub.settings or {},
        is_active=inst_sub.is_active,
        catalogue_subject=SubjectCatalogOut.model_validate(cat_subject)
    )


# ---------------------------------------------------------------------------
# Class Subject Mapping (Curriculum Mapping) Endpoints
# ---------------------------------------------------------------------------

@router.get("/curriculum", response_model=List[ClassSubjectMappingOut])
async def list_class_curriculum_mappings(
    academic_year: str = "2026-2027",
    institution_level: Optional[str] = None,
    class_name: Optional[str] = None,
    stream: Optional[str] = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retrieve class-wise curriculum mappings for the active institution.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())

    stmt = (
        select(ClassSubjectMapping)
        .options(
            joinedload(ClassSubjectMapping.institution_subject)
            .joinedload(InstitutionSubject.catalogue_subject)
        )
        .where(
            ClassSubjectMapping.tenant_id == tenant_id,
            ClassSubjectMapping.academic_year == academic_year
        )
    )
    if active_only:
        stmt = stmt.where(ClassSubjectMapping.is_active == True)
    if institution_level:
        stmt = stmt.where(ClassSubjectMapping.institution_level == institution_level)
    if class_name:
        stmt = stmt.where(ClassSubjectMapping.class_name == class_name)
    if stream:
        stmt = stmt.where(
            or_(
                ClassSubjectMapping.stream == stream,
                ClassSubjectMapping.stream == None
            )
        )

    stmt = stmt.order_by(ClassSubjectMapping.display_order.asc(), ClassSubjectMapping.created_at.asc())
    res = await db.execute(stmt)
    mappings = res.scalars().all()

    output = []
    for m in mappings:
        ins = m.institution_subject
        cat = ins.catalogue_subject if ins else None

        subj_code = (ins.custom_code if ins and ins.custom_code else (cat.code if cat else "UNKNOWN"))
        subj_name = (ins.custom_name if ins and ins.custom_name else (cat.name if cat else "Unknown Subject"))
        subj_cat = cat.category if cat else "General"

        output.append(
            ClassSubjectMappingOut(
                id=m.id,
                tenant_id=m.tenant_id,
                academic_year=m.academic_year,
                institution_level=m.institution_level,
                class_name=m.class_name,
                stream=m.stream,
                institution_subject_id=m.institution_subject_id,
                subject_code=subj_code,
                subject_name=subj_name,
                category=subj_cat,
                is_compulsory=m.is_compulsory,
                has_theory=m.has_theory,
                has_practical=m.has_practical,
                theory_max_marks=m.theory_max_marks,
                practical_max_marks=m.practical_max_marks,
                total_max_marks=m.total_max_marks,
                theory_pass_marks=m.theory_pass_marks,
                practical_pass_marks=m.practical_pass_marks,
                total_pass_marks=m.total_pass_marks,
                weekly_periods=m.weekly_periods,
                assigned_teacher_id=m.assigned_teacher_id,
                assigned_teacher_name=m.assigned_teacher_name,
                display_order=m.display_order,
                is_active=m.is_active,
                notes=m.notes,
                created_at=m.created_at
            )
        )
    return output


@router.post("/curriculum/map", response_model=ClassSubjectMappingOut, status_code=status.HTTP_201_CREATED)
async def map_subject_to_class_curriculum(
    payload: ClassSubjectMappingCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """
    Map an institution subject to a specific Class and Stream.
    Prevents duplicate mappings and validates marks calculation integrity.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())

    # 1. Resolve institution_subject_id
    inst_subject = None
    if payload.institution_subject_id:
        inst_subject = await db.get(InstitutionSubject, payload.institution_subject_id)
        if not inst_subject or inst_subject.tenant_id != tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution subject not found.")
    elif payload.subject_id:
        # Check if already adopted in institution_subjects
        stmt_is = select(InstitutionSubject).where(
            InstitutionSubject.tenant_id == tenant_id,
            InstitutionSubject.subject_id == payload.subject_id
        )
        inst_subject = (await db.execute(stmt_is)).scalars().first()
        if not inst_subject:
            cat_s = await db.get(SubjectCatalog, payload.subject_id)
            if not cat_s:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalogue subject not found.")
            inst_subject = InstitutionSubject(
                tenant_id=tenant_id,
                subject_id=cat_s.id,
                custom_code=cat_s.code,
                custom_name=cat_s.name,
                department=cat_s.category,
                institution_level=payload.institution_level,
                is_active=True,
                created_by=user.id
            )
            db.add(inst_subject)
            await db.flush()
    elif payload.subject_code:
        # Look up by code
        stmt_code = (
            select(InstitutionSubject)
            .join(SubjectCatalog, InstitutionSubject.subject_id == SubjectCatalog.id)
            .where(
                InstitutionSubject.tenant_id == tenant_id,
                or_(
                    InstitutionSubject.custom_code == payload.subject_code.upper(),
                    SubjectCatalog.code == payload.subject_code.upper()
                )
            )
        )
        inst_subject = (await db.execute(stmt_code)).scalars().first()
        if not inst_subject:
            # Find in catalogue and auto-adopt
            stmt_cat = select(SubjectCatalog).where(
                SubjectCatalog.code == payload.subject_code.upper(),
                or_(SubjectCatalog.tenant_id == tenant_id, SubjectCatalog.tenant_id == None)
            )
            cat_s = (await db.execute(stmt_cat)).scalars().first()
            if not cat_s:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Subject code '{payload.subject_code}' not found.")
            inst_subject = InstitutionSubject(
                tenant_id=tenant_id,
                subject_id=cat_s.id,
                custom_code=cat_s.code,
                custom_name=cat_s.name,
                department=cat_s.category,
                institution_level=payload.institution_level,
                is_active=True,
                created_by=user.id
            )
            db.add(inst_subject)
            await db.flush()

    if not inst_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must specify institution_subject_id, subject_id, or subject_code."
        )

    # 2. Duplicate Detection
    clean_stream = payload.stream.strip() if payload.stream else None
    stmt_dup = select(ClassSubjectMapping).where(
        ClassSubjectMapping.tenant_id == tenant_id,
        ClassSubjectMapping.academic_year == payload.academic_year,
        ClassSubjectMapping.class_name == payload.class_name,
        ClassSubjectMapping.stream == clean_stream,
        ClassSubjectMapping.institution_subject_id == inst_subject.id
    )
    dup_res = await db.execute(stmt_dup)
    existing_map = dup_res.scalars().first()
    if existing_map:
        if existing_map.is_active:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Subject '{inst_subject.custom_code}' is already mapped to {payload.class_name} ({clean_stream or 'General'}) for academic year {payload.academic_year}."
            )
        else:
            # Revalidate and fully refresh archived mappings before reactivation.
            t_max = payload.theory_max_marks
            p_max = payload.practical_max_marks if payload.has_practical else 0.0
            tot_max = payload.total_max_marks if payload.total_max_marks is not None else t_max + p_max
            t_pass = payload.theory_pass_marks
            p_pass = payload.practical_pass_marks if payload.has_practical else 0.0
            tot_pass = payload.total_pass_marks if payload.total_pass_marks is not None else t_pass + p_pass
            if t_max < 0 or p_max < 0 or tot_max <= 0:
                raise HTTPException(status_code=422, detail="Maximum marks must be non-negative and total maximum marks must be greater than zero.")
            if t_pass < 0 or p_pass < 0 or tot_pass < 0 or t_pass > t_max or (payload.has_practical and p_pass > p_max) or tot_pass > tot_max:
                raise HTTPException(status_code=422, detail="Passing marks cannot be negative or exceed the corresponding maximum marks.")
            if abs(tot_max - (t_max + p_max)) > 0.001:
                raise HTTPException(status_code=422, detail="Total maximum marks must equal theory plus practical maximum marks.")
            if abs(tot_pass - (t_pass + p_pass)) > 0.001:
                raise HTTPException(status_code=422, detail="Total passing marks must equal theory plus practical passing marks.")
            existing_map.is_active = True
            existing_map.is_compulsory = payload.is_compulsory
            existing_map.has_theory = payload.has_theory
            existing_map.has_practical = payload.has_practical
            existing_map.theory_max_marks = t_max
            existing_map.practical_max_marks = p_max
            existing_map.total_max_marks = tot_max
            existing_map.theory_pass_marks = t_pass
            existing_map.practical_pass_marks = p_pass
            existing_map.total_pass_marks = tot_pass
            existing_map.weekly_periods = payload.weekly_periods
            existing_map.assigned_teacher_id = payload.assigned_teacher_id
            existing_map.assigned_teacher_name = payload.assigned_teacher_name
            existing_map.updated_by = user.id
            await db.commit()
            await db.refresh(existing_map)
            mapping_to_return = existing_map
    else:
        # 3. Marks Validation
        t_max = payload.theory_max_marks
        p_max = payload.practical_max_marks if payload.has_practical else 0.0
        tot_max = payload.total_max_marks or (t_max + p_max)

        t_pass = payload.theory_pass_marks
        p_pass = payload.practical_pass_marks if payload.has_practical else 0.0
        tot_pass = payload.total_pass_marks or (t_pass + p_pass)

        if t_pass > t_max:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Theory passing marks ({t_pass}) cannot exceed theory maximum marks ({t_max})."
            )
        if payload.has_practical and p_pass > p_max:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Practical passing marks ({p_pass}) cannot exceed practical maximum marks ({p_max})."
            )
        if tot_pass > tot_max:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Total passing marks ({tot_pass}) cannot exceed total maximum marks ({tot_max})."
            )

        # Get next display order
        order_stmt = select(func.count(ClassSubjectMapping.id)).where(
            ClassSubjectMapping.tenant_id == tenant_id,
            ClassSubjectMapping.academic_year == payload.academic_year,
            ClassSubjectMapping.class_name == payload.class_name
        )
        current_count = (await db.execute(order_stmt)).scalar() or 0

        new_mapping = ClassSubjectMapping(
            tenant_id=tenant_id,
            academic_year=payload.academic_year,
            institution_level=payload.institution_level,
            class_name=payload.class_name,
            stream=clean_stream,
            institution_subject_id=inst_subject.id,
            is_compulsory=payload.is_compulsory,
            has_theory=payload.has_theory,
            has_practical=payload.has_practical,
            theory_max_marks=t_max,
            practical_max_marks=p_max,
            total_max_marks=tot_max,
            theory_pass_marks=t_pass,
            practical_pass_marks=p_pass,
            total_pass_marks=tot_pass,
            weekly_periods=payload.weekly_periods,
            assigned_teacher_id=payload.assigned_teacher_id,
            assigned_teacher_name=payload.assigned_teacher_name,
            display_order=current_count + 1,
            is_active=True,
            notes=payload.notes,
            created_by=user.id
        )
        db.add(new_mapping)
        await db.commit()
        await db.refresh(new_mapping)
        mapping_to_return = new_mapping

    # Load catalogue subject for output
    await db.refresh(mapping_to_return, ["institution_subject"])
    cat = (await db.get(SubjectCatalog, inst_subject.subject_id))

    return ClassSubjectMappingOut(
        id=mapping_to_return.id,
        tenant_id=mapping_to_return.tenant_id,
        academic_year=mapping_to_return.academic_year,
        institution_level=mapping_to_return.institution_level,
        class_name=mapping_to_return.class_name,
        stream=mapping_to_return.stream,
        institution_subject_id=mapping_to_return.institution_subject_id,
        subject_code=inst_subject.custom_code or (cat.code if cat else "UNKNOWN"),
        subject_name=inst_subject.custom_name or (cat.name if cat else "Unknown Subject"),
        category=cat.category if cat else "General",
        is_compulsory=mapping_to_return.is_compulsory,
        has_theory=mapping_to_return.has_theory,
        has_practical=mapping_to_return.has_practical,
        theory_max_marks=mapping_to_return.theory_max_marks,
        practical_max_marks=mapping_to_return.practical_max_marks,
        total_max_marks=mapping_to_return.total_max_marks,
        theory_pass_marks=mapping_to_return.theory_pass_marks,
        practical_pass_marks=mapping_to_return.practical_pass_marks,
        total_pass_marks=mapping_to_return.total_pass_marks,
        weekly_periods=mapping_to_return.weekly_periods,
        assigned_teacher_id=mapping_to_return.assigned_teacher_id,
        assigned_teacher_name=mapping_to_return.assigned_teacher_name,
        display_order=mapping_to_return.display_order,
        is_active=mapping_to_return.is_active,
        notes=mapping_to_return.notes,
        created_at=mapping_to_return.created_at
    )


@router.put("/curriculum/mappings/{mapping_id}", response_model=ClassSubjectMappingOut)
async def update_class_subject_mapping(
    mapping_id: uuid.UUID,
    payload: ClassSubjectMappingUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """
    Update curriculum assessment scheme (theory/practical marks, pass criteria, assigned faculty).
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    mapping = await db.get(ClassSubjectMapping, mapping_id)
    if not mapping or mapping.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum mapping not found.")

    if payload.is_compulsory is not None:
        mapping.is_compulsory = payload.is_compulsory
    if payload.has_theory is not None:
        mapping.has_theory = payload.has_theory
    if payload.has_practical is not None:
        mapping.has_practical = payload.has_practical

    # Recalculate marks
    t_max = payload.theory_max_marks if payload.theory_max_marks is not None else mapping.theory_max_marks
    p_max = payload.practical_max_marks if payload.practical_max_marks is not None else mapping.practical_max_marks
    if not mapping.has_practical:
        p_max = 0.0

    tot_max = payload.total_max_marks if payload.total_max_marks is not None else (t_max + p_max)
    t_pass = payload.theory_pass_marks if payload.theory_pass_marks is not None else mapping.theory_pass_marks
    p_pass = payload.practical_pass_marks if payload.practical_pass_marks is not None else mapping.practical_pass_marks
    tot_pass = payload.total_pass_marks if payload.total_pass_marks is not None else (t_pass + p_pass)

    if t_pass > t_max:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Theory passing marks ({t_pass}) cannot exceed theory maximum marks ({t_max})."
        )
    if mapping.has_practical and p_pass > p_max:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Practical passing marks ({p_pass}) cannot exceed practical maximum marks ({p_max})."
        )
    if tot_pass > tot_max:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Total passing marks ({tot_pass}) cannot exceed total maximum marks ({tot_max})."
        )

    mapping.theory_max_marks = t_max
    mapping.practical_max_marks = p_max
    mapping.total_max_marks = tot_max
    mapping.theory_pass_marks = t_pass
    mapping.practical_pass_marks = p_pass
    mapping.total_pass_marks = tot_pass

    if payload.weekly_periods is not None:
        mapping.weekly_periods = payload.weekly_periods
    if payload.assigned_teacher_id is not None:
        mapping.assigned_teacher_id = payload.assigned_teacher_id
    if payload.assigned_teacher_name is not None:
        mapping.assigned_teacher_name = payload.assigned_teacher_name
    if payload.display_order is not None:
        mapping.display_order = payload.display_order
    if payload.is_active is not None:
        mapping.is_active = payload.is_active
    if payload.notes is not None:
        mapping.notes = payload.notes
    mapping.updated_by = user.id

    await db.commit()
    await db.refresh(mapping, ["institution_subject"])

    inst_subject = mapping.institution_subject
    cat = (await db.get(SubjectCatalog, inst_subject.subject_id)) if inst_subject else None

    return ClassSubjectMappingOut(
        id=mapping.id,
        tenant_id=mapping.tenant_id,
        academic_year=mapping.academic_year,
        institution_level=mapping.institution_level,
        class_name=mapping.class_name,
        stream=mapping.stream,
        institution_subject_id=mapping.institution_subject_id,
        subject_code=inst_subject.custom_code or (cat.code if cat else "UNKNOWN"),
        subject_name=inst_subject.custom_name or (cat.name if cat else "Unknown Subject"),
        category=cat.category if cat else "General",
        is_compulsory=mapping.is_compulsory,
        has_theory=mapping.has_theory,
        has_practical=mapping.has_practical,
        theory_max_marks=mapping.theory_max_marks,
        practical_max_marks=mapping.practical_max_marks,
        total_max_marks=mapping.total_max_marks,
        theory_pass_marks=mapping.theory_pass_marks,
        practical_pass_marks=mapping.practical_pass_marks,
        total_pass_marks=mapping.total_pass_marks,
        weekly_periods=mapping.weekly_periods,
        assigned_teacher_id=mapping.assigned_teacher_id,
        assigned_teacher_name=mapping.assigned_teacher_name,
        display_order=mapping.display_order,
        is_active=mapping.is_active,
        notes=mapping.notes,
        created_at=mapping.created_at
    )


@router.delete("/curriculum/mappings/{mapping_id}", status_code=status.HTTP_200_OK)
async def remove_class_subject_mapping(
    mapping_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """
    Safely remove a class subject mapping.
    If historical exam marks exist, soft-deactivates the mapping (is_active = False)
    so academic grade history and transcripts remain intact.
    """
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    mapping = await db.get(ClassSubjectMapping, mapping_id)
    if not mapping or mapping.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum mapping not found.")

    await db.refresh(mapping, ["institution_subject"])
    inst_sub = mapping.institution_subject
    cat_code = inst_sub.custom_code if inst_sub else ""

    # Check if examination records exist for this subject in examinations
    stmt_exam = select(Examination).where(
        Examination.tenant_id == tenant_id,
        Examination.subject_code == cat_code,
        Examination.target_class == mapping.class_name
    )
    exam_exists = (await db.execute(stmt_exam)).scalars().first() is not None

    if exam_exists:
        mapping.is_active = False
        await db.commit()
        return {
            "status": "ARCHIVED",
            "message": f"Subject '{cat_code}' has recorded examination schedules. It has been safely archived from the active {mapping.class_name} syllabus without deleting past results."
        }

    await db.delete(mapping)
    await db.commit()
    return {
        "status": "DELETED",
        "message": f"Curriculum mapping for '{cat_code}' in {mapping.class_name} removed successfully."
    }


@router.patch("/curriculum/reorder", status_code=status.HTTP_200_OK)
async def reorder_curriculum_mappings(
    payload: ReorderCurriculumRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("curriculum.manage"))
):
    """Update display order priority of subjects in syllabus."""
    tenant_id = get_current_tenant_id() or (user.roles[0].tenant_id if user.roles else uuid.uuid4())
    for idx, mid in enumerate(payload.mapping_ids):
        mapping = await db.get(ClassSubjectMapping, mid)
        if mapping and mapping.tenant_id == tenant_id:
            mapping.display_order = idx + 1
    await db.commit()
    return {"status": "SUCCESS", "message": "Curriculum order updated successfully."}

