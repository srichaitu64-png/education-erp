import uuid
import hmac
import hashlib
from datetime import datetime, date, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request, status
from sqlalchemy import select, and_, func, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.database.session import get_db, get_current_tenant_id, set_current_tenant_id
from app.modules.identity.models import User
from app.modules.tenants.models import Tenant
from app.modules.subscriptions.models import Subscription, SubscriptionAuditLog
from app.modules.finance.models import (
    FeeStructure,
    FeeInvoice,
    FeePayment,
    FeeReceipt,
    ReceiptAuditLog,
    FeeHeadMaster,
    StudentFeeFixation,
    FeeAdjustmentLog,
)
from app.modules.academic.models import Student
from app.modules.finance.schemas import (
    FeeStructureCreate,
    FeeStructureOut,
    FeeCollectionRequest,
    FeeReceiptOut,
    ReprintReceiptResponse,
    ConsolidatedReportResponse,
    CategoryBreakdownItem,
    DueReportItem,
    GSTCalculateRequest,
    GSTCalculateResponse,
    PaymentWebhookPayload,
    FeeHeadCreate,
    FeeHeadUpdate,
    FeeHeadOut,
    StudentFeeFixationCreate,
    StudentFeeFixationOut,
    StudentFeeFixationCalculateRequest,
    StudentFeeFixationCalculateResponse,
    StudentFeeFixationApproveRequest,
    StudentFeeFixationRejectRequest,
    StudentLedgerStatementOut,
)
from app.security.deps import get_current_user, require_permission

router = APIRouter(prefix="/finance", tags=["Finance & Fee Management"])


# ---------------------------------------------------------------------------
# 1. School-Defined Fee Structures & Term Configurations
# ---------------------------------------------------------------------------
@router.get("/structures", response_model=List[FeeStructureOut])
async def list_fee_structures(
    academic_year: Optional[str] = None,
    class_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    List configured fee structures for the institution.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(FeeStructure).where(
        FeeStructure.tenant_id == tenant_id,
        FeeStructure.is_active == True,
    )
    if academic_year:
        stmt = stmt.where(FeeStructure.academic_year == academic_year)
    if class_name:
        stmt = stmt.where(FeeStructure.class_or_stream == class_name)

    stmt = stmt.order_by(FeeStructure.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/structures", response_model=FeeStructureOut, status_code=status.HTTP_201_CREATED)
async def create_or_update_fee_structure(
    payload: FeeStructureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.configure")),
):
    """
    Configure a flexible, school-defined fee structure and term schedule.
    STRICT SECURITY: Requires 'fees.configure' permission. Ordinary accountants or users
    without Super Admin explicit grant cannot modify fee structures.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Missing active tenant context")

    # Authoritative calculation of annual fee sum from individual fee heads
    total_fee = sum(float(head.get("amount", 0.0)) for head in payload.fee_heads)

    # Check if a structure already exists for this academic year & class
    existing_stmt = select(FeeStructure).where(
        FeeStructure.tenant_id == tenant_id,
        FeeStructure.academic_year == payload.academic_year,
        FeeStructure.class_or_stream == payload.class_or_stream,
    )
    res = await db.execute(existing_stmt)
    existing = res.scalars().first()

    if existing:
        existing.institution_type = payload.institution_type
        existing.term_count = payload.term_count
        existing.terms_config = payload.terms_config
        existing.fee_heads = payload.fee_heads
        existing.total_annual_fee = total_fee
        existing.concessions_allowed = payload.concessions_allowed
        existing.version += 1
        existing.notes = payload.notes
        existing.updated_by = current_user.id
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_structure = FeeStructure(
            tenant_id=tenant_id,
            academic_year=payload.academic_year,
            institution_type=payload.institution_type,
            class_or_stream=payload.class_or_stream,
            term_count=payload.term_count,
            terms_config=payload.terms_config,
            fee_heads=payload.fee_heads,
            total_annual_fee=total_fee,
            concessions_allowed=payload.concessions_allowed,
            version=1,
            notes=payload.notes,
            created_by=current_user.id,
        )
        db.add(new_structure)
        await db.commit()
        await db.refresh(new_structure)
        return new_structure


# ---------------------------------------------------------------------------
# 2. Invoices & Student Accounts
# ---------------------------------------------------------------------------
@router.get("/invoices")
async def list_fee_invoices(
    student_id: Optional[uuid.UUID] = None,
    class_name: Optional[str] = None,
    term_code: Optional[str] = None,
    fee_status: Optional[str] = None,
    academic_year: Optional[str] = "2026-2027",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    List student fee invoices with optional filters.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(FeeInvoice).where(FeeInvoice.tenant_id == tenant_id)

    if academic_year:
        stmt = stmt.where(FeeInvoice.academic_year == academic_year)
    if student_id:
        stmt = stmt.where(FeeInvoice.student_id == student_id)
    if class_name:
        stmt = stmt.where(FeeInvoice.class_name == class_name)
    if term_code:
        stmt = stmt.where(FeeInvoice.term_code == term_code)
    if fee_status:
        stmt = stmt.where(FeeInvoice.status == fee_status)

    stmt = stmt.order_by(FeeInvoice.due_date.asc())
    res = await db.execute(stmt)
    return res.scalars().all()


# ---------------------------------------------------------------------------
# 3. Accountant Fee Collection & Instant Automatic Receipt Generation
# ---------------------------------------------------------------------------
@router.post("/collect", response_model=FeeReceiptOut, status_code=status.HTTP_201_CREATED)
async def collect_fee_and_generate_receipt(
    payload: FeeCollectionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.collect")),
):
    """
    Collects a fee payment, commits ledger transaction, and AUTOMATICALLY generates
    an authoritative, institution-branded receipt.
    Guarantees idempotency using idempotency_key to prevent duplicate transactions.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Missing active tenant context")

    # 1. Idempotency Check: if this idempotency_key was already processed, return existing receipt
    idemp_stmt = select(FeePayment).options(selectinload(FeePayment.receipt)).where(
        FeePayment.tenant_id == tenant_id,
        FeePayment.idempotency_key == payload.idempotency_key,
    )
    res_idemp = await db.execute(idemp_stmt)
    existing_payment = res_idemp.scalars().first()
    if existing_payment and existing_payment.receipt:
        return existing_payment.receipt

    # 2. Fetch Invoice
    inv_stmt = select(FeeInvoice).where(
        FeeInvoice.id == payload.invoice_id,
        FeeInvoice.tenant_id == tenant_id,
    )
    res_inv = await db.execute(inv_stmt)
    invoice = res_inv.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Fee invoice not found")

    amount = round(payload.amount, 2)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

    if amount > round(invoice.balance_amount, 2):
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount (₹{amount}) cannot exceed current outstanding balance (₹{invoice.balance_amount})",
        )

    previous_balance = invoice.balance_amount
    new_paid = invoice.paid_amount + amount
    new_balance = max(0.0, invoice.net_payable - new_paid)

    # 3. Update Invoice Ledger
    invoice.paid_amount = new_paid
    invoice.balance_amount = new_balance
    invoice.status = "PAID" if new_balance <= 0.01 else "PARTIAL"
    invoice.last_payment_date = datetime.now(timezone.utc).date()
    invoice.updated_by = current_user.id

    # 4. Fee-head allocation calculation
    allocations = payload.fee_allocations
    if not allocations:
        # Auto-allocate sequentially across invoice breakdown
        allocated_rem = amount
        allocations = []
        if invoice.breakdown:
            for item in invoice.breakdown:
                item_head = item.get("head_code", "TUITION")
                item_title = item.get("title", "Tuition Fee")
                item_cost = float(item.get("amount", 0.0))
                alloc_for_item = min(allocated_rem, item_cost)
                allocated_rem -= alloc_for_item
                allocations.append({
                    "head": item_head,
                    "title": item_title,
                    "allocated": alloc_for_item,
                    "remaining": max(0.0, item_cost - alloc_for_item),
                })
        else:
            allocations.append({
                "head": invoice.fee_head,
                "title": invoice.fee_title,
                "allocated": amount,
                "remaining": new_balance,
            })

    # 5. Create Payment Transaction
    payment = FeePayment(
        tenant_id=tenant_id,
        invoice_id=invoice.id,
        student_id=invoice.student_id,
        amount_paid=amount,
        payment_method=payload.payment_method.upper(),
        transaction_reference=payload.transaction_reference or f"TXN-{uuid.uuid4().hex[:10].upper()}",
        idempotency_key=payload.idempotency_key,
        collected_by_user_id=current_user.id,
        collected_by_name=current_user.full_name,
        payment_date=datetime.now(timezone.utc),
        fee_allocations=allocations,
        status="CONFIRMED",
        notes=payload.notes,
        created_by=current_user.id,
    )
    db.add(payment)
    await db.flush()

    # 6. Generate Unique Permanent Receipt Number
    # Count receipts to generate deterministic monotonic receipt number
    count_stmt = select(func.count(FeeReceipt.id)).where(FeeReceipt.tenant_id == tenant_id)
    receipt_count = (await db.execute(count_stmt)).scalar() or 0

    tenant_obj = None
    if tenant_id:
        tenant_obj = (await db.execute(select(Tenant).where(Tenant.id == tenant_id))).scalars().first()

    code_prefix = "AKSH"
    inst_name = "Akshara Global Educational Institutions"
    if tenant_obj and tenant_obj.code not in ["akshara", "our-school-demo"]:
        code_prefix = tenant_obj.code[:4].upper()
        inst_name = tenant_obj.name

    receipt_num = f"RCP-{code_prefix}-{invoice.academic_year.replace('-', '')}-{1001 + receipt_count}"

    # Institution branding metadata
    branding = {
        "institution_name": inst_name,
        "affiliation": "Affiliated to State Pre-University & Secondary Education Board",
        "address": (tenant_obj.address if tenant_obj and tenant_obj.address else "Campus Ground, Knowledge Corridor, Bengaluru, Karnataka - 560085"),
        "phone": (tenant_obj.phone if tenant_obj and tenant_obj.phone else "+91 80 2345 6789"),
        "email": (tenant_obj.email if tenant_obj and tenant_obj.email else "accounts@institution.erp.in"),
        "receipt_header_note": "Computer Generated Fee Receipt - Valid with Authorized Signatory Seal",
    }

    # QR verification hash
    qr_hash = f"VERIFY:RECEIPT:{receipt_num}:{payment.idempotency_key[:8]}:{amount}"

    receipt = FeeReceipt(
        tenant_id=tenant_id,
        receipt_number=receipt_num,
        payment_id=payment.id,
        invoice_id=invoice.id,
        student_id=invoice.student_id,
        student_name=invoice.student_name,
        admission_number=invoice.admission_number,
        class_name=invoice.class_name,
        academic_year=invoice.academic_year,
        term_code=invoice.term_code,
        term_name=invoice.term_name,
        amount_paid=amount,
        previous_balance=previous_balance,
        current_balance=new_balance,
        payment_method=payment.payment_method,
        transaction_reference=payment.transaction_reference,
        payment_date=payment.payment_date,
        fee_allocations=allocations,
        institution_branding=branding,
        qr_verification_code=qr_hash,
        reprint_count=0,
        is_duplicate=False,
        status="CONFIRMED",
        created_by=current_user.id,
    )
    db.add(receipt)
    await db.flush()

    # 7. Record Audit Log
    audit = ReceiptAuditLog(
        tenant_id=tenant_id,
        receipt_id=receipt.id,
        receipt_number=receipt.receipt_number,
        action="GENERATED",
        performed_by_user_id=current_user.id,
        performed_by_name=current_user.full_name,
        role="ACCOUNTANT",
        details={
            "amount": amount,
            "payment_method": payment.payment_method,
            "invoice_number": invoice.invoice_number,
            "student_name": invoice.student_name,
        },
        created_by=current_user.id,
    )
    db.add(audit)

    await db.commit()
    await db.refresh(receipt)
    return receipt


# ---------------------------------------------------------------------------
# 4. Searchable Receipt Register & Historical Reprint
# ---------------------------------------------------------------------------
@router.get("/receipts", response_model=List[FeeReceiptOut])
async def list_receipt_register(
    query: Optional[str] = None,
    payment_method: Optional[str] = None,
    term_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    Searchable Receipt Register for Accountants, Principals, and Super Admins.
    Filter by student name, admission number, receipt number, term, or payment method.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(FeeReceipt).where(FeeReceipt.tenant_id == tenant_id)

    if query:
        q_wild = f"%{query}%"
        stmt = stmt.where(
            or_(
                FeeReceipt.receipt_number.ilike(q_wild),
                FeeReceipt.student_name.ilike(q_wild),
                FeeReceipt.admission_number.ilike(q_wild),
                FeeReceipt.class_name.ilike(q_wild),
            )
        )
    if payment_method:
        stmt = stmt.where(FeeReceipt.payment_method == payment_method.upper())
    if term_code:
        stmt = stmt.where(FeeReceipt.term_code == term_code)

    stmt = stmt.order_by(FeeReceipt.payment_date.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/receipts/{receipt_id}", response_model=FeeReceiptOut)
async def get_receipt_details(
    receipt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    Get full details of a specific receipt.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(FeeReceipt).where(
        FeeReceipt.id == receipt_id,
        FeeReceipt.tenant_id == tenant_id,
    )
    res = await db.execute(stmt)
    receipt = res.scalars().first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Fee receipt not found")
    return receipt


@router.post("/receipts/{receipt_id}/reprint", response_model=ReprintReceiptResponse)
async def reprint_receipt(
    receipt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    Reprint an existing historical receipt.
    Strictly marks the receipt with is_duplicate = True, increments reprint_count,
    updates reprinted_at timestamp, and records an immutable audit log entry.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(FeeReceipt).where(
        FeeReceipt.id == receipt_id,
        FeeReceipt.tenant_id == tenant_id,
    )
    res = await db.execute(stmt)
    receipt = res.scalars().first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Fee receipt not found")

    receipt.reprint_count += 1
    receipt.is_duplicate = True
    receipt.reprinted_at = datetime.now(timezone.utc)
    receipt.updated_by = current_user.id

    audit = ReceiptAuditLog(
        tenant_id=tenant_id,
        receipt_id=receipt.id,
        receipt_number=receipt.receipt_number,
        action="REPRINTED_DUPLICATE",
        performed_by_user_id=current_user.id,
        performed_by_name=current_user.full_name,
        role="ACCOUNTANT",
        details={
            "reprint_number": receipt.reprint_count,
            "reprinted_at": receipt.reprinted_at.isoformat(),
        },
        created_by=current_user.id,
    )
    db.add(audit)

    await db.commit()
    await db.refresh(receipt)
    return ReprintReceiptResponse(
        receipt=receipt,
        message=f"Receipt {receipt.receipt_number} reprinted successfully. Marked as DUPLICATE.",
        reprint_count=receipt.reprint_count,
        is_duplicate=receipt.is_duplicate,
    )


# ---------------------------------------------------------------------------
# 5. Consolidated Collection Reports
# ---------------------------------------------------------------------------
@router.get("/reports/consolidated", response_model=ConsolidatedReportResponse)
async def get_consolidated_collection_report(
    academic_year: str = Query(default="2026-2027"),
    term_code: Optional[str] = None,
    class_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    Generate authoritative Consolidated Fee Collection Report.
    Calculates total expected fees, collections, balance, paid in full / partial / unpaid counts,
    and category-wise breakdown.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(FeeInvoice).where(
        FeeInvoice.tenant_id == tenant_id,
        FeeInvoice.academic_year == academic_year,
    )
    if term_code:
        stmt = stmt.where(FeeInvoice.term_code == term_code)
    if class_name:
        stmt = stmt.where(FeeInvoice.class_name == class_name)

    res = await db.execute(stmt)
    invoices = res.scalars().all()

    total_expected = sum(inv.total_amount for inv in invoices)
    total_collected = sum(inv.paid_amount for inv in invoices)
    total_outstanding = sum(inv.balance_amount for inv in invoices)
    col_pct = round((total_collected / total_expected) * 100, 2) if total_expected > 0 else 0.0

    paid_full = sum(1 for inv in invoices if inv.balance_amount <= 0.01)
    paid_partial = sum(1 for inv in invoices if inv.paid_amount > 0 and inv.balance_amount > 0.01)
    unpaid = sum(1 for inv in invoices if inv.paid_amount <= 0.01)

    # Category-wise breakdown
    cat_map: Dict[str, Dict[str, float]] = {}
    for inv in invoices:
        cat = inv.fee_head
        if cat not in cat_map:
            cat_map[cat] = {"expected": 0.0, "collected": 0.0, "balance": 0.0}
        cat_map[cat]["expected"] += inv.total_amount
        cat_map[cat]["collected"] += inv.paid_amount
        cat_map[cat]["balance"] += inv.balance_amount

    breakdown_list = []
    for cat, data in cat_map.items():
        exp = data["expected"]
        col = data["collected"]
        pct = round((col / exp) * 100, 2) if exp > 0 else 0.0
        breakdown_list.append(
            CategoryBreakdownItem(
                head_code=cat,
                title=cat.replace("_", " ").title(),
                expected_amount=round(exp, 2),
                collected_amount=round(col, 2),
                balance_amount=round(data["balance"], 2),
                collection_percentage=pct,
            )
        )

    return ConsolidatedReportResponse(
        academic_year=academic_year,
        term_code=term_code,
        class_name=class_name,
        total_expected_fee=round(total_expected, 2),
        total_collected=round(total_collected, 2),
        total_outstanding=round(total_outstanding, 2),
        collection_percentage=col_pct,
        students_paid_in_full=paid_full,
        students_partially_paid=paid_partial,
        students_unpaid=unpaid,
        category_breakdown=breakdown_list,
    )


# ---------------------------------------------------------------------------
# 6. Outstanding Fee Due Reports
# ---------------------------------------------------------------------------
@router.get("/reports/due", response_model=List[DueReportItem])
async def get_fee_due_report(
    academic_year: str = Query(default="2026-2027"),
    term_code: Optional[str] = None,
    class_name: Optional[str] = None,
    due_status: Optional[str] = None,  # OVERDUE, PARTIAL, UNPAID
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    Generate authoritative Fee Due Report with aging, overdue days, and outstanding amounts.
    """
    tenant_id = get_current_tenant_id()
    stmt = select(FeeInvoice).where(
        FeeInvoice.tenant_id == tenant_id,
        FeeInvoice.academic_year == academic_year,
        FeeInvoice.balance_amount > 0.01,
    )
    if term_code:
        stmt = stmt.where(FeeInvoice.term_code == term_code)
    if class_name:
        stmt = stmt.where(FeeInvoice.class_name == class_name)
    if due_status:
        stmt = stmt.where(FeeInvoice.status == due_status)

    stmt = stmt.order_by(FeeInvoice.due_date.asc())
    res = await db.execute(stmt)
    invoices = res.scalars().all()

    today = date.today()
    due_items = []
    for inv in invoices:
        overdue_days = max(0, (today - inv.due_date).days) if inv.due_date < today else 0
        computed_status = "OVERDUE" if overdue_days > 0 else inv.status
        due_items.append(
            DueReportItem(
                invoice_id=inv.id,
                student_name=inv.student_name,
                admission_number=inv.admission_number,
                class_name=inv.class_name,
                term_name=inv.term_name,
                fee_head=inv.fee_head,
                fee_title=inv.fee_title,
                total_amount=round(inv.total_amount, 2),
                paid_amount=round(inv.paid_amount, 2),
                outstanding_amount=round(inv.balance_amount, 2),
                last_payment_date=inv.last_payment_date,
                due_date=inv.due_date,
                overdue_days=overdue_days,
                status=computed_status,
            )
        )

    return due_items


# ---------------------------------------------------------------------------
# 5. Commercial Billing, Indian GST (HSN 9992) & Payment Gateway Webhook
# ---------------------------------------------------------------------------
@router.post("/billing/calculate-gst", response_model=GSTCalculateResponse)
async def calculate_commercial_gst(payload: GSTCalculateRequest):
    """
    Calculate statutory Indian Goods and Services Tax (GST) for Education & SaaS services.
    Enforces HSN/SAC Code 9992 with 18% standard taxation.
    - Intra-State (Karnataka -> Karnataka): 9% CGST + 9% SGST.
    - Inter-State (Karnataka -> Other States): 18% IGST.
    """
    state_norm = payload.customer_state.strip().lower()
    is_intra_state = (state_norm == "karnataka")

    taxable = round(payload.amount, 2)
    hsn = payload.hsn_code or "9992"

    if is_intra_state:
        supply_type = "INTRA_STATE"
        cgst_rate = 9.0
        cgst_amt = round(taxable * 0.09, 2)
        sgst_rate = 9.0
        sgst_amt = round(taxable * 0.09, 2)
        igst_rate = 0.0
        igst_amt = 0.0
        total_tax = round(cgst_amt + sgst_amt, 2)
    else:
        supply_type = "INTER_STATE"
        cgst_rate = 0.0
        cgst_amt = 0.0
        sgst_rate = 0.0
        sgst_amt = 0.0
        igst_rate = 18.0
        igst_amt = round(taxable * 0.18, 2)
        total_tax = igst_amt

    total_payable = round(taxable + total_tax, 2)

    return GSTCalculateResponse(
        taxable_amount=taxable,
        hsn_code=hsn,
        supply_type=supply_type,
        cgst_rate=cgst_rate,
        cgst_amount=cgst_amt,
        sgst_rate=sgst_rate,
        sgst_amount=sgst_amt,
        igst_rate=igst_rate,
        igst_amount=igst_amt,
        total_tax=total_tax,
        total_payable=total_payable
    )


@router.post("/billing/webhooks/payment", status_code=status.HTTP_200_OK)
async def handle_payment_gateway_webhook(
    request: Request,
    payload: PaymentWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None, alias="X-Webhook-Signature"),
    db: AsyncSession = Depends(get_db)
):
    """
    Commercial Payment Gateway Webhook Handler (Razorpay / Stripe / Easebuzz).
    Verifies cryptographic HMAC-SHA256 signature, updates subscription lifecycle,
    and logs immutable financial audit records.
    """
    webhook_secret = getattr(settings, "PAYMENT_WEBHOOK_SECRET", None) or settings.SECRET_KEY
    raw_body = await request.body()

    # A payment webhook is never accepted without a verifiable signature.
    if not x_webhook_signature:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing payment webhook signature.")
    expected_sig = hmac.new(webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_sig, x_webhook_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cryptographic webhook signature")

    # Resolve the tenant only after signature verification, then scope RLS to it.
    tenant = await db.get(Tenant, payload.tenant_id)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found.")
    set_current_tenant_id(tenant.id)
    db.info["rls_tenant_id"] = tenant.id
    await db.execute(
        text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
        {"tenant_id": str(tenant.id)}
    )

    # Locate tenant subscription
    stmt = (
        select(Subscription)
        .where(Subscription.tenant_id == payload.tenant_id)
        .order_by(Subscription.created_at.desc())
    )
    res = await db.execute(stmt)
    sub = res.scalars().first()

    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription record not found for tenant")

    now = datetime.now(timezone.utc)
    old_status = sub.status
    sub.status = "active"
    # Extend subscription by 1 year from now or current end
    base_end = sub.ends_at if sub.ends_at and sub.ends_at > now else now
    sub.ends_at = base_end + timedelta(days=365)

    audit = SubscriptionAuditLog(
        tenant_id=payload.tenant_id,
        action="PAYMENT_RECEIVED_RENEWED",
        performed_by=None,
        details={
            "subscription_id": str(sub.id),
            "actor_name": "Payment Gateway Webhook",
            "old_status": old_status,
            "new_status": "active",
            "ends_at": sub.ends_at.isoformat(),
            "amount_paid": payload.amount,
            "transaction_id": payload.transaction_id
        }
    )
    db.add(audit)
    await db.commit()

    return {
        "status": "SUCCESS",
        "event": payload.event,
        "tenant_id": str(payload.tenant_id),
        "subscription_status": sub.status,
        "valid_until": sub.ends_at.isoformat(),
        "transaction_id": payload.transaction_id
    }


# ==============================================================================
# 5. INSTITUTION-DEFINED FEE HEADS CATALOG
# ==============================================================================

def _resolve_tenant_id(user: User) -> Optional[uuid.UUID]:
    tid = get_current_tenant_id()
    if tid:
        return tid
    if getattr(user, "roles", None):
        for r in user.roles:
            if getattr(r, "tenant_id", None):
                return r.tenant_id
            if getattr(r, "role", None) and getattr(r.role, "tenant_id", None):
                return r.role.tenant_id
    return None


@router.get("/heads", response_model=List[FeeHeadOut])
async def list_fee_heads(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    List institution-defined fee heads catalog (Tuition, Lab, Transport, Hostel, etc.).
    """
    tenant_id = _resolve_tenant_id(current_user)
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institutional tenant scope required.")

    query = select(FeeHeadMaster).where(FeeHeadMaster.tenant_id == tenant_id)
    if category:
        query = query.where(FeeHeadMaster.category == category)
    if is_active is not None:
        query = query.where(FeeHeadMaster.is_active == is_active)
    query = query.order_by(FeeHeadMaster.category, FeeHeadMaster.head_code)

    result = await db.execute(query)
    heads = result.scalars().all()

    # If no heads exist yet for this tenant, bootstrap standard institution defaults
    if not heads and not category and is_active is None:
        defaults = [
            ("TUITION", "Tuition & Academic Classroom Instruction", "ACADEMIC", "PER_TERM", True, True, 30000.0, 0.0, "Core syllabus and teaching fees"),
            ("LABORATORY", "Science & Computer Practical Laboratory", "FACILITY", "PER_TERM", True, True, 8000.0, 0.0, "Physics, Chemistry, Biology & IT lab access"),
            ("LIBRARY_DEV", "Digital Library, Sports & Campus Amenities", "FACILITY", "ANNUAL", True, False, 5000.0, 0.0, "Physical and digital learning resources"),
            ("TRANSPORT", "Campus Bus Transport Fleet Service", "TRANSPORT", "PER_TERM", False, True, 12000.0, 0.0, "Optional door-to-school transport service"),
            ("HOSTEL", "Hostel Accommodation & Dining Mess Fee", "HOSTEL", "PER_TERM", False, True, 25000.0, 0.0, "Boarding and dining charges"),
            ("EXAMINATION", "Term Assessments, CBT & Report Printing", "ACADEMIC", "PER_TERM", True, True, 3000.0, 0.0, "Evaluation and report card charges"),
            ("ADMISSION", "One-Time Institutional Enrolment Fee", "ACADEMIC", "ONE_TIME", True, False, 5000.0, 0.0, "Administrative registration charge"),
        ]
        created_heads = []
        for code, title, cat, ctype, comp, recur, amt, tax, desc in defaults:
            h = FeeHeadMaster(
                tenant_id=tenant_id,
                head_code=code,
                title=title,
                category=cat,
                charge_type=ctype,
                is_compulsory=comp,
                is_recurring=recur,
                default_amount=amt,
                tax_rate=tax,
                description=desc,
                is_active=True,
            )
            db.add(h)
            created_heads.append(h)
        await db.commit()
        return created_heads

    return heads


@router.post("/heads", response_model=FeeHeadOut, status_code=status.HTTP_201_CREATED)
async def create_fee_head(
    payload: FeeHeadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.configure")),
):
    """
    Create a new institution-defined fee head.
    """
    tenant_id = _resolve_tenant_id(current_user)
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institutional tenant scope required.")

    code_clean = payload.head_code.strip().upper()
    existing = await db.execute(
        select(FeeHeadMaster).where(
            FeeHeadMaster.tenant_id == tenant_id,
            FeeHeadMaster.head_code == code_clean,
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Fee head with code '{code_clean}' already exists.")

    head = FeeHeadMaster(
        tenant_id=tenant_id,
        head_code=code_clean,
        title=payload.title.strip(),
        category=payload.category,
        charge_type=payload.charge_type,
        is_compulsory=payload.is_compulsory,
        is_recurring=payload.is_recurring,
        default_amount=payload.default_amount,
        tax_rate=payload.tax_rate,
        description=payload.description,
        is_active=True,
    )
    db.add(head)
    await db.commit()
    await db.refresh(head)
    return head


# ==============================================================================
# 6. MANAGEMENT-NEGOTIATED STUDENT FEE FIXATION & CONCESSIONS ENGINE
# ==============================================================================

@router.post("/fixations/calculate", response_model=StudentFeeFixationCalculateResponse)
async def calculate_fee_fixation(
    payload: StudentFeeFixationCalculateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    Real-time calculation engine for Management Negotiated Fee Fixations.
    Supports:
    Method A: Overall negotiated total (e.g. ₹50,000 standard -> ₹36,000 agreed)
              allocated across heads with priority on Tuition.
    Method B: Individual head-wise custom adjustments.
    Includes additional charges (transport, hostel, amenities) and term installment breakdown.
    """
    standard_fee = float(payload.standard_annual_fee)
    if standard_fee <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Standard annual fee must be greater than zero.")

    # Determine total concession
    if payload.negotiated_annual_fee is not None:
        negotiated_fee = float(payload.negotiated_annual_fee)
        concession_total = max(0.0, round(standard_fee - negotiated_fee, 2))
    elif payload.total_concession_amount is not None:
        concession_total = min(standard_fee, max(0.0, float(payload.total_concession_amount)))
    else:
        concession_total = 0.0

    # Default head breakdown baseline (60% Tuition, 15% Lab, 10% Library/Dev, 15% Activities)
    default_heads = [
        {"head_code": "TUITION", "title": "Tuition & Academic Classroom Instruction", "pct": 0.60},
        {"head_code": "LABORATORY", "title": "Science & Computer Practical Laboratory", "pct": 0.15},
        {"head_code": "LIBRARY_DEV", "title": "Digital Library, Sports & Campus Amenities", "pct": 0.10},
        {"head_code": "EXAMINATION", "title": "Assessments & Comprehensive Examination", "pct": 0.15},
    ]

    head_allocations: List[Dict[str, Any]] = []

    if payload.concession_method == "HEAD_WISE_ADJUSTMENTS" and payload.head_adjustments:
        # Method B: Direct adjustments per head
        total_custom_concession = 0.0
        for adj in payload.head_adjustments:
            h_code = adj.get("head_code", "")
            h_title = adj.get("title", h_code)
            h_std = float(adj.get("standard_amount", 0.0))
            h_conc = float(adj.get("concession_amount", 0.0))
            h_final = max(0.0, round(h_std - h_conc, 2))
            total_custom_concession += h_conc
            head_allocations.append({
                "head_code": h_code,
                "title": h_title,
                "standard_amount": h_std,
                "concession_amount": h_conc,
                "final_payable": h_final,
            })
        concession_total = total_custom_concession
    else:
        # Method A: Overall concession allocated across heads
        # Step 1: Assign standard amounts
        allocated_so_far = 0.0
        for idx, dh in enumerate(default_heads):
            if idx == len(default_heads) - 1:
                h_amt = round(standard_fee - allocated_so_far, 2)
            else:
                h_amt = round(standard_fee * dh["pct"], 2)
                allocated_so_far += h_amt
            head_allocations.append({
                "head_code": dh["head_code"],
                "title": dh["title"],
                "standard_amount": h_amt,
                "concession_amount": 0.0,
                "final_payable": h_amt,
            })

        # Step 2: Apply concession with priority on TUITION first, then others
        remaining_discount = concession_total
        for h in head_allocations:
            if remaining_discount <= 0:
                break
            # Can discount up to 90% of this head
            max_head_discount = round(h["standard_amount"] * 0.90, 2)
            discount_to_apply = min(remaining_discount, max_head_discount)
            h["concession_amount"] = discount_to_apply
            h["final_payable"] = round(h["standard_amount"] - discount_to_apply, 2)
            remaining_discount = round(remaining_discount - discount_to_apply, 2)

        # If any remaining discount, apply to any head with remaining balance
        if remaining_discount > 0:
            for h in head_allocations:
                if remaining_discount <= 0:
                    break
                extra = min(remaining_discount, h["final_payable"])
                h["concession_amount"] = round(h["concession_amount"] + extra, 2)
                h["final_payable"] = round(h["final_payable"] - extra, 2)
                remaining_discount = round(remaining_discount - extra, 2)

    # Process additional charges (e.g. transport, hostel)
    additional_charges_list: List[Dict[str, Any]] = []
    additional_charges_total = 0.0
    if payload.additional_charges:
        for ch in payload.additional_charges:
            amt = float(ch.get("amount", 0.0))
            if amt > 0:
                additional_charges_total += amt
                additional_charges_list.append({
                    "charge_code": ch.get("charge_code", "MISC"),
                    "title": ch.get("title", "Additional Charge"),
                    "category": ch.get("category", "FACILITY"),
                    "amount": amt,
                })

    final_net_payable = round((standard_fee - concession_total) + additional_charges_total, 2)

    # Compute term installments
    terms_def = payload.terms_config or [
        {"term_code": "TERM_1", "name": "Term 1 (June-Aug)", "due_date": "2026-06-30", "share_pct": 40.0},
        {"term_code": "TERM_2", "name": "Term 2 (Sep-Nov)", "due_date": "2026-09-30", "share_pct": 35.0},
        {"term_code": "TERM_3", "name": "Term 3 (Dec-Feb)", "due_date": "2026-12-15", "share_pct": 25.0},
    ]

    term_installments: List[Dict[str, Any]] = []
    running_term_total = 0.0
    for idx, t in enumerate(terms_def):
        pct = float(t.get("share_pct", 33.33))
        if idx == len(terms_def) - 1:
            term_amt = round(final_net_payable - running_term_total, 2)
        else:
            term_amt = round(final_net_payable * (pct / 100.0), 2)
            running_term_total += term_amt

        term_installments.append({
            "term_code": t.get("term_code", f"TERM_{idx+1}"),
            "name": t.get("name", f"Term {idx+1}"),
            "due_date": t.get("due_date", "2026-06-30"),
            "share_pct": pct,
            "amount": term_amt,
        })

    return StudentFeeFixationCalculateResponse(
        standard_annual_fee=standard_fee,
        total_concession_amount=concession_total,
        additional_charges_total=additional_charges_total,
        final_annual_payable=final_net_payable,
        concession_category=payload.concession_category,
        concession_method=payload.concession_method,
        head_allocations=head_allocations,
        additional_charges=additional_charges_list,
        term_installments=term_installments,
    )


@router.get("/fixations", response_model=List[StudentFeeFixationOut])
async def list_student_fee_fixations(
    academic_year: Optional[str] = None,
    class_name: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    List all agreed student fee fixations and concessions.
    """
    tenant_id = _resolve_tenant_id(current_user)
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institutional tenant scope required.")

    query = select(StudentFeeFixation).where(StudentFeeFixation.tenant_id == tenant_id)
    if academic_year:
        query = query.where(StudentFeeFixation.academic_year == academic_year)
    if class_name:
        query = query.where(StudentFeeFixation.class_or_stream == class_name)
    if status_filter:
        query = query.where(StudentFeeFixation.status == status_filter)

    query = query.order_by(StudentFeeFixation.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/fixations", response_model=StudentFeeFixationOut, status_code=status.HTTP_201_CREATED)
async def create_student_fee_fixation(
    payload: StudentFeeFixationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.collect")),
):
    """
    Record an authoritative agreed fee fixation for a student or prospective applicant.
    Stores original fee, approved concession, category, reason remarks, and installments.
    If student exists and status is APPROVED, automatically provisions invoices.
    """
    tenant_id = _resolve_tenant_id(current_user)
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Institutional tenant scope required.")

    status_val = "APPROVED" if payload.auto_approve else "PENDING_APPROVAL"
    approved_by = current_user.full_name if status_val == "APPROVED" else None
    approved_at = datetime.now(timezone.utc) if status_val == "APPROVED" else None

    # Check for existing fixation for this student and academic year
    if payload.student_id:
        existing_stmt = select(StudentFeeFixation).where(
            StudentFeeFixation.tenant_id == tenant_id,
            StudentFeeFixation.student_id == payload.student_id,
            StudentFeeFixation.academic_year == payload.academic_year,
            StudentFeeFixation.status == "APPROVED",
        )
        existing_res = await db.execute(existing_stmt)
        old_fix = existing_res.scalars().first()
        if old_fix:
            old_fix.status = "SUPERSEDED"

    fixation = StudentFeeFixation(
        tenant_id=tenant_id,
        student_id=payload.student_id,
        admission_id=payload.admission_id,
        student_name=payload.student_name.strip(),
        admission_number=payload.admission_number,
        academic_year=payload.academic_year,
        class_or_stream=payload.class_or_stream,
        standard_annual_fee=payload.standard_annual_fee,
        total_concession_amount=payload.total_concession_amount,
        concession_category=payload.concession_category,
        concession_method=payload.concession_method,
        final_annual_payable=payload.final_annual_payable,
        head_allocations=payload.head_allocations,
        additional_charges=payload.additional_charges,
        term_installments=payload.term_installments,
        reason_remarks=payload.reason_remarks,
        status=status_val,
        created_by_name=current_user.full_name,
        created_by_id=current_user.id,
        approved_by_name=approved_by,
        approved_by_id=current_user.id if approved_by else None,
        approved_at=approved_at,
        version=1,
        audit_history=[{
            "action": "CREATED",
            "actor": current_user.full_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": payload.reason_remarks or "Initial fee fixation recorded.",
            "status": status_val,
            "final_payable": payload.final_annual_payable,
        }],
    )
    db.add(fixation)
    await db.flush()

    # If linked to an active student, generate/update fee invoices
    if payload.student_id and status_val == "APPROVED":
        student = await db.get(Student, payload.student_id)
        if student and student.tenant_id == tenant_id:
            await _generate_invoices_for_fixation(db, fixation, student, tenant_id)

    await db.commit()
    await db.refresh(fixation)
    return fixation


@router.post("/fixations/{fixation_id}/approve", response_model=StudentFeeFixationOut)
async def approve_student_fee_fixation(
    fixation_id: uuid.UUID,
    payload: StudentFeeFixationApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.configure")),
):
    """
    Authorize and approve a negotiated student fee fixation.
    Creates or synchronizes authoritative fee invoices for each installment.
    """
    tenant_id = _resolve_tenant_id(current_user)
    fixation = await db.get(StudentFeeFixation, fixation_id)
    if not fixation or fixation.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee fixation record not found.")

    fixation.status = "APPROVED"
    fixation.approved_by_name = current_user.full_name
    fixation.approved_by_id = current_user.id
    fixation.approved_at = datetime.now(timezone.utc)
    new_audit = list(fixation.audit_history or [])
    new_audit.append({
        "action": "APPROVED",
        "actor": current_user.full_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": payload.approval_notes or "Management negotiation authorized.",
    })
    fixation.audit_history = new_audit

    if fixation.student_id:
        student = await db.get(Student, fixation.student_id)
        if student and student.tenant_id == tenant_id:
            await _generate_invoices_for_fixation(db, fixation, student, tenant_id)

    await db.commit()
    await db.refresh(fixation)
    return fixation


@router.get("/students/{student_id}/statement", response_model=StudentLedgerStatementOut)
async def get_student_ledger_statement(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.view")),
):
    """
    Authoritative student ledger statement.
    Combines approved fee fixation, invoices, payments, and receipts into a reconciled ledger.
    """
    tenant_id = _resolve_tenant_id(current_user)
    student = await db.get(Student, student_id)
    if not student or student.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    # 1. Fetch active fixation
    fix_stmt = select(StudentFeeFixation).where(
        StudentFeeFixation.tenant_id == tenant_id,
        StudentFeeFixation.student_id == student_id,
        StudentFeeFixation.status == "APPROVED",
    ).order_by(StudentFeeFixation.created_at.desc())
    fix_res = await db.execute(fix_stmt)
    fixation = fix_res.scalars().first()

    # 2. Fetch invoices
    inv_stmt = select(FeeInvoice).where(
        FeeInvoice.tenant_id == tenant_id,
        FeeInvoice.student_id == student_id,
    ).order_by(FeeInvoice.due_date.asc())
    inv_res = await db.execute(inv_stmt)
    invoices = inv_res.scalars().all()

    # 3. Fetch receipts
    rcpt_stmt = select(FeeReceipt).where(
        FeeReceipt.tenant_id == tenant_id,
        FeeReceipt.student_id == student_id,
    ).order_by(FeeReceipt.payment_date.desc())
    rcpt_res = await db.execute(rcpt_stmt)
    receipts = rcpt_res.scalars().all()

    # Totals
    total_std = fixation.standard_annual_fee if fixation else sum(inv.total_amount for inv in invoices)
    total_concessions = fixation.total_concession_amount if fixation else sum(inv.concession_amount for inv in invoices)
    net_payable = fixation.final_annual_payable if fixation else sum(inv.net_payable for inv in invoices)
    total_paid = sum(inv.paid_amount for inv in invoices)
    balance_due = max(0.0, net_payable - total_paid)

    inv_list = []
    for inv in invoices:
        inv_list.append({
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "term_code": inv.term_code,
            "term_name": inv.term_name,
            "total_amount": inv.total_amount,
            "concession_amount": inv.concession_amount,
            "net_payable": inv.net_payable,
            "paid_amount": inv.paid_amount,
            "balance_amount": inv.balance_amount,
            "due_date": inv.due_date.isoformat(),
            "status": inv.status,
            "breakdown": inv.breakdown,
        })

    return StudentLedgerStatementOut(
        student_id=student.id,
        student_name=student.full_name,
        admission_number=student.admission_number,
        class_name=student.class_name,
        academic_year=student.academic_year,
        has_custom_fixation=fixation is not None,
        fixation=fixation,
        standard_fee=total_std,
        total_concessions=total_concessions,
        net_payable=net_payable,
        total_paid=total_paid,
        balance_due=balance_due,
        invoices=inv_list,
        payments=[],
        receipts=receipts,
    )


async def _generate_invoices_for_fixation(
    db: AsyncSession,
    fixation: StudentFeeFixation,
    student: Student,
    tenant_id: uuid.UUID,
):
    """
    Helper to provision or synchronize FeeInvoice records for a student based on an approved fixation.
    Guarantees idempotency and prevents duplicate invoice generation.
    """
    existing_stmt = select(FeeInvoice).where(
        FeeInvoice.tenant_id == tenant_id,
        FeeInvoice.student_id == student.id,
        FeeInvoice.academic_year == fixation.academic_year,
    )
    existing_res = await db.execute(existing_stmt)
    existing_invoices = existing_res.scalars().all()

    if existing_invoices:
        # Update existing unpaid invoices to match negotiated installments
        for inv in existing_invoices:
            if inv.paid_amount == 0:
                matching_term = next(
                    (t for t in fixation.term_installments if t.get("term_code") == inv.term_code), None
                )
                if matching_term:
                    inv.net_payable = float(matching_term["amount"])
                    inv.balance_amount = float(matching_term["amount"])
                    inv.breakdown = fixation.head_allocations
        return

    # Count invoices to generate consecutive invoice numbers
    count_stmt = select(func.count(FeeInvoice.id)).where(FeeInvoice.tenant_id == tenant_id)
    inv_count = (await db.execute(count_stmt)).scalar_one() or 0

    for idx, term in enumerate(fixation.term_installments):
        inv_no = f"INV-{datetime.now().year}-{inv_count + idx + 1:05d}"
        share_pct = float(term.get("share_pct", 33.33))
        term_net = float(term.get("amount", round(fixation.final_annual_payable * (share_pct / 100.0), 2)))
        term_std = round(fixation.standard_annual_fee * (share_pct / 100.0), 2)
        term_conc = max(0.0, round(term_std - term_net, 2))

        due_date_str = str(term.get("due_date", "2026-06-30"))
        try:
            parsed_due = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        except Exception:
            parsed_due = date.today() + timedelta(days=30 * (idx + 1))

        invoice = FeeInvoice(
            tenant_id=tenant_id,
            invoice_number=inv_no,
            student_id=student.id,
            student_name=student.full_name,
            admission_number=student.admission_number,
            class_name=student.class_name,
            section_or_stream=student.section_or_stream,
            academic_year=fixation.academic_year,
            term_code=term.get("term_code", f"TERM_{idx+1}"),
            term_name=term.get("name", f"Term {idx+1}"),
            fee_head="ACADEMIC_FEE",
            fee_title=f"{term.get('name', f'Term {idx+1}')} - Negotiated Tuition & Facilities",
            total_amount=term_std,
            concession_amount=term_conc,
            net_payable=term_net,
            paid_amount=0.0,
            balance_amount=term_net,
            due_date=parsed_due,
            status="UNPAID",
            breakdown=fixation.head_allocations,
        )
        db.add(invoice)



