import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_code: Optional[str] = None  # Optional school code (e.g. "akshara")


class RoleOut(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    tenant_id: Optional[uuid.UUID] = None
    permissions: List[str] = []

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    phone: Optional[str] = None
    is_active: bool
    is_superadmin: bool
    must_change_password: bool = False
    password_changed_at: Optional[datetime] = None
    roles: List[RoleOut] = []

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    is_superadmin: bool = False


class UserAutocompleteRequest(BaseModel):
    tenant_code: str
    role_code: str
    query: str


class UserAutocompleteResult(BaseModel):
    id: str
    display_name: str
    identifier: str
    role_code: str


# ==============================================================================
# Password & Account Security Management Schemas
# ==============================================================================

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class FirstLoginSetupRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class ForgotPasswordRequest(BaseModel):
    email: str
    portal_type: str = "INSTITUTION"  # "INSTITUTION" or "PLATFORM"


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str


class AdminPasswordResetRequest(BaseModel):
    target_user_id: uuid.UUID
    reason: str
    force_change_on_login: bool = True


class SessionOut(BaseModel):
    id: uuid.UUID
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_name: Optional[str] = None
    is_revoked: bool
    last_active_at: datetime
    is_current: bool = False


class AccountSecurityEventOut(BaseModel):
    id: uuid.UUID
    event_type: str
    actor_name: Optional[str] = None
    created_at: datetime
    details: Dict[str, Any] = {}


class AccountSecurityOverviewOut(BaseModel):
    email: str
    must_change_password: bool
    password_changed_at: Optional[datetime] = None
    failed_login_attempts: int
    is_locked: bool
    locked_until: Optional[datetime] = None
    active_sessions: List[SessionOut] = []
    recent_events: List[AccountSecurityEventOut] = []



