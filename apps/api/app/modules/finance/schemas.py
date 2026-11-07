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


class GSTCalculateRequest(BaseModel):
    amount: float = Field(..., gt=0)
    customer_state: str = Field(default="Karnataka")
    hsn_code: str = Field(default="9992")


class GSTCalculateResponse(BaseModel):
    taxable_amount: float
    hsn_code: str
    supply_type: str # INTRA_STATE or INTER_STATE
    cgst_rate: float
    cgst_amount: float
    sgst_rate: float
    sgst_amount: float
    igst_rate: float
    igst_amount: float
    total_tax: float
    total_payable: float


class PaymentWebhookPayload(BaseModel):
    event: str # subscription.charged, payment.captured, invoice.paid
    tenant_id: uuid.UUID
    amount: float
    transaction_id: str
    signature: Optional[str] = None


# ==============================================================================
# FEE HEAD MASTER & CONCESSION FIXATION SCHEMAS
# ==============================================================================

class FeeHeadCreate(BaseModel):
    head_code: str = Field(..., min_length=2, max_length=64)
    title: str = Field(..., min_length=2, max_length=128)
    category: str = Field(default="ACADEMIC")  # ACADEMIC, FACILITY, TRANSPORT, HOSTEL, SECURITY_DEPOSIT, OPTIONAL_SERVICE
    charge_type: str = Field(default="PER_TERM")  # ONE_TIME, PER_TERM, MONTHLY, ANNUAL
    is_compulsory: bool = True
    is_recurring: bool = True
    default_amount: float = Field(default=0.0, ge=0.0)
    tax_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    description: Optional[str] = None


class FeeHeadUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    charge_type: Optional[str] = None
    is_compulsory: Optional[bool] = None
    is_recurring: Optional[bool] = None
    default_amount: Optional[float] = None
    tax_rate: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class FeeHeadOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    head_code: str
    title: str
    category: str
    charge_type: str
    is_compulsory: bool
    is_recurring: bool
    default_amount: float
    tax_rate: float
    description: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class HeadConcessionAllocation(BaseModel):
    head_code: str
    title: str
    standard_amount: float
    concession_amount: float
    final_payable: float


class AdditionalCharge(BaseModel):
    charge_code: str
    title: str
    category: str
    amount: float


class TermInstallmentSchedule(BaseModel):
    term_code: str
    name: str
    due_date: str
    share_pct: float
    amount: float


class StudentFeeFixationCalculateRequest(BaseModel):
    class_or_stream: str
    academic_year: str = "2026-2027"
    standard_annual_fee: float = Field(..., gt=0)
    negotiated_annual_fee: Optional[float] = None
    total_concession_amount: Optional[float] = None
    concession_category: str = "Management Negotiation"
    concession_method: str = "OVERALL_ALLOCATION"  # OVERALL_ALLOCATION or HEAD_WISE_ADJUSTMENTS
    head_adjustments: Optional[List[Dict[str, Any]]] = None  # [{head_code: "TUITION", concession_amount: 10000}]
    additional_charges: Optional[List[Dict[str, Any]]] = None  # [{charge_code: "TRANSPORT", amount: 12000}]
    terms_config: Optional[List[Dict[str, Any]]] = None


class StudentFeeFixationCalculateResponse(BaseModel):
    standard_annual_fee: float
    total_concession_amount: float
    additional_charges_total: float
    final_annual_payable: float
    concession_category: str
    concession_method: str
    head_allocations: List[HeadConcessionAllocation]
    additional_charges: List[AdditionalCharge]
    term_installments: List[TermInstallmentSchedule]


class StudentFeeFixationCreate(BaseModel):
    student_id: Optional[uuid.UUID] = None
    admission_id: Optional[uuid.UUID] = None
    student_name: str
    admission_number: Optional[str] = None
    academic_year: str = "2026-2027"
    class_or_stream: str
    standard_annual_fee: float = Field(..., gt=0)
    total_concession_amount: float = Field(default=0.0, ge=0)
    concession_category: str = "Management Negotiation"
    concession_method: str = "OVERALL_ALLOCATION"
    final_annual_payable: float = Field(..., ge=0)
    head_allocations: List[Dict[str, Any]] = Field(default_factory=list)
    additional_charges: List[Dict[str, Any]] = Field(default_factory=list)
    term_installments: List[Dict[str, Any]] = Field(default_factory=list)
    reason_remarks: Optional[str] = None
    auto_approve: bool = False


class StudentFeeFixationOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    student_id: Optional[uuid.UUID] = None
    admission_id: Optional[uuid.UUID] = None
    student_name: str
    admission_number: Optional[str] = None
    academic_year: str
    class_or_stream: str
    standard_annual_fee: float
    total_concession_amount: float
    concession_category: str
    concession_method: str
    final_annual_payable: float
    head_allocations: List[Dict[str, Any]]
    additional_charges: List[Dict[str, Any]]
    term_installments: List[Dict[str, Any]]
    reason_remarks: Optional[str] = None
    status: str
    created_by_name: str
    approved_by_name: Optional[str] = None
    approved_at: Optional[datetime] = None
    version: int
    audit_history: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class StudentFeeFixationApproveRequest(BaseModel):
    approval_notes: Optional[str] = None


class StudentFeeFixationRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=4)


class StudentLedgerStatementOut(BaseModel):
    student_id: uuid.UUID
    student_name: str
    admission_number: str
    class_name: str
    academic_year: str
    has_custom_fixation: bool
    fixation: Optional[StudentFeeFixationOut] = None
    standard_fee: float
    total_concessions: float
    net_payable: float
    total_paid: float
    balance_due: float
    invoices: List[Dict[str, Any]]
    payments: List[Dict[str, Any]]
    receipts: List[FeeReceiptOut]



