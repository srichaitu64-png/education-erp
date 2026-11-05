import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database.base import Base

class WebsiteLead(Base):
    __tablename__ = "website_leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference_no = Column(String(50), unique=True, nullable=False, index=True)
    
    # Contact Information
    contact_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    
    # Institution Information
    institution_name = Column(String(255), nullable=False)
    institution_type = Column(String(50), nullable=False, default="school")  # school, pu_college, degree_college, university, composite_group
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    student_strength = Column(String(50), nullable=True)  # e.g. "500-1000"
    current_erp = Column(String(100), nullable=True)
    
    # Enquiry Details
    enquiry_type = Column(String(50), nullable=False, default="demo_request")  # demo_request, live_demo, sales, pricing, trial, partnership
    requested_modules = Column(JSONB, nullable=True, default=list)  # ["attendance", "fees", "exams", ...]
    preferred_date = Column(String(50), nullable=True)
    preferred_time_slot = Column(String(50), nullable=True)
    message = Column(Text, nullable=True)
    
    # Consent and Provenance
    consent_given = Column(Boolean, nullable=False, default=True)
    consent_timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    page_url = Column(String(255), nullable=True)
    source = Column(String(100), nullable=True, default="website")
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    
    # Lead Pipeline & Governance
    status = Column(String(50), nullable=False, default="NEW", index=True)  # NEW, CONTACTED, DEMO_SCHEDULED, TRIAL_STARTED, CONVERTED, LOST, SPAM
    assigned_to = Column(String(255), nullable=True)
    follow_up_date = Column(String(50), nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    # Deduplication & Frequency
    is_repeat_enquiry = Column(Boolean, nullable=False, default=False)
    previous_enquiry_count = Column(Integer, nullable=False, default=0)
    
    # Notification Delivery Status & Reliability Pipeline
    notification_status = Column(String(50), nullable=False, default="PENDING")  # PENDING, SENT, FAILED, NO_PROVIDER
    notification_attempts = Column(Integer, nullable=False, default=0)
    notification_last_error = Column(Text, nullable=True)
    notification_sent_at = Column(DateTime(timezone=True), nullable=True)
    
    # Conversion link
    converted_tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
