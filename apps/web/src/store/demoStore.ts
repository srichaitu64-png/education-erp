import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Role-Based Access Control (RBAC) & Governance Types
// ---------------------------------------------------------------------------
export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'INSTITUTION_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'ACCOUNTANT'
  | 'EXAM_CONTROLLER'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT'
  | 'TRANSPORT_MANAGER';

export type FineGrainedAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'archive'
  | 'submit'
  | 'verify'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'export'
  | 'print'
  | 'assign'
  | 'collect'
  | 'refund'
  | 'reconcile'
  | 'configure'
  | 'manage_users'
  | 'manage_permissions';

export type PermissionScopeType =
  | 'tenant'
  | 'campus'
  | 'department'
  | 'programme'
  | 'class'
  | 'section'
  | 'subject'
  | 'assigned_students'
  | 'own_child'
  | 'assigned_route';

export interface ScopeAssignment {
  scopeType: PermissionScopeType;
  scopeValue: string;
  description: string;
}

export interface TemporaryPermission {
  id: string;
  roleCode: UserRoleType;
  action: FineGrainedAction;
  module: string;
  expiresAt: string;
  reason: string;
}

export interface PermissionAuditEntry {
  id: string;
  version: number;
  timestamp: string;
  actingSuperAdmin: string;
  targetRole: UserRoleType;
  actionType: string;
  description: string;
  previousState: Record<string, boolean>;
  newState: Record<string, boolean>;
  canRollback: boolean;
}

export interface PermissionChangeRequestItem {
  id: string;
  requestedByRole: string;
  requestedByName: string;
  targetRole: UserRoleType;
  action: FineGrainedAction;
  module: string;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export type PresentationState =
  | 'VISIBLE_ACCESSIBLE'
  | 'VISIBLE_LOCKED'
  | 'COMPLETELY_HIDDEN';

export interface DashboardDesignerNavItem {
  id: string;
  label: string;
  iconName: string;
  menuVisibility: 'SHOW' | 'HIDE';
  moduleAccess: 'ACCESSIBLE' | 'INACCESSIBLE';
  presentationState: PresentationState;
  lockReason?: string;
  actionPermissions: FineGrainedAction[];
}

export interface RolePrivilegeInfo {
  role: UserRoleType;
  title: string;
  badgeColor: string;
  allowedTabs: string[];
  canEdit: string[];
  canApprove: string[];
  restrictedActions: string[];
  scopes: ScopeAssignment[];
}

export const ROLE_PRIVILEGES: Record<UserRoleType, RolePrivilegeInfo> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Platform Super Administrator',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    allowedTabs: [
      'dashboard', 'permissions-centre', 'dashboard-designer', 'tenants', 'plans', 'entitlements', 'audit'
    ],
    canEdit: ['All platform privileges', 'Role matrix', 'Dashboard Designer layouts', 'Tenant plans', 'Scopes & Temporary permissions'],
    canApprove: ['Institution tenant provisioning', 'Permission change requests', 'Emergency license overrides'],
    restrictedActions: ['Protected by Lockout Guard: Cannot remove last Platform Super Admin access'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'ALL_TENANTS', description: 'Platform-wide authority' }]
  },
  INSTITUTION_ADMIN: {
    role: 'INSTITUTION_ADMIN',
    title: 'Institution Administrator',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    allowedTabs: [
      'dashboard', 'admissions', 'students', 'academics', 'fees', 'attendance',
      'examinations', 'transport', 'staff', 'timetable', 'analytics', 'settings'
    ],
    canEdit: ['Curriculum & subjects', 'Staff profiles', 'Fee structures', 'Institution settings'],
    canApprove: ['Student admissions', 'Staff leave requests', 'Department budgets'],
    restrictedActions: ['CANNOT create, modify or grant permissions. Must submit requests to Platform Super Admin'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Akshara Global Campus' }]
  },
  PRINCIPAL: {
    role: 'PRINCIPAL',
    title: 'Principal / Director',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    allowedTabs: [
      'dashboard', 'students', 'attendance', 'examinations',
      'fees', 'transport', 'staff', 'timetable', 'analytics'
    ],
    canEdit: ['Academic calendar', 'Staff evaluations', 'Performance reviews'],
    canApprove: ['Final exam results publication (Stage 3)', 'Fee concessions & refunds', 'Student transfer certificates'],
    restrictedActions: ['Cannot silently overwrite marks entered by teachers without audit trail; cannot edit permissions'],
    scopes: [{ scopeType: 'campus', scopeValue: 'MAIN_CAMPUS', description: 'Main Campus & All Academic Streams' }]
  },
  VICE_PRINCIPAL: {
    role: 'VICE_PRINCIPAL',
    title: 'Vice Principal (Academics & Discipline)',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    allowedTabs: ['dashboard', 'students', 'attendance', 'examinations', 'timetable', 'staff'],
    canEdit: ['Timetable schedules', 'Daily class supervision'],
    canApprove: ['Student leaves', 'Disciplinary reviews'],
    restrictedActions: ['Cannot approve financial transactions or platform settings'],
    scopes: [{ scopeType: 'department', scopeValue: 'ACADEMICS', description: 'Secondary & PU Classes' }]
  },
  ACCOUNTANT: {
    role: 'ACCOUNTANT',
    title: 'Finance & Accounts Officer',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    allowedTabs: ['dashboard', 'fees'],
    canEdit: ['Fee collection', 'Payment allocations', 'Issue digital receipts'],
    canApprove: ['Payment reconciliations', 'Request exceptional fee refunds (Dual Approval required)'],
    restrictedActions: ['LOCKED from editing marks, examinations, attendance, or student academic data; cannot grant permissions'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Akshara Accounts Ledger' }]
  },
  EXAM_CONTROLLER: {
    role: 'EXAM_CONTROLLER',
    title: 'Controller of Examinations',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    allowedTabs: ['dashboard', 'examinations'],
    canEdit: ['Exam timetable schedules', 'Room allocations', 'Invigilator duties', 'Passing criteria'],
    canApprove: ['Audit & verify marks for missing entries/errors (Stage 2)'],
    restrictedActions: ['LOCKED from fee collections, HR, and platform permissions; cannot publish results without Principal seal'],
    scopes: [{ scopeType: 'programme', scopeValue: 'ALL_PROGRAMMES', description: 'All Academic Examination Batches' }]
  },
  TEACHER: {
    role: 'TEACHER',
    title: 'Faculty / Subject Teacher (Physics - I PUC)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    allowedTabs: ['dashboard', 'attendance', 'examinations', 'timetable'],
    canEdit: ['Class attendance for assigned periods', 'Draft marks entry for assigned subjects only'],
    canApprove: ['Submit subject marks batch to Examination Controller (Stage 1)'],
    restrictedActions: ['LOCKED from other teachers\' subjects, fee collections, and student financial records'],
    scopes: [{ scopeType: 'subject', scopeValue: 'PHY-101', description: 'I PUC Physics & Class 10 Science' }]
  },
  PARENT: {
    role: 'PARENT',
    title: 'Parent / Guardian (Aarav Sharma - Class 10)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    allowedTabs: ['dashboard', 'students', 'fees', 'attendance', 'examinations', 'transport', 'timetable'],
    canEdit: ['Own emergency contact information'],
    canApprove: ['Online fee payment authorization'],
    restrictedActions: ['STRICTLY ISOLATED to only linked child\'s records; cannot view any other student'],
    scopes: [{ scopeType: 'own_child', scopeValue: 'ADM-2026-001', description: 'Aarav Sharma (Class 10-A)' }]
  },
  STUDENT: {
    role: 'STUDENT',
    title: 'Student Portal (Ananya Hegde - I PUC PCMB)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    allowedTabs: ['dashboard', 'examinations', 'attendance', 'timetable'],
    canEdit: ['Attempt CBT practice tests & view study materials'],
    canApprove: ['None (Read-only access)'],
    restrictedActions: ['LOCKED from entering marks, attendance, fee collections, or staff records'],
    scopes: [{ scopeType: 'assigned_students', scopeValue: 'ADM-2026-002', description: 'Ananya Hegde (I PUC)' }]
  },
  TRANSPORT_MANAGER: {
    role: 'TRANSPORT_MANAGER',
    title: 'Transport Manager & Fleet Supervisor',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    allowedTabs: ['dashboard', 'transport'],
    canEdit: ['Routes, bus stops, vehicle documents, driver assignments', 'Trip status updates'],
    canApprove: ['Route allocation requests'],
    restrictedActions: ['LOCKED from academic marks, examination records, and fee ledgers'],
    scopes: [{ scopeType: 'assigned_route', scopeValue: 'ROUTE_104_208', description: 'Campus Bus Routes' }]
  },
};

// ---------------------------------------------------------------------------
// Core Data Entities
// ---------------------------------------------------------------------------
export interface DemoStudent {
  id: string;
  admission_number: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  institution_level: 'School' | 'PU College' | 'Degree College';
  class_name: string;
  section_or_stream: string;
  guardian_name: string;
  guardian_phone: string;
  fee_balance: number;
  attendance_pct: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DemoAdmission {
  id: string;
  application_number: string;
  applicant_name: string;
  level: string;
  target_class: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  submission_date: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
}

export type FeeHeadType =
  | 'COLLEGE_FEE'
  | 'LAB_FEE'
  | 'HOSTEL_MESS_FEE'
  | 'TRANSPORT_FEE'
  | 'ADMISSION_FEE'
  | 'EXAM_FEE'
  | 'LIBRARY_FEE';

export interface DemoFeeInvoice {
  id: string;
  invoice_number: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  fee_head: FeeHeadType;
  fee_title: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'UNPAID';
}

export interface DemoAttendanceRecord {
  student_id: string;
  student_name: string;
  roll_number: string;
  class_name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface DemoExamMarks {
  student_id: string;
  student_name: string;
  roll_number: string;
  subject: string;
  max_marks: number;
  obtained_marks: number;
  grade: string;
}

export interface ExamScheduleItem {
  id: string;
  subject: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room: string;
  invigilator: string;
  theory_max: number;
  practical_max: number;
  passing_marks: number;
}

export type InstitutionalExamCategory =
  | 'Weekly Test'
  | 'Unit Test'
  | 'Monthly Test'
  | 'Quarterly Exam'
  | 'Half-Yearly'
  | 'Annual Board Pre-Mock'
  | 'Practical Lab'
  | 'Model Exam'
  | 'NEET Foundation'
  | 'JEE Foundation'
  | 'KCET Foundation'
  | 'PU Competitive Exam Record';

export type ExamDeliveryMode =
  | 'Offline (Paper-based)'
  | 'Internal Online'
  | 'External Provider Adapter';

export interface DemoExam {
  id: string;
  title: string;
  code: string;
  academic_year: string;
  target_level: 'School' | 'PU College' | 'Degree College';
  class_name: string;
  category: InstitutionalExamCategory;
  exam_mode: ExamDeliveryMode;
  question_paper_attached: boolean;
  online_provider_name?: string;
  status: 'SCHEDULED' | 'MARKS_ENTRY' | 'CONTROLLER_VERIFIED' | 'PRINCIPAL_APPROVED' | 'PUBLISHED';
  schedules: ExamScheduleItem[];
  instructions?: string;
}

export interface AcademicSubject {
  id: string;
  code: string;
  name: string;
  institution_level: 'School' | 'PU College' | 'Degree College';
  target_class: string;
  stream_or_comb?: string;
  theory_marks: number;
  practical_marks: number;
  credits?: number;
  is_compulsory: boolean;
  assigned_teacher: string;
  is_archived: boolean;
}

export interface TransportRoute {
  id: string;
  route_code: string;
  route_name: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity: number;
  driver_name: string;
  driver_phone: string;
  attendant_name: string;
  current_location: string;
  status: 'IN_TRANSIT' | 'AT_STOP' | 'COMPLETED' | 'STANDBY';
  current_speed_kmh: number;
  stops: { stop_name: string; scheduled_time: string; student_count: number; is_passed: boolean }[];
}

export interface ExternalExamProvider {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  endpoint: string;
  hasApiKey: boolean;
  lastSync: string;
  syncStatus: string;
}

// ---------------------------------------------------------------------------
// Zustand Store State Interface
// ---------------------------------------------------------------------------
interface DemoState {
  // Active Simulated Role
  currentRole: UserRoleType;
  switchRole: (role: UserRoleType) => void;

  // Domain Collections
  students: DemoStudent[];
  admissions: DemoAdmission[];
  invoices: DemoFeeInvoice[];
  attendance: DemoAttendanceRecord[];
  marks: DemoExamMarks[];
  exams: DemoExam[];
  subjects: AcademicSubject[];
  transportRoutes: TransportRoute[];
  externalProviders: ExternalExamProvider[];

  // Super Admin Controlled Permission Management Matrix
  rolePermissions: Record<UserRoleType, Record<FineGrainedAction, boolean>>;
  temporaryPermissions: TemporaryPermission[];
  permissionAudits: PermissionAuditEntry[];
  changeRequests: PermissionChangeRequestItem[];
  
  // Super Admin Dashboard & Access Designer State
  designerRolePreview: UserRoleType;
  designerNavConfigs: Record<UserRoleType, DashboardDesignerNavItem[]>;
  designerVersion: number;
  designerStatus: 'DRAFT' | 'PUBLISHED';

  // Actions
  addStudent: (student: Omit<DemoStudent, 'id'>) => void;
  createAdmission: (app: Omit<DemoAdmission, 'id' | 'application_number' | 'submission_date' | 'status'>) => void;
  approveAdmission: (id: string) => void;
  collectFee: (invoiceId: string, amount: number) => { receiptNumber: string };
  updateAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => void;
  saveMark: (studentId: string, subject: string, obtained: number) => void;

  // Institutional Exam Workflow Actions (4-stage approval)
  submitMarksAsTeacher: (examId: string) => void;
  verifyExamAsController: (examId: string) => void;
  approveExamAsPrincipal: (examId: string) => void;
  publishExamResults: (examId: string) => void;
  addExam: (exam: Omit<DemoExam, 'id' | 'status'>) => void;
  simulateOfflineSync: (examId: string) => { status: 'APPLIED' | 'CONFLICT_DETECTED'; message: string };

  // Subject Management Actions
  addSubject: (subj: Omit<AcademicSubject, 'id' | 'is_archived'>) => void;
  archiveSubject: (subjectId: string) => void;
  reorderSubjects: (fromIndex: number, toIndex: number) => void;

  // Transport Tracking Simulator
  toggleTripStatus: (routeId: string) => void;

  // Super Admin Permission Governance Controls
  updateRoleActionPermission: (role: UserRoleType, action: FineGrainedAction, allowed: boolean, reason: string) => boolean;
  addTemporaryPermission: (temp: Omit<TemporaryPermission, 'id'>) => void;
  revokeTemporaryPermission: (id: string) => void;
  submitPermissionChangeRequest: (req: Omit<PermissionChangeRequestItem, 'id' | 'status' | 'submittedAt'>) => void;
  reviewPermissionChangeRequest: (requestId: string, approved: boolean, reason: string) => void;
  rollbackPermissionVersion: (targetVersion: number) => void;

  // Super Admin Dashboard Designer Controls
  setDesignerRolePreview: (role: UserRoleType) => void;
  updateDesignerItemState: (role: UserRoleType, itemId: string, state: PresentationState, lockReason?: string) => void;
  updateDesignerItemVisibility: (role: UserRoleType, itemId: string, visibility: 'SHOW' | 'HIDE') => void;
  publishDashboardDesignerConfig: (reason: string) => void;
  rollbackDashboardDesignerConfig: () => void;

  resetDemoData: () => void;
}

// ---------------------------------------------------------------------------
// Initial Seed Data
// ---------------------------------------------------------------------------
const initialStudents: DemoStudent[] = [
  { id: 'st-1', admission_number: 'ADM-2026-001', roll_number: '101', first_name: 'Aarav', last_name: 'Sharma', institution_level: 'School', class_name: 'Class 10', section_or_stream: 'Section A', guardian_name: 'Rajesh Sharma', guardian_phone: '+91 98450 12345', fee_balance: 0, attendance_pct: 96.5, status: 'ACTIVE' },
  { id: 'st-2', admission_number: 'ADM-2026-002', roll_number: '102', first_name: 'Ananya', last_name: 'Hegde', institution_level: 'PU College', class_name: 'I PUC', section_or_stream: 'PCMB (Science)', guardian_name: 'Venkatesh Hegde', guardian_phone: '+91 98450 23456', fee_balance: 12500, attendance_pct: 92.0, status: 'ACTIVE' },
  { id: 'st-3', admission_number: 'ADM-2026-003', roll_number: '103', first_name: 'Rohan', last_name: 'Verma', institution_level: 'Degree College', class_name: 'B.Sc Computer Science', section_or_stream: 'Semester 3 (Credits: 24)', guardian_name: 'Sunil Verma', guardian_phone: '+91 98450 34567', fee_balance: 24000, attendance_pct: 88.2, status: 'ACTIVE' },
  { id: 'st-4', admission_number: 'ADM-2026-004', roll_number: '104', first_name: 'Priya', last_name: 'Nair', institution_level: 'School', class_name: 'Class 9', section_or_stream: 'Section B', guardian_name: 'K. Nair', guardian_phone: '+91 98450 45678', fee_balance: 4500, attendance_pct: 98.0, status: 'ACTIVE' },
  { id: 'st-5', admission_number: 'ADM-2026-005', roll_number: '105', first_name: 'Aditya', last_name: 'Patil', institution_level: 'PU College', class_name: 'II PUC', section_or_stream: 'Commerce (EBAC)', guardian_name: 'Mahesh Patil', guardian_phone: '+91 98450 56789', fee_balance: 0, attendance_pct: 94.6, status: 'ACTIVE' },
];

const initialAdmissions: DemoAdmission[] = [
  { id: 'adm-101', application_number: 'APP-2026-891', applicant_name: 'Tanvi Deshmukh', level: 'School', target_class: 'Class 6', parent_name: 'Sanjay Deshmukh', parent_phone: '+91 99001 11223', parent_email: 'sanjay@example.com', submission_date: '2026-11-01', status: 'PENDING' },
  { id: 'adm-102', application_number: 'APP-2026-892', applicant_name: 'Karan Rao', level: 'PU College', target_class: 'I PUC - PCMC', parent_name: 'Girish Rao', parent_phone: '+91 99001 22334', parent_email: 'girish@example.com', submission_date: '2026-11-02', status: 'VERIFIED' },
  { id: 'adm-103', application_number: 'APP-2026-893', applicant_name: 'Sneha Kulkarni', level: 'Degree College', target_class: 'B.Com Accounting', parent_name: 'Nitin Kulkarni', parent_phone: '+91 99001 33445', parent_email: 'nitin@example.com', submission_date: '2026-11-03', status: 'APPROVED' },
];

const initialInvoices: DemoFeeInvoice[] = [
  { id: 'inv-1', invoice_number: 'INV-2026-0091', student_name: 'Aarav Sharma', admission_number: 'ADM-2026-001', class_name: 'Class 10-A', fee_head: 'COLLEGE_FEE', fee_title: 'Annual Tuition & Digital Classrooms', total_amount: 35000, paid_amount: 35000, balance_amount: 0, due_date: '2026-11-15', status: 'PAID' },
  { id: 'inv-2', invoice_number: 'INV-2026-0092', student_name: 'Ananya Hegde', admission_number: 'ADM-2026-002', class_name: 'I PUC - PCMB', fee_head: 'LAB_FEE', fee_title: 'Physics, Chemistry & Biology Lab Fee', total_amount: 18000, paid_amount: 5500, balance_amount: 12500, due_date: '2026-11-20', status: 'PARTIAL' },
  { id: 'inv-3', invoice_number: 'INV-2026-0093', student_name: 'Rohan Verma', admission_number: 'ADM-2026-003', class_name: 'B.Sc CS (Sem 3)', fee_head: 'HOSTEL_MESS_FEE', fee_title: 'Hostel Accommodation & Dining (Term 1)', total_amount: 38000, paid_amount: 14000, balance_amount: 24000, due_date: '2026-10-31', status: 'OVERDUE' },
  { id: 'inv-4', invoice_number: 'INV-2026-0094', student_name: 'Priya Nair', admission_number: 'ADM-2026-004', class_name: 'Class 9-B', fee_head: 'TRANSPORT_FEE', fee_title: 'School Bus Route 104 Transport Fee', total_amount: 12000, paid_amount: 7500, balance_amount: 4500, due_date: '2026-11-25', status: 'PARTIAL' },
  { id: 'inv-5', invoice_number: 'INV-2026-0095', student_name: 'Aditya Patil', admission_number: 'ADM-2026-005', class_name: 'II PUC Commerce', fee_head: 'EXAM_FEE', fee_title: 'State Pre-University Board Exam Fee', total_amount: 3500, paid_amount: 3500, balance_amount: 0, due_date: '2026-11-10', status: 'PAID' },
];

const initialAttendance: DemoAttendanceRecord[] = [
  { student_id: 'st-1', student_name: 'Aarav Sharma', roll_number: '101', class_name: 'Class 10-A', status: 'PRESENT' },
  { student_id: 'st-2', student_name: 'Ananya Hegde', roll_number: '102', class_name: 'I PUC PCMB', status: 'PRESENT' },
  { student_id: 'st-3', student_name: 'Rohan Verma', roll_number: '103', class_name: 'B.Sc CS Sem 3', status: 'ABSENT' },
  { student_id: 'st-4', student_name: 'Priya Nair', roll_number: '104', class_name: 'Class 9-B', status: 'PRESENT' },
  { student_id: 'st-5', student_name: 'Aditya Patil', roll_number: '105', class_name: 'II PUC Commerce', status: 'LATE' },
];

const initialMarks: DemoExamMarks[] = [
  { student_id: 'st-1', student_name: 'Aarav Sharma', roll_number: '101', subject: 'Mathematics', max_marks: 100, obtained_marks: 94, grade: 'A+' },
  { student_id: 'st-1', student_name: 'Aarav Sharma', roll_number: '101', subject: 'Science (Theory + Practical)', max_marks: 100, obtained_marks: 91, grade: 'A+' },
  { student_id: 'st-2', student_name: 'Ananya Hegde', roll_number: '102', subject: 'Physics (Theory + Practical)', max_marks: 100, obtained_marks: 88, grade: 'A' },
  { student_id: 'st-2', student_name: 'Ananya Hegde', roll_number: '102', subject: 'Biology (Botany + Zoology)', max_marks: 100, obtained_marks: 92, grade: 'A+' },
  { student_id: 'st-3', student_name: 'Rohan Verma', roll_number: '103', subject: 'Data Structures & Algorithms', max_marks: 100, obtained_marks: 85, grade: 'A' },
];

const initialExams: DemoExam[] = [
  {
    id: 'exam-1',
    title: 'Mid-Term Examinations 2026',
    code: 'EXAM-2026-MID',
    academic_year: '2026-2027',
    target_level: 'PU College',
    class_name: 'I & II PUC (Science & Commerce)',
    category: 'Half-Yearly',
    exam_mode: 'Offline (Paper-based)',
    question_paper_attached: true,
    status: 'CONTROLLER_VERIFIED',
    instructions: 'Bring scientific calculator, non-programmable, and certified laboratory observation log.',
    schedules: [
      { id: 'sch-1', subject: 'Physics', exam_date: '2026-11-18', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Hall A-101', invigilator: 'Dr. V. Murthy', theory_max: 70, practical_max: 30, passing_marks: 35 },
      { id: 'sch-2', subject: 'Chemistry', exam_date: '2026-11-20', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Hall A-102', invigilator: 'Prof. S. Joshi', theory_max: 70, practical_max: 30, passing_marks: 35 },
      { id: 'sch-3', subject: 'Mathematics', exam_date: '2026-11-23', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Hall B-201', invigilator: 'Mrs. K. Swamy', theory_max: 80, practical_max: 20, passing_marks: 35 },
      { id: 'sch-4', subject: 'Biology', exam_date: '2026-11-25', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Bio Lab Complex', invigilator: 'Dr. Anita Rao', theory_max: 70, practical_max: 30, passing_marks: 35 },
    ],
  },
  {
    id: 'exam-2',
    title: 'Unit Test 2 (Formative Assessment)',
    code: 'EXAM-2026-UT2',
    academic_year: '2026-2027',
    target_level: 'School',
    class_name: 'Class 9 & 10',
    category: 'Unit Test',
    exam_mode: 'Offline (Paper-based)',
    question_paper_attached: true,
    status: 'PUBLISHED',
    instructions: 'Internal continuous evaluation assessment.',
    schedules: [
      { id: 'sch-5', subject: 'Science & Technology', exam_date: '2026-11-10', start_time: '10:00 AM', end_time: '11:30 AM', room: 'Classroom 10-A', invigilator: 'Mrs. K. Swamy', theory_max: 40, practical_max: 10, passing_marks: 18 },
      { id: 'sch-6', subject: 'Mathematics', exam_date: '2026-11-12', start_time: '10:00 AM', end_time: '11:30 AM', room: 'Classroom 10-A', invigilator: 'Mr. Arvind G.', theory_max: 40, practical_max: 10, passing_marks: 18 },
    ],
  },
  {
    id: 'exam-3',
    title: 'NEET Foundation Diagnostic Test 3',
    code: 'EXAM-2026-NEET-FND',
    academic_year: '2026-2027',
    target_level: 'PU College',
    class_name: 'I PUC (PCMB Batch A)',
    category: 'NEET Foundation',
    exam_mode: 'Internal Online',
    question_paper_attached: false,
    status: 'SCHEDULED',
    instructions: '720 marks full syllabus diagnostic simulator. Automatic objective scoring with negative marking.',
    schedules: [
      { id: 'sch-7', subject: 'Physics, Chemistry & Biology', exam_date: '2026-11-28', start_time: '02:00 PM', end_time: '05:20 PM', room: 'Digital CBT Lab 2', invigilator: 'Dr. V. Murthy', theory_max: 720, practical_max: 0, passing_marks: 300 },
    ],
  },
  {
    id: 'exam-4',
    title: 'External TCS iON State Pre-Mock',
    code: 'EXAM-2026-EXT-TCS',
    academic_year: '2026-2027',
    target_level: 'PU College',
    class_name: 'II PUC (Science & Commerce)',
    category: 'Model Exam',
    exam_mode: 'External Provider Adapter',
    online_provider_name: 'TCS iON Assessment Engine',
    question_paper_attached: false,
    status: 'SCHEDULED',
    instructions: 'Institution subscription reference: TCS-ION-AKSHARA-2026. External platform costs billed separately.',
    schedules: [
      { id: 'sch-8', subject: 'All Board Papers Pre-Mock', exam_date: '2026-12-05', start_time: '09:00 AM', end_time: '12:00 PM', room: 'TCS Authorized Center', invigilator: 'TCS Invigilator Lead', theory_max: 100, practical_max: 0, passing_marks: 35 },
    ],
  }
];

const initialSubjects: AcademicSubject[] = [
  { id: 'sub-1', code: 'PHY-101', name: 'Physics (Theory + Lab)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB / PCMC', theory_marks: 70, practical_marks: 30, is_compulsory: true, assigned_teacher: 'Dr. V. Murthy', is_archived: false },
  { id: 'sub-2', code: 'CHEM-102', name: 'Chemistry (Inorganic & Organic)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB / PCMC', theory_marks: 70, practical_marks: 30, is_compulsory: true, assigned_teacher: 'Prof. S. Joshi', is_archived: false },
  { id: 'sub-3', code: 'MATH-103', name: 'Pure & Applied Mathematics', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB / PCMC', theory_marks: 80, practical_marks: 20, is_compulsory: true, assigned_teacher: 'Mrs. K. Swamy', is_archived: false },
  { id: 'sub-4', code: 'BIO-104', name: 'Biology (Botany & Zoology)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB', theory_marks: 70, practical_marks: 30, is_compulsory: false, assigned_teacher: 'Dr. Anita Rao', is_archived: false },
  { id: 'sub-5', code: 'CS-105', name: 'Computer Science (Python & SQL)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMC', theory_marks: 70, practical_marks: 30, is_compulsory: false, assigned_teacher: 'Mr. Arvind G.', is_archived: false },
  { id: 'sub-6', code: 'ACC-201', name: 'Accountancy & Financial Statements', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'Commerce', theory_marks: 80, practical_marks: 20, is_compulsory: true, assigned_teacher: 'K. S. Narayana', is_archived: false },
  { id: 'sub-7', code: 'SCI-091', name: 'Secondary Science & Experimentation', institution_level: 'School', target_class: 'Class 10', theory_marks: 80, practical_marks: 20, is_compulsory: true, assigned_teacher: 'Mrs. K. Swamy', is_archived: false },
  { id: 'sub-8', code: 'DSA-301', name: 'Data Structures & Algorithms', institution_level: 'Degree College', target_class: 'B.Sc Computer Science', theory_marks: 60, practical_marks: 40, credits: 4, is_compulsory: true, assigned_teacher: 'Prof. Alok Nath', is_archived: false },
];

const initialTransportRoutes: TransportRoute[] = [
  {
    id: 'route-1',
    route_code: 'BUS-104',
    route_name: 'Route 104: JP Nagar -> Bannerghatta -> Campus',
    vehicle_number: 'KA-01-EA-4521',
    vehicle_type: 'Tata Starbus 42-Seater',
    capacity: 42,
    driver_name: 'Ramesh Gowda',
    driver_phone: '+91 98451 98765',
    attendant_name: 'Manjula Devi',
    current_location: 'Vega City Mall Junction, Bannerghatta Road',
    status: 'IN_TRANSIT',
    current_speed_kmh: 36,
    stops: [
      { stop_name: 'JP Nagar 6th Phase Depot', scheduled_time: '07:30 AM', student_count: 8, is_passed: true },
      { stop_name: 'Sarakki Signal', scheduled_time: '07:45 AM', student_count: 12, is_passed: true },
      { stop_name: 'Vega City Mall Junction', scheduled_time: '08:00 AM', student_count: 9, is_passed: false },
      { stop_name: 'Akshara Global Main Campus Gate', scheduled_time: '08:25 AM', student_count: 0, is_passed: false },
    ],
  },
  {
    id: 'route-2',
    route_code: 'BUS-208',
    route_name: 'Route 208: Whitefield Express -> Outer Ring Road -> Campus',
    vehicle_number: 'KA-04-MB-8912',
    vehicle_type: 'Ashok Leyland 50-Seater',
    capacity: 50,
    driver_name: 'Suresh Kumar',
    driver_phone: '+91 98452 45678',
    attendant_name: 'Basavaraj P.',
    current_location: 'Marathahalli Multiplex Flyover',
    status: 'IN_TRANSIT',
    current_speed_kmh: 42,
    stops: [
      { stop_name: 'ITPB Main Gate Whitefield', scheduled_time: '07:15 AM', student_count: 15, is_passed: true },
      { stop_name: 'Marathahalli Multiplex', scheduled_time: '07:40 AM', student_count: 14, is_passed: false },
      { stop_name: 'Bellandur EcoSpace', scheduled_time: '08:05 AM', student_count: 11, is_passed: false },
      { stop_name: 'Akshara Global Main Campus Gate', scheduled_time: '08:30 AM', student_count: 0, is_passed: false },
    ],
  },
];

const initialExternalProviders: ExternalExamProvider[] = [
  { id: 'prov-1', code: 'TCS_ION_ADAPTER', name: 'TCS iON Assessment Engine', isActive: true, endpoint: 'https://api.tcsion.example.com/v2', hasApiKey: true, lastSync: '2026-11-03 18:30 IST', syncStatus: 'HEALTHY' },
  { id: 'prov-2', code: 'NTA_MOCK_ADAPTER', name: 'National Testing Agency Mock Adapter', isActive: true, endpoint: 'https://api.nta-mock.example.com/sync', hasApiKey: true, lastSync: '2026-11-02 11:15 IST', syncStatus: 'IDLE' },
  { id: 'prov-3', code: 'EDUTECH_CBT_PROV', name: 'EduTech Cloud CBT Engine', isActive: false, endpoint: 'https://cbt.edutech.example.com', hasApiKey: false, lastSync: 'Never', syncStatus: 'NOT_CONFIGURED' },
];

// Initial fine-grained permissions matrix for 10 roles
const initialRolePermissions: Record<UserRoleType, Record<FineGrainedAction, boolean>> = {
  SUPER_ADMIN: {
    view: true, create: true, edit: true, delete: true, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  INSTITUTION_ADMIN: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: false, export: true, print: true,
    assign: true, collect: false, refund: false, reconcile: false, configure: true,
    manage_users: true, manage_permissions: false
  },
  PRINCIPAL: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: false, collect: false, refund: true, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  VICE_PRINCIPAL: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: true, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  ACCOUNTANT: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: false, publish: false, export: true, print: true,
    assign: false, collect: true, refund: false, reconcile: true, configure: false,
    manage_users: false, manage_permissions: false
  },
  EXAM_CONTROLLER: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: false, reject: true, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: true,
    manage_users: false, manage_permissions: false
  },
  TEACHER: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: false, approve: false, reject: false, publish: false, export: false, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  PARENT: {
    view: true, create: false, edit: false, delete: false, archive: false, submit: false,
    verify: false, approve: false, reject: false, publish: false, export: false, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  STUDENT: {
    view: true, create: false, edit: false, delete: false, archive: false, submit: true,
    verify: false, approve: false, reject: false, publish: false, export: false, print: false,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  TRANSPORT_MANAGER: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: false, publish: false, export: true, print: true,
    assign: true, collect: false, refund: false, reconcile: false, configure: true,
    manage_users: false, manage_permissions: false
  },
};

const initialNavConfigs: Record<UserRoleType, DashboardDesignerNavItem[]> = {
  SUPER_ADMIN: [
    { id: 'dashboard', label: 'Platform Overview', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'permissions-centre', label: 'Central Permission Matrix', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'assign', 'manage_permissions'] },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', iconName: 'Layout', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'configure'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve', 'publish'] },
    { id: 'fees', label: 'Multi-Category Fee Engine', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'reconcile'] },
    { id: 'transport', label: 'Transport & Fleet GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
  ],
  INSTITUTION_ADMIN: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'admissions', label: 'Admissions Pipeline', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'approve'] },
    { id: 'academics', label: 'Academic & Subjects', iconName: 'BookOpen', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'archive'] },
    { id: 'examinations', label: 'Examinations Module', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'verify'] },
    { id: 'fees', label: 'Fee Management', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'permissions-centre', label: 'Permission Requests', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_LOCKED', lockReason: 'Only Platform Super Admin can edit privileges. Submit a Change Request for approval.', actionPermissions: ['view', 'submit'] },
  ],
  PRINCIPAL: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Examinations Module', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify', 'approve', 'publish'] },
    { id: 'fees', label: 'Fee Overview & Refunds', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'attendance', label: 'Daily Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify'] },
    { id: 'permissions-centre', label: 'System Privileges', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'INACCESSIBLE', presentationState: 'VISIBLE_LOCKED', lockReason: 'Principal role cannot grant or modify system permissions directly.', actionPermissions: ['view'] },
  ],
  VICE_PRINCIPAL: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify'] },
    { id: 'attendance', label: 'Daily Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
    { id: 'fees', label: 'Financial Ledgers', iconName: 'CreditCard', menuVisibility: 'HIDE', moduleAccess: 'INACCESSIBLE', presentationState: 'COMPLETELY_HIDDEN', actionPermissions: [] },
  ],
  ACCOUNTANT: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'fees', label: 'Fee Collection & Dues', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'collect', 'reconcile', 'print'] },
    { id: 'examinations', label: 'Academic Examinations', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'INACCESSIBLE', presentationState: 'VISIBLE_LOCKED', lockReason: 'Finance roles are strictly separated from academic examination marks and grading.', actionPermissions: ['view'] },
  ],
  EXAM_CONTROLLER: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Examinations Management', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'verify', 'export'] },
    { id: 'fees', label: 'Fee Collections', iconName: 'CreditCard', menuVisibility: 'HIDE', moduleAccess: 'INACCESSIBLE', presentationState: 'COMPLETELY_HIDDEN', actionPermissions: [] },
  ],
  TEACHER: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Subject Marks Entry', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'submit'] },
    { id: 'attendance', label: 'Class Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
    { id: 'fees', label: 'Fee Ledgers', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'INACCESSIBLE', presentationState: 'VISIBLE_LOCKED', lockReason: 'Faculty members do not have access to financial ledgers.', actionPermissions: [] },
  ],
  PARENT: [
    { id: 'dashboard', label: 'Student Profile', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Published Report Cards', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'print'] },
    { id: 'fees', label: 'Online Fee Payment', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'collect'] },
    { id: 'transport', label: 'Live Bus Tracking', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  STUDENT: [
    { id: 'dashboard', label: 'My Academic Dashboard', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Exam Timetables & Results', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'attendance', label: 'My Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  TRANSPORT_MANAGER: [
    { id: 'dashboard', label: 'Fleet Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Transport Routes & GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'assign'] },
  ],
};

const initialPermissionAudits: PermissionAuditEntry[] = [
  {
    id: 'audit-v3',
    version: 3,
    timestamp: '2026-11-04 10:15 IST',
    actingSuperAdmin: 'admin@platform.erp.in',
    targetRole: 'PRINCIPAL',
    actionType: 'ROLE_UPDATE',
    description: 'Updated Principal privileges: Added Result Publication and Concession Approval; enforced anti-overwrite marks audit.',
    previousState: { publish: false, approve: true },
    newState: { publish: true, approve: true },
    canRollback: true
  },
  {
    id: 'audit-v2',
    version: 2,
    timestamp: '2026-11-03 14:20 IST',
    actingSuperAdmin: 'admin@platform.erp.in',
    targetRole: 'ACCOUNTANT',
    actionType: 'RESTRICTION_ENFORCE',
    description: 'Enforced strict segregation of duties: Locked Accountant from academic examination editing.',
    previousState: { edit_marks: false },
    newState: { edit_marks: false },
    canRollback: true
  },
  {
    id: 'audit-v1',
    version: 1,
    timestamp: '2026-11-01 09:00 IST',
    actingSuperAdmin: 'admin@platform.erp.in',
    targetRole: 'SUPER_ADMIN',
    actionType: 'INITIAL_BASELINE',
    description: 'Initial platform RBAC baseline seeded. Non-destructive migration applied.',
    previousState: {},
    newState: {},
    canRollback: false
  }
];

const initialChangeRequests: PermissionChangeRequestItem[] = [
  {
    id: 'pcr-101',
    requestedByRole: 'INSTITUTION_ADMIN',
    requestedByName: 'Dr. Ramesh Kumar (Principal / Admin)',
    targetRole: 'EXAM_CONTROLLER',
    action: 'publish',
    module: 'examinations',
    justification: 'Authorize Exam Controller to publish Unit Test 2 formative assessment results directly.',
    status: 'PENDING',
    submittedAt: '2026-11-04 09:30 IST'
  }
];

// Helper calculation
const calcGrade = (m: number): string => {
  if (m >= 90) return 'A+';
  if (m >= 80) return 'A';
  if (m >= 70) return 'B+';
  if (m >= 60) return 'B';
  if (m >= 50) return 'C';
  return 'F';
};

// ---------------------------------------------------------------------------
// Store Creation
// ---------------------------------------------------------------------------
export const useDemoStore = create<DemoState>((set, get) => ({
  currentRole: 'PRINCIPAL',
  switchRole: (role) => set({ currentRole: role }),

  students: initialStudents,
  admissions: initialAdmissions,
  invoices: initialInvoices,
  attendance: initialAttendance,
  marks: initialMarks,
  exams: initialExams,
  subjects: initialSubjects,
  transportRoutes: initialTransportRoutes,
  externalProviders: initialExternalProviders,

  rolePermissions: initialRolePermissions,
  temporaryPermissions: [
    {
      id: 'temp-1',
      roleCode: 'TEACHER',
      action: 'edit',
      module: 'examinations',
      expiresAt: '2026-11-10 23:59 IST',
      reason: 'Mid-term paper grading window extension'
    }
  ],
  permissionAudits: initialPermissionAudits,
  changeRequests: initialChangeRequests,

  designerRolePreview: 'PRINCIPAL',
  designerNavConfigs: initialNavConfigs,
  designerVersion: 2,
  designerStatus: 'PUBLISHED',

  // Actions
  addStudent: (data) => {
    const newStudent: DemoStudent = {
      id: `st-${Date.now()}`,
      ...data,
    };
    set((state) => ({ students: [newStudent, ...state.students] }));
  },

  createAdmission: (appData) => {
    const newApp: DemoAdmission = {
      id: `adm-${Date.now()}`,
      application_number: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      submission_date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      ...appData,
    };
    set((state) => ({ admissions: [newApp, ...state.admissions] }));
  },

  approveAdmission: (id) => {
    set((state) => ({
      admissions: state.admissions.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a)),
    }));
  },

  collectFee: (invoiceId, amount) => {
    const receiptNum = `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    set((state) => ({
      invoices: state.invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paid_amount + amount;
          const newBal = Math.max(0, inv.total_amount - newPaid);
          return {
            ...inv,
            paid_amount: newPaid,
            balance_amount: newBal,
            status: newBal === 0 ? 'PAID' : 'PARTIAL',
          };
        }
        return inv;
      }),
    }));
    return { receiptNumber: receiptNum };
  },

  updateAttendance: (studentId, status) => {
    set((state) => ({
      attendance: state.attendance.map((rec) =>
        rec.student_id === studentId ? { ...rec, status } : rec
      ),
    }));
  },

  saveMark: (studentId, subject, obtained) => {
    set((state) => {
      const existing = state.marks.find((m) => m.student_id === studentId && m.subject === subject);
      if (existing) {
        return {
          marks: state.marks.map((m) =>
            m.student_id === studentId && m.subject === subject
              ? { ...m, obtained_marks: obtained, grade: calcGrade(obtained) }
              : m
          ),
        };
      }
      const student = state.students.find((s) => s.id === studentId);
      return {
        marks: [
          ...state.marks,
          {
            student_id: studentId,
            student_name: student ? `${student.first_name} ${student.last_name}` : 'Student',
            roll_number: student?.roll_number || '100',
            subject,
            max_marks: 100,
            obtained_marks: obtained,
            grade: calcGrade(obtained),
          },
        ],
      };
    });
  },

  // 4-Stage Institutional Examination Workflow
  submitMarksAsTeacher: (examId) => {
    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId ? { ...e, status: 'MARKS_ENTRY' } : e
      )
    }));
  },

  verifyExamAsController: (examId) => {
    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId ? { ...e, status: 'CONTROLLER_VERIFIED' } : e
      )
    }));
  },

  approveExamAsPrincipal: (examId) => {
    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId ? { ...e, status: 'PRINCIPAL_APPROVED' } : e
      )
    }));
  },

  publishExamResults: (examId) => {
    set((state) => ({
      exams: state.exams.map((e) =>
        e.id === examId ? { ...e, status: 'PUBLISHED' } : e
      )
    }));
  },

  addExam: (examData) => {
    const newEx: DemoExam = {
      id: `exam-${Date.now()}`,
      status: 'SCHEDULED',
      ...examData
    };
    set((state) => ({ exams: [...state.exams, newEx] }));
  },

  simulateOfflineSync: (examId) => {
    const exam = get().exams.find(e => e.id === examId);
    if (!exam) return { status: 'CONFLICT_DETECTED', message: 'Exam record not found' };
    if (exam.status === 'PRINCIPAL_APPROVED' || exam.status === 'PUBLISHED') {
      return {
        status: 'CONFLICT_DETECTED',
        message: 'Conflict: Examination results already approved/published by Principal. Silent offline overwrite prevented.'
      };
    }
    return {
      status: 'APPLIED',
      message: 'Offline operation validated against server version (v1). Synchronized successfully.'
    };
  },

  // Subjects Management
  addSubject: (data) => {
    const newSub: AcademicSubject = {
      id: `sub-${Date.now()}`,
      is_archived: false,
      ...data,
    };
    set((state) => ({ subjects: [...state.subjects, newSub] }));
  },

  archiveSubject: (subjectId) => {
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId ? { ...s, is_archived: true } : s
      )
    }));
  },

  reorderSubjects: (fromIndex, toIndex) => {
    set((state) => {
      const list = [...state.subjects];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { subjects: list };
    });
  },

  toggleTripStatus: (routeId) => {
    set((state) => ({
      transportRoutes: state.transportRoutes.map((r) => {
        if (r.id === routeId) {
          const nextStatus = r.status === 'IN_TRANSIT' ? 'COMPLETED' : 'IN_TRANSIT';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    }));
  },

  // Super Admin Permission Governance
  updateRoleActionPermission: (role, action, allowed, reason) => {
    // Lockout Guard: Super Admin cannot strip manage_permissions or view from SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && action === 'manage_permissions' && !allowed) {
      alert('Security Lockout Guard: Cannot revoke platform management privileges from Super Admin.');
      return false;
    }

    set((state) => {
      const currentRoleActions = state.rolePermissions[role] || ({} as Record<FineGrainedAction, boolean>);
      const updated = {
        ...state.rolePermissions,
        [role]: {
          ...currentRoleActions,
          [action]: allowed
        }
      };

      const newAudit: PermissionAuditEntry = {
        id: `audit-${Date.now()}`,
        version: state.permissionAudits.length + 1,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        actingSuperAdmin: 'admin@platform.erp.in',
        targetRole: role,
        actionType: 'ACTION_PERMISSION_UPDATE',
        description: `Set permission '${action}' to ${allowed ? 'ALLOWED' : 'DENIED'} for role '${role}'. Reason: ${reason}`,
        previousState: { [action]: !allowed },
        newState: { [action]: allowed },
        canRollback: true
      };

      return {
        rolePermissions: updated,
        permissionAudits: [newAudit, ...state.permissionAudits]
      };
    });
    return true;
  },

  addTemporaryPermission: (tempData) => {
    const item: TemporaryPermission = {
      id: `temp-${Date.now()}`,
      ...tempData
    };
    set((state) => ({ temporaryPermissions: [item, ...state.temporaryPermissions] }));
  },

  revokeTemporaryPermission: (id) => {
    set((state) => ({
      temporaryPermissions: state.temporaryPermissions.filter(t => t.id !== id)
    }));
  },

  submitPermissionChangeRequest: (reqData) => {
    const item: PermissionChangeRequestItem = {
      id: `pcr-${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      ...reqData
    };
    set((state) => ({ changeRequests: [item, ...state.changeRequests] }));
  },

  reviewPermissionChangeRequest: (requestId, approved, reason) => {
    set((state) => {
      const targetReq = state.changeRequests.find(r => r.id === requestId);
      if (!targetReq) return state;

      let updatedPermissions = state.rolePermissions;
      if (approved) {
        const role = targetReq.targetRole;
        const action = targetReq.action;
        updatedPermissions = {
          ...state.rolePermissions,
          [role]: {
            ...state.rolePermissions[role],
            [action]: true
          }
        };
      }

      const updatedRequests = state.changeRequests.map(r =>
        r.id === requestId ? { ...r, status: (approved ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED' } : r
      );

      const newAudit: PermissionAuditEntry = {
        id: `audit-${Date.now()}`,
        version: state.permissionAudits.length + 1,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        actingSuperAdmin: 'admin@platform.erp.in',
        targetRole: targetReq.targetRole,
        actionType: approved ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
        description: `Institution request ${approved ? 'APPROVED' : 'REJECTED'} for ${targetReq.action} on ${targetReq.targetRole}. ${reason}`,
        previousState: {},
        newState: {},
        canRollback: approved
      };

      return {
        changeRequests: updatedRequests,
        rolePermissions: updatedPermissions,
        permissionAudits: [newAudit, ...state.permissionAudits]
      };
    });
  },

  rollbackPermissionVersion: (targetVersion) => {
    set((state) => {
      const audit = state.permissionAudits.find(a => a.version === targetVersion);
      if (!audit) return state;

      const newAudit: PermissionAuditEntry = {
        id: `audit-${Date.now()}`,
        version: state.permissionAudits.length + 1,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        actingSuperAdmin: 'admin@platform.erp.in',
        targetRole: audit.targetRole,
        actionType: 'CONFIG_ROLLBACK',
        description: `Rolled back configuration to Version #${targetVersion}. History preserved.`,
        previousState: audit.newState,
        newState: audit.previousState,
        canRollback: false
      };

      return {
        permissionAudits: [newAudit, ...state.permissionAudits]
      };
    });
  },

  // Super Admin Dashboard Designer Controls
  setDesignerRolePreview: (role) => set({ designerRolePreview: role }),

  updateDesignerItemState: (role, itemId, presentationState, lockReason) => {
    set((state) => {
      const items = state.designerNavConfigs[role] || [];
      const updatedItems = items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              presentationState,
              lockReason: presentationState === 'VISIBLE_LOCKED' ? (lockReason || 'Restricted by institutional policy') : undefined,
              moduleAccess: presentationState === 'VISIBLE_ACCESSIBLE' ? ('ACCESSIBLE' as const) : ('INACCESSIBLE' as const),
            }
          : it
      );
      return {
        designerNavConfigs: {
          ...state.designerNavConfigs,
          [role]: updatedItems
        },
        designerStatus: 'DRAFT'
      };
    });
  },

  updateDesignerItemVisibility: (role, itemId, menuVisibility) => {
    set((state) => {
      const items = state.designerNavConfigs[role] || [];
      const updatedItems = items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              menuVisibility,
              presentationState: menuVisibility === 'HIDE' ? ('COMPLETELY_HIDDEN' as const) : it.presentationState
            }
          : it
      );
      return {
        designerNavConfigs: {
          ...state.designerNavConfigs,
          [role]: updatedItems
        },
        designerStatus: 'DRAFT'
      };
    });
  },

  publishDashboardDesignerConfig: (reason) => {
    set((state) => ({
      designerVersion: state.designerVersion + 1,
      designerStatus: 'PUBLISHED',
      permissionAudits: [
        {
          id: `audit-${Date.now()}`,
          version: state.permissionAudits.length + 1,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
          actingSuperAdmin: 'admin@platform.erp.in',
          targetRole: state.designerRolePreview,
          actionType: 'DASHBOARD_DESIGN_PUBLISH',
          description: `Published new dashboard layout configuration (v${state.designerVersion + 1}). ${reason}`,
          previousState: {},
          newState: {},
          canRollback: true
        },
        ...state.permissionAudits
      ]
    }));
  },

  rollbackDashboardDesignerConfig: () => {
    set((state) => ({
      designerNavConfigs: initialNavConfigs,
      designerStatus: 'PUBLISHED'
    }));
  },

  resetDemoData: () => {
    set({
      currentRole: 'PRINCIPAL',
      students: initialStudents,
      admissions: initialAdmissions,
      invoices: initialInvoices,
      attendance: initialAttendance,
      marks: initialMarks,
      exams: initialExams,
      subjects: initialSubjects,
      transportRoutes: initialTransportRoutes,
      externalProviders: initialExternalProviders,
      rolePermissions: initialRolePermissions,
      permissionAudits: initialPermissionAudits,
      changeRequests: initialChangeRequests,
      designerNavConfigs: initialNavConfigs,
      designerVersion: 2,
      designerStatus: 'PUBLISHED'
    });
  },
}));
