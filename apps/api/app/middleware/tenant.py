import uuid
from typing import Optional
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from app.core.config import settings
from app.database.session import set_current_tenant_id


class TenantResolutionMiddleware(BaseHTTPMiddleware):
    """
    Middleware that inspects incoming requests, resolves the tenant from the Host header
    or custom domains, and establishes tenant isolation context.
    Ensures browser-supplied tenant identifiers are never trusted blindly.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Reset tenant context for this request cycle
        set_current_tenant_id(None)

        # Allow CORS preflight requests without tenant resolution
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip tenant check for health checks and API documentation
        path = request.url.path
        if path in ("/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        # Host-based resolution (subdomain or custom domain)
        host = request.headers.get("host", "").split(":")[0].lower()
        subdomain: Optional[str] = None

        if host.endswith(f".{settings.BASE_DOMAIN.lower()}"):
            subdomain = host.replace(f".{settings.BASE_DOMAIN.lower()}", "")
        elif host == settings.BASE_DOMAIN.lower() or host in ("localhost", "127.0.0.1"):
            # Root platform domain or local dev direct IP
            subdomain = None

        # Store resolved subdomain in request state for downstream handlers
        request.state.subdomain = subdomain
        request.state.host = host

        # Process the request
        try:
            response = await call_next(request)
            return response
        finally:
            # Clean up context after request completion
            set_current_tenant_id(None)
