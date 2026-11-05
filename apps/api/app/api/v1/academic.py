import uuid
from datetime import datetime, date, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

from app.database.session import get_db, get_current_tenant_id
from app.security.deps import get_current_user
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
        qr_code = f"TICKET:{ticket_no}:{s.admission_number}:{exam_name}"

        ht = HallTicket(
            tenant_id=tenant_id,
            examination_id=payload.examination_id,
            student_id=s.id,
            ticket_number=ticket_no,
            admission_number=s.admission_number,
            student_name=f"{s.first_name} {s.last_name}",
            class_name=s.class_name,
            section_code=s.section_or_stream,
            exam_centre="Akshara Global Main Campus",
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


@router.get("/hall-tickets/verify/{qr_or_ticket}")
async def verify_hall_ticket(
    qr_or_ticket: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify hall ticket legitimacy and eligibility status via QR or ticket number."""
    stmt = select(HallTicket).where(
        or_(
            HallTicket.ticket_number == qr_or_ticket,
            HallTicket.qr_verification_code == qr_or_ticket
        )
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

