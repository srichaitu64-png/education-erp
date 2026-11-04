# EDUCATIONOS – COMPLETE BUG REPORT & REMEDIATION LOG

**Document Version:** 2.0.0  
**Audit Date:** November 4, 2026  
**Auditor:** Application Security & QA Engineering Team  

---

## 1. Bug Severity Definitions
- **P0 (Critical Blocker)**: Violates tenant boundary, causes unauthorized privilege escalation, corrupts immutable financial/marks data, or blocks fundamental system workflow.
- **P1 (High Severity)**: Significant functional failure, misleading role representation (such as "same-view" dashboard), or missing mandatory academic capability.
- **P2 (Medium Severity)**: Workflow friction, partial status handling (e.g. converting Absent into zero), or non-critical validation omissions.
- **P3 (Low Severity / Usability)**: Visual alignment, minor labeling inconsistencies, or ergonomic improvements.

---

## 2. Bug Registry and Resolution Log

### Bug #001: The "Same-View" Dashboard Presentation Defect
- **Feature & Module:** Role-Based Presentation & Navigation (`apps/web/src/pages/demo/InteractiveDemoPage.tsx`)
- **Severity:** **P1 (High)**
- **Actual Observed Behaviour:**
  When switching between roles (e.g. Teacher, Accountant, Principal, Computer Operator, Transport Manager), the top cards and main overview widgets rendered identical institution-level KPIs (Total Enrolled, Scheduled Exams, Fee Collections, Active Bus Fleet) and the same static campus highlights.
- **Expected Behaviour:**
  Each authenticated role must receive a distinct, purpose-built dashboard workspace with role-relevant KPIs, pending work queues, permitted quick actions, and data tables conforming to the unified `#172B4D` / `#2563EB` / `#F6F8FC` design system.
- **Reproduction Steps:**
  1. Navigate to `/demo`.
  2. Switch role in dropdown to "Teacher (I PUC Physics)". Observe top cards showing "Total Enrolled: 6 Students", "Fee Collections: ₹85,000".
  3. Switch role to "Accountant". Observe identical top cards.
  4. Switch role to "Transport Manager". Observe identical top cards.
- **Root Cause:**
  `InteractiveDemoPage.tsx` lines 599–735 contained a single shared `<div>` block for `activeTab === 'dashboard'` without conditional dispatching based on `currentRole`.
- **Files Affected:** `apps/web/src/pages/demo/InteractiveDemoPage.tsx`, `apps/web/src/pages/demo/views/dashboards/*`
- **Fix Implemented:**
  Created 20 specialized dashboard view components under `apps/web/src/pages/demo/views/dashboards/` and implemented a dynamic Role Workspace Dispatcher that renders the dedicated workspace matching `currentRole`.
- **Regression Test & Result:**
  Verified via Playwright automated browser testing across Chairman, Principal, Accountant, Teacher, Computer Operator, Controller, Student, Parent, and Super Admin. Each workspace renders distinct, verified data.

---

### Bug #002: Dynamic Multi-Section Academic Structure & Capacity Enforcement
- **Feature & Module:** Academic Structure (`apps/web/src/store/demoStore.ts`, `apps/api/app/modules/academic/`)
- **Severity:** **P1 (High)**
- **Actual Observed Behaviour:**
  Classes were statically declared without support for variable section counts (e.g., Class 6 with A, B, C, D; I PUC PCMB with A, B, C, D, E, F), maximum capacity limits, or section transfer approval workflows.
- **Expected Behaviour:**
  Institutions must be able to configure arbitrary section codes, define classroom capacity (e.g., max 40 per section), prevent over-allocation, and record transfer requests with historical preservation.
- **Root Cause:**
  Academic sections were stored as simple string properties on student records rather than as first-class academic section entities with capacity constraints and enrolment registers.
- **Files Affected:** `apps/web/src/store/demoStore.ts`, `apps/web/src/pages/demo/views/AcademicStructureView.tsx`
- **Fix Implemented:**
  Introduced `AcademicSectionModel` and `StudentSectionEnrolment` state collections, supporting Class 6 (A-D), I PUC PCMB (A-F), real-time capacity checks, and auditable transfer requests.
- **Regression Test & Result:**
  Verified in automated unit tests: adding students up to section capacity succeeds; exceeding capacity triggers validation error; transferring sections retains historical exam and fee records.

---

### Bug #003: Staff Duty & Responsibility Assignment Engine
- **Feature & Module:** Staff Management & Duty Assignment (`apps/web/src/store/demoStore.ts`)
- **Severity:** **P1 (High)**
- **Actual Observed Behaviour:**
  Permissions were assigned broadly at the role level without scoped assignment of specific subjects and sections (e.g. Physics Teacher entering marks for unassigned sections or unassigned subjects).
- **Expected Behaviour:**
  Subject Teachers must only access assigned subjects in assigned sections. Computer Operators must only enter marks for explicitly assigned examinations and subjects without self-approval authority.
- **Root Cause:**
  Absence of a granular `StaffDutyAssignment` mapping entity connecting `staff_id`, `campus_id`, `class_name`, `section_id`, `subject_code`, and `role_scope`.
- **Files Affected:** `apps/web/src/store/demoStore.ts`, `apps/web/src/pages/demo/views/StaffDutyAssignmentView.tsx`
- **Fix Implemented:**
  Implemented `StaffDutyAssignment` engine with strict deny-by-default checks in the store and UI. Physics teachers cannot access Chemistry; Computer Operators cannot approve results.
- **Regression Test & Result:**
  Automated backend test `test_staff_duty_assignment_isolation()` passing cleanly.

---

### Bug #004: Multi-Component Marks Entry & Status Preservation
- **Feature & Module:** Examination & Marks Management (`apps/web/src/store/demoStore.ts`)
- **Severity:** **P1 (High)**
- **Actual Observed Behaviour:**
  Marks entry only tracked a single total marks field. Independent Theory max/obtained, Practical max/obtained, and Internal max/obtained were not uniformly editable or validated against subject-specific assessment patterns. Absent (A) was occasionally converted to numeric zero.
- **Expected Behaviour:**
  Configurable assessment breakdown per subject (e.g. Physics 70/20/10, Math 80/-/20). Dual interfaces (Individual card + Section-wise Excel register with keyboard navigation). Preserve 'A' (Absent), 'W' (Withheld), 'E' (Exempted) distinctly without converting to zero.
- **Root Cause:**
  `DemoExamMarks` schema lacked distinct component columns for `theory_obtained`, `practical_obtained`, and `internal_obtained`, and status enum was incomplete.
- **Files Affected:** `apps/web/src/store/demoStore.ts`, `apps/web/src/pages/demo/views/MarksEntryRegisterView.tsx`
- **Fix Implemented:**
  Extended data models with component marks, auto-calculated subject totals, percentage, and grade, and added an Excel-like section marks register supporting draft auto-saving and status preservation.
- **Regression Test & Result:**
  Automated test verifying Theory-only, Theory+Practical, Theory+Internal, and all-three subjects passed. Absent students recorded with status 'ABSENT' and total 'A'.

---

### Bug #005: Hall Ticket Generation & QR Eligibility Verification
- **Feature & Module:** Examination Management
- **Severity:** **P2 (Medium)**
- **Actual Observed Behaviour:**
  Examination schedules existed, but there was no integrated hall ticket generation module supporting eligibility checks, QR verification, and bulk PDF/ZIP printing.
- **Expected Behaviour:**
  Support individual and bulk section/class hall ticket generation, student photo, exam timetable, seat/room allocation, QR verification code, and configurable fee/attendance eligibility rules.
- **Root Cause:**
  Hall ticket generation was pending implementation.
- **Files Affected:** `apps/web/src/pages/demo/views/HallTicketManagementView.tsx`, `apps/web/src/store/demoStore.ts`
- **Fix Implemented:**
  Implemented `HallTicketManagementView` with eligibility rules engine, printable A4 card layout, verification QR code, and bulk export.
- **Regression Test & Result:**
  Generated hall tickets for I PUC PCMB Section A; verified QR content contains minimal tenant-safe verification signature.

---

### Bug #006: Accountant to Chairman Consolidated Fee Report Review Workflow
- **Feature & Module:** Finance & Fee Reporting (`apps/web/src/store/demoStore.ts`)
- **Severity:** **P2 (Medium)**
- **Actual Observed Behaviour:**
  Accountant could view fee reports and statements, but there was no formal workflow for taking an immutable snapshot, submitting it to the Chairman/Director for review, and recording Chairman approval or rejection remarks.
- **Expected Behaviour:**
  Accountant generates consolidated report, clicks "Submit to Chairman", which captures an immutable snapshot. Chairman reviews figures, downloads PDF/Excel, and clicks "Approve" or "Return with Remarks".
- **Root Cause:**
  Missing review workflow state machine on fee report snapshots.
- **Files Affected:** `apps/web/src/store/demoStore.ts`, `apps/web/src/pages/demo/InteractiveDemoPage.tsx`
- **Fix Implemented:**
  Added `ConsolidatedFeeReportSnapshot` data structure and submission/approval actions in demo store and view.
- **Regression Test & Result:**
  Tested submission by Accountant and approval by Chairman; verified snapshot figures remain frozen even if simulated new payments are collected later.

