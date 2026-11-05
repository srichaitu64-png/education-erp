import uuid
from datetime import datetime, date, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import Boolean, ForeignKey, Index, String, Float, Integer, Date, DateTime, JSON, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import TenantBaseModel, Base, TimestampMixin


class AcademicSection(TenantBaseModel):
    """
    Central, configurable academic sections supporting:
    - Schools (Nursery to Class 12, Class 6 with A, B, C, D sections)
    - PU College (I PUC & II PUC with PCMB A-F, PCMC, Commerce)
    - Degree College (Programmes, Semesters, Sections)
    Enforces maximum student capacity and classroom allocation.
    """
    __tablename__ = "academic_sections"

    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_year: Mapped[str] = mapped_column(String(32), nullable=False, default="2026-2027", index=True)
    course_level: Mapped[str] = mapped_column(String(64), nullable=False, default="School")  # School, PU College, Degree College
    class_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)          # e.g. Class 6, I PUC, II PUC, B.Sc
    stream: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)     # e.g. PCMB, PCMC, Commerce, General
    section_code: Mapped[str] = mapped_column(String(16), nullable=False, index=True)        # e.g. A, B, C, D, E, F
    room_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)           # e.g. Hall B-204
    max_capacity: Mapped[int] = mapped_column(Integer, default=40, nullable=False)           # Maximum seats per section
    enrolled_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    class_teacher_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    class_teacher_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", nullable=False)         # ACTIVE, ARCHIVED

    enrolments: Mapped[List["StudentSectionEnrolment"]] = relationship(
        "StudentSectionEnrolment", back_populates="section", cascade="all, delete-orphan"
    )
    duty_assignments: Mapped[List["StaffDutyAssignment"]] = relationship(
        "StaffDutyAssignment", back_populates="section", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("tenant_id", "academic_year", "class_name", "stream", "section_code", name="uq_tenant_year_class_sec"),
        Index("idx_section_tenant_year_class", "tenant_id", "academic_year", "class_name"),
    )


class StudentSectionEnrolment(TenantBaseModel):
    """
    Student enrolment in an academic section.
    When a student transfers, historical attendance, fees, and marks are preserved.
    """
    __tablename__ = "student_section_enrolments"

    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    admission_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    roll_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    enrolment_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", nullable=False) # ACTIVE, TRANSFERRED, PROMOTED, ALUMNI
    transfer_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    transfer_effective_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    transfer_approved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    section: Mapped["AcademicSection"] = relationship("AcademicSection", back_populates="enrolments")

    __table_args__ = (
        Index("idx_enrolment_student_status", "student_id", "status"),
    )


class StaffDutyAssignment(TenantBaseModel):
    """
    Granular responsibility assignment engine:
    - Subject Teacher assigned to specific subjects and sections (e.g. Physics in I PUC PCMB-A/B only)
    - Computer Operator assigned to specific examinations and sections for data entry
    - Section Coordinator supervising multiple sections
    Enforced by backend APIs on all marks entry, attendance, and evaluation routes.
    """
    __tablename__ = "staff_duty_assignments"

    staff_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    staff_name: Mapped[str] = mapped_column(String(255), nullable=False)
    duty_role: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True
        # CLASS_TEACHER, SUBJECT_TEACHER, SECTION_COORDINATOR, COMPUTER_OPERATOR, VICE_PRINCIPAL_SUPERVISOR
    )
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    subject_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    examination_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    
    can_enter_marks: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    can_take_attendance: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    can_verify_marks: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    can_approve_results: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    effective_from: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    effective_until: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    assigned_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    assigned_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    section: Mapped["AcademicSection"] = relationship("AcademicSection", back_populates="duty_assignments")

    __table_args__ = (
        Index("idx_staff_duty_staff_section_sub", "staff_id", "section_id", "subject_code"),
    )


class HallTicket(TenantBaseModel):
    """
    Official student examination hall ticket with:
    - Unique hall ticket number
    - Timetable snapshot
    - Eligibility status (enrolment, attendance %, optional fee clearance)
    - Room & seat allocation
    - Tenant-safe QR verification payload
    """
    __tablename__ = "hall_tickets"

    examination_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    ticket_number: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    admission_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    class_name: Mapped[str] = mapped_column(String(64), nullable=False)
    section_code: Mapped[str] = mapped_column(String(16), nullable=False)
    
    exam_centre: Mapped[str] = mapped_column(String(255), nullable=False, default="Akshara Global Campus")
    room_number: Mapped[str] = mapped_column(String(64), nullable=False)
    seat_number: Mapped[str] = mapped_column(String(32), nullable=False)
    
    # ELIGIBLE, PENDING_FEE_APPROVAL, SPECIAL_EXEMPTION, REVOKED
    eligibility_status: Mapped[str] = mapped_column(String(32), default="ELIGIBLE", nullable=False, index=True)
    eligibility_notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    qr_verification_code: Mapped[str] = mapped_column(String(255), nullable=False)
    
    timetable_snapshot: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    issued_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("examination_id", "student_id", name="uq_exam_student_ticket"),
    )


class ConsolidatedFeeReportSnapshot(TenantBaseModel):
    """
    Immutable snapshot of consolidated student fee report submitted by Accountant to Chairman.
    Chairman can review totals, download PDF/Excel, and click Accept or Return with remarks.
    Subsequent payments never silently alter this snapshot.
    """
    __tablename__ = "consolidated_fee_report_snapshots"

    snapshot_code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    academic_year: Mapped[str] = mapped_column(String(32), nullable=False, default="2026-2027", index=True)
    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    target_class: Mapped[str] = mapped_column(String(64), nullable=False, default="All Classes")
    target_section: Mapped[str] = mapped_column(String(32), nullable=False, default="All Sections")
    
    submitted_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    submitted_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    total_students: Mapped[int] = mapped_column(Integer, nullable=False)
    total_assigned_fees: Mapped[float] = mapped_column(Float, nullable=False)
    total_concessions: Mapped[float] = mapped_column(Float, nullable=False)
    net_payable: Mapped[float] = mapped_column(Float, nullable=False)
    total_collected: Mapped[float] = mapped_column(Float, nullable=False)
    total_outstanding: Mapped[float] = mapped_column(Float, nullable=False)
    collection_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    
    fully_paid_count: Mapped[int] = mapped_column(Integer, nullable=False)
    partially_paid_count: Mapped[int] = mapped_column(Integer, nullable=False)
    unpaid_count: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Complete student ledger records captured immutably at submission time
    snapshot_records: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    
    # SUBMITTED, APPROVED, RETURNED_FOR_REVISION
    review_status: Mapped[str] = mapped_column(String(32), default="SUBMITTED", nullable=False, index=True)
    reviewed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    reviewed_by_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    review_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Student(TenantBaseModel):
    """
    Authoritative Canonical Student Master for EducationOS.
    Consolidated SIS record connecting personal identity, guardian contacts,
    address, national academic identifier (PEN/Aadhaar masked), section enrolment,
    attendance metrics, and live financial ledger.
    """
    __tablename__ = "students"

    admission_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    pen_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    registration_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    
    first_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    middle_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    last_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(16), nullable=True) # MALE, FEMALE, OTHER
    blood_group: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)
    
    father_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mother_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    guardian_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    father_mobile: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    mother_mobile: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    guardian_phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    parent_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    
    door_street: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city_town: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    district_state: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    
    academic_year: Mapped[str] = mapped_column(String(32), nullable=False, default="2026-2027", index=True)
    institution_level: Mapped[str] = mapped_column(String(64), nullable=False, default="School") # School, PU College, Degree College
    class_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    section_or_stream: Mapped[str] = mapped_column(String(64), nullable=False, default="A")
    roll_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    admission_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACTIVE", index=True) # ACTIVE, WITHDRAWN, TRANSFERRED, ALUMNI
    
    masked_aadhaar: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    fee_balance: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    attendance_pct: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)

    __table_args__ = (
        UniqueConstraint("tenant_id", "admission_number", name="uq_tenant_student_admission_number"),
        Index("idx_student_tenant_class", "tenant_id", "class_name"),
        Index("idx_student_tenant_status", "tenant_id", "status"),
    )


class AdmissionApplication(TenantBaseModel):
    """
    Prospective student admission enquiry and application workflow.
    Tracks review lifecycle from PENDING -> VERIFIED -> APPROVED -> ENROLLED.
    """
    __tablename__ = "admission_applications"

    application_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    applicant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    level: Mapped[str] = mapped_column(String(64), nullable=False) # School, PU College, Degree College
    target_class: Mapped[str] = mapped_column(String(64), nullable=False)
    
    parent_name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_phone: Mapped[str] = mapped_column(String(32), nullable=False)
    parent_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submission_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDING", index=True) # PENDING, VERIFIED, APPROVED, REJECTED
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    enrolled_student_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("tenant_id", "application_number", name="uq_tenant_admission_app_no"),
        Index("idx_admission_tenant_status", "tenant_id", "status"),
    )

