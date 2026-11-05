import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc

from app.database.session import get_db
from app.modules.identity.models import User
from app.security.deps import get_current_superadmin
from app.modules.leads.models import WebsiteLead
from app.modules.leads.schemas import (
    LeadSubmitRequest,
    LeadSubmitResponse,
    LeadDetailOut,
    LeadUpdateRequest,
    LeadConvertRequest,
    LeadMetricsOut
)
from app.modules.leads.service import process_incoming_lead, dispatch_lead_notifications
from app.modules.tenants.models import Tenant, Campus
from app.modules.subscriptions.models import Subscription, SubscriptionPlan as Plan
from app.modules.identity.models import Role, UserRole
from app.core.security import hash_password, generate_temporary_password

router = APIRouter()

# ==============================================================================
# Public Website Lead Capture Endpoints
# ==============================================================================

@router.post("/leads/submit", response_model=LeadSubmitResponse)
async def submit_website_lead(
    req: LeadSubmitRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Public Lead Capture & Demo Booking:
    - Protects against bot spam via hidden honeypot field.
    - Automatically deduplicates multiple clicks within 24 hours.
    - Tags repeat enquiries from recognized institutions.
    - Dispatches instant alerts to Platform Owner via background tasks.
    - Never auto-provisions tenant credentials or access.
    """
    # 1. Honeypot check
    if req.website_url_hp:
        # Silently absorb bot submissions
        return LeadSubmitResponse(
            success=True,
            reference_no="DEMO-2026-0000",
            message="Your demonstration request has been submitted successfully.",
            enquiry_type=req.enquiry_type,
            status="NEW"
        )

    # 2. Process submission
    lead, is_duplicate = await process_incoming_lead(req, db)

    # 3. Queue instant notifications
    background_tasks.add_task(dispatch_lead_notifications, lead)

    msg = (
        f"Thank you, {lead.contact_name}. Your enquiry has been received. "
        f"Reference #{lead.reference_no} has been allocated. Our team will review and confirm your request shortly."
    )
    if is_duplicate:
        msg = f"Thank you! We already have your active request on file under reference #{lead.reference_no}. Our team is reviewing it."

    return LeadSubmitResponse(
        success=True,
        reference_no=lead.reference_no,
        message=msg,
        enquiry_type=lead.enquiry_type,
        status=lead.status,
        is_repeat=lead.is_repeat_enquiry
    )


# ==============================================================================
# Platform Super Admin Lead Governance Endpoints
# ==============================================================================

@router.get("/platform/leads", response_model=List[LeadDetailOut])
async def list_leads(
    q: Optional[str] = Query(None, description="Search across contact, email, phone, institution, or reference"),
    status: Optional[str] = Query(None, description="Filter by status (NEW, CONTACTED, etc.)"),
    enquiry_type: Optional[str] = Query(None, description="Filter by enquiry type"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Platform Super Admin: List, search, and filter website leads & enquiries."""
    stmt = select(WebsiteLead)

    filters = []
    if status and status.upper() != "ALL":
        filters.append(WebsiteLead.status == status.upper())
    if enquiry_type and enquiry_type.upper() != "ALL":
        filters.append(WebsiteLead.enquiry_type == enquiry_type.lower())
    if q and q.strip():
        search_pattern = f"%{q.strip()}%"
        filters.append(
            or_(
                WebsiteLead.contact_name.ilike(search_pattern),
                WebsiteLead.email.ilike(search_pattern),
                WebsiteLead.phone.ilike(search_pattern),
                WebsiteLead.institution_name.ilike(search_pattern),
                WebsiteLead.reference_no.ilike(search_pattern)
            )
        )

    if filters:
        stmt = stmt.where(*filters)

    stmt = stmt.order_by(desc(WebsiteLead.created_at)).offset(offset).limit(limit)
    res = await db.execute(stmt)
    leads = res.scalars().all()
    return leads


@router.get("/platform/leads/metrics", response_model=LeadMetricsOut)
async def get_lead_metrics(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Platform Super Admin: High-level metrics for leads and enquiry pipeline."""
    total_stmt = select(func.count(WebsiteLead.id))
    new_stmt = select(func.count(WebsiteLead.id)).where(WebsiteLead.status == "NEW")
    demo_stmt = select(func.count(WebsiteLead.id)).where(
        or_(
            WebsiteLead.enquiry_type == "demo_request",
            WebsiteLead.enquiry_type == "live_demo"
        )
    )
    trial_stmt = select(func.count(WebsiteLead.id)).where(WebsiteLead.enquiry_type == "trial")
    converted_stmt = select(func.count(WebsiteLead.id)).where(WebsiteLead.status == "CONVERTED")
    followup_stmt = select(func.count(WebsiteLead.id)).where(
        WebsiteLead.follow_up_date.isnot(None),
        WebsiteLead.status.notin_(["CONVERTED", "LOST", "SPAM"])
    )

    t_res = await db.execute(total_stmt)
    n_res = await db.execute(new_stmt)
    d_res = await db.execute(demo_stmt)
    tr_res = await db.execute(trial_stmt)
    c_res = await db.execute(converted_stmt)
    f_res = await db.execute(followup_stmt)

    return LeadMetricsOut(
        total_leads=t_res.scalar() or 0,
        new_leads=n_res.scalar() or 0,
        demo_requests=d_res.scalar() or 0,
        trial_requests=tr_res.scalar() or 0,
        follow_ups_due=f_res.scalar() or 0,
        converted=c_res.scalar() or 0
    )


@router.get("/platform/leads/{lead_id}", response_model=LeadDetailOut)
async def get_lead_detail(
    lead_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Platform Super Admin: View full details of a specific enquiry."""
    stmt = select(WebsiteLead).where(WebsiteLead.id == lead_id)
    res = await db.execute(stmt)
    lead = res.scalars().first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.patch("/platform/leads/{lead_id}", response_model=LeadDetailOut)
async def update_lead(
    lead_id: uuid.UUID,
    req: LeadUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """Platform Super Admin: Update lead status, assigned representative, or internal notes."""
    stmt = select(WebsiteLead).where(WebsiteLead.id == lead_id)
    res = await db.execute(stmt)
    lead = res.scalars().first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    if req.status is not None:
        lead.status = req.status.upper()
    if req.assigned_to is not None:
        lead.assigned_to = req.assigned_to
    if req.follow_up_date is not None:
        lead.follow_up_date = req.follow_up_date
    if req.internal_notes is not None:
        lead.internal_notes = req.internal_notes

    lead.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(lead)
    return lead


@router.post("/platform/leads/{lead_id}/convert")
async def convert_lead_to_tenant(
    lead_id: uuid.UUID,
    req: LeadConvertRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_superadmin)
):
    """
    Platform Super Admin: Convert an approved lead into a provisioned institution tenant.
    - Safely provisions institution tenant in PostgreSQL.
    - Creates default administrator account.
    - Marks lead status as CONVERTED and links converted_tenant_id.
    """
    stmt = select(WebsiteLead).where(WebsiteLead.id == lead_id)
    res = await db.execute(stmt)
    lead = res.scalars().first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    if lead.status == "CONVERTED" and lead.converted_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This lead was already converted into tenant ID {lead.converted_tenant_id}."
        )

    # Derive unique tenant code
    base_code = req.institution_code or (
        lead.institution_name.lower().replace(" ", "-").replace(".", "").replace(",", "")[:18]
    )
    clean_code = "".join(c for c in base_code if c.isalnum() or c == "-").strip("-")
    if not clean_code:
        clean_code = f"tenant-{uuid.uuid4().hex[:6]}"

    # Ensure code uniqueness
    existing_t = await db.execute(select(Tenant).where(Tenant.code == clean_code))
    if existing_t.scalars().first():
        clean_code = f"{clean_code[:16]}-{uuid.uuid4().hex[:4]}"

    # Create Tenant
    new_tenant = Tenant(
        name=lead.institution_name,
        code=clean_code,
        institution_type=lead.institution_type or "school",
        status="trial_active" if "trial" in lead.enquiry_type.lower() else "active",
        email=lead.email,
        phone=lead.phone,
        city=lead.city or "Bengaluru",
        state=lead.state or "Karnataka",
        country="India",
        settings={
            "source_lead_ref": lead.reference_no,
            "converted_from_lead_id": str(lead.id),
            "requested_modules": lead.requested_modules
        }
    )
    db.add(new_tenant)
    await db.flush()

    # Create Main Campus
    campus = Campus(
        tenant_id=new_tenant.id,
        name=req.campus_name or "Main Campus",
        code="MAIN",
        is_main=True,
        address=f"{lead.city or ''}, {lead.state or ''}".strip(", ") or None,
        contact_email=lead.email,
        contact_phone=lead.phone
    )
    db.add(campus)
    await db.flush()

    # Find subscription plan
    stmt_plan = select(Plan).where(Plan.code == req.plan_code.upper())
    res_plan = await db.execute(stmt_plan)
    plan = res_plan.scalars().first()
    if not plan:
        res_starter = await db.execute(select(Plan).where(Plan.code == "STARTER"))
        plan = res_starter.scalars().first()

    if plan:
        sub = Subscription(
            tenant_id=new_tenant.id,
            plan_id=plan.id,
            status="trial" if "trial" in lead.enquiry_type.lower() else "active",
            starts_at=datetime.now(timezone.utc),
            ends_at=datetime.now(timezone.utc) + timedelta(days=30),
            billing_cycle="monthly",
            auto_renew=True
        )
        db.add(sub)
        await db.flush()

    # Provision default administrator
    temp_pass = generate_temporary_password()
    admin_user = User(
        email=lead.email,
        hashed_password=hash_password(temp_pass),
        full_name=lead.contact_name,
        phone=lead.phone,
        is_active=True,
        is_superadmin=False,
        must_change_password=True
    )
    db.add(admin_user)
    await db.flush()

    # Assign PRINCIPAL or INSTITUTION_ADMIN role
    stmt_role = select(Role).where(
        Role.tenant_id == new_tenant.id,
        Role.code.in_(["PRINCIPAL", "INSTITUTION_ADMIN"])
    )
    res_role = await db.execute(stmt_role)
    inst_role = res_role.scalars().first()
    if not inst_role:
        # Create default institutional admin role
        inst_role = Role(
            tenant_id=new_tenant.id,
            name="Principal / Administrator",
            code="PRINCIPAL",
            description="Chief Academic and Administrative Authority"
        )
        db.add(inst_role)
        await db.flush()

    ur = UserRole(user_id=admin_user.id, role_id=inst_role.id, tenant_id=new_tenant.id)
    db.add(ur)

    # Update lead status
    lead.status = "CONVERTED"
    lead.converted_tenant_id = new_tenant.id
    lead.internal_notes = (lead.internal_notes or "") + f"\n[Converted by SuperAdmin] Provisioned Tenant Code: {clean_code}"
    lead.updated_at = datetime.now(timezone.utc)

    await db.commit()

    return {
        "success": True,
        "message": f"Successfully onboarded {lead.institution_name} as tenant '{clean_code}'.",
        "tenant_id": str(new_tenant.id),
        "tenant_code": clean_code,
        "admin_email": lead.email,
        "temporary_password": temp_pass
    }
