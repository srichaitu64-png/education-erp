import pytest
import uuid
import httpx
from sqlalchemy import select
from app.modules.leads.models import WebsiteLead

@pytest.fixture
async def platform_token(client: httpx.AsyncClient) -> str:
    """Obtain valid Platform Super Admin JWT access token using requested platform bootstrap credentials."""
    res = await client.post("/api/v1/auth/login", json={
        "username": "admin@platform.erp.in",
        "password": "AdminSecurePassword2026!"
    })
    assert res.status_code == 200, f"Superadmin login failed: {res.text}"
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_01_otp_password_recovery_flow(client: httpx.AsyncClient):
    """
    Test Self-Service OTP Password Recovery:
    1. Request OTP using platform email
    2. Confirm incorrect OTP fails with 400
    3. Verify valid 6-digit OTP resets password
    4. Verify login succeeds with newly set password
    """
    # Step 1: Request OTP using superadmin platform email
    req_resp = await client.post("/api/v1/auth/password/otp-request", json={
        "identifier": "siva"
    })
    assert req_resp.status_code == 200, req_resp.text
    data = req_resp.json()
    assert "dispatched" in data["message"].lower()
    test_otp = data.get("test_otp")
    assert test_otp is not None and len(test_otp) == 6

    # Step 2: Verify wrong OTP fails
    fail_resp = await client.post("/api/v1/auth/password/otp-verify-and-reset", json={
        "identifier": "siva",
        "otp_code": "000000",
        "new_password": "Myerp2026@Updated!",
        "confirm_password": "Myerp2026@Updated!"
    })
    assert fail_resp.status_code == 400

    # Step 3: Verify correct OTP resets password
    reset_resp = await client.post("/api/v1/auth/password/otp-verify-and-reset", json={
        "identifier": "siva",
        "otp_code": test_otp,
        "new_password": "Myerp2026@",
        "confirm_password": "Myerp2026@"
    })
    assert reset_resp.status_code == 200
    assert reset_resp.json()["success"] is True

    # Step 4: Login succeeds with reset password
    login_resp = await client.post("/api/v1/auth/login", json={
        "username": "siva",
        "password": "Myerp2026@"
    })
    assert login_resp.status_code == 200
    assert login_resp.json()["destination"] == "/platform"


@pytest.mark.asyncio
async def test_02_website_lead_submission_and_honeypot(client: httpx.AsyncClient):
    """
    Test Website Lead Capture:
    1. Valid demonstration submission returns unique reference number
    2. Duplicate submission within 24 hours safely deduplicated
    3. Honeypot spam trap absorbs automated bot submission without saving
    """
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"chandra_{unique_suffix}@karnatakacollege.edu.in"
    lead_payload = {
        "contact_name": "Dr. Subhash Chandra",
        "email": email,
        "phone": "+91 98450 99887",
        "institution_name": f"Karnataka Composite College {unique_suffix}",
        "institution_type": "pu_college",
        "city": "Dharwad",
        "state": "Karnataka",
        "student_strength": "750 - 1,500 Students",
        "enquiry_type": "live_demo",
        "requested_modules": ["fees", "attendance", "exams"],
        "preferred_date": "2026-11-12",
        "preferred_time_slot": "11:00 AM - 12:00 PM",
        "message": "Need multi-head fee receipts and PU board practical exam marks entry.",
        "consent_given": True
    }
    res = await client.post("/api/v1/leads/submit", json=lead_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["reference_no"].startswith("DEMO-2026-")
    ref_no = data["reference_no"]

    # Duplicate submission within 24 hours returns existing reference
    res_dup = await client.post("/api/v1/leads/submit", json=lead_payload)
    assert res_dup.status_code == 200
    assert res_dup.json()["reference_no"] == ref_no

    # Honeypot spam submission returns absorbed reference without storing spam
    bot_payload = lead_payload.copy()
    bot_payload["email"] = f"bot_{unique_suffix}@spammer.org"
    bot_payload["website_url_hp"] = "http://spam-link.ru"
    res_bot = await client.post("/api/v1/leads/submit", json=bot_payload)
    assert res_bot.status_code == 200
    assert res_bot.json()["reference_no"] == "DEMO-2026-0000"


@pytest.mark.asyncio
async def test_03_platform_admin_lead_management_and_conversion(
    client: httpx.AsyncClient,
    platform_token: str
):
    """
    Test Platform Super Admin Lead Pipeline & Conversion:
    1. Fetch leads list and pipeline metrics
    2. Update status and notes
    3. Convert lead into an active tenant with campuses and admin user
    """
    headers = {"Authorization": f"Bearer {platform_token}"}

    # First submit a fresh lead to ensure at least one is present
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"lead_{unique_suffix}@vidyashala.edu.in"
    lead_payload = {
        "contact_name": "Prof. Ananth Kumar",
        "email": email,
        "phone": "+91 99887 66554",
        "institution_name": f"Vidya Shala College {unique_suffix}",
        "institution_type": "degree_college",
        "city": "Mysuru",
        "state": "Karnataka",
        "student_strength": "1,500 - 3,000 Students",
        "enquiry_type": "live_demo",
        "requested_modules": ["admissions", "fees", "exams"],
        "consent_given": True
    }
    sub_res = await client.post("/api/v1/leads/submit", json=lead_payload)
    assert sub_res.status_code == 200

    # 1. Fetch leads list
    leads_res = await client.get("/api/v1/platform/leads", headers=headers)
    assert leads_res.status_code == 200
    leads_list = leads_res.json()
    assert len(leads_list) >= 1
    test_lead = next((l for l in leads_list if l["email"] == email), leads_list[0])

    # 2. Fetch metrics
    metrics_res = await client.get("/api/v1/platform/leads/metrics", headers=headers)
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["total_leads"] >= 1

    # 3. Update lead status & internal notes
    lead_id = test_lead["id"]
    patch_res = await client.patch(
        f"/api/v1/platform/leads/{lead_id}",
        json={
            "status": "DEMO_SCHEDULED",
            "internal_notes": "Demo booked for next Tuesday. Spoke with Principal."
        },
        headers=headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "DEMO_SCHEDULED"

    # 4. Convert lead to active tenant
    convert_res = await client.post(
        f"/api/v1/platform/leads/{lead_id}/convert",
        json={
            "plan_code": "STANDARD",
            "campus_name": "Main Campus"
        },
        headers=headers
    )
    assert convert_res.status_code == 200, convert_res.text
    conv_data = convert_res.json()
    assert conv_data["success"] is True
    assert conv_data["tenant_code"] is not None
    assert conv_data["temporary_password"] is not None

    # Verify lead status is now CONVERTED
    detail_res = await client.get(f"/api/v1/platform/leads/{lead_id}", headers=headers)
    assert detail_res.json()["status"] == "CONVERTED"
    assert detail_res.json()["converted_tenant_id"] is not None
