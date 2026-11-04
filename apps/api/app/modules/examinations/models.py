import uuid
from datetime import datetime, date, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import Boolean, ForeignKey, Index, String, Float, Integer, Date, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import TenantBaseModel, Base, TimestampMixin


class Examination(TenantBaseModel):
    """
    Institution-focused examination definition.
    Supports weekly tests, unit tests, monthly tests, quarterly/half-yearly/annual,
    practical exams, model exams, foundation programmes (NEET/JEE/KCET Foundation)
    and PU competitive exam records.
    """
    __tablename__ = "examinations"

    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    category: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        # e.g.: weekly_test, unit_test, monthly_test, quarterly_exam,
        # half_yearly_exam, annual_exam, internal_assessment, practical_exam,
        # model_exam, competitive_foundation, competitive_pu
    )
    foundation_programme: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True, index=True
        # e.g.: NEET_FOUNDATION, JEE_FOUNDATION, KCET_FOUNDATION, NONE
    )
    academic_year: Mapped[str] = mapped_column(String(32), nullable=False, default="2026-2027", index=True)
    target_class: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_section: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    subject_code: Mapped[str] = mapped_column(String(64), nullable=False)
    subject_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    exam_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[str] = mapped_column(String(16), nullable=False)  # e.g. "09:30 AM"
    end_time: Mapped[str] = mapped_column(String(16), nullable=False)    # e.g. "12:30 PM"
    
    max_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    passing_marks: Mapped[float] = mapped_column(Float, default=35.0, nullable=False)
    theory_max_marks: Mapped[float] = mapped_column(Float, default=70.0, nullable=False)
    practical_max_marks: Mapped[float] = mapped_column(Float, default=30.0, nullable=False)
    
    exam_mode: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="offline_paper"
        # offline_paper, internal_online, external_provider
    )
    location_or_hall: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    invigilator_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Online/External attributes
    online_provider_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    external_exam_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    question_paper_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    
    # 4-Stage Approval Workflow State
    # DRAFT -> MARKS_ENTRY -> CONTROLLER_VERIFIED -> PRINCIPAL_APPROVED -> PUBLISHED -> ARCHIVED
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="SCHEDULED", index=True)
    publication_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    marks_records: Mapped[List["ExamAttendanceAndMarks"]] = relationship(
        "ExamAttendanceAndMarks", back_populates="examination", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["ExamApprovalAudit"]] = relationship(
        "ExamApprovalAudit", back_populates="examination", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_exam_tenant_cat_date", "tenant_id", "category", "exam_date"),
    )


class ExamAttendanceAndMarks(TenantBaseModel):
    """
    Student-level examination attendance, theory/practical score, rank and audit.
    Includes offline sync versioning and unique operation tracking.
    """
    __tablename__ = "exam_marks"

    examination_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    roll_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    admission_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    
    # Attendance: PRESENT, ABSENT, EXCUSED, MALPRACTICE
    attendance_status: Mapped[str] = mapped_column(String(32), default="PRESENT", nullable=False)
    theory_marks_obtained: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    practical_marks_obtained: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_marks_obtained: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)
    rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    percentile: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    evaluator_teacher_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    evaluator_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    controller_audit_status: Mapped[str] = mapped_column(String(32), default="PENDING", nullable=False)
    
    # Offline sync safeguards
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    last_sync_operation_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)

    examination: Mapped["Examination"] = relationship("Examination", back_populates="marks_records")

    __table_args__ = (
        Index("idx_exam_student_unique", "examination_id", "student_id", unique=True),
    )


class OfflineSyncQueue(TenantBaseModel):
    """
    Offline sync operations queue with conflict resolution.
    Never silently overwrites approved or controller-verified marks.
    """
    __tablename__ = "offline_sync_queue"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    operation_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)  # exam_marks, attendance
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    client_version: Mapped[int] = mapped_column(Integer, nullable=False)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    # PENDING, APPLIED, CONFLICT_DETECTED, REJECTED
    sync_status: Mapped[str] = mapped_column(String(32), default="PENDING", nullable=False, index=True)
    conflict_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)


class ExternalExamProviderConfig(TenantBaseModel):
    """
    Institution-owned external examination adapter configuration.
    External costs are independent and never included in EducationOS platform fees.
    """
    __tablename__ = "external_exam_providers"

    provider_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True) # e.g. TCS_ION, NTA_MOCK, EDUTECH
    provider_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    api_endpoint: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    encrypted_api_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # Secret, never sent to UI
    webhook_secret: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_sync_status: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)


class ExamApprovalAudit(TenantBaseModel):
    """
    Strict 4-stage audit trail for examination results approval.
    """
    __tablename__ = "exam_approval_audits"

    examination_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stage: Mapped[str] = mapped_column(String(32), nullable=False)  # TEACHER_ENTRY, CONTROLLER_VERIFY, PRINCIPAL_APPROVE, PUBLISH
    acted_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    acted_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    acted_by_role: Mapped[str] = mapped_column(String(64), nullable=False)
    action: Mapped[str] = mapped_column(String(32), nullable=False) # SUBMIT, VERIFY, APPROVE, REJECT, PUBLISH
    comments: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    examination: Mapped["Examination"] = relationship("Examination", back_populates="audit_logs")

