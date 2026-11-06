from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from .models import (
    AuditEvent, Base, Deployment, Institution, ModuleEntitlement,
    Rollout, SoftwareRelease, Subscription, SupportGrant,
)
from .security import issue_license, require_platform_admin

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./control-plane.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
AUTO_CREATE_SCHEMA = os.getenv("AUTO_CREATE_SCHEMA", "false").lower() == "true"

app = FastAPI(
    title="EducationOS Control Plane",
    version="0.1.0",
    description="Central software, deployment, subscription and release control. It must never store student or staff records.",
)


@app.on_event("startup")
def startup() -> None:
    if AUTO_CREATE_SCHEMA:
        if os.getenv("ENVIRONMENT", "development") == "production":
            raise RuntimeError("AUTO_CREATE_SCHEMA is forbidden in production; apply reviewed migrations.")
        Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def audit(db: Session, actor: str, action: str, resource_type: str, resource_id: str, metadata: dict | None = None):
    db.add(AuditEvent(
        actor=actor, action=action, resource_type=resource_type,
        resource_id=resource_id, metadata_json=metadata or {},
    ))


class InstitutionCreate(BaseModel):
    code: str = Field(min_length=3, max_length=48, pattern=r"^[A-Z0-9-]+$")
    name: str = Field(min_length=2, max_length=200)
    institution_type: Literal["SCHOOL", "PU_COLLEGE", "DEGREE_COLLEGE", "UNIVERSITY", "TRUST"]
    deployment_mode: Literal["managed", "customer_cloud"]
    cloud_provider: str | None = Field(default=None, max_length=32)
    cloud_account_ref: str | None = Field(default=None, max_length=200)
    primary_domain: str | None = Field(default=None, max_length=253)


class DeploymentCreate(BaseModel):
    region: str = Field(default="ap-south-1", min_length=2, max_length=64)
    endpoint: str | None = None
    database_secret_ref: str | None = None
    storage_secret_ref: str | None = None
    desired_version: str = "1.0.0"


class SubscriptionCreate(BaseModel):
    plan_code: str = Field(min_length=2, max_length=40)
    starts_at: datetime
    ends_at: datetime
    grace_days: int = Field(default=7, ge=0, le=30)


class ModuleUpdate(BaseModel):
    modules: list[str] = Field(default_factory=list, max_length=100)


class ReleaseCreate(BaseModel):
    version: str = Field(min_length=3, max_length=40)
    image_digest: str = Field(pattern=r"^sha256:[a-f0-9]{64}$")
    signature_ref: str = Field(min_length=5, max_length=500)
    channel: Literal["stable", "pilot", "canary"] = "stable"
    migration_level: str = Field(min_length=1, max_length=80)


class RolloutCreate(BaseModel):
    release_id: str
    channel: Literal["stable", "pilot", "canary"] = "canary"
    stage: Literal["INTERNAL", "PILOT", "CANARY", "BROAD", "COMPLETE"] = "INTERNAL"
    percentage: int = Field(default=1, ge=1, le=100)


class SupportGrantCreate(BaseModel):
    institution_id: str
    requested_by: str = Field(min_length=2, max_length=160)
    reason: str = Field(min_length=10, max_length=2000)
    scopes: list[str] = Field(min_length=1, max_length=10)
    duration_minutes: int = Field(default=30, ge=5, le=120)


def model_dict(row):
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "educationos-control-plane"}


@app.get("/platform/v1/dashboard", dependencies=[Depends(require_platform_admin)])
def dashboard(db: Session = Depends(get_db)):
    return {
        "institutions": db.scalar(select(func.count()).select_from(Institution)) or 0,
        "active_subscriptions": db.scalar(select(func.count()).select_from(Subscription).where(Subscription.status == "ACTIVE")) or 0,
        "deployments": db.scalar(select(func.count()).select_from(Deployment)) or 0,
        "pending_support_requests": db.scalar(select(func.count()).select_from(SupportGrant).where(SupportGrant.status == "PENDING")) or 0,
    }


@app.post("/platform/v1/institutions", status_code=201, dependencies=[Depends(require_platform_admin)])
def create_institution(payload: InstitutionCreate, db: Session = Depends(get_db)):
    if db.scalar(select(Institution).where(Institution.code == payload.code)):
        raise HTTPException(409, "Institution code already exists")
    if payload.deployment_mode == "customer_cloud" and not payload.cloud_account_ref:
        raise HTTPException(422, "Customer-cloud deployments require a non-secret cloud account reference")
    row = Institution(**payload.model_dump(), status="PENDING")
    db.add(row)
    db.flush()
    audit(db, "platform-admin", "institution.created", "institution", row.id, {"code": row.code, "deployment_mode": row.deployment_mode})
    db.commit()
    return model_dict(row)


@app.get("/platform/v1/institutions", dependencies=[Depends(require_platform_admin)])
def list_institutions(db: Session = Depends(get_db), limit: int = 100, offset: int = 0):
    if not 1 <= limit <= 500 or offset < 0:
        raise HTTPException(422, "Invalid pagination")
    rows = db.scalars(select(Institution).order_by(Institution.created_at.desc()).limit(limit).offset(offset)).all()
    return [model_dict(row) for row in rows]


@app.post("/platform/v1/institutions/{institution_id}/deployments", status_code=202, dependencies=[Depends(require_platform_admin)])
def request_deployment(institution_id: str, payload: DeploymentCreate, db: Session = Depends(get_db)):
    institution = db.get(Institution, institution_id)
    if not institution:
        raise HTTPException(404, "Institution not found")
    if institution.deployment_mode == "customer_cloud" and not institution.cloud_account_ref:
        raise HTTPException(409, "Customer cloud account is not linked")
    if db.scalar(select(Deployment).where(Deployment.institution_id == institution_id)):
        raise HTTPException(409, "A deployment is already registered for this institution")
    row = Deployment(institution_id=institution_id, mode=institution.deployment_mode, **payload.model_dump(), status="REQUESTED")
    db.add(row)
    db.flush()
    audit(db, "platform-admin", "deployment.requested", "deployment", row.id, {"mode": row.mode, "region": row.region})
    db.commit()
    return {"deployment": model_dict(row), "provisioning": "QUEUED_FOR_PROVIDER_ADAPTER"}


@app.post("/platform/v1/institutions/{institution_id}/subscriptions", status_code=201, dependencies=[Depends(require_platform_admin)])
def set_subscription(institution_id: str, payload: SubscriptionCreate, db: Session = Depends(get_db)):
    if not db.get(Institution, institution_id):
        raise HTTPException(404, "Institution not found")
    if payload.ends_at <= payload.starts_at:
        raise HTTPException(422, "Subscription end must be after start")
    row = Subscription(institution_id=institution_id, status="ACTIVE", **payload.model_dump())
    db.add(row)
    audit(db, "platform-admin", "subscription.created", "institution", institution_id, {"plan": payload.plan_code})
    db.commit()
    return model_dict(row)


@app.put("/platform/v1/institutions/{institution_id}/modules", dependencies=[Depends(require_platform_admin)])
def set_modules(institution_id: str, payload: ModuleUpdate, db: Session = Depends(get_db)):
    if not db.get(Institution, institution_id):
        raise HTTPException(404, "Institution not found")
    existing = {row.module_code: row for row in db.scalars(select(ModuleEntitlement).where(ModuleEntitlement.institution_id == institution_id)).all()}
    for code, row in existing.items():
        row.enabled = code in set(payload.modules)
    for code in set(payload.modules) - set(existing):
        db.add(ModuleEntitlement(institution_id=institution_id, module_code=code, enabled=True))
    audit(db, "platform-admin", "modules.updated", "institution", institution_id, {"modules": sorted(set(payload.modules))})
    db.commit()
    return {"institution_id": institution_id, "enabled_modules": sorted(set(payload.modules))}


@app.post("/platform/v1/institutions/{institution_id}/licenses", dependencies=[Depends(require_platform_admin)])
def issue_institution_license(institution_id: str, db: Session = Depends(get_db)):
    institution = db.get(Institution, institution_id)
    if not institution:
        raise HTTPException(404, "Institution not found")
    deployment = db.scalar(select(Deployment).where(Deployment.institution_id == institution_id))
    subscription = db.scalar(select(Subscription).where(Subscription.institution_id == institution_id, Subscription.status == "ACTIVE").order_by(Subscription.created_at.desc()))
    if not deployment or not subscription:
        raise HTTPException(409, "An active deployment and subscription are required")
    modules = db.scalars(select(ModuleEntitlement.module_code).where(ModuleEntitlement.institution_id == institution_id, ModuleEntitlement.enabled.is_(True))).all()
    token = issue_license(institution_id=institution_id, plan_code=subscription.plan_code, modules=list(modules), expires_at=subscription.ends_at, deployment_id=deployment.id)
    audit(db, "platform-admin", "license.issued", "deployment", deployment.id, {"plan": subscription.plan_code})
    db.commit()
    return {"license_token": token, "expires_at": subscription.ends_at, "deployment_id": deployment.id}


@app.post("/platform/v1/releases", status_code=201, dependencies=[Depends(require_platform_admin)])
def publish_release(payload: ReleaseCreate, db: Session = Depends(get_db)):
    if db.scalar(select(SoftwareRelease).where(SoftwareRelease.version == payload.version)):
        raise HTTPException(409, "Release version already exists")
    row = SoftwareRelease(**payload.model_dump(), status="PUBLISHED")
    db.add(row)
    db.flush()
    audit(db, "platform-admin", "release.published", "release", row.id, {"version": row.version, "channel": row.channel})
    db.commit()
    return model_dict(row)


@app.post("/platform/v1/rollouts", status_code=202, dependencies=[Depends(require_platform_admin)])
def plan_rollout(payload: RolloutCreate, db: Session = Depends(get_db)):
    release = db.get(SoftwareRelease, payload.release_id)
    if not release or release.status != "PUBLISHED":
        raise HTTPException(404, "Published release not found")
    row = Rollout(**payload.model_dump(), status="PLANNED")
    db.add(row)
    db.flush()
    audit(db, "platform-admin", "rollout.planned", "rollout", row.id, {"release": release.version, "percentage": row.percentage})
    db.commit()
    return {"rollout": model_dict(row), "execution": "REQUIRES_DEPLOYMENT_WORKER"}


@app.post("/platform/v1/support-grants", status_code=201, dependencies=[Depends(require_platform_admin)])
def request_support_grant(payload: SupportGrantCreate, db: Session = Depends(get_db)):
    if not db.get(Institution, payload.institution_id):
        raise HTTPException(404, "Institution not found")
    row = SupportGrant(
        institution_id=payload.institution_id, requested_by=payload.requested_by,
        reason=payload.reason, scopes=payload.scopes,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=payload.duration_minutes),
        status="PENDING",
    )
    db.add(row)
    db.flush()
    audit(db, "platform-admin", "support.requested", "support_grant", row.id, {"scopes": payload.scopes})
    db.commit()
    return model_dict(row)


@app.post("/platform/v1/support-grants/{grant_id}/approve", dependencies=[Depends(require_platform_admin)])
def approve_support_grant(grant_id: str, db: Session = Depends(get_db)):
    row = db.get(SupportGrant, grant_id)
    if not row or row.status != "PENDING":
        raise HTTPException(404, "Pending support request not found")
    if row.expires_at <= datetime.now(timezone.utc):
        row.status = "EXPIRED"
        db.commit()
        raise HTTPException(409, "Support request has expired")
    row.approved_by = "platform-admin"
    row.status = "APPROVED"
    audit(db, "platform-admin", "support.approved", "support_grant", row.id, {"scopes": row.scopes})
    db.commit()
    # Approval is an auditable grant record; it does not itself create a remote login/session.
    return model_dict(row)


@app.post("/platform/v1/support-grants/{grant_id}/revoke", dependencies=[Depends(require_platform_admin)])
def revoke_support_grant(grant_id: str, db: Session = Depends(get_db)):
    row = db.get(SupportGrant, grant_id)
    if not row:
        raise HTTPException(404, "Support grant not found")
    row.revoked_at = datetime.now(timezone.utc)
    row.status = "REVOKED"
    audit(db, "platform-admin", "support.revoked", "support_grant", row.id)
    db.commit()
    return model_dict(row)
