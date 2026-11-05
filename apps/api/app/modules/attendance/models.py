import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Index, String, Float, Integer, Date, DateTime, JSON, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import TenantBaseModel


class InstitutionAttendanceConfig(TenantBaseModel):
    """
    Institution-level attendance mode and feature configuration:
    - attendance_mode: 'DAILY_ONLY', 'PERIOD_WISE_ONLY', 'BOTH' (at least one must be active)
    - enable_biometric_sync: Biometric machine hardware sync
    - enable_parent_leave_requests: Parent absence / leave request workflow
    - enable_absence_reasons: Absence reason tracking (medical, sports, family, unexcused)
    - enable_late_tracking: Late arrival tracking with minutes
    - enable_attendance_correction: Attendance correction and Principal approval workflow
    - minimum_attendance_pct: Minimum threshold percentage (e.g. 75% or 85%)
    - academic_year: e.g. '2026-2027'
    """
    __tablename__ = "institution_attendance_configs"

    academic_year: Mapped[str] = mapped_column(String(32), nullable=False, default="2026-2027", index=True)
    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    # Modes: DAILY_ONLY, PERIOD_WISE_ONLY, BOTH
    attendance_mode: Mapped[str] = mapped_column(String(32), default="BOTH", nullable=False)
    
    enable_biometric_sync: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    enable_parent_leave_requests: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    enable_absence_reasons: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    enable_late_tracking: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    enable_attendance_correction: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    minimum_attendance_pct: Mapped[float] = mapped_column(Float, default=75.0, nullable=False)
    configured_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    configured_by_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        UniqueConstraint("tenant_id", "academic_year", name="uq_tenant_year_attendance_cfg"),
        Index("idx_att_cfg_tenant_year", "tenant_id", "academic_year"),
    )


class DailyAttendanceRecord(TenantBaseModel):
    """
    Mandatory daily attendance records (morning/daily roll-call).
    Works independently of period-wise attendance.
    """
    __tablename__ = "daily_attendance_records"

    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today, index=True)
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    admission_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    roll_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    # Status: PRESENT, ABSENT, LATE, LEAVE
    status: Mapped[str] = mapped_column(String(32), default="PRESENT", nullable=False, index=True)
    late_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    absence_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    leave_request_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
    recorded_by_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    recorded_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    is_corrected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    correction_notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    correction_approved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        UniqueConstraint("tenant_id", "section_id", "student_id", "attendance_date", name="uq_tenant_sec_student_date"),
        Index("idx_daily_att_date_section", "tenant_id", "attendance_date", "section_id"),
        Index("idx_daily_att_student_date", "student_id", "attendance_date"),
    )


class PeriodAttendanceRecord(TenantBaseModel):
    """
    Optional period-wise / lecture attendance records.
    Only populated and accessed when period-wise mode is enabled by the institution.
    """
    __tablename__ = "period_attendance_records"

    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today, index=True)
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    period_number: Mapped[int] = mapped_column(Integer, nullable=False)
    period_time: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g. "09:00 - 09:50 AM"
    subject_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    subject_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    teacher_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    teacher_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    admission_number: Mapped[str] = mapped_column(String(64), nullable=False)
    
    # Status: PRESENT, ABSENT, LATE
    status: Mapped[str] = mapped_column(String(32), default="PRESENT", nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "section_id", "period_number", "attendance_date", "student_id",
            name="uq_tenant_period_student_date"
        ),
        Index("idx_period_att_date_sec_period", "tenant_id", "attendance_date", "section_id", "period_number"),
    )

