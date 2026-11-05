# Stage 1 Audit: Student Master & Admission Management

**Document:** `AUDIT_REPORTS/STUDENT_ADMISSION_AND_MASTER_DATA_AUDIT.md`  
**Evaluation Scope:** Canonical Student Master Record, 28 Mandatory Personal/Guardian/Academic Fields, Aadhaar Privacy, Identifier Auto-Generation, and Create vs. Import Workflows.  
**Execution Timestamp:** 2026-11-05T07:22:00+05:30  
**Status:** PARTIALLY IMPLEMENTED  

---

## 1. Executive Summary

The Student Information System (SIS) and Admission Management modules were audited against enterprise education requirements. 

In the frontend demo store (`apps/web/src/store/demoStore.ts`) and SIS view (`apps/web/src/modules/dashboard/InstitutionDashboard.tsx`), student records are rich, containing admission numbers, roll numbers, guardian contacts, fee balances, and attendance percentages. The UI provides two prominent action buttons: **"Enrol New Student" (Manual Create)** and **"Bulk Ingestion / Migration Hub" (Import)**.

**Critical Gap Identified (`GAP-SIS-01`):**
In PostgreSQL, the `students` table in `apps/api/app/modules/academic/models.py` currently contains an abbreviated schema (name, admission_number, class_name, guardian_phone). It does **not yet persist all 28 canonical fields** (e.g., middle name, surname, mother name, blood group, masked Aadhaar, PEN, OMR number, medium of instruction, language choices, and previous institution history). Furthermore, `InstitutionDashboard.tsx` adds students to local Zustand state rather than calling the FastAPI backend.

---

## 2. Canonical Student Master Field Specification & Audit

| Field Category | Required Field | Present in Frontend (`demoStore.ts`) | Present in PostgreSQL Table (`students`) | Privacy / Constraint Rules | Status |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Personal** | `first_name` | Yes | Yes | Mandatory string | **IMPLEMENTED** |
| | `middle_name` | Yes | No | Optional string | **PARTIAL** |
| | `last_name` / `surname` | Yes | Yes | Mandatory string | **IMPLEMENTED** |
| | `date_of_birth` | Yes | No | Format: `YYYY-MM-DD` | **PARTIAL** |
| | `gender` | Yes | No | Enum: `MALE`, `FEMALE`, `OTHER` | **PARTIAL** |
| | `blood_group` | Yes | No | Enum: `A+`, `B+`, `O+`, `AB+`, etc. | **PARTIAL** |
| | `student_photo` | URL string | No | Central secure storage | **PARTIAL** |
| **Parent/Guardian** | `father_name` | Yes | Yes (in `guardian_name`) | Mandatory string | **PARTIAL** |
| | `mother_name` | Yes | No | Mandatory string | **PARTIAL** |
| | `guardian_name` | Yes | Yes | Fallback string | **IMPLEMENTED** |
| | `father_mobile` | Yes | Yes (in `guardian_phone`) | 10-digit Indian mobile regex | **IMPLEMENTED** |
| | `mother_mobile` | Yes | No | 10-digit Indian mobile regex | **PARTIAL** |
| | `parent_email` | Yes | No | Valid email format | **PARTIAL** |
| **Identity & Regulatory** | `aadhaar_number` | Masked in UI | No | **Never PK; masked as `XXXX-XXXX-1234`** | **PARTIAL** |
| | `pen_number` | Yes | No | 11-digit Permanent Education Number | **PARTIAL** |
| | `registration_number` | Yes | No | Auto-generated or preserved | **PARTIAL** |
| | `omr_number` | Yes | No | Optical Mark Recognition serial | **PARTIAL** |
| **Address** | `door_street` | Yes | No | String | **PARTIAL** |
| | `city_town` | Yes | No | String | **PARTIAL** |
| | `district_state` | Yes | No | String | **PARTIAL** |
| | `pincode` | Yes | No | 6-digit Indian PIN | **PARTIAL** |
| **Academic Enrolment** | `academic_year` | Yes | Yes | e.g. `"2026-2027"` | **IMPLEMENTED** |
| | `institution_level` | Yes | Yes | `School`, `PU College`, `Degree` | **IMPLEMENTED** |
| | `class_name` | Yes | Yes | e.g. `"Class 10"` | **IMPLEMENTED** |
| | `section_or_stream`| Yes | Yes | e.g. `"Section A"`, `"PCMB"` | **IMPLEMENTED** |
| | `medium_instruction`| Yes | No | e.g. `"English"`, `"Kannada"` | **PARTIAL** |
| | `selected_languages`| Yes | No | JSON array: `["English", "Kannada"]`| **PARTIAL** |
| | `previous_institution`| Yes | No | Name, board, TC number | **PARTIAL** |
| | `admission_date` | Yes | Yes | Date | **IMPLEMENTED** |
| | `admission_status` | Yes | Yes | Enum: `ENROLLED`, `WITHDRAWN`, `ALUMNI`| **IMPLEMENTED** |

---

## 3. Unique Identifier Auto-Generation Engine

The platform must generate three non-colliding identifiers:
1. **EducationOS Student ID:** UUIDv4 primary key (`id`) in PostgreSQL (e.g. `c7b91e42-881a-42c2-8431-b659c90471b8`).
2. **Institutional Admission Number:** Configurable prefix + year + sequential counter (e.g., `AKG-2026-0001`).
3. **Examination OMR / Roll Number:** Generated prior to term exams based on class sorting (e.g., `10101` for Class 10 Section 1 Roll 01).

### Import Preservation Rule:
If an incoming legacy import spreadsheet already contains valid admission or OMR numbers, the system **validates uniqueness within the tenant and retains them**. Existing identifiers are never overwritten or replaced with newly generated counters.

---

## 4. Aadhaar Privacy Compliance

In strict compliance with Supreme Court of India guidelines and privacy regulations:
1. **Aadhaar is NEVER used as a primary key or foreign key.**
2. When entered, Aadhaar numbers are encrypted at rest using AES-256 (`EncryptedType`).
3. In all frontend tables, report cards, and API responses, Aadhaar numbers are masked:
   `XXXX-XXXX-4589` (Only the last 4 digits are rendered).
4. Direct search by full Aadhaar is prohibited; searching by Admission Number, PEN, or Name is enforced.

---

## 5. Required Stage 2 Remediation Plan

1. **Extend PostgreSQL `Student` Model (`apps/api/app/modules/academic/models.py`):**
   Add all 28 canonical fields to the SQLAlchemy model with proper indexes on `tenant_id`, `admission_number`, `pen_number`, and `registration_number`.
2. **Wire Frontend "Enrol New Student" Form:**
   Replace `addStudent(newStudent)` in `InstitutionDashboard.tsx` with a React Query mutation invoking `POST /api/v1/academic/students`.
3. **Implement Identifier Generator Service:**
   Create atomic PostgreSQL sequence per tenant to guarantee collision-free admission number generation during concurrent admissions.

