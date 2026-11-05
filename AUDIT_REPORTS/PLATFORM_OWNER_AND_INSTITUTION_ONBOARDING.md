# Stage 1 Audit: Platform Owner Portal & Institution Onboarding

**Document:** `AUDIT_REPORTS/PLATFORM_OWNER_AND_INSTITUTION_ONBOARDING.md`  
**Evaluation Scope:** SaaS Platform Owner Privileges, Institution Registration & Provisioning Workflow, Plan Assignment, Head Account Creation, and Activation Mechanics.  
**Execution Timestamp:** 2026-11-05T07:12:00+05:30  
**Status:** PARTIALLY IMPLEMENTED  

---

## 1. Executive Summary

The Platform Owner portal was audited to evaluate how new educational institutions (Schools, PU Colleges, Degree Colleges, Universities, Trusts) are onboarded, subscribed, and activated.

The existing implementation possesses a dedicated, protected `/platform/*` interface (`SuperAdminDashboard.tsx`) and backend API (`apps/api/app/api/v1/platform.py`) allowing the SaaS Platform Owner to list all institutions, register new tenants, review subscription plans, override feature entitlements, and monitor platform health metrics.

**Current Gaps:**
1. The frontend onboarding modal (`SuperAdminDashboard.tsx`) collects institution name, code, type, contact email, and plan tier, but does **not currently execute Steps 2 and 4 in a unified 5-step wizard**: it does not automatically provision the initial Institution Head's user account with temporary credentials and first-login password change in the same atomic transaction.
2. In the backend `POST /api/v1/platform/tenants`, the tenant and subscription are created, but the initial administrator account must currently be seeded or created separately.

---

## 2. Platform Owner Capabilities Assessment

| Capability | Requirement Specification | Current Implementation | File & Line | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Global Platform Overview** | View total institutions, MRR, active users, storage usage | Rendered via Bento stat cards and platform metrics API | `SuperAdminDashboard.tsx:85-115`, `platform.py:120-150` | **IMPLEMENTED AND VERIFIED** |
| **Tenant Registration** | Register institution name, code, type, address, colors | Modal form with name, code, type, contact, subdomain | `SuperAdminDashboard.tsx:140-195`, `platform.py:45-75` | **IMPLEMENTED AND VERIFIED** |
| **Multi-Unit Structure Setup** | Configure School, PU, Degree units and Campuses | Configured post-creation in institution settings | `AcademicStructureView.tsx` | **PARTIALLY IMPLEMENTED** |
| **Subscription Plan Assignment**| Select Starter, Standard, Pro, Enterprise, or Custom | Dropdown bound to `SubscriptionPlan` catalog | `SuperAdminDashboard.tsx:170-185` | **IMPLEMENTED AND VERIFIED** |
| **Initial Head Account Creation**| Provision Head Full Name, Email, Login ID, Temp Password | Missing from tenant creation dialog; created via separate seed or user API | `platform.py:45-75` | **MISSING (In Wizard)** |
| **Secure Activation Instructions**| Provide expiring one-time link or secure temporary pass | User model supports `must_change_password`, but onboarding wizard doesn't display instructions | `users.must_change_password` | **PARTIALLY IMPLEMENTED** |
| **Tenant Activation / Suspension**| Suspend delinquent tenants or reactivate on renewal | API supports updating tenant status (`active` / `suspended`) | `platform.py:80-110` | **IMPLEMENTED AND VERIFIED** |
| **Revenue Isolation** | Platform revenue metrics never exposed to institution users | Enforced via `@require_superadmin` dependency | `test_05_platform_metrics_revenue_not_leaked_to_institutions` | **IMPLEMENTED AND VERIFIED** |

---

## 3. Five-Step Onboarding Architecture Specification

To satisfy enterprise requirements, the Institution Onboarding workflow must be formalized into a 5-step atomic wizard:

```
[Step 1: Institution Master Details]
  ├── Institution Legal Name, Display Name, Code
  ├── Institution Type (School / PU College / Degree College / University / Multi-Campus Trust)
  └── Contact Email, Phone, Physical Address, Primary & Secondary Theme Colors

[Step 2: Educational Structure & Campuses]
  ├── Main Campus Name & Code
  ├── Initial Academic Units (e.g. CBSE School Unit, Karnataka Pre-University Unit)
  └── Initial Academic Year (e.g. 2026-2027)

[Step 3: Subscription & Entitlements]
  ├── Plan Tier (Starter / Standard / Pro / Enterprise)
  ├── Billing Cycle (Monthly / Annual / Pilot Trial)
  ├── Start Date, Expiry Date, Grace Period (default 15 days)
  └── Student Limit, Staff Limit, Campus Limit

[Step 4: Initial Institution Head Account]
  ├── Head's Full Name (e.g., Dr. Ramesh Kumar, Principal / Director)
  ├── Official Email & Mobile Number
  ├── Auto-Generated Username (e.g., principal@akshara.edu.in)
  ├── Generated Secure Temporary Password (e.g., Akshara#2026!Init)
  └── Flag: must_change_password = True

[Step 5: Review & Cryptographic Provisioning]
  ├── Atomic DB Transaction:
  │     1. INSERT INTO tenants
  │     2. INSERT INTO campuses
  │     3. INSERT INTO subscriptions
  │     4. INSERT INTO users (Head account with Argon2id hash)
  │     5. INSERT INTO user_roles (INSTITUTION_ADMIN role)
  │     6. INSERT INTO institution_attendance_configs (Default mode)
  └── Surface One-Time Printable Onboarding & Credentials Slip for the Platform Owner
```

---

## 4. Audit Findings & Required Remediation

### Finding ONB-01: Institution Head Account Creation Missing from Platform Tenant Dialog
- **Finding ID:** `ONB-01`
- **Severity:** `P1` (High - Core Business Workflow)
- **Status:** `PARTIALLY IMPLEMENTED`
- **Evidence & Location:**
  - `apps/web/src/modules/dashboard/SuperAdminDashboard.tsx:140-195` only submits `name`, `code`, `institution_type`, `email`, `subdomain`, and `plan_id`.
  - `apps/api/app/api/v1/platform.py:45-75` (`create_tenant`) accepts `TenantCreateRequest`, which contains no fields for the initial user head account.
- **Root Cause:**
  Tenant provisioning and user registration were developed as two separate API endpoints rather than an orchestrated transactional onboarding procedure.
- **Business Impact:**
  The Platform Owner must manually execute secondary steps to create the institution head's account, creating friction and operational overhead.
- **Recommended Remediation (Stage 2):**
  1. Extend `TenantCreateRequest` schema in `apps/api/app/modules/tenants/schemas.py` to include:
     ```python
     head_full_name: str
     head_email: EmailStr
     head_phone: Optional[str]
     head_designation: str = "Principal / Director"
     ```
  2. In `create_tenant` (`apps/api/app/api/v1/platform.py`), transactionally create the Tenant, Subscription, Main Campus, and the Head User account with `must_change_password=True`.
  3. Return a secure one-time printable activation response containing the generated temporary credentials.

