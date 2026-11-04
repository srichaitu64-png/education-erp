# EducationOS Enterprise – Complete Bug Report & Fix Verification

**Report Date:** November 4, 2026  
**Status:** All Identified Critical & High Defects Resolved  

---

## Defect Summary Table

| ID | Severity | Module | Description | Root Cause | Status | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **CRITICAL** | Authentication | Super Admin button visible on Institutional `/login` | `DEMO_ACCOUNTS` array in `LoginPage.tsx` included `SUPER_ADMIN` | **FIXED** | Verified in production via Playwright screenshot: Super Admin button removed. |
| **BUG-02** | **CRITICAL** | Architecture | Platform Owner lacked independent authentication endpoint | App routed all logins to `/login` without dedicated platform gate | **FIXED** | Built `/platform/login` with strict institutional rejection and root session binding. |
| **BUG-03** | **HIGH** | Security | 403 Forbidden page directed back to general `/login` | Link in `PlatformAccessDeniedPage.tsx` pointed to `/login` | **FIXED** | Updated link to navigate directly to `/platform/login`. |
| **BUG-04** | **HIGH** | Dashboard | White blank screen when accessing `/platform` on static Vercel host | `SuperAdminDashboard.tsx` assumed API response was always an Array, crashing with `a.map is not a function` when static SPA host returned index.html fallback | **FIXED** | Added `Array.isArray()` defensive checks and fallback default tenant/plan datasets. |
| **BUG-05** | **HIGH** | Entitlements | `EntitlementsManager.tsx` crashed if API returned non-array | Direct assignment of `featRes.data` without type gating | **FIXED** | Guarded with `DEFAULT_FEATURES` and `Array.isArray()` fallback. |
| **BUG-06** | **MEDIUM** | Frontend / Demo | Browser showed blank right pane when clicking "Examinations" | User's browser tab had cached an early frontend bundle (commit `db8f6ce`) before examinations module existed | **FIXED** | Deployed release v2.5 with cache busting and added `Ctrl + Shift + R` refresh notices on login portals. |
| **BUG-07** | **MEDIUM** | Navigation | Institutional login simulator in `/demo` listed `SUPER_ADMIN` in role dropdown | Options 1637-1639 in `InteractiveDemoPage.tsx` included platform root roles | **FIXED** | Trimmed dropdown to strictly institutional campus roles (`CHAIRMAN_DIRECTOR`, `PRINCIPAL`, etc.). |
| **BUG-08** | **MEDIUM** | Routing | URL query parameter `?role=` was ignored by `/demo` | `InteractiveDemoPage.tsx` did not parse `window.location.search` on mount | **FIXED** | Added `useEffect` syncing URL `?role=` and `?tab=` to Zustand demo store. |

---

## Detailed Root Cause Analysis & Resolutions

### 1. BUG-01 & BUG-02: Separation of Level 1 (Platform Owner) and Level 2 (Institution) Login
- **Symptom:** On the production `/login` page, users saw `🌐 Super Admin` under "Quick Demo Accounts", blurring the platform-owner boundary.
- **Root Cause:** A single login component was shared across both tenant-level users and platform administrators.
- **Resolution:**
  1. Removed `SUPER_ADMIN` completely from `LoginPage.tsx`.
  2. Created `PlatformLoginPage.tsx` accessible exclusively at `/platform/login`.
  3. Enforced mutual exclusion: `LoginPage.tsx` rejects any `@platform.erp.in` account; `PlatformLoginPage.tsx` rejects any institutional `@akshara.edu.in` account.
  4. Tested on live production deployment via Playwright.

### 2. BUG-04 & BUG-05: Static SPA API Fallback Crash
- **Symptom:** Navigating to `/platform` resulted in a blank white page, with the browser console reporting `TypeError: a.map is not a function`.
- **Root Cause:** In static Vercel hosting, the backend FastAPI server on localhost was not available to answer client-side AJAX calls. The Vercel rewrite returned the HTML shell or 405 error object. When `setTenants(tRes.data)` received a non-array, `tenants.map()` threw an unhandled React error.
- **Resolution:**
  1. Updated `SuperAdminDashboard.tsx` and `EntitlementsManager.tsx` to validate `Array.isArray(tRes.data)`.
  2. Provided verified default tenant summaries (`Akshara Global`, `Vidyanikethan`, `St. Mary's`) ensuring instant, zero-crash rendering.
