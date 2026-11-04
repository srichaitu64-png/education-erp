import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ExaminationCreate(BaseModel):
    name: str = Field(..., example="Unit Test 1 (Formative Assessment)")
    code: str = Field(..., example="UT-1-2026")
    category: str = Field(..., example="unit_test")
    foundation_programme: Optional[str] = None
    academic_year: str = Field(default="2026-2027", example="2026-2027")
    target_class: str = Field(..., example="I PUC (PCMB)")
    target_section: Optional[str] = "A"
    subject_code: str = Field(..., example="PHY-101")
    subject_name: str = Field(..., example="Physics (Theory + Practical)")
    exam_date: date
    start_time: str = Field(..., example="09:30 AM")
    end_time: str = Field(..., example="12:30 PM")
    max_marks: float = 100.0
    passing_marks: float = 35.0
    theory_max_marks: float = 70.0
    practical_max_marks: float = 30.0
    exam_mode: str = Field(default="offline_paper", example="offline_paper")
    location_or_hall: Optional[str] = "Hall A-101"
    invigilator_name: Optional[str] = "Dr. V. Murthy"
    online_provider_name: Optional[str] = None
    instructions: Optional[str] = "Bring scientific calculator and lab notebook."


class ExaminationOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    campus_id: Optional[uuid.UUID] = None
    name: str
    code: str
    category: str
    foundation_programme: Optional[str] = None
    academic_year: str
    target_class: str
    target_section: Optional[str] = None
    subject_code: str
    subject_name: str
    exam_date: date
    start_time: str
    end_time: str
    max_marks: float
    passing_marks: float
    theory_max_marks: float
    practical_max_marks: float
    exam_mode: str
    location_or_hall: Optional[str] = None
    invigilator_name: Optional[str] = None
    status: str
    publication_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExamMarksEntryItem(BaseModel):
    student_id: uuid.UUID
    student_name: str
    roll_number: str
    admission_number: str
    attendance_status: str = "PRESENT"
    theory_marks_obtained: Optional[float] = None
    practical_marks_obtained: Optional[float] = None
    client_version: int = 1
    operation_id: Optional[str] = None


class ExamMarksBatchEntryRequest(BaseModel):
    examination_id: uuid.UUID
    marks: List[ExamMarksEntryItem]


class ExamMarksOut(BaseModel):
    id: uuid.UUID
    examination_id: uuid.UUID
    student_id: uuid.UUID
    student_name: str
    roll_number: str
    admission_number: str
    attendance_status: str
    theory_marks_obtained: Optional[float] = None
    practical_marks_obtained: Optional[float] = None
    total_marks_obtained: Optional[float] = None
    percentage: Optional[float] = None
    grade: Optional[str] = None
    rank: Optional[int] = None
    percentile: Optional[float] = None
    controller_audit_status: str
    version: int

    class Config:
        from_attributes = True


class ExamApprovalActionRequest(BaseModel):
    examination_id: uuid.UUID
    action: str = Field(..., example="APPROVE") # VERIFY, APPROVE, REJECT, PUBLISH
    comments: Optional[str] = None


class OfflineSyncOperation(BaseModel):
    operation_id: str
    entity_type: str = "exam_marks"
    entity_id: uuid.UUID
    client_version: int
    payload: Dict[str, Any]


class OfflineSyncBatchRequest(BaseModel):
    operations: List[OfflineSyncOperation]


class OfflineSyncResult(BaseModel):
    operation_id: str
    status: str # APPLIED, CONFLICT_DETECTED, REJECTED
    message: str
    server_version: int


class ExternalProviderConfigCreate(BaseModel):
    provider_code: str = Field(..., example="TCS_ION_ADAPTER")
    provider_name: str = Field(..., example="TCS iON Assessment Engine")
    is_active: bool = True
    api_endpoint: Optional[str] = "https://api.tcsion.example.com/v1"
    api_key: Optional[str] = None  # Received during setup, stored encrypted, never exposed
    webhook_secret: Optional[str] = None


class ExternalProviderConfigOut(BaseModel):
    id: uuid.UUID
    provider_code: str
    provider_name: str
    is_active: bool
    api_endpoint: Optional[str] = None
    has_api_key: bool
    last_sync_at: Optional[datetime] = None
    last_sync_status: Optional[str] = None

    class Config:
        from_attributes = True

