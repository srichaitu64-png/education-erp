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

