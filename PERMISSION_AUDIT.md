# EducationOS Enterprise – Central Permission & Action Audit

**Standard:** Action-Level Granular Permissions with Multi-Dimensional Scoping  
**Default Access:** Deny-by-Default on all endpoints  

---

## 1. Supported Action Definitions

| Action | Description | Permitted Roles (Sample) | Scopes Enforced |
| :--- | :--- | :--- | :--- |
| `view` | Read data records without mutation rights | All authenticated roles within assigned scope | Tenant, Campus, Class, Subject, Child |
| `create` | Instantiate a new record | Admin, Admission Officer, Accountant, Teacher | Tenant, Department, Class |
| `edit` | Modify draft or unapproved records | Creator, Supervisor within editing window | Own Records, Assigned Section |
| `delete` | Soft-delete an uncommitted draft record | Institution Admin, Chairman (Soft-delete only) | Tenant, Superadmin override |
| `submit` | Submit draft record to approval queue | Subject Teacher, Data Entry Operator | Assigned Class, Subject, Exam |
| `verify` | Moderate and verify entered draft marks | Controller of Examinations, Department Head | Academic Session, Exam Cycle |
| `approve` | Final administrative sanction on record | Principal, Chairman / Director | Campus-wide, Financial/Academic |
| `reject` | Reject draft submission with justification | Controller of Examinations, Principal | Subordinate Queue |
| `publish` | Release approved records to public portals | Exam Controller, Office Administrator | Examination, Class, Notice Board |
| `export` | Generate bulk CSV or Excel records | Admin, Controller, Accountant | Scoped Department |
| `download` | Retrieve approved PDF documents | Parents (Own Child), Students (Self), Staff | Verified Child ID, Hall Ticket Mode |
| `print` | Render physical print layout (A4/Thermal) | Cashier, Accountant, Exam Controller | Receipt ID, Hall Ticket ID |
| `collect` | Record counter or gateway fee payment | Accountant, Cashier | Fee Invoice ID, Cash Drawer |
| `refund` | Initiate fee reversal or refund request | Senior Accountant (Requires Chairman Approval) | Transaction ID, Approval Ticket |
| `configure` | Define fee structures, exam categories, etc. | Chairman / Director, Institution Admin | Tenant Domain |
| `assign` | Allocate duties, subjects, or roles | Principal, Institution Admin, Chairman | Staff ID, Section ID, Academic Year |
| `revoke` | Cancel active duty, permission or ticket | Principal, Institution Admin, Super Admin | Assignment ID, Hall Ticket ID |
| `import` | Ingest legacy records via migration centre | Institution Admin, Data Operator | Migration Batch ID, File Schema |
| `reconcile` | Audit financial balances and transaction logs | Senior Accountant, External Auditor | Financial Year, Cash Ledger |

---

## 2. Scoping Dimensions

Every permission check evaluates all 12 dimensions before granting access:
1. `tenant_id`: Mandatory database boundary.
2. `institution_id`: Campus trust boundary.
3. `campus_id`: Physical facility (Main Campus vs Branch).
4. `academic_year`: Temporal boundary (`2026-2027`).
5. `department_id`: Academic department (Science, Commerce, Arts).
6. `course_id`: Level of education (School, PU College, Degree).
7. `stream_id`: Specialization (PCMB, PCMC, CEBA).
8. `class_id`: Educational standard (Class 6, Class 10, I PUC).
9. `section_id`: Cohort group (Section A, Section B).
10. `subject_id`: Instructional subject (Physics, Chemistry).
11. `examination_id`: Specific assessment cycle.
12. `student_id`: Individual learner boundary (Parent-child link).

---

## 3. Negative Security Assertions

- A Teacher with `submit` permission on `Physics` cannot submit marks for `Chemistry`.
- A Teacher assigned to `Section A` cannot read or enter marks for `Section B`.
- An Accountant cannot approve their own refund requests (`maker != checker`).
- A Computer Operator cannot publish marks or issue hall tickets.
- A Parent cannot read or download records of any child not linked by a verified guardian relationship.
