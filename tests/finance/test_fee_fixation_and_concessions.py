import uuid
import pytest
from datetime import date, datetime, timezone, timedelta
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.modules.tenants.models import Tenant, Campus
from app.modules.identity.models import User, PlatformSupportAccessSession
from app.modules.finance.models import FeeHeadMaster, StudentFeeFixation, FeeInvoice, FeeStructure
from app.modules.academic.models import AdmissionApplication, AcademicSection, Student


async def create_approved_support_session(db_session: AsyncSession, admin_id: uuid.UUID, tenant_id: uuid.UUID) -> None:
    db_session.add(PlatformSupportAccessSession(
        ticket_number=f"TEST-FIXATION-{uuid.uuid4().hex[:12]}",
        tenant_id=tenant_id,
        requested_by_platform_user_id=admin_id,
        reason="Automated fee fixation and management concession tests",
        scope="FULL_ACCESS",
        status="APPROVED",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))
    await db_session.commit()


@pytest.mark.asyncio
async def test_fee_heads_bootstrap_and_listing(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Phase 2: Fee Configuration Test
    Verifies that institution-defined fee heads master can be listed and bootstrapped.
    """
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None
    await create_approved_support_session(db_session, super_admin.id, tenant.id)

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get("/api/v1/finance/heads", headers=headers)
    assert resp.status_code == 200
    heads = resp.json()
    assert isinstance(heads, list)
    assert len(heads) >= 6

    head_codes = [h["head_code"] for h in heads]
    assert "TUITION" in head_codes
    assert "LABORATORY" in head_codes
    assert "LIBRARY_DEV" in head_codes


@pytest.mark.asyncio
async def test_fee_fixation_calculation_method_a_class_6(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Phase 3: Management-negotiated student fee fixation
    Mandatory business requirement test:
    - Standard Class 6 fee: ₹50,000
    - Negotiated concession: ₹14,000 (Category: Management Negotiation)
    - Final payable: ₹36,000
    - Method A: Overall negotiated fee with priority allocation across heads.
    - Verified 3-term installment schedule:
      Term 1 (40%): ₹14,400
      Term 2 (35%): ₹12,600
      Term 3 (25%): ₹9,000
      Total: ₹36,000
    """
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None
    await create_approved_support_session(db_session, super_admin.id, tenant.id)

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    calc_payload = {
        "academic_year": "2026-2027",
        "class_or_stream": "Class 6",
        "concession_method": "OVERALL_ALLOCATION",
        "concession_category": "Management Negotiation",
        "standard_annual_fee": 50000.0,
        "total_concession_amount": 14000.0,
        "additional_charges": []
    }

    resp = await client.post("/api/v1/finance/fixations/calculate", json=calc_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["standard_annual_fee"] == 50000.0
    assert data["total_concession_amount"] == 14000.0
    assert data["final_annual_payable"] == 36000.0

    # Verify installment distribution (40%, 35%, 25%)
    installments = data["term_installments"]
    assert len(installments) == 3
    assert installments[0]["amount"] == 14400.0
    assert installments[1]["amount"] == 12600.0
    assert installments[2]["amount"] == 9000.0
    assert sum(inst["amount"] for inst in installments) == 36000.0


@pytest.mark.asyncio
async def test_fee_fixation_calculation_with_transport_and_hostel(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Phase 3: Additional student-specific optional services
    Tests adding transport (₹12,000) and hostel (₹30,000) to base fixation.
    """
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None
    await create_approved_support_session(db_session, super_admin.id, tenant.id)

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    calc_payload = {
        "academic_year": "2026-2027",
        "class_or_stream": "Class 6",
        "concession_method": "OVERALL_ALLOCATION",
        "concession_category": "Management Negotiation",
        "standard_annual_fee": 50000.0,
        "total_concession_amount": 14000.0,
        "additional_charges": [
            {"charge_code": "TRANSPORT", "title": "Route 4 School Bus", "amount": 12000.0},
            {"charge_code": "HOSTEL", "title": "Junior Wing Residency", "amount": 30000.0}
        ]
    }

    resp = await client.post("/api/v1/finance/fixations/calculate", json=calc_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    # Base ₹36,000 + Transport ₹12,000 + Hostel ₹30,000 = ₹78,000
    assert data["final_annual_payable"] == 78000.0
    assert sum(inst["amount"] for inst in data["term_installments"]) == 78000.0


@pytest.mark.asyncio
async def test_create_and_approve_student_fee_fixation(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Phase 4: Admission & Financial Integrity
    Creates an explicit StudentFeeFixation, checks audit history, and approves it.
    Verifies that approving automatically provisions FeeInvoice records without duplicates.
    """
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None
    await create_approved_support_session(db_session, super_admin.id, tenant.id)

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Create a fresh enrolled student in this tenant without previous invoices
    unique_suffix = uuid.uuid4().hex[:4]
    new_student = Student(
        tenant_id=tenant.id,
        first_name="Kiran",
        last_name=f"Kumar_{unique_suffix}",
        admission_number=f"ADM-2026-{unique_suffix}",
        class_name="Class 6",
        status="ACTIVE"
    )
    db_session.add(new_student)
    await db_session.commit()
    await db_session.refresh(new_student)

    unique_student_name = f"{new_student.first_name} {new_student.last_name}"
    create_payload = {
        "student_id": str(new_student.id),
        "student_name": unique_student_name,
        "academic_year": "2026-2027",
        "class_or_stream": "Class 6",
        "concession_method": "OVERALL_ALLOCATION",
        "concession_category": "Management Negotiation",
        "standard_annual_fee": 50000.0,
        "total_concession_amount": 14000.0,
        "final_annual_payable": 36000.0,
        "reason_remarks": "Management approved sibling discount for 2026 academic batch",
        "additional_charges": [],
        "term_installments": [
            {"term_code": "TERM_1", "term_name": "Term 1 (June-Aug)", "due_date": "2026-06-30", "share_pct": 40.0, "amount": 14400.0},
            {"term_code": "TERM_2", "term_name": "Term 2 (Sept-Nov)", "due_date": "2026-11-15", "share_pct": 35.0, "amount": 12600.0},
            {"term_code": "TERM_3", "term_name": "Term 3 (Dec-Feb)", "due_date": "2027-01-31", "share_pct": 25.0, "amount": 9000.0}
        ],
        "auto_approve": False
    }

    resp = await client.post("/api/v1/finance/fixations", json=create_payload, headers=headers)
    assert resp.status_code == 201
    fixation = resp.json()
    assert fixation["status"] == "PENDING_APPROVAL"
    assert fixation["final_annual_payable"] == 36000.0
    fixation_id = fixation["id"]

    # Approve the fixation
    approve_resp = await client.post(
        f"/api/v1/finance/fixations/{fixation_id}/approve",
        json={"approver_notes": "Approved by Chairman Dr. S.K. Narayana"},
        headers=headers
    )
    assert approve_resp.status_code == 200
    approved_data = approve_resp.json()
    assert approved_data["status"] == "APPROVED"
    assert approved_data["approved_at"] is not None
    assert len(approved_data["audit_history"]) >= 2

    # Verify FeeInvoice records were generated in database
    stmt_invoices = select(FeeInvoice).where(
        FeeInvoice.tenant_id == tenant.id,
        FeeInvoice.student_name == unique_student_name
    )
    invoices = (await db_session.execute(stmt_invoices)).scalars().all()
    assert len(invoices) == 3
    total_standard = sum(float(inv.total_amount) for inv in invoices)
    assert total_standard == 50000.0
    total_concessions = sum(float(inv.concession_amount) for inv in invoices)
    assert total_concessions == 14000.0
    total_net_payable = sum(float(inv.net_payable) for inv in invoices)
    assert total_net_payable == 36000.0
    total_balance = sum(float(inv.balance_amount) for inv in invoices)
    assert total_balance == 36000.0


@pytest.mark.asyncio
async def test_admission_approval_auto_invoicing_and_idempotency(client: httpx.AsyncClient, db_session: AsyncSession):
    """
    Phase 4: Admission Integration & Idempotency
    Verifies that approving an admission application auto-provisions term invoices,
    and retrying an already approved admission is safely rejected.
    """
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None

    stmt_user = select(User).where(User.email == "admin@platform.erp.in")
    super_admin = (await db_session.execute(stmt_user)).scalars().first()
    assert super_admin is not None
    await create_approved_support_session(db_session, super_admin.id, tenant.id)

    token = create_access_token(
        subject=str(super_admin.id), tenant_id=str(tenant.id), is_superadmin=True
    )
    headers = {"Authorization": f"Bearer {token}"}

    # Ensure an academic section exists for Class 6 Section A
    sec_stmt = select(AcademicSection).where(
        AcademicSection.tenant_id == tenant.id,
        AcademicSection.class_name == "Class 6",
        AcademicSection.section_code == "A"
    )
    sec = (await db_session.execute(sec_stmt)).scalars().first()
    if not sec:
        sec = AcademicSection(
            tenant_id=tenant.id,
            academic_year="2026-2027",
            course_level="School",
            class_name="Class 6",
            stream="General",
            section_code="A",
            max_capacity=50,
            enrolled_count=0
        )
        db_session.add(sec)
        await db_session.commit()

    # Create a new admission application
    unique_applicant = f"Deepa Gowda {uuid.uuid4().hex[:6]}"
    new_app = AdmissionApplication(
        tenant_id=tenant.id,
        application_number=f"ADM-TEST-{uuid.uuid4().hex[:6]}",
        applicant_name=unique_applicant,
        gender="FEMALE",
        level="School",
        target_class="Class 6",
        status="DOCUMENT_VERIFIED",
        negotiated_fee=36000.0,
        parent_name="V. Gowda",
        parent_phone="+91 98450 99999",
        parent_email=f"gowda_{uuid.uuid4().hex[:4]}@example.com"
    )
    db_session.add(new_app)
    await db_session.commit()
    await db_session.refresh(new_app)

    # Approve application with required payload
    approve_resp = await client.post(
        f"/api/v1/academic/admissions/{new_app.id}/approve",
        json={"section_code": "A", "academic_year": "2026-2027", "review_notes": "Admitted with verified fee"},
        headers=headers
    )
    assert approve_resp.status_code == 200
    approval_data = approve_resp.json()
    assert approval_data["status"] == "APPROVED"
    assert "student_id" in approval_data

    # Verify idempotency: retrying approval must fail with 400 Bad Request
    retry_resp = await client.post(
        f"/api/v1/academic/admissions/{new_app.id}/approve",
        json={"section_code": "A", "academic_year": "2026-2027", "review_notes": "Admitted with verified fee"},
        headers=headers
    )
    assert retry_resp.status_code == 400
    assert "already approved" in retry_resp.json()["detail"].lower()
