import { create } from 'zustand';

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

export interface DemoFeeInvoice {
  id: string;
  invoice_number: string;
  student_name: string;
  admission_number: string;
  class_name: string;
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

interface DemoState {
  students: DemoStudent[];
  admissions: DemoAdmission[];
  invoices: DemoFeeInvoice[];
  attendance: DemoAttendanceRecord[];
  marks: DemoExamMarks[];
  
  // Actions
  addStudent: (student: Omit<DemoStudent, 'id'>) => void;
  createAdmission: (app: Omit<DemoAdmission, 'id' | 'application_number' | 'submission_date' | 'status'>) => void;
  approveAdmission: (id: string) => void;
  collectFee: (invoiceId: string, amount: number) => { receiptNumber: string };
  updateAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => void;
  saveMark: (studentId: string, subject: string, obtained: number) => void;
  resetDemoData: () => void;
}

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
  { id: 'inv-1', invoice_number: 'INV-2026-0091', student_name: 'Aarav Sharma', admission_number: 'ADM-2026-001', class_name: 'Class 10-A', fee_title: 'Term 2 Tuition & Labs', total_amount: 35000, paid_amount: 35000, balance_amount: 0, due_date: '2026-11-15', status: 'PAID' },
  { id: 'inv-2', invoice_number: 'INV-2026-0092', student_name: 'Ananya Hegde', admission_number: 'ADM-2026-002', class_name: 'I PUC - PCMB', fee_title: 'Annual Science Fee (Instalment 2)', total_amount: 45000, paid_amount: 32500, balance_amount: 12500, due_date: '2026-11-20', status: 'PARTIAL' },
  { id: 'inv-3', invoice_number: 'INV-2026-0093', student_name: 'Rohan Verma', admission_number: 'ADM-2026-003', class_name: 'B.Sc CS (Sem 3)', fee_title: 'Semester University Fee', total_amount: 48000, paid_amount: 24000, balance_amount: 24000, due_date: '2026-10-31', status: 'OVERDUE' },
  { id: 'inv-4', invoice_number: 'INV-2026-0094', student_name: 'Priya Nair', admission_number: 'ADM-2026-004', class_name: 'Class 9-B', fee_title: 'Term 2 Tuition Fee', total_amount: 28000, paid_amount: 23500, balance_amount: 4500, due_date: '2026-11-25', status: 'PARTIAL' },
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
  { student_id: 'st-1', student_name: 'Aarav Sharma', roll_number: '101', subject: 'Science', max_marks: 100, obtained_marks: 91, grade: 'A+' },
  { student_id: 'st-2', student_name: 'Ananya Hegde', roll_number: '102', subject: 'Physics (Theory + Practical)', max_marks: 100, obtained_marks: 88, grade: 'A' },
  { student_id: 'st-3', student_name: 'Rohan Verma', roll_number: '103', subject: 'Data Structures & Algorithms', max_marks: 100, obtained_marks: 85, grade: 'A' },
];

export const useDemoStore = create<DemoState>((set, get) => ({
  students: initialStudents,
  admissions: initialAdmissions,
  invoices: initialInvoices,
  attendance: initialAttendance,
  marks: initialMarks,

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
    const receiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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

  resetDemoData: () => {
    set({
      students: initialStudents,
      admissions: initialAdmissions,
      invoices: initialInvoices,
      attendance: initialAttendance,
      marks: initialMarks,
    });
  },
}));

