from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine, AsyncSessionLocal
from app.database.seed import seed_initial_data
from app.database.rls import enable_row_level_security
from app.middleware.tenant import TenantResolutionMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.platform import router as platform_router
from app.api.v1.institution import router as institution_router
from app.api.v1.examinations import router as examinations_router
from app.api.v1.finance import router as finance_router

# Import all models to ensure they register on Base.metadata
from app.modules.tenants.models import Tenant, Campus, TenantDomain
from app.modules.identity.models import (
    User,
    Role,
    Permission,
    UserRole,
    PermissionChangeAudit,
    UserPermissionOverride,
    DashboardLayoutConfig,
    PermissionChangeRequest
)
from app.modules.subscriptions.models import (
    SubscriptionPlan,
    FeatureCatalog,
    PlanFeature,
    Subscription,
    TenantFeatureOverride,
    FeatureUsage,
    SubscriptionAuditLog
)
from app.modules.examinations.models import (
    Examination,
    ExamAttendanceAndMarks,
    OfflineSyncQueue,
    ExternalExamProviderConfig,
    ExamApprovalAudit
)
from app.modules.finance.models import (
    FeeStructure,
    FeeInvoice,
    FeePayment,
    FeeReceipt,
    ReceiptAuditLog
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle handler."""
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await enable_row_level_security(conn)

    # Seed initial platform features, subscription plans, roles and superadmin
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)

    yield

    # Clean shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Multi-Tenant Education ERP SaaS Platform - Commercial API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Multi-tenant context and isolation middleware
app.add_middleware(TenantResolutionMiddleware)

# API Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(platform_router, prefix=settings.API_V1_STR)
app.include_router(institution_router, prefix=settings.API_V1_STR)
app.include_router(examinations_router, prefix=settings.API_V1_STR)
app.include_router(finance_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System Health"])
async def health_check():
    """System health and heartbeat check."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Safety net exception handler preventing leakage of sensitive stack traces."""
    # In production, log error with correlation ID and return clean JSON
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected server error occurred. Please contact system support.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None
        }
    )
