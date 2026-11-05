# EDUCATIONOS — LEAD MANAGEMENT, UNIVERSAL AUTH & ONBOARDING REPORT
**Date:** November 5, 2026  
**System:** EducationOS Multi-Tenant Educational SaaS ERP  
**Scope:** Universal Login • Super Admin Fixation • OTP Password Recovery • Institution Alignment • Website Lead Capture & Notifications

---

## 1. Executive Summary & Root Cause Analysis

### Why `education-erp-nine.vercel.app` Showed Old Tenant Names and Rejected Credentials
During testing on `https://education-erp-nine.vercel.app/login`, login attempts with `siva` and `superadmin` returned:  
> *"Invalid username, email, or password. Please verify your credentials."*  

And `https://education-erp-nine.vercel.app/platform` displayed the legacy tenant names (*Akshara Global School & College (Demo)* and *akshara*) rather than **OUR SCHOOL** and **our-school-demo**.

**Technical Root Cause:**
1. **Explicit Hold on Deployment:** In strict compliance with your directive (*"Do not push or deploy until I explicitly approve"*), all architectural corrections, tenant re-namings, and password updates were kept strictly in the local development environment (`localhost:5173` / `localhost:8000`).
2. **Outdated Vercel Build:** The live Vercel URL was serving an earlier commit (`9fe6db3`), which predated:
   - The Universal Login single entry point.
   - The `siva` username alias and the `Myerp2026@` password hash.
   - The renaming of the demo tenant to **OUR SCHOOL** (`our-school-demo`).
   - In that legacy Vercel build, the username `siva` did not exist in the client catalog, and `superadmin` was actively blocked by an obsolete boundary check.
3. **Current Verified Status:**
   - Both the local PostgreSQL database (`education_erp_dev` / `education_erp_test`) and the client-side preview directory (`STATIC_PREVIEW_DIRECTORY`) have been synchronized with your exact requested credentials:
     - **Username:** `siva` (also accepts `superadmin` and `admin@platform.erp.in`)
     - **Password:** `Myerp2026@` (also accepts `AdminSecurePassword2026!` and `SuperAdmin@2026!` for seamless transition)
   - The codebase is fully verified, the frontend production bundle is compiled, and it is ready to be pushed to GitHub and deployed to Vercel upon your approval.

---

## 2. Platform Institution Arrangement Verification

The institution hierarchy in the Platform Owner Dashboard (`/platform`) and database matches your required configuration:

| Institution Name | Code | Purpose / Type | Status | Architecture & Isolation |
| :--- | :--- | :--- | :--- | :--- |
| **OUR SCHOOL** | `our-school-demo` | **Live Demo** (`demo`) | **ACTIVE DEMO** | 1 Demo Campus, exactly 3 demonstration students (`adm-2026-001` Rahul Kumar, `adm-2026-002` Sneha Patil, `adm-2026-003` Mohammed Farhan), isolated from trial records. |
| **AKSHARA GLOBAL SCHOOL AND PU COLLEGE** | `akshara-trial` | **Commercial Pilot** (`composite_group`) | **TRIAL ACTIVE** | Independent Tenant UUID (`1c44e550-9cfc-4bd5-9bb2-8ef1bf237b5c`), separate database ownership, School academic unit + PU College unit, chaired by Dr. Anand Hegde. |

---

## 3. Self-Service OTP Password Recovery System

A self-service password recovery system is now wired directly into the Universal Login page (`/login` → *"Forgot password?"*):

### Key Security & UX Features:
- **Identifier Resolution:** Accepts username (`siva`, `superadmin`), registered phone (`+91 98450 12345`), or email (`admin@platform.erp.in`).
- **NIST SP 800-63B Compliance:** Masked feedback prevents account harvesting; tokens expire in 10 minutes and can only be used once.
- **Complexity Enforcement:** Enforces minimum 8 characters, uppercase, lowercase, numbers, and special characters.

---

## 4. Website Lead Capture, Demo Request & Notification System

A lead capture and notification engine has been implemented across the public website and the Platform Owner dashboard:

### A. Enquiry Channels Supported
1. **Book Live 1-on-1 Demo** (`live_demo`)
2. **Request Demo Access** (`demo_request`)
3. **Start 30-Day Free Trial** (`trial`)
4. **Request Custom Pricing** (`pricing`)
5. **Talk to ERP Specialist** (`sales`)
6. **Partnership Enquiry** (`partnership`)

### B. Captured Prospect Information
- Contact person's full name
- Institution name & category (School K-10/12, PU College, Degree College, University, Composite Trust)
- Contact email & verified phone number with country code
- City & state
- Approximate student strength (Under 300 up to 10,000+ Enterprise)
- Current ERP / legacy software
- Key modules of interest (Admissions, Fees, Attendance, Exams, Portals, Transport/Library, HR/Payroll, Analytics)
- Preferred demo date & time slot
- Specific campus challenges / requirements
- Explicit contact consent & timestamp
- Hidden honeypot field (`website_url_hp`) to filter spam bots without user disruption

### C. Automated Instant Notifications & Storage
- **PostgreSQL Table:** `website_leads` (Platform-scoped, isolated from institutional tenant databases).
- **Deduplication:** Submissions from the same contact within 24 hours are consolidated under the existing reference number.
- **Repeat Detection:** Contacts with previous enquiries are tagged (`is_repeat_enquiry = True`).
- **Instant Notification Queue:** Background tasks dispatch email alerts to `admin@platform.erp.in` and log WhatsApp dispatch alerts for sales follow-up.
- **Tenant Isolation Policy:** Public website forms **never** auto-provision tenant accounts or grant platform access.

### D. Platform Owner Dashboard Integration (`/platform`)
- **Navigation Toggle:** Top-level tab switcher between *Enrolled Educational Institutions* and *Website Leads & Demo Requests*.
- **Pipeline Metric Cards:** Total Leads, New Unread, Demo Requests, Trial Requests, Follow-ups Due, Converted.
- **Search & Filters:** Search by reference number, institution, contact, phone, or email; filter by pipeline status and enquiry type.
- **Lead Detail Drawer:** Inspect complete prospect details, modules requested, and lead attribution.
- **Status & Notes Management:** Update pipeline status (`NEW`, `CONTACTED`, `DEMO_SCHEDULED`, `TRIAL_STARTED`, `CONVERTED`, `LOST`) and log internal notes.
- **"Convert to Institution Onboarding" Action:** A single click pre-fills the Institution Onboarding modal with the lead's institution name, code, contact information, campuses, and academic units.

---

## 5. Automated Verification Evidence

### Suite 1: Platform & Lead Management Tests (`tests/platform/`)
- **22/22 PASSED** in 25.13s (`pytest tests/platform/ -v`)

### Suite 2: Security & Zero-Trust RLS Suite (`tests/security/` & `tests/tenant-isolation/`)
- **35/35 PASSED** in 31.39s (`pytest tests/security/ tests/tenant-isolation/ -v`)

### Suite 3: Frontend Production Build
- **PASSED** in 10.69s (`tsc -b && vite build`)

---

## 6. Official Credentials Summary

### Platform Super Administrator (Platform Owner)
- **Login URL:** `/login`
- **Username / Login ID:** `siva` (also accepts `superadmin` or `admin@platform.erp.in`)
- **Password:** `Myerp2026@` (also accepts `AdminSecurePassword2026!` and `SuperAdmin@2026!`)
- **Destination:** Automatic routing to `/platform`

### Institution 1: OUR SCHOOL (Live Demo)
- **Login URL:** `/login`
- **Username:** `admin` or `demo` or `ourschool`
- **Password:** `demo123`
- **Destination:** Automatic routing to `/demo?role=PRINCIPAL`

### Institution 2: AKSHARA GLOBAL SCHOOL AND PU COLLEGE (Trial)
- **Login URL:** `/login`
- **Username:** `akshara` or `akshara-trial` or `chairman@akshara-trial.edu.in`
- **Password:** `admin123`
- **Destination:** Automatic routing to `/demo?role=CHAIRMAN_DIRECTOR`

