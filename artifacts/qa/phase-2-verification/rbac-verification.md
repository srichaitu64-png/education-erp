# Role-Based Access Control (RBAC) & Security Verification

## 1. Frontend Boundary Protection
- Defense-in-depth sanitization in `InteractiveDemoPage.tsx` intercepts unauthorized tab query parameters and resets them to `dashboard`.
- Direct URL navigation (e.g., `?role=TEACHER&tab=fees`) safely rewrites the URL to `tab=dashboard`.

## 2. Independent Backend API Authorization
- Authenticated API calls from `teacher.physics@akshara.edu.in` to `/api/v1/finance/structures` return **HTTP 403 Forbidden**.
- Cross-tenant queries are blocked at the database level by PostgreSQL Row-Level Security policies.
