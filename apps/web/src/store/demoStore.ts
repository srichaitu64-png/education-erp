import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Role-Based Access Control (RBAC) & Governance Types
// ---------------------------------------------------------------------------
export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'BACKUP_SUPER_ADMIN'
  | 'DEVELOPER'
  | 'CHAIRMAN_DIRECTOR'
  | 'DIRECTOR'
  | 'MANAGING_DIRECTOR'
  | 'TRUSTEE'
  | 'INSTITUTION_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'ACCOUNTANT'
  | 'EXAM_CONTROLLER'
  | 'ADMISSION_OFFICER'
  | 'HR_MANAGER'
  | 'TEACHER'
  | 'LECTURER'
  | 'LIBRARIAN'
  | 'HOSTEL_WARDEN'
  | 'TRANSPORT_MANAGER'
  | 'DRIVER'
  | 'COMPUTER_OPERATOR'
  | 'PARENT'
  | 'STUDENT';

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
    title: 'Platform Super Administrator (SaaS Root)',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-400 font-extrabold',
    allowedTabs: [
      'dashboard', 'permissions-centre', 'dashboard-designer', 'tenants', 'plans', 'entitlements', 'audit',
      'platform-superadmin', 'laboratory', 'communication', 'examinations', 'progress-cards', 'fees',
      'attendance', 'transport', 'academics', 'students', 'staff', 'timetable', 'data-migration',
      'institution-control-centre', 'institution-login', 'admissions',
      'academic-structure', 'staff-duties', 'marks-register', 'hall-tickets', 'fee-review', 'notice-board'
    ],
    canEdit: ['All platform-level policies', 'Multi-tenant database quotas', 'Global RBAC catalog', 'SaaS subscription billing'],
    canApprove: ['Institution tenant onboarding', 'Platform break-glass override', 'Global license keys'],
    restrictedActions: ['Protected by Platform Lockout Guard: Cannot remove last Platform Super Admin access'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'ALL_TENANTS', description: 'Platform Infrastructure Authority' }]
  },
  CHAIRMAN_DIRECTOR: {
    role: 'CHAIRMAN_DIRECTOR',
    title: 'Chairman / Director (Institution Super Admin)',
    badgeColor: 'bg-purple-100 text-purple-950 border-purple-500 font-black',
    allowedTabs: [
      'dashboard', 'institution-control-centre', 'permissions-centre', 'dashboard-designer',
      'examinations', 'progress-cards', 'fees', 'attendance', 'transport', 'students', 'staff', 'timetable', 'data-migration',
      'laboratory', 'communication', 'academics', 'admissions', 'institution-login',
      'academic-structure', 'staff-duties', 'marks-register', 'hall-tickets', 'fee-review', 'notice-board'
    ],
    canEdit: ['All campus policies & settings', 'Create institution users & assign custom roles', 'Central Permission Matrix for campus', 'Dashboard Designer layout & menu visibility', 'Configure custom fee heads', 'Strategic budget allocation'],
    canApprove: ['Exceptional fee concessions & waivers', 'Staff recruitments & promotions', 'High-value refunds & write-offs', 'Annual academic results publication'],
    restrictedActions: ['Isolated to institutional tenant; cannot alter SaaS platform tenancy licenses or cloud billing'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Akshara Global Educational Group' }]
  },
  DIRECTOR: {
    role: 'DIRECTOR',
    title: 'Executive Director (Institution Management)',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-400 font-bold',
    allowedTabs: ['dashboard', 'institution-control-centre', 'permissions-centre', 'dashboard-designer', 'examinations', 'fees', 'staff'],
    canEdit: ['Staff directory', 'Campus operations', 'Institution fee heads'],
    canApprove: ['Budget disbursements', 'Policy implementations'],
    restrictedActions: ['Cannot alter multi-tenant SaaS policies'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Campus Operational Management' }]
  },
  MANAGING_DIRECTOR: {
    role: 'MANAGING_DIRECTOR',
    title: 'Managing Director (Governance & Operations)',
    badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-500 font-black',
    allowedTabs: ['dashboard', 'institution-control-centre', 'permissions-centre', 'dashboard-designer', 'fees', 'staff'],
    canEdit: ['Institution governance', 'Executive reporting'],
    canApprove: ['Major capital contracts', 'Strategic fee frameworks'],
    restrictedActions: ['Cannot modify platform database engine'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Executive Board Governance' }]
  },
  TRUSTEE: {
    role: 'TRUSTEE',
    title: 'Board of Trustees / Management Committee',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
    allowedTabs: ['dashboard', 'institution-control-centre', 'fees', 'staff'],
    canEdit: ['Trust compliance declarations', 'Audit reviews'],
    canApprove: ['Annual institutional balance sheet & trust reports'],
    restrictedActions: ['Read-only operational access; cannot enter daily marks or attendance'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Board of Trustees Oversight' }]
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
      'examinations', 'progress-cards', 'laboratory', 'communication', 'transport', 'staff', 'timetable', 'data-migration', 'analytics', 'settings',
      'academic-structure', 'staff-duties', 'marks-register', 'hall-tickets', 'fee-review', 'notice-board'
    ],
    canEdit: ['Curriculum & subjects', 'Staff profiles', 'Fee structures', 'Institution settings'],
    canApprove: ['Student admissions', 'Staff leave requests', 'Department budgets'],
    restrictedActions: ['CANNOT create, modify or grant permissions. Must submit requests to Platform Super Admin'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Akshara Global Campus' }]
  },
  PRINCIPAL: {
    role: 'PRINCIPAL',
    title: 'Principal (Academic Operations & Approvals)',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-400 font-bold',
    allowedTabs: [
      'dashboard', 'examinations', 'progress-cards', 'attendance', 'students', 'staff', 'timetable', 'fees', 'transport',
      'laboratory', 'communication', 'academics', 'admissions', 'data-migration',
      'academic-structure', 'staff-duties', 'marks-register', 'hall-tickets', 'fee-review', 'notice-board'
    ],
    canEdit: ['Academic calendar & curriculum', 'Staff classroom evaluations', 'Invigilation duty roster', 'Official student conduct remarks'],
    canApprove: ['Final exam results publication seal (Stage 3)', 'Student leave & transfer certificates', 'Class promotions'],
    restrictedActions: [
      'STRICTLY PROHIBITED from modifying role permissions, editing the Central Permission Matrix, altering dashboard layouts, or modifying fee heads (Reserved for Chairman / Director & Super Admin)'
    ],
    scopes: [{ scopeType: 'campus', scopeValue: 'MAIN_CAMPUS', description: 'Main Campus & All Academic Streams' }]
  },
  ADMISSION_OFFICER: {
    role: 'ADMISSION_OFFICER',
    title: 'Chief Admissions Officer',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-400 font-bold',
    allowedTabs: ['dashboard', 'admissions', 'students'],
    canEdit: ['Prospective student enquiries', 'Entrance test verification', 'Application dossiers'],
    canApprove: ['Provisional admission clearance (Stage 1)'],
    restrictedActions: ['LOCKED from financial ledger modification and examination marks entry'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Campus Admissions Department' }]
  },
  HR_MANAGER: {
    role: 'HR_MANAGER',
    title: 'Human Resources & Staff Officer',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    allowedTabs: ['dashboard', 'staff'],
    canEdit: ['Faculty biodata, qualifications, biometric leaves, service registers', 'Payroll roster'],
    canApprove: ['Staff leave applications'],
    restrictedActions: ['LOCKED from student grades, fee transactions, and platform permissions'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Faculty & Non-Teaching Staff Cadre' }]
  },
  LECTURER: {
    role: 'LECTURER',
    title: 'Senior Lecturer (PU College - Science / Commerce)',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-400 font-bold',
    allowedTabs: ['dashboard', 'attendance', 'examinations', 'timetable', 'progress-cards'],
    canEdit: ['Lecture period attendance', 'Draft theory & practical marks entry for assigned PU batches'],
    canApprove: ['Submit internal marks to Exam Controller (Stage 1)'],
    restrictedActions: ["LOCKED from fee collections, financial ledgers, and other lecturers' batches"],
    scopes: [{ scopeType: 'programme', scopeValue: 'PU_SCIENCE', description: 'I & II PUC Science Batches' }]
  },
  LIBRARIAN: {
    role: 'LIBRARIAN',
    title: 'Chief Librarian & Information Officer',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-400 font-bold',
    allowedTabs: ['dashboard', 'students'],
    canEdit: ['Book accession catalog, issue/return registry, fine collection'],
    canApprove: ['Library No-Dues clearance for TC & hall tickets'],
    restrictedActions: ['LOCKED from exam marks, core fee structures, and staff records'],
    scopes: [{ scopeType: 'department', scopeValue: 'LIBRARY', description: 'Campus Central Library' }]
  },
  HOSTEL_WARDEN: {
    role: 'HOSTEL_WARDEN',
    title: 'Chief Hostel Warden & Residential Superintendent',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-400 font-bold',
    allowedTabs: ['dashboard', 'students', 'attendance'],
    canEdit: ['Hostel room allocations, night roll-call attendance, gate passes, dining feedback'],
    canApprove: ['Hostel night-out leaves & visitor clearances'],
    restrictedActions: ['LOCKED from academic marks entry and fee rate configurations'],
    scopes: [{ scopeType: 'department', scopeValue: 'HOSTEL', description: 'Boys & Girls Residential Hostels' }]
  },
  DRIVER: {
    role: 'DRIVER',
    title: 'Campus Transport Driver (Route Fleet)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
    allowedTabs: ['dashboard', 'transport'],
    canEdit: ['Trip start/stop status, passenger boarding check'],
    canApprove: ['None'],
    restrictedActions: ['LOCKED from all academic, administrative, and financial modules'],
    scopes: [{ scopeType: 'assigned_route', scopeValue: 'ROUTE_104', description: 'Assigned Bus Route 104' }]
  },
  VICE_PRINCIPAL: {
    role: 'VICE_PRINCIPAL',
    title: 'Vice Principal (Academics & Discipline)',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    allowedTabs: ['dashboard', 'students', 'attendance', 'examinations', 'timetable', 'staff', 'academic-structure', 'marks-register', 'hall-tickets', 'notice-board'],
    canEdit: ['Timetable schedules', 'Daily class supervision'],
    canApprove: ['Student leaves', 'Disciplinary reviews'],
    restrictedActions: ['Cannot approve financial transactions or platform settings'],
    scopes: [{ scopeType: 'department', scopeValue: 'ACADEMICS', description: 'Secondary & PU Classes' }]
  },
  ACCOUNTANT: {
    role: 'ACCOUNTANT',
    title: 'Finance & Accounts Officer',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    allowedTabs: ['dashboard', 'fees', 'fee-review'],
    canEdit: ['Fee collection', 'Payment allocations', 'Issue digital receipts'],
    canApprove: ['Payment reconciliations', 'Request exceptional fee refunds (Dual Approval required)'],
    restrictedActions: ['LOCKED from editing marks, examinations, attendance, or student academic data; cannot grant permissions'],
    scopes: [{ scopeType: 'tenant', scopeValue: 'akshara', description: 'Akshara Accounts Ledger' }]
  },
  EXAM_CONTROLLER: {
    role: 'EXAM_CONTROLLER',
    title: 'Controller of Examinations',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    allowedTabs: ['dashboard', 'examinations', 'progress-cards', 'academic-structure', 'marks-register', 'hall-tickets', 'notice-board'],
    canEdit: ['Exam timetable schedules', 'Room allocations', 'Invigilator duties', 'Passing criteria'],
    canApprove: ['Audit & verify marks for missing entries/errors (Stage 2)'],
    restrictedActions: ['LOCKED from fee collections, HR, and platform permissions; cannot publish results without Principal seal'],
    scopes: [{ scopeType: 'programme', scopeValue: 'ALL_PROGRAMMES', description: 'All Academic Examination Batches' }]
  },
  TEACHER: {
    role: 'TEACHER',
    title: 'Faculty / Subject Teacher (Physics - I PUC)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    allowedTabs: ['dashboard', 'attendance', 'examinations', 'progress-cards', 'timetable', 'marks-register', 'notice-board'],
    canEdit: ['Class attendance for assigned periods', 'Draft marks entry for assigned subjects only'],
    canApprove: ['Submit subject marks batch to Examination Controller (Stage 1)'],
    restrictedActions: ['LOCKED from other teachers\' subjects, fee collections, and student financial records'],
    scopes: [{ scopeType: 'subject', scopeValue: 'PHY-101', description: 'I PUC Physics & Class 10 Science' }]
  },
  COMPUTER_OPERATOR: {
    role: 'COMPUTER_OPERATOR',
    title: 'Computer Data Entry Operator',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
    allowedTabs: ['dashboard', 'marks-register', 'hall-tickets', 'examinations'],
    canEdit: ['High-speed marks entry for assigned batches', 'Draft marks saving', 'Absentee/Withheld entry'],
    canApprove: ['None (Operator submissions routed to Teacher / Controller / Principal)'],
    restrictedActions: ['LOCKED from approving marks, publishing results, fee collections, and platform settings'],
    scopes: [{ scopeType: 'department', scopeValue: 'DATA_ENTRY', description: 'Central Examination Data Entry Desk' }]
  },
  PARENT: {
    role: 'PARENT',
    title: 'Parent / Guardian (Aarav Sharma - Class 10)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    allowedTabs: ['dashboard', 'students', 'fees', 'attendance', 'examinations', 'progress-cards', 'transport', 'timetable', 'notice-board', 'hall-tickets'],
    canEdit: ['Own emergency contact information'],
    canApprove: ['Online fee payment authorization'],
    restrictedActions: ['STRICTLY ISOLATED to only linked child\'s records; cannot view any other student'],
    scopes: [{ scopeType: 'own_child', scopeValue: 'ADM-2026-001', description: 'Aarav Sharma (Class 10-A)' }]
  },
  STUDENT: {
    role: 'STUDENT',
    title: 'Student Portal (Ananya Hegde - I PUC PCMB)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    allowedTabs: ['dashboard', 'examinations', 'progress-cards', 'attendance', 'timetable', 'notice-board', 'hall-tickets'],
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


// ---------------------------------------------------------------------------
// Currency to Words Conversion (Indian Convention)
// ---------------------------------------------------------------------------
export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    const t = tens[Math.floor(n / 10)];
    const u = units[n % 10];
    return u ? `${t} ${u}` : t;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    let res = '';
    if (hundred > 0) {
      res += `${units[hundred]} Hundred`;
      if (rem > 0) res += ` and ${convertTwoDigits(rem)}`;
    } else {
      res += convertTwoDigits(rem);
    }
    return res;
  }

  const crores = Math.floor(amount / 10000000);
  let rem = amount % 10000000;
  const lakhs = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousands = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundreds = rem;

  const parts: string[] = [];
  if (crores > 0) parts.push(`${convertThreeDigits(crores)} Crore`);
  if (lakhs > 0) parts.push(`${convertThreeDigits(lakhs)} Lakh`);
  if (thousands > 0) parts.push(`${convertThreeDigits(thousands)} Thousand`);
  if (hundreds > 0) parts.push(convertThreeDigits(hundreds));

  return `${parts.join(' ')} Rupees Only`.replace(/\s+/g, ' ').trim();
}

export interface FeeHeadAllocationRecord {
  feeHeadId: string;
  feeHeadName: string;
  category: string;
  annualFee: number;
  term1Due: number;
  term2Due: number;
  paidAmount: number;
  balanceDue: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface StudentConsolidatedFeeStatement {
  studentId: string;
  admissionNumber: string;
  studentName: string;
  parentName: string;
  courseClass: string;
  sectionOrStream: string;
  academicYear: string;
  isHostelResident: boolean;
  totalAnnualFee: number;
  totalPaid: number;
  totalBalanceDue: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  feeHeads: FeeHeadAllocationRecord[];
  receiptHistory: DemoFeeReceipt[];
}

export interface AcceptanceTestState {
  stage: 'INITIAL' | 'STAGE_1_PAID_50K' | 'STAGE_2_PAID_30K';
  studentId: string;
  admissionNumber: string;
  studentName: string;
  parentName: string;
  courseClass: string;
  section: string;
  academicYear: string;
  isHostelResident: boolean;
  totalAnnualFee: number;
  totalPaid: number;
  totalBalanceDue: number;
  allocations: FeeHeadAllocationRecord[];
  generatedReceipts: DemoFeeReceipt[];
}

export interface IndividualProgressCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  examName: string;
  examCategory: string;
  academicYear: string;
  attendancePct: number;
  subjects: {
    subjectName: string;
    theoryMax: number;
    theoryObtained: number;
    practicalMax: number;
    practicalObtained: number;
    totalMax: number;
    totalObtained: number;
    grade: string;
    remarks: string;
  }[];
  totalMax: number;
  totalObtained: number;
  overallPercentage: number;
  overallGrade: string;
  teacherRemarks: string;
  approvalStatus: 'VERIFIED_AND_SEALED';
  controllerVerifiedBy: string;
  principalApprovedBy: string;
  publishedAt: string;
  qrPayload: string;
}

export interface ConsolidatedAcademicProgressCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  academicYear: string;
  overallGpa: string;
  yearlyPercentage: number;
  overallAttendancePct: number;
  practicalProficiencyPct: number;
  assignmentsScore: string;
  trajectoryTrend: {
    examName: string;
    percentage: number;
    date: string;
  }[];
  netGainPercentagePoints: number;
  subjectSummary: {
    subject: string;
    annualAvg: number;
    grade: string;
    trend: 'RISING' | 'CONSISTENT';
  }[];
}

export interface CompetitiveFoundationReport {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  programme: 'NEET Foundation (PCMB)' | 'JEE Main Foundation (PCM)' | 'KCET Foundation';
  testName: string;
  totalQuestions: number;
  totalMarks: number;
  correctAnswers: number;
  correctMarks: number;
  incorrectAnswers: number;
  negativeMarks: number;
  unattemptedQuestions: number;
  netScore: number;
  accuracyPct: number;
  percentileEstimate: number;
  subjectBreakdown: {
    subject: string;
    questions: number;
    correct: number;
    incorrect: number;
    netMarks: number;
    accuracyPct: number;
  }[];
}


// ============================================================================
// LABORATORY MANAGEMENT & QR INVENTORY DOMAIN
// ============================================================================

export type LaboratoryType = 
  | 'PHYSICS' 
  | 'CHEMISTRY' 
  | 'BIOLOGY' 
  | 'COMPUTER' 
  | 'MATHEMATICS' 
  | 'ELECTRONICS' 
  | 'BIOTECH' 
  | 'CUSTOM';

export interface LaboratoryModel {
  id: string;
  name: string;
  type: LaboratoryType;
  campus: string;
  building: string;
  floor: string;
  roomNumber: string;
  inChargeName: string;
  assignedTeachers: string[];
  labAssistants: string[];
  capacity: number;
  totalItems: number;
  inventoryValue: number;
  lowStockCount: number;
  maintenanceCount: number;
  safetyTier: string;
}

export type LabItemCategory = 
  | 'REUSABLE_EQUIPMENT' 
  | 'CONSUMABLE_CHEMICAL' 
  | 'HAZARDOUS_MATERIAL' 
  | 'GLASSWARE'
  | 'COMPUTING_HARDWARE';

export interface LabInventoryItem {
  id: string;
  name: string;
  labId: string;
  category: LabItemCategory;
  storageLocation: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  unitPrice: number;
  totalValue: number;
  manufacturer: string;
  supplier: string;
  batchNumber: string;
  purchaseDate: string;
  expiryDate?: string;
  condition: 'OPERATIONAL' | 'CALIBRATION_DUE' | 'UNDER_MAINTENANCE' | 'DAMAGED';
  qrCodeValue: string;
  safetyClassification: string;
  lastVerifiedDate: string;
}

export interface LabStockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'ISSUE' | 'RETURN' | 'CONSUMPTION' | 'PURCHASE_RECEIPT' | 'DAMAGE_WRITE_OFF';
  quantity: number;
  unit: string;
  performedBy: string;
  requestedBy: string;
  purpose: string;
  timestamp: string;
  balanceAfter: number;
}

export interface LabExperiment {
  id: string;
  subject: string;
  title: string;
  classGroup: string;
  requiredMaterials: string[];
  scheduleDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  teacherName: string;
}

// ============================================================================
// MULTI-CHANNEL COMMUNICATION HUB (WHATSAPP & TELEGRAM) DOMAIN
// ============================================================================

export interface CommunicationChannelConfig {
  id: 'whatsapp' | 'telegram' | 'sms' | 'email';
  name: string;
  isEnabled: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TEST_FAILED';
  lastPingTime?: string;
  credentials: {
    phoneNumberId?: string;
    wabaId?: string;
    accessToken?: string;
    webhookVerifyToken?: string;
    botToken?: string;
    botUsername?: string;
    targetChannelOrChatId?: string;
    senderId?: string;
    apiKey?: string;
    smtpHost?: string;
    smtpUser?: string;
  };
}

export interface CommunicationTemplate {
  id: string;
  eventTrigger: 'EXAM_TIMETABLE' | 'EXAM_RESULT' | 'FEE_RECEIPT' | 'FEE_DUE' | 'ATTENDANCE_ABSENT' | 'PRACTICAL_SCHEDULE';
  title: string;
  language: 'EN' | 'KN' | 'HI' | 'TE';
  channel: 'whatsapp' | 'telegram' | 'sms';
  content: string;
  placeholders: string[];
  providerApproved: boolean;
}

export interface CommunicationDeliveryLog {
  id: string;
  recipientName: string;
  recipientContact: string;
  recipientRole: 'PARENT' | 'STUDENT' | 'TEACHER';
  channel: 'whatsapp' | 'telegram' | 'sms' | 'email';
  eventTrigger: string;
  messageText: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: string;
  providerRefId: string;
}

// ============================================================================
// CENTRAL PLATFORM SUPER ADMIN (1,000+ TENANTS & CONSENT SUPPORT)
// ============================================================================

export interface PlatformTenant {
  id: string;
  name: string;
  type: 'SCHOOL' | 'PU_COLLEGE' | 'DEGREE_COLLEGE' | 'COMPOSITE_GROUP';
  state: string;
  city: string;
  plan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  studentCount: number;
  staffCount: number;
  mrrAmount: number;
  renewalDate: string;
  chairmanEmail: string;
  activeCampuses: number;
  customDomain?: string;
  consentSupportActive: boolean;
}

export interface TechnicalSupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  category: 'DATABASE_MIGRATION' | 'WHATSAPP_INTEGRATION' | 'EXAM_APPROVAL_STUCK' | 'FEE_GATEWAY';
  requestedScope: 'DIAGNOSTICS_ONLY' | 'CONFIG_INSPECTION' | 'TEMP_RECORD_AUDIT';
  requestedDurationHours: number;
  status: 'PENDING_INSTITUTION_APPROVAL' | 'APPROVED_ACTIVE' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  approvedByChairman?: string;
  expiresAt?: string;
}

export interface PlatformProcurementItem {
  id: string;
  serviceCategory: string;
  vendor: string;
  monthlyCost: number;
  status: 'PRODUCTION_ACTIVE' | 'EVALUATION' | 'CONFIGURED';
  renewalDate: string;
}

export interface ExamWizardPayload {
  name: string;
  category: InstitutionalExamCategory;
  academicYear: string;
  programmeOrClass: string;
  stream: string;
  subjects: {
    subjectName: string;
    maxMarks: number;
    passMarks: number;
    theoryMarks: number;
    practicalMarks: number;
    examDate: string;
    room: string;
    invigilator: string;
  }[];
  deliveryMode: ExamDeliveryMode;
  instructions: string;
}

export interface MigrationBatch {
  id: string;
  fileName: string;
  fileFormat: 'XLSX' | 'CSV' | 'PDF_OCR';
  uploadedAt: string;
  totalRecords: number;
  exactMatchesCount: number;
  probableMatchesCount: number;
  cleanNewRecordsCount: number;
  status: 'ANALYZED' | 'VALIDATED' | 'MIGRATED';
  columnMappings: {
    sourceHeader: string;
    targetField: string;
    confidence: number;
    sampleValue: string;
  }[];
  duplicateCandidates: {
    id: string;
    sourceRow: number;
    sourceAdmissionNo: string;
    sourceName: string;
    sourcePhone: string;
    matchType: 'EXACT_DUPLICATE' | 'PROBABLE_MATCH';
    existingRecordName: string;
    existingAdmissionNo: string;
    recommendedAction: 'SKIP' | 'MERGE' | 'MANUAL_REVIEW';
    resolvedAction?: 'SKIP' | 'MERGE' | 'OVERWRITE';
  }[];
}

export interface DemoFeeReceipt {
  id: string;
  receipt_number: string;
  invoice_id: string;
  invoice_number: string;
  student_id: string;
  student_name: string;
  parent_name?: string;
  amount_in_words?: string;
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
  theory_max?: number;
  theory_obtained?: number;
  practical_max?: number;
  practical_obtained?: number;
  internal_max?: number;
  internal_obtained?: number;
  attendance_status?: 'PRESENT' | 'ABSENT' | 'WITHHELD' | 'EXEMPTED';
  entered_by?: string;
  entered_by_role?: string;
  verification_status?: 'DRAFT' | 'SUBMITTED' | 'CONTROLLER_VERIFIED' | 'PRINCIPAL_APPROVED' | 'PUBLISHED';
}

export interface AcademicSectionModel {
  id: string;
  academic_year: string;
  course_level: 'School' | 'PU College' | 'Degree College';
  class_name: string;
  stream: string;
  section_code: string;
  room_number: string;
  max_capacity: number;
  enrolled_count: number;
  class_teacher_name: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface StudentSectionTransferModel {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  source_section: string;
  target_section: string;
  reason: string;
  effective_date: string;
  approved_by: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface StaffDutyAssignmentModel {
  id: string;
  staff_id: string;
  staff_name: string;
  duty_role: 'CLASS_TEACHER' | 'SUBJECT_TEACHER' | 'SECTION_COORDINATOR' | 'COMPUTER_OPERATOR' | 'VICE_PRINCIPAL_SUPERVISOR';
  class_name: string;
  section_code: string;
  subject_code?: string;
  subject_name?: string;
  examination_title?: string;
  can_enter_marks: boolean;
  can_take_attendance: boolean;
  can_verify_marks: boolean;
  assigned_by: string;
  is_active: boolean;
}

export interface HallTicketModel {
  id: string;
  ticket_number: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  section_code: string;
  exam_title: string;
  exam_centre: string;
  room_number: string;
  seat_number: string;
  eligibility_status: 'ELIGIBLE' | 'PENDING_FEE_APPROVAL' | 'SPECIAL_EXEMPTION' | 'REVOKED';
  qr_code_signature: string;
  timetable: { subject: string; date: string; time: string; room: string }[];
  photo_url?: string;
}

export interface ConsolidatedFeeReportSnapshotModel {
  id: string;
  snapshot_code: string;
  academic_year: string;
  target_class: string;
  submitted_by_name: string;
  submitted_at: string;
  total_students: number;
  total_assigned: number;
  total_concessions: number;
  net_payable: number;
  total_collected: number;
  total_outstanding: number;
  collection_pct: number;
  fully_paid: number;
  partially_paid: number;
  unpaid: number;
  status: 'SUBMITTED' | 'APPROVED' | 'RETURNED_FOR_REVISION';
  reviewed_by_name?: string;
  review_remarks?: string;
  reviewed_at?: string;
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

  // Consolidated Student Fee Statement & Acceptance Test State
  acceptanceTestState: AcceptanceTestState;
  runAcceptanceTestPayment1: () => DemoFeeReceipt;
  runAcceptanceTestPayment2: () => DemoFeeReceipt;
  resetAcceptanceTest: () => void;
  getStudentConsolidatedStatement: (studentId: string) => StudentConsolidatedFeeStatement;

  // Progress Cards & Academic Analytics
  individualProgressCards: IndividualProgressCard[];
  consolidatedProgressCards: ConsolidatedAcademicProgressCard[];
  competitiveReports: CompetitiveFoundationReport[];

  // Data Migration Centre
  migrationBatches: MigrationBatch[];
  resolveMigrationCandidate: (batchId: string, candidateId: string, resolution: 'SKIP' | 'MERGE' | 'OVERWRITE') => void;
  executeMigrationBatch: (batchId: string) => { success: boolean; message: string; importedCount: number };

  // ============================================================================
  // LABORATORY MANAGEMENT
  // ============================================================================
  laboratories: LaboratoryModel[];
  labInventory: LabInventoryItem[];
  labMovements: LabStockMovement[];
  labExperiments: LabExperiment[];
  activeLabFilter: string;
  setActiveLabFilter: (labId: string) => void;
  addLabItem: (item: LabInventoryItem) => void;
  issueLabItem: (itemId: string, quantity: number, requestedBy: string, purpose: string) => { success: boolean; message: string };
  returnLabItem: (itemId: string, returnedQuantity: number, consumedQuantity: number) => { success: boolean; message: string };
  recordMaintenance: (itemId: string, nextCalibration: string, condition: 'OPERATIONAL' | 'CALIBRATION_DUE' | 'UNDER_MAINTENANCE' | 'DAMAGED') => void;
  verifyPhysicalStock: (itemId: string, countedQty: number) => { discrepancy: number; status: string };

  // ============================================================================
  // MULTI-CHANNEL COMMUNICATION HUB
  // ============================================================================
  commChannels: CommunicationChannelConfig[];
  commTemplates: CommunicationTemplate[];
  commDeliveryLogs: CommunicationDeliveryLog[];
  commAutoTriggers: Record<string, boolean>;
  updateChannelConfig: (channelId: 'whatsapp' | 'telegram' | 'sms' | 'email', partial: Partial<CommunicationChannelConfig>) => void;
  testChannelConnection: (channelId: 'whatsapp' | 'telegram' | 'sms' | 'email') => { success: boolean; latencyMs: number; message: string };
  toggleAutoTrigger: (triggerKey: string) => void;
  dispatchCommunicationMessage: (payload: { recipientName: string; recipientContact: string; recipientRole: 'PARENT' | 'STUDENT' | 'TEACHER'; channel: 'whatsapp' | 'telegram' | 'sms' | 'email'; eventTrigger: string; messageText: string }) => CommunicationDeliveryLog;

  // ============================================================================
  // CENTRAL PLATFORM SUPER ADMIN (1,000+ TENANTS & CONSENT SUPPORT)
  // ============================================================================
  platformTenants: PlatformTenant[];
  supportTickets: TechnicalSupportTicket[];
  procurementItems: PlatformProcurementItem[];
  activeSubscriptionPlan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
  setActiveSubscriptionPlan: (plan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE') => void;
  provisionNewTenant: (payload: { name: string; type: 'SCHOOL' | 'PU_COLLEGE' | 'DEGREE_COLLEGE' | 'COMPOSITE_GROUP'; state: string; city: string; plan: 'STARTER' | 'STANDARD' | 'PRO' | 'ENTERPRISE'; capacity: number }) => { tenant: PlatformTenant; activationLink: string };
  approveSupportAccess: (ticketId: string, approvedBy: string) => { success: boolean; message: string };
  revokeSupportAccess: (ticketId: string) => void;

  // ============================================================================
  // EXAM WIZARD & MARKS WORKFLOW
  // ============================================================================
  createExamViaWizard: (payload: ExamWizardPayload) => { success: boolean; exam: DemoExam };
  updateStudentExamMarks: (studentId: string, subject: string, marksObtained: number) => void;
  advanceExamApprovalStage: (examId: string) => { currentStage: string; published: boolean };

  // ============================================================================
  // ACADEMIC SECTIONS, STAFF DUTIES, MARKS REGISTER & HALL TICKETS
  // ============================================================================
  academicSections: AcademicSectionModel[];
  studentTransfers: StudentSectionTransferModel[];
  staffDuties: StaffDutyAssignmentModel[];
  hallTickets: HallTicketModel[];
  feeSnapshots: ConsolidatedFeeReportSnapshotModel[];

  addAcademicSection: (payload: Omit<AcademicSectionModel, 'id' | 'enrolled_count'>) => { success: boolean; section: AcademicSectionModel; message: string };
  transferStudentSection: (payload: { studentId: string; studentName: string; sourceSection: string; targetSection: string; reason: string }) => { success: boolean; message: string };
  assignStaffDuty: (payload: Omit<StaffDutyAssignmentModel, 'id' | 'assigned_by' | 'is_active'>) => { success: boolean; assignment: StaffDutyAssignmentModel };
  generateHallTicketsForClass: (payload: { examTitle: string; className: string; sectionCode?: string; enforceFeeClearance?: boolean }) => { count: number; tickets: HallTicketModel[] };
  updateComponentMarks: (studentId: string, subject: string, components: { theory?: number; practical?: number; internal?: number; status?: 'PRESENT' | 'ABSENT' | 'WITHHELD' | 'EXEMPTED'; enteredBy?: string; enteredByRole?: string }) => void;
  submitFeeReportSnapshot: (payload: Omit<ConsolidatedFeeReportSnapshotModel, 'id' | 'snapshot_code' | 'submitted_at' | 'status'>) => { success: boolean; snapshot: ConsolidatedFeeReportSnapshotModel };
  reviewFeeReportSnapshot: (snapshotId: string, decision: 'APPROVED' | 'RETURNED_FOR_REVISION', remarks: string) => void;


  resetDemoData: () => void;
}

// ---------------------------------------------------------------------------
// Initial Seed Data
// ---------------------------------------------------------------------------

export const initialLaboratories: LaboratoryModel[] = [
  {
    id: 'LAB-PHY-01',
    name: 'Sir C.V. Raman Advanced Physics Laboratory',
    type: 'PHYSICS',
    campus: 'Main Bengaluru Campus',
    building: 'Science & Technology Block',
    floor: '2nd Floor',
    roomNumber: 'ST-204',
    inChargeName: 'Dr. V. Murthy (PhD, Optics)',
    assignedTeachers: ['Dr. V. Murthy', 'Prof. Arvind K.'],
    labAssistants: ['K. Suresh (Senior Lab Tech)'],
    capacity: 40,
    totalItems: 28,
    inventoryValue: 485000,
    lowStockCount: 2,
    maintenanceCount: 1,
    safetyTier: 'Tier 2 (High Voltage & Laser Guarded)'
  },
  {
    id: 'LAB-CHEM-01',
    name: 'P.C. Ray Chemistry & Chemical Research Lab',
    type: 'CHEMISTRY',
    campus: 'Main Bengaluru Campus',
    building: 'Science & Technology Block',
    floor: '1st Floor',
    roomNumber: 'ST-108',
    inChargeName: 'Prof. S. Joshi (MSc Organic Chem)',
    assignedTeachers: ['Prof. S. Joshi', 'Dr. Meera N.'],
    labAssistants: ['R. Manjunath', 'L. Venkatesh'],
    capacity: 40,
    totalItems: 46,
    inventoryValue: 395000,
    lowStockCount: 3,
    maintenanceCount: 1,
    safetyTier: 'Tier 3 (Fume Hoods, Acid Neutralizers, Eye Wash)'
  },
  {
    id: 'LAB-BIO-01',
    name: 'Jagadish Chandra Bose Biology & Biotech Lab',
    type: 'BIOLOGY',
    campus: 'Main Bengaluru Campus',
    building: 'Life Sciences Wing',
    floor: '3rd Floor',
    roomNumber: 'LS-301',
    inChargeName: 'Dr. Anita Deshmukh (PhD Cytology)',
    assignedTeachers: ['Dr. Anita Deshmukh', 'Prof. Kavitha S.'],
    labAssistants: ['B. Ramesh'],
    capacity: 35,
    totalItems: 34,
    inventoryValue: 420000,
    lowStockCount: 0,
    maintenanceCount: 1,
    safetyTier: 'Tier 1 (Autoclaved & Bio-hazard Specimen Safe)'
  },
  {
    id: 'LAB-CS-01',
    name: 'Alan Turing Computer Science & AI Lab',
    type: 'COMPUTER',
    campus: 'Main Bengaluru Campus',
    building: 'Computing Centre',
    floor: 'Ground Floor',
    roomNumber: 'CC-02',
    inChargeName: 'Prof. Rajeshwari Patil (M.Tech CSE)',
    assignedTeachers: ['Prof. Rajeshwari Patil', 'Srikanth R.'],
    labAssistants: ['Girish Gowda (Network Admin)'],
    capacity: 60,
    totalItems: 65,
    inventoryValue: 1250000,
    lowStockCount: 0,
    maintenanceCount: 0,
    safetyTier: 'Tier 1 (Air-Conditioned & Dual UPS Protected)'
  },
  {
    id: 'LAB-ELEC-01',
    name: 'Nikola Tesla Electronics & IoT Workbench',
    type: 'ELECTRONICS',
    campus: 'Main Bengaluru Campus',
    building: 'Science & Technology Block',
    floor: '2nd Floor',
    roomNumber: 'ST-210',
    inChargeName: 'Er. Sandeep Hegde (M.Tech VLSI)',
    assignedTeachers: ['Er. Sandeep Hegde'],
    labAssistants: ['Mahesh K.'],
    capacity: 30,
    totalItems: 22,
    inventoryValue: 340000,
    lowStockCount: 1,
    maintenanceCount: 0,
    safetyTier: 'Tier 2 (ESD Safe Benches, Circuit Breakers)'
  }
];

export const initialLabInventory: LabInventoryItem[] = [
  {
    id: 'ITEM-PHY-101',
    name: 'Compound Binocular Optical Microscope 1000x',
    labId: 'LAB-PHY-01',
    category: 'REUSABLE_EQUIPMENT',
    storageLocation: 'Cabinet A, Shelf 1',
    unit: 'Units',
    currentStock: 18,
    minStockLevel: 5,
    unitPrice: 16500,
    totalValue: 297000,
    manufacturer: 'Olympus Scientific India',
    supplier: 'Karnataka Scientific Suppliers, Bengaluru',
    batchNumber: 'OLY-2025-BATCH-4',
    purchaseDate: '2025-06-12',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-PHY-101',
    safetyClassification: 'General Optical Instrument',
    lastVerifiedDate: '2026-10-25'
  },
  {
    id: 'ITEM-PHY-102',
    name: 'Sodium Vapour Lamp Setup with Optical Bench & Slits',
    labId: 'LAB-PHY-01',
    category: 'REUSABLE_EQUIPMENT',
    storageLocation: 'Bench Station 4',
    unit: 'Sets',
    currentStock: 6,
    minStockLevel: 2,
    unitPrice: 12000,
    totalValue: 72000,
    manufacturer: 'Labtronics India',
    supplier: 'Precision Scientific instruments',
    batchNumber: 'LTI-SOD-2024',
    purchaseDate: '2024-09-10',
    condition: 'CALIBRATION_DUE',
    qrCodeValue: 'EDU-LAB-QR-PHY-102',
    safetyClassification: 'High Voltage Arc Hazard',
    lastVerifiedDate: '2026-10-15'
  },
  {
    id: 'ITEM-CHEM-201',
    name: 'Concentrated Hydrochloric Acid (HCl 37% AR Grade)',
    labId: 'LAB-CHEM-01',
    category: 'HAZARDOUS_MATERIAL',
    storageLocation: 'Fume Hood Acid Locker #3',
    unit: 'Bottles (500ml)',
    currentStock: 4,
    minStockLevel: 8,
    unitPrice: 450,
    totalValue: 1800,
    manufacturer: 'Merck Life Science Pvt Ltd',
    supplier: 'Apex Chemical Distributors, Malleshwaram',
    batchNumber: 'MRC-HCL-8921B',
    purchaseDate: '2026-02-14',
    expiryDate: '2028-02-14',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-CHEM-201',
    safetyClassification: 'Class 8 Corrosive • Mandatory Gloves & Goggles',
    lastVerifiedDate: '2026-11-01'
  },
  {
    id: 'ITEM-CHEM-202',
    name: 'Potassium Permanganate Crystals (KMnO4 99.5% Pure)',
    labId: 'LAB-CHEM-01',
    category: 'CONSUMABLE_CHEMICAL',
    storageLocation: 'Reagent Shelf C-4',
    unit: 'Bottles (500g)',
    currentStock: 12,
    minStockLevel: 4,
    unitPrice: 620,
    totalValue: 7440,
    manufacturer: 'SD Fine-Chem Limited',
    supplier: 'Apex Chemical Distributors',
    batchNumber: 'SDF-KMN-2025',
    purchaseDate: '2025-11-20',
    expiryDate: '2029-11-20',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-CHEM-202',
    safetyClassification: 'Oxidizing Agent Class 5.1',
    lastVerifiedDate: '2026-10-28'
  },
  {
    id: 'ITEM-BIO-301',
    name: 'Permanent Mitosis in Onion Root Tip Microscope Slides',
    labId: 'LAB-BIO-01',
    category: 'REUSABLE_EQUIPMENT',
    storageLocation: 'Slide Box Alpha',
    unit: 'Slide Sets',
    currentStock: 25,
    minStockLevel: 10,
    unitPrice: 850,
    totalValue: 21250,
    manufacturer: 'Bio-Visual Preparations',
    supplier: 'Karnataka Scientific Suppliers',
    batchNumber: 'BVP-ROOT-2026',
    purchaseDate: '2026-01-08',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-BIO-301',
    safetyClassification: 'Preserved Histological Specimen',
    lastVerifiedDate: '2026-10-22'
  },
  {
    id: 'ITEM-CS-401',
    name: 'Dell OptiPlex 7010 Desktop (i7-13700, 32GB RAM, 1TB SSD)',
    labId: 'LAB-CS-01',
    category: 'COMPUTING_HARDWARE',
    storageLocation: 'Workstations 01 to 30',
    unit: 'Workstations',
    currentStock: 30,
    minStockLevel: 5,
    unitPrice: 65000,
    totalValue: 1950000,
    manufacturer: 'Dell Technologies',
    supplier: 'Compunet Systems India',
    batchNumber: 'DELL-OPT-2025-Q3',
    purchaseDate: '2025-07-01',
    condition: 'OPERATIONAL',
    qrCodeValue: 'EDU-LAB-QR-CS-401',
    safetyClassification: 'Electronic IT Hardware',
    lastVerifiedDate: '2026-11-02'
  }
];

export const initialLabMovements: LabStockMovement[] = [
  {
    id: 'MOV-2026-0041',
    itemId: 'ITEM-CHEM-201',
    itemName: 'Concentrated Hydrochloric Acid (HCl 37%)',
    type: 'CONSUMPTION',
    quantity: 2,
    unit: 'Bottles (500ml)',
    performedBy: 'R. Manjunath (Lab Asst)',
    requestedBy: 'Prof. S. Joshi',
    purpose: 'PU II Section A Chemistry Practical: Salt Analysis & Titration',
    timestamp: '2026-11-04 10:15 AM',
    balanceAfter: 4
  },
  {
    id: 'MOV-2026-0040',
    itemId: 'ITEM-PHY-101',
    itemName: 'Compound Binocular Optical Microscope 1000x',
    type: 'ISSUE',
    quantity: 12,
    unit: 'Units',
    performedBy: 'K. Suresh (Senior Lab Tech)',
    requestedBy: 'Dr. Anita Deshmukh',
    purpose: 'Class XII Biology Cytology Practical Session',
    timestamp: '2026-11-04 09:00 AM',
    balanceAfter: 6
  },
  {
    id: 'MOV-2026-0039',
    itemId: 'ITEM-PHY-101',
    itemName: 'Compound Binocular Optical Microscope 1000x',
    type: 'RETURN',
    quantity: 12,
    unit: 'Units',
    performedBy: 'K. Suresh',
    requestedBy: 'Dr. Anita Deshmukh',
    purpose: 'Post-Practical Custody Inspection - All Units Clean & Operational',
    timestamp: '2026-11-04 11:30 AM',
    balanceAfter: 18
  }
];

export const initialLabExperiments: LabExperiment[] = [
  {
    id: 'EXP-PHY-01',
    subject: 'Physics',
    title: 'Verification of Ohm\'s Law & Resistance per cm of Given Wire',
    classGroup: 'I PUC - Science (PCMB)',
    requiredMaterials: ['Voltmeter (0-3V)', 'Ammeter (0-1.5A)', 'Rheostat 50 Ohm', 'Battery Eliminator', 'Connecting Wires'],
    scheduleDate: '2026-11-06 09:30 AM',
    status: 'SCHEDULED',
    teacherName: 'Dr. V. Murthy'
  },
  {
    id: 'EXP-CHEM-01',
    subject: 'Chemistry',
    title: 'Titration of Standard Oxalic Acid with Potassium Permanganate (KMnO4)',
    classGroup: 'II PUC - Science (PCMB/PCMC)',
    requiredMaterials: ['Borosilicate Burette 50ml', 'Pipette 20ml', 'KMnO4 0.02M', 'Oxalic Acid 0.05M', 'Dilute H2SO4'],
    scheduleDate: '2026-11-07 10:00 AM',
    status: 'SCHEDULED',
    teacherName: 'Prof. S. Joshi'
  },
  {
    id: 'EXP-BIO-01',
    subject: 'Biology',
    title: 'Preparation & Microscopic Study of Temporary Mount of Onion Root Tip',
    classGroup: 'I PUC - Biology Batch B',
    requiredMaterials: ['Compound Microscopes', 'Acetocarmine Stain', 'Watch Glasses', 'Filter Paper', 'Glass Slides & Coverslips'],
    scheduleDate: '2026-11-05 02:00 PM',
    status: 'COMPLETED',
    teacherName: 'Dr. Anita Deshmukh'
  }
];

export const initialCommChannels: CommunicationChannelConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business Cloud API (Official Meta Platform)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '2 mins ago (Latency: 124ms)',
    credentials: {
      phoneNumberId: '109283746152840',
      wabaId: 'waba_99281734_akshara',
      accessToken: 'EAAG9...[Meta System Token Verified]',
      webhookVerifyToken: 'akshara_wh_token_2026_secure'
    }
  },
  {
    id: 'telegram',
    name: 'Telegram Bot API (@AksharaGlobal_Bot)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '5 mins ago (Latency: 88ms)',
    credentials: {
      botToken: '7182940215:AAH47q9xL1-zYk98V2b...[Verified Active]',
      botUsername: '@AksharaGlobal_Bot',
      targetChannelOrChatId: '@akshara_official_alerts'
    }
  },
  {
    id: 'sms',
    name: 'National DLT SMS Gateway (Textlocal / Kaleyra)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '10 mins ago',
    credentials: {
      senderId: 'AKSHRA',
      apiKey: 'tx_live_891723...[DLT Principal ID 110156]'
    }
  },
  {
    id: 'email',
    name: 'Institutional Transactional Email (Amazon SES)',
    isEnabled: true,
    status: 'CONNECTED',
    lastPingTime: '1 min ago',
    credentials: {
      smtpHost: 'email-smtp.ap-south-1.amazonaws.com',
      smtpUser: 'AKIA...[DKIM & SPF Verified]'
    }
  }
];

export const initialCommTemplates: CommunicationTemplate[] = [
  {
    id: 'TMPL-WH-EXAM-EN',
    eventTrigger: 'EXAM_TIMETABLE',
    title: 'Exam Schedule Publication Notice',
    language: 'EN',
    channel: 'whatsapp',
    content: 'Dear {{parent_name}}, the official timetable for {{exam_name}} (Academic Year {{academic_year}}) for your ward {{student_name}} (Class: {{class_name}}) has been published. Exams commence on {{start_date}}. View full schedule and download hall ticket at: {{portal_url}} - Akshara Global Campus.',
    placeholders: ['parent_name', 'exam_name', 'academic_year', 'student_name', 'class_name', 'start_date', 'portal_url'],
    providerApproved: true
  },
  {
    id: 'TMPL-WH-EXAM-KN',
    eventTrigger: 'EXAM_TIMETABLE',
    title: 'ಪರೀಕ್ಷಾ ವೇಳಾಪಟ್ಟಿ ಪ್ರಕಟಣೆ (Kannada)',
    language: 'KN',
    channel: 'whatsapp',
    content: 'ಗೌರವಾನ್ವಿತ {{parent_name}} ಅವರೇ, ನಿಮ್ಮ ಮಗು {{student_name}} (ತರಗತಿ: {{class_name}}) ಅವರ {{exam_name}} ವೇಳಾಪಟ್ಟಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ. ಪರೀಕ್ಷೆಗಳು {{start_date}} ರಂದು ಪ್ರಾರಂಭವಾಗುತ್ತವೆ. ಪೂರ್ಣ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಇಲ್ಲಿ ವೀಕ್ಷಿಸಿ: {{portal_url}} - ಅಕ್ಷರ ಗ್ಲೋಬಲ್ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆ.',
    placeholders: ['parent_name', 'student_name', 'class_name', 'exam_name', 'start_date', 'portal_url'],
    providerApproved: true
  },
  {
    id: 'TMPL-WH-FEE-EN',
    eventTrigger: 'FEE_RECEIPT',
    title: 'Instant Fee Payment Receipt & Confirmation',
    language: 'EN',
    channel: 'whatsapp',
    content: 'Namaste {{parent_name}}, thank you for the payment of ₹{{amount_paid}} towards {{fee_heads}} for {{student_name}} (Adm: {{admission_no}}). Receipt No: {{receipt_no}} has been generated. Download authenticated receipt: {{receipt_link}}. Remaining Due Balance: ₹{{balance_due}}. - Accounts Dept, Akshara Global.',
    placeholders: ['parent_name', 'amount_paid', 'fee_heads', 'student_name', 'admission_no', 'receipt_no', 'receipt_link', 'balance_due'],
    providerApproved: true
  },
  {
    id: 'TMPL-TG-ABSENT-EN',
    eventTrigger: 'ATTENDANCE_ABSENT',
    title: 'Immediate Daily Absence Notification',
    language: 'EN',
    channel: 'telegram',
    content: '🔴 ATTENDANCE ALERT: Your ward {{student_name}} (Class {{class_name}}, Roll {{roll_no}}) is marked ABSENT today ({{current_date}}) during morning roll call. If this is unscheduled, please contact the Principal / Class Teacher immediately at {{contact_phone}}.',
    placeholders: ['student_name', 'class_name', 'roll_no', 'current_date', 'contact_phone'],
    providerApproved: true
  }
];

export const initialCommDeliveryLogs: CommunicationDeliveryLog[] = [
  {
    id: 'LOG-MSG-9901',
    recipientName: 'Ramesh Kumar',
    recipientContact: '+91 98450 12345',
    recipientRole: 'PARENT',
    channel: 'whatsapp',
    eventTrigger: 'FEE_RECEIPT',
    messageText: 'Payment of ₹50,000 confirmed for Rahul Kumar. Receipt REC-2026-00125 generated. Download: https://education-erp-nine.vercel.app/receipts/REC-2026-00125.pdf',
    status: 'READ',
    timestamp: '2026-11-04 11:42 AM',
    providerRefId: 'wamid.HBgLOTE5ODQ1MDEyMzQ1FQIAERgSMzQ5RT...[Verified by Meta]'
  },
  {
    id: 'LOG-MSG-9902',
    recipientName: 'Suresh Hegde',
    recipientContact: '+91 94480 87654',
    recipientRole: 'PARENT',
    channel: 'whatsapp',
    eventTrigger: 'EXAM_TIMETABLE',
    messageText: 'Timetable published for Unit Test 1 (Class I PUC PCMB). Ananya Hegde schedule verified. View portal link.',
    status: 'DELIVERED',
    timestamp: '2026-11-04 10:30 AM',
    providerRefId: 'wamid.HBgLOTE5NDQ4MDg3NjU0FQIAERgSODE2OT...[Delivered]'
  },
  {
    id: 'LOG-MSG-9903',
    recipientName: 'Class XII Physics Faculty & Students',
    recipientContact: '@akshara_official_alerts',
    recipientRole: 'STUDENT',
    channel: 'telegram',
    eventTrigger: 'PRACTICAL_SCHEDULE',
    messageText: 'Notice: Physics Practical Session on Optical Bench & Lenses scheduled tomorrow 9:30 AM in Raman Lab ST-204.',
    status: 'SENT',
    timestamp: '2026-11-04 09:15 AM',
    providerRefId: 'tg_msg_id_8912746'
  }
];

export const initialPlatformTenants: PlatformTenant[] = [
  {
    id: 'TEN-2026-001',
    name: 'Akshara Global Composite School & PU College',
    type: 'COMPOSITE_GROUP',
    state: 'Karnataka',
    city: 'Bengaluru',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    studentCount: 3450,
    staffCount: 184,
    mrrAmount: 95000,
    renewalDate: '2027-08-31',
    chairmanEmail: 'chairman@akshara.edu.in',
    activeCampuses: 3,
    customDomain: 'erp.akshara.edu.in',
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-002',
    name: 'Vishwa Vidyanikethan Public School',
    type: 'SCHOOL',
    state: 'Karnataka',
    city: 'Mysuru',
    plan: 'STANDARD',
    status: 'ACTIVE',
    studentCount: 1820,
    staffCount: 92,
    mrrAmount: 45000,
    renewalDate: '2027-05-15',
    chairmanEmail: 'director@vidyanikethan.org',
    activeCampuses: 1,
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-003',
    name: 'Sri Chaitanya National Pre-University College',
    type: 'PU_COLLEGE',
    state: 'Telangana',
    city: 'Hyderabad',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    studentCount: 5200,
    staffCount: 260,
    mrrAmount: 140000,
    renewalDate: '2027-11-30',
    chairmanEmail: 'mgmt@chaitanyapuc.edu',
    activeCampuses: 4,
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-004',
    name: 'Apex Institute of Science & Degree Commerce',
    type: 'DEGREE_COLLEGE',
    state: 'Maharashtra',
    city: 'Pune',
    plan: 'PRO',
    status: 'ACTIVE',
    studentCount: 2900,
    staffCount: 140,
    mrrAmount: 75000,
    renewalDate: '2027-04-30',
    chairmanEmail: 'principal@apexdegree.ac.in',
    activeCampuses: 2,
    consentSupportActive: false
  },
  {
    id: 'TEN-2026-005',
    name: 'Greenfield International Cambridge Academy',
    type: 'SCHOOL',
    state: 'Tamil Nadu',
    city: 'Chennai',
    plan: 'ENTERPRISE',
    status: 'TRIAL',
    studentCount: 850,
    staffCount: 65,
    mrrAmount: 0,
    renewalDate: '2026-11-20',
    chairmanEmail: 'founder@greenfield.edu',
    activeCampuses: 1,
    consentSupportActive: false
  }
];

export const initialSupportTickets: TechnicalSupportTicket[] = [
  {
    id: 'TKT-8902',
    tenantId: 'TEN-2026-001',
    tenantName: 'Akshara Global Composite School',
    category: 'DATABASE_MIGRATION',
    requestedScope: 'DIAGNOSTICS_ONLY',
    requestedDurationHours: 4,
    status: 'PENDING_INSTITUTION_APPROVAL',
    requestedAt: '2026-11-04 11:00 AM'
  },
  {
    id: 'TKT-8899',
    tenantId: 'TEN-2026-003',
    tenantName: 'Sri Chaitanya National PU College',
    category: 'WHATSAPP_INTEGRATION',
    requestedScope: 'CONFIG_INSPECTION',
    requestedDurationHours: 2,
    status: 'APPROVED_ACTIVE',
    requestedAt: '2026-11-04 09:30 AM',
    approvedByChairman: 'Dr. B.S. Rao (Chairman)',
    expiresAt: '2026-11-04 01:30 PM'
  }
];

export const initialProcurementItems: PlatformProcurementItem[] = [
  {
    id: 'PROC-01',
    serviceCategory: 'Cloud Virtual Servers & MicroVM Sandbox',
    vendor: 'Amazon Web Services (AWS Mumbai ap-south-1)',
    monthlyCost: 82000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2026-11-30'
  },
  {
    id: 'PROC-02',
    serviceCategory: 'WhatsApp Business Cloud API Messaging Gateway',
    vendor: 'Meta Platforms Inc. / WhatsApp Cloud Graph API',
    monthlyCost: 34500,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2026-11-30'
  },
  {
    id: 'PROC-03',
    serviceCategory: 'Managed High-Availability PostgreSQL 16 Cluster',
    vendor: 'Supabase / AWS RDS Multi-AZ PostgreSQL',
    monthlyCost: 48000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2026-12-15'
  },
  {
    id: 'PROC-04',
    serviceCategory: 'Edge CDN, DDoS Shield & SSL WAF Protection',
    vendor: 'Cloudflare Inc. (Enterprise Edge)',
    monthlyCost: 25000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2027-01-01'
  },
  {
    id: 'PROC-05',
    serviceCategory: 'Institutional Payment Gateway (UPI / NetBanking)',
    vendor: 'Razorpay Software Private Limited',
    monthlyCost: 15000,
    status: 'PRODUCTION_ACTIVE',
    renewalDate: '2027-06-30'
  }
];

export const initialAcademicSections: AcademicSectionModel[] = [
  // School - Class 6 with A, B, C, D
  { id: 'SEC-SCH-6A', academic_year: '2026-2027', course_level: 'School', class_name: 'Class 6', stream: 'General', section_code: 'A', room_number: 'Room S-101', max_capacity: 40, enrolled_count: 38, class_teacher_name: 'Mrs. Priya Sharma', status: 'ACTIVE' },
  { id: 'SEC-SCH-6B', academic_year: '2026-2027', course_level: 'School', class_name: 'Class 6', stream: 'General', section_code: 'B', room_number: 'Room S-102', max_capacity: 40, enrolled_count: 39, class_teacher_name: 'Mr. R. Raghavan', status: 'ACTIVE' },
  { id: 'SEC-SCH-6C', academic_year: '2026-2027', course_level: 'School', class_name: 'Class 6', stream: 'General', section_code: 'C', room_number: 'Room S-103', max_capacity: 40, enrolled_count: 36, class_teacher_name: 'Mrs. K. Malathi', status: 'ACTIVE' },
  { id: 'SEC-SCH-6D', academic_year: '2026-2027', course_level: 'School', class_name: 'Class 6', stream: 'General', section_code: 'D', room_number: 'Room S-104', max_capacity: 40, enrolled_count: 35, class_teacher_name: 'Mr. Arvind N.', status: 'ACTIVE' },

  // PU College - I PUC PCMB with six sections A, B, C, D, E, F
  { id: 'SEC-PUC-1A', academic_year: '2026-2027', course_level: 'PU College', class_name: 'I PUC', stream: 'PCMB', section_code: 'A', room_number: 'Hall ST-201', max_capacity: 50, enrolled_count: 48, class_teacher_name: 'Dr. V. Murthy (Physics)', status: 'ACTIVE' },
  { id: 'SEC-PUC-1B', academic_year: '2026-2027', course_level: 'PU College', class_name: 'I PUC', stream: 'PCMB', section_code: 'B', room_number: 'Hall ST-202', max_capacity: 50, enrolled_count: 49, class_teacher_name: 'Prof. S. Joshi (Chem)', status: 'ACTIVE' },
  { id: 'SEC-PUC-1C', academic_year: '2026-2027', course_level: 'PU College', class_name: 'I PUC', stream: 'PCMB', section_code: 'C', room_number: 'Hall ST-203', max_capacity: 50, enrolled_count: 47, class_teacher_name: 'Dr. Anita Deshmukh (Bio)', status: 'ACTIVE' },
  { id: 'SEC-PUC-1D', academic_year: '2026-2027', course_level: 'PU College', class_name: 'I PUC', stream: 'PCMB', section_code: 'D', room_number: 'Hall ST-204', max_capacity: 50, enrolled_count: 46, class_teacher_name: 'Prof. K. Venkatesh (Maths)', status: 'ACTIVE' },
  { id: 'SEC-PUC-1E', academic_year: '2026-2027', course_level: 'PU College', class_name: 'I PUC', stream: 'PCMB', section_code: 'E', room_number: 'Hall ST-205', max_capacity: 50, enrolled_count: 45, class_teacher_name: 'Mrs. S. Radhika', status: 'ACTIVE' },
  { id: 'SEC-PUC-1F', academic_year: '2026-2027', course_level: 'PU College', class_name: 'I PUC', stream: 'PCMB', section_code: 'F', room_number: 'Hall ST-206', max_capacity: 50, enrolled_count: 44, class_teacher_name: 'Mr. B. Chandrasekhar', status: 'ACTIVE' },

  // PU College - I PUC Commerce
  { id: 'SEC-PUC-COMM-A', academic_year: '2026-2027', course_level: 'PU College', class_name: 'I PUC', stream: 'Commerce', section_code: 'A', room_number: 'Hall C-101', max_capacity: 60, enrolled_count: 58, class_teacher_name: 'Prof. R. Ramanathan', status: 'ACTIVE' },

  // Degree College - B.Sc Computer Science
  { id: 'SEC-DEG-BSC-1', academic_year: '2026-2027', course_level: 'Degree College', class_name: 'B.Sc (CS)', stream: 'Computer Science', section_code: 'A', room_number: 'Block D-301', max_capacity: 45, enrolled_count: 42, class_teacher_name: 'Dr. Rajeshwari Patil', status: 'ACTIVE' }
];

export const initialStudentTransfers: StudentSectionTransferModel[] = [
  { id: 'TR-01', student_id: 'st-rahul', student_name: 'Rahul Kumar', admission_number: 'AKG-2026-0152', source_section: 'I PUC PCMB-B', target_section: 'I PUC PCMB-A', reason: 'Accommodated special practical batch & laboratory schedule', effective_date: '2026-07-15', approved_by: 'Principal Dr. V. Murthy', status: 'APPROVED' }
];

export const initialStaffDuties: StaffDutyAssignmentModel[] = [
  { id: 'DUTY-01', staff_id: 'EMP-PHY-01', staff_name: 'Dr. Ananya Sharma', duty_role: 'SUBJECT_TEACHER', class_name: 'I PUC', section_code: 'A', subject_code: 'PHY-101', subject_name: 'Physics', can_enter_marks: true, can_take_attendance: true, can_verify_marks: false, assigned_by: 'Principal', is_active: true },
  { id: 'DUTY-02', staff_id: 'EMP-PHY-01', staff_name: 'Dr. Ananya Sharma', duty_role: 'SUBJECT_TEACHER', class_name: 'I PUC', section_code: 'B', subject_code: 'PHY-101', subject_name: 'Physics', can_enter_marks: true, can_take_attendance: true, can_verify_marks: false, assigned_by: 'Principal', is_active: true },
  { id: 'DUTY-03', staff_id: 'EMP-OP-01', staff_name: 'Suresh Data Operator', duty_role: 'COMPUTER_OPERATOR', class_name: 'I PUC', section_code: 'A', subject_code: 'CHEM-102', subject_name: 'Chemistry', examination_title: 'Mid-Term Examination 2026', can_enter_marks: true, can_take_attendance: false, can_verify_marks: false, assigned_by: 'Controller of Examinations', is_active: true },
  { id: 'DUTY-04', staff_id: 'EMP-PRIN-01', staff_name: 'Dr. V. Murthy', duty_role: 'CLASS_TEACHER', class_name: 'I PUC', section_code: 'A', can_enter_marks: true, can_take_attendance: true, can_verify_marks: true, assigned_by: 'Chairman', is_active: true }
];

export const initialHallTickets: HallTicketModel[] = [
  {
    id: 'HT-2026-0152',
    ticket_number: 'HT-AKG-2026-0152',
    student_id: 'st-rahul',
    student_name: 'Rahul Kumar',
    admission_number: 'AKG-2026-0152',
    class_name: 'I PUC',
    section_code: 'A',
    exam_title: 'Mid-Term Institutional Examination 2026',
    exam_centre: 'Akshara Global Campus • Block B',
    room_number: 'Hall ST-201',
    seat_number: 'Seat #14',
    eligibility_status: 'ELIGIBLE',
    qr_code_signature: 'EDOS-VERIFIED-TICKET-AKG-0152-2026-VALID',
    timetable: [
      { subject: 'Physics (Theory + Practical)', date: '2026-11-24', time: '09:30 AM - 12:30 PM', room: 'Hall ST-201' },
      { subject: 'Chemistry (Theory + Practical)', date: '2026-11-26', time: '09:30 AM - 12:30 PM', room: 'Hall ST-201' },
      { subject: 'Mathematics (Theory)', date: '2026-11-28', time: '09:30 AM - 12:30 PM', room: 'Hall ST-201' },
      { subject: 'Biology (Theory + Practical)', date: '2026-11-30', time: '09:30 AM - 12:30 PM', room: 'Hall ST-201' }
    ]
  }
];

export const initialFeeSnapshots: ConsolidatedFeeReportSnapshotModel[] = [
  {
    id: 'SNAP-001',
    snapshot_code: 'FEE-SNAP-20261104-001',
    academic_year: '2026-2027',
    target_class: 'I PUC PCMB (All 6 Sections)',
    submitted_by_name: 'K. Narayana (Chief Accountant)',
    submitted_at: '2026-11-04 10:30 AM',
    total_students: 288,
    total_assigned: 14400000,
    total_concessions: 480000,
    net_payable: 13920000,
    total_collected: 11200000,
    total_outstanding: 2720000,
    collection_pct: 80.5,
    fully_paid: 210,
    partially_paid: 62,
    unpaid: 16,
    status: 'SUBMITTED',
    review_remarks: 'Submitted for Chairman quarterly review. Reconciled with Bank Cash Book.'
  }
];

const initialStudents: DemoStudent[] = [
  { id: 'st-rahul', admission_number: 'AKG-2026-0152', roll_number: '152', first_name: 'Rahul', last_name: 'Kumar', institution_level: 'PU College', class_name: 'I PUC', section_or_stream: 'PCMB (Science)', guardian_name: 'Ramesh Kumar', guardian_phone: '+91 98450 99887', fee_balance: 70000, attendance_pct: 94.2, status: 'ACTIVE' },
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
  CHAIRMAN_DIRECTOR: {
    view: true, create: true, edit: true, delete: true, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  DIRECTOR: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  MANAGING_DIRECTOR: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: true, reject: true, publish: true, export: true, print: true,
    assign: true, collect: true, refund: true, reconcile: true, configure: true,
    manage_users: true, manage_permissions: true
  },
  TRUSTEE: {
    view: true, create: false, edit: false, delete: false, archive: false, submit: false,
    verify: true, approve: true, reject: false, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: true, configure: false,
    manage_users: false, manage_permissions: false
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
  ADMISSION_OFFICER: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: true, reject: true, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  HR_MANAGER: {
    view: true, create: true, edit: true, delete: false, archive: true, submit: true,
    verify: true, approve: true, reject: false, publish: false, export: true, print: true,
    assign: true, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: true, manage_permissions: false
  },
  LECTURER: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: false, approve: false, reject: false, publish: false, export: false, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  LIBRARIAN: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: false, reject: false, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  HOSTEL_WARDEN: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: true, approve: true, reject: true, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  DRIVER: {
    view: true, create: false, edit: true, delete: false, archive: false, submit: true,
    verify: false, approve: false, reject: false, publish: false, export: false, print: false,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
    manage_users: false, manage_permissions: false
  },
  COMPUTER_OPERATOR: {
    view: true, create: true, edit: true, delete: false, archive: false, submit: true,
    verify: false, approve: false, reject: false, publish: false, export: true, print: true,
    assign: false, collect: false, refund: false, reconcile: false, configure: false,
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
    { id: 'platform-superadmin', label: 'Platform SaaS Command (1,000+ Tenancies)', iconName: 'ShieldAlert', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure', 'export'] },
    { id: 'laboratory', label: 'Laboratory & QR Inventory', iconName: 'FlaskConical', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', iconName: 'MessageSquare', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
  ],
  CHAIRMAN_DIRECTOR: [
    { id: 'dashboard', label: 'Chairman Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'institution-control-centre', label: 'Institution Control Centre', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'manage_users', 'configure'] },
    { id: 'permissions-centre', label: 'Central Permission Matrix', iconName: 'Key', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'assign', 'manage_permissions'] },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', iconName: 'Layout', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'configure'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve', 'publish'] },
    { id: 'fees', label: 'Fee Management & Collections', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'collect', 'reconcile', 'refund'] },
    { id: 'progress-cards', label: 'Student Progress Cards', iconName: 'FileCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export', 'print'] },
    { id: 'laboratory', label: 'Laboratory & QR Inventory', iconName: 'FlaskConical', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', iconName: 'MessageSquare', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'configure'] },
    { id: 'data-migration', label: 'Data Migration Centre', iconName: 'Upload', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'configure'] },
    { id: 'attendance', label: 'Campus Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Transport Fleet & GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'students', label: 'Students (SIS)', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit'] },
    { id: 'staff', label: 'Faculty & HR', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit'] },
    { id: 'timetable', label: 'Weekly Timetable', iconName: 'Clock', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'laboratory', label: 'Laboratory & QR Inventory', iconName: 'FlaskConical', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', iconName: 'MessageSquare', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  DIRECTOR: [
    { id: 'dashboard', label: 'Director Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export'] },
    { id: 'institution-control-centre', label: 'Institution Control Centre', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'manage_users'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'fees', label: 'Fee Management', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  MANAGING_DIRECTOR: [
    { id: 'dashboard', label: 'MD Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'institution-control-centre', label: 'Institution Control Centre', iconName: 'Shield', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'fees', label: 'Fee Management', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  TRUSTEE: [
    { id: 'dashboard', label: 'Trustee Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'fees', label: 'Trust Financial Reports', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
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
    { id: 'progress-cards', label: 'Student Progress Cards', iconName: 'FileCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'export', 'print'] },
    { id: 'laboratory', label: 'Laboratory & QR Inventory', iconName: 'FlaskConical', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify', 'approve'] },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', iconName: 'MessageSquare', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'configure'] },
    { id: 'fees', label: 'Fee Overview & Refunds', iconName: 'CreditCard', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'attendance', label: 'Daily Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'verify'] },
    { id: 'academics', label: 'Academic & Subjects', iconName: 'BookOpen', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
    { id: 'students', label: 'Students (SIS)', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'staff', label: 'Faculty & HR', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'timetable', label: 'Weekly Timetable', iconName: 'Clock', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Transport Fleet & GPS', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'admissions', label: 'Admissions Pipeline', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'approve'] },
    { id: 'data-migration', label: 'Data Migration Centre', iconName: 'Upload', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
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
  ADMISSION_OFFICER: [
    { id: 'dashboard', label: 'Admissions Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'admissions', label: 'Admissions Pipeline', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'approve'] },
    { id: 'students', label: 'Registered Students', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  HR_MANAGER: [
    { id: 'dashboard', label: 'HR Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'staff', label: 'Staff Directory & Leaves', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'approve'] },
  ],
  LECTURER: [
    { id: 'dashboard', label: 'Faculty Overview', iconName: 'GraduationCap', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'examinations', label: 'Marks Entry & Lab Practicals', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit', 'submit'] },
    { id: 'attendance', label: 'Class Attendance', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
    { id: 'timetable', label: 'Lecture Timetable', iconName: 'Clock', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  LIBRARIAN: [
    { id: 'dashboard', label: 'Library Overview', iconName: 'BookOpen', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'students', label: 'Student Book Circulation', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
  ],
  HOSTEL_WARDEN: [
    { id: 'dashboard', label: 'Hostel Overview', iconName: 'Building2', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'students', label: 'Boarder Directory', iconName: 'Users', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'attendance', label: 'Night Roll-Call', iconName: 'CalendarCheck', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
  ],
  DRIVER: [
    { id: 'dashboard', label: 'Trip Console', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'transport', label: 'Live Bus Route 104', iconName: 'Bus', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'edit'] },
  ],
  COMPUTER_OPERATOR: [
    { id: 'dashboard', label: 'Operator Workspace', iconName: 'Layers', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
    { id: 'marks-register', label: 'Marks Entry Register', iconName: 'FileSpreadsheet', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'create', 'edit', 'submit'] },
    { id: 'hall-tickets', label: 'Hall Tickets & Verification', iconName: 'QrCode', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view', 'print'] },
    { id: 'examinations', label: 'Examinations Lifecycle', iconName: 'Award', menuVisibility: 'SHOW', moduleAccess: 'ACCESSIBLE', presentationState: 'VISIBLE_ACCESSIBLE', actionPermissions: ['view'] },
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

// ---------------------------------------------------------------------------
// Seed Data: Acceptance Test (Rahul Kumar ₹50k + ₹30k Workflow)
// ---------------------------------------------------------------------------
const initialAcceptanceTestState: AcceptanceTestState = {
  stage: 'STAGE_2_PAID_30K',
  studentId: 'st-rahul',
  admissionNumber: 'AKG-2026-0152',
  studentName: 'Rahul Kumar',
  parentName: 'Ramesh Kumar',
  courseClass: 'I PUC',
  section: 'PCMB (Science)',
  academicYear: '2026-2027',
  isHostelResident: true,
  totalAnnualFee: 150000,
  totalPaid: 80000,
  totalBalanceDue: 70000,
  allocations: [
    {
      feeHeadId: 'fh-tuition-60',
      feeHeadName: 'Tuition Fee (I PUC PCMB)',
      category: 'Tuition',
      annualFee: 60000,
      term1Due: 35000,
      term2Due: 25000,
      paidAmount: 35000,
      balanceDue: 25000,
      status: 'PARTIAL'
    },
    {
      feeHeadId: 'fh-hostel-60',
      feeHeadName: 'Hostel & Residential Dining',
      category: 'Hostel',
      annualFee: 60000,
      term1Due: 30000,
      term2Due: 30000,
      paidAmount: 30000,
      balanceDue: 30000,
      status: 'PARTIAL'
    },
    {
      feeHeadId: 'fh-books-20',
      feeHeadName: 'Books & NEET Study Materials',
      category: 'Books',
      annualFee: 20000,
      term1Due: 20000,
      term2Due: 0,
      paidAmount: 15000,
      balanceDue: 5000,
      status: 'PARTIAL'
    },
    {
      feeHeadId: 'fh-transport-10',
      feeHeadName: 'Campus Transport Route 104',
      category: 'Transport',
      annualFee: 10000,
      term1Due: 5000,
      term2Due: 5000,
      paidAmount: 0,
      balanceDue: 10000,
      status: 'UNPAID'
    }
  ],
  generatedReceipts: [
    {
      id: 'rcp-rahul-1',
      receipt_number: 'REC-2026-00125',
      invoice_id: 'inv-rahul-annual',
      invoice_number: 'INV-2026-0152',
      student_id: 'st-rahul',
      student_name: 'Rahul Kumar',
      parent_name: 'Ramesh Kumar',
      admission_number: 'AKG-2026-0152',
      class_name: 'I PUC - PCMB',
      academic_year: '2026-2027',
      term_code: 'TERM_1',
      term_name: 'Term 1 / Instalment 1',
      amount_paid: 50000,
      previous_balance: 150000,
      current_balance: 100000,
      payment_method: 'NEFT / RTGS' as any,
      transaction_reference: 'TXN-HDFC-9823410',
      payment_date: '2026-07-10 10:15 AM',
      collected_by: 'K. S. Narayana (Accountant)',
      amount_in_words: 'Fifty Thousand Rupees Only',
      allocations: [
        { head: 'TUITION', title: 'Tuition Fee (I PUC PCMB)', allocated: 20000, remaining: 40000 },
        { head: 'HOSTEL', title: 'Hostel & Residential Dining', allocated: 20000, remaining: 40000 },
        { head: 'BOOKS', title: 'Books & NEET Study Materials', allocated: 10000, remaining: 10000 }
      ],
      institution_branding: {
        institution_name: 'Akshara Global Educational Institutions',
        affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
        address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
        phone: '+91 80 2345 6789',
        email: 'accounts@akshara.erp.in',
        receipt_header_note: 'Official First Instalment Fee Receipt - Verified Bank Transfer'
      },
      qr_verification_code: 'VERIFY:RECEIPT:REC-2026-00125:AKG-2026-0152:50000',
      reprint_count: 0,
      is_duplicate: false,
      status: 'CONFIRMED',
      notes: 'First Instalment: Tuition ₹20k, Hostel ₹20k, Books ₹10k'
    },
    {
      id: 'rcp-rahul-2',
      receipt_number: 'REC-2026-00126',
      invoice_id: 'inv-rahul-annual',
      invoice_number: 'INV-2026-0152',
      student_id: 'st-rahul',
      student_name: 'Rahul Kumar',
      parent_name: 'Ramesh Kumar',
      admission_number: 'AKG-2026-0152',
      class_name: 'I PUC - PCMB',
      academic_year: '2026-2027',
      term_code: 'TERM_2',
      term_name: 'Term 2 / Instalment 2',
      amount_paid: 30000,
      previous_balance: 100000,
      current_balance: 70000,
      payment_method: 'UPI' as any,
      transaction_reference: 'TXN-UPI-771829',
      payment_date: '2026-10-18 11:45 AM',
      collected_by: 'K. S. Narayana (Accountant)',
      amount_in_words: 'Thirty Thousand Rupees Only',
      allocations: [
        { head: 'TUITION', title: 'Tuition Fee (I PUC PCMB)', allocated: 15000, remaining: 25000 },
        { head: 'HOSTEL', title: 'Hostel & Residential Dining', allocated: 10000, remaining: 30000 },
        { head: 'BOOKS', title: 'Books & NEET Study Materials', allocated: 5000, remaining: 5000 }
      ],
      institution_branding: {
        institution_name: 'Akshara Global Educational Institutions',
        affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
        address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
        phone: '+91 80 2345 6789',
        email: 'accounts@akshara.erp.in',
        receipt_header_note: 'Official Second Instalment Fee Receipt - Verified Digital Payment'
      },
      qr_verification_code: 'VERIFY:RECEIPT:REC-2026-00126:AKG-2026-0152:30000',
      reprint_count: 0,
      is_duplicate: false,
      status: 'CONFIRMED',
      notes: 'Second Instalment: Tuition ₹15k, Hostel ₹10k, Books ₹5k'
    }
  ]
};

const initialIndividualProgressCards: IndividualProgressCard[] = [
  {
    id: 'pc-rahul-ut1',
    studentId: 'st-rahul',
    studentName: 'Rahul Kumar',
    admissionNumber: 'AKG-2026-0152',
    className: 'I PUC (PCMB Science)',
    examName: 'Unit Test 1 (Formative Assessment)',
    examCategory: 'Unit Test',
    academicYear: '2026-2027',
    attendancePct: 94.2,
    subjects: [
      { subjectName: 'Physics (Theory + Practical)', theoryMax: 70, theoryObtained: 68, practicalMax: 30, practicalObtained: 28, totalMax: 100, totalObtained: 96, grade: 'A+', remarks: 'Exceptional conceptual clarity in Mechanics' },
      { subjectName: 'Chemistry (Theory + Practical)', theoryMax: 70, theoryObtained: 65, practicalMax: 30, practicalObtained: 29, totalMax: 100, totalObtained: 94, grade: 'A+', remarks: 'Excellent laboratory titration technique' },
      { subjectName: 'Mathematics', theoryMax: 100, theoryObtained: 92, practicalMax: 0, practicalObtained: 0, totalMax: 100, totalObtained: 92, grade: 'A+', remarks: 'Rapid problem solving in Calculus' },
      { subjectName: 'Biology (Botany + Zoology)', theoryMax: 70, theoryObtained: 63, practicalMax: 30, practicalObtained: 28, totalMax: 100, totalObtained: 91, grade: 'A+', remarks: 'Precise anatomical diagram labeling' },
    ],
    totalMax: 400,
    totalObtained: 373,
    overallPercentage: 93.25,
    overallGrade: 'A+ (Distinction)',
    teacherRemarks: 'Rahul displays top-tier academic aptitude and disciplined laboratory technique. Highly recommended for Advanced NEET Foundation coaching.',
    approvalStatus: 'VERIFIED_AND_SEALED',
    controllerVerifiedBy: 'Prof. S. Joshi (Controller of Examinations)',
    principalApprovedBy: 'Dr. Ramesh Kumar (Principal)',
    publishedAt: '2026-11-02 14:30 IST',
    qrPayload: 'VERIFY:PROGRESS_CARD:AKG-2026-0152:UT1:373:400:DISTINCTION'
  }
];

const initialConsolidatedCards: ConsolidatedAcademicProgressCard[] = [
  {
    id: 'cpc-rahul',
    studentId: 'st-rahul',
    studentName: 'Rahul Kumar',
    admissionNumber: 'AKG-2026-0152',
    className: 'I PUC (PCMB Science)',
    academicYear: '2026-2027',
    overallGpa: '9.4 / 10.0',
    yearlyPercentage: 85.0,
    overallAttendancePct: 94.2,
    practicalProficiencyPct: 95.0,
    assignmentsScore: '19 / 20',
    trajectoryTrend: [
      { examName: 'Weekly Test 1', percentage: 72.0, date: '2026-07-20' },
      { examName: 'Unit Test 1', percentage: 78.5, date: '2026-08-25' },
      { examName: 'Quarterly Exam', percentage: 81.0, date: '2026-09-30' },
      { examName: 'Half-Yearly Exam', percentage: 85.0, date: '2026-10-28' },
    ],
    netGainPercentagePoints: 13.0,
    subjectSummary: [
      { subject: 'Physics', annualAvg: 88.5, grade: 'A', trend: 'RISING' },
      { subject: 'Chemistry', annualAvg: 86.0, grade: 'A', trend: 'RISING' },
      { subject: 'Mathematics', annualAvg: 82.5, grade: 'A', trend: 'RISING' },
      { subject: 'Biology', annualAvg: 84.0, grade: 'A', trend: 'CONSISTENT' },
    ]
  }
];

const initialCompetitiveReports: CompetitiveFoundationReport[] = [
  {
    id: 'comp-rahul-1',
    studentId: 'st-rahul',
    studentName: 'Rahul Kumar',
    admissionNumber: 'AKG-2026-0152',
    programme: 'NEET Foundation (PCMB)',
    testName: 'All-Karnataka Pre-NEET Foundation Mock Test 3',
    totalQuestions: 180,
    totalMarks: 720,
    correctAnswers: 152,
    correctMarks: 608,
    incorrectAnswers: 18,
    negativeMarks: -18,
    unattemptedQuestions: 10,
    netScore: 590,
    accuracyPct: 89.4,
    percentileEstimate: 98.6,
    subjectBreakdown: [
      { subject: 'Physics', questions: 45, correct: 38, incorrect: 5, netMarks: 147, accuracyPct: 88.4 },
      { subject: 'Chemistry', questions: 45, correct: 40, incorrect: 3, netMarks: 157, accuracyPct: 93.0 },
      { subject: 'Botany', questions: 45, correct: 37, incorrect: 5, netMarks: 143, accuracyPct: 88.1 },
      { subject: 'Zoology', questions: 45, correct: 37, incorrect: 5, netMarks: 143, accuracyPct: 88.1 },
    ]
  }
];

const initialMigrationBatches: MigrationBatch[] = [
  {
    id: 'mb-2026-01',
    fileName: 'Legacy_School_Master_Roll_2026.xlsx',
    fileFormat: 'XLSX',
    uploadedAt: '2026-11-04 08:30 IST',
    totalRecords: 1240,
    exactMatchesCount: 12,
    probableMatchesCount: 8,
    cleanNewRecordsCount: 1220,
    status: 'ANALYZED',
    columnMappings: [
      { sourceHeader: 'Adm No', targetField: 'admission_number', confidence: 0.99, sampleValue: 'AKG-2026-0981' },
      { sourceHeader: 'Pupil Name', targetField: 'student_name', confidence: 0.98, sampleValue: 'Deepak Rao' },
      { sourceHeader: 'Std / Div', targetField: 'class_section', confidence: 0.96, sampleValue: 'I PUC - PCMC' },
      { sourceHeader: 'Father Mobile', targetField: 'guardian_phone', confidence: 0.97, sampleValue: '+91 98451 22334' },
      { sourceHeader: 'Fee Opening Balance', targetField: 'opening_balance', confidence: 0.95, sampleValue: '₹14,500' },
    ],
    duplicateCandidates: [
      {
        id: 'dup-1',
        sourceRow: 14,
        sourceAdmissionNo: 'ADM-2026-001',
        sourceName: 'Aarav Sharma',
        sourcePhone: '+91 98450 12345',
        matchType: 'EXACT_DUPLICATE',
        existingRecordName: 'Aarav Sharma (Class 10-A)',
        existingAdmissionNo: 'ADM-2026-001',
        recommendedAction: 'SKIP',
        resolvedAction: 'SKIP'
      },
      {
        id: 'dup-2',
        sourceRow: 28,
        sourceAdmissionNo: 'ADM-2026-002',
        sourceName: 'Ananya V. Hegde',
        sourcePhone: '+91 98450 23456',
        matchType: 'PROBABLE_MATCH',
        existingRecordName: 'Ananya Hegde (I PUC)',
        existingAdmissionNo: 'ADM-2026-002',
        recommendedAction: 'MERGE',
        resolvedAction: 'MERGE'
      }
    ]
  }
];

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

  // Acceptance test and enhanced suites
  acceptanceTestState: initialAcceptanceTestState,
  individualProgressCards: initialIndividualProgressCards,
  consolidatedProgressCards: initialConsolidatedCards,
  competitiveReports: initialCompetitiveReports,
  migrationBatches: initialMigrationBatches,

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
      laboratories: initialLaboratories,
      labInventory: initialLabInventory,
      labMovements: initialLabMovements,
      labExperiments: initialLabExperiments,
      activeLabFilter: 'ALL',
      commChannels: initialCommChannels,
      commTemplates: initialCommTemplates,
      commDeliveryLogs: initialCommDeliveryLogs,
      commAutoTriggers: {
        'EXAM_TIMETABLE': true,
        'EXAM_RESULT': true,
        'FEE_RECEIPT': true,
        'FEE_DUE': true,
        'ATTENDANCE_ABSENT': true,
        'PRACTICAL_SCHEDULE': true
      },
      platformTenants: initialPlatformTenants,
      supportTickets: initialSupportTickets,
      procurementItems: initialProcurementItems,
      activeSubscriptionPlan: 'ENTERPRISE',
      academicSections: initialAcademicSections,
      studentTransfers: initialStudentTransfers,
      staffDuties: initialStaffDuties,
      hallTickets: initialHallTickets,
      feeSnapshots: initialFeeSnapshots,

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

  // Acceptance Test Actions for Rahul Kumar
  runAcceptanceTestPayment1: () => {
    const r1: DemoFeeReceipt = {
      id: `rcp-rahul-${Date.now()}-1`,
      receipt_number: 'REC-2026-00125',
      invoice_id: 'inv-rahul-annual',
      invoice_number: 'INV-2026-0152',
      student_id: 'st-rahul',
      student_name: 'Rahul Kumar',
      parent_name: 'Ramesh Kumar',
      admission_number: 'AKG-2026-0152',
      class_name: 'I PUC - PCMB',
      academic_year: '2026-2027',
      term_code: 'TERM_1',
      term_name: 'Term 1 / Instalment 1',
      amount_paid: 50000,
      previous_balance: 150000,
      current_balance: 100000,
      payment_method: 'NEFT / RTGS' as any,
      transaction_reference: 'TXN-HDFC-9823410',
      payment_date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      collected_by: 'K. S. Narayana (Accountant)',
      amount_in_words: 'Fifty Thousand Rupees Only',
      allocations: [
        { head: 'TUITION', title: 'Tuition Fee (I PUC PCMB)', allocated: 20000, remaining: 40000 },
        { head: 'HOSTEL', title: 'Hostel & Residential Dining', allocated: 20000, remaining: 40000 },
        { head: 'BOOKS', title: 'Books & NEET Study Materials', allocated: 10000, remaining: 10000 }
      ],
      institution_branding: {
        institution_name: 'Akshara Global Educational Institutions',
        affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
        address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
        phone: '+91 80 2345 6789',
        email: 'accounts@akshara.erp.in',
        receipt_header_note: 'Official First Instalment Fee Receipt - Verified Bank Transfer'
      },
      qr_verification_code: 'VERIFY:RECEIPT:REC-2026-00125:AKG-2026-0152:50000',
      reprint_count: 0,
      is_duplicate: false,
      status: 'CONFIRMED',
      notes: 'First Instalment: Tuition ₹20k, Hostel ₹20k, Books ₹10k'
    };

    set((state) => ({
      acceptanceTestState: {
        ...state.acceptanceTestState,
        stage: 'STAGE_1_PAID_50K',
        totalPaid: 50000,
        totalBalanceDue: 100000,
        allocations: [
          { feeHeadId: 'fh-tuition-60', feeHeadName: 'Tuition Fee (I PUC PCMB)', category: 'Tuition', annualFee: 60000, term1Due: 35000, term2Due: 25000, paidAmount: 20000, balanceDue: 40000, status: 'PARTIAL' },
          { feeHeadId: 'fh-hostel-60', feeHeadName: 'Hostel & Residential Dining', category: 'Hostel', annualFee: 60000, term1Due: 30000, term2Due: 30000, paidAmount: 20000, balanceDue: 40000, status: 'PARTIAL' },
          { feeHeadId: 'fh-books-20', feeHeadName: 'Books & NEET Study Materials', category: 'Books', annualFee: 20000, term1Due: 20000, term2Due: 0, paidAmount: 10000, balanceDue: 10000, status: 'PARTIAL' },
          { feeHeadId: 'fh-transport-10', feeHeadName: 'Campus Transport Route 104', category: 'Transport', annualFee: 10000, term1Due: 5000, term2Due: 5000, paidAmount: 0, balanceDue: 10000, status: 'UNPAID' }
        ],
        generatedReceipts: [r1]
      },
      receipts: [r1, ...state.receipts]
    }));
    return r1;
  },

  runAcceptanceTestPayment2: () => {
    const existingR1 = get().acceptanceTestState.generatedReceipts.find(r => r.receipt_number === 'REC-2026-00125') || get().acceptanceTestState.generatedReceipts[0];
    const r2: DemoFeeReceipt = {
      id: `rcp-rahul-${Date.now()}-2`,
      receipt_number: 'REC-2026-00126',
      invoice_id: 'inv-rahul-annual',
      invoice_number: 'INV-2026-0152',
      student_id: 'st-rahul',
      student_name: 'Rahul Kumar',
      parent_name: 'Ramesh Kumar',
      admission_number: 'AKG-2026-0152',
      class_name: 'I PUC - PCMB',
      academic_year: '2026-2027',
      term_code: 'TERM_2',
      term_name: 'Term 2 / Instalment 2',
      amount_paid: 30000,
      previous_balance: 100000,
      current_balance: 70000,
      payment_method: 'UPI' as any,
      transaction_reference: 'TXN-UPI-771829',
      payment_date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      collected_by: 'K. S. Narayana (Accountant)',
      amount_in_words: 'Thirty Thousand Rupees Only',
      allocations: [
        { head: 'TUITION', title: 'Tuition Fee (I PUC PCMB)', allocated: 15000, remaining: 25000 },
        { head: 'HOSTEL', title: 'Hostel & Residential Dining', allocated: 10000, remaining: 30000 },
        { head: 'BOOKS', title: 'Books & NEET Study Materials', allocated: 5000, remaining: 5000 }
      ],
      institution_branding: {
        institution_name: 'Akshara Global Educational Institutions',
        affiliation: 'CBSE Affiliation # 830192 | Karnataka State Pre-University Board',
        address: 'Campus Ground, 80 Feet Road, Bengaluru, Karnataka - 560085',
        phone: '+91 80 2345 6789',
        email: 'accounts@akshara.erp.in',
        receipt_header_note: 'Official Second Instalment Fee Receipt - Verified Digital Payment'
      },
      qr_verification_code: 'VERIFY:RECEIPT:REC-2026-00126:AKG-2026-0152:30000',
      reprint_count: 0,
      is_duplicate: false,
      status: 'CONFIRMED',
      notes: 'Second Instalment: Tuition ₹15k, Hostel ₹10k, Books ₹5k'
    };

    set((state) => ({
      acceptanceTestState: {
        ...state.acceptanceTestState,
        stage: 'STAGE_2_PAID_30K',
        totalPaid: 80000,
        totalBalanceDue: 70000,
        allocations: [
          { feeHeadId: 'fh-tuition-60', feeHeadName: 'Tuition Fee (I PUC PCMB)', category: 'Tuition', annualFee: 60000, term1Due: 35000, term2Due: 25000, paidAmount: 35000, balanceDue: 25000, status: 'PARTIAL' },
          { feeHeadId: 'fh-hostel-60', feeHeadName: 'Hostel & Residential Dining', category: 'Hostel', annualFee: 60000, term1Due: 30000, term2Due: 30000, paidAmount: 30000, balanceDue: 30000, status: 'PARTIAL' },
          { feeHeadId: 'fh-books-20', feeHeadName: 'Books & NEET Study Materials', category: 'Books', annualFee: 20000, term1Due: 20000, term2Due: 0, paidAmount: 15000, balanceDue: 5000, status: 'PARTIAL' },
          { feeHeadId: 'fh-transport-10', feeHeadName: 'Campus Transport Route 104', category: 'Transport', annualFee: 10000, term1Due: 5000, term2Due: 5000, paidAmount: 0, balanceDue: 10000, status: 'UNPAID' }
        ],
        generatedReceipts: existingR1 ? [existingR1, r2] : [r2]
      },
      receipts: [r2, ...state.receipts]
    }));
    return r2;
  },

  resetAcceptanceTest: () => {
    set((state) => ({
      acceptanceTestState: {
        stage: 'INITIAL',
        studentId: 'st-rahul',
        admissionNumber: 'AKG-2026-0152',
        studentName: 'Rahul Kumar',
        parentName: 'Ramesh Kumar',
        courseClass: 'I PUC',
        section: 'PCMB (Science)',
        academicYear: '2026-2027',
        isHostelResident: true,
        totalAnnualFee: 150000,
        totalPaid: 0,
        totalBalanceDue: 150000,
        allocations: [
          { feeHeadId: 'fh-tuition-60', feeHeadName: 'Tuition Fee (I PUC PCMB)', category: 'Tuition', annualFee: 60000, term1Due: 35000, term2Due: 25000, paidAmount: 0, balanceDue: 60000, status: 'UNPAID' },
          { feeHeadId: 'fh-hostel-60', feeHeadName: 'Hostel & Residential Dining', category: 'Hostel', annualFee: 60000, term1Due: 30000, term2Due: 30000, paidAmount: 0, balanceDue: 60000, status: 'UNPAID' },
          { feeHeadId: 'fh-books-20', feeHeadName: 'Books & NEET Study Materials', category: 'Books', annualFee: 20000, term1Due: 20000, term2Due: 0, paidAmount: 0, balanceDue: 20000, status: 'UNPAID' },
          { feeHeadId: 'fh-transport-10', feeHeadName: 'Campus Transport Route 104', category: 'Transport', annualFee: 10000, term1Due: 5000, term2Due: 5000, paidAmount: 0, balanceDue: 10000, status: 'UNPAID' }
        ],
        generatedReceipts: []
      }
    }));
  },

  getStudentConsolidatedStatement: (studentId) => {
    const { acceptanceTestState, students, invoices, receipts } = get();
    if (studentId === 'st-rahul') {
      return {
        studentId: acceptanceTestState.studentId,
        admissionNumber: acceptanceTestState.admissionNumber,
        studentName: acceptanceTestState.studentName,
        parentName: acceptanceTestState.parentName,
        courseClass: acceptanceTestState.courseClass,
        sectionOrStream: acceptanceTestState.section,
        academicYear: acceptanceTestState.academicYear,
        isHostelResident: acceptanceTestState.isHostelResident,
        totalAnnualFee: acceptanceTestState.totalAnnualFee,
        totalPaid: acceptanceTestState.totalPaid,
        totalBalanceDue: acceptanceTestState.totalBalanceDue,
        paymentStatus: acceptanceTestState.totalBalanceDue === 0 ? 'PAID' : acceptanceTestState.totalPaid > 0 ? 'PARTIAL' : 'UNPAID',
        feeHeads: acceptanceTestState.allocations,
        receiptHistory: acceptanceTestState.generatedReceipts
      };
    }

    const st = students.find(s => s.id === studentId) || students[0];
    const stInvoices = invoices.filter(inv => inv.student_name.includes(st.first_name));
    const stReceipts = receipts.filter(r => r.student_name.includes(st.first_name));
    const totalExp = stInvoices.reduce((sum, i) => sum + i.total_amount, 0) || 50000;
    const totalPd = stInvoices.reduce((sum, i) => sum + i.paid_amount, 0) || 35000;
    const totalBal = totalExp - totalPd;

    return {
      studentId: st.id,
      admissionNumber: st.admission_number,
      studentName: `${st.first_name} ${st.last_name}`,
      parentName: st.guardian_name,
      courseClass: st.class_name,
      sectionOrStream: st.section_or_stream,
      academicYear: '2026-2027',
      isHostelResident: false,
      totalAnnualFee: totalExp,
      totalPaid: totalPd,
      totalBalanceDue: totalBal,
      paymentStatus: totalBal <= 0 ? 'PAID' : totalPd > 0 ? 'PARTIAL' : 'UNPAID',
      feeHeads: [
        { feeHeadId: 'fh-1', feeHeadName: 'Tuition Fee', category: 'Tuition', annualFee: totalExp * 0.7, term1Due: totalExp * 0.35, term2Due: totalExp * 0.35, paidAmount: totalPd * 0.7, balanceDue: (totalExp - totalPd) * 0.7, status: 'PARTIAL' },
        { feeHeadId: 'fh-2', feeHeadName: 'Laboratory & Library', category: 'Laboratory', annualFee: totalExp * 0.3, term1Due: totalExp * 0.15, term2Due: totalExp * 0.15, paidAmount: totalPd * 0.3, balanceDue: (totalExp - totalPd) * 0.3, status: 'PARTIAL' },
      ],
      receiptHistory: stReceipts
    };
  },

  resolveMigrationCandidate: (batchId, candidateId, resolution) => {
    set((state) => ({
      migrationBatches: state.migrationBatches.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          duplicateCandidates: b.duplicateCandidates.map(c => 
            c.id === candidateId ? { ...c, resolvedAction: resolution } : c
          )
        };
      })
    }));
  },

  
  // Laboratory Management Implementation

  setActiveLabFilter: (labId) => set({ activeLabFilter: labId }),

  addLabItem: (item) => {
    set((state) => ({
      labInventory: [item, ...state.labInventory],
      laboratories: state.laboratories.map(lab => 
        lab.id === item.labId 
          ? { ...lab, totalItems: lab.totalItems + 1, inventoryValue: lab.inventoryValue + item.totalValue }
          : lab
      )
    }));
  },

  issueLabItem: (itemId, quantity, requestedBy, purpose) => {
    const item = get().labInventory.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found in laboratory inventory.' };
    if (item.currentStock < quantity) {
      return { success: false, message: `Insufficient stock! Requested ${quantity} ${item.unit}, but only ${item.currentStock} are available.` };
    }

    const newStock = item.currentStock - quantity;
    const movement: LabStockMovement = {
      id: `MOV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      itemId: item.id,
      itemName: item.name,
      type: 'ISSUE',
      quantity,
      unit: item.unit,
      performedBy: 'K. Suresh (Senior Lab Tech)',
      requestedBy,
      purpose,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      balanceAfter: newStock
    };

    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, currentStock: newStock, totalValue: newStock * i.unitPrice } : i
      ),
      labMovements: [movement, ...state.labMovements]
    }));

    return {
      success: true,
      message: `Successfully issued ${quantity} ${item.unit} of '${item.name}' to ${requestedBy}. Remaining balance: ${newStock} ${item.unit}.`
    };
  },

  returnLabItem: (itemId, returnedQuantity, consumedQuantity) => {
    const item = get().labInventory.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found in laboratory inventory.' };

    const newStock = item.currentStock + returnedQuantity;
    const movement: LabStockMovement = {
      id: `MOV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
      itemId: item.id,
      itemName: item.name,
      type: consumedQuantity > 0 ? 'CONSUMPTION' : 'RETURN',
      quantity: returnedQuantity > 0 ? returnedQuantity : consumedQuantity,
      unit: item.unit,
      performedBy: 'K. Suresh (Senior Lab Tech)',
      requestedBy: 'Faculty Return Custody',
      purpose: consumedQuantity > 0 ? `Practical session usage (${consumedQuantity} consumed, ${returnedQuantity} returned)` : 'Post-practical return to cabinet',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      balanceAfter: newStock
    };

    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, currentStock: newStock, totalValue: newStock * i.unitPrice } : i
      ),
      labMovements: [movement, ...state.labMovements]
    }));

    return {
      success: true,
      message: `Return recorded for '${item.name}'. Restocked: ${returnedQuantity} ${item.unit}. Current available: ${newStock} ${item.unit}.`
    };
  },

  recordMaintenance: (itemId, nextCalibration, condition) => {
    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, condition, lastVerifiedDate: new Date().toISOString().split('T')[0] } : i
      )
    }));
  },

  verifyPhysicalStock: (itemId, countedQty) => {
    const item = get().labInventory.find(i => i.id === itemId);
    if (!item) return { discrepancy: 0, status: 'NOT_FOUND' };
    const discrepancy = countedQty - item.currentStock;
    set((state) => ({
      labInventory: state.labInventory.map(i => 
        i.id === itemId ? { ...i, currentStock: countedQty, totalValue: countedQty * i.unitPrice, lastVerifiedDate: new Date().toISOString().split('T')[0] } : i
      )
    }));
    return {
      discrepancy,
      status: discrepancy === 0 ? 'VERIFIED_MATCH' : discrepancy < 0 ? 'SHORTAGE_FLAGGED' : 'SURPLUS_FLAGGED'
    };
  },

  // Multi-Channel Communication Hub Implementation

  updateChannelConfig: (channelId, partial) => {
    set((state) => ({
      commChannels: state.commChannels.map(c => 
        c.id === channelId ? { ...c, ...partial } : c
      )
    }));
  },

  testChannelConnection: (channelId) => {
    const channel = get().commChannels.find(c => c.id === channelId);
    if (!channel) return { success: false, latencyMs: 0, message: 'Channel not configured.' };

    const latency = Math.floor(80 + Math.random() * 80);
    set((state) => ({
      commChannels: state.commChannels.map(c => 
        c.id === channelId 
          ? { ...c, status: 'CONNECTED', lastPingTime: `Just now (Latency: ${latency}ms)` } 
          : c
      )
    }));

    const details = channelId === 'whatsapp' 
      ? 'Meta Graph API v19.0 Authenticated • Verified Phone Number ID: ' + (channel.credentials.phoneNumberId || '109283746152840')
      : channelId === 'telegram'
      ? 'Telegram Bot API 7.0 Authenticated • @AksharaGlobal_Bot Webhook OK'
      : 'Provider Gateway Connected Successfully';

    return {
      success: true,
      latencyMs: latency,
      message: `[200 OK] ${details}`
    };
  },

  toggleAutoTrigger: (triggerKey) => {
    set((state) => ({
      commAutoTriggers: {
        ...state.commAutoTriggers,
        [triggerKey]: !state.commAutoTriggers[triggerKey]
      }
    }));
  },

  dispatchCommunicationMessage: (payload) => {
    const newLog: CommunicationDeliveryLog = {
      id: `LOG-MSG-${String(Math.floor(1000 + Math.random() * 9000))}`,
      recipientName: payload.recipientName,
      recipientContact: payload.recipientContact,
      recipientRole: payload.recipientRole,
      channel: payload.channel,
      eventTrigger: payload.eventTrigger,
      messageText: payload.messageText,
      status: 'SENT',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      providerRefId: `live_ref_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    set((state) => ({
      commDeliveryLogs: [newLog, ...state.commDeliveryLogs]
    }));

    // Simulate instant delivery acknowledgement
    setTimeout(() => {
      set((state) => ({
        commDeliveryLogs: state.commDeliveryLogs.map(l => 
          l.id === newLog.id ? { ...l, status: 'DELIVERED' } : l
        )
      }));
    }, 1200);

    return newLog;
  },

  // Central Platform Super Admin Implementation

  setActiveSubscriptionPlan: (plan) => set({ activeSubscriptionPlan: plan }),

  provisionNewTenant: (payload) => {
    const newId = `TEN-2026-${String(Math.floor(10 + Math.random() * 90)).padStart(3, '0')}`;
    const newTenant: PlatformTenant = {
      id: newId,
      name: payload.name,
      type: payload.type,
      state: payload.state,
      city: payload.city,
      plan: payload.plan,
      status: 'ACTIVE',
      studentCount: 0,
      staffCount: 0,
      mrrAmount: payload.plan === 'ENTERPRISE' ? 120000 : payload.plan === 'PRO' ? 70000 : 35000,
      renewalDate: '2027-11-04',
      chairmanEmail: `admin@${payload.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
      activeCampuses: 1,
      consentSupportActive: false
    };

    const activationLink = `https://education-erp-nine.vercel.app/claim-institution?token=act_${Math.random().toString(36).substring(2, 15)}&tenant=${newId}`;

    set((state) => ({
      platformTenants: [newTenant, ...state.platformTenants]
    }));

    return {
      tenant: newTenant,
      activationLink
    };
  },

  approveSupportAccess: (ticketId, approvedBy) => {
    const ticket = get().supportTickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found.' };

    const expiresAt = new Date(Date.now() + ticket.requestedDurationHours * 3600 * 1000).toLocaleTimeString();

    set((state) => ({
      supportTickets: state.supportTickets.map(t => 
        t.id === ticketId 
          ? { ...t, status: 'APPROVED_ACTIVE', approvedByChairman: approvedBy, expiresAt } 
          : t
      ),
      platformTenants: state.platformTenants.map(tn => 
        tn.id === ticket.tenantId ? { ...tn, consentSupportActive: true } : tn
      )
    }));

    return {
      success: true,
      message: `Consent granted by ${approvedBy}. Scoped support access is active for ${ticket.requestedDurationHours} hours (Expires: ${expiresAt}).`
    };
  },

  revokeSupportAccess: (ticketId) => {
    const ticket = get().supportTickets.find(t => t.id === ticketId);
    set((state) => ({
      supportTickets: state.supportTickets.map(t => 
        t.id === ticketId ? { ...t, status: 'EXPIRED' } : t
      ),
      platformTenants: state.platformTenants.map(tn => 
        ticket && tn.id === ticket.tenantId ? { ...tn, consentSupportActive: false } : tn
      )
    }));
  },

  // Exam Wizard & Marks Workflow Implementation
  createExamViaWizard: (payload) => {
    const newExamId = `exam-${String(Math.floor(100 + Math.random() * 900))}`;
    const newExam: DemoExam = {
      id: newExamId,
      title: payload.name,
      code: `EXAM-${new Date().getFullYear()}-${payload.name.substring(0, 4).toUpperCase()}`,
      academic_year: payload.academicYear,
      target_level: payload.programmeOrClass.includes('PU') ? 'PU College' : 'School',
      class_name: payload.programmeOrClass,
      category: payload.category,
      exam_mode: payload.deliveryMode,
      question_paper_attached: true,
      status: 'CONTROLLER_VERIFIED',
      instructions: payload.instructions,
      schedules: payload.subjects.map((s, idx) => ({
        id: `sch-${newExamId}-${idx + 1}`,
        subject: s.subjectName,
        exam_date: s.examDate,
        start_time: '09:30 AM',
        end_time: '12:30 PM',
        room: s.room,
        invigilator: s.invigilator,
        theory_max: s.theoryMarks,
        practical_max: s.practicalMarks,
        passing_marks: s.passMarks
      }))
    };

    set((state) => ({
      exams: [newExam, ...state.exams]
    }));

    return {
      success: true,
      exam: newExam
    };
  },

  updateStudentExamMarks: (studentId, subject, marksObtained) => {
    set((state) => ({
      marks: state.marks.map(m => 
        m.student_id === studentId && m.subject === subject
          ? { ...m, obtained_marks: marksObtained } 
          : m
      )
    }));
  },

  advanceExamApprovalStage: (examId) => {
    const exam = get().exams.find(e => e.id === examId);
    if (!exam) return { currentStage: 'NOT_FOUND', published: false };

    let nextStatus: DemoExam['status'] = exam.status;
    let published = false;

    if (exam.status === 'SCHEDULED') {
      nextStatus = 'MARKS_ENTRY';
    } else if (exam.status === 'MARKS_ENTRY') {
      nextStatus = 'CONTROLLER_VERIFIED';
    } else if (exam.status === 'CONTROLLER_VERIFIED') {
      nextStatus = 'PRINCIPAL_APPROVED';
    } else if (exam.status === 'PRINCIPAL_APPROVED') {
      nextStatus = 'PUBLISHED';
      published = true;
    }

    set((state) => ({
      exams: state.exams.map(e => e.id === examId ? { ...e, status: nextStatus } : e)
    }));

    return {
      currentStage: nextStatus,
      published
    };
  },

  executeMigrationBatch: (batchId) => {
    const batch = get().migrationBatches.find(b => b.id === batchId);
    if (!batch) return { success: false, message: 'Batch not found', importedCount: 0 };
    set((state) => ({
      migrationBatches: state.migrationBatches.map(b => 
        b.id === batchId ? { ...b, status: 'MIGRATED' } : b
      )
    }));
    return {
      success: true,
      message: `Successfully migrated ${batch.cleanNewRecordsCount} clean records into student SIS master. ${batch.exactMatchesCount} duplicates resolved.`,
      importedCount: batch.cleanNewRecordsCount
    };
  },

  addAcademicSection: (payload) => {
    const existing = get().academicSections.find(s => 
      s.class_name.toLowerCase() === payload.class_name.toLowerCase() &&
      s.section_code.toUpperCase() === payload.section_code.toUpperCase() &&
      s.academic_year === payload.academic_year
    );
    if (existing) {
      return { success: false, section: existing, message: `Section ${payload.section_code.toUpperCase()} already exists for ${payload.class_name}` };
    }
    const newSec: AcademicSectionModel = {
      id: `SEC-${Date.now().toString().slice(-4)}`,
      ...payload,
      section_code: payload.section_code.toUpperCase(),
      enrolled_count: 0
    };
    set(state => ({ academicSections: [newSec, ...state.academicSections] }));
    return { success: true, section: newSec, message: `Section ${newSec.section_code} created successfully with capacity ${newSec.max_capacity}.` };
  },

  transferStudentSection: (payload) => {
    const targetSec = get().academicSections.find(s => s.section_code === payload.targetSection || s.id === payload.targetSection);
    if (targetSec && targetSec.enrolled_count >= targetSec.max_capacity) {
      return { success: false, message: `Target section ${targetSec.section_code} has reached its maximum capacity of ${targetSec.max_capacity} students.` };
    }
    const transferRecord: StudentSectionTransferModel = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      student_id: payload.studentId,
      student_name: payload.studentName,
      admission_number: `ADM-${Date.now().toString().slice(-4)}`,
      source_section: payload.sourceSection,
      target_section: payload.targetSection,
      reason: payload.reason,
      effective_date: new Date().toISOString().split('T')[0],
      approved_by: 'Principal Dr. V. Murthy',
      status: 'APPROVED'
    };
    set(state => ({
      studentTransfers: [transferRecord, ...state.studentTransfers],
      academicSections: state.academicSections.map(s => {
        if (s.section_code === payload.targetSection) return { ...s, enrolled_count: s.enrolled_count + 1 };
        if (s.section_code === payload.sourceSection && s.enrolled_count > 0) return { ...s, enrolled_count: s.enrolled_count - 1 };
        return s;
      })
    }));
    return { success: true, message: `Student transferred to Section ${payload.targetSection} successfully. Historical marks and fee records preserved.` };
  },

  assignStaffDuty: (payload) => {
    const newDuty: StaffDutyAssignmentModel = {
      id: `DUTY-${Date.now().toString().slice(-4)}`,
      ...payload,
      assigned_by: 'Principal / Admin',
      is_active: true
    };
    set(state => ({ staffDuties: [newDuty, ...state.staffDuties] }));
    return { success: true, assignment: newDuty };
  },

  generateHallTicketsForClass: (payload) => {
    const studentsToGenerate = get().students.filter(s => 
      !payload.className || s.class_name.toLowerCase().includes(payload.className.toLowerCase())
    );
    const generated: HallTicketModel[] = studentsToGenerate.map((st, idx) => {
      const isFeeCleared = st.fee_balance === 0;
      const eligibility = (payload.enforceFeeClearance && !isFeeCleared) ? 'PENDING_FEE_APPROVAL' : 'ELIGIBLE';
      return {
        id: `HT-${Date.now()}-${idx}`,
        ticket_number: `HT-AKG-2026-${st.roll_number.padStart(4, '0')}`,
        student_id: st.id,
        student_name: `${st.first_name} ${st.last_name}`,
        admission_number: st.admission_number,
        class_name: st.class_name,
        section_code: payload.sectionCode || 'A',
        exam_title: payload.examTitle,
        exam_centre: 'Akshara Global Campus • Hall B-204',
        room_number: `Room ${101 + (idx % 4)}`,
        seat_number: `Seat #${idx + 1}`,
        eligibility_status: eligibility,
        qr_code_signature: `EDOS-VERIFIED-${st.admission_number}-${Date.now()}`,
        timetable: [
          { subject: 'Physics Paper', date: '2026-11-24', time: '09:30 AM - 12:30 PM', room: 'Hall B-204' },
          { subject: 'Chemistry Paper', date: '2026-11-26', time: '09:30 AM - 12:30 PM', room: 'Hall B-204' },
          { subject: 'Mathematics Paper', date: '2026-11-28', time: '09:30 AM - 12:30 PM', room: 'Hall B-204' },
          { subject: 'Biology Paper', date: '2026-11-30', time: '09:30 AM - 12:30 PM', room: 'Hall B-204' }
        ]
      };
    });
    set(state => ({ hallTickets: [...generated, ...state.hallTickets] }));
    return { count: generated.length, tickets: generated };
  },

  updateComponentMarks: (studentId, subject, components) => {
    set(state => ({
      marks: state.marks.map(m => {
        if (m.student_id === studentId && m.subject.toLowerCase() === subject.toLowerCase()) {
          const tObt = components.theory !== undefined ? components.theory : (m.theory_obtained || 0);
          const pObt = components.practical !== undefined ? components.practical : (m.practical_obtained || 0);
          const iObt = components.internal !== undefined ? components.internal : (m.internal_obtained || 0);
          const total = tObt + pObt + iObt;
          const status = components.status || m.attendance_status || 'PRESENT';
          return {
            ...m,
            theory_obtained: tObt,
            practical_obtained: pObt,
            internal_obtained: iObt,
            obtained_marks: status === 'ABSENT' ? 0 : total,
            attendance_status: status,
            entered_by: components.enteredBy || m.entered_by || 'Subject Teacher',
            entered_by_role: components.enteredByRole || m.entered_by_role || 'TEACHER',
            grade: status === 'ABSENT' ? 'F' : total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'F'
          };
        }
        return m;
      })
    }));
  },

  submitFeeReportSnapshot: (payload) => {
    const snap: ConsolidatedFeeReportSnapshotModel = {
      id: `SNAP-${Date.now().toString().slice(-4)}`,
      snapshot_code: `FEE-SNAP-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`,
      submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: 'SUBMITTED',
      ...payload
    };
    set(state => ({ feeSnapshots: [snap, ...state.feeSnapshots] }));
    return { success: true, snapshot: snap };
  },

  reviewFeeReportSnapshot: (snapshotId, decision, remarks) => {
    set(state => ({
      feeSnapshots: state.feeSnapshots.map(s => 
        s.id === snapshotId 
          ? { ...s, status: decision, review_remarks: remarks, reviewed_by_name: 'Chairman Dr. S. Rao', reviewed_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) }
          : s
      )
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
      designerStatus: 'PUBLISHED',
      laboratories: initialLaboratories,
      labInventory: initialLabInventory,
      labMovements: initialLabMovements,
      labExperiments: initialLabExperiments,
      activeLabFilter: 'ALL',
      commChannels: initialCommChannels,
      commTemplates: initialCommTemplates,
      commDeliveryLogs: initialCommDeliveryLogs,
      commAutoTriggers: {
        'EXAM_TIMETABLE': true,
        'EXAM_RESULT': true,
        'FEE_RECEIPT': true,
        'FEE_DUE': true,
        'ATTENDANCE_ABSENT': true,
        'PRACTICAL_SCHEDULE': true
      },
      platformTenants: initialPlatformTenants,
      supportTickets: initialSupportTickets,
      procurementItems: initialProcurementItems,
      activeSubscriptionPlan: 'ENTERPRISE',
      academicSections: initialAcademicSections,
      studentTransfers: initialStudentTransfers,
      staffDuties: initialStaffDuties,
      hallTickets: initialHallTickets,
      feeSnapshots: initialFeeSnapshots,
    });
  },
}));
