# Stage 1 Audit: Faculty & Staff Account Provisioning

**Document:** `AUDIT_REPORTS/FACULTY_AND_STAFF_ACCOUNT_AUDIT.md`  
**Evaluation Scope:** Staff & Faculty Master Management, Automated Staff ID & User Creation, First-Login Password Change, Role & Duty Scoping (Campus, Unit, Class, Subject), and Account Lifecycle.  
**Execution Timestamp:** 2026-11-05T07:28:00+05:30  
**Status:** PARTIALLY IMPLEMENTED (Duty Assignment Engine Verified / Provisioning Unification Pending)  

---

## 1. Executive Summary

The Faculty and Staff Management architecture was audited across user models, academic duties, and authentication provisioning.

**Existing Capabilities:**
The platform possesses a dedicated `StaffDutyAssignmentView.tsx` component in the frontend and a verified backend API in `apps/api/app/api/v1/academic.py` (`/api/v1/academic/staff-duties`). This engine allows an Institution Admin or Principal to assign teachers specific institutional responsibilities:
- `CLASS_TEACHER`: Scoped to a specific Class and Section.
- `SUBJECT_TEACHER`: Scoped to a specific Subject, Class, and Section.
- `EXAM_INVIGILATOR`: Scoped to an Examination room and date.
- `DEPARTMENT_HEAD`: Scoped to an Academic Department.
The duty engine was verified through automated test `test_staff_duty_assignment_engine` (PASSED).

**Identified Gaps (`GAP-STAFF-01`):**
In the current architecture, creating a staff member and provisioning their login account are **two loosely coupled actions**:
1. An administrator can create a `User` account via `/auth/` or `demoStore.ts`.
2. An administrator can assign duties via `staff_duty_assignments`.
However, there is no single **"Create Faculty & Provision Account"** atomic workflow that automatically generates an Employee Code (e.g., `EMP-2026-042`), creates the User record with temporary credentials, flags `must_change_password=True`, and binds their departmental and subject duty scopes in one operation.

---

## 2. Staff Creation & Account Provisioning Specification

When an authorized Institution Admin creates a faculty or employee profile, the following atomic workflow must execute:

```
[Administrator Submits Faculty Form]
  ├── Full Name, Designation, Department, Campus, Academic Unit
  ├── Official Email & Mobile Number
  ├── Assigned Subjects & Assigned Classes
  └── Employment Status (Full-Time / Visiting / Contract)
                  |
                  v
[Atomic Backend Transaction]
  ├── 1. Generate Unique Employee Code: EMP-{YEAR}-{SEQUENCE} (e.g. EMP-2026-0081)
  ├── 2. Create User Account:
  │      - email = official_email
  │      - username = employee_code or official_email
  │      - hashed_password = Argon2id(generated_temporary_password)
  │      - must_change_password = True
  │      - is_active = True
  ├── 3. Create UserRole:
  │      - role_id = TEACHER / LECTURER role
  │      - tenant_id = active_tenant_id
  │      - campus_id = assigned_campus_id
  ├── 4. Insert Duty Assignments:
  │      - staff_duty_assignments entries for each assigned Class/Section/Subject
  └── 5. Return Printable Credentials / Activation Link Slip
```

---

## 3. Granular Teacher Least-Privilege Scoping

In accordance with enterprise ERP security principles, standard teachers and lecturers must operate under strict least privilege:

| Operation | Permitted for Teacher? | Scoping & Restriction Rules |
| :--- | :---: | :--- |
| **View Student Profiles** | **YES** | Restricted strictly to students enrolled in their assigned Classes & Sections. |
| **Mark Daily Roll-Call** | **YES** | Permitted only for classes where designated as `CLASS_TEACHER`. |
| **Mark Period Attendance** | **YES** | Permitted only for classes and periods where assigned as `SUBJECT_TEACHER`. |
| **Enter Internal Assessment Marks**| **YES** | Permitted only for their assigned subject before the mark register lockdown deadline. |
| **Modify Published Marks** | **NO** | Blocked. Requires explicit Exam Controller / Principal unlocking. |
| **View Fee Ledgers / Balances** | **NO** | Blocked. Financial data restricted strictly to Accountant and Chairman. |
| **Access HR / Payroll Records** | **NO** | Blocked. Restricted strictly to HR Manager and Administrator. |
| **Modify Institution Settings** | **NO** | Blocked. Restricted strictly to Institution Admin. |
| **Platform Administration** | **NO** | Blocked. Forbidden from accessing `/platform/*` or any global API. |

---

## 4. Staff Account Lifecycle Governance

The platform must support complete lifecycle actions:
1. **Account Activation:** Faculty logs in for the first time with temporary credentials, is forced to complete password change at `/auth/password/first-login-setup`, and agrees to institutional IT policy.
2. **Account Suspension / Exit:** When a teacher leaves the institution or is suspended, setting `is_active=False` immediately invalidates all active JWT sessions in Redis (`test_13_session_revocation_terminates_active_sessions`).
3. **Duty Reassignment:** When faculty duties change mid-term, previous `staff_duty_assignments` are marked inactive (`is_active=False`) and new duties are assigned without destroying historical marks entry logs.

---

## 5. Required Stage 2 Remediation Plan

1. **Create Unified Staff Master Model (`apps/api/app/modules/academic/models.py`):**
   Add `StaffMaster` table linked to `users.id` with `employee_code`, `department`, `designation`, `qualification`, `joining_date`, `blood_group`.
2. **Expose Provisioning API Endpoint (`apps/api/app/api/v1/institution.py`):**
   Implement `POST /api/v1/institution/staff/provision` executing the atomic user creation, password hashing, and duty assignment pipeline.
3. **Add "Create Faculty" and "Import Faculty" Actions in Frontend:**
   Wire `StaffDutyAssignmentView.tsx` to this endpoint.

