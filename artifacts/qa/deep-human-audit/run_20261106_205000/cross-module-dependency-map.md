# Cross-Module Dependency & Information Flow Map

| Pathway ID | Source Entity | Service / Model | Consuming Modules | Information Propagated |
| :--- | :--- | :--- | :--- | :--- |
| SYNC-001 | Student Admission | Student / Enrolment | SIS, Attendance, Fees, Exams | Student biodata, section allocation, initial fee invoice, attendance roster |
| SYNC-002 | Fee Structure & Payment | FeeInvoice / Receipt | Accounts Ledger, Receipt Audit, Student Profile, Chairman Review | Outstanding balance reduction, receipt number generation, immutable audit log |
| SYNC-003 | Curriculum Mapping | SubjectCatalog / Section | Timetable, Theory/Lab Marks Register, Progress Cards | Course codes, theory max marks, practical components, credit weightage |
| SYNC-004 | Staff Duty Assignment | StaffDuty / Section | Invigilation Roster, Teacher Timetable, Duty Allowance | Period duty assignments, invigilator classroom allocations |
| SYNC-005 | Daily Attendance Capture | AttendanceRecord | SIS Attendance %, Absentee SMS Alert, Monthly Report Card | Attendance percentage recomputation, automated parent communication |
| SYNC-006 | Examination Marks Entry | ExamMarksRegister | Grade Calculation, Student Progress Card, Principal Seal | Total score, percentage, letter grade (A/B/C), rank, GPA |
| SYNC-007 | Executive Dashboard Counters | Aggregated Models | Chairman Command Center, Principal Workspace | Live student headcount, collection totals, faculty count, attendance avg |
