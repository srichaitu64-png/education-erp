# AUDIT REPORT 06: SUBSCRIPTION AND SAAS BILLING AUDIT

**Audit Date**: 2026-11-05 06:55 IST  
**Auditor**: Senior SaaS Architect & Security Lead  
**Scope**: 5 Pricing Tiers, Entitlement Service Gating, Lifecycle Transitions, Indian GST Compliance  

---

## 1. Subscription Tiers & Feature Matrix Verification

The subscription engine in `apps/api/app/modules/subscriptions/` models 5 commercial tiers:

| Plan Identifier | Name | Target Tier | Student Limit | Campus Limit | Storage Limit |
|---|---|---|---|---|---|
| `starter` | Starter Campus | K-12 Single School | 500 Students | 1 Campus | 10 GB |
| `standard` | Standard Campus | School / Single PU College | 1,500 Students | 1 Campus | 50 GB |
| `pro` | Professional Campus | Multi-Stream PU / Degree | 3,500 Students | 2 Campuses | 150 GB |
| `premium` | Premium Institution | Composite Group | 7,500 Students | 5 Campuses | 500 GB |
| `enterprise` | Enterprise Trust | Multi-Campus University Group | Unlimited | Unlimited | Unlimited |

---

## 2. Feature Locking Engine (`EntitlementService`)

* **Implementation**: `apps/api/app/modules/subscriptions/service.py` (`EntitlementService`).
* **Enforcement**: Dependency factory `require_feature(feature_id)` (`apps/api/app/security/deps.py`, lines 160-205).
* **Precedence Order**:
  1. **Tenant Explicit Deny Override** (`is_enabled=False`): Highest precedence; immediately locks feature.
  2. **Tenant Explicit Grant Override** (`is_enabled=True`): Overrides baseline plan.
  3. **Subscription Active Status Check**: If subscription status is `suspended` or `expired`, features lock with upgrade URL.
  4. **Base Plan Feature Catalog**: Fallback to standard tier inclusion.
* **Test Verification**:
  * `tests/subscription/test_entitlements.py::test_feature_locking_engine_enforcement` (PASSED)
  * `tests/subscription/test_entitlements.py::test_institution_specific_feature_override` (PASSED)
  * `tests/subscription/test_entitlements.py::test_deny_override_precedence` (PASSED)
* **Verdict**: PASS. Plan restrictions are enforced at the backend API layer with **HTTP 403 FEATURE_LOCKED** and cannot be bypassed simply by manipulating the frontend.

---

## 3. Subscription Lifecycle & State Machine

```
[NEW ONBOARDING] ──> [TRIAL (14 Days)] ──> [ACTIVE (Paid)] ──> [RENEWAL PENDING]
                           │                     │                     │
                           v                     v                     v
                     [EXPIRED]             [CANCELLED]          [GRACE PERIOD]
                           │                     │                     │
                           └─────────────────────┴─────────────────────┘
                                                 │
                                                 v
                                           [SUSPENDED] ──> [REACTIVATED]
```

* **States Handled**: `trial`, `active`, `suspended`, `cancelled`, `expired`.
* **Tenant Suspension**: When a tenant is marked `suspended` by the Platform Super Admin, `EntitlementService` blocks all protected feature routes across the institution.

---

## 4. Gaps in Production SaaS Billing & Invoicing

### Finding ID: SAAS-BILL-01 (Severity: HIGH / P1)
* **Description**: Automated payment gateway integration (Razorpay / Stripe) and Indian GST invoice compliance are not implemented in the backend.
* **Evidence**:
  * While `finance/models.py` has `FeePayment` and `FeeReceipt` for school fees collected from parents, there is no corresponding `SaaSSubscriptionInvoice` table for fees charged by EducationOS to the institution.
  * No webhook endpoints exist in `apps/api/app/api/v1/platform.py` to ingest Razorpay/Stripe subscription recurring events.
  * Indian GST (HSN/SAC 998314 for IT software SaaS, CGST 9% + SGST 9% or IGST 18%) is not automatically calculated on plan invoices.
* **Business Impact**: Platform billing currently requires manual bank reconciliation or external offline invoicing.
* **Remediation**:
  1. Implement `SaaSSubscriptionInvoice` table with GST breakdown (SAC code, GSTIN validation, CGST/SGST/IGST).
  2. Implement Razorpay Subscriptions webhook handler in `apps/api/app/api/v1/platform.py`.

