# Stage 1 Audit: Separate Login Portals & Account Provisioning

**Document:** `AUDIT_REPORTS/SEPARATE_LOGIN_AND_ACCOUNT_PROVISIONING.md`  
**Evaluation Scope:** Dual Independent Login Frontends (`/platform/login` vs. `/institution/login`), Bootstrap Account `siva`, Dynamic Tenant/Role Resolution, and Privilege Escalation Prevention.  
**Execution Timestamp:** 2026-11-05T07:50:00+05:30  
**Status:** PARTIALLY IMPLEMENTED (Platform Portal Ready / Institution Route & Role Dropdown Defect)  

---

## 1. Executive Summary

In accordance with enterprise SaaS security standards and the user's explicit supplemental prompt, EducationOS must provide **two completely distinct, non-overlapping login portals**:
1. **Platform Owner Login (`/platform/login`):** Exclusively for the SaaS Platform Owner and authorized global platform administrators. Initial bootstrap username: `siva`.
2. **Institution Login (`/institution/login`):** For all institutional personas (Chairman, Principal, Vice Principal, Institution Admin, Accountant, Teachers, Parents, Students).

**Audit Findings:**
- `/platform/login` is already implemented (`PlatformLoginPage.tsx`) with dark cyber-security styling and isolation from institutional roles. However, its seeded superadmin username is currently `admin@platform.erp.in` instead of the requested bootstrap username `siva`.
- The institutional login is currently served at `/login` (`LoginPage.tsx`) rather than the requested route `/institution/login`.
- **Defect in Institutional Login (`LoginPage.tsx`):** The form currently includes a **client-side role selector dropdown** (`INSTITUTION_ROLES`). In a production SaaS ERP, users must authenticate with their username/email and password, and the backend must **dynamically resolve** their tenant, campus, academic unit, and role permissions, rather than letting the client pick an arbitrary role.

---

## 2. Comparison of Existing vs. Target Authentication Architecture

| Dimension | Existing Implementation | Target Production Specification | File Location | Gap / Required Action |
| :--- | :--- | :--- | :--- | :--- |
| **Platform Login Route** | `/platform/login` | `/platform/login` | `apps/web/src/App.tsx:69` | Already matched. |
| **Platform Bootstrap User** | `admin@platform.erp.in` / `superadmin` | `siva` (Secure bootstrap configuration) | `apps/api/app/database/seed.py:260` | Add bootstrap account `siva` via environment secret. |
| **Platform Redirect** | Redirects to `/platform` | Redirects to `/platform/dashboard` | `PlatformLoginPage.tsx:135` | Add redirect alias. |
| **Institution Login Route** | `/login` | `/institution/login` (with `/login` alias) | `apps/web/src/App.tsx:68` | Register `/institution/login` in `App.tsx`. |
| **Role Selection in UI** | Client dropdown (`INSTITUTION_ROLES`) | **Zero dropdown:** Backend resolves role automatically | `LoginPage.tsx:21-36` | **Remove client dropdown; resolve from JWT claims.** |
| **First-Login Password Setup**| Operational (`must_change_password`) | Mandatory before accessing dashboard | `FirstLoginPasswordModal.tsx` | Verified operational. |
| **OUR SCHOOL Credentials** | Mock in store | `admin` / `demo123` (`must_change_password=False`) | `demoStore.ts`, `seed.py` | Configure in Stage 2. |
| **Akshara Trial Credentials** | None (Old Akshara admin) | `akshara` / `admin123@` (`must_change_password=True`) | `seed.py` | Configure in Stage 2. |

---

## 3. Dynamic Authentication & Resolution Workflow

The target institution login flow eliminates client-side role choosing:

```
                      [User Enters Credentials at /institution/login]
                           Username / Email + Password
                                        |
                                        v
                            [POST /api/v1/auth/login]
                                        |
                                        +---------------------------------------+
                                        |                                       |
                                        v                                       v
                              [Invalid Credentials]                   [Valid Password (Argon2id)]
                              - Increment failed_attempts              - Reset failed_attempts = 0
                              - Lock after 5 failures                  - Fetch user_roles from DB
                              - Return 401 Unauthorized                         |
                                                                                v
                                                                   [Check must_change_password]
                                                                   - If True: Issue scoped token
                                                                     requiring password setup
                                                                   - If False: Issue full token
                                                                                |
                                                                                v
                                                                   [Return Dynamic User Payload]
                                                                   {
                                                                     "access_token": "...",
                                                                     "user": {
                                                                       "id": "...",
                                                                       "email": "...",
                                                                       "tenant_id": "...",
                                                                       "tenant_name": "...",
                                                                       "role": "PRINCIPAL",
                                                                       "academic_unit": "School Unit"
                                                                     }
                                                                   }
                                                                                |
                                                                                v
                                                               [Frontend Redirects to /app]
                                                               - Dispatches to correct role workspace!
```

---

## 4. Security & Privilege Escalation Prevention

1. **Anti-Promotion Security Guard:**
   - If a user at `/institution/login` attempts to send `is_superadmin: true` or `role: "SUPER_ADMIN"`, the backend FastAPI dependency explicitly ignores client input and validates the role strictly from the database join `user_roles JOIN roles ON ...`.
   - Verified by test: `test_institution_admin_cannot_promote_to_platform_owner` (PASSED).
2. **Tenant ID Tampering Guard:**
   - If a user tries to alter their `X-Tenant-ID` header to inspect another institution's data, `TenantResolutionMiddleware` cross-checks the header against the tenant claims embedded in the cryptographic JWT token. If there is a mismatch, the request is rejected with `HTTP 403 Forbidden` (`test_tenant_isolation_bidirectional_and_tamper_resistant` PASSED).
3. **Password Protection Policy:**
   - Passwords must be at least 8 characters, containing uppercase, lowercase, number, and special character (`test_03_weak_password_rejected_by_policy`).
   - Plaintext passwords are never stored in PostgreSQL, logs, or API payloads.

---

## 5. Required Stage 2 Remediation Plan

1. **Update `apps/web/src/App.tsx`:**
   Add route `<Route path="/institution/login" element={<LoginPage />} />` alongside existing `/login`.
2. **Refactor `apps/web/src/modules/auth/LoginPage.tsx`:**
   Remove the `INSTITUTION_ROLES` select dropdown. Allow direct submission of `username_or_email` and `password`. The response from `/api/v1/auth/login` will populate the user's active role in `useAuthStore`, and `useNavigate` will route them directly to their authorized workspace.
3. **Provision Bootstrap Account `siva` (`apps/api/app/database/seed.py`):**
   Seed the Platform Owner bootstrap account with username `siva`, role `SUPER_ADMIN`, and hashed password generated from a secure environment variable `BOOTSTRAP_SUPERADMIN_PASSWORD`.
4. **Configure Provisioned Accounts for the Two Target Institutions:**
   - **OUR SCHOOL:** User `admin`, password `demo123`, `must_change_password=False`.
   - **AKSHARA GLOBAL SCHOOL AND PU COLLEGE:** User `akshara`, password `admin123@`, `must_change_password=True`.

