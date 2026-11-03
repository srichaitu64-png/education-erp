# Implementation Roadmap: 24-Week Commercial SaaS Plan

## Phase Breakdown

### Phase 1: Architecture, Multi-Tenant Foundation, Database & Entitlement Engine (Weeks 1–2)
- **Status:** **COMPLETED**
- Monorepo directory structure (`apps/api`, `apps/web`, `apps/mobile`, `packages/`, `infrastructure/`, `tests/`, `docs/`).
- PostgreSQL 16 cluster setup with forced Row-Level Security (RLS) on all tenant tables.
- Server-side tenant resolution middleware (`ContextVar[tenant_id]`).
- Argon2id cryptographic password hashing and rotating JWT access/refresh tokens.
- Central Subscription Entitlement & Feature Locking Engine (`EntitlementService`):
  * Configurable subscription plans (Trial, Starter, Standard, Pro, Premium, Enterprise).
  * 28-item central feature catalog with minimum tier gating.
  * Super Admin institution-specific overrides (`ALLOW`/`DENY`) with expiration timestamps.
  * Standardized `FEATURE_LOCKED` (HTTP 403) protocol with upgrade information.
- Frontend architecture (React 18 + TypeScript + Vite + Tailwind CSS):
  * `<FeatureGate>` locking component with professional upgrade cards and badges.
  * Dexie.js IndexedDB offline database store.
  * Super Admin Feature Entitlement Manager interface.
  * Dynamic white-label CSS branding (`--brand-primary`, `--brand-secondary`).
- Automated Pytest test suite: 100% pass rate across tenant isolation, RLS, and feature gating.

---

### Phase 2: Multi-Campus Academics, Admissions & Student Information System (Weeks 3–5)
- School structure: Academic Year -> Class -> Section -> Subjects.
- PU College structure: I/II PUC -> PCMB/PCMC/Commerce -> Streams.
- Degree College structure: Programmes -> Departments -> Semesters -> Credits -> Courses.
- Admissions workflow: Enquiry -> Online Application -> Document Verification -> Approval -> Admission Number Generation.
- Student profiles, guardians, emergency contact access controls, student transfers, and bulk Excel import/export.

---

### Phase 3: Fee Structures, Invoicing, Collection & Financial Ledger (Weeks 6–8)
- Fee components, category rules, installment schedules, concessions, and discounts.
- Immutable financial ledger entries (never delete completed transactions; use reversals/refunds).
- Cash, UPI, and Razorpay payment gateway integration with server-side signature verification and idempotency keys.
- Real-time receipt number generation and outstanding balance reconciliation.

---

### Phase 4: Daily Attendance & Multi-Board Examination System (Weeks 9–11)
- Student and staff daily/period attendance with duplicate prevention.
- Examination scheduling, marks entry workflows, teacher verification, and result locking.
- Configurable grading schemes (CBSE, State Board, University SGPA/CGPA, credits, backlogs).
- Published report card generation (PDF / Excel).

---

### Phase 5: Role-Specific Enterprise Dashboards & Portals (Weeks 12–14)
- Principal, Accountant, Teacher, Parent, and Student portals.
- Parent portal: Linked children only, attendance %, fee dues, report cards, homework.
- Teacher portal: Assigned classes, attendance marking, draft marks entry.
- Accountant portal: Daily collection daybook, defaulter lists, reconciliation.

---

### Phase 6: Offline PWA & Synchronisation Engine (Weeks 15–17)
- Service workers, Dexie.js offline queue, and background sync retry with exponential backoff.
- Offline attendance and draft marks entry with server-side conflict detection.

---

### Phase 7: Android Application (React Native / Expo) (Weeks 18–19)
- Multi-tenant school code login, push notifications via Firebase Cloud Messaging, and offline sync.

---

### Phase 8: White-Label Branding Engine & Commercial Billing (Weeks 20–21)
- Custom domains, automated SaaS subscription billing, tax invoices, and renewal workflows.

---

### Phase 9: Operations & Integrations (Weeks 22–23)
- Staff HR & Payroll, Library Management, Transport & Routes, Hostel Management.
- Official WhatsApp Business API & SMS notifications.

---

### Phase 10: Security Audit, Load Testing & Commercial Pilot Deployment (Week 24)
- DPDP Act compliance review, penetration testing, load testing for 100+ concurrent institutions.
- Onboard Akshara Global School & College pilot.

