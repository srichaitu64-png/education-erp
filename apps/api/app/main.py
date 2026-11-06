from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import engine, AsyncSessionLocal
from app.database.seed import seed_initial_data
from app.middleware.tenant import TenantResolutionMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.platform import router as platform_router
from app.api.v1.institution import router as institution_router
from app.api.v1.examinations import router as examinations_router
from app.api.v1.finance import router as finance_router
from app.api.v1.academic import router as academic_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.migration import router as migration_router
from app.api.v1.leads import router as leads_router

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle handler."""
    # Schema creation and tenant RLS are managed exclusively by Alembic migrations.
    # The API process must never mutate production schema during application startup.

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
app.include_router(academic_router, prefix=settings.API_V1_STR)
app.include_router(attendance_router, prefix=settings.API_V1_STR)
app.include_router(migration_router, prefix=settings.API_V1_STR)
app.include_router(leads_router, prefix=settings.API_V1_STR)


@app.middleware("http")
async def add_security_headers_middleware(request: Request, call_next):
    """Enforce production security headers on all HTTP responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.get("/health", tags=["System Health"])
@app.get("/api/v1/health", tags=["System Health"])
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
