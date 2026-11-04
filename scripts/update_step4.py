import sys

path = 'apps/web/src/store/demoStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initialStudents to include Rahul Kumar
old_students = """const initialStudents: DemoStudent[] = [
  { id: 'st-1', admission_number: 'ADM-2026-001', roll_number: '101', first_name: 'Aarav', last_name: 'Sharma', institution_level: 'School', class_name: 'Class 10', section_or_stream: 'Section A', guardian_name: 'Rajesh Sharma', guardian_phone: '+91 98450 12345', fee_balance: 0, attendance_pct: 96.5, status: 'ACTIVE' },"""

new_students = """const initialStudents: DemoStudent[] = [
  { id: 'st-rahul', admission_number: 'AKG-2026-0152', roll_number: '152', first_name: 'Rahul', last_name: 'Kumar', institution_level: 'PU College', class_name: 'I PUC', section_or_stream: 'PCMB (Science)', guardian_name: 'Ramesh Kumar', guardian_phone: '+91 98450 99887', fee_balance: 70000, attendance_pct: 94.2, status: 'ACTIVE' },
  { id: 'st-1', admission_number: 'ADM-2026-001', roll_number: '101', first_name: 'Aarav', last_name: 'Sharma', institution_level: 'School', class_name: 'Class 10', section_or_stream: 'Section A', guardian_name: 'Rajesh Sharma', guardian_phone: '+91 98450 12345', fee_balance: 0, attendance_pct: 96.5, status: 'ACTIVE' },"""

content = content.replace(old_students, new_students)

# 2. Add parent_name and amount_in_words to DemoFeeReceipt
old_receipt = """export interface DemoFeeReceipt {
  id: string;
  receipt_number: string;
  invoice_id: string;
  invoice_number: string;
  student_id: string;
  student_name: string;
  admission_number: string;"""

new_receipt = """export interface DemoFeeReceipt {
  id: string;
  receipt_number: string;
  invoice_id: string;
  invoice_number: string;
  student_id: string;
  student_name: string;
  parent_name?: string;
  amount_in_words?: string;
  admission_number: string;"""

content = content.replace(old_receipt, new_receipt)

# 3. Add numberToWords and new financial/academic interfaces
types_to_insert = """
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

  return `${parts.join(' ')} Rupees Only`.replace(/\\s+/g, ' ').trim();
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
"""

anchor = "export interface DemoFeeReceipt {"
content = content.replace(anchor, types_to_insert + "\n" + anchor)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Step 4 types done.")
