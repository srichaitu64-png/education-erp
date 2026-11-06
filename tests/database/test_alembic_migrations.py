"""
Automated Alembic Migration and Configuration Safety Tests.
Uses the database service supplied by CI (or TEST_DATABASE_URL locally).
"""
import os
import subprocess
import sys
import uuid
import pytest

import psycopg2
from sqlalchemy.engine import make_url
from app.core.config import Settings


def _api_dir() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api"))


def _alembic(*args: str, db_url: str | None = None) -> subprocess.CompletedProcess:
    command = [sys.executable, "-m", "alembic"]
    if db_url:
        command += ["-x", f"db_url={db_url}"]
    command.extend(args)
    return subprocess.run(command, cwd=_api_dir(), capture_output=True, text=True, env=os.environ.copy())


def _admin_connection():
    raw_url = os.getenv("TEST_ADMIN_DATABASE_URL")
    if not raw_url:
        raise RuntimeError("TEST_ADMIN_DATABASE_URL must be set for isolated migration lifecycle tests")
    url = make_url(raw_url)
    return psycopg2.connect(
        host=url.host or "127.0.0.1",
        port=url.port or 5432,
        user=url.username or "postgres",
        password=url.password or os.getenv("PGPASSWORD"),
        dbname="postgres",
    ), url


def test_settings_secret_key_production_validation():
    """Verify that insecure or short SECRET_KEY is strictly rejected in production."""
    dev_settings = Settings(ENVIRONMENT="development")
    assert dev_settings.SECRET_KEY is not None

    with pytest.raises(ValueError, match="Insecure SECRET_KEY"):
        Settings(ENVIRONMENT="production", SECRET_KEY="change-this-to-a-secure-random-256-bit-key-in-production")

    with pytest.raises(ValueError, match="Insecure SECRET_KEY"):
        Settings(ENVIRONMENT="production", SECRET_KEY="short-secret-key")

    valid_key = "x" * 32
    prod_settings = Settings(ENVIRONMENT="production", SECRET_KEY=valid_key)
    assert prod_settings.SECRET_KEY == valid_key


def test_settings_cors_origins_parsing():
    """Verify that CORS origins can be parsed and include the deployed Vercel origin."""
    default_settings = Settings()
    assert "https://education-erp-nine.vercel.app" in default_settings.ALLOWED_ORIGINS

    custom = Settings(ALLOWED_ORIGINS="https://app.educationos.com, https://admin.educationos.com")
    assert custom.ALLOWED_ORIGINS == ["https://app.educationos.com", "https://admin.educationos.com"]


def test_alembic_check_clean_dev_database():
    """Verify that Alembic detects no schema drift after the CI migration step."""
    result = _alembic("check")
    assert result.returncode == 0, f"Alembic check failed: {result.stderr or result.stdout}"
    assert "No new upgrade operations detected" in (result.stdout + result.stderr)


def test_alembic_upgrade_downgrade_cycle():
    """Verify migration upgrade, downgrade and re-upgrade against an isolated temporary database."""
    admin_conn, base_url = _admin_connection()
    cycle_db = f"erp_mig_{uuid.uuid4().hex[:12]}"
    admin_conn.autocommit = True
    try:
        with admin_conn.cursor() as cursor:
            cursor.execute(f'CREATE DATABASE "{cycle_db}"')
        cycle_url = base_url.set(
            drivername="postgresql+asyncpg",
            database=cycle_db,
        ).render_as_string(hide_password=False)
        up1 = _alembic("upgrade", "head", db_url=cycle_url)
        assert up1.returncode == 0, f"Upgrade failed: {up1.stderr or up1.stdout}"

        down = _alembic("downgrade", "base", db_url=cycle_url)
        assert down.returncode == 0, f"Downgrade failed: {down.stderr or down.stdout}"

        up2 = _alembic("upgrade", "head", db_url=cycle_url)
        assert up2.returncode == 0, f"Re-upgrade failed: {up2.stderr or up2.stdout}"
    finally:
        with admin_conn.cursor() as cursor:
            cursor.execute(f'DROP DATABASE IF EXISTS "{cycle_db}" WITH (FORCE)')
        admin_conn.close()
