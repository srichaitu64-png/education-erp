# Stage 1 Audit: Existing Antigravity Skills Discovery & Reuse Plan

**Document:** `AUDIT_REPORTS/EXISTING_SKILLS_AND_REUSE_PLAN.md`  
**Evaluation Scope:** Complete Inspection and Inventory of Discovered Global, User-Level, and Project-Level Antigravity Skills; Capabilities Analysis; and Phased Reuse Blueprint for EducationOS.  
**Execution Timestamp:** 2026-11-05T07:55:00+05:30  
**Status:** DISCOVERED, INSPECTED, AND READY FOR STAGE 2 INTEGRATION  

---

## 1. Executive Summary: Core Reuse Principle

In strict compliance with the user's directive:
> *"I do NOT want to recreate capabilities that already exist. Inspect the available Antigravity skill directories... Read and understand relevant skills... Reuse, do not duplicate."*

A full discovery audit across all skill repositories (`/home/siva/.gemini/config/skills/`, `/home/siva/.gemini/config/plugins/`, `/home/siva/.gemini/antigravity/builtin/skills/`, and package site-packages) was performed. Over **40 specialized skills** were cataloged.

Rather than inventing redundant engineering procedures, EducationOS will directly reuse and orchestrate these pre-existing, battle-tested skills across each operational domain:
- **Evidence & Anti-Hallucination:** `verified-data` and `universal-ai-intelligence` (UAI Core).
- **Audit & Issue Lifecycle Tracking:** `uai-audit-history-reporting`.
- **UI/UX & Design Hygiene:** `uai-ui-ux-design-engine`, `unslop`, and `modern-web-guidance`.
- **Backend API & Framework Best Practices:** `fastapi` (bundled in `.venv`) and `react-best-practices`.
- **Data Migration & Schema Transformation:** `schema-mapping` and `data-autocleaning`.
- **Data Loss Prevention & Safety Gates:** `accidental-data-loss-prevention`.
- **Deployment & Production Readiness:** `uai-deployment-intelligence` and `deployments-cicd`.

---

## 2. Discovered Skills Inventory & Reuse Matrix

| Skill Name | Exact Skill File Location | Successfully Read? | Core Capabilities & Focus | Relevant EducationOS Tasks | How It Will Be Reused |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`verified-data`** | `/home/siva/.gemini/config/skills/verified-data/SKILL.md` | **YES** | Strict evidence, anti-hallucination, provenance tracking, non-negotiable proof requirements. | Cross-module verification, audit reports, test validation. | Mandatory governance rule: never claim tests passed or features work without verifiable execution logs. |
| **`universal-ai-intelligence`** | `/home/siva/.gemini/config/skills/universal-ai-intelligence/SKILL.md` | **YES** | UAI core framework: understand before acting, inspect before modifying, multi-phase risk gating. | Master audit orchestration, phased execution plan. | Framework for Stage 1 (Read-Only) and Stage 2 (Approved Execution) gating. |
| **`uai-audit-history-reporting`**| `/home/siva/.gemini/config/skills/uai-audit-history-reporting/SKILL.md` | **YES** | Audit issue lifecycle: `Detected -> Triaged -> Planned -> Fix Proposed -> Verified Fixed`. | Defect tracking across all 18 ERP modules in `AUDIT_REPORTS/`. | Format all audit findings with unique IDs, evidence paths, root causes, and verification criteria. |
| **`uai-ui-ux-design-engine`** | `/home/siva/.gemini/config/skills/uai-ui-ux-design-engine/SKILL.md` | **YES** | Principal product design, journey mapping, WCAG 2.2 AA accessibility, responsive design systems. | Refactoring `/app/*` and `/demo` dashboards, responsive tables. | Enforce design hierarchy, remove fake metrics, ensure accessible forms and keyboard navigation. |
| **`unslop`** | `/home/siva/.gemini/config/skills/unslop/SKILL.md` | **YES** | Eliminates AI UI clutter (muddy gradients, floating blobs, unreadable badges); fixes spacing and tokens. | Bento stat cards (`VibrantStatCard.tsx`), clean Midnight Indigo theme. | Applied to polish `RoleWorkspaceDispatcher.tsx` and `InteractiveDemoPage.tsx`. |
| **`accidental-data-loss-prevention`**| `/home/siva/.gemini/config/skills/accidental-data-loss-prevention/SKILL.md` | **YES** | **STOP AND VERIFY** before commands causing irreversible data loss (`DROP`, `TRUNCATE`, broad `DELETE`). | Akshara cleanup, database migrations, tenant transformations. | Prohibits SQL `TRUNCATE`; mandates pre-migration dumps and affirmative user consent. |
| **`fastapi`** | `apps/api/.venv/lib/python3.12/site-packages/fastapi/.agents/skills/fastapi/SKILL.md` | **YES** | Official FastAPI skill: Pydantic v2 schemas, `Annotated[..., Depends(...)]`, async routing, lifespan. | FastAPI endpoint refactoring, migration router, attendance APIs. | Guarantees all backend code follows latest official FastAPI standards and clean dependency injection. |
| **`schema-mapping`** | `/home/siva/.gemini/config/skills/schema-mapping/SKILL.md` | **YES** | High-fidelity Mapping Plan (Mapping Manifesto) between legacy schemas and target databases. | Smart Import Engine (`SharedImportWizardModal.tsx`, `/migration/`). | Translates messy incoming legacy school spreadsheets to canonical PostgreSQL student fields. |
| **`data-autocleaning`** | `/home/siva/.gemini/config/skills/data-autocleaning/SKILL.md` | **YES** | Automated data quality, regex normalization, schema mapping, null handling. | Batch ingestion validation, mobile phone/Aadhaar/DOB cleaning. | Cleans and normalizes incoming student rows before committing to database. |
| **`uai-deployment-intelligence`**| `/home/siva/.gemini/config/skills/uai-deployment-intelligence/SKILL.md` | **YES** | Portable deployment planning, production readiness, CORS, connection pools, and monitoring. | Production cloud readiness audit, Docker Compose, Alembic setup. | Audits production infrastructure against live requirements (distinguishing Vercel from FastAPI backend). |
| **`react-best-practices`** | `/home/siva/.gemini/config/plugins/vercel-plugin/skills/react-best-practices/SKILL.md` | **YES** | Eliminating waterfalls, code-splitting large bundles, React Query caching, rendering performance. | Frontend bundle optimization (reducing 1.16MB chunk), React Query hooks. | Optimizes data fetching in `InstitutionDashboard.tsx` to eliminate redundant re-renders. |
| **`auth`** | `/home/siva/.gemini/config/plugins/vercel-plugin/skills/auth/SKILL.md` | **YES** | Multi-tenant auth, session tokens, route guards, password recovery policies. | Dual login portals (`/platform/login` vs `/institution/login`). | Enforces secure token handling, first-login password gates, and role resolution. |
| **`modern-web-guidance`** | `/home/siva/.gemini/config/plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md` | **YES** | Web standards: HTML5 dialogs, forms validation, responsive tables, view transitions. | Modal dialogs, printable fee receipts, hall tickets. | Ensures accessible dialog modals and clean `@media print` styling for official documents. |

---

## 3. Detailed Reuse Blueprint by Project Domain

### Domain 1: Data Safety, Integrity & Anti-Hallucination
- **Skills Reused:** `accidental-data-loss-prevention`, `verified-data`, `universal-ai-intelligence`
- **Execution Protocol:**
  - Before executing any transformation on the existing Akshara tenant (`66601a28-a6e4-4cc8-857b-b9963e222e3b`), a full PostgreSQL snapshot will be dumped using `pg_dump`.
  - No database tables will be truncated or dropped.
  - All claims in reports must link directly to source file lines and actual test execution evidence.

### Domain 2: Smart Data Import & Spreadsheet Normalization
- **Skills Reused:** `schema-mapping`, `data-autocleaning`
- **Execution Protocol:**
  - The Smart Import Engine will use the **Mapping Manifesto** pattern from `schema-mapping`:
    1. Parse source column headers (e.g. "Candidate Name", "Pupil Father's Name", "PEN ID").
    2. Apply dictionary aliases and Levenshtein similarity to map to the 28 canonical student fields.
    3. Run `data-autocleaning` validators: normalize phone numbers to 10-digit format, format dates to ISO 8601, mask Aadhaar to `XXXX-XXXX-1234`.
    4. Provide dry-run preview and duplicate difference comparison (`SKIP`, `MERGE`, `OVERWRITE`) before database commit.

### Domain 3: Backend API Architecture & Concurrency
- **Skills Reused:** `fastapi` (official package skill), `auth`
- **Execution Protocol:**
  - All new endpoints in `apps/api/app/api/v1/` will strictly adhere to the official FastAPI skill:
    - Use `Annotated[AsyncSession, Depends(get_db)]` for database sessions.
    - Router-level prefix and tag grouping.
    - Explicit Pydantic response models (`response_model=...`) to avoid leaking internal password hashes or tenant IDs.
    - Background task workers for asynchronous email/SMS dispatch and large spreadsheet chunk processing.

### Domain 4: Frontend Design System & Accessibility
- **Skills Reused:** `uai-ui-ux-design-engine`, `unslop`, `react-best-practices`, `modern-web-guidance`
- **Execution Protocol:**
  - Maintain the clean Midnight Indigo (`#4338CA`) and Electric Teal (`#0D9488`) palette.
  - Keep metric cards clean and functional using `VibrantStatCard.tsx` with animated counters.
  - Retain universal `⌘K` command palette navigation.
  - Eliminate the client-side role dropdown from `LoginPage.tsx` in favor of backend dynamic role resolution.
  - Target WCAG 2.2 AA accessibility standards for all form inputs and modal dialogs.

### Domain 5: Deployment, Migrations & Operational Readiness
- **Skills Reused:** `uai-deployment-intelligence`, `uai-audit-history-reporting`
- **Execution Protocol:**
  - Clearly distinguish the static frontend deployment on Vercel from the containerized FastAPI/PostgreSQL backend.
  - Set up Alembic async migrations (`alembic init -t async`) to provide version-controlled, two-way reversible database evolutions.
  - Update CORS allowed origins in `apps/api/app/core/config.py` to allow `https://education-erp-nine.vercel.app`.
  - Author automated daily backup scripts with GPG encryption and remote S3 synchronization.

---

## 4. Missing Skills & Conflict Analysis

### Identified Missing Capabilities:
1. **Indian GST Education Invoicing Skill:** No pre-existing global skill specifically models Indian Goods & Services Tax (CGST 9% + SGST 9% or IGST 18% under HSN/SAC code 9992 for Educational Software).
   - *Recommendation:* Do NOT create a global skill. Implement this as standard project domain logic in `apps/api/app/modules/subscriptions/billing.py`.
2. **Biometric Push SDK Adapter:** No pre-existing skill covers hardware biometric clock machine push protocols (e.g. ZKTeco / eSSL).
   - *Recommendation:* Standardize the existing HTTP push ingestion endpoint in `apps/api/app/api/v1/attendance.py` without requiring a new global skill.

### Conflict & Limitation Review:
- **No Direct Skill Conflicts:** The discovered skills complement each other cleanly (e.g. `verified-data` sets the honesty policy, `uai-audit-history-reporting` sets the lifecycle format, `unslop` refines the UI, and `fastapi` governs the backend code).
- **Rule of Least Privilege:** Discovered skills will be read and followed as instruction sets, with zero modifications made to global configuration directories.

---

## 5. Summary Verdict
The Antigravity environment contains a rich, world-class suite of existing engineering skills. By orchestrating `verified-data`, `universal-ai-intelligence`, `uai-audit-history-reporting`, `uai-ui-ux-design-engine`, `fastapi`, `schema-mapping`, and `accidental-data-loss-prevention`, Stage 2 implementation can proceed with maximum quality, zero redundant development, and absolute data safety.

