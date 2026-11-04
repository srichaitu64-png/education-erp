# EducationOS Enterprise – Database Schema & Security Audit

**Database Engine:** PostgreSQL 16.15  
**Cluster Configuration:** Port 5433 (Local Cluster) / Production Managed PostgreSQL  
**Isolation Architecture:** Native Row-Level Security (`ENABLE ROW LEVEL SECURITY`)  

---

## 1. Row-Level Security (RLS) Implementation

All tenant-scoped tables enforce strict PostgreSQL Row-Level Security:

```sql
-- Dynamic session-bound policy template
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON <table_name>
    FOR ALL
    USING (
        current_setting('app.is_superadmin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
    WITH CHECK (
        current_setting('app.is_superadmin', true) = 'true'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );
```

### RLS Enforced Tables
1. `tenants.campuses`
2. `identity.users`
3. `identity.roles`
4. `identity.user_roles`
5. `academics.academic_years`
6. `academics.courses`
7. `academics.classes`
8. `academics.sections`
9. `academics.subjects`
10. `students.students`
11. `students.student_guardians`
12. `students.enrollments`
13. `attendance.student_attendance`
14. `attendance.period_attendance`
15. `attendance.leave_requests`
16. `examinations.examinations`
17. `examinations.exam_schedules`
18. `examinations.marks_entries`
19. `examinations.hall_tickets`
20. `fees.fee_structures`
21. `fees.fee_heads`
22. `fees.invoices`
23. `fees.fee_receipts`
24. `fees.transactions`
25. `audit.activity_logs`

---

## 2. Table Schemas & Foreign Key Integrity

- **Cascade Rules:** Hard delete is blocked on institutional records with financial or grade history.
- **Audit Columns:** Every table includes `created_at`, `updated_at`, `created_by`, `updated_by`, and `version_id`.
- **Unique Constraints:**
  - `students(tenant_id, admission_number)`: Enforces unique admission number per institution.
  - `examinations(tenant_id, academic_year_id, code)`: Unique exam code per academic cycle.
  - `fee_receipts(tenant_id, receipt_number)`: Guarantees immutable, non-duplicable receipt numbering.

---

## 3. Database Backup & Disaster Recovery

- **Automated Physical Backup:** Continuous WAL archiving with Point-in-Time Recovery (PITR).
- **Daily Logical Dump:** `pg_dump -Fc` compressed logical exports.
- **Failover Target:** Multi-AZ hot standby with automatic replication failover (< 30 seconds RTO).
