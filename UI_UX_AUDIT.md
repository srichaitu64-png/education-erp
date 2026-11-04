# EducationOS Enterprise – UI/UX & Visual Identity Audit

**Design System Standard:** EducationOS Unified Identity  
**Primary Aesthetic:** Enterprise Navy & Slate Workspace with Rounded Cards  

---

## 1. Unified Visual Design Tokens

All roles share a single, polished design system rather than disparate color palettes:

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Brand Primary (Navy)** | `#172B4D` | Sidebar backgrounds, primary institutional headers, dark card borders |
| **Brand Accent (Blue)** | `#2563EB` | Active menu pills, primary submission buttons, selected tab indicators |
| **Workspace Neutral** | `#0F172A` / `#F8FAFC` | Main content background (Slate 900 dark / Slate 50 light) |
| **Text Primary** | `#FFFFFF` / `#1E293B` | High-contrast headers and prominent data values |
| **Text Muted** | `#94A3B8` / `#64748B` | Secondary labels, breadcrumbs, and timestamp indicators |
| **Success Emerald** | `#10B981` | Paid status badges, pass indications, verified duty indicators |
| **Warning Amber** | `#F59E0B` | Partial payment badges, pending approvals, lock notifications |
| **Critical Rose** | `#EF4444` | Overdue fee alerts, withheld marks, 403 Forbidden warnings |

---

## 2. Shared Shell & Reusable Component Hierarchy

1. **`ProfessionalSidebarNavigation.tsx`**:
   - Reorganized into **7 collapsible groups**:
     1. Main Workspaces
     2. Academic & Sections
     3. Examination Suite
     4. Finance & Fee Operations
     5. Campus Operations
     6. Communication & Engagement
     7. Data Management
   - Features chevron toggles, active indicator pills, mobile hamburger drawer, and role-based dynamic trimming.

2. **`RoleWorkspaceDispatcher.tsx`**:
   - Dynamically renders role-tailored dashboards based on authenticated identity:
     - **Chairman / Director:** Campus strength, financial realization, strategic board projections.
     - **Principal:** Exam sanction queues, daily attendance approvals, department head rosters.
     - **Accountant:** Daily collection registers, partial payment queues, cashier balances.
     - **Teacher:** Assigned classes, attendance roll call, Theory & Practical marks entry.
     - **Exam Controller:** Schedule creation, hall ticket generation, moderator registers.
     - **Parent:** Linked child attendance, fee receipts, live GPS tracking.
     - **Student:** Class timetable, hall tickets, NEET diagnostic mock analytics.

3. **Responsive Breakpoints:**
   - Full support across Desktop (1280px+), Tablet (768px - 1024px), and Mobile (< 768px) with horizontal scroll prevention on all tables.
