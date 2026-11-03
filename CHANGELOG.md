# Changelog

All notable changes to the Enterprise Multi-Tenant Education ERP platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-03
### Added
- **Repository Architecture:** Scaffolded monorepo (`apps/api`, `apps/web`, `apps/mobile`, `packages/`, `infrastructure/`, `tests/`, `docs/`).
- **PostgreSQL 16 Multi-Tenant Engine:**
  - Initialized dedicated local PostgreSQL 16 cluster on port 5433 with user-managed non-root control script (`infrastructure/scripts/dev-db.sh`).
  - Implemented PostgreSQL Row-Level Security (RLS) forced across all tenant-owned tables (`campuses`, `tenant_domains`, `subscriptions`, `tenant_feature_overrides`, `feature_usage`).
  - Added transaction session context configuration via `set_config('app.current_tenant_id', :tid, true)` and `set_config('app.is_superadmin', :admin, true)`.
- **Identity & Security:**
  - Implemented Argon2id cryptographic password hashing with 64MB memory cost, parallelism 2, and time cost 2.
  - Implemented JWT access tokens (short-lived) and refresh tokens with claims verification.
  - Granular RBAC tables (`roles`, `permissions`, `role_permissions`, `user_roles`).
- **Subscription Entitlement & Feature Locking Engine:**
  - Created `EntitlementService` supporting 6 standard subscription plans (Trial, Starter, Standard, Pro, Premium, Enterprise) and 28 platform features.
  - Implemented institution-specific overrides (`ALLOW` / `DENY`) with optional expiration dates and audit logs.
  - Implemented standardized `FEATURE_LOCKED` (HTTP 403) protocol returning feature ID, required plan, current plan, and upgrade URL.
  - Built FastAPI dependency `require_feature(feature_id)`.
- **Web Frontend Application (React 18 + TypeScript + Vite + Tailwind CSS):**
  - Integrated Dexie.js for IndexedDB offline store schema (`sync_queue`, `students`, `attendance_drafts`).
  - Created `<FeatureGate>` commercial feature locking component with professional locked badges and upgrade cards.
  - Created Super Admin Feature Entitlement Manager (`EntitlementsManager.tsx`) for locking/unlocking features and applying institution overrides.
  - Created multi-tenant Login Page (`LoginPage.tsx`) supporting email, password, and optional school code.
  - Created Institution Dashboard and Super Admin Dashboard with responsive layouts and dynamic white-label brand colors.
- **Testing & Quality Assurance:**
  - Added 8 automated tests with 100% pass rate covering RLS database isolation, API tenant boundaries, Argon2id security, feature gating, and override precedence.
- **Infrastructure & Deployment:**
  - Created `docker-compose.yml`, `Dockerfile.api`, `Dockerfile.web`, Nginx SPA proxy config, and `Makefile`.

