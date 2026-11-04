# EducationOS Enterprise – Staff Duty Assignment Matrix

**Model Definition:** Centralized Staff Duty & Responsibility Binding  
**Compliance Standard:** Principle of Least Privilege & Maker-Checker Workflows  

---

## 1. Duty Assignment Architecture

In EducationOS, a role title alone does not grant operational access. A user must possess an active, approved **Duty Assignment** binding them to:
1. **Tenant Organization** (e.g., `tenant-akshara`)
2. **Campus** (e.g., Main Campus, North Campus)
3. **Academic Year** (e.g., `2026-2027`)
4. **Academic Course / Stream** (e.g., `School`, `I PUC Science (PCMB)`)
5. **Class & Section** (e.g., `Class 6-A`, `I PUC PCMB-A`)
6. **Subject** (e.g., `Physics`, `Chemistry`, `Mathematics`, `Biology`)
7. **Examination Session** (where applicable, e.g., `Mid-Term Exam 2026`)
8. **Operational Duties** (e.g., `Mark Entry Draft`, `Invigilation`, `Roll Call Attendance`)
9. **Validity Horizon** (Effective Date -> Expiry Date)

---

## 2. Active Staff Duty Assignments (Campus Sample)

| Duty Assignment ID | Staff Name & ID | Assigned Role | Course & Section Scope | Subject Scope | Authorized Operational Duties | Supervisor | Validity Period |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DUTY-2026-001` | **Lakshmi Prasad** (`EMP-TCH-01`) | Subject Teacher | I PUC (Science) • Sections A & B | Physics | • Daily roll-call attendance<br>• Theory (70) & Lab (30) mark entry<br>• Draft marks submission | Dr. Ramesh Kumar (Principal) | 2026-06-01 to 2027-05-31 |
| `DUTY-2026-002` | **Dr. P. Sundaram** (`EMP-LEC-01`) | Senior PU Lecturer | I PUC (Science) • Section A | Biology | • NEET Foundation test scoring<br>• Biology practical marks entry<br>• Performance diagnostics | Dr. Ramesh Kumar (Principal) | 2026-06-01 to 2027-05-31 |
| `DUTY-2026-003` | **Prof. Ananth Murthy** (`EMP-EXAM-01`)| Exam Controller | All Classes (School, PU, Degree) | All Subjects | • Examination schedule configuration<br>• Batch hall ticket generation<br>• Mark moderation & verification<br>• Notice board publication | Dr. S. K. Narayana (Chairman) | 2026-06-01 to 2027-05-31 |
| `DUTY-2026-004` | **Suresh Gowda** (`EMP-OPS-01`) | Data Operator | I PUC (Science) • Section A | Chemistry | • High-speed marks draft entry<br>• Absence record transcription<br>*(Approval rights denied)* | Prof. Ananth Murthy (Controller) | 2026-11-01 to 2026-12-15 *(Temporary)* |
| `DUTY-2026-005` | **Venkatesh Iyer** (`EMP-ACC-01`) | Senior Accountant | Central Campus Front Counter | All Fee Heads | • Counter fee collection<br>• Installment receipt generation<br>• Multi-head payment allocation<br>• Consolidated ledger preparation | Dr. S. K. Narayana (Chairman) | 2026-06-01 to 2027-05-31 |
| `DUTY-2026-006` | **Anil Deshmukh** (`EMP-DRV-104`) | Bus Driver | Route 104 (Hebbal to Campus) | Transport | • Student pickup/drop roll-call<br>• One-tap GPS trip broadcast | Transport Manager | 2026-06-01 to 2027-05-31 |
| `DUTY-2026-007` | **Dr. V. Murthy** (`EMP-FAC-09`) | External Invigilator | Hall B-204 | Mid-Term Exam | • Examination hall invigilation<br>• Answer booklet collection | Prof. Ananth Murthy (Controller) | 2026-11-20 to 2026-11-30 *(Exam Cycle)* |

---

## 3. Maker-Checker Control Enforcement

```
┌────────────────────────────────────────────────────────┐
│               MAKER-CHECKER WORKFLOW ENGINE            │
├────────────────────┬───────────────────────────────────┤
│ 1. DATA ENTRY      │  Subject Teacher / Data Operator  │
│    (Maker)         │  • Saves Draft Marks              │
│                    │  • Submits for Verification       │
├────────────────────┼───────────────────────────────────┤
│ 2. MODERATION      │  Controller of Examinations       │
│    (Checker)       │  • Verifies Max / Passing Rules   │
│                    │  • Forwards to Principal          │
├────────────────────┼───────────────────────────────────┤
│ 3. FINAL SANCTION  │  Principal                        │
│    (Approver)      │  • Executive Sanction & Sign-off  │
├────────────────────┼───────────────────────────────────┤
│ 4. PUBLICATION     │  Controller / Office Admin        │
│    (Release)       │  • Notice Board & Student Portals │
└────────────────────┴───────────────────────────────────┘
```

- **Lockout Rule:** A user cannot approve their own submitted work. If a Teacher submits marks, they cannot self-approve.
- **Audit Record:** Every stage stamps `user_id`, `role`, `timestamp`, and `ip_address` into an immutable audit trail.
