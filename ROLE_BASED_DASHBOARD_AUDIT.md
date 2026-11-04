# EDUCATIONOS – ROLE-BASED DASHBOARD AUDIT & ARCHITECTURE SPECIFICATION

**Document Version:** 2.0.0  
**Audit Date:** November 4, 2026  
**Auditor:** Senior ERP Architect & UI/UX Design Lead  

---

## 1. Critical Problem Reproduction & Root Cause Analysis

### Problem Statement:
The previous demo implementation suffered from a **same-view dashboard defect**: when switching between different user roles (such as Chairman, Principal, Teacher, Accountant, Computer Operator, Driver, Parent), the application updated the top header label and allowed sidebar buttons, but the primary dashboard workspace rendered identical campus-level KPIs:
- Total Enrolled: 6 Students
- Scheduled Exams: 4 Institutional Exams
- Fee Collections: ₹85,000 Collected
- Active Bus Fleet: 2 GPS Routes
followed by the same static "Campus Operations & Academic Live Highlights".

### Root Cause:
In `apps/web/src/pages/demo/InteractiveDemoPage.tsx`, the tab handler `{activeTab === 'dashboard' && ...}` was implemented as a single static JSX block for all non-superadmin roles. It lacked a role-specific workspace dispatching architecture.

### Solution Architecture:
Implement a dynamic **Role Workspace Dispatcher** that selects and renders a purpose-built workspace component for each of the 20 distinct roles. Every workspace conforms to the **Unified Premium ERP Design System**:
- **Sidebar & Primary Brand:** `#172B4D` (Deep Navy)
- **Primary Action Blue:** `#2563EB`
- **Canvas / Workspace Background:** `#F6F8FC` (Clean Light Grey-Blue)
- **Content Cards:** `#FFFFFF` with subtle border `#E2E8F0` and soft shadows
- **Primary Text:** `#172B4D`
- **Secondary Text:** `#64748B`
- **Meaningful Status Tokens:** Success `#16A34A`, Warning `#D97706`, Error `#DC2626`.

---

## 2. Specification of the 20 Distinct Role Workspaces

Each workspace is designed around the authentic daily responsibilities of that role:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ EducationOS Application Shell                                               │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Deep Navy    │ Top Header: Campus Context • Academic Year • User Profile    │
│ Sidebar      ├──────────────────────────────────────────────────────────────┤
│ (#172B4D)    │ Dynamic Role Workspace (#F6F8FC canvas)                      │
│              │ ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│ - Dashboard  │ │ Role KPI 1   │ Role KPI 2   │ Role KPI 3   │ Role KPI 4   │ │
│ - My Work    │ └──────────────┴──────────────┴──────────────┴──────────────┘ │
│ - Modules    │ ┌─────────────────────────────┬────────────────────────────┐ │
│ - Reports    │ │ Pending Action Queue        │ Operational Telemetry/Table│ │
│ - Settings   │ └─────────────────────────────┴────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### 1. Chairman / Director Dashboard
- **Focus:** Institutional governance, financial sustainability, multi-campus performance.
- **Widgets:** Total Students across campuses (3,450), Term 1 Fee Collection Realization (₹85.4L / 77.6%), Overall Academic Pass Rate (94.2%), Teaching & Non-Teaching Staff Strength (142).
- **Queues:** High-Value Concession Approvals, Annual Results Seal, Executive Balance Sheet.

### 2. Institution Admin Dashboard
- **Focus:** System configuration, campus settings, user and role administration.
- **Widgets:** Active Campuses (3), Academic Year (2026-2027 Active), Configured Sections (18), Staff User Accounts (142).
- **Queues:** Pending User Provisioning, Class/Section Capacity Setup, Role Duty Audits.

### 3. Principal Dashboard
- **Focus:** Academic command centre, section strength, teacher supervision, examination publication approvals.
- **Widgets:** Student Attendance Today (96.5%), Faculty Attendance (98.2%), Exams Awaiting Final Seal (2), Section Transfers Pending (3).
- **Queues:** Stage 3 Exam Results Approval, Class Teacher Duty Roster, Student Conduct Flags.

### 4. Vice Principal Dashboard
- **Focus:** Delegated academic supervision, class supervision, timetable conflict resolution.
- **Widgets:** Supervised Sections (8 Sections in PU College), Missing Attendance Alerts (0), Timetable Room Conflicts (None), Marks Submission Progress (85%).
- **Queues:** Class Teacher Daily Check-in, Student Disciplinary Notices, Substitute Teacher Assignments.

### 5. Accountant Dashboard
- **Focus:** Financial command centre, daily collections, outstanding dues, fee reconciliation.
- **Widgets:** Today's Cash Collection (₹42,500), Monthly Realization (₹18.4L), Total Outstanding Dues (₹24.5L), Overdue Student Count (14).
- **Queues:** Quick Collect Fee Counter, Reconcile POS Bank Terminal, Generate Consolidated Fee Report for Chairman.

### 6. Subject Teacher / Lecturer Dashboard (e.g. Physics - I PUC)
- **Focus:** Teaching workspace, assigned classes, subject attendance, marks entry.
- **Widgets:** Assigned Sections (I PUC PCMB-A & PCMB-B), Today's Lecture Schedule (3 Lectures), Pending Class Attendance (1 Class), Marks Entry Tasks (Mid-Term Physics Paper).
- **Queues:** Take Period Roll Call, Enter Theory/Practical Marks, View Assigned Syllabus & Practical Experiments.

### 7. Computer Operator Dashboard
- **Focus:** Authorized data-entry queues, candidate statistics, document processing.
- **Widgets:** Assigned Data-Entry Batches (2 Batches), Pending Examination Records (45 Marks), Validation Error Flags (0), Completed Batches Today (3).
- **Queues:** Enter Chemistry Marks (I PUC PCMB-A on behalf of Dept), Bulk Excel Import Verification, Hall Ticket Print Batch.

### 8. Examination Controller Dashboard
- **Focus:** Examination administration, timetables, marks verification, result processing.
- **Widgets:** Upcoming Examinations (NEET Foundation & Half-Yearly), Registered Candidates (450), Pending Marks Verification (Stage 2: 3 Subjects), Hall Tickets Generated (100%).
- **Queues:** Audit Teacher-Submitted Marks, Return Invalid Entries with Remarks, Release Hall Tickets to Student Portals.

### 9. Admission Officer Dashboard
- **Focus:** Prospective student pipeline, application dossiers, section seat allocations.
- **Widgets:** New Inquiries This Week (48), Applications in Review (19), Verified Clearances (32), Available Section Capacity (Class 6: 12 seats, I PUC PCMB: 8 seats).
- **Queues:** Process Entrance Test Scores, Verify Birth Certificates & TCs, Allocate Admitted Students to Sections.

### 10. HR Manager Dashboard
- **Focus:** Staff directory, biometric attendance, leaves, payroll processing.
- **Widgets:** Total Faculty Strength (96), Present Today (94), Staff on Approved Leave (2), Contracts Expiring Next 30 Days (3).
- **Queues:** Approve Sick/Casual Leave Applications, Review Biometric Mismatches, Verify Monthly Payroll Register.

### 11. Laboratory In-Charge Dashboard
- **Focus:** Lab equipment inventory, valuations, calibration schedules, safety.
- **Widgets:** Total Laboratories (5 Labs), Total Inventory Valuation (₹23.49L), Low-Stock Consumable Alerts (1), Calibrations Due (1).
- **Queues:** Schedule Microscope Servicing, Approve Reagent Purchase Requisition, Conduct Annual Stock Physical Audit.

### 12. Lab Assistant Dashboard
- **Focus:** Assigned laboratory practical preparations, issue/return desk.
- **Widgets:** Assigned Lab (Sir C.V. Raman Physics Lab), Today's Practical Batches (2 Batches), Apparatus on Loan (18 Sets), Breakage Logs (0).
- **Queues:** Issue Optical Benches to Batch B-1, Log Sodium Vapour Lamp Return, Restock Lens Cleaning Paper.

### 13. Librarian Dashboard
- **Focus:** Library book catalogue, student circulation, overdue tracking.
- **Widgets:** Total Titles in Master Catalog (14,200), Books Currently Issued (480), Overdue Returns (18), Member Registrations (1,240).
- **Queues:** Front Issue/Return Circulation Desk, Send Overdue Return WhatsApp Alerts, Catalog New NCERT Arrivals.

### 14. Transport Manager Dashboard
- **Focus:** Vehicle fleet management, active routes, driver compliance, GPS telemetry.
- **Widgets:** Active Bus Fleet (8 Buses), Students Transported Daily (380), Routes in Transit (2 Morning Routes), Fuel & Insurance Expiry Alerts (1).
- **Queues:** Monitor Live GPS Telemetry, Assign Substitute Driver for Bus #3, Schedule Fitness Certificate Renewal.

### 15. Bus Driver Dashboard
- **Focus:** Assigned bus, route trip roster, safety checks.
- **Widgets:** Assigned Vehicle (Bus KA-04-E-8821), Assigned Route (Route #4 - Electronic City to Campus), Assigned Students on Route (42 Students), Trip Status (Scheduled: 07:15 AM).
- **Queues:** Pre-Trip Brake & Emergency Door Inspection Checklist, Start Morning Trip, View Student Pickup Stop Roster.

### 16. Hostel Warden Dashboard
- **Focus:** Hostel residential administration, room allocations, evening muster rolls.
- **Widgets:** Total Rooms (60 Rooms), Bed Occupancy Rate (92% - 184 Residents), Night Roll Call Attendance (100% Present Yesterday), Out-Pass Requests (4).
- **Queues:** Verify Weekend Out-Passes, Review Mess Food Committee Feedback, Record Daily Night Roll Call.

### 17. Parent Portal Workspace
- **Focus:** Child academic progress, attendance, fee dues, announcements.
- **Widgets:** Linked Child (Rahul Kumar - I PUC PCMB Section A), Academic Attendance (96.8%), Term 2 Fee Status (₹0 Due - Paid), Next Exam (Nov 29 - Physics Paper).
- **Queues:** Download Term 1 Progress Card PDF, View Hall Ticket QR Code, Review Today's Homework & Teacher Notes.

### 18. Student Portal Workspace
- **Focus:** Personal timetable, attendance percentage, exam dates, download hall tickets.
- **Widgets:** My Section (I PUC PCMB-A • Roll #14), My Overall Attendance (96.8%), Exam Hall Ticket (Ready for Download), Results Published (Term 1: Grade A+).
- **Queues:** Download Hall Ticket with QR, View Weekly Timetable, Check Today's Physics & Chemistry Assignments.

### 19. Institution Technical Support Workspace
- **Focus:** Consent-gated diagnostics, session expiry countdown, tenant audit logs.
- **Widgets:** Active Support Ticket (TCK-8819), Consent Authorization (Granted by Chairman: Dr. S. Rao), Session Time Remaining (03h 42m), Audit Logging (100% Immutable).
- **Queues:** Run Postgres RLS Integrity Check, Diagnose Webhook Latency, Revoke Session on Ticket Close.

### 20. Platform Super Admin Workspace
- **Focus:** Multi-tenant SaaS command, tenant provisioning, subscription billing.
- **Widgets:** Total Onboarded Institutions (1,248), Active Tenancies (1,180), MRR (₹48.5L / ARR ₹5.82 Cr), Active Students on Platform (4.82 Lakhs).
- **Queues:** 1-Click Provision New Tenant with Chairman Claim Link, Review Consent-Based Support Requests, Monitor Global API Health.
