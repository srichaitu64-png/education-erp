# EDUCATIONOS – ROLE & PERMISSION AUDIT

**Document Version:** 2.0.0  
**Audit Date:** November 4, 2026  
**Audited Scope:** 20 Enterprise Roles & Duty Assignments  

---

## 1. Role Architecture & Separation of Duties

EducationOS implements strict multi-tier Separation of Duties (SoD) across institutional governance, academic administration, teaching operations, finance, data entry, student lifecycle, and platform SaaS operations.

### Core Governance Rule:
1. **Platform Super Admin**: Manages multi-tenant cloud infrastructure and subscriptions. Strictly isolated from tenant academic records, student PII, and financial ledgers without explicit Chairman time-bound consent.
2. **Chairman / Director**: Chief institutional authority. Approves strategic budgets, high-value fee waivers, results publication, and user custom role permissions. Does NOT perform daily attendance or marks entry.
3. **Institution Admin**: Configures campuses, academic years, classes, and sections. Manages staff user accounts.
4. **Principal**: Academic executive. Supervise academic sections, assigns Class Teachers, approves transfers, and seals final examination results for public release. Strictly restricted from modifying central permission matrices or fee head structures.
5. **Vice Principal**: Delegated academic supervisor for assigned classes and courses. Monitors attendance conflicts and staff schedules.
6. **Class Teacher**: Manages assigned section, records daily attendance, and enters class remarks.
7. **Subject Teacher**: Enters marks and manages assignments **strictly for assigned subjects and sections**.
8. **Computer Operator**: Authorized data entry operator. Enters student profiles or marks **strictly for assigned examinations and sections**. Attributed as the actual data-entry operator; cannot approve own work.
9. **Examination Controller**: Supervises examination schedules, room allocations, hall ticket issuance, and verifies marks for errors or missing entries (Stage 2). Cannot publish results without Principal seal (Stage 3).
10. **Accountant**: Front counter cashier and financial officer. Collects fees across configurable fee heads, issues digital receipts, reconciles balances, and prepares consolidated fee reports for Chairman review. Locked from editing academic grades or student attendance.
11. **Admission Officer**: Manages prospective enquiries, document verification, application dossiers, and student allocation to section vacancies.
12. **HR Manager**: Manages faculty and staff profiles, biometric attendance, leave approvals, contracts, and payroll rosters.
13. **Laboratory In-Charge**: Oversees lab equipment master registers, valuation, calibration, and safety compliance across Physics, Chemistry, Biology, CS, and Electronics labs.
14. **Lab Assistant**: Executes daily practical preparations, material issue/return logging, and consumable stock entries.
15. **Librarian**: Manages catalogue, book circulation, reservations, and overdue fine registers.
16. **Transport Manager**: Manages bus fleet, GPS telemetry routes, driver allocations, and vehicle compliance.
17. **Bus Driver**: Accesses assigned vehicle and route trip roster, safety checklist, and authorized emergency contacts.
18. **Hostel Warden**: Manages hostel rooms, bed allocations, evening muster-roll roll calls, and night leave passes.
19. **Parent**: Read-only portal restricted **strictly to linked children**. Views attendance, timetable, homework, fee receipts, and published results.
20. **Student**: Read-only portal restricted **strictly to own academic records**, timetable, hall tickets, and published grades.

---

## 2. Role-by-Role Privilege & Scope Audit Table

| Role Identifier | Role Title | Permitted Actions | Approval Authority | Prohibitions & Hard Locks |
| :--- | :--- | :--- | :--- | :--- |
| `SUPER_ADMIN` | Platform Super Admin | Platform policies, quotas, billing, subscriptions | Tenant onboarding, global licenses | Locked from inspecting private tenant records without Chairman consent ticket. |
| `CHAIRMAN_DIRECTOR` | Chairman / Director | Campus oversight, budget allocation, custom roles | Concessions, staff hiring, result publication seal | Isolated to institutional tenant; cannot alter cloud SaaS billing or infrastructure. |
| `INSTITUTION_ADMIN` | Institution Admin | Campus settings, academic years, classes, sections | Admissions clearance, staff leave, budgets | Cannot alter platform tenancy quotas or SaaS licenses. |
| `PRINCIPAL` | Principal | Academic calendar, staff evaluations, room rosters | Final results publication seal, transfers | Locked from editing role permissions, permission matrices, or fee head definitions. |
| `VICE_PRINCIPAL` | Vice Principal | Timetable supervision, class checks, attendance | Student leaves, disciplinary reviews | Cannot approve financial disbursements or platform settings. |
| `CLASS_TEACHER` | Class Teacher | Assigned section attendance, conduct remarks | Section student leave requests | Cannot edit marks for subjects taught by other teachers. |
| `TEACHER` | Subject Teacher | Marks entry for assigned subjects/sections only | Draft marks submission (Stage 1) | Locked from unassigned subjects, unassigned sections, financial ledgers, and approvals. |
| `COMPUTER_OPERATOR` | Computer Operator | Marks entry for assigned exam/subject/section | None (Must submit to Controller) | Cannot approve own entries; cannot access financial records or unassigned exams. |
| `EXAM_CONTROLLER` | Examination Controller | Exam schedules, hall tickets, marks audit | Marks verification seal (Stage 2) | Cannot collect fees; cannot publish results without Principal seal (Stage 3). |
| `ACCOUNTANT` | Accountant | Multi-head fee collection, receipts, reconciliation | Refund requests (Dual approval required) | Locked from academic marks, examination schedules, student grades, and permissions. |
| `ADMISSION_OFFICER` | Admission Officer | Enquiries, applications, student section allocation | Provisional admission clearance | Locked from financial transactions and academic gradebooks. |
| `HR_MANAGER` | HR Manager | Staff biodata, leave registers, biometric logs | Staff leave requests | Locked from student grades, fee ledgers, and platform permissions. |
| `LAB_INCHARGE` | Laboratory In-Charge | Lab inventory catalog, calibration schedules | Purchase requests, stock disposal | Locked from modifying student grades, tuition fees, or HR records. |
| `LAB_ASSISTANT` | Lab Assistant | Material issue/return desk, consumable registers | None (Operational log only) | Locked from inventory purchasing or student grading. |
| `LIBRARIAN` | Librarian | Book catalogue, issue/return circulation desk | Book write-off recommendations | Locked from financial ledgers and academic examinations. |
| `TRANSPORT_MANAGER`| Transport Manager | Routes, bus stops, vehicle maintenance, GPS | Route assignments | Locked from student gradebooks, fees, and HR records. |
| `DRIVER` | Bus Driver | Assigned vehicle checklist, route trip status | None | No access to student grades, fees, or administrative settings. |
| `HOSTEL_WARDEN` | Hostel Warden | Room allocations, bed occupancy, attendance | Out-pass & night leave requests | Locked from academic gradebooks, exam schedules, and tuition fees. |
| `PARENT` | Parent / Guardian | View linked children's attendance, fees, results | Online fee payment | Strictly restricted to linked children only (IDOR prevented). |
| `STUDENT` | Student | View own timetable, attendance, hall tickets, results | None | Strictly restricted to own profile only (IDOR prevented). |

---

## 3. Backend Authorization Enforcement

Every endpoint in `apps/api/app/api/v1/` verifies:
1. `tenant_id` from JWT matches target resource.
2. `user_id` has valid active role in tenant.
3. Explicit duty assignment matches target `course_id`, `section_id`, and `subject_id` where applicable.
4. Deny-by-default on all unrecognized or unassigned actions.

