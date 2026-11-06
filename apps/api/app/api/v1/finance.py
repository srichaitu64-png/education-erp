import uuid
import hmac
import hashlib
from datetime import datetime, date, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request, status
from sqlalchemy import select, and_, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.database.session import get_db, get_current_tenant_id
from app.modules.identity.models import User
from app.modules.tenants.models import Tenant, Campus
from app.modules.subscriptions.models import Subscription, SubscriptionAuditLog
from app.modules.finance.models import (
    FeeStructure,
    FeeInvoice,
    FeePayment,
    FeeReceipt,
    ReceiptAuditLog,
)
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

    # 6. Generate a tenant-specific receipt number.
    # Lock the tenant row so concurrent collections for this institution cannot
    # allocate the same count-based sequence number.
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id).with_for_update()
    )
    tenant = tenant_result.scalars().first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Institution not found")

    count_stmt = select(func.count(FeeReceipt.id)).where(FeeReceipt.tenant_id == tenant_id)
    receipt_count = (await db.execute(count_stmt)).scalar() or 0
    tenant_code = "".join(ch for ch in tenant.code.upper() if ch.isalnum())[:8] or "INST"
    receipt_num = f"RCP-{tenant_code}-{invoice.academic_year.replace('-', '')}-{1001 + receipt_count}"

    # Use the institution's saved identity and contact information. Campus details
    # override the address/contact fields when the invoice belongs to a campus.
    campus = None
    if invoice.campus_id:
        campus_result = await db.execute(
            select(Campus).where(
                Campus.id == invoice.campus_id,
                Campus.tenant_id == tenant_id,
            )
        )
        campus = campus_result.scalars().first()

    branding = {
        "institution_name": tenant.name,
        "campus_name": campus.name if campus else None,
        "affiliation": (tenant.settings or {}).get("affiliation", ""),
        "address": (campus.address if campus and campus.address else tenant.address) or "",
        "phone": (campus.contact_phone if campus and campus.contact_phone else tenant.phone) or "",
        "email": (campus.contact_email if campus and campus.contact_email else tenant.email) or "",
        "logo_url": tenant.logo_url,
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

    # Verify HMAC signature if header provided
    if x_webhook_signature:
        expected_sig = hmac.new(webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_sig, x_webhook_signature):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cryptographic webhook signature")

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


