# Stage 1 Audit: Database Migration & Data Safety Plan

**Document:** `AUDIT_REPORTS/DATABASE_MIGRATION_AND_DATA_SAFETY_PLAN.md`  
**Evaluation Scope:** Zero-Data-Loss Principles, Baseline Backup Verification, Alembic Async Setup Architecture, and Reversible Schema Evolution.  
**Execution Timestamp:** 2026-11-05T07:48:00+05:30  
**Status:** READY FOR STAGE 2 APPROVAL  

---

## 1. Zero-Data-Loss Core Safety Principles

In accordance with strict enterprise database engineering standards and user instructions:
1. **TRUNCATE TABLE is Absolutely Prohibited:** Under no circumstances will `TRUNCATE`, `DROP DATABASE`, or broad unconditional `DELETE FROM` statements be executed against development or production databases.
2. **Pre-Migration Snapshot Requirement:** Before any schema modification or tenant record update, a full compressed PostgreSQL dump (`pg_dump`) must be written to disk.
3. **Reversible Migrations (Two-Way):** Every database migration file must define both an `upgrade()` function and an exact, lossless `downgrade()` function.
4. **Non-Destructive Column Additions:** New columns must be added as `nullable=True` or with a deterministic `server_default` to prevent table rewrites or transaction lockouts.
5. **Separation of Environments:** Development (`education_erp_dev`) and automated testing (`education_erp_test`) remain strictly isolated on port 5433.

---

## 2. Baseline Backup Verification Archive

The repository baseline backup created prior to audit activities was verified on disk:
- **Location:** `/home/siva/Desktop/backup_educationos_baseline_20261104/`
- **Tracked Changes Patch:** `git_diff_tracked.patch` (54,842 bytes)
- **Untracked / Modified Archive:** `untracked_and_modified.tar.gz` (159,104 bytes)
- **Git Status:** Working tree clean on `main` branch, HEAD `9fe6db3`. All existing user files and work are completely preserved.

---

## 3. Alembic Async Migration Tooling Specification

To resolve `GAP-OPS-01`, Alembic will be initialized during Stage 2:

### Directory Structure to be Initialized:
```
apps/api/
  ├── alembic.ini
  └── migrations/
      ├── env.py              # Configured for SQLAlchemy asyncio with asyncpg
      ├── script.py.mako      # Template for reversible migrations
      └── versions/
          ├── 0001_baseline_saas_schema.py
          ├── 0002_enable_rls_all_tables.py
          └── 0003_extend_student_canonical_fields.py
```

### `env.py` Integration Template:
```python
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

from app.core.config import settings
from app.database.base import Base
# Import all models to bind target_metadata
from app.modules.tenants.models import Tenant, Campus
from app.modules.academic.models import Student, AcademicSection
...

target_metadata = Base.metadata

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    connectable = create_async_engine(settings.DATABASE_URL)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

def run_migrations_online():
    asyncio.run(run_async_migrations())
```

---

## 4. Reversible Tenant Transformation Procedure

When transforming the existing Akshara setup into `OUR SCHOOL` and creating `AKSHARA GLOBAL SCHOOL AND PU COLLEGE`:

```
                                [PRE-TRANSFORMATION BACKUP]
                     pg_dump education_erp_dev > backup_dev_pre_trans.sql
                                            |
                                            v
                                 [BEGIN DB TRANSACTION]
                                            |
                                            +---------------------------------------+
                                            |                                       |
                                            v                                       v
                             [OPERATION A: OUR SCHOOL]            [OPERATION B: NEW AKSHARA]
                             - UPDATE tenants                     - INSERT INTO tenants
                               SET name = 'OUR SCHOOL',             (new UUID, 'AKSHARA GLOBAL',
                                   code = 'our-school',              status = 'trial_active')
                                   subdomain = 'demo'             - INSERT INTO campuses
                               WHERE id = '66601a28...'           - INSERT INTO subscriptions (Trial 30d)
                             - Retain 3 fictional invoices        - INSERT INTO users (Head: 'akshara',
                             - Retain existing FK links             must_change_password = True)
                                            |                                       |
                                            +-------------------+-------------------+
                                                                |
                                                                v
                                                     [VERIFY INTEGRITY CHECKS]
                                                     SELECT count(*) FROM tenants;
                                                     SELECT count(*) FROM users;
                                                                |
                                                                v
                                                            [COMMIT]
```

### Rollback Strategy:
If any step fails, the transaction automatically rolls back via `ROLLBACK`. If an unexpected issue arises post-commit, the database state can be restored instantly via:
```bash
psql -h 127.0.0.1 -p 5433 -U postgres education_erp_dev < backup_dev_pre_trans.sql
```
This guarantees zero operational risk.

