import random
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.modules.leads.models import WebsiteLead
from app.modules.leads.schemas import LeadSubmitRequest

logger = logging.getLogger(__name__)

def generate_lead_reference(enquiry_type: str) -> str:
    """Generate professional reference code e.g. DEMO-2026-7842 or LEAD-2026-3195."""
    prefix = "DEMO" if "demo" in enquiry_type.lower() else ("TRIAL" if "trial" in enquiry_type.lower() else "LEAD")
    suffix = random.randint(1000, 9999)
    return f"{prefix}-2026-{suffix}"

async def process_incoming_lead(
    req: LeadSubmitRequest,
    db: AsyncSession
) -> Tuple[WebsiteLead, bool]:
    """
    Deduplicates submissions, detects repeat enquiries, generates reference code,
    and returns (lead, is_duplicate).
    """
    clean_email = req.email.strip().lower()
    clean_phone = req.phone.strip()
    
    # 1. 24-hour exact duplicate check
    cutoff_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    stmt_dup = select(WebsiteLead).where(
        and_(
            WebsiteLead.email == clean_email,
            WebsiteLead.enquiry_type == req.enquiry_type,
            WebsiteLead.created_at >= cutoff_24h
        )
    )
    res_dup = await db.execute(stmt_dup)
    existing_recent = res_dup.scalars().first()
    if existing_recent:
        # Avoid creating duplicate record if submitted within 24h with same type
        return existing_recent, True

    # 2. Check for repeat enquiry from previous contact
    stmt_repeat = select(func.count(WebsiteLead.id)).where(
        WebsiteLead.email == clean_email
    )
    res_repeat = await db.execute(stmt_repeat)
    previous_count = res_repeat.scalar() or 0
    is_repeat = previous_count > 0

    # 3. Create fresh lead
    ref_no = generate_lead_reference(req.enquiry_type)
    # Ensure reference code is unique
    stmt_check_ref = select(WebsiteLead).where(WebsiteLead.reference_no == ref_no)
    res_check = await db.execute(stmt_check_ref)
    if res_check.scalars().first():
        ref_no = f"{ref_no}-{random.randint(10, 99)}"

    lead = WebsiteLead(
        reference_no=ref_no,
        contact_name=req.contact_name.strip(),
        email=clean_email,
        phone=clean_phone,
        institution_name=req.institution_name.strip(),
        institution_type=req.institution_type or "school",
        city=req.city.strip() if req.city else None,
        state=req.state.strip() if req.state else None,
        student_strength=req.student_strength,
        current_erp=req.current_erp,
        enquiry_type=req.enquiry_type,
        requested_modules=req.requested_modules or [],
        preferred_date=req.preferred_date,
        preferred_time_slot=req.preferred_time_slot,
        message=req.message,
        consent_given=req.consent_given,
        consent_timestamp=datetime.now(timezone.utc),
        page_url=req.page_url,
        source=req.source or "website",
        utm_source=req.utm_source,
        utm_medium=req.utm_medium,
        utm_campaign=req.utm_campaign,
        status="NEW",
        is_repeat_enquiry=is_repeat,
        previous_enquiry_count=previous_count
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)

    return lead, False

async def dispatch_lead_notifications(lead: WebsiteLead):
    """
    Instant notifications dispatcher:
    1. Email notification to Platform Owner (admin@platform.erp.in)
    2. WhatsApp alert logging
    3. Failure-safe execution
    """
    try:
        subject = f"[New {lead.enquiry_type.upper()}] {lead.institution_name} — Ref #{lead.reference_no}"
        logger.info(
            f"DISPATCH_EMAIL to Platform Owner (admin@platform.erp.in): {subject} | "
            f"Contact: {lead.contact_name} ({lead.phone}, {lead.email}) | "
            f"Type: {lead.institution_type} | Modules: {lead.requested_modules}"
        )
        # WhatsApp notification payload simulation / dispatch
        logger.info(
            f"DISPATCH_WHATSAPP to Sales Team (+91 98450 12345): "
            f"New Lead Alert: {lead.institution_name} requested {lead.enquiry_type}. Ref: {lead.reference_no}"
        )
    except Exception as e:
        logger.error(f"Failed to dispatch instant notifications for lead {lead.reference_no}: {e}")

