import uuid
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TermConfigItem(BaseModel):
    term_code: str
    name: str
    due_date: str
    share_pct: float


class FeeHeadConfigItem(BaseModel):
    head_code: str
    title: str
    amount: float


class FeeStructureCreate(BaseModel):
    academic_year: str = Field(..., example="2026-2027")
    institution_type: str = Field(default="School", example="School")  # School, PU College, Degree College
    class_or_stream: str = Field(..., example="Class 10")
    term_count: int = Field(default=3, ge=1, le=12)
    terms_config: List[Dict[str, Any]] = Field(default_factory=list)
    fee_heads: List[Dict[str, Any]] = Field(default_factory=list)
    concessions_allowed: bool = True
    notes: Optional[str] = None


class FeeStructureOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    academic_year: str
    institution_type: str
    class_or_stream: str
    term_count: int
    terms_config: List[Dict[str, Any]]
    fee_heads: List[Dict[str, Any]]
    total_annual_fee: float
    concessions_allowed: bool
    version: int
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FeeAllocationItem(BaseModel):
    head: str
    allocated: float
    remaining: float


class FeeCollectionRequest(BaseModel):
    invoice_id: uuid.UUID
    amount: float = Field(..., gt=0)
    payment_method: str = Field(default="CASH")  # CASH, UPI, BANK_TRANSFER, ONLINE_NETBANKING, CHEQUE
    transaction_reference: Optional[str] = None
    idempotency_key: str = Field(..., min_length=8)
    fee_allocations: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class FeeReceiptOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    receipt_number: str
    payment_id: uuid.UUID
    invoice_id: uuid.UUID
    student_id: uuid.UUID
    student_name: str
    admission_number: str
    class_name: str
    academic_year: str
    term_code: str
    term_name: str
    amount_paid: float
    previous_balance: float
    current_balance: float
    payment_method: str
    transaction_reference: str
    payment_date: datetime
    fee_allocations: List[Dict[str, Any]]
    institution_branding: Dict[str, Any]
    qr_verification_code: str
    reprint_count: int
    is_duplicate: bool
    reprinted_at: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


class ReprintReceiptResponse(BaseModel):
    receipt: FeeReceiptOut
    message: str
    reprint_count: int
    is_duplicate: bool


class CategoryBreakdownItem(BaseModel):
    head_code: str
    title: str
    expected_amount: float
    collected_amount: float
    balance_amount: float
    collection_percentage: float


class ConsolidatedReportResponse(BaseModel):
    academic_year: str
    term_code: Optional[str] = None
    class_name: Optional[str] = None
    total_expected_fee: float
    total_collected: float
    total_outstanding: float
    collection_percentage: float
    students_paid_in_full: int
    students_partially_paid: int
    students_unpaid: int
    category_breakdown: List[CategoryBreakdownItem]


class DueReportItem(BaseModel):
    invoice_id: uuid.UUID
    student_name: str
    admission_number: str
    class_name: str
    term_name: str
    fee_head: str
    fee_title: str
    total_amount: float
    paid_amount: float
    outstanding_amount: float
    last_payment_date: Optional[date] = None
    due_date: date
    overdue_days: int
    status: str

