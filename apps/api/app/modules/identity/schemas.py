import uuid
from typing import List, Optional
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


