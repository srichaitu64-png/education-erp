# Stage 1 Audit: Smart Data Import & Shared Migration Engine

**Document:** `AUDIT_REPORTS/SMART_IMPORT_AND_MIGRATION_AUDIT.md`  
**Evaluation Scope:** Central Data Migration Centre, Module-Level Ingestion Entry Points, XLSX/CSV Support, Fuzzy Column Mapping, Duplicate Matching Policies, and Asynchronous Processing.  
**Execution Timestamp:** 2026-11-05T07:25:00+05:30  
**Status:** PARTIALLY IMPLEMENTED (Frontend UI Complete / Backend Router Missing)  

---

## 1. Executive Summary

A thorough audit was conducted of the data migration architecture designed to onboard educational institutions mid-year without manual record-by-record re-entry.

The platform includes a sophisticated, unified 5-step modal migration wizard (`apps/web/src/components/migration/SharedImportWizardModal.tsx`, 622 lines of code) with pre-configured schemas for 7 modules: `STUDENTS`, `FEES`, `EXAMINATIONS`, `MARKS`, `ATTENDANCE`, `STAFF`, and `GENERAL`. The interface supports downloading standard CSV templates, previewing source columns, calculating mapping confidence scores (0.98), configuring conflict policies (`SKIP`, `MERGE`, `OVERWRITE`), and reviewing historical batch runs.

**The Backend Defect (`GAP-MIGR-01`):**
The FastAPI backend currently has **no migration router (`/api/v1/migration/*`)**, no database tables for migration jobs, and no asynchronous queue worker (Celery/Redis) to parse 10,000+ row spreadsheets in atomic transactions. In the frontend, clicking "Execute Import" triggers a `setTimeout` simulated job that commits to client-side Zustand memory (`useDemoStore`).

---

## 2. Ingestion Module Catalog & Field Configurations

| Target Module | Ingestion Category | Pre-Configured Fields | Downloadable Template | Conflict Policy Support | Frontend Implementation | Backend Implementation |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **STUDENTS** | Student Master & Enrolment | `admission_number`, `first_name`, `last_name`, `class_name`, `section_code`, `guardian_phone` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| | Admissions & Inquiries | `applicant_name`, `level`, `guardian_name`, `contact_number`, `previous_school` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| | Parent / Guardian Contacts | `student_admission_no`, `father_name`, `mother_name`, `primary_phone`, `emergency_contact` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| **FEES** | Opening Balances & Arrears | `admission_number`, `tuition_arrears`, `hostel_arrears`, `transport_arrears`, `due_date` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| | Fee Structures & Heads | `institution_level`, `class_name`, `head_code`, `annual_amount`, `installment_count` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| **EXAMINATIONS** | Exam Timetables & Schedules| `exam_code`, `class_name`, `subject_code`, `exam_date`, `session_time`, `room_number` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| **MARKS** | Theory & Practical Marks | `admission_number`, `subject_code`, `theory_obtained`, `practical_obtained`, `internal_obtained` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| **ATTENDANCE** | Daily Roll-Call Archive | `attendance_date`, `admission_number`, `class_section`, `status`, `absence_reason` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| | Biometric Punch Logs | `device_serial`, `user_id`, `punch_timestamp`, `verification_mode`, `direction` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| **STAFF** | Faculty Master Profiles | `employee_code`, `full_name`, `department`, `designation`, `qualification`, `contact_phone` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |
| | Staff Duty Assignments | `employee_code`, `duty_role`, `class_name`, `section_code`, `subject_code` | Yes (`.csv`) | `SKIP`, `MERGE`, `OVERWRITE` | `SharedImportWizardModal.tsx` | None |

---

## 3. Intelligent Mapping & Header Normalization Workflow

The migration engine must ingest messy, real-world school spreadsheets with varying column conventions:

```
[Incoming Legacy Header]                 [Normalized Key]               [EducationOS Target Field]
"Candidate Full Name"       --------->    "candidate_name"    --------->     first_name + last_name
"Pupil Father's Name"       --------->    "father_name"        --------->     father_name
"Contact / Mobile Number"   --------->    "mobile"            --------->     guardian_phone
"Std / Section"             --------->    "class_sec"         --------->     class_name + section_code
"Previous School Board"     --------->    "prev_board"        --------->     previous_institution
```

### Heuristic Matcher Pipeline:
1. **Exact Dictionary Aliases:** Pre-compiled synonym map (e.g. `{"pupil_name": "first_name", "adm_no": "admission_number"}`).
2. **Fuzzy String Distance:** Levenshtein ratio matching (similarity > 0.82 triggers auto-mapping recommendation).
3. **Optional External AI Mapping:** External LLM adapter (e.g., Gemini / Claude) to parse ambiguous tabular headers. External AI is strictly optional and falls back to deterministic manual mapping.
4. **Interactive Mapping UI:** The operator can review, re-bind, or create custom dynamic fields for unmatched columns.

---

## 4. Duplicate Detection & Difference Comparison

A matching name alone must **never** be used to identify an existing student. 
The matching engine utilizes compound keys:
- **Primary Match:** Tenant ID + Admission Number OR Registration Number OR PEN Number.
- **Secondary Match:** Tenant ID + Normalized Full Name + Date of Birth + Father/Guardian Mobile.

### Conflict Resolution Policies:
1. **`SKIP` (Default / Safest):** Existing database records are untouched. Incoming matching rows are discarded and logged in the skipped-records audit report.
2. **`MERGE`:** Only empty / null fields in the existing record are updated with incoming values. Existing non-null data is preserved.
3. **`OVERWRITE`:** Incoming row replaces existing fields.
   - **Protection Guard:** Published examination results and completed financial payment receipts are **immutable** and rejected from bulk overwrites regardless of policy.

---

## 5. Required Stage 2 Backend Architecture

To make the smart import engine fully operational:
1. **Create Database Models (`apps/api/app/modules/migration/models.py`):**
   - `MigrationBatch`: `id`, `tenant_id`, `target_module`, `file_name`, `status`, `total_rows`, `imported_rows`, `failed_rows`, `created_at`.
   - `MigrationRowError`: `id`, `batch_id`, `row_number`, `error_type`, `raw_data`, `error_message`.
2. **Create FastAPI Router (`apps/api/app/api/v1/migration.py`):**
   - `POST /api/v1/migration/template/{module}`: Returns downloadable CSV/XLSX template.
   - `POST /api/v1/migration/validate`: Parses uploaded file, runs regex/foreign-key validation, detects duplicates, and returns dry-run diff report.
   - `POST /api/v1/migration/execute`: Commits batch within atomic PostgreSQL savepoints (500 rows per chunk) with immediate rollback on fatal errors.
   - `GET /api/v1/migration/history`: Returns tenant-scoped batch history.

