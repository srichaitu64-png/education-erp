# eSkooly (`https://eskooly.com/bb/dashboard.php`) Reverse Engineering Report

## 1. Executive Summary & Website Discovery

- **Target URL**: `https://eskooly.com/bb/dashboard.php`
- **Authenticated Session User**: `myaihub26@gmail.com`
- **Platform Domain**: Cloud-based Free School Management Software
- **Target Audience**: School administrators, principals, accountants, teachers, and students across South Asia, Middle East, and emerging markets.

### 1.1 Architectural Comparison

| Dimension | eSkooly Architecture | EducationOS Enterprise SaaS |
| :--- | :--- | :--- |
| **Backend Framework** | Monolithic PHP (7.x/8.x) + Apache | High-performance FastAPI (Python 3.11) + Asynchronous Uvicorn |
| **Database Architecture** | Shared MySQL with tenant ID columns | Enterprise PostgreSQL 16 with Row-Level Security (RLS) isolation |
| **Frontend Framework** | Server-side rendered PHP + Bootstrap 4 + jQuery | Modern Vite 6 + React 18 + TypeScript + Tailwind CSS |
| **State Management** | PHP `$_SESSION` + full page reloads | Reactive Zustand store with persistent client-side storage |
| **Data Integrity** | Manual form POSTs | Schema-validated Pydantic models with database constraints |
| **Multi-Tenancy** | Soft tenant isolation via queries | Cryptographically isolated schema / RLS policies |
| **Offline Capability** | None (requires continuous internet) | IndexedDB offline persistence with background synchronization |

### 1.2 Core Navigation & Information Architecture

eSkooly organizes school management into 7 primary domains accessible via the left sidebar:

1. **Dashboard (`dashboard.php`)**:
   - Universal Quick Actions: `+ Add Student`, `Collect Fee`, `Mark Attendance`, `+ Add Class`, `+ Add Employee`, `Notice / SMS`.
   - Demographic distribution bar (Boys vs Girls ratio).
   - Today's Attendance Progress widget.
   - Recent fee collection ticker.
2. **Students & Admissions (`admission.php`, `allstudents.php`)**:
   - Comprehensive multi-tab registration form (Personal, Academic, Guardian, Fee concessions).
   - Searchable student directory with instant drilldown.
3. **Fee Management (`submitfees.php`, `feereport.php`, `feeheads.php`)**:
   - Front-desk quick collection modal.
   - Student dues lookup by Roll / Admission number.
   - Payment modes: Cash, Bank Transfer, Online UPI, Cheque.
   - Official numbered receipt generation.
4. **Attendance (`markatt.php`, `attreport.php`)**:
   - Class and section roll-call view.
   - Daily vs period-based attendance toggle.
   - Bulk present/absent tagging.
5. **Academics & Classes (`classes.php`, `sections.php`, `subjects.php`)**:
   - Class registry, section allocations, and room assignments.
6. **Employees & Staff (`addemployee.php`, `allemployees.php`)**:
   - Faculty roster, designations, department assignments.
7. **Examinations (`allexams.php`, `marksentry.php`, `resultcard.php`)**:
   - Term examinations, grading structures, report card generator.

