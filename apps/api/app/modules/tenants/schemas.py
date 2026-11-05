import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr


class CampusCreate(BaseModel):
    name: str
    code: str
    is_main: bool = False
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class CampusOut(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    code: str
    is_main: bool
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

    class Config:
        from_attributes = True


class TenantCreate(BaseModel):
    name: str
    code: str
    institution_type: str = "school"  # "school", "pu_college", "degree_college", "composite_group"
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "India"
    primary_color: str = "#1E40AF"
    secondary_color: str = "#F59E0B"
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    initial_plan_code: Optional[str] = "TRIAL"


class TenantOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    institution_type: str
    status: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    primary_color: str
    secondary_color: str
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    campuses: List[CampusOut] = []

    class Config:
        from_attributes = True


class CampusInput(BaseModel):
    name: str
    code: str
    is_main: bool = False
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class AcademicUnitInput(BaseModel):
    code: str
    name: str
    level: str = "School"  # "School", "PU College", "Degree College", "University"
    type: str = "general"
    principal_email: Optional[EmailStr] = None


class InitialAdminInput(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "CHAIRMAN_DIRECTOR"  # "CHAIRMAN_DIRECTOR", "PRINCIPAL", "INSTITUTION_ADMIN"
    phone: Optional[str] = None
    must_change_password: bool = True
    temporary_password: Optional[str] = None


class InstitutionOnboardingRequest(BaseModel):
    name: str
    code: Optional[str] = None  # Auto-generated if omitted
    institution_type: str = "composite_group"  # school, pu_college, degree_college, university, educational_trust, composite_group
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = "Karnataka"
    postal_code: Optional[str] = None
    country: str = "India"
    primary_color: str = "#1E40AF"
    secondary_color: str = "#F59E0B"
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    
    # Campus & Academic Units
    campuses: List[CampusInput] = []
    academic_units: List[AcademicUnitInput] = []
    
    # Subscription & Entitlements
    plan_code: str = "STANDARD"  # TRIAL, STARTER, STANDARD, PRO, ENTERPRISE
    billing_cycle: str = "annual"  # monthly, annual
    is_trial: bool = False
    trial_days: int = 30
    feature_overrides: Optional[List[Dict[str, Any]]] = None
    
    # Initial Authority / Head Account
    initial_admin: InitialAdminInput


class InstitutionOnboardingResponse(BaseModel):
    status: str = "success"
    message: str
    tenant: TenantOut
    subscription: Dict[str, Any]
    initial_admin: Dict[str, Any]
    activation_summary: str


class TenantStatusUpdateRequest(BaseModel):
    status: str  # active, suspended, trial, expired
    reason: str


class TenantSubscriptionRenewRequest(BaseModel):
    duration_days: int = 365
    billing_cycle: Optional[str] = "annual"
    reason: Optional[str] = None


class TenantPlanChangeRequest(BaseModel):
    new_plan_code: str
    reason: str


class TenantFullDetailsOut(BaseModel):
    tenant: TenantOut
    academic_units: List[Dict[str, Any]] = []
    subscription: Optional[Dict[str, Any]] = None
    entitled_modules: List[str] = []
    admin_users: List[Dict[str, Any]] = []


