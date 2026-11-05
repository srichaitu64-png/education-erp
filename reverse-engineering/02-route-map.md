# Route & Capability Mapping: eSkooly to EducationOS

This document specifies the exact mapping between legacy eSkooly PHP pages and the modern EducationOS React / FastAPI enterprise architecture.

| eSkooly Endpoint | eSkooly Feature | EducationOS Component / Route | Capabilities & Enhancements in EducationOS |
| :--- | :--- | :--- | :--- |
| `/bb/dashboard.php` | Main Overview Dashboard | `/demo` (`InteractiveDemoPage.tsx` + `RoleWorkspaceDispatcher.tsx`) | 18 dynamic role workspaces, live metrics, eSkooly Demographics card (Boys vs Girls distribution), Today's Attendance bar, Fee Ledger summary. |
| `/bb/admission.php` | Direct Student Admission | `CreateStudentModal.tsx` (`+ Add Student`) | Instant enrollment form (not just CSV import). Auto-assigns fee invoices, registers daily attendance, updates class capacity, and persists across reloads. |
| `/bb/submitfees.php` | Collect Fee & Issue Slip | `CollectFeeModal.tsx` (`Collect Fee`) | Student search, dues lookup, payment mode picker (Cash, UPI, Cheque, Bank), instant dues decrement, and authenticated printable official receipt (`RCP-OS-2026-XXXX`). |
| `/bb/markatt.php` | Mark Class Attendance | `ConfigurableAttendanceView.tsx` | Daily and lecture-wise period roll-call, biometric sync simulation, SMS/WhatsApp alert dispatch to parents of absentees. |
| `/bb/classes.php` | Manage Classes & Sections | `CreateClassModal.tsx` (`+ Add Class`) | Multi-level hierarchy (School K-10, PU College I/II PUC, Degree College B.Sc/B.Com), room mapping, max capacity enforcement. |
| `/bb/allemployees.php` | Staff & Teacher Directory | `apps/web/src/pages/demo/InteractiveDemoPage.tsx` (Tab `staff`) | Faculty directory, designation, academic unit assignments, invigilation and subject duty rosters. |
| `/bb/allexams.php` | Exam Management | `apps/web/src/pages/demo/InteractiveDemoPage.tsx` (Tab `examinations`) | 4-stage examination lifecycle (Draft, Scheduled, Conducted, Published), QR hall tickets, and theory/practical marks registers. |
| `/bb/setting.php` | Institute Profile & Setup | `InstitutionDashboard.tsx` & `PlatformSuperAdminView.tsx` | Institution profile, multi-campus governance, custom fee heads, RBAC permissions, and white-label branding. |

