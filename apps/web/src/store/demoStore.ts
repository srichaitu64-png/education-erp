import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Role-Based Access Control (RBAC)
// ---------------------------------------------------------------------------
export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'INSTITUTION_ADMIN'
  | 'PRINCIPAL'
  | 'ACCOUNTANT'
  | 'EXAM_CONTROLLER'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT'
  | 'TRANSPORT_MANAGER';

export interface RolePrivilegeInfo {
  role: UserRoleType;
  title: string;
  badgeColor: string;
  allowedTabs: string[];
  canEdit: string[];
  canApprove: string[];
  restrictedActions: string[];
}

export const ROLE_PRIVILEGES: Record<UserRoleType, RolePrivilegeInfo> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Platform Super Administrator',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    allowedTabs: ['dashboard', 'tenants', 'plans', 'entitlements', 'audit'],
    canEdit: ['Tenant subscriptions', 'Platform feature locks', 'Global pricing'],
    canApprove: ['Institution tenant provisioning', 'Emergency license extensions'],
    restrictedActions: ['Cannot modify individual student marks or classroom attendance directly'],
  },
  INSTITUTION_ADMIN: {
    role: 'INSTITUTION_ADMIN',
    title: 'Institution Administrator',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    allowedTabs: [
      'dashboard', 'admissions', 'students', 'academics', 'fees', 'attendance',
      'examinations', 'competitive-exams', 'transport', 'staff', 'timetable', 'analytics', 'settings'
    ],
    canEdit: ['Curriculum & subjects', 'Staff profiles', 'Fee structures', 'Institution settings'],
    canApprove: ['Student admissions', 'Staff leave requests', 'Department budgets'],
    restrictedActions: ['Cannot bypass platform subscription tier feature locks'],
  },
  PRINCIPAL: {
    role: 'PRINCIPAL',
    title: 'Principal / Director',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    allowedTabs: [
      'dashboard', 'students', 'attendance', 'examinations', 'competitive-exams',
      'fees', 'transport', 'staff', 'timetable', 'analytics'
    ],
    canEdit: ['Academic calendar', 'Staff evaluations', 'Performance reviews'],
    canApprove: ['Final exam results publication', 'Fee concessions & refunds', 'Student transfer certificates'],
    restrictedActions: ['Cannot silently overwrite marks entered by teachers without audit trail'],
  },
  ACCOUNTANT: {
    role: 'ACCOUNTANT',
    title: 'Finance & Accounts Officer',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    allowedTabs: ['dashboard', 'fees'],
    canEdit: ['Fee collection', 'Payment allocations', 'Issue digital receipts'],
    canApprove: ['Payment reconciliations', 'Request exceptional fee refunds'],
    restrictedActions: ['LOCKED from editing marks, examinations, attendance, or student academic data'],
  },
  EXAM_CONTROLLER: {
    role: 'EXAM_CONTROLLER',
    title: 'Controller of Examinations',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    allowedTabs: ['dashboard', 'examinations', 'competitive-exams'],
    canEdit: ['Exam timetable schedules', 'Room allocations', 'Invigilator duties', 'Passing criteria'],
    canApprove: ['Verify submitted marks for anomalies', 'Forward marks to Principal for final publication'],
    restrictedActions: ['LOCKED from fee collections and HR administration'],
  },
  TEACHER: {
    role: 'TEACHER',
    title: 'Faculty / Subject Teacher (Physics - I PUC)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    allowedTabs: ['dashboard', 'attendance', 'examinations', 'timetable'],
    canEdit: ['Class attendance for assigned periods', 'Draft marks entry for assigned subjects only'],
    canApprove: ['Submit subject marks batch to Examination Controller'],
    restrictedActions: ['LOCKED from other teachers\' subjects, fee collections, and student financial records'],
  },
  PARENT: {
    role: 'PARENT',
    title: 'Parent / Guardian (Aarav Sharma - Class 10)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    allowedTabs: ['dashboard', 'students', 'fees', 'attendance', 'examinations', 'transport', 'timetable'],
    canEdit: ['Own emergency contact information'],
    canApprove: ['Online fee payment authorization'],
    restrictedActions: ['STRICTLY ISOLATED to only linked child\'s records; cannot view any other student'],
  },
  STUDENT: {
    role: 'STUDENT',
    title: 'Student Portal (Ananya Hegde - I PUC PCMB)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    allowedTabs: ['dashboard', 'examinations', 'competitive-exams', 'attendance', 'timetable'],
    canEdit: ['Attempt mock tests & practice papers'],
    canApprove: ['None (Read-only access)'],
    restrictedActions: ['LOCKED from entering marks, attendance, fee collections, or staff records'],
  },
  TRANSPORT_MANAGER: {
    role: 'TRANSPORT_MANAGER',
    title: 'Transport Manager & Fleet Supervisor',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    allowedTabs: ['dashboard', 'transport'],
    canEdit: ['Routes, bus stops, vehicle documents, driver assignments', 'Trip status updates'],
    canApprove: ['Route allocation requests'],
    restrictedActions: ['LOCKED from academic marks, examination records, and fee ledgers'],
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

export interface DemoExam {
  id: string;
  title: string;
  academic_year: string;
  target_level: 'School' | 'PU College' | 'Degree College';
  class_name: string;
  exam_type: 'Unit Test' | 'Midterm' | 'Annual Board Pre-Mock' | 'Practical Lab';
  status: 'SCHEDULED' | 'MARKS_ENTRY' | 'CONTROLLER_VERIFIED' | 'PRINCIPAL_APPROVED' | 'PUBLISHED';
  schedules: ExamScheduleItem[];
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

export interface CompetitiveQuestion {
  id: string;
  exam_type: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED' | 'KCET' | 'COMEDK';
  subject: string;
  chapter: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_label: string;
  explanation: string;
  marks_positive: number;
  marks_negative: number;
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

// ---------------------------------------------------------------------------
// Zustand Store State
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
  competitiveQuestions: CompetitiveQuestion[];
  transportRoutes: TransportRoute[];

  // Actions
  addStudent: (student: Omit<DemoStudent, 'id'>) => void;
  createAdmission: (app: Omit<DemoAdmission, 'id' | 'application_number' | 'submission_date' | 'status'>) => void;
  approveAdmission: (id: string) => void;
  collectFee: (invoiceId: string, amount: number) => { receiptNumber: string };
  updateAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => void;
  saveMark: (studentId: string, subject: string, obtained: number) => void;

  // Exam Workflow Actions
  verifyExamAsController: (examId: string) => void;
  approveExamAsPrincipal: (examId: string) => void;
  publishExamResults: (examId: string) => void;

  // Subject Management Actions
  addSubject: (subj: Omit<AcademicSubject, 'id' | 'is_archived'>) => void;
  archiveSubject: (subjectId: string) => void;
  reorderSubjects: (fromIndex: number, toIndex: number) => void;

  // Transport Tracking Simulator
  toggleTripStatus: (routeId: string) => void;

  resetDemoData: () => void;
}

// ---------------------------------------------------------------------------
// Seed Data
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
    academic_year: '2026-2027',
    target_level: 'PU College',
    class_name: 'I & II PUC (Science & Commerce)',
    exam_type: 'Midterm',
    status: 'CONTROLLER_VERIFIED',
    schedules: [
      { id: 'sch-1', subject: 'Physics', exam_date: '2026-11-18', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Hall A-101', invigilator: 'Dr. V. Murthy', theory_max: 70, practical_max: 30, passing_marks: 35 },
      { id: 'sch-2', subject: 'Chemistry', exam_date: '2026-11-20', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Hall A-102', invigilator: 'Prof. S. Joshi', theory_max: 70, practical_max: 30, passing_marks: 35 },
      { id: 'sch-3', subject: 'Mathematics', exam_date: '2026-11-23', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Hall B-201', invigilator: 'Mrs. K. Swamy', theory_max: 80, practical_max: 20, passing_marks: 35 },
      { id: 'sch-4', subject: 'Biology', exam_date: '2026-11-25', start_time: '09:30 AM', end_time: '12:30 PM', room: 'Bio Lab Complex', invigilator: 'Dr. Anita Rao', theory_max: 70, practical_max: 30, passing_marks: 35 },
    ]
  },
  {
    id: 'exam-2',
    title: 'Unit Test 2 (Formative Assessment)',
    academic_year: '2026-2027',
    target_level: 'School',
    class_name: 'Class 9 & 10',
    exam_type: 'Unit Test',
    status: 'PUBLISHED',
    schedules: [
      { id: 'sch-5', subject: 'Mathematics', exam_date: '2026-10-15', start_time: '10:00 AM', end_time: '11:30 AM', room: 'Classrooms 10A, 10B', invigilator: 'Class Teachers', theory_max: 50, practical_max: 0, passing_marks: 18 },
      { id: 'sch-6', subject: 'Science', exam_date: '2026-10-16', start_time: '10:00 AM', end_time: '11:30 AM', room: 'Classrooms 10A, 10B', invigilator: 'Class Teachers', theory_max: 50, practical_max: 0, passing_marks: 18 },
    ]
  }
];

const initialSubjects: AcademicSubject[] = [
  { id: 'sub-1', code: 'PHY-101', name: 'Physics (Theory + Lab)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB / PCMC', theory_marks: 70, practical_marks: 30, is_compulsory: true, assigned_teacher: 'Dr. V. Murthy', is_archived: false },
  { id: 'sub-2', code: 'CHEM-102', name: 'Chemistry (Inorganic & Organic)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB / PCMC', theory_marks: 70, practical_marks: 30, is_compulsory: true, assigned_teacher: 'Prof. S. Joshi', is_archived: false },
  { id: 'sub-3', code: 'MATH-103', name: 'Pure & Applied Mathematics', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB / PCMC', theory_marks: 80, practical_marks: 20, is_compulsory: true, assigned_teacher: 'Mrs. K. Swamy', is_archived: false },
  { id: 'sub-4', code: 'BIO-104', name: 'Biology (Botany & Zoology)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMB', theory_marks: 70, practical_marks: 30, is_compulsory: false, assigned_teacher: 'Dr. Anita Rao', is_archived: false },
  { id: 'sub-5', code: 'CS-105', name: 'Computer Science (Python & SQL)', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'PCMC', theory_marks: 70, practical_marks: 30, is_compulsory: false, assigned_teacher: 'Mr. Arvind Nathan', is_archived: false },
  { id: 'sub-6', code: 'ENG-100', name: 'General English & Communication', institution_level: 'PU College', target_class: 'I PUC', stream_or_comb: 'Common', theory_marks: 100, practical_marks: 0, is_compulsory: true, assigned_teacher: 'Mrs. Mary D\'Souza', is_archived: false },
  { id: 'sub-7', code: 'SCH-MTH', name: 'Mathematics 10', institution_level: 'School', target_class: 'Class 10', stream_or_comb: 'General', theory_marks: 80, practical_marks: 20, is_compulsory: true, assigned_teacher: 'Mrs. Geetha R.', is_archived: false },
  { id: 'sub-8', code: 'SCH-SCI', name: 'Science 10', institution_level: 'School', target_class: 'Class 10', stream_or_comb: 'General', theory_marks: 80, practical_marks: 20, is_compulsory: true, assigned_teacher: 'Mr. Pradeep K.', is_archived: false },
];

const initialCompetitiveQuestions: CompetitiveQuestion[] = [
  {
    id: 'q-neet-1',
    exam_type: 'NEET',
    subject: 'Physics',
    chapter: 'Ray Optics and Optical Instruments',
    question_text: 'A convex lens of focal length 20 cm is placed in contact with a concave lens of focal length 40 cm. The power of the combination is:',
    options: [
      { label: 'A', text: '+2.5 D' },
      { label: 'B', text: '-2.5 D' },
      { label: 'C', text: '+5.0 D' },
      { label: 'D', text: '-1.25 D' }
    ],
    correct_label: 'A',
    explanation: '1/F = 1/f1 + 1/f2 = 1/20 - 1/40 = 1/40 cm = 1/0.4 m => P = 1/0.4 = +2.5 Dioptres.',
    marks_positive: 4,
    marks_negative: 1
  },
  {
    id: 'q-neet-2',
    exam_type: 'NEET',
    subject: 'Biology',
    chapter: 'Genetics and Evolution',
    question_text: 'In Mendel\'s dihybrid cross with heterozygous yellow round seeds (YyRr), the proportion of F2 offspring with wrinkled green phenotype is:',
    options: [
      { label: 'A', text: '9/16' },
      { label: 'B', text: '3/16' },
      { label: 'C', text: '1/16' },
      { label: 'D', text: '1/4' }
    ],
    correct_label: 'C',
    explanation: 'The phenotypic ratio is 9:3:3:1. The double recessive genotype yyrr (wrinkled green) is 1/16.',
    marks_positive: 4,
    marks_negative: 1
  },
  {
    id: 'q-jee-1',
    exam_type: 'JEE_MAIN',
    subject: 'Mathematics',
    chapter: 'Definite Integrals',
    question_text: 'The value of the definite integral ∫ (from 0 to π/2) [sin³(x) / (sin³(x) + cos³(x))] dx is equal to:',
    options: [
      { label: 'A', text: 'π/2' },
      { label: 'B', text: 'π/4' },
      { label: 'C', text: '0' },
      { label: 'D', text: '1' }
    ],
    correct_label: 'B',
    explanation: 'Using property ∫[0 to a] f(x)dx = ∫[0 to a] f(a-x)dx, 2I = ∫[0 to π/2] 1 dx = π/2 => I = π/4.',
    marks_positive: 4,
    marks_negative: 1
  },
  {
    id: 'q-kcet-1',
    exam_type: 'KCET',
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    question_text: 'The quantity of electricity required to liberate 1 mole of Aluminium from molten Al2O3 is:',
    options: [
      { label: 'A', text: '1 Faraday' },
      { label: 'B', text: '2 Faradays' },
      { label: 'C', text: '3 Faradays' },
      { label: 'D', text: '6 Faradays' }
    ],
    correct_label: 'C',
    explanation: 'Al3+ + 3e- -> Al requires 3 moles of electrons = 3 Faradays per mole of aluminium metal.',
    marks_positive: 1,
    marks_negative: 0
  }
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
    current_location: 'JP Nagar 6th Phase Metro Junction',
    status: 'IN_TRANSIT',
    current_speed_kmh: 36,
    stops: [
      { stop_name: 'JP Nagar 6th Phase Depot', scheduled_time: '07:30 AM', student_count: 8, is_passed: true },
      { stop_name: 'Sarakki Signal', scheduled_time: '07:45 AM', student_count: 12, is_passed: true },
      { stop_name: 'Vega City Mall Junction', scheduled_time: '08:00 AM', student_count: 9, is_passed: false },
      { stop_name: 'Akshara Global Main Campus Gate', scheduled_time: '08:25 AM', student_count: 0, is_passed: false },
    ]
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
    current_location: 'Marathahalli Bridge',
    status: 'IN_TRANSIT',
    current_speed_kmh: 42,
    stops: [
      { stop_name: 'ITPB Main Gate Whitefield', scheduled_time: '07:15 AM', student_count: 15, is_passed: true },
      { stop_name: 'Marathahalli Multiplex', scheduled_time: '07:40 AM', student_count: 14, is_passed: true },
      { stop_name: 'Bellandur EcoSpace', scheduled_time: '08:05 AM', student_count: 11, is_passed: false },
      { stop_name: 'Akshara Global Main Campus Gate', scheduled_time: '08:30 AM', student_count: 0, is_passed: false },
    ]
  }
];

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------
export const useDemoStore = create<DemoState>((set, get) => ({
  currentRole: 'PRINCIPAL',

  switchRole: (role) => {
    set({ currentRole: role });
  },

  students: initialStudents,
  admissions: initialAdmissions,
  invoices: initialInvoices,
  attendance: initialAttendance,
  marks: initialMarks,
  exams: initialExams,
  subjects: initialSubjects,
  competitiveQuestions: initialCompetitiveQuestions,
  transportRoutes: initialTransportRoutes,

  addStudent: (data) => {
    const newStudent: DemoStudent = {
      id: `st-${Date.now()}`,
      ...data,
    };
    set((state) => ({ students: [newStudent, ...state.students] }));
  },

  createAdmission: (data) => {
    const newApp: DemoAdmission = {
      id: `adm-${Date.now()}`,
      application_number: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      submission_date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      ...data,
    };
    set((state) => ({ admissions: [newApp, ...state.admissions] }));
  },

  approveAdmission: (id) => {
    set((state) => ({
      admissions: state.admissions.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a)),
    }));
  },

  collectFee: (invoiceId, amount) => {
    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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
    const calcGrade = (score: number) => {
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B+';
      if (score >= 60) return 'B';
      if (score >= 50) return 'C';
      if (score >= 35) return 'Pass';
      return 'F';
    };

    set((state) => {
      const existing = state.marks.find(
        (m) => m.student_id === studentId && m.subject === subject
      );
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

  // Exam Workflow
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
      competitiveQuestions: initialCompetitiveQuestions,
      transportRoutes: initialTransportRoutes,
    });
  },
}));
