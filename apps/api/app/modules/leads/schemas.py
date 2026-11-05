import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class LeadSubmitRequest(BaseModel):
    contact_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=50)
    institution_name: str = Field(..., min_length=2, max_length=255)
    institution_type: Optional[str] = "school"
    city: Optional[str] = None
    state: Optional[str] = None
    student_strength: Optional[str] = None
    current_erp: Optional[str] = None
    enquiry_type: str = Field(default="demo_request")  # demo_request, live_demo, sales, pricing, trial, partnership
    requested_modules: Optional[List[str]] = []
    preferred_date: Optional[str] = None
    preferred_time_slot: Optional[str] = None
    message: Optional[str] = None
    consent_given: bool = True
    page_url: Optional[str] = None
    source: Optional[str] = "website"
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    website_url_hp: Optional[str] = None  # Honeypot spam trap

class LeadSubmitResponse(BaseModel):
    success: bool
    reference_no: str
    message: str
    enquiry_type: str
    status: str
    is_repeat: bool = False

class LeadDetailOut(BaseModel):
    id: uuid.UUID
    reference_no: str
    contact_name: str
    email: str
    phone: str
    institution_name: str
    institution_type: str
    city: Optional[str]
    state: Optional[str]
    student_strength: Optional[str]
    current_erp: Optional[str]
    enquiry_type: str
    requested_modules: Optional[List[str]] = []
    preferred_date: Optional[str]
    preferred_time_slot: Optional[str]
    message: Optional[str]
    consent_given: bool
    page_url: Optional[str]
    source: Optional[str]
    utm_source: Optional[str]
    utm_medium: Optional[str]
    utm_campaign: Optional[str]
    status: str
    assigned_to: Optional[str]
    follow_up_date: Optional[str]
    internal_notes: Optional[str]
    is_repeat_enquiry: bool
    previous_enquiry_count: int
    converted_tenant_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LeadUpdateRequest(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    follow_up_date: Optional[str] = None
    internal_notes: Optional[str] = None

class LeadConvertRequest(BaseModel):
    plan_code: str = "STARTER"
    institution_code: Optional[str] = None
    campus_name: Optional[str] = "Main Campus"

class LeadMetricsOut(BaseModel):
    total_leads: int
    new_leads: int
    demo_requests: int
    trial_requests: int
    follow_ups_due: int
    converted: int

