# Enterprise Multi-Tenant Education ERP – Technical Architecture

## 1. System Overview

The platform is designed as a modular monolith providing commercial-grade Education ERP SaaS services to hundreds of schools, PU colleges, and degree colleges.

### Key Architectural Tenets:
1. **Multi-Tenant Logical Isolation:** Shared PostgreSQL 16 database with tenant-scoped tables, composite foreign keys, and PostgreSQL Row-Level Security (RLS) forced on all tenant tables.
2. **Server-Side Tenant Context:** Never trusts `tenant_id` from the frontend. Resolves tenant from verified JWT token payload and validates against host subdomain/domain.
3. **Argon2id Cryptographic Security:** Uses Argon2id password hashing (64MB memory, 2 parallelism, 2 time cost).
4. **Subscription Entitlement & Locking Engine:** Backend service `EntitlementService` enforces plan tiers and feature access. Unlocked features function normally; locked features return structured HTTP 403 `FEATURE_LOCKED` errors with upgrade paths.
5. **Offline-First Synchronisation:** Web PWA uses Dexie.js (IndexedDB); Android application uses local SQLite database. Changes are queued into an idempotent operation journal with conflict resolution.

---

## 2. Component Hierarchy

```
[Clients]
├── Web PWA (React 18 + TypeScript + Vite + Tailwind CSS + Dexie.js)
└── Android App (React Native + Expo + Local SQLite)
       │ (HTTPS / WSS)
[Reverse Proxy / Edge]
└── Nginx / Subdomain Router (Resolves institution subdomain -> tenant)
       │
[Modular Monolith Application - FastAPI]
├── TenantResolutionMiddleware (Sets coroutine ContextVar tenant_id)
├── Security & RBAC (Argon2id + JWT + Permission Guard)
├── EntitlementService (Feature Gate & Override Evaluator)
└── Domain Modules:
    ├── Tenants & White-Label Branding
    ├── Identity & Users
    ├── Subscriptions & Feature Entitlements
    ├── Academics (School / PU College / Degree College)
    ├── Admissions & Student Information System (SIS)
    ├── Fees, Invoicing & Financial Ledger
    ├── Attendance & Biometric Integration
    ├── Examinations, Grading & Result Locking
    ├── Offline Synchronisation Engine
    └── Communication (Email, SMS, Official WhatsApp)
       │
[Storage Tier]
├── PostgreSQL 16 (Tenant-Aware RLS, ACID Financial Transactions)
├── Redis (Task queues, caching, rate-limiting)
└── S3-Compatible Object Store (Encrypted student documents, PDFs)
```

---

## 3. Multi-Tenant Cryptographic Isolation Model

Each tenant-scoped table contains:
```sql
id UUID PRIMARY KEY,
tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT
```

PostgreSQL Row-Level Security is forced on all tenant-owned tables:
```sql
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON campuses
FOR ALL
USING (
    current_setting('app.is_superadmin', true) = 'true'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
)
WITH CHECK (
    current_setting('app.is_superadmin', true) = 'true'
    OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
);
```

Before executing transactions, the database session executes:
```sql
SELECT set_config('app.current_tenant_id', :tenant_id, true);
```
Unauthenticated or mismatched tenant queries return 0 rows at the database engine level.

---

## 4. Subscription Entitlement Evaluation Order

```
[Incoming Feature Request]
           │
           ▼
[Check Institution Override]
 ├── Found Override == "DENY"  ──────────────> [LOCKED] (HTTP 403 FEATURE_LOCKED)
 └── Found Override == "ALLOW" (Not expired) ──> [UNLOCKED] (Authorized)
           │ (No active override)
           ▼
[Check Active Subscription Plan]
 ├── Feature in Plan Features? ───────────────> [UNLOCKED] (Authorized)
 ├── Plan Tier >= Feature Min Tier? ──────────> [UNLOCKED] (Authorized)
 └── Feature Not in Plan ─────────────────────> [LOCKED] (HTTP 403 FEATURE_LOCKED)
```

