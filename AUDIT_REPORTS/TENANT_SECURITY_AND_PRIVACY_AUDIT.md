# Stage 1 Audit: Tenant Security, Isolation & Privacy Architecture

**Document:** `AUDIT_REPORTS/TENANT_SECURITY_AND_PRIVACY_AUDIT.md`  
**Evaluation Scope:** Multi-Tenant Boundaries, PostgreSQL Row-Level Security (RLS), JWT Claims Validation, Redis Session Revocation, Sensitive Identity Privacy (Aadhaar), and Audit Logging.  
**Execution Timestamp:** 2026-11-05T07:35:00+05:30  
**Status:** IMPLEMENTED AND VERIFIED (Core Security) / DEFECTIVE (5 Missing RLS Tables)  

---

## 1. Executive Summary

EducationOS enforces a multi-tiered security defense model to ensure that hundreds or thousands of educational institutions can operate on the same physical SaaS infrastructure without data co-mingling, unauthorized privilege escalation, or cross-tenant leaks.

The security architecture was evaluated across the network, application middleware, database engine, and Redis cache. All core authentication mechanisms (Argon2id hashing, brute-force lockout, expiring tokens, session revocation) and tenant isolation boundaries are verified by automated tests (`test_tenant_isolation.py`, `test_platform_tenant_security_isolation.py`).

**The Critical Security Defect (`GAP-RLS-01` / `SEC-RLS-01`):**
While the database enforces Row-Level Security on core tables, **5 newly added tenant-scoped academic tables** (`academic_sections`, `student_section_enrolments`, `staff_duty_assignments`, `hall_tickets`, `consolidated_fee_report_snapshots`) are **missing from `TENANT_SCOPED_TABLES` in `apps/api/app/database/rls.py`**. They currently rely on application-level `WHERE tenant_id = :tid` filters rather than database kernel-level enforcement.

---

## 2. Multi-Tenant Defense-in-Depth Architecture

```
                       [Incoming Client HTTP Request]
                                     |
                                     v
                 [Layer 1: TenantResolutionMiddleware]
                 - Inspects X-Tenant-ID header or Host subdomain
                 - Validates tenant existence and 'active' status in DB
                 - Binds UUID to ContextVar: current_tenant_context
                                     |
                                     v
                    [Layer 2: JWT Security Gate]
                 - Verifies signature (HS256) & expiration (30 min)
                 - Compares token tenant_id with context tenant_id
                 - Checks Redis blacklist: is_token_revoked(jti)
                                     |
                                     v
                [Layer 3: Role & Entitlement Authorizer]
                 - Enforces role requirements (@require_role)
                 - Enforces tier feature entitlements (@require_feature)
                 - Anti-Promotion check: Blocks user escalation
                                     |
                                     v
             [Layer 4: Tenant-Aware Database Session (get_db)]
                 - Sanitizes connection: SET app.is_superadmin = 'false'
                 - Sets tenant session: SELECT set_config('app.current_tenant_id', :tid, true)
                                     |
                                     v
              [Layer 5: PostgreSQL Row-Level Security (RLS)]
                 - Kernel-level row filter: tenant_id = current_setting(...)
                 - Blocks cross-tenant data leakage even on buggy SQL queries!
```

---

## 3. Row-Level Security (RLS) Policy Audit

In `apps/api/app/database/rls.py`, Row-Level Security is enabled via:
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
ALTER TABLE {table} FORCE ROW LEVEL SECURITY;

CREATE POLICY {table}_tenant_isolation ON {table}
FOR ALL
TO erp_app
USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    OR current_setting('app.is_superadmin', true) = 'true'
)
WITH CHECK (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    OR current_setting('app.is_superadmin', true) = 'true'
);
```

### Table Registration Audit:

| Table Name | Has `tenant_id` Column? | Registered in `rls.py`? | Kernel RLS Active? | Status |
| :--- | :---: | :---: | :---: | :---: |
| `campuses` | Yes | Yes | Yes | **PASS** |
| `roles` | Yes | Yes | Yes | **PASS** |
| `user_roles` | Yes | Yes | Yes | **PASS** |
| `subscriptions` | Yes | Yes | Yes | **PASS** |
| `tenant_feature_overrides` | Yes | Yes | Yes | **PASS** |
| `feature_usage` | Yes | Yes | Yes | **PASS** |
| `examinations` | Yes | Yes | Yes | **PASS** |
| `exam_attendance_marks` | Yes | Yes | Yes | **PASS** |
| `offline_sync_queue` | Yes | Yes | Yes | **PASS** |
| `fee_structures` | Yes | Yes | Yes | **PASS** |
| `fee_invoices` | Yes | Yes | Yes | **PASS** |
| `fee_payments` | Yes | Yes | Yes | **PASS** |
| `fee_receipts` | Yes | Yes | Yes | **PASS** |
| `receipt_audit_logs` | Yes | Yes | Yes | **PASS** |
| `institution_attendance_configs`| Yes | Yes | Yes | **PASS** |
| `daily_attendance_records` | Yes | Yes | Yes | **PASS** |
| `period_attendance_records` | Yes | Yes | Yes | **PASS** |
| `academic_sections` | Yes | **NO** | **NO** | **FAIL (P0)** |
| `student_section_enrolments` | Yes | **NO** | **NO** | **FAIL (P0)** |
| `staff_duty_assignments` | Yes | **NO** | **NO** | **FAIL (P0)** |
| `hall_tickets` | Yes | **NO** | **NO** | **FAIL (P0)** |
| `consolidated_fee_report_snapshots`| Yes | **NO** | **NO** | **FAIL (P0)** |

**Remediation (Stage 2):** Append all 5 missing tables to `TENANT_SCOPED_TABLES` in `apps/api/app/database/rls.py` and run `enable_row_level_security`.

---

## 4. Privacy & Sensitive Identity Protection

1. **Aadhaar Protection:**
   - Aadhaar numbers are never primary keys.
   - Encrypted at rest using AES-256 in the database.
   - Masked in all UI screens and API responses (`XXXX-XXXX-4589`).
2. **Password Cryptography:**
   - All user passwords are encrypted using **Argon2id** (`passlib[argon2]`), resisting GPU cracking attacks.
   - Plaintext passwords are never returned in API payloads, logs, or reports.
3. **Audit Trail Logging:**
   - Security-relevant events are persisted to `account_security_events` and `subscription_audit_logs`:
     - Successful login, failed login attempt count, lockout event
     - Password change, password reset token issuance, token reuse rejection
     - Session revocation across devices
     - Permission override grant and revocation

---

## 5. Verified Security Test Evidence

The following assertions were verified with real execution results in `tests/`:
- `test_tenant_isolation_bidirectional_and_tamper_resistant` (PASSED)
- `test_institution_users_cannot_invoke_platform_administration_apis` (PASSED)
- `test_platform_developer_least_privilege_and_support_consent` (PASSED)
- `test_institution_admin_cannot_promote_to_platform_owner` (PASSED)
- `test_brute_force_account_lockout` (PASSED)
- `test_cross_tenant_reset_rejected` (PASSED)
- `test_revoked_session_jwt_rejected_at_endpoint` (PASSED)
- `test_database_row_level_security_isolation` (PASSED)

