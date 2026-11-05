# AUDIT REPORT 03: PLATFORM OWNER PORTAL AUDIT (`/platform/*`)

**Audit Date**: 2026-11-05 06:52 IST  
**Auditor**: Senior SaaS Architect & Security Lead  
**Scope**: 20 Platform Owner Capabilities Traced: Frontend → API → Service → Database  

---

## 1. Feature Traceability & Classification Matrix

| # | Feature / Capability | Frontend Component | Backend API Endpoint | Database Model / Table | Classification | Evidence & Findings |
|---|---|---|---|---|---|---|
| 1 | **Platform Dashboard Overview** | `SuperAdminDashboard.tsx` (`/platform`) | `GET /platform/metrics` | `Tenant`, `Subscription`, `User` | **IMPLEMENTED** | Returns real-time active tenancies, total users, and MRR. |
| 2 | **Institution Directory** | `SuperAdminDashboard.tsx` (Table) | `GET /platform/tenants` | `tenants`, `campuses` | **IMPLEMENTED** | Returns array of `TenantOut` objects with nested campuses. |
| 3 | **Institution Registration** | `PlatformSuperAdminView.tsx` (Form) | `POST /platform/tenants` | `Tenant` | **IMPLEMENTED** | Validates unique tenant code, slug, institutional type. |
| 4 | **Automated Provisioning** | `PlatformSuperAdminView.tsx` | `POST /platform/tenants` | `campuses`, `subscriptions` | **IMPLEMENTED** | Automatically creates default campus and initial subscription. |
| 5 | **Campus Management** | `SuperAdminDashboard.tsx` | Nested in `TenantOut` | `campuses` table | **PARTIAL** | Reads campuses; dedicated campus create API is currently nested under tenant creation. |
| 6 | **Subscription Plans** | `SuperAdminDashboard.tsx` | `GET /platform/plans` | `subscription_plans` | **IMPLEMENTED** | Returns 5 tiers: Starter, Standard, Pro, Premium, Enterprise. |
| 7 | **Subscription Lifecycle** | `EntitlementsManager.tsx` | `POST /platform/entitlements/*` | `subscriptions` (`status`) | **IMPLEMENTED** | Supports `trial`, `active`, `suspended`, `cancelled`. |
| 8 | **Billing & Invoices (SaaS)** | `SuperAdminDashboard.tsx` | Missing API | `fee_invoices` (Inst only) | **PARTIAL** | SaaS MRR tracked, but automated gateway billing webhook is missing. |
| 9 | **Feature Catalogue** | `EntitlementsManager.tsx` | `GET /platform/features` | `feature_catalog` | **IMPLEMENTED** | Returns 12 catalogued features with module keys and tiers. |
| 10 | **Tenant Entitlements** | `EntitlementsManager.tsx` | `POST /platform/entitlements/override` | `tenant_feature_overrides` | **IMPLEMENTED** | Supports grant/deny overrides with explicit expiration dates. |
| 11 | **Platform User Directory** | `SuperAdminDashboard.tsx` | `GET /platform/permissions/matrix` | `users` (`is_superadmin`) | **IMPLEMENTED** | Lists root admins, roles, and duty assignments. |
| 12 | **Developer Access Control** | `PlatformSuperAdminView.tsx` | `POST /platform/permissions/users/assign` | `user_roles` | **IMPLEMENTED** | Least privilege enforced; developers have no ambient tenant access. |
| 13 | **Support Access Request** | `PlatformSuperAdminView.tsx` | `POST /platform/support-sessions/request` | `platform_support_access_sessions` | **IMPLEMENTED** | Generates support ticket with justification and duration. |
| 14 | **Support Consent Approval** | `PlatformSuperAdminView.tsx` | `POST /platform/support-sessions/{id}/approve` | `platform_support_access_sessions` | **IMPLEMENTED** | Enforces time-limited expiry (default 60 minutes). |
| 15 | **Support Access Revocation** | `PlatformSuperAdminView.tsx` | `POST /platform/support-sessions/{id}/revoke` | `platform_support_access_sessions` | **IMPLEMENTED** | Immediate session kill switch resets token validity. |
| 16 | **Platform Audit Logs** | `PlatformSuperAdminView.tsx` | `GET /platform/audit-logs` | `platform_audit_actions` | **IMPLEMENTED** | Immutable logs of admin actions with IP, target, details. |
| 17 | **MRR / ARR Analytics** | `SuperAdminDashboard.tsx` | `GET /platform/metrics` | `subscriptions.price_inr` | **IMPLEMENTED** | Sums active subscriptions (`mrr_inr`, `arr_inr`). |
| 18 | **Platform Analytics** | `SuperAdminDashboard.tsx` | `GET /platform/metrics` | Aggregated queries | **IMPLEMENTED** | Total students, total institutions, active licenses. |
| 19 | **System Health & Telemetry** | `SuperAdminDashboard.tsx` | Health ping | Redis/DB connection status | **PARTIAL** | Database ping active; Redis queue telemetry is simulated. |
| 20 | **Global SaaS Config** | `PlatformSuperAdminView.tsx` | `GET /platform/dashboard-designer/*` | `dashboard_layout_configs` | **IMPLEMENTED** | Global navigation designer and role-based visibility presets. |

---

## 2. Gap Analysis & Production Gating Items

### GAP-01: Automated Payment Gateway Webhooks (Severity: HIGH)
* **Status**: PARTIAL
* **Finding**: `GET /platform/plans` and `GET /platform/metrics` accurately model subscription tiers and calculate MRR in software. However, there is no active webhook listener for Stripe or Razorpay recurring mandate webhooks (`invoice.payment_succeeded`, `subscription.charged`).
* **Production Blocker**: In production, subscription renewals must be manually toggled by the Platform Super Admin unless integrated with a live billing provider.

### GAP-02: Multi-Campus Creation Workflow (Severity: MEDIUM)
* **Status**: PARTIAL
* **Finding**: The database schema (`campuses`) supports multiple campuses per tenant, and tenant onboarding creates the primary campus. However, a dedicated secondary campus provisioning modal inside `/platform` is currently managed via database seed scripts rather than an independent self-serve UI form.

