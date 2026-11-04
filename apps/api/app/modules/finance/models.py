import uuid
from datetime import datetime, date, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import Boolean, ForeignKey, Index, String, Float, Integer, Date, DateTime, JSON, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import TenantBaseModel, Base, TimestampMixin


class FeeStructure(TenantBaseModel):
    """
    School-defined fee configuration and term schedules.
    Configured per academic year, class/stream, and institution level.
    No hardcoded fee amounts or term counts.
    """
    __tablename__ = "fee_structures"

    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_year: Mapped[str] = mapped_column(String(32), nullable=False, default="2026-2027", index=True)
    institution_type: Mapped[str] = mapped_column(String(64), nullable=False, default="School")  # School, PU College, Degree College
    class_or_stream: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # e.g. Class 10, I PUC - PCMB, II PUC Commerce
    
    term_count: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 3 terms for School, 2 semesters for College
    terms_config: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
        default=list
        # e.g. [{"term_code": "TERM_1", "name": "Term 1 (June-Aug)", "due_date": "2026-06-30", "share_pct": 40}]
    )
    fee_heads: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
        default=list
        # e.g. [{"head_code": "TUITION", "title": "Tuition Fee", "amount": 30000}, {"head_code": "LAB", "title": "Lab Fee", "amount": 8000}]
    )
    total_annual_fee: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    concessions_allowed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("idx_fee_struct_tenant_year_class", "tenant_id", "academic_year", "class_or_stream"),
    )


class FeeInvoice(TenantBaseModel):
    """
    Authoritative fee ledger invoice for a student.
    Contains fee-head breakdown, term assignment, paid and balance amounts.
    """
    __tablename__ = "fee_invoices"

    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    invoice_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    admission_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    class_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    section_or_stream: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    academic_year: Mapped[str] = mapped_column(String(32), nullable=False, default="2026-2027", index=True)
    term_code: Mapped[str] = mapped_column(String(32), nullable=False, default="TERM_1", index=True)
    term_name: Mapped[str] = mapped_column(String(128), nullable=False, default="Term 1")
    fee_head: Mapped[str] = mapped_column(String(64), nullable=False, default="COLLEGE_FEE")
    fee_title: Mapped[str] = mapped_column(String(255), nullable=False)

    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    concession_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_payable: Mapped[float] = mapped_column(Float, nullable=False)
    paid_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    balance_amount: Mapped[float] = mapped_column(Float, nullable=False)

    due_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    last_payment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="UNPAID", index=True)  # PAID, PARTIAL, OVERDUE, UNPAID
    breakdown: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)

    payments: Mapped[List["FeePayment"]] = relationship("FeePayment", back_populates="invoice", cascade="all, delete-orphan")
    receipts: Mapped[List["FeeReceipt"]] = relationship("FeeReceipt", back_populates="invoice", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_fee_inv_tenant_student", "tenant_id", "student_id"),
        Index("idx_fee_inv_tenant_status", "tenant_id", "status"),
        Index("idx_fee_inv_tenant_due", "tenant_id", "due_date"),
    )


class FeePayment(TenantBaseModel):
    """
    Immutable payment transaction record.
    Never modify completed payments directly; refunds/adjustments are separate ledger entries.
    """
    __tablename__ = "fee_payments"

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_invoices.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(
        String(32), nullable=False, default="CASH"  # CASH, UPI, BANK_TRANSFER, ONLINE_NETBANKING, CHEQUE
    )
    transaction_reference: Mapped[str] = mapped_column(String(128), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    
    collected_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    collected_by_name: Mapped[str] = mapped_column(String(255), nullable=False, default="Accountant")
    payment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    
    fee_allocations: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON, nullable=False, default=list
        # e.g. [{"head": "TUITION", "allocated": 15000, "remaining": 0}, {"head": "LAB", "allocated": 5000, "remaining": 5000}]
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="CONFIRMED")  # CONFIRMED, REVERSED, REFUNDED
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    invoice: Mapped["FeeInvoice"] = relationship("FeeInvoice", back_populates="payments")
    receipt: Mapped[Optional["FeeReceipt"]] = relationship("FeeReceipt", back_populates="payment", uselist=False)

    __table_args__ = (
        UniqueConstraint("tenant_id", "idempotency_key", name="uq_fee_payment_tenant_idempotency"),
    )


class FeeReceipt(TenantBaseModel):
    """
    Permanent, verifiable receipt generated immediately upon payment confirmation.
    Includes institution branding, unique receipt number, multi-format printing support,
    and duplicate reprint tracking.
    """
    __tablename__ = "fee_receipts"

    receipt_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    payment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_payments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_invoices.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    admission_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    class_name: Mapped[str] = mapped_column(String(64), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(32), nullable=False)
    term_code: Mapped[str] = mapped_column(String(32), nullable=False)
    term_name: Mapped[str] = mapped_column(String(128), nullable=False)

    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    previous_balance: Mapped[float] = mapped_column(Float, nullable=False)
    current_balance: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(32), nullable=False)
    transaction_reference: Mapped[str] = mapped_column(String(128), nullable=False)
    payment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    fee_allocations: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    institution_branding: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict
        # {"name": "Akshara Global School", "affiliation": "CBSE Affiliation # 830192", "address": "...", "phone": "..."}
    )
    qr_verification_code: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Reprint tracking & anti-fraud
    reprint_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reprinted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    status: Mapped[str] = mapped_column(String(32), nullable=False, default="CONFIRMED")  # CONFIRMED, REVERSED, REFUNDED

    payment: Mapped["FeePayment"] = relationship("FeePayment", back_populates="receipt")
    invoice: Mapped["FeeInvoice"] = relationship("FeeInvoice", back_populates="receipts")
    audit_logs: Mapped[List["ReceiptAuditLog"]] = relationship(
        "ReceiptAuditLog", back_populates="receipt", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("tenant_id", "receipt_number", name="uq_fee_receipt_tenant_number"),
    )


class ReceiptAuditLog(TenantBaseModel):
    """
    Immutable audit log for receipt creation, viewing, printing (A4/80mm/58mm),
    PDF downloads, and duplicate reprinting.
    """
    __tablename__ = "receipt_audit_logs"

    receipt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fee_receipts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    receipt_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    action: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True
        # GENERATED, PRINTED_A4, PRINTED_80MM, PRINTED_58MM, REPRINTED_DUPLICATE, DOWNLOADED_PDF, SHARED, REVERSED
    )
    performed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    performed_by_name: Mapped[str] = mapped_column(String(255), nullable=False, default="System")
    role: Mapped[str] = mapped_column(String(64), nullable=False, default="ACCOUNTANT")
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)

    receipt: Mapped["FeeReceipt"] = relationship("FeeReceipt", back_populates="audit_logs")
