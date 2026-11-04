import sys

path = 'apps/web/src/store/demoStore.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

seed_data_block = """
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
"""

# Insert seed data before store creation
anchor_store = "export const useDemoStore = create<DemoState>((set, get) => ({"
content = content.replace(anchor_store, seed_data_block + "\n" + anchor_store)

# Now add state and actions inside useDemoStore
old_store_init = """  rolePermissions: initialRolePermissions,
  temporaryPermissions: ["""

new_store_init = """  // Acceptance test and enhanced suites
  acceptanceTestState: initialAcceptanceTestState,
  individualProgressCards: initialIndividualProgressCards,
  consolidatedProgressCards: initialConsolidatedCards,
  competitiveReports: initialCompetitiveReports,
  migrationBatches: initialMigrationBatches,

  rolePermissions: initialRolePermissions,
  temporaryPermissions: ["""

content = content.replace(old_store_init, new_store_init)

# Now add the action implementations right before resetDemoData
old_reset = """  resetDemoData: () => {"""

actions_code = """  // Acceptance Test Actions for Rahul Kumar
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
"""

content = content.replace(old_reset, actions_code + "\n" + old_reset)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Step 6 done.")

