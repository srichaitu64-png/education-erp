# Database Architecture & Integrity Verification

**Database Engine:** PostgreSQL 16 on port 5433  
**Total Tables:** 50 active relational tables  
**Migration Engine:** Alembic (current head verified clean)  

## Security & Isolation Verification
- **Row-Level Security (RLS):** Enabled and enforced on all tenant-specific tables.
- **Application Database Role:** `erp_app` (NOSUPERUSER, NOBYPASSRLS, minimum grants).
- **Test Administrator Role:** `erp_test_admin` (Dedicated to disposable test DB lifecycle).
- **Foreign Key Constraints:** 100% relational integrity verified across student enrolments, invoices, marks, and user roles.
