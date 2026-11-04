# EDUCATIONOS – DATABASE ARCHITECTURE, RLS & AUDIT TRAIL REPORT

**Document Version:** 2.0.0  
**Audit Date:** November 4, 2026  
**Audited Systems:** PostgreSQL 16 • SQLAlchemy 2.0 ORM • Alembic Migrations • Row-Level Security (RLS)  

---

## 1. Multi-Tenant Row-Level Security (RLS)

EducationOS uses PostgreSQL native Row-Level Security (RLS) as the primary security boundary ensuring zero cross-tenant data leakage.

### Implementation Architecture:
1. Every multi-tenant table inherits from `TenantBaseModel` and includes a mandatory `tenant_id: UUID` foreign key referencing `tenants(id)`.
2. Session initialization executes:
   ```sql
   SET LOCAL app.current_tenant_id = 'c1234567-89ab-cdef-0123-456789abcdef';
   ```
3. PostgreSQL RLS Policies enforce isolation:
   ```sql
   ALTER TABLE students ENABLE ROW LEVEL SECURITY;
   CREATE POLICY tenant_isolation_policy ON students
       FOR ALL
       USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
   ```

---

## 2. Core Relational Entities & Data Integrity Constraints

| Table Name | Entity Description | Primary Key | Foreign Keys & Multi-Tenant Constraints |
| :--- | :--- | :--- | :--- |
| `tenants` | Master Institution Tenancies | `id` (UUID) | Subdomain unique index; status enum. |
| `campuses` | Physical Campuses | `id` (UUID) | `tenant_id` -> `tenants(id)`. |
| `academic_years` | Academic Sessions | `id` (UUID) | `tenant_id`, unique(`tenant_id`, `code`). |
| `courses` | Academic Courses (PUC, School, Degree) | `id` (UUID) | `tenant_id`, `campus_id`. |
| `academic_sections` | Dynamic Sections (e.g. Class 6 A-D, I PUC PCMB A-F) | `id` (UUID) | `tenant_id`, `course_id`, unique(`course_id`, `section_code`). Capacity constraint: `max_students >= 1`. |
| `students` | Student Master Record | `id` (UUID) | `tenant_id`, `campus_id`, unique(`tenant_id`, `admission_number`). |
| `student_section_enrolments` | Active & Historical Section Enrolments | `id` (UUID) | `student_id`, `section_id`, `academic_year_id`. Tracks status: `ACTIVE`, `TRANSFERRED`, `COMPLETED`. |
| `staff_duty_assignments` | Granular Staff Responsibilities | `id` (UUID) | `staff_id`, `campus_id`, `section_id`, `subject_code`, `role_type`. |
| `examinations` | Institutional Examinations (16 categories) | `id` (UUID) | `tenant_id`, `academic_year_id`, `category`. |
| `exam_marks_entries` | Subject Component Marks (Theory/Practical/Internal) | `id` (UUID) | `exam_id`, `student_id`, `subject_code`. Unique(`exam_id`, `student_id`, `subject_code`). Checks: `theory_obtained <= theory_max`. |
| `hall_tickets` | Candidate Hall Tickets & QR Verifications | `id` (UUID) | `exam_id`, `student_id`, unique(`ticket_number`). |
| `fee_invoices` | Term & Annual Fee Invoices | `id` (UUID) | `tenant_id`, `student_id`, `academic_year_id`. |
| `fee_payment_transactions` | Immutable Payment Collections | `id` (UUID) | `tenant_id`, `invoice_id`, unique(`receipt_number`). |
| `fee_report_snapshots` | Accountant-to-Chairman Review Snapshots | `id` (UUID) | `tenant_id`, `submitted_by_user_id`. Immutable frozen JSON data. |

---

## 3. Immutability & Audit Trail Policies

- **Financial Transactions:** `fee_payment_transactions` cannot be updated or deleted. Corrections require issuing distinct debit/credit notes or approved refund transactions with dual authorization.
- **Examination Marks:** Marks undergo a 4-stage workflow: `DRAFT` -> `SUBMITTED` -> `CONTROLLER_VERIFIED` -> `PRINCIPAL_APPROVED` -> `PUBLISHED`.
- **Post-Publication Protection:** Once published, records cannot be silently rewritten; any modification creates an auditable result version with approval logs.

