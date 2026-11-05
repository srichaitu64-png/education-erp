# Stage 1 Audit: Database Architecture, Indexing & Scalability

**Document:** `AUDIT_REPORTS/DATABASE_AND_SCALABILITY_AUDIT.md`  
**Evaluation Scope:** PostgreSQL 16 Schema, Compound B-Tree Indexing, Connection Pool Telemetry, Query Pagination, Batch Limits, and Migration Tooling.  
**Execution Timestamp:** 2026-11-05T07:38:00+05:30  
**Status:** IMPLEMENTED AND VERIFIED (Core Indexing & Pooling) / GAPS (Alembic & Backups)  

---

## 1. Executive Summary

To support a multi-tenant SaaS deployment serving thousands of independent institutions and millions of student records, the database topology was evaluated for concurrency, memory bounds, indexing strategy, and schema evolution safety.

**Key Findings:**
1. **Asynchronous Connection Pooling:** The SQLAlchemy engine (`apps/api/app/database/session.py`) is configured with asynchronous PostgreSQL pooling (`pool_size=15`, `max_overflow=20`, `pool_pre_ping=True`). Connections are validated prior to checkout, preventing stale socket errors.
2. **Tenant B-Tree Indexing:** Every table inheriting from `TenantBaseModel` enforces an indexed `tenant_id` column, ensuring queries filtered by tenant perform logarithmic index scans ($O(\log N)$) rather than full table sequential scans.
3. **Database Migration Void (`GAP-OPS-01`):** No Alembic migration infrastructure is configured. Schema creation relies on `Base.metadata.create_all()`.
4. **Lack of Automated Backups (`GAP-OPS-03`):** No automated Point-In-Time-Recovery (PITR) WAL archiving or cron-based encrypted dumps are configured.

---

## 2. PostgreSQL Schema & Indexing Health Matrix

| Table Name | Primary Key | Tenant Index | Compound Search Indexes | Foreign Key Cascades | Status |
| :--- | :---: | :---: | :--- | :--- | :---: |
| `tenants` | `id` (UUID) | N/A | `code` (Unique), `subdomain` (Unique) | Restrict on delete | **PASS** |
| `campuses` | `id` (UUID) | B-Tree | `(tenant_id, code)` Unique | Cascade from Tenant | **PASS** |
| `users` | `id` (UUID) | Global | `email` (Unique), `failed_login_attempts` | Restrict on delete | **PASS** |
| `user_roles` | `id` (UUID) | B-Tree | `(user_id, role_id, tenant_id)` Compound | Cascade on user delete | **PASS** |
| `subscriptions` | `id` (UUID) | B-Tree | `(tenant_id, status)` Compound | Restrict on delete | **PASS** |
| `daily_attendance_records` | `id` (UUID) | B-Tree | `(tenant_id, attendance_date, class_name)` | Cascade from Section | **PASS** |
| `fee_structures` | `id` (UUID) | B-Tree | `(tenant_id, academic_year, class_or_stream)` | Restrict on delete | **PASS** |
| `fee_invoices` | `id` (UUID) | B-Tree | `(tenant_id, student_id, status)` | Restrict on delete | **PASS** |
| `fee_payments` | `id` (UUID) | B-Tree | `(tenant_id, invoice_id, payment_date)` | Restrict on delete | **PASS** |
| `fee_receipts` | `id` (UUID) | B-Tree | `(tenant_id, receipt_number)` Unique | Restrict on delete | **PASS** |
| `academic_sections` | `id` (UUID) | B-Tree | `(tenant_id, class_name, section_code)` Unique | Restrict on delete | **PASS** |
| `student_section_enrolments`| `id` (UUID)| B-Tree | `(student_id, section_id, is_current)` | Restrict on delete | **PASS** |
| `staff_duty_assignments` | `id` (UUID) | B-Tree | `(tenant_id, employee_id, duty_role)` | Restrict on delete | **PASS** |
| `examinations` | `id` (UUID) | B-Tree | `(tenant_id, academic_year, category)` | Restrict on delete | **PASS** |
| `marks_records` | `id` (UUID) | B-Tree | `(tenant_id, examination_id, student_id)` | Restrict on delete | **PASS** |

---

## 3. High-Concurrency & Scalability Guardrails

### 1. Connection Pool Sizing:
- Base pool size: 15 simultaneous async connections.
- Maximum overflow: 20 burst connections.
- Concurrency capacity: With Uvicorn running 4 worker processes, the cluster can handle up to 140 concurrent database operations with `pool_pre_ping=True` preventing stale connection timeouts.

### 2. Large Dataset Pagination:
- **Rule:** APIs must **never** load unbounded student or attendance records into Python heap memory (`SELECT * FROM students` is prohibited).
- Standard query parameters enforced:
  `GET /api/v1/academic/students?limit=50&offset=0&status=ACTIVE`
- Max batch limit: Clamped at `limit=200` to prevent memory bloat and API denial-of-service.

### 3. Asynchronous Batch Processing:
- Bulk spreadsheet ingestion (1,000 to 10,000 rows) is split into chunks of **500 rows per transaction**.
- Chunked execution prevents database lock contention on PostgreSQL transaction tables and avoids holding connection pool slots open during file parsing.

---

## 4. Operational Gaps & Remediation (Stage 2)

### Gap 1: Alembic Schema Migrations (`GAP-OPS-01`)
- **Risk:** Any future table or column change (e.g., adding `academic_unit_id` to `UserRole`) cannot be applied in production without manual SQL or recreating tables.
- **Remediation:**
  Initialize Alembic: `alembic init -t async migrations`, bind `target_metadata = Base.metadata`, and generate baseline revision `0001_baseline_schema.py`.

### Gap 2: Disaster Recovery & Automated Backups (`GAP-OPS-03`)
- **Risk:** Unrecoverable data loss in event of cloud hardware disaster or ransomware.
- **Remediation:**
  Author `infrastructure/scripts/backup_postgres.sh`:
  - Executes `pg_dump` with gzip compression and GPG public-key encryption.
  - Syncs archive to AWS S3 / Cloudflare R2 with 30-day retention policy and object lock.
  - Verifies restore procedure via `infrastructure/scripts/restore_postgres.sh`.

