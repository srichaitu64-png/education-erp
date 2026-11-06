# Root Cause Analysis & Fix History

## Defect DEF-RBAC-001
- **Symptom:** When a user with role TEACHER directly loaded `?role=TEACHER&tab=fees`, the financial workspace rendered.
- **Root Cause:** Mount `useEffect` in `InteractiveDemoPage.tsx` called `setActiveTab(tabParam)` without checking `ROLE_PRIVILEGES[currentRole].allowedTabs`.
- **Resolution:** Updated mount hook to check `allowedTabs` and redirect to `dashboard` when unauthorized, and added a reactive guard hook.
- **Regression Test:** Added automated boundary test cases in Playwright suite.
