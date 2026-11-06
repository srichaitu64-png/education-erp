# Testing & Quality Assurance Guide — EducationOS SaaS

**Test Framework:** Pytest 9.2+ / Pytest-AsyncIO  
**HTTP Testing:** HTTPX AsyncClient with ASGITransport  
**Total Automated Tests:** 103  
**Current Pass Rate:** 100% (103 passed, 0 failed, 0 skipped)  

---

## 1. Safety Rules & Database Isolation

To prevent accidental data loss in local development or production:
1. **No Fallback Allowed:** The test runner strictly requires `TEST_ADMIN_DATABASE_URL`. It will never fall back to `DATABASE_URL`.
2. **Explicit Disposable Allowlist:** The runner validates the target database name against an immutable allowlist:
   ```python
   {"education_erp_test", "education_erp_mig_cycle_test", "education_erp_alembic_check_test"}
   ```
   If any setting attempts to target `education_erp_dev`, `education_erp_prod`, or an unrecognized name, pytest fails immediately before executing any SQL.
3. **Application Role Execution:** All API tests and tenant boundary queries execute using the non-privileged `erp_app` PostgreSQL role (`NOSUPERUSER, NOBYPASSRLS`).

---

## 2. Running Backend Tests

### Running the Full Test Suite
```bash
cd apps/api
source .venv/bin/activate
pytest ../../tests/ -v
```

### Running Specific Test Domains
```bash
# Multi-tenant PostgreSQL Row-Level Security isolation tests
pytest ../../tests/tenant-isolation/ -v

# Subject Catalogue and Curriculum Mapping tests
pytest ../../tests/integration/test_subject_catalogue_and_curriculum.py -v

# Authentication, MFA TOTP, and Account Security tests
pytest ../../tests/security/ -v

# Alembic migration cycle and schema drift tests
pytest ../../tests/database/ -v

# Fee structures, receipt generation, and reporting tests
pytest ../../tests/finance/ -v
```

---

## 3. Test Database Lifecycle (`conftest.py`)

When `pytest` executes:
1. **`pytest_sessionstart`:**
   * Validates database name safety.
   * Cleans public schema: `DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`.
   * Runs the complete Alembic migration chain: `alembic upgrade head`.
   * Seeds base reference tables (plans, permissions, global subject templates) via `AdminAsyncSessionLocal`.
   * Enforces PostgreSQL RLS on all tenant and hybrid tables via `enable_row_level_security`.
   * Grants least-privilege `SELECT, INSERT, UPDATE, DELETE` to `erp_app`.
2. **Test Function Execution:**
   * Tests run with isolated transactions that are rolled back after each test.
   * `client` requests pass through FastAPI dependency injection, where session tenant context (`app.current_tenant_id`) is applied automatically from the authenticated JWT token.
3. **`pytest_sessionfinish`:**
   * Safely drops and resets the disposable test schema.
   * Disposes of database connection pools.

---

## 4. Frontend Typecheck & Build Testing

```bash
cd apps/web

# Run strict TypeScript compilation check across all modules
npm run build
```
A passing build completes with zero TypeScript errors and compiles the production bundle in `apps/web/dist/`.
