# Run this in Antigravity

Read and follow the `human-qa-auditor` skill in `.agents/skills/human-qa-auditor/SKILL.md`.

I want you to INSTALL/VERIFY this workspace skill and then execute a full human-style QA audit of THIS repository and its running application.

Act as the chairman/owner, platform administrator, institution administrator, principal, teacher, office/computer operator, accountant, and student/parent wherever those roles actually exist in the product. Discover the real roles; do not invent them.

Do not stop after creating a test plan. Inspect the repository, identify the app's routes and every navigation tab/subtab/page/control, establish a safe test environment with synthetic data, and execute the audit. Test every visible button, link, menu, dropdown, form, validation, table action, import/export, search/filter, modal, workflow, permission and persistence behaviour. Check desktop/tablet/mobile appearance, colours, spacing, typography, contrast, keyboard accessibility, console errors, failed network/API requests and backend authorization. Use browser automation plus human visual inspection.

First verify the target URL/environment and whether test credentials/data are available. Never use production data or trigger irreversible external actions. If access is missing, continue with all repository/static checks possible and clearly mark browser tests BLOCKED.

Create a timestamped `artifacts/qa/<run-id>/` evidence package with screenshots, inventories, test cases, defect log, role matrix, coverage counts and a final report. Fix confirmed defects safely, add regression tests, and retest. Do not weaken tests or claim 100% readiness without evidence.

At completion, give me:
1. Exact tabs/pages/controls discovered and tested counts.
2. Results by persona and workflow.
3. All defects with severity, root cause, fix and retest evidence.
4. Screenshots and console/network findings.
5. Build, lint, type-check and automated test results.
6. Blocked/untested areas and why.
7. A chairman-level verdict: READY FOR CONTROLLED UAT, NOT READY, or BLOCKED.

Continue until the audit is actually executed or a genuine access/safety blocker prevents it. Do not merely tell me what you would do.
