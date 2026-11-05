import base64
import hashlib
import hmac
import secrets
import struct
import time
from urllib.parse import quote


def generate_totp_secret(num_bytes: int = 20) -> str:
    """Generate a high-entropy Base32-encoded RFC 6238 TOTP secret."""
    raw = secrets.token_bytes(num_bytes)
    return base64.b32encode(raw).decode("utf-8").rstrip("=")


def get_totp_token(secret: str, interval: int = 30) -> str:
    """Derive current 6-digit TOTP code for a secret."""
    padding = "=" * ((8 - len(secret) % 8) % 8)
    key = base64.b32decode((secret + padding).encode("utf-8"), casefold=True)
    counter = int(time.time()) // interval
    msg = struct.pack(">Q", counter)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    offset = h[19] & 15
    code = (struct.unpack(">I", h[offset : offset + 4])[0] & 0x7FFFFFFF) % 1000000
    return f"{code:06d}"


def verify_totp_token(secret: str, token: str, window: int = 1, interval: int = 30) -> bool:
    """
    Verify a user-provided 6-digit TOTP code.
    Allows clock-drift tolerance of ±window intervals (default ±30s).
    """
    if not secret or not token or len(token.strip()) != 6:
        return False

    try:
        padding = "=" * ((8 - len(secret) % 8) % 8)
        key = base64.b32decode((secret + padding).encode("utf-8"), casefold=True)
        current = int(time.time()) // interval
        token_clean = token.strip()

        for step in range(-window, window + 1):
            msg = struct.pack(">Q", current + step)
            h = hmac.new(key, msg, hashlib.sha1).digest()
            offset = h[19] & 15
            code = (struct.unpack(">I", h[offset : offset + 4])[0] & 0x7FFFFFFF) % 1000000
            if f"{code:06d}" == token_clean:
                return True
        return False
    except Exception:
        return False


def generate_otpauth_uri(secret: str, email: str, issuer: str = "EducationOS") -> str:
    """Generate standard RFC 6238 otpauth:// URI for authenticator app enrollment."""
    encoded_issuer = quote(issuer)
    encoded_email = quote(email)
    return f"otpauth://totp/{encoded_issuer}:{encoded_email}?secret={secret}&issuer={encoded_issuer}&algorithm=SHA1&digits=6&period=30"

