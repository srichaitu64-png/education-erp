import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Role-Based Access Control (RBAC) & Governance Types
// ---------------------------------------------------------------------------
export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'BACKUP_SUPER_ADMIN'
  | 'DEVELOPER'
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
  BACKUP_SUPER_ADMIN: {
    role: 'BACKUP_SUPER_ADMIN',
    title: 'Backup Platform Super Administrator',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    allowedTabs: [
      'dashboard', 'permissions-centre', 'dashboard-designer', 'tenants', 'plans', 'entitlements', 'audit'
    ],
    canEdit: ['Delegated platform privileges', 'Tenant configurations', 'Temporary access overrides'],
    canApprove: ['Emergency break-glass changes', 'Secondary platform approvals'],
    restrictedActions: ['Protected by Primary Lockout Guard: Cannot revoke Primary Super Admin credentials'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'ALL_TENANTS', description: 'Secondary Platform Authority with MFA' }]
  },
  DEVELOPER: {
    role: 'DEVELOPER',
    title: 'Platform Technical Support & Developer',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    allowedTabs: [
      'dashboard', 'tenants', 'audit'
    ],
    canEdit: ['Diagnostics', 'Config validation', 'Demo & Sandbox environments'],
    canApprove: ['None (Technical audit only)'],
    restrictedActions: ['NO ACCESS to production financial records, student PII, or live gradebooks without explicit time-bound Super Admin ticket'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'SANDBOX_DEV', description: 'Engineering Support & Diagnostic Sandboxes' }]
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

export type FeeHeadType = string;

export interface FeeHeadDefinition {
  id: string;
  head_code: string;
  title: string;
  category: string;
  default_amount: number;
  is_refundable: boolean;
  institution_type: 'School' | 'PU College' | 'Degree College' | 'All';
  description?: string;
}

export const DEFAULT_SCHOOL_FEE_HEADS: FeeHeadDefinition[] = [
  { id: 'sch-fh-01', head_code: 'TUITION_FEE', title: 'Tuition Fee', category: 'Tuition', default_amount: 35000, is_refundable: false, institution_type: 'School', description: 'Core curriculum, instructional sessions & classroom learning' },
  { id: 'sch-fh-02', head_code: 'ADMISSION_FEE', title: 'Admission Fee', category: 'Admission', default_amount: 15000, is_refundable: false, institution_type: 'School', description: 'One-time admission registration fee' },
  { id: 'sch-fh-03', head_code: 'REGISTRATION_FEE', title: 'Registration Fee', category: 'Admission', default_amount: 2500, is_refundable: false, institution_type: 'School', description: 'Annual student file maintenance & enrollment charges' },
  { id: 'sch-fh-04', head_code: 'BOOKS_NOTEBOOKS', title: 'Books and Notebooks', category: 'Books', default_amount: 6500, is_refundable: false, institution_type: 'School', description: 'Textbooks, workbooks and official school notebooks' },
  { id: 'sch-fh-05', head_code: 'UNIFORM_FEE', title: 'Uniform Fee', category: 'Uniform', default_amount: 4500, is_refundable: false, institution_type: 'School', description: '2 Regular sets & 1 House sports uniform set' },
  { id: 'sch-fh-06', head_code: 'SHOES_ACCESSORIES', title: 'Shoes and Accessories', category: 'Uniform', default_amount: 2000, is_refundable: false, institution_type: 'School', description: 'Formal shoes, canvas shoes, socks, belt & ID card' },
  { id: 'sch-fh-07', head_code: 'SCIENCE_LAB_FEE', title: 'Science Laboratory Fee', category: 'Laboratory', default_amount: 5000, is_refundable: false, institution_type: 'School', description: 'Physics, Chemistry and Biology experimental lab consumables' },
  { id: 'sch-fh-08', head_code: 'COMPUTER_LAB_FEE', title: 'Computer Laboratory Fee', category: 'Laboratory', default_amount: 4500, is_refundable: false, institution_type: 'School', description: 'Computer lab workstations, robotics kits & internet' },
  { id: 'sch-fh-09', head_code: 'LIBRARY_FEE', title: 'Library Fee', category: 'Library', default_amount: 2000, is_refundable: false, institution_type: 'School', description: 'Library lending subscription & children digital encyclopedias' },
  { id: 'sch-fh-10', head_code: 'EXAMINATION_FEE', title: 'Examination Fee', category: 'Examination', default_amount: 3000, is_refundable: false, institution_type: 'School', description: 'Unit tests, half-yearly & annual printed exam papers' },
  { id: 'sch-fh-11', head_code: 'SPORTS_GAMES', title: 'Sports and Games', category: 'Activities', default_amount: 3500, is_refundable: false, institution_type: 'School', description: 'Athletic coaching, sports equipment & inter-school events' },
  { id: 'sch-fh-12', head_code: 'CULTURAL_ANNUAL_DAY', title: 'Cultural and Annual Day', category: 'Activities', default_amount: 2500, is_refundable: false, institution_type: 'School', description: 'Annual cultural day celebrations, music & stage productions' },
  { id: 'sch-fh-13', head_code: 'EDUCATIONAL_TRIPS', title: 'Educational Trips & Excursions', category: 'Activities', default_amount: 4000, is_refundable: false, institution_type: 'School', description: 'Field visits, science museum trips & nature camps' },
  { id: 'sch-fh-14', head_code: 'SMART_CLASSROOM', title: 'Smart Classroom & Audio-Visual', category: 'Technology', default_amount: 3000, is_refundable: false, institution_type: 'School', description: 'Interactive smart boards, 3D visual learning & digital projectors' },
  { id: 'sch-fh-15', head_code: 'DIGITAL_LEARNING', title: 'Digital Learning & Software', category: 'Technology', default_amount: 2500, is_refundable: false, institution_type: 'School', description: 'Online student portal, mobile app & learning management system' },
  { id: 'sch-fh-16', head_code: 'DEVELOPMENT_FEE', title: 'School Development Fund', category: 'Development', default_amount: 8000, is_refundable: false, institution_type: 'School', description: 'Campus infrastructure improvement & classroom upgrades' },
  { id: 'sch-fh-17', head_code: 'HOSTEL_ACCOMMODATION', title: 'Hostel Accommodation', category: 'Hostel', default_amount: 30000, is_refundable: false, institution_type: 'School', description: 'Boarding room, warden supervision & laundry services' },
  { id: 'sch-fh-18', head_code: 'MESS_DINING', title: 'Mess & Dining Charges', category: 'Hostel', default_amount: 25000, is_refundable: false, institution_type: 'School', description: 'Nutritious breakfast, lunch, dinner & evening snacks' },
  { id: 'sch-fh-19', head_code: 'CAUTION_DEPOSIT', title: 'Caution Deposit (Refundable)', category: 'Other', default_amount: 10000, is_refundable: true, institution_type: 'School', description: 'Security deposit refundable on transfer certificate issuance' },
  { id: 'sch-fh-20', head_code: 'LATE_FEE_FINE', title: 'Late Payment Fine', category: 'Other', default_amount: 500, is_refundable: false, institution_type: 'School', description: 'Penalty for installments paid past due date' },
  { id: 'sch-fh-21', head_code: 'MISCELLANEOUS', title: 'Miscellaneous & Student Welfare', category: 'Other', default_amount: 1500, is_refundable: false, institution_type: 'School', description: 'First-aid medical insurance & identity card charges' },
];

export const DEFAULT_COLLEGE_FEE_HEADS: FeeHeadDefinition[] = [
  { id: 'col-fh-01', head_code: 'PU_TUITION_FEE', title: 'College Tuition Fee', category: 'Tuition', default_amount: 42000, is_refundable: false, institution_type: 'PU College', description: 'Core lecture hours, tutorial sessions and academic faculty delivery' },
  { id: 'col-fh-02', head_code: 'PU_ADMISSION_FEE', title: 'Admission & Enrolment Fee', category: 'Admission', default_amount: 18000, is_refundable: false, institution_type: 'PU College', description: 'College admission processing & pre-university board dossier' },
  { id: 'col-fh-03', head_code: 'UNIVERSITY_BOARD_REG', title: 'Board / University Enrolment Fee', category: 'Admission', default_amount: 3500, is_refundable: false, institution_type: 'PU College', description: 'State Pre-University Education Board statutory registration' },
  { id: 'col-fh-04', head_code: 'PHYSICS_CHEM_BIO_LAB', title: 'PCMB Practical Science Lab Fee', category: 'Laboratory', default_amount: 8500, is_refundable: false, institution_type: 'PU College', description: 'Practical lab chemicals, specimens, optics & electrical setups' },
  { id: 'col-fh-05', head_code: 'COMP_SCIENCE_LAB', title: 'Computer Science & Python Lab', category: 'Laboratory', default_amount: 6000, is_refundable: false, institution_type: 'PU College', description: 'High-performance computing lab & Linux programming setups' },
  { id: 'col-fh-06', head_code: 'PU_LIBRARY_READING', title: 'College Library & Digital Journals', category: 'Library', default_amount: 3000, is_refundable: false, institution_type: 'PU College', description: 'Reference books, NCERT exemplar guides & e-journal access' },
  { id: 'col-fh-07', head_code: 'PU_TERM_EXAM', title: 'Term & Preparatory Examination Fee', category: 'Examination', default_amount: 4000, is_refundable: false, institution_type: 'PU College', description: 'Quarterly, Mid-term and State Preparatory mock exam papers' },
  { id: 'col-fh-08', head_code: 'PU_BOARD_EXAM', title: 'Annual Board Examination Fee', category: 'Examination', default_amount: 3500, is_refundable: false, institution_type: 'PU College', description: 'Board examination hall ticket, answer scripts & center fee' },
  { id: 'col-fh-09', head_code: 'STUDY_MATERIALS_MANUALS', title: 'Competitive Study Materials & Manuals', category: 'Books', default_amount: 8000, is_refundable: false, institution_type: 'PU College', description: 'NEET & JEE coaching modules, question banks & lab manuals' },
  { id: 'col-fh-10', head_code: 'CAMPUS_WIFI_TECH', title: 'Campus Wi-Fi & LMS Access', category: 'Technology', default_amount: 2500, is_refundable: false, institution_type: 'PU College', description: 'Campus high-speed fiber Wi-Fi & recorded lecture repository' },
  { id: 'col-fh-11', head_code: 'SPORTS_GYMKHANA', title: 'Sports & Gymkhana Membership', category: 'Activities', default_amount: 3000, is_refundable: false, institution_type: 'PU College', description: 'Gymnasium, indoor badminton court & inter-collegiate sports' },
  { id: 'col-fh-12', head_code: 'PU_HOSTEL_ROOM', title: 'Hostel Accommodation', category: 'Hostel', default_amount: 35000, is_refundable: false, institution_type: 'PU College', description: 'Twin/triple-sharing residential room with 24/7 security' },
  { id: 'col-fh-13', head_code: 'PU_HOSTEL_MESS', title: 'Hostel Mess & Dining', category: 'Hostel', default_amount: 28000, is_refundable: false, institution_type: 'PU College', description: 'Hygienic vegetarian dining & evening milk/snacks' },
  { id: 'col-fh-14', head_code: 'PU_BUS_TRANSPORT', title: 'Campus Fleet Bus / Transport Route', category: 'Transport', default_amount: 16000, is_refundable: false, institution_type: 'PU College', description: 'GPS-tracked pickup & drop transportation' },
  { id: 'col-fh-15', head_code: 'COLLEGE_DEV_FUND', title: 'College Development Fund', category: 'Development', default_amount: 10000, is_refundable: false, institution_type: 'PU College', description: 'Research seminar hall, auditorium & robotics center fund' },
  { id: 'col-fh-16', head_code: 'CAREER_PLACEMENT_TRAIN', title: 'Career Guidance, Placement & Training', category: 'Activities', default_amount: 15000, is_refundable: false, institution_type: 'PU College', description: 'NEET/JEE foundation, KCET coaching & career counseling sessions' },
  { id: 'col-fh-17', head_code: 'PU_CAUTION_DEPOSIT', title: 'College Caution Deposit (Refundable)', category: 'Other', default_amount: 12000, is_refundable: true, institution_type: 'PU College', description: 'Library & science laboratory security deposit (refundable)' },
  { id: 'col-fh-18', head_code: 'PU_MISC_LATE_FEE', title: 'Miscellaneous & Late Surcharge', category: 'Other', default_amount: 1000, is_refundable: false, institution_type: 'PU College', description: 'Duplicate ID card, late payment surcharge & badge fees' },
];

export interface MultiHeadFeeItem {
  head_code: string;
  head_title: string;
  category: string;
  configured_amount: number;
  previously_paid: number;
  concession_amount: number;
  collected_amount: number;
}

export interface MultiHeadFeeCollectionPayload {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  academic_year: string;
  term_code: string;
  term_name: string;
  fee_items: MultiHeadFeeItem[];
  payment_method: PaymentMethodType;
  reference_number?: string;
  notes?: string;
  collected_by?: string;
}

export type PaymentMethodType =
  | 'CASH'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'ONLINE_NETBANKING'
  | 'CHEQUE';

export type ReceiptPrintLayout = 'A4' | '80MM' | '58MM';

export interface FeeAllocationItem {
  head: FeeHeadType;
  title: string;
  allocated: number;
  remaining: number;
}

export interface DemoFeeInvoice {
  id: string;
  invoice_number: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  academic_year: string;
  term_code: string;
  term_name: string;
  fee_head: FeeHeadType;
  fee_title: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  last_payment_date?: string;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'UNPAID';
  breakdown?: { head_code: FeeHeadType; title: string; amount: number }[];
}

export interface DemoFeeReceipt {
  id: string;
  receipt_number: string;
  invoice_id: string;
  invoice_number: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  academic_year: string;
  term_code: string;
  term_name: string;
  amount_paid: number;
  previous_balance: number;
  current_balance: number;
  payment_method: PaymentMethodType;
  transaction_reference: string;
  payment_date: string;
  collected_by: string;
  allocations: FeeAllocationItem[];
  institution_branding: {
    institution_name: string;
    affiliation: string;
    address: string;
    phone: string;
    email: string;
    receipt_header_note: string;
  };
  qr_verification_code: string;
  reprint_count: number;
  is_duplicate: boolean;
  reprinted_at?: string;
  status: 'CONFIRMED' | 'REVERSED' | 'REFUNDED';
  notes?: string;
}

export interface ReceiptAuditLogItem {
  id: string;
  receipt_number: string;
  action: 'GENERATED' | 'PRINTED_A4' | 'PRINTED_80MM' | 'PRINTED_58MM' | 'REPRINTED_DUPLICATE' | 'DOWNLOADED_PDF';
  performed_by: string;
  role: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface TermScheduleItem {
  term_code: string;
  name: string;
  due_date: string;
  share_pct: number;
}

export interface DemoFeeStructure {
  id: string;
  institution_type: 'School' | 'PU College' | 'Degree College';
  institution_name: string;
  academic_year: string;
  class_or_stream: string;
  term_count: number;
  terms_config: TermScheduleItem[];
  fee_heads: { head_code: FeeHeadType; title: string; amount: number }[];
  total_annual_fee: number;
  concessions_allowed: boolean;
  version: number;
  is_active: boolean;
  notes?: string;
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
  receipts: DemoFeeReceipt[];
  receiptAudits: ReceiptAuditLogItem[];
  feeStructures: DemoFeeStructure[];
  activeFeeInstitutionFilter: 'ALL' | 'School' | 'PU College' | 'Degree College';
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
  collectFeeWithReceipt: (params: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    transactionRef?: string;
    allocations?: FeeAllocationItem[];
    notes?: string;
  }) => DemoFeeReceipt;
  customFeeHeads: FeeHeadDefinition[];
  addCustomFeeHead: (head: Omit<FeeHeadDefinition, 'id'>) => { success: boolean; message: string };
  collectMultiHeadFee: (payload: MultiHeadFeeCollectionPayload) => DemoFeeReceipt;
  reprintReceipt: (receiptId: string) => DemoFeeReceipt;
  logReceiptAction: (
    receiptNumber: string,
    action: 'PRINTED_A4' | 'PRINTED_80MM' | 'PRINTED_58MM' | 'DOWNLOADED_PDF',
    details?: Record<string, any>
  ) => void;
  saveFeeStructure: (structure: DemoFeeStructure) => { success: boolean; message: string };
  setActiveFeeInstitutionFilter: (filter: 'ALL' | 'School' | 'PU College' | 'Degree College') => void;
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
  {
    id: 'inv-1',
    invoice_number: 'INV-2026-0091',
    student_name: 'Aarav Sharma',
    admission_number: 'ADM-2026-001',
    class_name: 'Class 10-A',
    academic_year: '2026-2027',
    term_code: 'TERM_1',
    term_name: 'Term 1 (June-Aug)',
    fee_head: 'COLLEGE_FEE',
    fee_title: 'Annual Tuition & Digital Classrooms',
    total_amount: 35000,
    paid_amount: 35000,
    balance_amount: 0,
    due_date: '2026-06-30',
    last_payment_date: '2026-06-25',
    status: 'PAID',
    breakdown: [
      { head_code: 'TUITION', title: 'Tuition Fee', amount: 30000 },
      { head_code: 'LABORATORY', title: 'Science Lab Fee', amount: 5000 }
    ]
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2026-0092',
    student_name: 'Ananya Hegde',
    admission_number: 'ADM-2026-002',
    class_name: 'I PUC - PCMB',
    academic_year: '2026-2027',
    term_code: 'SEM_1',
    term_name: 'Semester 1 (June-Nov)',
    fee_head: 'LAB_FEE',
    fee_title: 'Physics, Chemistry & Biology Lab Fee',
    total_amount: 18000,
    paid_amount: 5500,
    balance_amount: 12500,
    due_date: '2026-11-20',
    last_payment_date: '2026-09-10',
    status: 'PARTIAL',
    breakdown: [
      { head_code: 'LABORATORY', title: 'PCB Practical Labs', amount: 18000 }
    ]
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-2026-0093',
    student_name: 'Rohan Verma',
    admission_number: 'ADM-2026-003',
    class_name: 'B.Sc CS (Sem 3)',
    academic_year: '2026-2027',
    term_code: 'SEM_1',
    term_name: 'Semester 1 (June-Nov)',
    fee_head: 'HOSTEL_MESS_FEE',
    fee_title: 'Hostel Accommodation & Dining (Term 1)',
    total_amount: 38000,
    paid_amount: 14000,
    balance_amount: 24000,
    due_date: '2026-10-31',
    last_payment_date: '2026-10-05',
    status: 'OVERDUE',
    breakdown: [
      { head_code: 'HOSTEL_MESS_FEE', title: 'Hostel Accommodation', amount: 25000 },
      { head_code: 'HOSTEL_MESS_FEE', title: 'Mess & Dining', amount: 13000 }
    ]
  },
  {
    id: 'inv-4',
    invoice_number: 'INV-2026-0094',
    student_name: 'Priya Nair',
    admission_number: 'ADM-2026-004',
    class_name: 'Class 9-B',
    academic_year: '2026-2027',
    term_code: 'TERM_2',
    term_name: 'Term 2 (Sept-Nov)',
    fee_head: 'TRANSPORT_FEE',
    fee_title: 'School Bus Route 104 Transport Fee',
    total_amount: 12000,
    paid_amount: 7500,
    balance_amount: 4500,
    due_date: '2026-11-25',
    last_payment_date: '2026-10-12',
    status: 'PARTIAL',
    breakdown: [
      { head_code: 'TRANSPORT_FEE', title: 'GPS Monitored Bus Transport', amount: 12000 }
    ]
  },
  {
    id: 'inv-5',
    invoice_number: 'INV-2026-0095',
    student_name: 'Aditya Patil',
    admission_number: 'ADM-2026-005',
    class_name: 'II PUC Commerce',
    academic_year: '2026-2027',
    term_code: 'SEM_1',
    term_name: 'Semester 1 (June-Nov)',
    fee_head: 'EXAM_FEE',
    fee_title: 'State Pre-University Board Exam Fee',
    total_amount: 3500,
    paid_amount: 3500,
    balance_amount: 0,
    due_date: '2026-11-10',
    last_payment_date: '2026-11-02',
    status: 'PAID',
    breakdown: [
      { head_code: 'EXAM_FEE', title: 'Board Exam Registration', amount: 3500 }
    ]
  },
  {
    id: 'inv-6',
    invoice_number: 'INV-2026-0096',
    student_name: 'Tanvi Deshmukh',
    admission_number: 'ADM-2026-006',
    class_name: 'Class 6-A',
    academic_year: '2026-2027',
    term_code: 'TERM_2',
    term_name: 'Term 2 (Sept-Nov)',
    fee_head: 'COLLEGE_FEE',
    fee_title: 'Term 2 Tuition & Science Activity Kit',
    total_amount: 22000,
    paid_amount: 0,
    balance_amount: 22000,
    due_date: '2026-10-15',
    status: 'OVERDUE',
    breakdown: [
      { head_code: 'TUITION', title: 'Middle School Tuition', amount: 18000 },
      { head_code: 'LABORATORY', title: 'Science Activity Kit', amount: 4000 }
    ]
  }
];

const initialReceipts: DemoFeeReceipt[] = [
  {
    id: 'rcp-1001',
    receipt_number: 'RCP-AKSH-2026-1001',
    invoice_id: 'inv-1',
    invoice_number: 'INV-2026-0091',
    student_id: 'st-1',
    student_name: 'Aarav Sharma',
    admission_number: 'ADM-2026-001',
    class_name: 'Class 10-A',
    academic_year: '2026-2027',
    term_code: 'TERM_1',
    term_name: 'Term 1 (June-Aug)',
    amount_paid: 35000,
    previous_balance: 35000,
    current_balance: 0,
    payment_method: 'UPI',
    transaction_reference: 'UPI/2026/0625/89210',
    payment_date: '2026-06-25 10:30 AM',
    collected_by: 'Senior Cashier (Accounts)',
    allocations: [
      { head: 'TUITION', title: 'Annual Tuition & Digital Classrooms', allocated: 30000, remaining: 0 },
      { head: 'LABORATORY', title: 'Science Lab Fee', allocated: 5000, remaining: 0 }
    ],
    institution_branding: {
      institution_name: 'Akshara Global Educational Institutions',
      affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
      address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
      phone: '+91 80 2345 6789',
      email: 'accounts@akshara.erp.in',
      receipt_header_note: 'Computer Generated Official Fee Receipt - Valid with Authorized Signatory Seal'
    },
    qr_verification_code: 'VERIFY:RECEIPT:RCP-AKSH-2026-1001:UPI89210:35000',
    reprint_count: 0,
    is_duplicate: false,
    status: 'CONFIRMED',
    notes: 'Paid in full via campus UPI counter'
  },
  {
    id: 'rcp-1002',
    receipt_number: 'RCP-AKSH-2026-1002',
    invoice_id: 'inv-5',
    invoice_number: 'INV-2026-0095',
    student_id: 'st-5',
    student_name: 'Aditya Patil',
    admission_number: 'ADM-2026-005',
    class_name: 'II PUC Commerce',
    academic_year: '2026-2027',
    term_code: 'SEM_1',
    term_name: 'Semester 1 (June-Nov)',
    amount_paid: 3500,
    previous_balance: 3500,
    current_balance: 0,
    payment_method: 'CASH',
    transaction_reference: 'CSH/2026/1102/0042',
    payment_date: '2026-11-02 02:15 PM',
    collected_by: 'Assistant Accountant',
    allocations: [
      { head: 'EXAM_FEE', title: 'State Pre-University Board Exam Fee', allocated: 3500, remaining: 0 }
    ],
    institution_branding: {
      institution_name: 'Akshara Global Educational Institutions',
      affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
      address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
      phone: '+91 80 2345 6789',
      email: 'accounts@akshara.erp.in',
      receipt_header_note: 'Computer Generated Official Fee Receipt - Valid with Authorized Signatory Seal'
    },
    qr_verification_code: 'VERIFY:RECEIPT:RCP-AKSH-2026-1002:CSH0042:3500',
    reprint_count: 0,
    is_duplicate: false,
    status: 'CONFIRMED',
    notes: 'Cash received at fee counter'
  }
];

const initialReceiptAudits: ReceiptAuditLogItem[] = [
  {
    id: 'aud-1',
    receipt_number: 'RCP-AKSH-2026-1001',
    action: 'GENERATED',
    performed_by: 'Senior Cashier (Accounts)',
    role: 'ACCOUNTANT',
    timestamp: '2026-06-25 10:30:15',
    details: { amount: 35000, method: 'UPI' }
  },
  {
    id: 'aud-2',
    receipt_number: 'RCP-AKSH-2026-1002',
    action: 'GENERATED',
    performed_by: 'Assistant Accountant',
    role: 'ACCOUNTANT',
    timestamp: '2026-11-02 14:15:30',
    details: { amount: 3500, method: 'CASH' }
  }
];

const initialFeeStructures: DemoFeeStructure[] = [
  {
    id: 'fs-school-10',
    institution_type: 'School',
    institution_name: 'Akshara High School',
    academic_year: '2026-2027',
    class_or_stream: 'Class 10 (Secondary)',
    term_count: 3,
    terms_config: [
      { term_code: 'TERM_1', name: 'Term 1 (June - Aug)', due_date: '2026-06-30', share_pct: 40 },
      { term_code: 'TERM_2', name: 'Term 2 (Sept - Nov)', due_date: '2026-11-15', share_pct: 35 },
      { term_code: 'TERM_3', name: 'Term 3 (Dec - Feb)', due_date: '2027-01-31', share_pct: 25 }
    ],
    fee_heads: [
      { head_code: 'TUITION', title: 'Annual Tuition & Smart Classrooms', amount: 35000 },
      { head_code: 'LABORATORY', title: 'Composite Science & Robotics Lab', amount: 5000 },
      { head_code: 'TRANSPORT', title: 'Bus Transport Service (Route 104)', amount: 12000 },
      { head_code: 'LIBRARY', title: 'Digital Library & Sports Development', amount: 3000 }
    ],
    total_annual_fee: 55000,
    concessions_allowed: true,
    version: 1,
    is_active: true,
    notes: 'Configured by School Administrator for Academic Year 2026-2027 (3 Terms Schedule).'
  },
  {
    id: 'fs-pu-science',
    institution_type: 'PU College',
    institution_name: 'Akshara Pre-University College',
    academic_year: '2026-2027',
    class_or_stream: 'I PUC - PCMB (Integrated NEET/JEE)',
    term_count: 2,
    terms_config: [
      { term_code: 'SEM_1', name: 'Semester 1 (June - Nov)', due_date: '2026-08-31', share_pct: 50 },
      { term_code: 'SEM_2', name: 'Semester 2 (Dec - April)', due_date: '2026-12-31', share_pct: 50 }
    ],
    fee_heads: [
      { head_code: 'TUITION', title: 'PU Board Tuition & Foundation Coaching', amount: 45000 },
      { head_code: 'LABORATORY', title: 'Physics, Chemistry & Biology Practicals', amount: 15000 },
      { head_code: 'HOSTEL_MESS', title: 'Campus Hostel & Dining (AC Room)', amount: 38000 },
      { head_code: 'EXAM', title: 'Pre-University Board Examination & Pre-Mocks', amount: 3500 }
    ],
    total_annual_fee: 101500,
    concessions_allowed: true,
    version: 1,
    is_active: true,
    notes: 'Configured by PU College Administrator for 2 Semesters Schedule.'
  }
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

// Initial fine-grained permissions matrix for 12 roles
const initialRolePermissions: Record<UserRoleType, Record<FineGrainedAction, boolean>> = {
  SUPER_ADMIN: {
    view: true, create: true, edit: true, delete: true, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  BACKUP_SUPER_ADMIN: {
    view: true, create: true, edit: true, delete: true, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  DEVELOPER: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: false, publish: false, export: true, print: false,
    assign: false, collect: false, refund: false, reconcile: false, configure: true,
    manage_users: false, manage_permissions: false
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
  BACKUP_SUPER_ADMIN: [
    { id: 'dashboard', label: 'Platform Overview', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'permissions-centre', label: 'Central Permission Matrix', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'assign', 'manage_permissions'] },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', iconName: 'Layout', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'configure'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve', 'publish'] },
    { id: 'fees', label: 'Multi-Category Fee Engine', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'reconcile'] },
    { id: 'transport', label: 'Transport & Fleet GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
  ],
  DEVELOPER: [
    { id: 'dashboard', label: 'Developer Sandbox Overview', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'examinations', label: 'Examinations Diagnostic View', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'fees', label: 'Fee Schema Inspection', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Telemetry & GPS Telemetry', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  INSTITUTION_ADMIN: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'admissions', label: 'Admissions Pipeline', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'approve'] },
    { id: 'academics', label: 'Academic & Subjects', iconName: 'BookOpen', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'archive'] },
    { id: 'examinations', label: 'Examinations Module', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'verify'] },
    { id: 'fees', label: 'Fee Management', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  PRINCIPAL: [
    { id: 'dashboard', label: 'Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Examinations Module', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify', 'approve', 'publish'] },
    { id: 'fees', label: 'Fee Overview & Refunds', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'attendance', label: 'Daily Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify'] },
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
  receipts: initialReceipts,
  receiptAudits: initialReceiptAudits,
  feeStructures: initialFeeStructures,
  activeFeeInstitutionFilter: 'ALL',
  customFeeHeads: [],
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

  collectFeeWithReceipt: ({ invoiceId, amount, paymentMethod, transactionRef, allocations, notes }) => {
    let generatedReceipt: DemoFeeReceipt | null = null;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    set((state) => {
      const inv = state.invoices.find((i) => i.id === invoiceId);
      if (!inv) return state;

      const previousBalance = inv.balance_amount;
      const newPaid = inv.paid_amount + amount;
      const newBalance = Math.max(0, inv.total_amount - newPaid);
      const newStatus = newBalance <= 0.01 ? 'PAID' : 'PARTIAL';

      const receiptCount = state.receipts.length + 1;
      const receiptNumber = `RCP-AKSH-2026-${1000 + receiptCount}`;
      const txnRef =
        transactionRef || `${paymentMethod.slice(0, 3)}/2026/${Date.now().toString().slice(-6)}`;

      // Auto-compute allocations if not provided
      let finalAllocations = allocations;
      if (!finalAllocations || finalAllocations.length === 0) {
        if (inv.breakdown && inv.breakdown.length > 0) {
          let remAlloc = amount;
          finalAllocations = inv.breakdown.map((item) => {
            const alloc = Math.min(remAlloc, item.amount);
            remAlloc -= alloc;
            return {
              head: item.head_code,
              title: item.title,
              allocated: alloc,
              remaining: Math.max(0, item.amount - alloc),
            };
          });
        } else {
          finalAllocations = [
            {
              head: inv.fee_head,
              title: inv.fee_title,
              allocated: amount,
              remaining: newBalance,
            },
          ];
        }
      }

      generatedReceipt = {
        id: `rcp-${Date.now()}`,
        receipt_number: receiptNumber,
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        student_id: `st-${inv.admission_number}`,
        student_name: inv.student_name,
        admission_number: inv.admission_number,
        class_name: inv.class_name,
        academic_year: inv.academic_year || '2026-2027',
        term_code: inv.term_code || 'TERM_1',
        term_name: inv.term_name || 'Term 1',
        amount_paid: amount,
        previous_balance: previousBalance,
        current_balance: newBalance,
        payment_method: paymentMethod,
        transaction_reference: txnRef,
        payment_date: formattedDate,
        collected_by: state.currentRole === 'ACCOUNTANT' ? 'Authorized Cashier' : `${state.currentRole} User`,
        allocations: finalAllocations,
        institution_branding: {
          institution_name: 'Akshara Global Educational Institutions',
          affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
          address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
          phone: '+91 80 2345 6789',
          email: 'accounts@akshara.erp.in',
          receipt_header_note: 'Computer Generated Official Fee Receipt - Valid with Authorized Signatory Seal',
        },
        qr_verification_code: `VERIFY:RECEIPT:${receiptNumber}:${txnRef.replace(/[^a-zA-Z0-9]/g, '')}:${amount}`,
        reprint_count: 0,
        is_duplicate: false,
        status: 'CONFIRMED',
        notes: notes || `Payment received via ${paymentMethod}`,
      };

      const newAudit: ReceiptAuditLogItem = {
        id: `aud-${Date.now()}`,
        receipt_number: receiptNumber,
        action: 'GENERATED',
        performed_by: state.currentRole,
        role: state.currentRole,
        timestamp: formattedDate,
        details: { amount, paymentMethod, invoice_number: inv.invoice_number, student_name: inv.student_name },
      };

      return {
        invoices: state.invoices.map((i) =>
          i.id === invoiceId
            ? {
                ...i,
                paid_amount: newPaid,
                balance_amount: newBalance,
                status: newStatus,
                last_payment_date: now.toISOString().split('T')[0],
              }
            : i
        ),
        receipts: [generatedReceipt, ...state.receipts],
        receiptAudits: [newAudit, ...state.receiptAudits],
      };
    });

    return generatedReceipt!;
  },

  addCustomFeeHead: (headData) => {
    const state = get();
    const isSuperAdmin = state.currentRole === 'SUPER_ADMIN' || state.currentRole === 'BACKUP_SUPER_ADMIN';
    const hasConfigPerm = state.rolePermissions[state.currentRole]?.['configure'] === true;
    if (!isSuperAdmin && !hasConfigPerm) {
      return {
        success: false,
        message: 'Permission denied: Ordinary users cannot add or modify fee structures without Platform Super Admin authorization.'
      };
    }
    const newHead: FeeHeadDefinition = {
      id: `custom-fh-${Date.now()}`,
      ...headData,
    };
    set((s) => ({ customFeeHeads: [...s.customFeeHeads, newHead] }));
    return { success: true, message: `Fee head '${headData.title}' created successfully.` };
  },

  collectMultiHeadFee: (payload) => {
    let generatedReceipt: DemoFeeReceipt | null = null;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
      ' IST';

    set((state) => {
      const receiptNumber = `RCP-2026-${Date.now().toString().slice(-6)}`;
      const totalPaid = payload.fee_items.reduce((sum, item) => sum + (Number(item.collected_amount) || 0), 0);
      const txnRef = payload.reference_number || `TXN-UPI-${Date.now().toString().slice(-8)}`;

      const allocations: FeeAllocationItem[] = payload.fee_items.map((it) => ({
        head: it.head_code,
        title: it.head_title,
        allocated: Number(it.collected_amount) || 0,
        remaining: Math.max(0, it.configured_amount - it.previously_paid - it.concession_amount - (Number(it.collected_amount) || 0)),
      }));

      const totalConfigured = payload.fee_items.reduce((s, it) => s + it.configured_amount, 0);
      const totalPrevPaid = payload.fee_items.reduce((s, it) => s + it.previously_paid, 0);
      const totalConcessions = payload.fee_items.reduce((s, it) => s + it.concession_amount, 0);
      const prevBal = Math.max(0, totalConfigured - totalPrevPaid - totalConcessions);
      const currBal = Math.max(0, prevBal - totalPaid);

      generatedReceipt = {
        id: `rcp-${Date.now()}`,
        receipt_number: receiptNumber,
        invoice_id: `inv-${payload.student_id}-${payload.term_code}`,
        invoice_number: `INV-2026-${Date.now().toString().slice(-4)}`,
        student_id: payload.student_id,
        student_name: payload.student_name,
        admission_number: payload.admission_number,
        class_name: payload.class_name,
        academic_year: payload.academic_year || '2026-2027',
        term_code: payload.term_code || 'TERM_1',
        term_name: payload.term_name || 'Term 1',
        amount_paid: totalPaid,
        previous_balance: prevBal,
        current_balance: currBal,
        payment_method: payload.payment_method,
        transaction_reference: txnRef,
        payment_date: formattedDate,
        collected_by: payload.collected_by || (state.currentRole === 'ACCOUNTANT' ? 'Authorized Cashier' : `${state.currentRole} User`),
        allocations: allocations,
        institution_branding: {
          institution_name: 'Akshara Global Educational Institutions',
          affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
          address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
          phone: '+91 80 2345 6789',
          email: 'accounts@akshara.erp.in',
          receipt_header_note: 'Computer Generated Official Fee Receipt - Valid with Authorized Signatory Seal',
        },
        qr_verification_code: `VERIFY:RECEIPT:${receiptNumber}:${txnRef.replace(/[^a-zA-Z0-9]/g, '')}:${totalPaid}`,
        reprint_count: 0,
        is_duplicate: false,
        status: 'CONFIRMED',
        notes: payload.notes || `Multi-head fee collection settled via ${payload.payment_method}`,
      };

      const newAudit: ReceiptAuditLogItem = {
        id: `aud-${Date.now()}`,
        receipt_number: receiptNumber,
        action: 'GENERATED',
        performed_by: state.currentRole,
        role: state.currentRole,
        timestamp: formattedDate,
        details: { amount: totalPaid, paymentMethod: payload.payment_method, student_name: payload.student_name, heads: payload.fee_items.map(h => h.head_title) },
      };

      return {
        receipts: [generatedReceipt!, ...state.receipts],
        receiptAudits: [newAudit, ...state.receiptAudits],
      };
    });

    return generatedReceipt!;
  },

  reprintReceipt: (receiptId) => {
    let updatedReceipt: DemoFeeReceipt | null = null;
    const now = new Date();
    const formattedTimestamp =
      now.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
      ' IST';

    set((state) => {
      const rcp = state.receipts.find((r) => r.id === receiptId);
      if (!rcp) return state;

      const newReprintCount = rcp.reprint_count + 1;
      updatedReceipt = {
        ...rcp,
        reprint_count: newReprintCount,
        is_duplicate: true,
        reprinted_at: formattedTimestamp,
      };

      const newAudit: ReceiptAuditLogItem = {
        id: `aud-${Date.now()}`,
        receipt_number: rcp.receipt_number,
        action: 'REPRINTED_DUPLICATE',
        performed_by: state.currentRole,
        role: state.currentRole,
        timestamp: formattedTimestamp,
        details: { reprint_count: newReprintCount, reprinted_at: formattedTimestamp },
      };

      return {
        receipts: state.receipts.map((r) => (r.id === receiptId ? updatedReceipt! : r)),
        receiptAudits: [newAudit, ...state.receiptAudits],
      };
    });

    return updatedReceipt!;
  },

  logReceiptAction: (receiptNumber, action, details) => {
    set((state) => {
      const formattedTimestamp =
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const newAudit: ReceiptAuditLogItem = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        receipt_number: receiptNumber,
        action,
        performed_by: state.currentRole,
        role: state.currentRole,
        timestamp: formattedTimestamp,
        details: details || {},
      };
      return {
        receiptAudits: [newAudit, ...state.receiptAudits],
      };
    });
  },

  saveFeeStructure: (structure) => {
    const { currentRole, rolePermissions } = get();
    const canConfigure =
      currentRole === 'SUPER_ADMIN' ||
      currentRole === 'INSTITUTION_ADMIN' ||
      rolePermissions[currentRole]?.['configure'] === true;

    if (!canConfigure) {
      return {
        success: false,
        message:
          'Security Guard: Only Institution Admin or Super Admin permitted accounts can configure fee schedules.',
      };
    }

    set((state) => {
      const existing = state.feeStructures.find((fs) => fs.id === structure.id);
      if (existing) {
        return {
          feeStructures: state.feeStructures.map((fs) =>
            fs.id === structure.id ? { ...structure, version: fs.version + 1 } : fs
          ),
        };
      } else {
        return {
          feeStructures: [structure, ...state.feeStructures],
        };
      }
    });

    return {
      success: true,
      message: `Fee structure for ${structure.class_or_stream} successfully saved (${structure.term_count} terms schedule).`,
    };
  },

  setActiveFeeInstitutionFilter: (filter) => {
    set({ activeFeeInstitutionFilter: filter });
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
      receipts: initialReceipts,
      receiptAudits: initialReceiptAudits,
      feeStructures: initialFeeStructures,
      activeFeeInstitutionFilter: 'ALL',
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
