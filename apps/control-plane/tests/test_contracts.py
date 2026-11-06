from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.security import issue_license, verify_license, security_settings


def test_health_is_public():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_platform_api_requires_authentication():
    with TestClient(app) as client:
        response = client.get("/platform/v1/dashboard")
    assert response.status_code == 401


def test_license_issuer_fails_closed_without_private_key(monkeypatch):
    monkeypatch.setattr(security_settings, "license_private_key_pem", "")
    with pytest.raises(RuntimeError, match="LICENSE_PRIVATE_KEY_PEM"):
        issue_license(
            institution_id="inst-test", plan_code="standard", modules=["attendance"],
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
            deployment_id="deployment-test",
        )


def test_license_verifier_fails_closed_without_public_key(monkeypatch):
    monkeypatch.setattr(security_settings, "license_public_key_pem", "")
    with pytest.raises(RuntimeError, match="LICENSE_PUBLIC_KEY_PEM"):
        verify_license("not-a-real-token")
