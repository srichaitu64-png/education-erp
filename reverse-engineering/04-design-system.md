# Design System & Visual Architecture: eSkooly Reverse-Engineered

## 1. Visual Foundation & Color Tokens

Through optical analysis of eSkooly (`https://eskooly.com/bb/dashboard.php`), the user experience relies on a clean, light, and airy canvas that avoids heavy, gloomy dark containers.

### 1.1 Color Palette

- **Page Background Canvas**: `#f8fafc` / `#f4f6f9` (`bg-slate-100/80` or `bg-slate-50`).
- **Surface / Card Background**: Pure `#ffffff` (`bg-white`) with subtle borders (`border-slate-200`) and soft shadows (`shadow-xs` / `shadow-sm`).
- **Primary Action (Brand Blue)**: `#2563eb` (`bg-blue-600` hover `bg-blue-700` text `#ffffff`).
- **Success / Positive (Emerald)**: `#10b981` (`bg-emerald-600` / `bg-emerald-50 text-emerald-700`).
- **Warning / Dues (Amber)**: `#f59e0b` (`bg-amber-600` / `bg-amber-50 text-amber-700`).
- **Danger / Absent (Rose)**: `#ef4444` (`bg-rose-600` / `bg-rose-50 text-rose-700`).
- **Text Headings**: `#0f172a` (`text-slate-900 font-black` or `font-bold`).
- **Text Body / Muted**: `#64748b` (`text-slate-500 font-medium` / `text-slate-600`).

### 1.2 Layout Hierarchy

1. **Top Universal Quick Action Bar**:
   - Prominently positioned directly under the role inspector.
   - 6 Quick Action Buttons:
     - `+ Add Student` (Blue)
     - `Collect Fee` (Emerald)
     - `Mark Attendance` (Purple)
     - `+ Add Class` (Indigo)
     - `+ Add Employee` (Teal)
     - `Notice / SMS` (Amber)
2. **eSkooly Demographics Card**:
   - Visual comparison of Boys vs Girls distribution with stacked progress bar.
   - Percentage counters and real-time student count breakdown.
3. **Today's Attendance Bar**:
   - Live percentage bar displaying student attendance, faculty presence, and fee recovery targets.
4. **Data Tables**:
   - Pure white card container.
   - Header row: `bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]`.
   - Zebra/hover row: `hover:bg-slate-50/80 transition-colors`.
   - Monospace font for numerical identifiers (`ADM-2026-XXXX`, `RCP-OS-2026-XXXX`).

