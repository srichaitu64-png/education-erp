import uuid
import pytest
from datetime import date, datetime, timezone
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, Role, Permission, UserRole
from app.modules.finance.models import FeeStructure, FeeInvoice, FeePayment, FeeReceipt, ReceiptAuditLog


@pytest.mark.asyncio
async def test_two_institutions_flexible_fee_structures(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Acceptance Test 1:
    Test two institutions with different term structures and different fee amounts.
    - Institution 1: School with 3 terms and school-specific fee heads.
    - Institution 2: PU College with 2 semesters and college-specific fee heads.
    Verify both configure their fee schedules independently without hardcoded amounts.
    """
    # 1. Fetch pilot tenant & Superadmin
    stmt_tenant = select(Tenant).where(Tenant.code == "akshara")
    pilot_tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert pilot_tenant is not None

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(pilot_tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Institution 1: School (3 terms)
    school_payload = {
        "academic_year": "2026-2027",
        "institution_type": "School",
        "class_or_stream": "Class 8",
        "term_count": 3,
        "terms_config": [
            {"term_code": "TERM_1", "name": "Term 1 (June-Aug)", "due_date": "2026-06-30", "share_pct": 40},
            {"term_code": "TERM_2", "name": "Term 2 (Sept-Nov)", "due_date": "2026-11-15", "share_pct": 35},
            {"term_code": "TERM_3", "name": "Term 3 (Dec-Feb)", "due_date": "2027-01-31", "share_pct": 25},
        ],
        "fee_heads": [
            {"head_code": "TUITION", "title": "School Tuition Fee", "amount": 28000.0},
            {"head_code": "LAB", "title": "Science Activity Lab", "amount": 4000.0},
            {"head_code": "TRANSPORT", "title": "School Van Fee", "amount": 10000.0},
        ],
        "concessions_allowed": True,
        "notes": "Middle school standard fee structure"
    }

    resp1 = await client.post("/api/v1/finance/structures", json=school_payload, headers=headers)
    assert resp1.status_code == 201, resp1.text
    school_data = resp1.json()
    assert school_data["term_count"] == 3
    assert school_data["total_annual_fee"] == 42000.0

    # Institution 2: PU College (2 semesters)
    pu_payload = {
        "academic_year": "2026-2027",
        "institution_type": "PU College",
        "class_or_stream": "II PUC - PCMC",
        "term_count": 2,
        "terms_config": [
            {"term_code": "SEM_1", "name": "Semester 1", "due_date": "2026-08-31", "share_pct": 50},
            {"term_code": "SEM_2", "name": "Semester 2", "due_date": "2026-12-31", "share_pct": 50},
        ],
        "fee_heads": [
            {"head_code": "TUITION", "title": "PUC Integrated Science Coaching", "amount": 55000.0},
            {"head_code": "LAB", "title": "Computer Science & Electronics Practicals", "amount": 16000.0},
            {"head_code": "HOSTEL_MESS", "title": "Campus Hostel & Mess", "amount": 42000.0},
            {"head_code": "EXAM", "title": "Pre-University Board Exam Fee", "amount": 4000.0},
        ],
        "concessions_allowed": True,
        "notes": "PU College senior year PCMC fee structure"
    }

    resp2 = await client.post("/api/v1/finance/structures", json=pu_payload, headers=headers)
    assert resp2.status_code == 201, resp2.text
    pu_data = resp2.json()
    assert pu_data["term_count"] == 2
    assert pu_data["total_annual_fee"] == 117000.0


@pytest.mark.asyncio
async def test_fee_collection_and_automatic_receipt_generation(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Acceptance Test 2:
    Collect a fee, confirm payment, automatically generate a permanent receipt with
    institution branding, fee-head allocations, and QR verification hash.
    Verify idempotency prevents duplicate receipts on retry.
    """
    stmt_tenant = select(Tenant).where(Tenant.code == "akshara")
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch seeded invoice inv2 (Ananya Hegde, balance 12500)
    stmt_inv = select(FeeInvoice).where(FeeInvoice.invoice_number == "INV-2026-0092")
    inv = (await db_session.execute(stmt_inv)).scalars().first()
    assert inv is not None
    initial_bal = inv.balance_amount

    # Collect partial payment of 5000
    idemp_key = f"IDEMP-{uuid.uuid4().hex[:12]}"
    payment_payload = {
        "invoice_id": str(inv.id),
        "amount": 5000.0,
        "payment_method": "UPI",
        "transaction_reference": "UPI/2026/TEST/998811",
        "idempotency_key": idemp_key,
        "fee_allocations": [
            {"head": "LAB", "allocated": 5000.0, "remaining": 7500.0}
        ],
        "notes": "UPI instalment via counter scanner"
    }

    resp = await client.post("/api/v1/finance/collect", json=payment_payload, headers=headers)
    assert resp.status_code == 201, resp.text
    receipt = resp.json()

    assert receipt["receipt_number"].startswith("RCP-AKSH-")
    assert receipt["amount_paid"] == 5000.0
    assert receipt["previous_balance"] == initial_bal
    assert receipt["current_balance"] == initial_bal - 5000.0
    assert receipt["is_duplicate"] is False
    assert receipt["reprint_count"] == 0
    assert "qr_verification_code" in receipt
    assert receipt["institution_branding"]["institution_name"] == "Akshara Global Educational Institutions"

    # Verify Idempotency: submitting the exact same idempotency_key returns the same receipt without double charging
    retry_resp = await client.post("/api/v1/finance/collect", json=payment_payload, headers=headers)
    assert retry_resp.status_code == 201 or retry_resp.status_code == 200
    retry_receipt = retry_resp.json()
    assert retry_receipt["id"] == receipt["id"]
    assert retry_receipt["receipt_number"] == receipt["receipt_number"]


@pytest.mark.asyncio
async def test_reopen_and_reprint_historical_receipt(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Acceptance Test 3:
    Reopen payment history and reprint the same receipt.
    Verify:
    - Receipt is marked as DUPLICATE.
    - reprint_count increments.
    - reprint audit log entry is recorded.
    """
    stmt_tenant = select(Tenant).where(Tenant.code == "akshara")
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch seeded receipt
    stmt_rcp = select(FeeReceipt).where(FeeReceipt.receipt_number == "RCP-AKSH-2026-1001")
    rcp = (await db_session.execute(stmt_rcp)).scalars().first()
    assert rcp is not None

    # Call reprint endpoint
    resp = await client.post(f"/api/v1/finance/receipts/{rcp.id}/reprint", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["is_duplicate"] is True
    assert data["reprint_count"] == 1
    assert data["receipt"]["is_duplicate"] is True

    # Check audit log in DB
    stmt_audit = select(ReceiptAuditLog).where(
        ReceiptAuditLog.receipt_id == rcp.id,
        ReceiptAuditLog.action == "REPRINTED_DUPLICATE"
    )
    audit = (await db_session.execute(stmt_audit)).scalars().first()
    assert audit is not None


@pytest.mark.asyncio
async def test_consolidated_and_due_reports(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Acceptance Test 4:
    Consolidated collection report and due reports calculation.
    """
    stmt_tenant = select(Tenant).where(Tenant.code == "akshara")
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Consolidated Report
    c_resp = await client.get("/api/v1/finance/reports/consolidated?academic_year=2026-2027", headers=headers)
    assert c_resp.status_code == 200, c_resp.text
    c_data = c_resp.json()
    assert c_data["total_expected_fee"] > 0
    assert c_data["total_collected"] > 0
    assert c_data["collection_percentage"] > 0
    assert len(c_data["category_breakdown"]) > 0

    # Due Report
    d_resp = await client.get("/api/v1/finance/reports/due?academic_year=2026-2027", headers=headers)
    assert d_resp.status_code == 200, d_resp.text
    due_items = d_resp.json()
    assert len(due_items) > 0
    # inv3 was due 2026-10-31, so it must have overdue_days > 0 and status OVERDUE
    overdue_found = any(item["status"] == "OVERDUE" and item["overdue_days"] > 0 for item in due_items)
    assert overdue_found is True


@pytest.mark.asyncio
async def test_unauthorized_user_cannot_configure_fee_structures(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Acceptance Test 5:
    Unauthorised users (e.g. standard teacher without fees.configure) cannot modify fee structures.
    Must return 403 Forbidden.
    """
    stmt_tenant = select(Tenant).where(Tenant.code == "akshara")
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()

    # Create a plain teacher user with only teaching role
    teacher = User(
        email=f"teacher_{uuid.uuid4().hex[:6]}@akshara.erp.in",
        hashed_password="hash",
        full_name="Teacher Swamy",
        is_active=True,
        is_superadmin=False
    )
    db_session.add(teacher)
    await db_session.flush()

    token = create_access_token(
        subject=str(teacher.id), tenant_id=str(tenant.id), is_superadmin=False
    )
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "academic_year": "2026-2027",
        "institution_type": "School",
        "class_or_stream": "Class 1",
        "term_count": 3,
        "fee_heads": [{"head_code": "TUITION", "title": "Tuition", "amount": 10000.0}]
    }

    resp = await client.post("/api/v1/finance/structures", json=payload, headers=headers)
    assert resp.status_code == 403, f"Expected 403 Forbidden, got {resp.status_code}: {resp.text}"
