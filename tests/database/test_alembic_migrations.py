"""
Automated Alembic Migration and Configuration Safety Tests.
Use the same configured PostgreSQL endpoint as CI and the active Python interpreter.
"""
import os
import subprocess
import sys

import pytest
from sqlalchemy.engine import make_url

from app.core.config import Settings, settings


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
        Settings(ENVIRONMENT="production", SECRET_KEY="short-secret-key")

    with pytest.raises(ValueError, match="Insecure SECRET_KEY"):
        Settings(ENVIRONMENT="production", SECRET_KEY="REPLACE_WITH_A_RANDOM_SECRET_KEY_32_CHARS")

    valid_key = "x" * 32
    prod_settings = Settings(ENVIRONMENT="production", SECRET_KEY=valid_key)
    assert prod_settings.SECRET_KEY == valid_key


def test_settings_cors_origins_parsing():
    """Verify comma-separated CORS origins parsing and the configured Vercel origin."""
    default_settings = Settings()
    assert "https://education-erp-nine.vercel.app" in default_settings.ALLOWED_ORIGINS

    custom = Settings(
        ALLOWED_ORIGINS="https://app.educationos.com, https://admin.educationos.com"
    )
    assert custom.ALLOWED_ORIGINS == [
        "https://app.educationos.com",
        "https://admin.educationos.com"
    ]


def test_alembic_check_clean_dev_database():
    """Verify Alembic detects no schema drift on the configured test database."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "check"],
        cwd=api_dir,
        env=os.environ.copy(),
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Alembic check failed: {result.stderr or result.stdout}"
    assert "No new upgrade operations detected" in (result.stdout + result.stderr)


def test_alembic_upgrade_downgrade_cycle():
    """Verify migrations upgrade, downgrade, and re-upgrade on an isolated database."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    base_url = make_url(settings.TEST_DATABASE_URL)
    cycle_db = "education_erp_mig_cycle_test"
    cycle_url = base_url.set(database=cycle_db).render_as_string(hide_password=False)

    psql_env = os.environ.copy()
    if base_url.password:
        psql_env["PGPASSWORD"] = base_url.password

    psql_base = [
        "psql",
        "-h", base_url.host or "127.0.0.1",
        "-p", str(base_url.port or 5432),
        "-U", base_url.username or "postgres",
        "-d", "postgres",
    ]

    subprocess.run(
        psql_base + ["-c", f'DROP DATABASE IF EXISTS "{cycle_db}";'],
        check=True,
        capture_output=True,
        env=psql_env
    )
    subprocess.run(
        psql_base + ["-c", f'CREATE DATABASE "{cycle_db}";'],
        check=True,
        capture_output=True,
        env=psql_env
    )

    alembic = [sys.executable, "-m", "alembic"]
    try:
        up1 = subprocess.run(
            alembic + ["-x", f"db_url={cycle_url}", "upgrade", "head"],
            cwd=api_dir,
            env=os.environ.copy(),
            capture_output=True,
            text=True
        )
        assert up1.returncode == 0, f"Upgrade failed: {up1.stderr or up1.stdout}"

        down = subprocess.run(
            alembic + ["-x", f"db_url={cycle_url}", "downgrade", "base"],
            cwd=api_dir,
            env=os.environ.copy(),
            capture_output=True,
            text=True
        )
        assert down.returncode == 0, f"Downgrade failed: {down.stderr or down.stdout}"

        up2 = subprocess.run(
            alembic + ["-x", f"db_url={cycle_url}", "upgrade", "head"],
            cwd=api_dir,
            env=os.environ.copy(),
            capture_output=True,
            text=True
        )
        assert up2.returncode == 0, f"Re-upgrade failed: {up2.stderr or up2.stdout}"
    finally:
        subprocess.run(
            psql_base + ["-c", f'DROP DATABASE IF EXISTS "{cycle_db}";'],
            capture_output=True,
            env=psql_env
        )
