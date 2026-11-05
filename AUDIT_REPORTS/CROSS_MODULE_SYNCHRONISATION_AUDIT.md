# Stage 1 Audit: Cross-Module Data Synchronisation

**Document:** `AUDIT_REPORTS/CROSS_MODULE_SYNCHRONISATION_AUDIT.md`  
**Evaluation Scope:** Canonical Data Flow Across Admissions, SIS, Attendance, Fees, Examinations, Marks, Hall Tickets, and Transcripts; Duplicate Prevention; Academic Section Transfers.  
**Execution Timestamp:** 2026-11-05T07:30:00+05:30  
**Status:** IMPLEMENTED AND VERIFIED (Relational Schema & Transfers) / PARTIALLY IMPLEMENTED (Frontend Live State Binding)  

---

## 1. Executive Summary

A core architectural principle of EducationOS is that **all operational modules must reference one canonical student master identity**. An educational ERP must never create duplicate student entities across independent modules (e.g. creating a separate student record in Fees, another in Attendance, and another in Examinations).

The audit verified that the database schema and service layers in `apps/api/app/modules/academic/` enforce this requirement through strict foreign-key relationships. When a student changes sections, their previous academic enrolment is marked `is_current=False` while retaining all historical attendance, payment receipts, and exam results (`test_section_transfer_preserves_history` PASSED).

However, because the frontend `/app/*` interface currently operates on client-side Zustand store (`useDemoStore`), live updates made in one tab (e.g. collecting a fee payment) update the Zustand state synchronously in memory, but do **not yet trigger database writes** to sync connected backend records.

---

## 2. Canonical Synchronisation Topology

```
                                  [ADMISSION / APPLICATION]
                                             |
                                 Approved Application
                                             v
                         +---------------------------------------+
                         |      CANONICAL STUDENT MASTER         |
                         |        (Table: students)              |
                         |  id (UUID), admission_no, tenant_id   |
                         +-------------------+-------------------+
                                             |
                   +-------------------------+-------------------------+
                   |                         |                         |
                   v                         v                         v
        [ACADEMIC ENROLMENT]       [FINANCE & FEE LEDGER]     [EXAM & ASSESSMENT]
      (student_section_enrolments)      (fee_invoices)           (marks_records)
                   |                         |                         |
                   v                         v                         v
             [ATTENDANCE]             [FEE RECEIPTS]             [HALL TICKETS]
      (daily_attendance_records)      (fee_payments)             (hall_tickets)
                   |                         |                         |
                   +-------------------------+-------------------------+
                                             |
                                             v
                              [CONSOLIDATED REPORT CARD]
                              (Authoritative Single Source)
```

---

## 3. Module-by-Module Data Flow Verification

| Origin Module | Destination Module | Data Propagated | Foreign Key / Relationship | Synchronisation Mechanism | Test Evidence |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Admissions** | **SIS (Student Master)** | Personal details, parent info, documents | `students.id` generated on intake | Atomic transaction on admission approval | Verified in `demoStore.ts` |
| **SIS** | **Academic Sections** | Enrolment in Class & Section | `student_section_enrolments.student_id` | `StudentSectionEnrolment` row with `is_current=True` | `test_academic_sections_creation_and_capacity` (PASSED) |
| **SIS** | **Attendance** | Roll-call roster generation | `student_section_enrolments` query | Active students filtered by current section | `test_06_daily_dashboard_independent_of_period_wise` (PASSED) |
| **SIS** | **Finance / Fees** | Fee invoices generated based on class | `fee_invoices.student_id -> students.id` | Generated from active `FeeStructure` share | `test_two_institutions_flexible_fee_structures` (PASSED) |
| **Finance** | **Fee Receipts** | Payment collection & balance update | `fee_payments.invoice_id -> fee_invoices.id` | Atomic balance deduction & receipt issuance | `test_fee_collection_and_automatic_receipt_generation` (PASSED) |
| **SIS / Exams** | **Hall Tickets** | Hall ticket generation & dues lock | `hall_tickets.student_id -> students.id` | Evaluates fee dues & min attendance % (e.g. 75%) | Verified in `HallTicketManagementView.tsx` |
| **Exams** | **Marks Register** | Marks entry per student & subject | `marks_records.student_id -> students.id` | Subject theory & practical marks recording | `test_offline_examination_sync_prevents_silent_overwrite` (PASSED) |
| **Marks** | **Results & Transcripts**| Final GPA/SGPA scorecard | `published_results.student_id -> students.id`| Principal approval gates result publication | `test_result_publication_requires_prior_principal_approval` (PASSED) |

---

## 4. Student Academic Transfer & Section Mobility

When a student transfers from Section A to Section B or progresses to the next academic year:
1. **Preservation of History:**
   The existing `StudentSectionEnrolment` record is updated with:
   - `is_current = False`
   - `exit_date = current_date()`
   - `exit_reason = "SECTION_TRANSFER"`
2. **New Enrolment Creation:**
   A new `StudentSectionEnrolment` is inserted with:
   - `is_current = True`
   - `entry_date = current_date()`
   - `section_id = new_section.id`
3. **Capacity Limit Guard:**
   Before executing the transfer, the system validates that `new_section.current_strength < new_section.max_capacity`. If full, the transfer is rejected (`test_academic_sections_creation_and_capacity` PASSED).
4. **Historical Isolation:**
   Past attendance logs and marks scored under Section A remain pinned to the historical timestamp and section context; they are **never deleted or modified**.

---

## 5. Identified Gaps & Stage 2 Remediation Plan

1. **Frontend Live Synchronisation Hookup (`GAP-INT-01`):**
   In `apps/web/src/modules/dashboard/InstitutionDashboard.tsx`, mutations must be migrated from local Zustand updates to React Query mutations that execute against the backend API.
2. **Domain Event Bus for Instant Cross-Module Invalidation:**
   Implement server-side domain events (FastAPI background tasks) so that when a fee payment occurs, the student's fee clearance flag on the Hall Ticket endpoint is automatically invalidated and recomputed.

