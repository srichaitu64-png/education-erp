import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class FeatureCatalogOut(BaseModel):
    id: str
    name: str
    module: str
    category: str
    description: str
    min_plan_tier: int
    default_enabled: bool
    is_addon: bool

    class Config:
        from_attributes = True


class SubscriptionPlanCreate(BaseModel):
    code: str
    name: str
    tier: int
    description: Optional[str] = None
    price_monthly_inr: float = 0.0
    price_annual_inr: float = 0.0
    max_students: int = 300
    max_staff: int = 30
    max_campuses: int = 1
    max_storage_mb: int = 5000
    is_active: bool = True
    is_custom: bool = False
    feature_ids: List[str] = []


class SubscriptionPlanOut(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    tier: int
    description: Optional[str] = None
    price_monthly_inr: float
    price_annual_inr: float
    max_students: int
    max_staff: int
    max_campuses: int
    max_storage_mb: int
    is_active: bool
    is_custom: bool
    included_features: List[str] = []

    class Config:
        from_attributes = True


class FeatureOverrideRequest(BaseModel):
    tenant_id: uuid.UUID
    feature_id: str
    override_status: str  # "ALLOW" or "DENY"
    reason: str
    expires_at: Optional[datetime] = None


class FeatureOverrideRevokeRequest(BaseModel):
    tenant_id: uuid.UUID
    feature_id: str


class SubscriptionCreate(BaseModel):
    tenant_id: uuid.UUID
    plan_id: uuid.UUID
    billing_cycle: str = "annual"
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class EntitlementItem(BaseModel):
    feature_id: str
    name: str
    module: str
    category: str
    description: str
    is_enabled: bool
    required_plan: str
    lock_reason: Optional[str] = None
    upgrade_url: Optional[str] = None
    override_active: bool = False


class TenantEntitlementsOut(BaseModel):
    tenant_id: str
    current_plan: str
    current_tier: int
    subscription_status: str
    features: List[EntitlementItem]

