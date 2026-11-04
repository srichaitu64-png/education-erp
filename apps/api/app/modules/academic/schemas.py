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
