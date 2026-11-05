# Stage 1 Audit: Akshara Global & OUR SCHOOL Transformation Plan

**Document:** `AUDIT_REPORTS/AKSHARA_OUR_SCHOOL_TRANSFORMATION_PLAN.md`  
**Evaluation Scope:** Database Inventory of Existing Akshara Tenant, Foreign-Key Relationships, Risk Analysis, and Blueprint for the Two Independent Institutions.  
**Execution Timestamp:** 2026-11-05T07:20:00+05:30  
**Status:** AUDITED — READY FOR STAGE 2 APPROVAL  

---

## 1. Executive Summary

In accordance with the user's master directive, the platform must configure exactly two distinct institutions:
1. **OUR SCHOOL — LIVE DEMO:** The public demonstration environment, transformed from the existing Akshara Global baseline, populated with exactly three connected fictional demo students and a demo reset mechanism.
2. **AKSHARA GLOBAL SCHOOL AND PU COLLEGE — NEW TRIAL INSTITUTION:** A completely new, independent production-grade tenant with `TRIAL ACTIVE` subscription status, separate School and PU College units, separate Principals, Chairman/Director accounts, and zero demo mock data.

**Critical Safety Directive:**
Before modifying any database records, the existing tenant structure was thoroughly inspected to ensure that converting the current record to `OUR SCHOOL` will not break foreign key references or destroy legitimate pilot data.

---

## 2. Current Database Baseline of Akshara Global

### Existing Tenant Identification (`education_erp_dev`):
- **Tenant UUID:** `66601a28-a6e4-4cc8-857b-b9963e222e3b`
- **Name:** `"Akshara Global School & College"`
- **Code:** `"akshara"`
- **Institution Type:** `"composite_group"`
- **Status:** `"active"`
- **Subdomain:** `"akshara"`
- **Referenced Campus:** `Akshara Global Main Campus` (`code: "MAIN"`, `is_main: True`)
- **Referenced User:** `principal@akshara.edu.in` (`Dr. Ramesh Kumar`, Role: `INSTITUTION_ADMIN`, User UUID: `8ac00b6f-1ae1-4e80-8968-341490dfe2dc`)
- **Active Subscription:** `STANDARD` Plan (Tier 2, Annual billing cycle)

### Dependency Tree & Foreign-Key Audit:
All records referencing `66601a28-a6e4-4cc8-857b-b9963e222e3b` were verified:
1. `campuses` (1 record) -> FK `tenant_id`
2. `subscriptions` (1 record) -> FK `tenant_id`
3. `user_roles` (1 record) -> FK `tenant_id`
4. `examinations` (3 records seeded in `seed.py`) -> FK `tenant_id`
5. `fee_structures` (2 records seeded in `seed.py`) -> FK `tenant_id`
6. `fee_invoices` (3 records seeded in `seed.py`) -> FK `tenant_id`
7. `institution_attendance_configs` (1 record) -> FK `tenant_id`

**Verdict on Reusing Existing Tenant for OUR SCHOOL:**
Retaining UUID `66601a28-a6e4-4cc8-857b-b9963e222e3b` and renaming its display name to **OUR SCHOOL** (`code: "our-school"`, `subdomain: "demo"`) is **100% technically safe**:
- It cleanly preserves all existing foreign-key constraints without orphaned records.
- The 3 pilot student invoices already seeded in `seed.py` (`Aarav Sharma`, `Ananya Hegde`, `Rohan Verma`) exactly match the three fictional personas required for OUR SCHOOL!
- It ensures that no legacy Akshara pilot identifiers remain associated with live demo traffic.

---

## 3. Institution 1: OUR SCHOOL (Live Demo Specification)

### Target Configuration:
- **Tenant ID:** `66601a28-a6e4-4cc8-857b-b9963e222e3b` (Preserved)
- **Display Name:** `OUR SCHOOL (Demo Campus)`
- **Code:** `our-school`
- **Subdomain:** `demo`
- **Status:** `active`
- **Primary Color:** `#4338CA` (Midnight Indigo), Secondary: `#0D9488` (Electric Teal)
- **Dedicated Demo Login:**
  - Route: `/demo` or `/login`
  - Initial Username: `admin`
  - Initial Password: `demo123`
  - Flag: `must_change_password = False` (Demo mode preserves seamless evaluation)

### Fictional 3-Student Dataset:
1. **Student 1 (School K-10):**
   - **Name:** Aarav Sharma
   - **Admission No:** `ADM-2026-001`, Roll No: `101`
   - **Unit & Class:** School Unit — Class 10, Section A
   - **Connected Data:** 96.5% attendance, paid tuition fee (`INV-2026-0091`, ₹35,000), Science Unit Test 2 marks (36/40), issued hall ticket.
2. **Student 2 (Pre-University PU College):**
   - **Name:** Ananya Hegde
   - **Admission No:** `ADM-2026-002`, Roll No: `102`
   - **Unit & Class:** PU College Unit — I PUC (PCMB), Section A
   - **Connected Data:** 92.0% attendance, partial lab fee invoice (`INV-2026-0092`, ₹12,500 due), Physics Mid-Term marks (62/70 theory, 28/30 practical), issued hall ticket.
3. **Student 3 (Degree College / University):**
   - **Name:** Rohan Verma
   - **Admission No:** `ADM-2026-003`, Roll No: `103`
   - **Unit & Class:** Degree College Unit — B.Sc Computer Science, Semester 3
   - **Connected Data:** 88.2% attendance, hostel arrears (`INV-2026-0093`, ₹24,000 due), Computer Lab viva marks (45/50).

### Demo Reset Mechanism:
- Triggered via `resetDemoData()` in `apps/web/src/store/demoStore.ts` and backend endpoint `POST /api/v1/demo/reset`.
- Scoped strictly to `tenant_id = '66601a28-a6e4-4cc8-857b-b9963e222e3b'`.
- Restores the 3 demo students and reset demo modifications without affecting other tenants.

---

## 4. Institution 2: AKSHARA GLOBAL SCHOOL AND PU COLLEGE (New Trial Institution)

### Target Configuration:
- **Tenant ID:** `New Random UUID` (e.g., `generate_uuid()`)
- **Display Name:** `AKSHARA GLOBAL SCHOOL AND PU COLLEGE`
- **Code:** `akshara-pilot`
- **Subdomain:** `akshara`
- **Institution Type:** `composite_group`
- **Subscription Status:** `TRIAL ACTIVE`
- **Trial Duration:** 30 Days from creation (Auto-calculated `trial_ends_at`, `grace_ends_at`)
- **Entitled Modules:** Full academic, attendance, fee, exam, and reporting suite.

### Administrative Accounts & Credentials:
1. **Institution Head / Chairman Account:**
   - **Username:** `akshara`
   - **Email:** `director@akshara.edu.in`
   - **Initial Temporary Password:** `admin123@`
   - **Flag:** `must_change_password = True` (Enforces password setup before dashboard access)
   - **Role:** `CHAIRMAN_DIRECTOR` (Group-level visibility across both School and PU units)
2. **School Principal Account:**
   - **Username:** `principal.school@akshara.edu.in`
   - **Role:** `PRINCIPAL` (Scoped to School Unit)
   - **Initial Password:** Provided via secure activation link
3. **PU College Principal Account:**
   - **Username:** `principal.pu@akshara.edu.in`
   - **Role:** `PRINCIPAL` (Scoped to PU College Unit)
   - **Initial Password:** Provided via secure activation link

### Academic Units & Data Cleanliness:
- **School Unit:** Classes 1 through 10, State/CBSE curriculum.
- **PU College Unit:** I PUC and II PUC (PCMB, PCMC, EBAC streams).
- **Zero Mock Data:** The new tenant starts with **clean student master and fee ledgers**, ready for legitimate institutional onboarding or bulk data import.

---

## 5. Transition Risk Analysis & Safety Measures

| Risk Scenario | Potential Impact | Preventive Control Enforced |
| :--- | :--- | :--- |
| **Accidental Data Truncation** | Loss of existing schemas or test data | PostgreSQL `TRUNCATE` is strictly prohibited; baseline backup archive created. |
| **Cross-Tenant Leakage** | Demo users seeing Akshara data | Strict UUID separation; OUR SCHOOL and Akshara have completely different `tenant_id`s. |
| **Orphaned Foreign Keys** | Broken database relationships | Existing tenant UUID is updated in-place to `OUR SCHOOL`, keeping foreign keys intact. |
| **Plaintext Password Exposure**| Credential compromise | All temporary passwords hashed with Argon2id prior to database insertion. |

---

## 6. Stage 2 Execution Script Blueprint (Awaiting Approval)

Once approved by the user, Stage 2 will execute the following reversible script:
1. Create PostgreSQL savepoint.
2. Update tenant `66601a28-a6e4-4cc8-857b-b9963e222e3b` name to `"OUR SCHOOL"`, code to `"our-school"`.
3. Update demo admin user credentials to username `admin`, password `demo123` (Argon2id hashed).
4. Prune `initialStudents` in `demoStore.ts` to exactly the 3 required students (Aarav, Ananya, Rohan).
5. Generate new tenant for `AKSHARA GLOBAL SCHOOL AND PU COLLEGE` with `TRIAL ACTIVE` subscription.
6. Insert initial head user `akshara` with password `admin123@` and `must_change_password=True`.
7. Verify both tenants independently via automated pytest tests.

