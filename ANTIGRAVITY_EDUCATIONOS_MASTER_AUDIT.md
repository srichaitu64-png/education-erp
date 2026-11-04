# EDUCATIONOS — MASTER APPLICATION AUDIT, BUG FIXING & LIVE DEPLOYMENT

You are acting as a senior engineering team:
- Principal Full-Stack Architect
- React/TypeScript Engineer
- Python/FastAPI Engineer
- PostgreSQL Database Engineer
- SaaS Multi-Tenant Security Engineer
- QA and Test Engineer
- DevOps / GitHub Actions / Vercel Deployment Engineer

PROJECT
Repository: https://github.com/srichaitu64-png/education-erp
Local project: ~/Desktop/ERP
Live application: https://education-erp-nine.vercel.app/demo

PRIMARY OBJECTIVE
Audit the existing EducationOS application comprehensively, identify actual defects, fix verified defects safely, configure reliable GitHub CI/CD, resolve deployment failures and make the application live.

IMPORTANT EXECUTION RULES
1. Inspect the existing source code before changing anything.
2. Do not rewrite the application or replace working functionality.
3. Do not replace real backend data with mock/static data.
4. Do not install or use Playwright. Use Antigravity's available browser inspection/interaction capabilities, if available, and existing project tests.
5. If browser interaction is unavailable, mark browser-only checks BLOCKED. Do not pretend they were tested.
6. Never report a test as PASS unless it was actually executed.
7. Never invent API responses, database records, deployment status or test results.
8. Do not expose passwords, API keys, tokens or environment variables in logs, screenshots or reports.
9. Do not perform destructive operations or write tests against real production records.
10. Preserve the existing architecture and working features.
11. Keep all changes small, traceable and reversible.
12. Do not push directly to main until changes have passed the checks and the deployment configuration has been reviewed. If approval is required, prepare the branch and report the exact next action.

PHASE 0 — BASELINE AND REPOSITORY INSPECTION

Inspect:
- Git branch, latest commit, working tree and remote.
- Full repository structure.
- README and deployment documentation.
- Frontend and backend package/dependency files.
- Existing tests and test commands.
- Environment variable names (never print their values).
- Vercel configuration and project settings available in the repository.
- Existing GitHub Actions workflows.
- Database migrations, schema and seed scripts.
- Existing deployment configuration.

Record the baseline before editing.
Do not overwrite user changes.
Identify whether ~/Desktop/ERP is a symlink and verify the actual project directory.

PHASE 1 — COMPLETE ROUTE, PAGE AND MODULE INVENTORY

Inspect the complete React application, including:
- App.tsx and route definitions.
- Authentication and protected routes.
- Platform login and institutional login.
- Role-based dashboards.
- Sidebar and nested navigation.
- Every module, tab, submenu and page.
- Feature flags and subscription restrictions.
- API service layer, stores, hooks and caching.

Produce an inventory containing:
- Route and page title.
- Module.
- Required role and permissions.
- Data source/API endpoint.
- Available actions.
- Whether implemented, partially implemented, mocked or missing.
- Whether tested and the evidence.

Do not treat a public demo role selector as proof of real backend permissions.

PHASE 2 — DASHBOARD AND PAGE ACCURACY AUDIT

Inspect every dashboard and every role-specific workspace.

Check whether:
- The correct dashboard is displayed for the authenticated user.
- Role name and identity are consistent everywhere.
- Tenant, campus, academic year, class and section context are correct.
- Cards show actual data from the correct source.
- Counts match the underlying records.
- Charts use real API/database data or clearly labelled demo data.
- Percentages, totals, averages and financial figures are calculated correctly.
- Empty states, loading states and errors are handled correctly.
- Date filters and academic-year filters affect the displayed information.
- Data from one role or student is not accidentally shown to another.

Investigate the previously observed Parent identity mismatch:
- Parent selector identity and relationship.
- Parent context bar identity.
- Child/student identity.
- Progress card identity.
- Admission number.
- Class, stream and academic year.

Trace the source of each value through component, state, API response and database relationship. Do not fix labels alone if the underlying identity or relationship is wrong.

For every dashboard card, chart and table, record:
1. Displayed value.
2. Source endpoint or local source.
3. Response/data field.
4. Calculation, if any.
5. Independent verification method.
6. Accuracy result.

Clearly distinguish:
- Database-backed data.
- API-calculated data.
- Static demo data.
- Mock data.
- Missing data.
- Unverified data.

PHASE 3 — BUTTONS, FORMS AND INTERACTION AUDIT

Discover controls dynamically where browser inspection is available.

Inspect every available:
- Sidebar item.
- Tab and submenu.
- Button and icon button.
- Link.
- Dropdown.
- Modal.
- Search field.
- Filter.
- Pagination control.
- Table action.
- Form submission.
- Save, edit, delete, cancel and reset action.
- PDF, Excel, CSV and print action.

For each control establish:
- What it is supposed to do.
- Whether an event handler exists.
- Whether the handler performs the correct operation.
- Whether the correct API is called.
- Whether loading and error states are handled.
- Whether success is confirmed by the backend.
- Whether the displayed result updates correctly.
- Whether permissions are checked.
- Whether the operation is accidentally a no-op or demo-only action.

Do not mark a button as working just because it is clickable.

Produce BUTTON_TEST_RESULTS.csv with:
page, route, role, control, expected_action, actual_action, API, result, evidence, defect.

PHASE 4 — BACKEND AND DATA VALIDATION

Inspect all FastAPI routes, dependencies, schemas, services, models and database queries.

For every important module:
- Identify API method and endpoint.
- Verify request and response schemas.
- Verify authentication and authorisation.
- Check tenant and campus scoping.
- Check frontend-to-backend field mapping.
- Check pagination, sorting and filters.
- Check error handling.
- Check whether the API is connected to the actual database.
- Compare returned data with the rendered frontend values.

Never claim a card is database-backed without tracing its source.

Validate:
- Student totals against student records.
- Admissions against applications and enrolments.
- Attendance totals against attendance records.
- Fee collection against successful payment transactions.
- Outstanding balances against ledger calculations.
- Exam totals against component marks.
- Results against approved marks.
- Percentages and grades against the configured grading rules.
- Parent-child links against verified relationships.
- Class and section allocations against enrolment history.
- Duplicate and orphaned records.

Use read-only queries for production data checks. Do not silently modify business records.

PHASE 5 — BUSINESS WORKFLOW AUDIT

Validate the implementation and tests for:

A. Students and admissions
- Create/edit student in a safe test environment.
- Admission number uniqueness.
- Guardian linking.
- Class/section assignment.
- Promotion and historical enrolment.

B. Attendance
- Present, absent, late and approved leave.
- Duplicate prevention.
- Correct date/class/section filtering.
- Absentee reports.
- Daily attendance and period attendance must remain separate.

C. Examinations
- Examination creation and subject assignment.
- Candidate allocation.
- Theory/practical/internal marks.
- Maximum and passing marks.
- Verification and approval.
- Publication.
- Percentage and grade calculation.
- Progress cards.
- Absent, withheld, exempted and supplementary statuses must not be converted to zero.

D. Hall tickets
- Individual and batch generation.
- PDF and QR verification.
- Approval and publication.
- Online download, office collection and not-released modes.
- Revoked tickets must not remain downloadable.

E. Fees
- Fee structures and student assignments.
- Partial and full payments.
- Successful payment verification.
- Receipts.
- Refunds and adjustments.
- Outstanding balances.
- Reconciliation and reports.
- Do not initiate real payments or refunds.

F. Parent/student portals
- Verified parent-child relationship.
- Multiple linked children and child switching.
- Correct child-specific attendance, fees, results and hall tickets.
- Direct URL and ID tampering.
- Cache isolation when switching children.

G. Platform management
- Tenant provisioning.
- Subscription configuration.
- Feature entitlements.
- Platform analytics.
- Platform/institution account separation.
- Support access and audit logs.

If a safe test account, staging database or required provider credential is unavailable, mark the workflow BLOCKED.

PHASE 6 — ROLE AND TENANT SECURITY

Audit these roles where test identities are available:
- Platform Super Admin.
- Backup Super Admin.
- Platform Developer.
- Chairman.
- Director.
- Principal.
- Accountant.
- Examination Controller.
- Physics Teacher.
- Computer Operator.
- Admissions Officer.
- Parent.
- Student.

Verify backend permissions, not just hidden navigation.

Negative tests:
- Physics teacher cannot modify unassigned subjects/classes.
- Computer Operator cannot approve their own marks.
- Accountant cannot change examination results.
- Parent cannot access unrelated students.
- Student cannot access another student's data.
- Institution users cannot access Platform Owner routes.
- Institution administrators cannot create Platform Owner accounts.
- Tenant A cannot access Tenant B records.
- Direct URL/API access cannot bypass permissions.
- Client-supplied tenant_id cannot override verified tenant identity.
- Cache, exports, PDFs and background jobs cannot leak other tenants' information.

Inspect PostgreSQL RLS policies and how privileged database session variables are set. A normal client must never be able to grant itself platform-superadmin database privileges.

Use 401 for unauthenticated access and 403 for authenticated but unauthorised access where appropriate.

PHASE 7 — EXISTING TESTS AND AUTOMATED VALIDATION

Do not add Playwright.

Use the existing project test infrastructure. Discover the correct commands from package files, pyproject files, pytest configuration and documentation.

Run, where available:
- Frontend production build.
- Frontend lint.
- Backend unit tests.
- Backend integration tests.
- Database/migration checks.
- Existing security and tenant-isolation tests.
- Existing subscription and finance tests.
- Existing API tests.

Add focused tests for reproduced defects using existing frameworks.

If Antigravity browser inspection is available, inspect the live application and local application at desktop, tablet and mobile sizes. Capture evidence where supported. Otherwise mark these checks BLOCKED.

Record exact commands, exit codes, test counts and failures.

PHASE 8 — CONTROLLED BUG FIXING

Classify:
P0: Authentication, tenant leakage, privilege escalation, security.
P1: Incorrect academic/financial data and broken critical workflows.
P2: Broken buttons, forms, filters, reports, API integration and navigation.
P3: Visual and usability defects.

For every defect:
1. Reproduce it.
2. Record expected versus actual behaviour.
3. Trace root cause.
4. Identify affected files.
5. Implement the smallest safe fix.
6. Add or update a regression test.
7. Rerun relevant tests.
8. Record evidence.

Do not perform broad refactoring during bug fixing.

PHASE 9 — GITHUB ACTIONS AND DEPLOYMENT REPAIR

The repository currently needs its GitHub CI/CD configuration inspected.

Do not select an unrelated suggested GitHub workflow template.

Inspect:
- .github/workflows/
- package scripts.
- backend test configuration.
- Vercel configuration.
- vercel.json, if present.
- Root and frontend build commands.
- API deployment configuration.
- Environment variable requirements.
- Existing Vercel project linkage and deployment logs if accessible.

Create a project-specific GitHub Actions CI workflow that:
1. Runs on pull requests and pushes to the main branch.
2. Uses supported Node and Python versions based on project configuration.
3. Installs frontend dependencies reproducibly using the lockfile.
4. Runs frontend lint and production build.
5. Installs backend dependencies reproducibly.
6. Runs backend tests that do not require unavailable secrets/services.
7. Performs appropriate migration/configuration checks if supported.
8. Reports failures clearly.
9. Does not print secrets.
10. Does not deploy when required checks fail.

Use least-privilege workflow permissions. Pin third-party actions to secure, reviewed versions or commit SHAs where practical.

DEPLOYMENT:
- Determine whether Vercel is intended for the frontend only.
- Verify the correct Vercel root directory and build/output settings.
- Verify SPA route rewrites without accidentally routing API requests to index.html.
- Verify the frontend API base URL points to the real deployed FastAPI backend.
- Verify the backend is deployed and reachable.
- Check CORS, health endpoints, environment configuration and database connectivity.
- Do not assume Vercel can host the existing FastAPI service correctly without inspecting its deployment configuration.
- Identify the actual backend hosting provider from repository configuration or user-authorised integrations.
- Never invent Vercel tokens, project IDs, organisation IDs, database URLs or API keys.
- Never place secrets in source code or commit them.
- If required secrets are missing, provide their exact secret names and where the user must configure them.
- Do not expose secret values.
- Never use demo/mock API data as a production fallback without a visible warning.
- Do not report deployment as successful until the deployed URL, HTTP response, frontend route and backend health/API connectivity are verified.

Check the current live URL:
https://education-erp-nine.vercel.app/demo

Determine whether the current GitHub repository and Vercel deployment are connected to the same intended commit. Inspect deployment failures and explain the actual root cause.

If authenticated GitHub/Vercel tools are available, use them to inspect status and deployment logs. Do not assume access when unavailable.

PHASE 10 — FINAL REPORTS

Create/update these files:

AUDIT_REPORTS/EDUCATIONOS_AUDIT_REPORT.md
AUDIT_REPORTS/ROUTE_INVENTORY.csv
AUDIT_REPORTS/BUTTON_TEST_RESULTS.csv
AUDIT_REPORTS/API_VALIDATION_REPORT.csv
AUDIT_REPORTS/DATA_QUALITY_REPORT.md
AUDIT_REPORTS/ROLE_PERMISSION_TESTS.md
AUDIT_REPORTS/SECURITY_FINDINGS.md
AUDIT_REPORTS/BUG_FIX_LOG.md
AUDIT_REPORTS/DEPLOYMENT_REPORT.md
AUDIT_REPORTS/TEST_RESULTS.md

Every test must be marked:
PASS, FAIL, BLOCKED or NOT TESTED.

Every defect must include:
- Route/page.
- Role.
- Reproduction steps.
- Expected behaviour.
- Actual behaviour.
- Root cause.
- Affected files.
- Fix status.
- Regression test.
- Retest evidence.

FINAL ACCEPTANCE CRITERIA

The task is not complete until:
- Route and module inventory is produced.
- Dashboard values have been traced to their actual sources.
- Buttons and forms have been audited.
- API and data checks have evidence.
- Role and tenant security has been tested where possible.
- Verified defects have been fixed and retested.
- Frontend build and available backend tests have been run.
- GitHub Actions CI is configured and its result is verified.
- Vercel frontend deployment is verified.
- Backend deployment and frontend/API connectivity are verified.
- Any missing credentials or blocked checks are clearly listed.

FINAL RESPONSE
Give:
1. Actual findings, not assumptions.
2. Critical bugs and security issues.
3. Dashboard/data accuracy findings.
4. Broken buttons/pages and their fixes.
5. Tests executed and exact results.
6. GitHub Actions workflow status.
7. Vercel deployment status and live URL.
8. Backend health/API status.
9. Files changed.
10. Remaining blockers and exact user actions required.

Never say "100% complete", "all working" or "live" without evidence.
Start with repository inspection and baseline. Proceed phase by phase. Do not stop after writing a plan.
