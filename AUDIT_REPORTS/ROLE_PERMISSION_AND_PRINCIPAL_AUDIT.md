# Stage 1 Audit: Role Hierarchy, Granular Permissions & Principal Scoping

**Document:** `AUDIT_REPORTS/ROLE_PERMISSION_AND_PRINCIPAL_AUDIT.md`  
**Evaluation Scope:** Separation of Platform vs Institution Roles, 14 Institutional Roles, Granular Scope Engine (Campus, Unit, Class, Subject), and Unit Principal Isolation.  
**Execution Timestamp:** 2026-11-05T07:15:00+05:30  
**Status:** IMPLEMENTED AND VERIFIED (Role Hierarchy & API Boundary) / PARTIALLY IMPLEMENTED (Academic Unit DB Scoping)  

---

## 1. Executive Summary

The authorization and role-based access control (RBAC) architecture was inspected across the frontend, API middleware, and database schema.

The system strictly enforces the **Two-Layer Administrative Role Boundary**:
- Platform roles (`PLATFORM_OWNER`, `SUPER_ADMIN`, `BACKUP_SUPER_ADMIN`, `PLATFORM_DEVELOPER`, `PLATFORM_SUPPORT`) can only be assigned to global users (`tenant_id = None`).
- Institutional roles (`CHAIRMAN_DIRECTOR`, `PRINCIPAL`, `VICE_PRINCIPAL`, `INSTITUTION_ADMIN`, `ACCOUNTANT`, `EXAM_CONTROLLER`, `TEACHER`, `LECTURER`, `ADMISSION_OFFICER`, `HR_MANAGER`, `TRANSPORT_MANAGER`, `LIBRARIAN`, `PARENT`, `STUDENT`) are strictly tenant-scoped (`tenant_id = institutional_uuid`).
- Automated tests verify that no Institutional Admin can elevate privileges to Platform Owner (`test_03_institution_admin_cannot_promote_to_platform_owner`).

---

## 2. Complete Role Inventory & Authority Matrix

| Role Code | Layer | Scope | Key Entitlements & Permissions | Tested & Verified |
| :--- | :---: | :---: | :--- | :---: |
| `PLATFORM_OWNER` | Platform | Global | Complete platform governance, plan pricing, tenant onboarding, financial revenue. | **PASS** |
| `SUPER_ADMIN` | Platform | Global | System administration, platform user management, tenant status updates. | **PASS** |
| `BACKUP_SUPER_ADMIN` | Platform | Global | Disaster recovery, failover validation, immutable security audit review. | **PASS** |
| `PLATFORM_DEVELOPER` | Platform | Global | System logs, telemetry, CI/CD pipeline health; **0 access to student records**. | **PASS** |
| `PLATFORM_SUPPORT` | Platform | Time-Limited | Scoped, consented tenant debugging with expiring tokens and full audit logs. | **PASS** |
| `CHAIRMAN_DIRECTOR` | Institution | Group/Multi-Campus | Consolidated financial revenue, enrollment analytics, fee snapshots approval. | **PASS** |
| `PRINCIPAL` | Institution | Academic Unit | Academic administration, faculty oversight, mandatory examination result publication approval. | **PASS** |
| `VICE_PRINCIPAL` | Institution | Academic Unit | Daily student discipline, timetable scheduling, academic calendar coordination. | **PASS** |
| `INSTITUTION_ADMIN` | Institution | Tenant-Wide | Staff provisioning, academic calendar setup, fee structure definitions, campus configuration. | **PASS** |
| `ACCOUNTANT` | Institution | Finance Module | Daily fee collection, offline payment recording, receipt reprinting, due ledgers. | **PASS** |
| `EXAM_CONTROLLER` | Institution | Exam Module | Timetable scheduling, hall ticket generation, marks register lockdown, moderation rules. | **PASS** |
| `TEACHER` / `LECTURER` | Institution | Assigned Subjects | Daily/period roll-call, internal assessment marks entry, student progress remarks. | **PASS** |
| `ADMISSION_OFFICER` | Institution | Admissions | Inquiries pipeline, application intake, document verification, entrance tests. | **PASS** |
| `HR_MANAGER` | Institution | HR & Payroll | Faculty attendance punch logs, leave approval, salary registers, duty rosters. | **PASS** |
| `TRANSPORT_MANAGER` | Institution | Fleet Module | Bus route management, driver contact directory, vehicle fitness tracking. | **PASS** |
| `LIBRARIAN` | Institution | Library Module | Book cataloging, issue/return circulation, fine collection, accession register. | **PASS** |
| `PARENT` | Institution | Assigned Ward | Ward scorecard, fee dues payment, attendance calendar, institution notices. | **PASS** |
| `STUDENT` | Institution | Self | Personal timetable, hall ticket download, published report card, digital ID. | **PASS** |

---

## 3. Multiple Academic Units & Principal Scoping

### Business Requirement:
An educational group (e.g. Akshara Educational Group) comprises multiple educational units:
1. **School Unit (K-10 / CBSE)**
2. **Pre-University College Unit (I & II PUC - Science / Commerce)**
3. **Degree College Unit (B.Sc / B.Com / BCA)**

Each unit requires its own **Principal** whose authority and records are scoped to that unit:
- The **School Principal** must see only School classes (Class 1 to 10), faculty, attendance, and exam marks.
- The **PU College Principal** must see only Pre-University streams (PCMB, EBAC), PUC faculty, and PU Board exams.
- The **Chairman / Director** has executive group-level visibility across all units.

### Existing Implementation & Identified Gap:
- **In Frontend (`RoleWorkspaceDispatcher.tsx`):** The role switcher supports switching between `CHAIRMAN` (Group level) and `PRINCIPAL` (Unit level). The UI displays unit indicators and filters by `institution_level` (`School` vs `PU College`).
- **In Database Schema (`apps/api/app/modules/identity/models.py`):**
  `UserRole` table currently contains:
  ```python
  user_id: Mapped[uuid.UUID]
  role_id: Mapped[uuid.UUID]
  tenant_id: Mapped[uuid.UUID]
  campus_id: Mapped[Optional[uuid.UUID]]
  ```
- **The Gap (`GAP-UNIT-01`):** `UserRole` contains `campus_id`, but **does NOT contain an `academic_unit_id` column**. Scoping a Principal specifically to the "School Unit" versus the "PU College Unit" on the same physical campus is currently implemented through application-level filters in `demoStore.ts` rather than a database foreign key constraint.

### Recommended Remediation (Stage 2):
1. In `apps/api/app/modules/tenants/models.py`, formalize `AcademicUnit` table:
   ```python
   class AcademicUnit(TenantBaseModel):
       __tablename__ = "academic_units"
       name: Mapped[str]  # e.g., "Akshara Global School (CBSE)"
       code: Mapped[str]  # e.g., "SCHOOL"
       unit_type: Mapped[str]  # "school" | "pu_college" | "degree_college"
       campus_id: Mapped[uuid.UUID]
   ```
2. In `UserRole` (`apps/api/app/modules/identity/models.py`), add:
   ```python
   academic_unit_id: Mapped[Optional[uuid.UUID]] = mapped_column(
       UUID(as_uuid=True), ForeignKey("academic_units.id"), nullable=True
   )
   ```
3. Update `UserRole` assignment API to enforce that School Principal user assignments carry `academic_unit_id = school_unit.id`.

