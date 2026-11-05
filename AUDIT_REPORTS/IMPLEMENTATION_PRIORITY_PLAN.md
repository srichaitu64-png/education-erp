# Stage 1 Audit: Prioritised Implementation & Execution Plan

**Document:** `AUDIT_REPORTS/IMPLEMENTATION_PRIORITY_PLAN.md`  
**Evaluation Scope:** Prioritized Classification (P0 / P1 / P2 / P3), Detailed Execution Phases, Technical Dependencies, and Risk Mitigations.  
**Execution Timestamp:** 2026-11-05T07:45:00+05:30  
**Status:** READY FOR STAGE 2 APPROVAL  

---

## 1. Priority Classification Framework

All required tasks are grouped into four standardized risk-and-value tiers:
- **P0 (Critical Security & Data Integrity):** Must be fixed before any customer data is entered.
- **P1 (Essential Business Workflow):** Critical SaaS operational workflows required for onboarding paying institutions.
- **P2 (Important Functionality):** Modules that enhance operational efficiency and automated convenience.
- **P3 (Enhancements & Future Capabilities):** Non-blocking UX polish and optional third-party hardware integrations.

---

## 2. Master Prioritised Task Register

| Priority | Task Identifier | Subject / Requirement | Target Files | Dependencies | Complexity |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **P0** | `TASK-RLS-01` | Register 5 missing academic tables in `rls.py` (`academic_sections`, etc.) | `apps/api/app/database/rls.py:10-24` | None | Low (1 hour) |
| **P0** | `TASK-CORS-01`| Add `https://education-erp-nine.vercel.app` to FastAPI allowed origins | `apps/api/app/core/config.py:23-28` | None | Low (30 mins) |
| **P0** | `TASK-ALEMBIC` | Initialize Alembic async migration framework & baseline revision | `apps/api/alembic.ini`, `migrations/` | SQLAlchemy | Medium (2 hours) |
| **P1** | `TASK-AUTH-01`| Implement dedicated `/institution/login` and remove client role dropdown | `apps/web/src/App.tsx`, `LoginPage.tsx` | None | Medium (3 hours) |
| **P1** | `TASK-AUTH-02`| Provision Platform Owner bootstrap account `siva` via secure config | `apps/api/app/database/seed.py`, `.env` | P0 tasks | Low (1 hour) |
| **P1** | `TASK-TRANS-01`| Transform existing Akshara setup to `OUR SCHOOL` live demo (3 students) | `apps/api/app/database/seed.py`, `demoStore.ts` | P0 tasks | Medium (4 hours) |
| **P1** | `TASK-TRANS-02`| Create new `AKSHARA GLOBAL SCHOOL AND PU COLLEGE` trial tenant | `apps/api/app/database/seed.py`, `platform.py` | P0 tasks | Medium (4 hours) |
| **P1** | `TASK-INT-01` | Connect frontend `InstitutionDashboard.tsx` to FastAPI endpoints | `apps/web/src/modules/dashboard/`, `services/` | P0 tasks | High (1.5 days) |
| **P1** | `TASK-SIS-01` | Extend PostgreSQL `Student` model with all 28 canonical fields | `apps/api/app/modules/academic/models.py` | `TASK-ALEMBIC`| Medium (4 hours) |
| **P1** | `TASK-MIGR-01`| Implement FastAPI `/api/v1/migration/` router and async chunk worker | `apps/api/app/api/v1/migration.py` | Redis | High (2 days) |
| **P1** | `TASK-ONB-01` | Extend Platform Owner tenant onboarding with Head account creation | `apps/web/src/modules/dashboard/SuperAdminDashboard.tsx`| Backend API | Medium (4 hours) |
| **P2** | `TASK-BILL-01`| Wire Razorpay/Stripe billing webhooks and automated subscription state | `apps/api/app/modules/subscriptions/billing.py` | None | Medium (1 day) |
| **P2** | `TASK-BILL-02`| Implement Indian GST-compliant invoice calculation (18% HSN 9992) | `apps/api/app/modules/subscriptions/models.py` | None | Medium (4 hours) |
| **P2** | `TASK-OPS-01` | Author automated encrypted daily PostgreSQL backup and restore scripts | `infrastructure/scripts/backup_postgres.sh` | Bash / GPG | Medium (3 hours) |
| **P2** | `TASK-MFA-01` | Add RFC 6238 TOTP Multi-Factor Authentication for Platform Super Admins | `apps/api/app/api/v1/auth.py` | `pyotp` | Medium (4 hours) |
| **P3** | `TASK-AUX-01` | Create auxiliary backend schemas for Laboratory, Fleet GPS, and SMS | `apps/api/app/modules/auxiliary/models.py` | `TASK-ALEMBIC`| High (2 days) |
| **P3** | `TASK-PRINT-01`| Add `@media print` CSS optimization for official fee receipts & hall tickets | `apps/web/src/index.css` | None | Low (2 hours) |

---

## 3. Structured 5-Stage Implementation Sequence

```
+---------------------------------------------------------------------------------------+
| STAGE 2A: FOUNDATIONAL SECURITY & DATABASE INFRASTRUCTURE (Day 1)                     |
| - Task P0-1: Patch rls.py to enable kernel RLS on all 5 academic tables               |
| - Task P0-2: Patch config.py to permit Vercel cloud domain in CORS                    |
| - Task P0-3: Initialize Alembic async migrations (alembic init -t async)              |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| STAGE 2B: AUTHENTICATION SEPARATION & INSTITUTION PROVISIONING (Day 2)                |
| - Task P1-1: Create /institution/login and remove client-side role dropdown           |
| - Task P1-2: Seed Platform Owner bootstrap user "siva"                                |
| - Task P1-3: Extend Platform Owner tenant creation with Head account provisioning    |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| STAGE 2C: OUR SCHOOL TRANSFORMATION & NEW AKSHARA TRIAL TENANT (Day 3)                |
| - Task P1-4: Safely transform existing tenant 66601a28... to "OUR SCHOOL" (3 students)|
| - Task P1-5: Create "AKSHARA GLOBAL SCHOOL AND PU COLLEGE" (TRIAL ACTIVE, clean DB)   |
| - Task P1-6: Implement dedicated demo reset mechanism for OUR SCHOOL                  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| STAGE 2D: CANONICAL STUDENT MASTER & FRONTEND-BACKEND INTEGRATION (Days 4-5)          |
| - Task P1-7: Extend Student model with 28 canonical fields (Aadhaar masked, PEN, OMR) |
| - Task P1-8: Wire React Query hooks in InstitutionDashboard.tsx to FastAPI endpoints   |
| - Task P1-9: Implement atomic student transfer and capacity check validation          |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
| STAGE 2E: DATA MIGRATION ENGINE & BILLING AUTOMATION (Days 6-7)                       |
| - Task P1-10: Create /api/v1/migration/upload router with 500-row chunked execution   |
| - Task P2-1: Wire Razorpay/Stripe subscription webhooks & GST invoice generation      |
| - Task P2-2: Author automated S3/R2 database backup and restoration runbooks          |
+---------------------------------------------------------------------------------------+
```

---

## 4. Complexity & Dependency Matrix

| Stage | Estimated Effort | Core Dependencies | Primary Risk | Mitigation |
| :---: | :---: | :--- | :--- | :--- |
| **2A** | 0.5 Days | PostgreSQL, Asyncpg, Alembic | Migration lock contention | Execute inside fresh transaction; NullPool engine |
| **2B** | 1.0 Day | React Router, FastAPI Auth | Route mismatch | Backward-compatibility redirect `/login` -> `/institution/login` |
| **2C** | 1.0 Day | Seed script, Database FKs | Orphaned foreign keys | Retain existing tenant UUID for OUR SCHOOL |
| **2D** | 2.0 Days | Axios, React Query, SQLAlchemy | Stale client caching | Invalidate React Query keys on mutation success |
| **2E** | 2.0 Days | Openpyxl, Redis, Celery | Large file memory spikes | Stream multipart upload directly to temporary spool disk |

**Total Estimated Implementation Duration:** 6.5 Working Days to full Enterprise General Availability (GA).

