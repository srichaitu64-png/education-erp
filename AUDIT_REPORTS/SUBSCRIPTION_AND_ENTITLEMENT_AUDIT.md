# Stage 1 Audit: Subscription Lifecycle & Entitlement Enforcement

**Document:** `AUDIT_REPORTS/SUBSCRIPTION_AND_ENTITLEMENT_AUDIT.md`  
**Evaluation Scope:** 8-Stage Subscription Lifecycle, Feature Locking Engine, Tier Entitlements, Overrides, Data Preservation on Expiry, and Billing Gaps.  
**Execution Timestamp:** 2026-11-05T07:18:00+05:30  
**Status:** IMPLEMENTED AND VERIFIED (Entitlements Engine) / PARTIALLY IMPLEMENTED (Billing Automation)  

---

## 1. Executive Summary

The subscription architecture of EducationOS was audited to determine how plans gate functionality across the SaaS platform and how institutional subscriptions transition through their operational lifecycles.

**Key Strengths:**
1. **Robust Feature Locking Engine:** The platform possesses a dedicated `FeatureGate` component in React (`apps/web/src/components/FeatureGate.tsx`) and an active backend entitlement evaluator (`apps/api/app/modules/subscriptions/services.py`).
2. **Three-Tier Precedence Engine:** Feature access is evaluated using deterministic hierarchy:
   `Tenant DENY Override` > `Tenant ALLOW Override` > `Plan Tier Inclusion` > `System Default`.
   All three layers are verified by automated tests (`test_feature_locking_engine_enforcement`, `test_institution_specific_feature_override`, `test_deny_override_precedence`).
3. **Data Preservation on Expiry:** Expiration does **not** execute destructive database operations. Data remains intact; access transitions to restricted/grace mode.

**Identified Gaps:**
1. Absence of automated recurring payment gateway webhooks (Razorpay / Stripe) to execute state transitions (`PAYMENT_PENDING` -> `ACTIVE` or `GRACE_PERIOD` -> `SUSPENDED`).
2. Absence of Indian GST-compliant invoice generation (18% GST / HSN 9992).

---

## 2. Subscription Lifecycle State Machine

```
   +---------------+
   |    CREATED    |
   +-------+-------+
           |
           v
   +---------------+          Upgrade / Paid
   |  TRIAL ACTIVE +----------------------------------->+---------------+
   +-------+-------+                                    |    ACTIVE     |
           |                                            +-------+-------+
           | Trial Ends                                         |
           v                                                    | Payment Due
   +---------------+          Payment Success                   v
   | GRACE_PERIOD  |<-----------------------------------+---------------+
   +-------+-------+                                    |PAYMENT_PENDING|
           |                                            +-------+-------+
           | Grace Ends (15 Days)                               |
           v                                                    | Grace Ends
   +---------------+                                            |
   |   SUSPENDED   |<-------------------------------------------+
   +-------+-------+
           |
           | Customer Pays / Platform Owner Renews
           v
   +---------------+
   |    RENEWED    |
   +---------------+
```

### Lifecycle Status Matrix:

| Subscription State | Platform Access | ERP Access | Data Preservation Policy | Current Status |
| :--- | :--- | :--- | :--- | :---: |
| `CREATED` | Provisioned | None (Awaiting activation) | Schema initialized | **VERIFIED** |
| `TRIAL` | Full Trial Tier | Unrestricted trial modules | 100% Preserved | **VERIFIED** |
| `ACTIVE` | Normal | Normal paid tier modules | 100% Preserved | **VERIFIED** |
| `PAYMENT_PENDING`| Warning Banner | Active (7 days) | 100% Preserved | **PARTIAL** |
| `GRACE_PERIOD` | Urgent Alert | Read-only / limited entry | 100% Preserved | **PARTIAL** |
| `EXPIRED` | Expired Banner | Read-only archives | 100% Preserved (Never deleted) | **VERIFIED** |
| `SUSPENDED` | Blocked Banner | Login gated; exports allowed | 100% Preserved (Never deleted) | **VERIFIED** |
| `RENEWED` | Normal | Fully restored | 100% Preserved | **VERIFIED** |

---

## 3. Plan Tier Matrix & Limits

| Plan Code | Tier Level | Target Segment | Max Students | Max Staff | Max Campuses | Max Storage | Monthly (INR) | Annual (INR) |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `STARTER` | 1 | Small rural / primary schools | 250 | 25 | 1 | 5,000 MB | ₹2,999 | ₹29,990 |
| `STANDARD` | 2 | Single-campus K-10 / PU colleges | 1,000 | 75 | 1 | 25,000 MB | ₹7,999 | ₹79,990 |
| `PRO` | 3 | Composite Schools + PU Colleges | 2,500 | 200 | 2 | 100,000 MB | ₹14,999 | ₹149,990 |
| `PREMIUM` | 4 | Large institutions with transport & labs | 5,000 | 400 | 4 | 250,000 MB | ₹24,999 | ₹249,990 |
| `ENTERPRISE` | 5 | Universities & Multi-Campus Trusts | Unlimited | Unlimited | Unlimited | 1,000,000 MB | Custom | Custom |

---

## 4. Feature Locking Engine Verification

The backend feature gating engine was verified against real database records:
- **Feature Catalog Table:** `feature_catalog` registers all 22 system capabilities (e.g., `multi_campus`, `attendance_biometric`, `marks_moderation`, `laboratory_management`, `transport_fleet`, `sms_gateway`).
- **Plan Features Table:** `plan_features` maps each plan tier to default feature entitlements.
- **Tenant Overrides Table:** `tenant_feature_overrides` allows the Platform Owner to grant or revoke specific features for a particular tenant regardless of plan tier.

### Verified Test Assertions:
1. When a tenant is on `STARTER` plan, calling an API endpoint marked with `@require_feature("multi_campus")` returns `HTTP 403 Forbidden` (`test_feature_locking_engine_enforcement`).
2. When the Platform Owner adds an `ALLOW` override for `multi_campus` for that tenant, the request immediately succeeds (`test_institution_specific_feature_override`).
3. When the Platform Owner adds a `DENY` override for a feature normally included in the `ENTERPRISE` plan, the `DENY` override takes precedence and the request is blocked (`test_deny_override_precedence`).

---

## 5. Billing & Subscription Gaps (`GAP-BILL-01`)

1. **Missing Webhook Gateway Handler:**
   `apps/api/app/modules/subscriptions/` has models for plans and subscriptions, but lacks webhook endpoints for payment gateways (e.g. `POST /api/v1/platform/billing/webhook/razorpay`). Currently, subscription status changes must be triggered manually by the Platform Owner.
2. **Missing GST Tax Invoicing:**
   No table or PDF generator exists for Indian Goods & Services Tax (GST) invoices. Educational SaaS is classified under HSN/SAC code **9992** and incurs 18% GST (9% CGST + 9% SGST for intrastate, 18% IGST for interstate).

