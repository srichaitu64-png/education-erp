# AUDIT REPORT 02: PLATFORM ROLE ARCHITECTURE AND SEPARATION AUDIT

**Audit Date**: 2026-11-05 06:51 IST  
**Auditor**: Senior SaaS Architect & Security Lead  
**Scope**: 5 Platform Roles + 12 Institution Roles  

---

## 1. Platform Roles vs. Institution Roles Matrix

| Role | Layer | DB Representation | Route Guard / Dep | API Access Scope | Status |
|---|---|---|---|---|---|
| **`PLATFORM_OWNER`** | Platform | `users.is_superadmin = true` | `get_current_superadmin` | Full SaaS platform: tenants, plans, global MRR, audit logs | VERIFIED |
| **`SUPER_ADMIN`** | Platform | `users.is_superadmin = true` | `get_current_superadmin` | Tenant onboarding, feature overrides, access designer | VERIFIED |
| **`BACKUP_SUPER_ADMIN`**| Platform | `users.is_superadmin = true` | `get_current_superadmin` | Emergency failover administration root | VERIFIED |
| **`PLATFORM_DEVELOPER`**| Platform | `users.is_superadmin = false`| `get_current_user` | Zero ambient access to institutional records | VERIFIED |
| **`PLATFORM_SUPPORT`**  | Platform | `users.is_superadmin = false`| `PlatformSupportAccessSession` | Time-limited, tenant-scoped, audited support tickets only | VERIFIED |
| **`CHAIRMAN_DIRECTOR`** | Institution| `user_roles` (`tenant_id`) | `require_permission` | Institution-wide performance, fee realization, snapshot signoff | VERIFIED |
| **`PRINCIPAL`**         | Institution| `user_roles` (`tenant_id`) | `require_permission` | Academic approvals, section capacity, duty assignments | VERIFIED |
| **`VICE_PRINCIPAL`**    | Institution| `user_roles` (`tenant_id`) | `require_permission` | Class teacher rosters, student transfers, curriculum tracker | VERIFIED |
| **`INSTITUTION_ADMIN`** | Institution| `user_roles` (`tenant_id`) | `require_permission` | Institutional settings, campus configuration, user directory | VERIFIED |
| **`ACCOUNTANT`**        | Institution| `user_roles` (`tenant_id`) | `require_permission` | Fee collection counter, receipts, consolidated ledgers | VERIFIED |
| **`EXAM_CONTROLLER`**   | Institution| `user_roles` (`tenant_id`) | `require_permission` | Examination lifecycle, CBT/paper schedules, marks verification | VERIFIED |
| **`TEACHER` / `LECTURER`**| Institution| `user_roles` (`tenant_id`)| `require_permission` | Classroom attendance roll-call, marks entry, syllabus progress | VERIFIED |
| **`ADMISSION_OFFICER`** | Institution| `user_roles` (`tenant_id`) | `require_permission` | Admissions pipeline, enquiries, lead conversion | PARTIALLY VERIFIED |
| **`HR_MANAGER`**        | Institution| `user_roles` (`tenant_id`) | `require_permission` | Staff directory, invigilation duties, leave approvals | PARTIALLY VERIFIED |
| **`TRANSPORT_MANAGER`** | Institution| `user_roles` (`tenant_id`) | `require_permission` | Bus routes, vehicle fleet, driver rosters, live GPS | PARTIALLY VERIFIED |
| **`PARENT`**            | Institution| `user_roles` (`tenant_id`) | `require_permission` | Ward fee receipts, daily attendance %, progress cards | VERIFIED |
| **`STUDENT`**           | Institution| `user_roles` (`tenant_id`) | `require_permission` | Timetable, hall ticket download, result notice board | VERIFIED |

---

## 2. Platform Owner vs. Institutional Chairman Separation

### Evidence & Verification
1. **Database Separation**:
   * Institutional Chairmen (`CHAIRMAN_DIRECTOR`) are scoped to a specific `tenant_id` in `user_roles` (`apps/api/app/modules/identity/models.py`, lines 99-100).
   * Platform Owners (`PLATFORM_OWNER`) possess `is_superadmin = true` on the `users` table without being restricted to any single institution.
2. **Endpoint Fencing**:
   * Platform routes (`apps/api/app/api/v1/platform.py`) are protected by `get_current_superadmin` (`apps/api/app/security/deps.py`, line 123).
   * When an institutional Chairman calls `/api/v1/platform/*`, the backend returns **HTTP 403 Forbidden**.
   * Test Evidence: Verified by `tests/platform/test_saas_platform_architecture_audit.py::test_01_two_administrative_layers_strictly_separated` (PASSED).

---

## 3. Privilege Escalation Protection Audit

### Audit Questions
* Can an Institution Administrator promote themselves or another user to `PLATFORM_OWNER` or `SUPER_ADMIN`?
* Can an Institution Administrator assign permissions outside their tenant scope?

### Findings & Evidence
* **API Protection**: In `apps/api/app/api/v1/platform.py`, the user assignment endpoint `POST /platform/permissions/users/assign` is strictly gated behind `get_current_superadmin` (lines 381-385).
* **Test Verification**: Tested by `tests/platform/test_saas_platform_architecture_audit.py::test_03_institution_admin_cannot_promote_to_platform_owner`.
  * Institution Admin attempt to call `/api/v1/platform/permissions/matrix` -> **HTTP 403 Forbidden**.
  * Institution Admin attempt to assign `SUPER_ADMIN` role -> **HTTP 403 Forbidden**.
* **Verdict**: PASS. No horizontal or vertical privilege escalation detected.

---

## 4. Platform Developer Least-Privilege Audit

### Audit Questions
* Do Platform Developers receive ambient access to student records, fee amounts, or attendance?
* What mechanisms govern emergency technical support?

### Findings & Evidence
* Platform developers are assigned `is_superadmin = false`.
* Without a tenant context, calls to `/api/v1/institution/*` return **HTTP 400 Bad Request** (`apps/api/app/api/v1/institution.py`, line 31).
* Emergency access is enforced through `PlatformSupportAccessSession` (`apps/api/app/modules/identity/models.py`, lines 233-249):
  1. Super Admin requests session with mandatory justification (`scope="READ_ONLY_DIAGNOSTICS"`).
  2. Institution Admin must approve ticket (`status="APPROVED"`).
  3. Session carries an automatic time-limit expiry (`expires_at = now + 60 minutes`).
  4. Revocation is instantaneous (`POST /api/v1/platform/support-sessions/{id}/revoke`).
* Test Evidence: Verified by `tests/platform/test_saas_platform_architecture_audit.py::test_02_platform_developer_least_privilege_and_support_consent` (PASSED).
* **Verdict**: PASS.

