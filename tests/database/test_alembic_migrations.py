"""
Automated Alembic Migration and Configuration Safety Tests
Tests schema sync, upgrade/downgrade idempotency, and production configuration safety.
"""
import os
import subprocess
import pytest
from app.core.config import Settings


def test_settings_secret_key_production_validation():
    """Verify that insecure or short SECRET_KEY is strictly rejected in production."""
    # Development allows default key
    dev_settings = Settings(ENVIRONMENT="development")
    assert dev_settings.SECRET_KEY is not None

    # Production rejects default key
    with pytest.raises(ValueError, match="Insecure SECRET_KEY"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="change-this-to-a-secure-random-256-bit-key-in-production"
        )

    # Production rejects short key
    with pytest.raises(ValueError, match="Insecure SECRET_KEY"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="short-secret-key"
        )

    # Production accepts valid 32+ character key
    valid_key = "x" * 32
    prod_settings = Settings(
        ENVIRONMENT="production",
        SECRET_KEY=valid_key
    )
    assert prod_settings.SECRET_KEY == valid_key


def test_settings_cors_origins_parsing():
    """Verify that CORS origins can be parsed from comma-separated strings and include Vercel origin."""
    default_settings = Settings()
    assert "https://education-erp-nine.vercel.app" in default_settings.ALLOWED_ORIGINS

    # Test comma-separated string parsing
    custom_origins_settings = Settings(
        ALLOWED_ORIGINS="https://app.educationos.com, https://admin.educationos.com"
    )
    assert custom_origins_settings.ALLOWED_ORIGINS == [
        "https://app.educationos.com",
        "https://admin.educationos.com"
    ]


def test_alembic_check_clean_dev_database():
    """Verify that alembic check detects zero discrepancies between SQLAlchemy models and DB schema."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    result = subprocess.run(
        ["./.venv/bin/alembic", "check"],
        cwd=api_dir,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Alembic check failed: {result.stderr or result.stdout}"
    assert "No new upgrade operations detected" in (result.stdout + result.stderr)


def test_alembic_upgrade_downgrade_cycle():
    """Verify that Alembic migrations can execute upgrade, downgrade, and re-upgrade without error."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    cycle_db = "education_erp_mig_cycle_test"
    db_url = f"postgresql+asyncpg://postgres@127.0.0.1:5433/{cycle_db}"

    # Create temporary database
    subprocess.run(
        ["psql", "-h", "127.0.0.1", "-p", "5433", "-U", "postgres", "-c", f"DROP DATABASE IF EXISTS {cycle_db};"],
        check=True,
        capture_output=True
    )
    subprocess.run(
        ["psql", "-h", "127.0.0.1", "-p", "5433", "-U", "postgres", "-c", f"CREATE DATABASE {cycle_db};"],
        check=True,
        capture_output=True
    )

    try:
        # 1. Upgrade to head
        up1 = subprocess.run(
            ["./.venv/bin/alembic", "-x", f"db_url={db_url}", "upgrade", "head"],
            cwd=api_dir,
            capture_output=True,
            text=True
        )
        assert up1.returncode == 0, f"Upgrade failed: {up1.stderr}"

        # 2. Downgrade to base
        down = subprocess.run(
            ["./.venv/bin/alembic", "-x", f"db_url={db_url}", "downgrade", "base"],
            cwd=api_dir,
            capture_output=True,
            text=True
        )
        assert down.returncode == 0, f"Downgrade failed: {down.stderr}"

        # 3. Re-upgrade to head
        up2 = subprocess.run(
            ["./.venv/bin/alembic", "-x", f"db_url={db_url}", "upgrade", "head"],
            cwd=api_dir,
            capture_output=True,
            text=True
        )
        assert up2.returncode == 0, f"Re-upgrade failed: {up2.stderr}"

    finally:
        # Cleanup temporary database
        subprocess.run(
            ["psql", "-h", "127.0.0.1", "-p", "5433", "-U", "postgres", "-c", f"DROP DATABASE IF EXISTS {cycle_db};"],
            capture_output=True
        )

