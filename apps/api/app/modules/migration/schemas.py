import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class MigrationValidateRequest(BaseModel):
    target_module: str = Field(..., description="Target module: STUDENTS, FEES, STAFF, ATTENDANCE, EXAMINATIONS")
    import_type: str = Field(..., description="Import sub-type (e.g. STUDENT_MASTER, OPENING_BALANCES)")
    records: List[Dict[str, Any]] = Field(..., description="Array of parsed row dictionaries")


class MigrationValidateResponse(BaseModel):
    is_valid: bool
    total_records: int
    clean_records_count: int
    duplicate_candidates_count: int
    errors_count: int
    duplicate_candidates: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []
    column_mappings: List[Dict[str, Any]] = []


class MigrationExecuteRequest(BaseModel):
    target_module: str
    import_type: str
    file_name: str = "import_dataset.csv"
    conflict_policy: str = "SKIP"  # SKIP, OVERWRITE, MERGE
    records: List[Dict[str, Any]]


class MigrationExecuteResponse(BaseModel):
    status: str
    batch_number: str
    total_records: int
    imported_count: int
    skipped_count: int
    error_count: int
    message: str


class MigrationBatchLogOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    batch_number: str
    target_module: str
    import_type: str
    file_name: str
    total_records: int
    imported_count: int
    skipped_count: int
    error_count: int
    conflict_policy: str
    status: str
    validation_summary: Dict[str, Any]
    executed_by_name: str
    created_at: datetime

    class Config:
        from_attributes = True

