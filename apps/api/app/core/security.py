from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import re
import hashlib
import secrets
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from app.core.config import settings

# Initialize Argon2id password hasher with secure defaults
_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,  # 64 MB
    parallelism=2,
    hash_len=32,
    salt_len=16
)


def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return _hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against an Argon2id hash."""
    try:
        return _hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def generate_secure_token(length: int = 32) -> str:
    """Generate a high-entropy cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def hash_token(token: str) -> str:
    """Hash a token using SHA-256 for secure non-plaintext storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_temporary_password() -> str:
    """Generate a compliant, high-entropy temporary password."""
    special_chars = "!@#$%^&*"
    chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    rand_chars = "".join(secrets.choice(chars) for _ in range(10))
    rand_special = secrets.choice(special_chars)
    rand_digit = secrets.choice("23456789")
    rand_upper = secrets.choice("ABCDEFGHJKLMNPQRSTUVWXYZ")
    return f"{rand_upper}{rand_chars}{rand_digit}{rand_special}"


COMMON_WEAK_PASSWORDS = {
    "password", "password123", "admin123", "welcome123", "letmein", "12345678",
    "education123", "akshara123", "school123", "college123", "qwerty123"
}


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validates password strength according to EducationOS security policy:
    - Minimum 8 characters (Recommended 10+)
    - At least one uppercase letter (A-Z)
    - At least one lowercase letter (a-z)
    - At least one digit (0-9)
    - At least one special symbol (!@#$%^&*()-_=+[]{}|;:,.<>?)
    - Not in known common weak password list
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must include at least one uppercase letter (A-Z)."
    if not re.search(r"[a-z]", password):
        return False, "Password must include at least one lowercase letter (a-z)."
    if not re.search(r"[0-9]", password):
        return False, "Password must include at least one numeric digit (0-9)."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_=+[\];/]", password):
        return False, "Password must include at least one special symbol (e.g. !@#$%^&*)."
    if password.lower() in COMMON_WEAK_PASSWORDS:
        return False, "Password is too common and easily guessed. Please choose a stronger unique password."
    return True, "Password meets complexity requirements."


def create_access_token(
    subject: Union[str, Any],
    tenant_id: Optional[str] = None,
    is_superadmin: bool = False,
    session_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None
) -> str:
    """Create a signed JWT access token containing subject, tenant, superadmin, and session id claims."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload: Dict[str, Any] = {
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "sub": str(subject),
        "type": "access",
        "tenant_id": str(tenant_id) if tenant_id else None,
        "is_superadmin": is_superadmin,
        "sid": str(session_id) if session_id else None
    }
    if extra_claims:
        payload.update(extra_claims)
    encoded_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any],
    tenant_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a long-lived JWT refresh token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    payload: Dict[str, Any] = {
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "sub": str(subject),
        "type": "refresh",
        "tenant_id": str(tenant_id) if tenant_id else None
    }
    encoded_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token."""
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded
    except jwt.PyJWTError:
        return None

