# EducationOS Enterprise – Role Audit Matrix

**Specification Standard:** Multi-Tenant Role-Based Access Control (RBAC)  
**Security Model:** Deny-by-default, Cryptographic Tenant Isolation, Maker-Checker Controls  

---

## Organizational Level Breakdown

### LEVEL 1: SAAS PLATFORM OWNER ORGANISATION (Private Platform Root)

| Role Code | Title / Identity | Login Route | Primary Scopes & Functions | Explicit Restrictions |
| :--- | :--- | :--- | :--- | :--- |
| `SUPER_ADMIN` | Platform Super Admin (SaaS Owner) | `/platform/login` | Global tenancy provisioning, plan pricing, feature gating, SaaS MRR & ARR analytics, platform audit trails. | **Zero direct access** to private student gradebooks or fee ledgers without explicit, time-limited tenant consent ticket. |
| `BACKUP_SUPER_ADMIN` | Secondary Platform Admin | `/platform/login` | Secondary disaster recovery, failover validation, read-only platform configuration inspection. | Cannot revoke primary superadmin credentials; read-only on destructive platform operations. |
| `DEVELOPER` | Platform Developer / Support | `/platform/login` | API latency metrics, query performance diagnostics, background worker queue health telemetry. | Strictly prohibited from viewing decrypted student PII and tenant financial accounts. |

---

### LEVEL 2: INDEPENDENT SCHOOL & COLLEGE CAMPUS (Akshara Global Campus)

| Role Code | Title / Identity | Login Route | Primary Scopes & Functions | Explicit Restrictions |
| :--- | :--- | :--- | :--- | :--- |
| `CHAIRMAN_DIRECTOR` | Chairman / Director (Institution Super Admin) | `/login` | Campus governance, executive oversight, permission matrix modification, dashboard designer, custom fee heads. | Cannot alter teacher draft marks directly; bound strictly to `tenant-akshara` database scope. |
| `PRINCIPAL` | Principal (Academic Head) | `/login` | Academic leadership, final examination result approvals, staff duty assignments, progress card signing. | Cannot modify bank accounts, delete immutable fee receipts, or change platform tenant plans. |
| `VICE_PRINCIPAL` | Vice Principal | `/login` | Secondary academic supervision, daily attendance approval, student discipline records, timetable monitoring. | Subordinate approval authority; cannot override Principal exam sanctions. |
| `ACCOUNTANT` | Senior Accountant / Finance Officer | `/login` | Counter fee collection, partial payment receipts (A4/thermal), multi-head allocation, bank settlement ledger. | **Strictly locked out** of modifying student marks, changing hall tickets, or publishing exam results. |
| `EXAM_CONTROLLER` | Controller of Examinations | `/login` | Exam scheduling (17 categories), hall-ticket generation, moderator mark verification, notice board publication. | Cannot collect fees, issue fee concessions, or alter institution governance policies. |
| `TEACHER` | Subject Teacher (Physics) | `/login` | Daily roll-call attendance, multi-component mark entry (Theory 70 / Lab 30) for assigned classes. | Cannot publish final exam results or access financial/salary records. |
| `LECTURER` | Senior PU Lecturer (Science) | `/login` | PU competitive mock tests (NEET/JEE/KCET Foundation), practical examinations, student performance grading. | Cannot collect student fees; cannot access other streams or school sections. |
| `COMPUTER_OPERATOR` | Examination Data Entry Operator | `/login` | High-speed draft mark transcription, student admission record drafting. | **Approval Denied by Default**: Cannot approve marks, publish results, grant fee waivers, or delete records. |
| `ADMISSION_OFFICER` | Admissions Manager | `/login` | Enquiry management, online applications pipeline, document verification, section seat allocation. | Cannot schedule examinations or approve academic results. |
| `HR_MANAGER` | HR & Staff Manager | `/login` | Faculty directory, teaching duty rosters, staff attendance, leave management, employment profiles. | Cannot view student examination papers or access fee collection counters. |
| `LIBRARIAN` | Chief Librarian | `/login` | Book cataloging, issue/return circulation, overdue fines, book reservation queues. | No access to student examination gradebooks or tuition fee ledgers. |
| `LAB_INCHARGE` | Laboratory In-Charge | `/login` | Chemical inventory, QR code stock scanning, hazardous reagent expiration tracking, practical schedules. | No access to tuition fee collections or academic exam publishing. |
| `HOSTEL_WARDEN` | Hostel Warden | `/login` | Room allocation, occupancy rosters, night roll call, gate pass approvals, hostel fee dues tracking. | Cannot modify academic grades or tuition fee schedules. |
| `TRANSPORT_MANAGER`| Fleet Manager | `/login` | Bus route configurations, stop timings, driver assignments, vehicle fitness/fuel logs. | Cannot access marks registers or student report cards. |
| `DRIVER` | Bus Driver (Route 104) | `/login` | Pickup stop roster, one-tap trip status toggle (Start/Complete Trip), live telemetry broadcast. | Cannot view academic or financial records. |
| `PARENT` | Parent / Guardian (Ramesh Kumar) | `/login` | View linked child (Rahul Kumar), download official fee receipts, view report cards, track bus GPS. | **Strictly isolated**: Cannot see any other child's marks, receipts, or attendance records. |
| `STUDENT` | Student (Rahul Kumar - I PUC) | `/login` | Self-service timetable, download hall ticket, view progress report, NEET mock diagnostic analytics. | Read-only portal; cannot edit any administrative records or marks. |
