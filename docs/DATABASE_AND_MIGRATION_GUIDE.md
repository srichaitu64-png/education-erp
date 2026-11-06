# Database & Migration Engineering Guide — EducationOS SaaS

**Target Engine:** PostgreSQL 16+  
**ORM:** SQLAlchemy 2.0 (Asynchronous AsyncPG dialect)  
**Migration Tool:** Alembic  
**Connection Pooler:** PgBouncer (Production) / SQLAlchemy QueuePool  

---

## 1. Database Architecture & Role Separation

To adhere to the principle of least privilege, EducationOS strictly segregates database operations across dedicated PostgreSQL roles.

| Role Name | Attributes | Schema Privileges | Operational Usage |
| :--- | :--- | :--- | :--- |
| **`erp_app`** | `NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS` | `USAGE` on schema `public`; `SELECT, INSERT, UPDATE, DELETE` on application tables; `USAGE, SELECT` on sequences. | Used by FastAPI web application connections, background workers, and tenant-isolation testing. |
| **`erp_migration`** | `NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS` | `ALL PRIVILEGES` on schema `public`; Table `OWNER` of application schema. | Used strictly during deployment CI/CD to apply Alembic migrations. |
| **`erp_test_admin`** | `NOSUPERUSER CREATEDB NOCREATEROLE NOBYPASSRLS` | Database owner of disposable test databases (`education_erp_test`). | Used by pytest test runner to manage test database schemas and deterministic seeds. |
| **`postgres`** | `SUPERUSER CREATEDB CREATEROLE BYPASSRLS` | PostgreSQL cluster administration. | Cluster initialization, role provisioning, and database creation only. Never exposed to web application or CI runners. |

---

## 2. Alembic Migration Graph

The migration timeline is strictly linear with a single head revision. Branching or multiple heads are forbidden.

```mermaid
graph TD
    A["<base>"] --> B["fb126a33b6fc<br/>Initial Schema & Roles"]
    B --> C["bd0751c8eb27<br/>Multi-Campus & Subscriptions"]
    C --> D["6ce207a01090<br/>Examinations & Grading"]
    D --> E["a8d56bd229d3<br/>Flexible Attendance & SIS"]
    E --> F["c7e45b1289df<br/>Subject Catalogue & Curriculum"]
    F --> G["e1b2c3d4f5a6<br/>Fee Structures & Receipts"]
    G --> H["f2c3d4e5a6b7 (HEAD)<br/>Platform Governance & Auditing"]
```

### Verifying Migration Status
To verify that the database is synchronized and contains zero schema drift:
```bash
# In apps/api directory with active virtual environment:
alembic current
alembic check
```
A successful check will output:
```text
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
No new upgrade operations detected.
```

---

## 3. Applying Migrations in Staging & Production

### Pre-Deployment Verification
Always test migration upgrade and downgrade cycles against an isolated staging or disposable database prior to production promotion:
```bash
# Upgrade to latest head
alembic upgrade head

# Verify downgrade capability
alembic downgrade -1

# Re-apply to head
alembic upgrade head
```

### Production Execution Protocol
1. Take a physical snapshot or `pg_dump` of the production database before initiating schema changes.
2. Run migrations using the dedicated `erp_migration` identity:
   ```bash
   DATABASE_URL="postgresql+asyncpg://erp_migration:SECURE_MIG_PASS@db-primary.internal:5432/education_erp_prod" \
   alembic upgrade head
   ```
3. Ensure runtime grants are refreshed for `erp_app`:
   ```sql
   GRANT USAGE ON SCHEMA public TO erp_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO erp_app;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO erp_app;
   ```
4. Verify application health check endpoint: `GET /api/v1/health`.

---

## 4. Connection Pooling Configuration

Production environments utilize PgBouncer in transaction pooling mode alongside SQLAlchemy engine tuning:

* **Engine Configuration (`app/database/session.py`):**
  * `pool_size`: 15 connections per Uvicorn worker process.
  * `max_overflow`: 20 connections during burst traffic.
  * `pool_pre_ping`: `True` (proactively discards stale TCP connections).
  * `pool_recycle`: 1800 seconds (30 minutes).
* **Transaction RLS Context Hook:**
  SQLAlchemy's `after_begin` event re-applies `set_config('app.current_tenant_id', ...)` on every transaction, ensuring tenant context never leaks across pooled connections.

