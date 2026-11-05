import json
import hmac
import hashlib
import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.modules.tenants.models import Tenant
from app.modules.subscriptions.models import Subscription, SubscriptionAuditLog


@pytest.mark.asyncio
async def test_gst_calculation_intra_state_karnataka(client: AsyncClient):
    """
    Test statutory Indian GST calculation for Intra-state supply (Karnataka -> Karnataka).
    Enforces SAC 9992 with 9% CGST + 9% SGST.
    """
    payload = {
        "amount": 100000.0,
        "customer_state": "Karnataka",
        "hsn_code": "9992"
    }
    res = await client.post("/api/v1/finance/billing/calculate-gst", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["taxable_amount"] == 100000.0
    assert data["hsn_code"] == "9992"
    assert data["supply_type"] == "INTRA_STATE"
    assert data["cgst_rate"] == 9.0
    assert data["cgst_amount"] == 9000.0
    assert data["sgst_rate"] == 9.0
    assert data["sgst_amount"] == 9000.0
    assert data["igst_rate"] == 0.0
    assert data["igst_amount"] == 0.0
    assert data["total_tax"] == 18000.0
    assert data["total_payable"] == 118000.0


@pytest.mark.asyncio
async def test_gst_calculation_inter_state(client: AsyncClient):
    """
    Test statutory Indian GST calculation for Inter-state supply (Karnataka -> Other States).
    Enforces SAC 9992 with 18% IGST.
    """
    payload = {
        "amount": 50000.0,
        "customer_state": "Maharashtra"
    }
    res = await client.post("/api/v1/finance/billing/calculate-gst", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["taxable_amount"] == 50000.0
    assert data["supply_type"] == "INTER_STATE"
    assert data["cgst_rate"] == 0.0
    assert data["cgst_amount"] == 0.0
    assert data["sgst_rate"] == 0.0
    assert data["sgst_amount"] == 0.0
    assert data["igst_rate"] == 18.0
    assert data["igst_amount"] == 9000.0
    assert data["total_tax"] == 9000.0
    assert data["total_payable"] == 59000.0


@pytest.mark.asyncio
async def test_payment_gateway_webhook_success_and_subscription_renewal(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Test payment webhook with valid HMAC-SHA256 signature:
    - Verifies cryptographic signature
    - Extends subscription validity
    - Records immutable audit log
    """
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()
    assert tenant is not None

    stmt_sub = select(Subscription).where(Subscription.tenant_id == tenant.id)
    sub = (await db_session.execute(stmt_sub)).scalars().first()
    assert sub is not None

    payload_dict = {
        "event": "payment.captured",
        "tenant_id": str(tenant.id),
        "amount": 118000.0,
        "transaction_id": f"txn_rzp_{uuid.uuid4().hex[:8]}"
    }
    raw_body = json.dumps(payload_dict).encode("utf-8")
    webhook_secret = getattr(settings, "PAYMENT_WEBHOOK_SECRET", None) or settings.SECRET_KEY
    signature = hmac.new(webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()

    res = await client.post(
        "/api/v1/finance/billing/webhooks/payment",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature
        }
    )
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["status"] == "SUCCESS"
    assert data["tenant_id"] == str(tenant.id)
    assert data["subscription_status"] == "active"

    # Refresh and verify subscription in database
    await db_session.refresh(sub)
    assert sub.status == "active"

    # Verify audit log entry
    stmt_audit = (
        select(SubscriptionAuditLog)
        .where(
            SubscriptionAuditLog.tenant_id == tenant.id,
            SubscriptionAuditLog.action == "PAYMENT_RECEIVED_RENEWED"
        )
    )
    audit = (await db_session.execute(stmt_audit)).scalars().first()
    assert audit is not None
    assert audit.details.get("actor_name") == "Payment Gateway Webhook"


@pytest.mark.asyncio
async def test_payment_gateway_webhook_tampered_signature_rejected(
    client: AsyncClient, db_session: AsyncSession
):
    """Verify webhook with tampered or incorrect signature is rejected with 401."""
    stmt_tenant = select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"]))
    tenant = (await db_session.execute(stmt_tenant)).scalars().first()

    payload_dict = {
        "event": "payment.captured",
        "tenant_id": str(tenant.id),
        "amount": 50000.0,
        "transaction_id": "txn_fake_123"
    }
    raw_body = json.dumps(payload_dict).encode("utf-8")

    res = await client.post(
        "/api/v1/finance/billing/webhooks/payment",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-Webhook-Signature": "tampered_signature_deadbeef"
        }
    )
    assert res.status_code == 401
    assert "Invalid cryptographic webhook signature" in res.json()["detail"]


@pytest.mark.asyncio
async def test_payment_gateway_webhook_nonexistent_tenant(client: AsyncClient):
    """Verify webhook for non-existent tenant returns 404."""
    random_tenant_id = str(uuid.uuid4())
    payload_dict = {
        "event": "payment.captured",
        "tenant_id": random_tenant_id,
        "amount": 50000.0,
        "transaction_id": "txn_unknown_123"
    }
    raw_body = json.dumps(payload_dict).encode("utf-8")
    webhook_secret = getattr(settings, "PAYMENT_WEBHOOK_SECRET", None) or settings.SECRET_KEY
    signature = hmac.new(webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()

    res = await client.post(
        "/api/v1/finance/billing/webhooks/payment",
        content=raw_body,
        headers={
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature
        }
    )
    assert res.status_code == 404
