"""
Automated Alembic Migration and Configuration Safety Tests.
Uses the active Python interpreter and explicit disposable-database credentials,
so the tests work in CI and local virtual environments without assuming .venv.
"""
import os
import subprocess
import sys

import pytest
from sqlalchemy.engine import make_url

from app.core.config import Settings


def _migration_admin_url():
    raw_url = (
        os.getenv("TEST_ADMIN_DATABASE_URL")
        or "postgresql://postgres@127.0.0.1:5433/education_erp_test"
    )
    return make_url(raw_url)


def _psql(sql: str) -> subprocess.CompletedProcess:
    url = _migration_admin_url()
    env = os.environ.copy()
    if url.password is not None:
        env["PGPASSWORD"] = url.password
    command = [
        "psql",
        "-h", url.host or "127.0.0.1",
        "-p", str(url.port or 5432),
        "-U", url.username or "postgres",
        "-d", "postgres",
        "-v", "ON_ERROR_STOP=1",
        "-c", sql,
    ]
    return subprocess.run(command, env=env, capture_output=True, text=True)


def _alembic(api_dir: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "alembic", *args],
        cwd=api_dir,
        capture_output=True,
        text=True,
        env=os.environ.copy(),
    )


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

    valid_key = "x" * 32
    prod_settings = Settings(ENVIRONMENT="production", SECRET_KEY=valid_key)
    assert prod_settings.SECRET_KEY == valid_key


def test_settings_cors_origins_parsing():
    """Verify comma-separated CORS origins and the configured Vercel origin."""
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
    """Verify Alembic detects no model/schema drift in the test database."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    result = _alembic(api_dir, "check")
    assert result.returncode == 0, f"Alembic check failed: {result.stderr or result.stdout}"
    assert "No new upgrade operations detected" in (result.stdout + result.stderr)


def test_alembic_upgrade_downgrade_cycle():
    """Verify migration upgrade, downgrade and re-upgrade on a disposable database."""
    api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))
    cycle_db = "education_erp_mig_cycle_test"
    admin_url = _migration_admin_url()
    cycle_url = admin_url.set(
        drivername="postgresql+asyncpg",
        database=cycle_db,
    ).render_as_string(hide_password=False)

    drop_result = _psql(f'DROP DATABASE IF EXISTS "{cycle_db}" WITH (FORCE);')
    assert drop_result.returncode == 0, f"Could not prepare migration test DB: {drop_result.stderr}"

    create_result = _psql(f'CREATE DATABASE "{cycle_db}";')
    assert create_result.returncode == 0, f"Could not create migration test DB: {create_result.stderr}"

    try:
        up1 = _alembic(api_dir, "-x", f"db_url={cycle_url}", "upgrade", "head")
        assert up1.returncode == 0, f"Upgrade failed: {up1.stderr or up1.stdout}"

        down = _alembic(api_dir, "-x", f"db_url={cycle_url}", "downgrade", "base")
        assert down.returncode == 0, f"Downgrade failed: {down.stderr or down.stdout}"

        up2 = _alembic(api_dir, "-x", f"db_url={cycle_url}", "upgrade", "head")
        assert up2.returncode == 0, f"Re-upgrade failed: {up2.stderr or up2.stdout}"
    finally:
        cleanup = _psql(f'DROP DATABASE IF EXISTS "{cycle_db}" WITH (FORCE);')
        assert cleanup.returncode == 0, f"Could not clean migration test DB: {cleanup.stderr}"
