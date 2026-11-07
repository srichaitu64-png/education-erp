"""
Automated Alembic Migration and Configuration Safety Tests
Tests schema sync, upgrade/downgrade idempotency, and production configuration safety.
"""
import asyncio
import os
import subprocess
import sys
from urllib.parse import urlparse, urlunparse
import asyncpg
import pytest
from app.core.config import settings, Settings


def _required_test_admin_url() -> str:
    """Return only the explicitly configured administrator URL for a disposable test DB."""
    value = settings.TEST_ADMIN_DATABASE_URL
    if not value:
        raise RuntimeError(
            "TEST_ADMIN_DATABASE_URL is mandatory for migration tests; "
            "refusing to fall back to DATABASE_URL."
        )

    database_name = urlparse(value).path.lstrip("/")
    allowed = {
        "education_erp_test",
        "education_erp_mig_cycle_test",
        "education_erp_alembic_check_test",
    }
    if database_name not in allowed:
        raise RuntimeError(
            f"Refusing migration test against non-disposable database '{database_name}'. "
            f"Allowed databases: {sorted(allowed)}"
        )
    return value


def test_settings_secret_key_production_validation():
    """Verify that insecure or short SECRET_KEY is strictly rejected in production."""
    dev_settings = Settings(ENVIRONMENT="development")
    assert dev_settings.SECRET_KEY is not None

    with pytest.raises(ValueError, match="Insecure SECRET_KEY"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="change-this-to-a-secure-random-256-bit-key-in-production"
        )

    with pytest.raises(ValueError, match="Insecure SECRET_KEY"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="short-secret-key"
        )

    valid_key = "x" * 32
    prod_settings = Settings(ENVIRONMENT="production", SECRET_KEY=valid_key)
    assert prod_settings.SECRET_KEY == valid_key


def test_settings_cors_origins_parsing():
    """Verify that CORS origins can be parsed from comma-separated strings and include Vercel origin."""
    default_settings = Settings()
    assert "https://education-erp-nine.vercel.app" in default_settings.ALLOWED_ORIGINS

    custom_origins_settings = Settings(
        ALLOWED_ORIGINS="https://app.educationos.com, https://admin.educationos.com"
    )
    assert custom_origins_settings.ALLOWED_ORIGINS == [
        "https://app.educationos.com",
        "https://admin.educationos.com"
    ]


def test_alembic_check_clean_dev_database():
    """Verify model/schema alignment on a freshly migrated disposable database."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    check_db = "education_erp_alembic_check_test"
    raw_admin_url = _required_test_admin_url().replace("+asyncpg", "")
    parsed = urlparse(raw_admin_url)
    admin_url = urlunparse(parsed._replace(path="/postgres"))
    check_db_url = urlunparse(parsed._replace(scheme="postgresql+asyncpg", path=f"/{check_db}"))

    async def _manage_db(command: str):
        conn = await asyncpg.connect(admin_url)
        try:
            await conn.execute(command)
        finally:
            await conn.close()

    asyncio.run(_manage_db(f"DROP DATABASE IF EXISTS {check_db};"))
    asyncio.run(_manage_db(f"CREATE DATABASE {check_db};"))
    try:
        upgrade = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"db_url={check_db_url}", "upgrade", "heads"],
            cwd=api_dir, capture_output=True, text=True, env=dict(os.environ)
        )
        assert upgrade.returncode == 0, f"Fresh migration failed: {upgrade.stderr or upgrade.stdout}"
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"db_url={check_db_url}", "check"],
            cwd=api_dir, capture_output=True, text=True, env=dict(os.environ)
        )
        assert result.returncode == 0, f"Alembic check failed: {result.stderr or result.stdout}"
        assert "No new upgrade operations detected" in (result.stdout + result.stderr)
    finally:
        asyncio.run(_manage_db(f"DROP DATABASE IF EXISTS {check_db};"))


def test_alembic_upgrade_downgrade_cycle():
    """Verify that Alembic migrations can execute upgrade, downgrade, and re-upgrade without error."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    cycle_db = "education_erp_mig_cycle_test"

    # A dedicated CREATEDB test administrator is required; never use DATABASE_URL.
    raw_url = _required_test_admin_url().replace("+asyncpg", "")
    parsed = urlparse(raw_url)
    admin_url = urlunparse(parsed._replace(path="/postgres"))
    cycle_db_url = urlunparse(parsed._replace(scheme="postgresql+asyncpg", path=f"/{cycle_db}"))

    async def _manage_db(command: str):
        conn = await asyncpg.connect(admin_url)
        try:
            await conn.execute(command)
        finally:
            await conn.close()

    asyncio.run(_manage_db(f"DROP DATABASE IF EXISTS {cycle_db};"))
    asyncio.run(_manage_db(f"CREATE DATABASE {cycle_db};"))

    try:
        up1 = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"db_url={cycle_db_url}", "upgrade", "heads"],
            cwd=api_dir, capture_output=True, text=True, env=dict(os.environ)
        )
        assert up1.returncode == 0, f"Upgrade failed: {up1.stderr or up1.stdout}"

        down = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"db_url={cycle_db_url}", "downgrade", "base"],
            cwd=api_dir, capture_output=True, text=True, env=dict(os.environ)
        )
        assert down.returncode == 0, f"Downgrade failed: {down.stderr or down.stdout}"

        up2 = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", f"db_url={cycle_db_url}", "upgrade", "heads"],
            cwd=api_dir, capture_output=True, text=True, env=dict(os.environ)
        )
        assert up2.returncode == 0, f"Re-upgrade failed: {up2.stderr or up2.stdout}"

    finally:
        try:
            asyncio.run(_manage_db(f"DROP DATABASE IF EXISTS {cycle_db};"))
        except Exception:
            pass
