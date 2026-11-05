import uuid
import pytest
import httpx
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.modules.tenants.models import Tenant
from app.modules.identity.models import User
from app.modules.academic.models import AcademicSection


@pytest.mark.asyncio
async def test_01_get_and_update_attendance_config_daily_only(client: httpx.AsyncClient, db_session: AsyncSession):
    """Configuration A: Daily Attendance Only Mode."""
    # Fetch pilot tenant and admin user
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"])))).scalars().first()
    assert tenant is not None
    user = (await db_session.execute(select(User).where(User.is_superadmin == True))).scalars().first()
    assert user is not None

    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-Code": "akshara"}

    # 1. Fetch initial configuration
    res = await client.get("/api/v1/attendance/config", headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "attendance_mode" in data

    # 2. Update to DAILY_ONLY
    update_res = await client.put(
        "/api/v1/attendance/config",
        headers=headers,
        json={
            "attendance_mode": "DAILY_ONLY",
            "enable_late_tracking": True,
            "enable_absence_reasons": True,
            "minimum_attendance_pct": 80.0
        }
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["attendance_mode"] == "DAILY_ONLY"
    assert updated["minimum_attendance_pct"] == 80.0


@pytest.mark.asyncio
async def test_02_period_attendance_rejected_when_mode_is_daily_only(client: httpx.AsyncClient, db_session: AsyncSession):
    """When mode is DAILY_ONLY, period attendance requests must be rejected with HTTP 400."""
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"])))).scalars().first()
    user = (await db_session.execute(select(User).where(User.is_superadmin == True))).scalars().first()
    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-Code": "akshara"}

    # Ensure mode is DAILY_ONLY
    await client.put(
        "/api/v1/attendance/config",
        headers=headers,
        json={"attendance_mode": "DAILY_ONLY"}
    )

    # Attempt period-wise mark
    period_res = await client.post(
        "/api/v1/attendance/periods/mark",
        headers=headers,
        json={
            "section_id": str(uuid.uuid4()),
            "attendance_date": str(date.today()),
            "period_number": 1,
            "period_time": "09:00 - 09:50 AM",
            "subject_code": "PHY-101",
            "subject_name": "Physics",
            "records": [
                {
                    "student_id": str(uuid.uuid4()),
                    "student_name": "Aarav Sharma",
                    "admission_number": "ADM-2026-001",
                    "status": "PRESENT"
                }
            ]
        }
    )
    assert period_res.status_code == 400
    assert "Period-wise attendance is disabled" in period_res.json()["detail"]


@pytest.mark.asyncio
async def test_03_config_b_period_wise_only_mode(client: httpx.AsyncClient, db_session: AsyncSession):
    """Configuration B: Period-wise Attendance Only Mode."""
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"])))).scalars().first()
    user = (await db_session.execute(select(User).where(User.is_superadmin == True))).scalars().first()
    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-Code": "akshara"}

    # Update to PERIOD_WISE_ONLY
    update_res = await client.put(
        "/api/v1/attendance/config",
        headers=headers,
        json={"attendance_mode": "PERIOD_WISE_ONLY"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["attendance_mode"] == "PERIOD_WISE_ONLY"

    # Daily attendance mark must be rejected
    daily_res = await client.post(
        "/api/v1/attendance/daily/mark",
        headers=headers,
        json={
            "section_id": str(uuid.uuid4()),
            "attendance_date": str(date.today()),
            "records": [
                {
                    "student_id": str(uuid.uuid4()),
                    "student_name": "Ananya Hegde",
                    "admission_number": "ADM-2026-002",
                    "status": "PRESENT"
                }
            ]
        }
    )
    assert daily_res.status_code == 400
    assert "PERIOD_WISE_ONLY" in daily_res.json()["detail"]


@pytest.mark.asyncio
async def test_04_config_c_both_daily_and_period_mode(client: httpx.AsyncClient, db_session: AsyncSession):
    """Configuration C: Both Daily and Period-Wise Attendance enabled."""
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"])))).scalars().first()
    user = (await db_session.execute(select(User).where(User.is_superadmin == True))).scalars().first()
    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-Code": "akshara"}

    update_res = await client.put(
        "/api/v1/attendance/config",
        headers=headers,
        json={"attendance_mode": "BOTH"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["attendance_mode"] == "BOTH"

    # In BOTH mode, daily attendance works
    section = (await db_session.execute(select(AcademicSection).where(AcademicSection.tenant_id == tenant.id))).scalars().first()
    if not section:
        section = AcademicSection(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            class_name="Class 10",
            section_code="A",
            max_capacity=40,
            enrolled_count=35
        )
        db_session.add(section)
        await db_session.commit()
        await db_session.refresh(section)

    dummy_std_id = uuid.uuid4()
    daily_res = await client.post(
        "/api/v1/attendance/daily/mark",
        headers=headers,
        json={
            "section_id": str(section.id),
            "attendance_date": str(date.today()),
            "records": [
                {
                    "student_id": str(dummy_std_id),
                    "student_name": "Rohan Verma",
                    "admission_number": "ADM-2026-003",
                    "status": "PRESENT"
                }
            ]
        }
    )
    assert daily_res.status_code == 200

    # And period attendance works
    period_res = await client.post(
        "/api/v1/attendance/periods/mark",
        headers=headers,
        json={
            "section_id": str(section.id),
            "attendance_date": str(date.today()),
            "period_number": 2,
            "period_time": "10:00 - 10:50 AM",
            "subject_code": "BIO-101",
            "subject_name": "Biology",
            "records": [
                {
                    "student_id": str(dummy_std_id),
                    "student_name": "Rohan Verma",
                    "admission_number": "ADM-2026-003",
                    "status": "PRESENT"
                }
            ]
        }
    )
    assert period_res.status_code == 200


@pytest.mark.asyncio
async def test_05_invalid_mode_rejected(client: httpx.AsyncClient, db_session: AsyncSession):
    """Invalid attendance mode must be rejected with HTTP 400."""
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"])))).scalars().first()
    user = (await db_session.execute(select(User).where(User.is_superadmin == True))).scalars().first()
    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-Code": "akshara"}

    bad_res = await client.put(
        "/api/v1/attendance/config",
        headers=headers,
        json={"attendance_mode": "NEITHER"}
    )
    assert bad_res.status_code == 400
    assert "Invalid attendance_mode" in bad_res.json()["detail"]


@pytest.mark.asyncio
async def test_06_daily_dashboard_independent_of_period_wise(client: httpx.AsyncClient, db_session: AsyncSession):
    """Daily dashboard works reliably regardless of whether period attendance is enabled or disabled."""
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"])))).scalars().first()
    user = (await db_session.execute(select(User).where(User.is_superadmin == True))).scalars().first()
    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-Code": "akshara"}

    res = await client.get("/api/v1/attendance/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_strength" in data
    assert "total_present" in data
    assert "total_absent" in data
    assert "overall_attendance_pct" in data
    assert isinstance(data["sections"], list)


@pytest.mark.asyncio
async def test_07_absentee_list_with_privacy(client: httpx.AsyncClient, db_session: AsyncSession):
    """Absent students list provides reasons and authorized details."""
    tenant = (await db_session.execute(select(Tenant).where(Tenant.code.in_(["our-school-demo", "akshara"])))).scalars().first()
    user = (await db_session.execute(select(User).where(User.is_superadmin == True))).scalars().first()
    token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), is_superadmin=True)
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-Code": "akshara"}

    res = await client.get("/api/v1/attendance/absentees", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    first = data[0]
    assert "student_name" in first
    assert "admission_number" in first
    assert "absence_reason" in first
