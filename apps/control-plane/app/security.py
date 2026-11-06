from __future__ import annotations

import hmac
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import Header, HTTPException, status
from pydantic_settings import BaseSettings, SettingsConfigDict


class SecuritySettings(BaseSettings):
    platform_admin_token: str = ""
    license_private_key_pem: str = ""
    license_public_key_pem: str = ""
    license_issuer: str = "https://control.yourerp.example"
    license_audience: str = "educationos-institution-erp"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)


security_settings = SecuritySettings()


def require_platform_admin(authorization: str | None = Header(default=None)) -> str:
    expected = security_settings.platform_admin_token
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if len(expected) < 32 or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Platform authentication required")
    return "platform-admin"


def issue_license(
    *, institution_id: str, plan_code: str, modules: list[str],
    expires_at: datetime, deployment_id: str
) -> str:
    key = security_settings.license_private_key_pem.replace("\\n", "\n")
    if not key:
        raise RuntimeError("LICENSE_PRIVATE_KEY_PEM is not configured")
    now = datetime.now(timezone.utc)
    claims: dict[str, Any] = {
        "iss": security_settings.license_issuer,
        "aud": security_settings.license_audience,
        "sub": institution_id,
        "deployment_id": deployment_id,
        "plan": plan_code,
        "modules": sorted(set(modules)),
        "iat": now,
        "nbf": now,
        "exp": expires_at,
        "jti": f"{institution_id}:{int(now.timestamp())}",
    }
    return jwt.encode(claims, key, algorithm="EdDSA")


def verify_license(token: str) -> dict[str, Any]:
    key = security_settings.license_public_key_pem.replace("\\n", "\n")
    if not key:
        raise RuntimeError("LICENSE_PUBLIC_KEY_PEM is not configured")
    return jwt.decode(
        token, key, algorithms=["EdDSA"],
        audience=security_settings.license_audience,
        issuer=security_settings.license_issuer,
        options={"require": ["exp", "iat", "nbf", "iss", "aud", "sub", "deployment_id"]},
    )
