import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.totp import (
    generate_totp_secret,
    get_totp_token,
    verify_totp_token,
    generate_otpauth_uri,
)
from app.modules.identity.models import User
from app.core.security import verify_password, hash_password


def test_totp_core_cryptography():
    """Verify standard library RFC 6238 TOTP implementation."""
    secret = generate_totp_secret()
    assert len(secret) >= 26
    
    # Generate token
    token = get_totp_token(secret)
    assert len(token) == 6
    assert token.isdigit()

    # Verify token
    assert verify_totp_token(secret, token) is True
    # Verify rejection of bad token
    assert verify_totp_token(secret, "999999" if token != "999999" else "000000") is False

    # Check URI generation
    uri = generate_otpauth_uri(secret, "admin@platform.erp.in", "EducationOS")
    assert uri.startswith("otpauth://totp/EducationOS:admin%40platform.erp.in?")
    assert f"secret={secret}" in uri


@pytest.mark.asyncio
async def test_mfa_setup_verify_and_challenge_flow(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Test complete Multi-Factor Authentication lifecycle:
    1. Authenticate with standard credentials
    2. Initiate MFA enrollment (POST /api/v1/auth/mfa/setup)
    3. Verify and enable MFA with TOTP code (POST /api/v1/auth/mfa/verify)
    4. Authenticate via login and verify MFA challenge interception (mfa_required=True)
    5. Complete challenge with TOTP token (POST /api/v1/auth/mfa/challenge)
    6. Disable MFA with password verification (POST /api/v1/auth/mfa/disable)
    """
    # Use a dedicated test platform owner so lockout tests in other modules
    # cannot affect this independent MFA lifecycle.
    test_admin_email = f"mfa-owner-{uuid.uuid4().hex[:8]}@platform.test"
    test_admin = User(
        email=test_admin_email,
        hashed_password=hash_password("AdminSecurePassword2026!"),
        full_name="MFA Test Platform Owner",
        is_active=True,
        is_superadmin=True,
    )
    db_session.add(test_admin)
    await db_session.commit()

    # 1. Login as the dedicated Platform Super Admin
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"username": test_admin_email, "password": "AdminSecurePassword2026!"}
    )
    assert login_res.status_code == 200, login_res.text
    auth_data = login_res.json()
    assert auth_data["mfa_required"] is False
    token = auth_data["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. Initiate MFA setup
    setup_res = await client.post("/api/v1/auth/mfa/setup", headers=auth_headers)
    assert setup_res.status_code == 200, setup_res.text
    setup_data = setup_res.json()
    secret = setup_data["secret"]
    assert secret is not None
    assert "otpauth://" in setup_data["otpauth_url"]

    # 3. Test verification rejection with invalid TOTP code
    bad_verify_res = await client.post(
        "/api/v1/auth/mfa/verify",
        json={"totp_code": "000000"},
        headers=auth_headers
    )
    assert bad_verify_res.status_code == 400

    # 3b. Test verification success with valid TOTP code
    valid_code = get_totp_token(secret)
    good_verify_res = await client.post(
        "/api/v1/auth/mfa/verify",
        json={"totp_code": valid_code},
        headers=auth_headers
    )
    assert good_verify_res.status_code == 200, good_verify_res.text
    assert good_verify_res.json()["status"] == "SUCCESS"

    # Verify in database
    stmt_user = select(User).where(User.email == test_admin_email)
    user = (await db_session.execute(stmt_user)).scalars().first()
    assert user is not None
    await db_session.refresh(user)
    assert user.mfa_enabled is True
    assert user.mfa_secret == secret

    # 4. Attempt login with MFA enabled -> must return MFA challenge gate
    mfa_login_res = await client.post(
        "/api/v1/auth/login",
        json={"username": test_admin_email, "password": "AdminSecurePassword2026!"}
    )
    assert mfa_login_res.status_code == 200
    mfa_login_data = mfa_login_res.json()
    assert mfa_login_data["access_token"] is None
    assert mfa_login_data["mfa_required"] is True
    assert mfa_login_data["mfa_token"] is not None
    challenge_token = mfa_login_data["mfa_token"]

    # 5. Submit bad challenge code -> 401
    bad_challenge_res = await client.post(
        "/api/v1/auth/mfa/challenge",
        json={"mfa_token": challenge_token, "totp_code": "111111"}
    )
    assert bad_challenge_res.status_code == 401

    # 5b. Submit valid challenge code -> returns full access token
    challenge_valid_code = get_totp_token(secret)
    good_challenge_res = await client.post(
        "/api/v1/auth/mfa/challenge",
        json={"mfa_token": challenge_token, "totp_code": challenge_valid_code}
    )
    assert good_challenge_res.status_code == 200, good_challenge_res.text
    full_token_data = good_challenge_res.json()
    assert full_token_data["access_token"] is not None
    assert full_token_data["mfa_required"] is False
    new_auth_headers = {"Authorization": f"Bearer {full_token_data['access_token']}"}

    # 6. Test disable with bad password -> 401
    bad_disable_res = await client.post(
        "/api/v1/auth/mfa/disable",
        json={"password": "WrongPassword123!"},
        headers=new_auth_headers
    )
    assert bad_disable_res.status_code == 401

    # 6b. Test disable with correct password -> 200
    good_disable_res = await client.post(
        "/api/v1/auth/mfa/disable",
        json={"password": "AdminSecurePassword2026!"},
        headers=new_auth_headers
    )
    assert good_disable_res.status_code == 200
    assert good_disable_res.json()["status"] == "SUCCESS"

    # Verify user state in database
    await db_session.refresh(user)
    assert user.mfa_enabled is False
    assert user.mfa_secret is None

    # 7. Verify subsequent login no longer prompts for MFA
    clean_login_res = await client.post(
        "/api/v1/auth/login",
        json={"username": test_admin_email, "password": "AdminSecurePassword2026!"}
    )
    assert clean_login_res.status_code == 200
    assert clean_login_res.json()["mfa_required"] is False
    assert clean_login_res.json()["access_token"] is not None
