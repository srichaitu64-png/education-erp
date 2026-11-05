import uuid
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AcademicSectionCreate(BaseModel):
    academic_year: str = Field(default="2026-2027")
    course_level: str = Field(default="School")
    class_name: str
    stream: Optional[str] = None
    section_code: str
    room_number: Optional[str] = None
    max_capacity: int = Field(default=40, ge=1, le=100)
    class_teacher_name: Optional[str] = None


class AcademicSectionResponse(AcademicSectionCreate):
    id: uuid.UUID
    tenant_id: uuid.UUID
    enrolled_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SectionTransferRequest(BaseModel):
    student_id: uuid.UUID
    source_section_id: uuid.UUID
    target_section_id: uuid.UUID
    reason: str
    effective_date: date = Field(default_factory=date.today)


class StaffDutyAssignmentCreate(BaseModel):
    staff_id: uuid.UUID
    staff_name: str
    duty_role: str # CLASS_TEACHER, SUBJECT_TEACHER, SECTION_COORDINATOR, COMPUTER_OPERATOR
    section_id: uuid.UUID
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    examination_id: Optional[uuid.UUID] = None
    can_enter_marks: bool = True
    can_take_attendance: bool = True
    can_verify_marks: bool = False
    effective_from: date = Field(default_factory=date.today)
    effective_until: Optional[date] = None


class StaffDutyAssignmentResponse(StaffDutyAssignmentCreate):
    id: uuid.UUID
    tenant_id: uuid.UUID
    assigned_by_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class HallTicketCreateRequest(BaseModel):
    examination_id: uuid.UUID
    class_name: str
    section_code: Optional[str] = None
    room_number: Optional[str] = None
    enforce_fee_clearance: bool = False


class HallTicketResponse(BaseModel):
    id: uuid.UUID
    ticket_number: str
    admission_number: str
    student_name: str
    class_name: str
    section_code: str
    exam_centre: str
    room_number: str
    seat_number: str
    eligibility_status: str
    qr_verification_code: str
    timetable_snapshot: List[Dict[str, Any]]
    issued_at: datetime
    is_revoked: bool

    class Config:
        from_attributes = True


class FeeReportSnapshotSubmit(BaseModel):
    academic_year: str = "2026-2027"
    target_class: str = "All Classes"
    target_section: str = "All Sections"
    total_students: int
    total_assigned_fees: float
    total_concessions: float
    net_payable: float
    total_collected: float
    total_outstanding: float
    collection_percentage: float
    fully_paid_count: int
    partially_paid_count: int
    unpaid_count: int
    snapshot_records: List[Dict[str, Any]]


class FeeReportSnapshotReview(BaseModel):
    decision: str # APPROVED, RETURNED_FOR_REVISION
    remarks: Optional[str] = None


# ---------------------------------------------------------------------------
# Canonical Student Master & SIS Schemas
# ---------------------------------------------------------------------------
class StudentBase(BaseModel):
    admission_number: Optional[str] = None
    pen_number: Optional[str] = None
    registration_number: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    guardian_name: Optional[str] = None
    father_mobile: Optional[str] = None
    mother_mobile: Optional[str] = None
    guardian_phone: Optional[str] = None
    parent_email: Optional[str] = None
    emergency_contact: Optional[str] = None
    door_street: Optional[str] = None
    city_town: Optional[str] = None
    district_state: Optional[str] = None
    pincode: Optional[str] = None
    academic_year: str = "2026-2027"
    institution_level: str = "School"
    class_name: str
    section_or_stream: str = "A"
    roll_number: Optional[str] = None
    admission_date: date = Field(default_factory=date.today)
    status: str = "ACTIVE"
    masked_aadhaar: Optional[str] = None
    fee_balance: float = 0.0
    attendance_pct: float = 100.0


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    pen_number: Optional[str] = None
    registration_number: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    guardian_name: Optional[str] = None
    father_mobile: Optional[str] = None
    mother_mobile: Optional[str] = None
    guardian_phone: Optional[str] = None
    parent_email: Optional[str] = None
    emergency_contact: Optional[str] = None
    door_street: Optional[str] = None
    city_town: Optional[str] = None
    district_state: Optional[str] = None
    pincode: Optional[str] = None
    academic_year: Optional[str] = None
    institution_level: Optional[str] = None
    class_name: Optional[str] = None
    section_or_stream: Optional[str] = None
    roll_number: Optional[str] = None
    status: Optional[str] = None
    masked_aadhaar: Optional[str] = None
    fee_balance: Optional[float] = None
    attendance_pct: Optional[float] = None


class StudentResponse(StudentBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentDetailResponse(StudentResponse):
    enrolments: List[Dict[str, Any]] = []
    recent_attendance: List[Dict[str, Any]] = []
    fee_invoices: List[Dict[str, Any]] = []


class StudentListOut(BaseModel):
    items: List[StudentResponse]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# Admissions Schemas
# ---------------------------------------------------------------------------
class AdmissionApplicationCreate(BaseModel):
    applicant_name: str
    level: str = "School"
    target_class: str
    parent_name: str
    parent_phone: str
    parent_email: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None


class AdmissionApplicationResponse(AdmissionApplicationCreate):
    id: uuid.UUID
    tenant_id: uuid.UUID
    application_number: str
    submission_date: date
    status: str
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    enrolled_student_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdmissionApproveRequest(BaseModel):
    section_code: str = "A"
    academic_year: str = "2026-2027"
    review_notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Staff & Portal Schemas
# ---------------------------------------------------------------------------
class StaffUserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class PortalMeResponse(BaseModel):
    user_id: uuid.UUID
    full_name: str
    email: str
    role: str
    student_profile: Optional[StudentResponse] = None
    attendance_summary: Optional[Dict[str, Any]] = None
    fee_summary: Optional[Dict[str, Any]] = None
    recent_marks: List[Dict[str, Any]] = []
    hall_tickets: List[HallTicketResponse] = []


