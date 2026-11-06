import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.session import get_db, get_current_tenant_id
from app.modules.identity.models import User
from app.modules.subscriptions.schemas import TenantEntitlementsOut, EntitlementItem
from app.modules.subscriptions.service import EntitlementService
from app.modules.tenants.models import Tenant, Campus
from app.modules.tenants.schemas import TenantOut, CampusOut
from app.modules.academic.models import Student, AdmissionApplication, AcademicSection
from app.modules.finance.models import FeeInvoice
from app.modules.attendance.models import DailyAttendanceRecord
from app.modules.examinations.models import Examination
from app.security.deps import get_current_user, require_feature

router = APIRouter(prefix="/institution", tags=["Institution Portal"])


@router.get("/entitlements", response_model=TenantEntitlementsOut)
async def get_my_entitlements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Institution Administrator endpoint:
    Returns the real-time feature locking and entitlement catalog for this institution.
    Features that are not in the plan will have is_enabled=False and show required_plan.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active tenant context is required."
        )

    entitlement_svc = EntitlementService(db)
    data = await entitlement_svc.get_tenant_entitlements(tenant_id)
    return TenantEntitlementsOut(
        tenant_id=data["tenant_id"],
        current_plan=data["current_plan"],
        current_tier=data["current_tier"],
        subscription_status=data["subscription_status"],
        features=[EntitlementItem(**f) for f in data["features"]]
    )


@router.get("/profile", response_model=TenantOut)
async def get_institution_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve branding, campuses, and configuration for the active institution."""
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active tenant context is required."
        )

    stmt = select(Tenant).options(selectinload(Tenant.campuses)).where(Tenant.id == tenant_id)
    res = await db.execute(stmt)
    tenant = res.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    return TenantOut(
        id=tenant.id,
        name=tenant.name,
        code=tenant.code,
        institution_type=tenant.institution_type,
        status=tenant.status,
        email=tenant.email,
        phone=tenant.phone,
        address=tenant.address,
        city=tenant.city,
        state=tenant.state,
        postal_code=tenant.postal_code,
        country=tenant.country,
        primary_color=tenant.primary_color,
        secondary_color=tenant.secondary_color,
        logo_url=tenant.logo_url,
        favicon_url=tenant.favicon_url,
        subdomain=tenant.subdomain,
        custom_domain=tenant.custom_domain,
        campuses=[CampusOut.model_validate(c) for c in tenant.campuses]
    )


# Demonstration & Verification Endpoints for Feature Locking
@router.get("/features/test-starter", dependencies=[Depends(require_feature("admissions.basic"))])
async def access_starter_feature(current_user: User = Depends(get_current_user)):
    """Test endpoint for a Starter plan feature ('admissions.basic')."""
    return {
        "status": "success",
        "message": "Authorized access to Basic Admissions module.",
        "feature_id": "admissions.basic"
    }


@router.get("/features/test-ai-reports", dependencies=[Depends(require_feature("analytics.ai_reports"))])
async def access_enterprise_ai_reports(current_user: User = Depends(get_current_user)):
    """Test endpoint for an Enterprise plan feature ('analytics.ai_reports')."""
    return {
        "status": "success",
        "message": "Authorized access to Enterprise AI Performance Reports.",
        "feature_id": "analytics.ai_reports"
    }


@router.get("/metrics")
async def get_institution_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Return live operational metrics from this tenant's database records.
    Every query is explicitly scoped to the authenticated tenant; no demo values
    or platform-wide totals are returned.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active tenant context is required."
        )

    tenant_result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = tenant_result.scalars().first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    today = date.today()
    enrolled_students = await db.scalar(
        select(func.count(Student.id)).where(
            Student.tenant_id == tenant_id,
            Student.status == "ACTIVE",
        )
    ) or 0
    configured_sections = await db.scalar(
        select(func.count(AcademicSection.id)).where(
            AcademicSection.tenant_id == tenant_id,
            AcademicSection.status == "ACTIVE",
        )
    ) or 0
    pending_admissions = await db.scalar(
        select(func.count(AdmissionApplication.id)).where(
            AdmissionApplication.tenant_id == tenant_id,
            AdmissionApplication.status.in_(["PENDING", "SUBMITTED", "UNDER_REVIEW", "VERIFIED"]),
        )
    ) or 0

    attendance_total = await db.scalar(
        select(func.count(DailyAttendanceRecord.id)).where(
            DailyAttendanceRecord.tenant_id == tenant_id,
            DailyAttendanceRecord.attendance_date == today,
        )
    ) or 0
    attendance_present = await db.scalar(
        select(func.count(DailyAttendanceRecord.id)).where(
            DailyAttendanceRecord.tenant_id == tenant_id,
            DailyAttendanceRecord.attendance_date == today,
            DailyAttendanceRecord.status.in_(["PRESENT", "LATE"]),
        )
    ) or 0
    attendance_pct = round((attendance_present / attendance_total) * 100, 1) if attendance_total else None

    fee_totals = await db.execute(
        select(
            func.coalesce(func.sum(FeeInvoice.net_payable), 0.0),
            func.coalesce(func.sum(FeeInvoice.paid_amount), 0.0),
            func.coalesce(func.sum(FeeInvoice.balance_amount), 0.0),
        ).where(FeeInvoice.tenant_id == tenant_id)
    )
    total_payable, total_collected, outstanding_fees = fee_totals.one()
    total_payable = float(total_payable or 0)
    total_collected = float(total_collected or 0)
    outstanding_fees = float(outstanding_fees or 0)
    fee_collection_pct = round((total_collected / total_payable) * 100, 1) if total_payable else None

    upcoming_exams = await db.scalar(
        select(func.count(Examination.id)).where(
            Examination.tenant_id == tenant_id,
            Examination.exam_date >= today,
            Examination.status != "ARCHIVED",
        )
    ) or 0

    return {
        "tenant_id": str(tenant.id),
        "institution_name": tenant.name,
        "institution_code": tenant.code,
        "data_source": "tenant_database",
        "as_of": datetime.now(timezone.utc).isoformat(),
        "enrolled_students": int(enrolled_students),
        "configured_sections": int(configured_sections),
        "pending_admissions": int(pending_admissions),
        "today_attendance_records": int(attendance_total),
        "today_attendance_pct": attendance_pct,
        "total_fee_payable": total_payable,
        "total_fee_collected": total_collected,
        "outstanding_fees": outstanding_fees,
        "fee_collection_pct": fee_collection_pct,
        "upcoming_examinations": int(upcoming_exams),
    }
