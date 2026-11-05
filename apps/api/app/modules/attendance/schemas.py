import uuid
from datetime import date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AttendanceConfigBase(BaseModel):
    attendance_mode: str = Field(default="BOTH", description="DAILY_ONLY, PERIOD_WISE_ONLY, or BOTH")
    enable_biometric_sync: bool = False
    enable_parent_leave_requests: bool = True
    enable_absence_reasons: bool = True
    enable_late_tracking: bool = True
    enable_attendance_correction: bool = True
    minimum_attendance_pct: float = Field(default=75.0, ge=0.0, le=100.0)
    academic_year: str = "2026-2027"


class AttendanceConfigUpdate(BaseModel):
    attendance_mode: Optional[str] = Field(None, description="DAILY_ONLY, PERIOD_WISE_ONLY, or BOTH")
    enable_biometric_sync: Optional[bool] = None
    enable_parent_leave_requests: Optional[bool] = None
    enable_absence_reasons: Optional[bool] = None
    enable_late_tracking: Optional[bool] = None
    enable_attendance_correction: Optional[bool] = None
    minimum_attendance_pct: Optional[float] = None


class AttendanceConfigResponse(AttendanceConfigBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    configured_by_name: Optional[str] = None

    class Config:
        from_attributes = True


class SectionAttendanceSummary(BaseModel):
    section_id: uuid.UUID
    class_name: str
    section_code: str
    stream: Optional[str] = None
    total_strength: int
    present_count: int
    absent_count: int
    late_count: int
    leave_count: int
    attendance_pct: float


class DailyDashboardResponse(BaseModel):
    attendance_date: date
    attendance_mode: str
    total_strength: int
    total_present: int
    total_absent: int
    total_late: int
    total_leave: int
    overall_attendance_pct: float
    sections: List[SectionAttendanceSummary]


class StudentAttendanceMarkItem(BaseModel):
    student_id: uuid.UUID
    student_name: str
    admission_number: str
    roll_number: Optional[str] = None
    status: str = Field(default="PRESENT", description="PRESENT, ABSENT, LATE, LEAVE")
    late_minutes: Optional[int] = None
    absence_reason: Optional[str] = None
    leave_request_id: Optional[str] = None


class BatchMarkDailyAttendanceRequest(BaseModel):
    section_id: uuid.UUID
    attendance_date: date
    records: List[StudentAttendanceMarkItem]


class AbsentStudentItem(BaseModel):
    student_id: uuid.UUID
    student_name: str
    admission_number: str
    roll_number: Optional[str] = None
    class_name: str
    section_code: str
    stream: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    absence_reason: Optional[str] = None
    leave_request_status: Optional[str] = None
    attendance_date: date


class PeriodAttendanceMarkItem(BaseModel):
    student_id: uuid.UUID
    student_name: str
    admission_number: str
    status: str = Field(default="PRESENT", description="PRESENT, ABSENT, LATE")
    remarks: Optional[str] = None


class BatchMarkPeriodAttendanceRequest(BaseModel):
    section_id: uuid.UUID
    attendance_date: date
    period_number: int
    period_time: str
    subject_code: str
    subject_name: str
    records: List[PeriodAttendanceMarkItem]

