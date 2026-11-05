# Stage 1 Audit: Current Architecture & Technical Stack

**Document:** `AUDIT_REPORTS/CURRENT_ARCHITECTURE_AUDIT.md`  
**Evaluation Scope:** Frontend Structure, Backend Framework, Database Topology, State Management, Authentication Mechanics, and Multi-Tenancy Architecture.  
**Execution Timestamp:** 2026-11-05T07:10:00+05:30  
**Status:** IMPLEMENTED AND VERIFIED (Core) / PARTIALLY IMPLEMENTED (Auxiliary)  

---

## 1. High-Level Architectural Overview

EducationOS is architected as a modern, decoupled web application consisting of a React 18 Single Page Application (SPA) on the frontend, a high-concurrency asynchronous FastAPI service on the backend, and an enterprise PostgreSQL 16 database running with async connection pooling.

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                         |
|                                                                                         |
|   React 18 + TypeScript + Vite 6 + Tailwind CSS                                         |
|   - Marketing & Public Site: /, /features, /modules, /pricing, /register               |
|   - Interactive Demo Sandbox: /demo (Zustand client store + Bento UI)                   |
|   - Dedicated Platform Owner Portal: /platform/*                                        |
|   - Dedicated Authenticated Institution ERP: /app/*                                     |
|   - Authentication Portals: /platform/login and /login                                  |
+--------------------------------------------+--------------------------------------------+
                                             | HTTP/REST (JSON + Bearer JWT)
                                             v
+-----------------------------------------------------------------------------------------+
|                                  API GATEWAY & SERVICE                                  |
|                                                                                         |
|   FastAPI 0.110+ (Python 3.12, Uvicorn ASGI Server)                                     |
|   - TenantResolutionMiddleware: Extracts tenant context from headers & subdomains      |
|   - Security Layer: Argon2id password hashing, PyJWT, Redis session blacklisting        |
|   - Core Modules: /auth, /platform, /institution, /academic, /attendance, /finance     |
|   - Pytest Suite: 56 automated regression tests passing in 34.29s                       |
+--------------------------------------------+--------------------------------------------+
                                             | Async Engine (asyncpg driver)
                                             v
+-----------------------------------------------------------------------------------------+
|                                   DATA STORAGE LAYER                                    |
|                                                                                         |
|   PostgreSQL 16 (Local Port 5433 / Docker Service)                                      |
|   - Multi-Tenant Schema: TenantBaseModel enforces indexed tenant_id on all tables       |
|   - Row-Level Security: Session variable app.current_tenant_id enforced via RLS        |
|   - Connection Pool: pool_size=15, max_overflow=20, pool_pre_ping=True                  |
|   - In-Memory Cache: Redis 7 for user token revocation and brute-force lockout tracking|
+-----------------------------------------------------------------------------------------+
```

---

## 2. Frontend Architecture Inspection

### Core Dependencies & Versions (`apps/web/package.json`):
- **Framework:** React `18.3.1` with `react-dom` `18.3.1`
- **Build Tool:** Vite `6.4.5` (Production bundle: `1,163.11 kB` JS, `81.92 kB` CSS in 11.41s)
- **Language:** TypeScript `5.5.3` (Strict mode: 0 compile errors)
- **Routing:** `react-router-dom` `6.26.2`
- **State Management:** `zustand` `4.5.5`
- **Data Fetching:** `@tanstack/react-query` `5.56.2`
- **Styling:** `tailwindcss` `3.4.11`, `clsx`, `tailwind-merge`
- **Icons:** `lucide-react` `0.441.0`

### Route Inventory (`apps/web/src/App.tsx`):
1. **Public Marketing Pages:**
   - `/`: `HomePage`
   - `/features`: `FeaturesPage`
   - `/modules`: `ModulesPage`
   - `/pricing`: `PricingPage`
   - `/pricing/compare`: `SubscriptionComparisonPage`
   - `/testimonials`: `TestimonialsPage`
   - `/faq`: `FaqPage`
   - `/book-demo`: `BookDemoPage`
   - `/register`: `RegisterInstitutionPage`
   - `/about`: `AboutPage`
   - `/contact`: `ContactPage`
2. **Interactive Demonstration Sandbox:**
   - `/demo`: `InteractiveDemoPage` (Role switcher, Bento metric cards, offline simulation)
3. **Authentication Pages:**
   - `/login`: `LoginPage` (Institution login)
   - `/platform/login`: `PlatformLoginPage` (Platform Owner / Super Admin login)
4. **Platform Owner Route Group (Protected):**
   - `/platform`: `SuperAdminDashboard`
   - `/platform/entitlements`: `EntitlementsManager`
   - `/platform/*`: `SuperAdminDashboard`
5. **Institutional ERP Route Group (Protected):**
   - `/app`: `InstitutionDashboard`
   - `/app/*`: `InstitutionDashboard` (Sub-routes for `/students`, `/fees`, `/attendance`, `/exams`, etc.)

---

## 3. Backend Architecture Inspection

### Core Dependencies (`apps/api/requirements.txt`):
- **Framework:** `fastapi>=0.110.0`
- **Server:** `uvicorn[standard]>=0.28.0`
- **ORM & Database:** `sqlalchemy[asyncio]>=2.0.28`, `asyncpg>=0.29.0`, `psycopg2-binary>=2.9.9`
- **Validation:** `pydantic>=2.6.4`, `pydantic-settings>=2.2.1`
- **Security:** `passlib[argon2]>=1.7.4`, `argon2-cffi>=23.1.0`, `python-jose[cryptography]>=3.3.0`
- **Cache:** `redis>=5.0.2`
- **Testing:** `pytest>=8.1.1`, `pytest-asyncio>=0.23.5`, `httpx>=0.27.0`

### API Endpoint Inventory (`apps/api/app/api/v1/`):
- `auth.py`: `/api/v1/auth/*` (Login, refresh, password change, reset requests, session revocation, first-login setup)
- `platform.py`: `/api/v1/platform/*` (Tenants list/create, subscription plans, tenant entitlements override/revoke, platform revenue metrics)
- `institution.py`: `/api/v1/institution/*` (Profile, campuses, academic years, departments)
- `academic.py`: `/api/v1/academic/*` (Sections, enrolments, section transfer, staff duties)
- `attendance.py`: `/api/v1/attendance/*` (Mode config, daily roll-call, period records, biometric punches, absentee list)
- `finance.py`: `/api/v1/finance/*` (Fee structures, invoices, payments, auto-receipts, consolidated report snapshots)
- `examinations.py`: `/api/v1/examinations/*` (Exam definitions, marks entry, hall tickets, result publication gate)

---

## 4. Multi-Tenancy & Database Architecture

### Isolation Mechanics:
1. **Model Inheritance:** Every tenant-owned table inherits from `TenantBaseModel` (`apps/api/app/database/base.py`), which mandates an indexed `tenant_id` foreign key referencing `tenants.id`.
2. **Context Resolution:** `TenantResolutionMiddleware` intercepts incoming requests, inspecting:
   - Header: `X-Tenant-ID`
   - Subdomain: e.g., `akshara.erp.local`
   It stores the active tenant UUID in a thread-safe `contextvars.ContextVar` (`current_tenant_context`).
3. **Database Session Binding:** Upon checking out a pooled database connection in `get_db()`, the session executes:
   `SELECT set_config('app.current_tenant_id', :tenant_id, true)`
4. **Row-Level Security (RLS):** Enabled via `apps/api/app/database/rls.py`. Any query executed by the non-superuser application role `erp_app` automatically filters records matching `tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid`.

---

## 5. Architectural Gaps & Disconnects

1. **The Core UI-API Disconnect (`GAP-INT-01`):**
   While the backend endpoints are robust, verified by 56 tests, and enforce database RLS, the institutional frontend `/app/*` (`InstitutionDashboard.tsx`) binds form submissions and table data to client-side Zustand store (`useDemoStore`) rather than calling Axios/React Query hooks.
2. **Missing RLS on 5 Academic Tables (`GAP-RLS-01`):**
   Five recently added academic tables (`academic_sections`, `student_section_enrolments`, `staff_duty_assignments`, `hall_tickets`, `consolidated_fee_report_snapshots`) contain `tenant_id` but were not registered in `TENANT_SCOPED_TABLES` in `rls.py`.
3. **No Database Migration Framework (`GAP-OPS-01`):**
   The application initializes tables via `Base.metadata.create_all()` on FastAPI startup. There is no Alembic migration tool to execute reversible schema alterations in production.

