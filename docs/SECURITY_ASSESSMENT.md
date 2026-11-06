# Enterprise Security Assessment — EducationOS SaaS

**Document Version:** 1.0.0  
**Classification:** Confidential / Engineering  
**Scope:** Multi-Tenant Isolation, Authentication, RBAC, Database Security, Cryptography  

---

## 1. Threat Model & Attack Surface

EducationOS implements defense-in-depth across the web application, API gateway, application runtime, and database tiers.

| STRIDE Category | Threat Description | Architectural Mitigation | Verification Status |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Attacker impersonates legitimate institutional users or platform superadmins. | Argon2id password hashing, mandatory TOTP MFA for elevated roles, session token revocation (`user_sessions` tracking). | Verified by `test_password_and_account_security.py` |
| **Tampering** | Malicious tenant modifies database settings (`app.is_superadmin`) to alter another institution's records. | Elimination of `app.is_superadmin` trust in PostgreSQL RLS. Policies require active cryptographic verification of `app.current_user_id` in `users`. | Verified by `test_tenant_isolation.py` |
| **Repudiation** | Staff member claims they did not modify exam marks or fee receipts. | Immutable append-only audit tables (`receipt_audit_logs`, `exam_approval_audits`, `account_security_events`). | Verified by `test_fee_receipts_and_reporting.py` |
| **Information Disclosure** | Student or staff from Institution A accesses student records or fee invoices belonging to Institution B. | Native PostgreSQL Row-Level Security (`ENABLE ROW LEVEL SECURITY`) enforced at the database engine level on all tenant tables. | Verified by `test_comprehensive_tenant_rls_matrix.py` |
| **Denial of Service** | Credential stuffing, brute-force login attacks, or resource exhaustion. | Exponential backoff lockout (5 failed attempts locks account for 15 minutes), connection pool bounds (`pool_size=15`, `max_overflow=20`). | Verified by `test_universal_login_and_navigation.py` |
| **Elevation of Privilege** | Institution Admin attempts to grant themselves `platform.owner` privileges or alter global curriculum templates. | Hybrid RLS policies prevent tenant writes to global templates (`tenant_id IS NULL`). Strict RBAC dependency checking at endpoint gates. | Verified by `test_saas_platform_architecture_audit.py` |

---

## 2. Row-Level Security (RLS) Policy Matrix

EducationOS enforces database-level tenant isolation using PostgreSQL native RLS. Even if an application bug omitted a `WHERE tenant_id = ...` clause, the database engine filters out rows belonging to other institutions.

### A. Tenant-Scoped Tables
* **Tables:** `campuses`, `students`, `academic_sections`, `fee_structures`, `fee_invoices`, `fee_payments`, `fee_receipts`, `institution_subjects`, `class_subject_mappings`, etc.
* **RLS Configuration:**
  ```sql
  ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY tenant_isolation_policy ON {table}
  FOR ALL
  USING (
      tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  )
  WITH CHECK (
      tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );
  ```
* **Engine Behavior:** If `app.current_tenant_id` is empty or mismatches, zero rows are returned on `SELECT`, and `INSERT/UPDATE/DELETE` operations raise `23514 check_violation` or `42501 insufficient_privilege`.

### B. Hybrid-Scoped Tables
* **Tables:** `roles`, `user_roles`, `user_permission_overrides`, `dashboard_layout_configs`, `subscription_audit_logs`, `subject_catalog`.
* **RLS Configuration:**
  * **Global Read:**
    ```sql
    CREATE POLICY hybrid_global_read_policy ON {table}
    FOR SELECT
    USING (
        tenant_id IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );
    ```
  * **Tenant Write:**
    ```sql
    CREATE POLICY hybrid_tenant_write_policy ON {table}
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
    ```
  * **Platform Superadmin Write:**
    ```sql
    CREATE POLICY hybrid_platform_admin_write_policy ON {table}
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
              AND u.is_superadmin = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
              AND u.is_superadmin = TRUE
        )
    );
    ```

---

## 3. Authentication & Credential Lifecycle

1. **Password Hashing:**
   * Algorithm: **Argon2id** (OWASP recommended).
   * Parameters: Time cost = 3, Memory cost = 65,536 KiB (64 MiB), Parallelism = 4.
2. **Multi-Factor Authentication (MFA):**
   * Standard: Time-based One-Time Password (**RFC 6238 TOTP**).
   * Key Storage: Encrypted in database, verified with 30-second window step.
3. **Session Management & Token Invalidation:**
   * Tokens: Cryptographically signed JWTs (HS256 with 32+ character high-entropy secret).
   * Revocation: User sessions tracked in `user_sessions`. Logout, password change, or admin revocation immediately flags the token ID (`jti`) as revoked, rejecting future requests at the auth dependency.
4. **Brute-Force & Lockout Policy:**
   * Threshold: 5 consecutive failed authentication attempts.
   * Lockout Duration: 15 minutes.
   * Audit Logging: Every failure and lockout emits an append-only event into `account_security_events`.

---

## 4. Role-Based Access Control (RBAC) Governance

* **Platform Layer (Control Plane):**
  * `PLATFORM_OWNER`: Full platform administration, subscription provisioning, and system settings.
  * `PLATFORM_DEVELOPER`: Technical inspection with tenant consent via `platform_support_access_sessions`.
* **Institutional Layer (Data Plane):**
  * `INSTITUTION_ADMIN`: Campus management, staff allocation, institutional settings.
  * `PRINCIPAL`: Academic oversight, fee snapshot review, examination marks approval.
  * `TEACHER`: Attendance marking, marks entry, timetable inspection.
  * `FEE_OFFICER`: Invoicing, payment collection, receipt reprinting.
  * `STUDENT` & `PARENT`: Read-only portal access to attendance, marks, fees, and circulars.

---

## 5. Security Verification Summary

* **Automated Security Tests:** 17 tests dedicated to authentication, brute-force lockout, MFA TOTP, and token revocation.
* **RLS Matrix Tests:** 12 tests verifying multi-tenant isolation, cross-tenant leak prevention, and tamper resistance.
* **Pass Rate:** 100% verified against PostgreSQL 16 under non-privileged role `erp_app`.

