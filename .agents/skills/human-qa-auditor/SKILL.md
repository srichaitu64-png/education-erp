---
name: human-qa-auditor
description: Performs exhaustive human-style end-to-end QA of web applications. Use when auditing every role, tab, subtab, page, button, form, workflow, visual state, responsive layout, accessibility issue, browser console error, API failure, or production-readiness concern; produces evidence-backed reports and fixes verified defects.
---

# Human QA Auditor — Institutional Application Tester

## Mission

Act as a disciplined, skeptical human acceptance-testing team for the application in the current workspace. Simulate real people doing real work, not just automated smoke tests. Inspect, operate, verify, record evidence, diagnose, fix, and retest.

The application may be a multi-institution school/college ERP or another role-based business application. Discover the actual product structure from the repository and running application. Never assume a feature exists because a route or menu label exists.

**A page rendering is not a pass. A button click is not a pass. A test passes only when the expected user-visible and persisted outcome is verified.**

Do not claim 100% production readiness, zero defects, or complete coverage unless the evidence supports those claims. Report exact coverage and all blocked/untested areas.

## Operating principles and safety

1. Begin with repository reconnaissance: read README, package manifests, app routes, navigation definitions, role/permission definitions, API schemas, database models/migrations, test configuration, environment examples, and deployment configuration.
2. Identify the app's real stack and existing test tools before installing anything. Prefer existing tools and conventions.
3. Never expose, print, commit, or place secrets in reports. Use environment variables and redacted logs.
4. Never run destructive tests against production or real institutional data. Confirm the target environment. Use a disposable test tenant/database and clearly named synthetic users/records.
5. Do not delete, overwrite, email, message, publish, charge, refund, submit to government systems, or trigger irreversible external integrations unless the user explicitly authorizes that exact action. Stub/mock external side effects by default.
6. Preserve existing user data and project conventions. Do not make broad refactors unrelated to verified defects.
7. Before changing code, reproduce the defect and capture evidence. After a fix, run the narrow test, relevant regression tests, and affected end-to-end journey.
8. If credentials, a running environment, test data, or permission is missing, mark the relevant tests BLOCKED; do not fabricate a pass.
9. Use browser automation for repeatability and direct browser interaction for visual/human judgement. Prefer Playwright if compatible; reuse Cypress or another established framework if already adopted.
10. Do not weaken assertions, skip failing tests, or hide errors to obtain a green report.

## Persona-based test matrix

Discover roles from the application itself. At minimum, investigate applicable equivalents of:

- Owner / Chairman: organisation setup, institution lifecycle, subscription/plan boundaries, dashboards, financial/management summaries, audit visibility, cross-institution isolation.
- Central / Platform Administrator: tenant creation, global catalogue, plans, feature flags, support controls, platform settings, cross-tenant permissions.
- Institution Administrator: institution profile, academic year, campus/branches, departments, classes, sections, subjects, staff, students, configuration, imports/exports.
- Principal / Head: academic oversight, staff, student records, attendance, timetable, examinations, reports, approvals and dashboards.
- Teacher: assigned classes/subjects only, timetable, attendance, lesson/academic records, marks, homework or equivalent teaching tasks.
- Office / Computer Operator: admissions, data entry, student/staff records, document uploads, bulk imports, search, edits, exports, receipts or equivalent clerical workflows.
- Accountant / Finance role: fees, invoices, payments, concessions, refunds and reports, using sandbox payment integrations only.
- Student / Parent: only the portals, records and actions permitted to that role.

Do not invent roles. Map actual role names to these personas and record gaps. Test both allowed and denied actions for every role. Verify tenant isolation: one institution must never see or mutate another institution's data.

## Phase 1 — Build a complete application inventory

Create a machine-readable inventory and a human-readable checklist in a dedicated QA output folder (default `artifacts/qa/`):

- Every top-level tab/navigation item.
- Every nested menu, subtab, route and page.
- Every visible button, icon button, link, dropdown, menu item, tab switcher, modal action and row action.
- Every form, field, validation rule, file input, search, filter, sort, pagination and bulk action.
- Every table/list empty, loading, success, error and populated state.
- Every role-to-route and role-to-action permission.
- Every responsive breakpoint and supported browser/device target found in project requirements.
- Every API request and backend operation associated with a workflow where traceable.

Use accessible names, labels, roles, route metadata and source inspection. Avoid brittle selectors based only on CSS classes or screen coordinates. Add stable `data-testid` attributes only where necessary and consistent with project conventions.

Produce `navigation-inventory.md`, `control-inventory.csv` (or JSON), `role-permission-matrix.md`, and a coverage ledger. Assign stable IDs such as `NAV-001`, `PAGE-001`, `BTN-001`, `FORM-001`, and `FLOW-001`.

## Phase 2 — Test each page and control systematically

For **every role × accessible page × visible control**, assess:

### Navigation and page integrity
- Correct destination and active navigation state.
- No blank pages, broken routes, incorrect breadcrumbs, dead links or redirect loops.
- Browser back/forward, refresh and direct URL behaviour.
- Loading indicators, skeletons, empty states, error states and retry behaviour.
- No clipped content, overlapping elements, horizontal overflow or inaccessible off-screen controls.

### Every button and interactive control
For each control, record its label, location, role, preconditions, action, expected result and actual result. Exercise it when safe:
- Click buttons, icon buttons, tabs, links, dropdowns, menus, accordions and modal controls.
- Verify disabled/enabled states and tooltips.
- Verify save, cancel, close, reset, confirm and delete flows. Use synthetic records; do not perform irreversible external actions.
- Confirm actions cause the correct UI change and, where applicable, the correct API/database state change.
- Check duplicate clicks, double submissions, slow responses and retry behaviour.
- A control with no meaningful action is a defect unless explicitly decorative and not presented as interactive.

### Forms and data operations
- Required fields, optional fields, formats, min/max lengths, numeric boundaries, date boundaries and cross-field rules.
- Inline errors, focus movement, accessible error announcements and preservation of valid entered data.
- Valid submission, invalid submission, cancellation, reset and edit/update.
- Duplicate detection, unique constraints, concurrency conflicts and server-side validation.
- Search, filters, sort, pagination, bulk selection and export/import.
- Upload type/size validation and safe handling of malformed files.
- Persistence after refresh, logout/login and a new session.
- Correct timezone, currency, locale and date formatting for configured users.

### Workflow testing
Test complete end-to-end journeys, not isolated screens. Derive workflows from product requirements and implementation. For an education ERP, consider:
- Create institution → configure academic year → create classes/sections/subjects → create staff → assign permissions → admit student → assign class/section → record attendance → enter marks → generate reports.
- Import students from a template → preview validation → correct errors → confirm import → verify counts and records.
- Fee setup → student invoice → sandbox payment → receipt → ledger/report reconciliation.
- Teacher login → view only assigned classes → take attendance → save → principal verifies.
- Principal approval/review → audit trail → report.
- Cross-institution isolation and subscription/plan feature restrictions.

Only test workflows supported by the actual product. Mark absent features as NOT IMPLEMENTED or OUT OF SCOPE, never PASS.

## Phase 3 — Visual and usability inspection

Inspect each page at desktop, tablet and mobile widths. Use actual project breakpoints where defined; otherwise test approximately 1440×900, 1024×768, 768×1024 and 390×844.

Evaluate and record:
- Visual hierarchy, alignment, spacing, density, typography, font weights and line heights.
- Colour contrast, consistency, semantic status colours and theme consistency.
- Sidebar/header behaviour, active/hover/focus/pressed/disabled states.
- Cards, tables, forms, dialogs, menus, charts, badges, icons and empty states.
- Text truncation, wrapping, overflow, responsive stacking and touch target sizes.
- Consistency across sibling pages and role dashboards.
- Readability and task efficiency for a real teacher, principal and office operator.

Take screenshots for every material defect and representative page/state. Use a consistent filename: `ROLE__PAGE-ID__STATE__viewport.png`. Do not call a page visually correct merely because it resembles another page.

## Phase 4 — Accessibility and browser quality

Run automated checks where compatible (for example axe-core) and manual checks:
- Keyboard-only navigation, logical tab order, visible focus, Escape handling and modal focus management.
- Semantic headings, landmarks, labels, accessible names, table headers and alt text.
- Contrast and zoom/reflow.
- Screen-reader-friendly validation and status messages where feasible.

Capture:
- Browser console errors and warnings.
- Failed network requests, API status codes and response errors (redact secrets and personal data).
- Unhandled exceptions, React/Vue/etc. runtime warnings, hydration errors and failed assets.
- Performance signals: slow navigation, repeated requests, layout shifts and large page delays.
- Security-relevant UI observations: exposed sensitive data, broken access control, unsafe redirects, insecure upload handling. Do not perform destructive security testing or exploit production.

## Phase 5 — Role and authorization verification

For each role:
1. Sign in using a dedicated synthetic account.
2. Inventory visible navigation and controls.
3. Visit permitted pages and exercise permitted actions.
4. Attempt restricted routes/actions safely and verify denial both in UI and backend/API. Hiding a button alone is not authorization.
5. Verify records are scoped to the correct institution, campus, class and assignment.
6. Verify role changes take effect after the intended refresh/session policy.
7. Record unexpected access as CRITICAL.

Never use a chairman/owner account as a shortcut to declare other roles tested.

## Phase 6 — Defect triage and repair

Classify findings:
- **P0 Critical:** data leak/cross-tenant access, privilege escalation, data corruption/loss, security compromise, production outage.
- **P1 High:** core workflow blocked, incorrect financial/academic records, unauthorized mutation, major role access failure.
- **P2 Medium:** important control/page broken, incorrect validation, major responsive or usability failure.
- **P3 Low:** cosmetic inconsistency, minor spacing/typography, non-blocking polish.

For each defect include:
- ID, severity, role, page/control ID, environment and reproducible steps.
- Expected vs actual result.
- Screenshot, console/network evidence and relevant request/response (redacted).
- Root cause supported by code/runtime evidence; distinguish confirmed cause from hypothesis.
- Minimal fix and regression test.
- Status: OPEN, FIXED, RETEST-PASS, BLOCKED or ACCEPTED-RISK.

Fix defects in priority order. Never silently change product requirements. If a business rule is ambiguous, document the ambiguity and ask for a decision rather than inventing behaviour.

## Phase 7 — Evidence, coverage and final report

Write results under `artifacts/qa/<timestamp-or-run-id>/` (never overwrite prior runs). Include:

- `executive-summary.md`
- `navigation-inventory.md`
- `control-inventory.csv` or `.json`
- `role-permission-matrix.md`
- `test-cases.csv`
- `defects.md`
- `screenshots/`
- `console-errors.log`
- `network-failures.log`
- `coverage.json`
- `environment.md`
- `final-report.md`

Every test case must have: ID, persona, page, control/workflow, preconditions, steps, expected, actual, status, evidence path, defect ID and retest status.

Report exact counts:
- Pages discovered / tested / passed / failed / blocked / not implemented.
- Controls discovered / exercised / passed / failed / blocked / not applicable.
- Workflows discovered / executed / passed / failed / blocked.
- Role-permission checks passed/failed/blocked.
- Responsive viewports and browsers tested.
- Accessibility checks passed/failed/needs manual review.
- Console errors, failed requests and unresolved defects by severity.
- Regression suite and build/test command results.

Use PASS, FAIL, BLOCKED, NOT IMPLEMENTED and NOT APPLICABLE only. Do not count BLOCKED or NOT IMPLEMENTED as PASS. Calculate coverage from discovered inventory, not from the number of tests that happened to be written.

## Definition of done

The audit is complete only when:
- Every discovered tab, subtab and page has a recorded result for each applicable role.
- Every discovered visible interactive control has a recorded result or a justified BLOCKED/NOT APPLICABLE status.
- Core end-to-end journeys are tested with synthetic data and persistence verified.
- Role restrictions and tenant isolation are tested at both UI and backend layers.
- Desktop/tablet/mobile visual review is recorded.
- Console/network failures are investigated.
- All P0/P1 defects are fixed and retested, or explicitly blocked with owner and reason.
- Relevant automated tests and build/lint/type checks pass.
- The final report states residual risk and does not make unsupported readiness claims.

A zero-failure report is not a target to manufacture. Honest defect discovery is success.

## Execution protocol when invoked

1. State the project root and target environment. If ambiguous, inspect safely and ask only for missing credentials/environment details.
2. Create a plan and inventory before clicking.
3. Start or identify the application using documented project commands. Do not guess secrets or production URLs.
4. Use browser automation and capture evidence.
5. Execute all applicable personas and workflows in batches; maintain a persistent ledger to avoid skipped pages.
6. Diagnose and fix confirmed defects.
7. Rerun affected tests plus full regression suite.
8. Produce the final report and a concise chairman-level verdict: READY FOR CONTROLLED UAT, NOT READY, or BLOCKED. Production readiness requires separate operational, security, backup/restore, monitoring and load validation; browser QA alone cannot certify it.

## First response format

When starting an audit, report:
- Project and environment detected.
- Test framework selected and why.
- Roles and pages discovered so far.
- Safety boundaries and test-data strategy.
- Execution plan and expected evidence directory.

Then proceed with the audit; do not stop after proposing a plan unless blocked by missing access or explicit approval requirements.
