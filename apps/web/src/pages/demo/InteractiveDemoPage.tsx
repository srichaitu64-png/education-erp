import { LaboratoryManagementView } from './views/LaboratoryManagementView';
import { CommunicationHubView } from './views/CommunicationHubView';
import { PlatformSuperAdminView } from './views/PlatformSuperAdminView';
import { AcademicStructureView } from './views/AcademicStructureView';
import { StaffDutyAssignmentView } from './views/StaffDutyAssignmentView';
import { MarksEntryRegisterView } from './views/MarksEntryRegisterView';
import { HallTicketManagementView } from './views/HallTicketManagementView';
import { ConsolidatedFeeReportReviewView } from './views/ConsolidatedFeeReportReviewView';
import { ResultNoticeBoardView } from './views/ResultNoticeBoardView';
import { RoleWorkspaceDispatcher } from './views/RoleWorkspaceDispatcher';
import React, { useState } from 'react';
import {
  FlaskConical,
  MessageSquare,
  ShieldAlert,
  GraduationCap,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  BookOpen,
  Settings,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
  UserCheck,
  Search,
  Key,
  Lock,
  Unlock,
  History,
  FileCheck,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Printer,
  ChevronUp,
  ChevronDown,
  Layout,
  ExternalLink,
  Bus,
  FileText,
  Receipt,
  QrCode,
  Share2,
  FileSpreadsheet,
  DollarSign,
  Building2,
  Copy,
  CheckCircle,
  AlertCircle,
  Plus,
  TrendingUp
} from 'lucide-react';
import {
  useDemoStore,
  UserRoleType,
  ROLE_PRIVILEGES,
  InstitutionalExamCategory,
  ExamDeliveryMode,
  FineGrainedAction,
  PresentationState,
  FeeHeadType,
  PaymentMethodType,
  ReceiptPrintLayout,
  DemoFeeReceipt,
  DemoFeeStructure,
  DEFAULT_SCHOOL_FEE_HEADS,
  DEFAULT_COLLEGE_FEE_HEADS,
  FeeHeadDefinition,
  MultiHeadFeeItem
} from '../../store/demoStore';

export const InteractiveDemoPage: React.FC = () => {
  const {
    currentRole,
    switchRole,
    students,
    admissions,
    invoices,
    receipts,
    receiptAudits,
    feeStructures,
    activeFeeInstitutionFilter,
    attendance,
    marks,
    exams,
    subjects,
    transportRoutes,
    externalProviders,
    rolePermissions,
    temporaryPermissions,
    permissionAudits,
    changeRequests,
    designerRolePreview,
    designerNavConfigs,
    designerVersion,
    designerStatus,
    customFeeHeads,
    acceptanceTestState,
    runAcceptanceTestPayment1,
    runAcceptanceTestPayment2,
    resetAcceptanceTest,
    getStudentConsolidatedStatement,
    individualProgressCards,
    consolidatedProgressCards,
    competitiveReports,
    migrationBatches,
    resolveMigrationCandidate,
    executeMigrationBatch,
    addCustomFeeHead,
    collectMultiHeadFee,
    collectFee,
    collectFeeWithReceipt,
    reprintReceipt,
    logReceiptAction,
    saveFeeStructure,
    setActiveFeeInstitutionFilter,
    updateAttendance,
    saveMark,
    submitMarksAsTeacher,
    verifyExamAsController,
    approveExamAsPrincipal,
    publishExamResults,
    addExam,
    simulateOfflineSync,
    archiveSubject,
    reorderSubjects,
    toggleTripStatus,
    updateRoleActionPermission,
    submitPermissionChangeRequest,
    reviewPermissionChangeRequest,
    rollbackPermissionVersion,
    setDesignerRolePreview,
    updateDesignerItemState,
    updateDesignerItemVisibility,
    publishDashboardDesignerConfig,
    rollbackDashboardDesignerConfig,
    resetDemoData,
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [examCategoryFilter, setExamCategoryFilter] = useState<string>('ALL');
  const [examModeFilter, setExamModeFilter] = useState<string>('ALL');
  const [feeCategoryFilter, setFeeCategoryFilter] = useState<string>('ALL');

  // Examination Creation Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('Weekly Assessment Test 4');
  const [newExamCategory, setNewExamCategory] = useState<InstitutionalExamCategory>('Weekly Test');
  const [newExamClass, setNewExamClass] = useState('I PUC (Science)');
  const [newExamMode, setNewExamMode] = useState<ExamDeliveryMode>('Offline (Paper-based)');

  // Offline Sync feedback
  const [syncFeedback, setSyncFeedback] = useState<{ id: string; status: string; message: string } | null>(null);

  // Institution Login Simulator state
  const [loginRole, setLoginRole] = useState<UserRoleType>('PRINCIPAL');
  const [loginSearch, setLoginSearch] = useState('');
  const [selectedUserIdentity, setSelectedUserIdentity] = useState('Dr. Ramesh Kumar (EMP-PRIN-01)');
  const [loginPassword, setLoginPassword] = useState('PrincipalSecurePassword2026!');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Permission Change Request Form
  const [showChangeReqModal, setShowChangeReqModal] = useState(false);
  const [reqAction, setReqAction] = useState<FineGrainedAction>('publish');
  const [reqRole, setReqRole] = useState<UserRoleType>('EXAM_CONTROLLER');
  const [reqJustification, setReqJustification] = useState('Authorize Exam Controller to publish formative unit test marks directly without bottleneck.');

  // Fee Management & Receipt Generation State
  const [feeSubTab, setFeeSubTab] = useState<'statement' | 'collection' | 'register' | 'consolidated' | 'dues' | 'structures'>('statement');
  const [selectedStatementStudentId, setSelectedStatementStudentId] = useState<string>('st-rahul');
  const [acceptanceTestFeedback, setAcceptanceTestFeedback] = useState<string | null>(null);

  // Student Progress Cards State
  const [progressCardSubTab, setProgressCardSubTab] = useState<'individual' | 'consolidated' | 'competitive'>('individual');
  const [selectedProgressStudentId, setSelectedProgressStudentId] = useState<string>('st-rahul');

  // Data Migration Centre State
  const [migrationStep, setMigrationStep] = useState<number>(1);
  const [migrationFeedback, setMigrationFeedback] = useState<string | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('Paid via Counter Portal');
  const [paymentVerificationConfirmed, setPaymentVerificationConfirmed] = useState<boolean>(true);
  const [activeReceiptForModal, setActiveReceiptForModal] = useState<DemoFeeReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [receiptPrintLayout, setReceiptPrintLayout] = useState<ReceiptPrintLayout>('A4');
  const [receiptRegisterSearch, setReceiptRegisterSearch] = useState<string>('');
  const [receiptRegisterFilterMethod, setReceiptRegisterFilterMethod] = useState<string>('ALL');
  const [reportAcademicYear, setReportAcademicYear] = useState<string>('2026-2027');
  const [reportClassFilter, setReportClassFilter] = useState<string>('ALL');
  const [dueReportStatusFilter, setDueReportStatusFilter] = useState<string>('ALL');
  const [feeStructureFeedback, setFeeStructureFeedback] = useState<string | null>(null);
  const [reprintFeedback, setReprintFeedback] = useState<string | null>(null);

  // Multi-Head Fee Collection Counter State
  const [multiStudentId, setMultiStudentId] = useState<string>('st-2'); // Ananya Hegde (PUC)
  const [multiAcademicYear, setMultiAcademicYear] = useState<string>('2026-2027');
  const [multiTerm, setMultiTerm] = useState<string>('TERM_1');
  const [multiStream, setMultiStream] = useState<'School' | 'PU College'>('PU College');
  const [multiSelectedHeadCodes, setMultiSelectedHeadCodes] = useState<string[]>([
    'PU_TUITION_FEE', 'PHYSICS_CHEM_BIO_LAB', 'PU_LIBRARY_READING'
  ]);
  const [headSearchQuery, setHeadSearchQuery] = useState<string>('');
  const [multiHeadAmounts, setMultiHeadAmounts] = useState<Record<string, { collected: number; concession: number }>>({
    'PU_TUITION_FEE': { collected: 21000, concession: 2000 },
    'PHYSICS_CHEM_BIO_LAB': { collected: 8500, concession: 0 },
    'PU_LIBRARY_READING': { collected: 3000, concession: 0 },
  });
  const [multiPaymentMethod, setMultiPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [multiTxnRef, setMultiTxnRef] = useState<string>('UPI-HDFC-99382104');
  const [multiNotes, setMultiNotes] = useState<string>('Term 1 installment collected at front counter');

  // Custom Fee Head Modal State
  const [showAddHeadModal, setShowAddHeadModal] = useState<boolean>(false);
  const [newHeadTitle, setNewHeadTitle] = useState<string>('');
  const [newHeadCode, setNewHeadCode] = useState<string>('');
  const [newHeadCategory, setNewHeadCategory] = useState<string>('Tuition');
  const [newHeadAmount, setNewHeadAmount] = useState<number>(5000);
  const [newHeadRefundable, setNewHeadRefundable] = useState<boolean>(false);
  const [newHeadInstType, setNewHeadInstType] = useState<'School' | 'PU College' | 'Degree College'>('School');
  const [newHeadFeedback, setNewHeadFeedback] = useState<string | null>(null);

  // Current Role Privileges
  const currentPrivilege = ROLE_PRIVILEGES[currentRole] || ROLE_PRIVILEGES.PRINCIPAL;

  // Determine if a tab is restricted or locked
  const isTabAllowed = (tabId: string): boolean => {
    if (currentRole === 'SUPER_ADMIN') return true;
    const designerItems = designerNavConfigs[currentRole] || [];
    const designerMatch = designerItems.find(it => it.id === tabId);
    if (designerMatch) {
      if (designerMatch.presentationState === 'COMPLETELY_HIDDEN') return false;
      if (designerMatch.presentationState === 'VISIBLE_LOCKED') return false;
    }
    return currentPrivilege.allowedTabs.includes(tabId);
  };

  const isTabLocked = (tabId: string): { locked: boolean; reason?: string } => {
    if (currentRole === 'SUPER_ADMIN') return { locked: false };
    const designerItems = designerNavConfigs[currentRole] || [];
    const designerMatch = designerItems.find(it => it.id === tabId);
    if (designerMatch && designerMatch.presentationState === 'VISIBLE_LOCKED') {
      return { locked: true, reason: designerMatch.lockReason || 'Restricted by institutional policy' };
    }
    if (!currentPrivilege.allowedTabs.includes(tabId)) {
      return { locked: true, reason: `Locked for role '${currentRole}'. Requires Platform Super Admin authorization.` };
    }
    return { locked: false };
  };

  // Nav items definition
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Layers, isSuperAdminOnly: false },
    { id: 'academic-structure', label: 'Academic Sections (Class 6 & PU)', icon: Layers, isSuperAdminOnly: false },
    { id: 'staff-duties', label: 'Staff Duty Assignments', icon: UserCheck, isSuperAdminOnly: false },
    { id: 'examinations', label: 'Examinations Lifecycle', icon: Award, isSuperAdminOnly: false },
    { id: 'marks-register', label: 'Marks Register (Multi-Component)', icon: FileSpreadsheet, isSuperAdminOnly: false },
    { id: 'hall-tickets', label: 'Hall Tickets & Verification', icon: QrCode, isSuperAdminOnly: false },
    { id: 'notice-board', label: 'Result Notice Board', icon: Award, isSuperAdminOnly: false },
    { id: 'fees', label: 'Fee Management & Statements', icon: CreditCard, isSuperAdminOnly: false },
    { id: 'fee-review', label: 'Consolidated Fee Ledger', icon: DollarSign, isSuperAdminOnly: false },
    { id: 'institution-control-centre', label: 'Institution Control Centre', icon: Building2, isSuperAdminOnly: false },
    { id: 'permissions-centre', label: 'Central Permission Matrix', icon: Key, isSuperAdminOnly: true },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', icon: Layout, isSuperAdminOnly: true },
    { id: 'progress-cards', label: 'Student Progress Cards', icon: FileCheck, isSuperAdminOnly: false },
    { id: 'laboratory', label: 'Laboratory & QR Inventory', icon: FlaskConical, isSuperAdminOnly: false },
    { id: 'communication', label: 'Communication Hub (WhatsApp/Telegram)', icon: MessageSquare, isSuperAdminOnly: false },
    { id: 'platform-superadmin', label: 'Platform SaaS Command (1,000+ Tenancies)', icon: ShieldAlert, isSuperAdminOnly: true },
    { id: 'data-migration', label: 'Data Migration Centre', icon: Upload, isSuperAdminOnly: false },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, isSuperAdminOnly: false },
    { id: 'transport', label: 'Transport Fleet & GPS', icon: Bus, isSuperAdminOnly: false },
    { id: 'academics', label: 'Academic & Subjects', icon: BookOpen, isSuperAdminOnly: false },
    { id: 'students', label: 'Students (SIS)', icon: Users, isSuperAdminOnly: false },
    { id: 'staff', label: 'Faculty & HR', icon: Users, isSuperAdminOnly: false },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock, isSuperAdminOnly: false },
    { id: 'institution-login', label: 'Institution Login & Autocomplete', icon: UserCheck, isSuperAdminOnly: false },
    { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap, isSuperAdminOnly: false },
  ];

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExam({
      title: newExamTitle,
      code: `EXAM-${Date.now().toString().slice(-4)}`,
      academic_year: '2026-2027',
      target_level: 'PU College',
      class_name: newExamClass,
      category: newExamCategory,
      exam_mode: newExamMode,
      question_paper_attached: newExamMode === 'Offline (Paper-based)',
      instructions: 'Standard institutional examination rules and timings apply.',
      schedules: [
        {
          id: `sch-${Date.now()}`,
          subject: 'Core Academic Paper',
          exam_date: '2026-11-29',
          start_time: '09:30 AM',
          end_time: '12:30 PM',
          room: 'Hall B-204',
          invigilator: 'Dr. V. Murthy',
          theory_max: 70,
          practical_max: 30,
          passing_marks: 35
        }
      ]
    });
    setShowExamModal(false);
  };

  const handleSyncOffline = (examId: string) => {
    const res = simulateOfflineSync(examId);
    setSyncFeedback({ id: examId, status: res.status, message: res.message });
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const availableHeads: FeeHeadDefinition[] = [
    ...(multiStream === 'School' ? DEFAULT_SCHOOL_FEE_HEADS : DEFAULT_COLLEGE_FEE_HEADS),
    ...customFeeHeads.filter(h => h.institution_type === multiStream || h.institution_type === 'All')
  ];

  const filteredHeads = availableHeads.filter(h =>
    h.title.toLowerCase().includes(headSearchQuery.toLowerCase()) ||
    h.category.toLowerCase().includes(headSearchQuery.toLowerCase()) ||
    h.head_code.toLowerCase().includes(headSearchQuery.toLowerCase())
  );

  const toggleFeeHead = (head: FeeHeadDefinition) => {
    if (multiSelectedHeadCodes.includes(head.head_code)) {
      setMultiSelectedHeadCodes(multiSelectedHeadCodes.filter(c => c !== head.head_code));
    } else {
      setMultiSelectedHeadCodes([...multiSelectedHeadCodes, head.head_code]);
      if (!multiHeadAmounts[head.head_code]) {
        setMultiHeadAmounts(prev => ({
          ...prev,
          [head.head_code]: { collected: head.default_amount, concession: 0 }
        }));
      }
    }
  };

  const handleExecuteMultiHeadCollection = () => {
    const selectedStudent = students.find(s => s.id === multiStudentId) || students[0];
    const feeItems: MultiHeadFeeItem[] = multiSelectedHeadCodes.map(code => {
      const headDef = availableHeads.find(h => h.head_code === code) || {
        head_code: code,
        title: code.replace(/_/g, ' '),
        category: 'General',
        default_amount: 5000,
        id: code,
        is_refundable: false,
        institution_type: 'All'
      };
      const amounts = multiHeadAmounts[code] || { collected: headDef.default_amount, concession: 0 };
      return {
        head_code: code,
        head_title: headDef.title,
        category: headDef.category,
        configured_amount: headDef.default_amount,
        previously_paid: 0,
        concession_amount: amounts.concession || 0,
        collected_amount: amounts.collected !== undefined ? Number(amounts.collected) : headDef.default_amount
      };
    });

    const receipt = collectMultiHeadFee({
      student_id: selectedStudent.id,
      student_name: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      admission_number: selectedStudent.admission_number,
      class_name: selectedStudent.class_name,
      academic_year: multiAcademicYear,
      term_code: multiTerm,
      term_name: multiTerm === 'TERM_1' ? 'Term 1 / Semester 1' : 'Term 2 / Semester 2',
      fee_items: feeItems,
      payment_method: multiPaymentMethod,
      reference_number: multiTxnRef || `TXN-UPI-${Date.now().toString().slice(-6)}`,
      notes: multiNotes,
      collected_by: currentRole === 'ACCOUNTANT' ? 'Authorized Cashier' : `${currentRole} User`
    });

    setActiveReceiptForModal(receipt);
    setShowReceiptModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Top Banner with Role Switcher & Reset */}
      <header className="bg-slate-950 border-b border-slate-800 text-white px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              EducationOS Enterprise Sandbox
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Super Admin Controlled Permissions • Institutional Examination Suite • Role Autocomplete
            </span>
          </div>

          {/* Quick Role Switcher Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulate Role:</span>
            <select
              value={currentRole}
              onChange={(e) => {
                const nextRole = e.target.value as UserRoleType;
                switchRole(nextRole);
                setActiveTab('dashboard');
              }}
              className="bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="CHAIRMAN_DIRECTOR">🏛️ Chairman / Director (Institution Super Admin)</option>
              <option value="PRINCIPAL">👑 Principal (Academics & Approvals)</option>
              <option value="ACCOUNTANT">💰 Accountant / Finance Officer</option>
              <option value="EXAM_CONTROLLER">📝 Examination Controller</option>
              <option value="INSTITUTION_ADMIN">⚙️ Institution Admin</option>
              <option value="VICE_PRINCIPAL">🎓 Vice Principal</option>
              <option value="ADMISSION_OFFICER">📋 Admission Officer</option>
              <option value="HR_MANAGER">👥 HR & Staff Manager</option>
              <option value="TEACHER">👩‍🏫 Teacher (I PUC Physics)</option>
              <option value="LECTURER">🔬 Senior PU Lecturer</option>
              <option value="LIBRARIAN">📚 Librarian</option>
              <option value="HOSTEL_WARDEN">🏠 Hostel Warden</option>
              <option value="TRANSPORT_MANAGER">🚌 Transport Manager</option>
              <option value="DRIVER">🚍 Bus Driver</option>
              <option value="PARENT">👨‍👩‍👧 Parent (Ramesh Kumar - Rahul's Parent)</option>
              <option value="STUDENT">🎒 Student (Rahul Kumar - I PUC PCMB)</option>
              <option value="SUPER_ADMIN">🌐 Platform Super Admin (SaaS Root)</option>
              <option value="BACKUP_SUPER_ADMIN">🛡️ Backup Super Admin</option>
              <option value="DEVELOPER">💻 Developer / Tech Support</option>
            </select>

            <button
              onClick={resetDemoData}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Reset sandbox data to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data
            </button>

            <a
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Full Login Portal →
            </a>
          </div>
        </div>
      </header>

      {/* Role Privilege Inspector Header */}
      <div className="bg-slate-800/80 border-b border-slate-700 px-4 py-2.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            {currentPrivilege.title}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'BACKUP_SUPER_ADMIN') ? (
              <>
                <strong className="text-slate-100 font-semibold">Scope: </strong>
                {currentPrivilege.scopes.map(s => `${s.scopeType}: ${s.description}`).join(' • ')}
              </>
            ) : (
              <span className="text-slate-300 font-medium">
                Akshara Global Campus • Affiliation # 830192 • Karnataka State PU Board
              </span>
            )}
          </span>
        </div>
        {(currentRole === 'SUPER_ADMIN' || currentRole === 'BACKUP_SUPER_ADMIN') ? (
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-400">
              <strong>Can Edit:</strong> {currentPrivilege.canEdit.join(', ')}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">
              <strong>Restriction:</strong> {currentPrivilege.restrictedActions[0]}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">Academic Session: 2026-2027</span>
            <span>•</span>
            <span>Front Counter Terminal</span>
          </div>
        )}
      </div>

      {/* Main Sandbox Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Dynamic Sidebar with Presentation States (Visible / Locked / Hidden) */}
        <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
              A
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">Akshara Global ERP</h2>
              <span className="text-[10px] text-slate-400">School & College Campus</span>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const lockInfo = isTabLocked(item.id);
              const allowed = isTabAllowed(item.id);

              // Check if tab is completely hidden
              const designerItems = designerNavConfigs[currentRole] || [];
              const designerMatch = designerItems.find(it => it.id === item.id);
              if (designerMatch && designerMatch.presentationState === 'COMPLETELY_HIDDEN') {
                return null; // Omitted from DOM
              }

              // Institution Control Centre is only visible for leadership
              if (item.id === 'institution-control-centre' && currentRole !== 'CHAIRMAN_DIRECTOR' && currentRole !== 'DIRECTOR' && currentRole !== 'MANAGING_DIRECTOR' && currentRole !== 'SUPER_ADMIN') {
                return null;
              }

              // Super Admin permission matrix & dashboard designer are restricted to Super Admin & Chairman
              if (item.isSuperAdminOnly && currentRole !== 'SUPER_ADMIN' && currentRole !== 'BACKUP_SUPER_ADMIN' && currentRole !== 'CHAIRMAN_DIRECTOR') {
                return null; // Omitted completely from DOM & navigation for Principal and other staff
              }

              if (lockInfo.locked) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      alert(`🔒 Locked Module:\n\n${lockInfo.reason}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 transition-all cursor-not-allowed"
                    title={lockInfo.reason}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  </button>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.isSuperAdminOnly && (
                    <span className="text-[9px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded font-bold uppercase">
                      Super Admin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Institution Admin Permission Request Callout */}
          {currentRole === 'INSTITUTION_ADMIN' && (
            <div className="p-3 m-3 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-200 text-xs">
              <p className="font-bold flex items-center gap-1.5 text-indigo-300 mb-1">
                <Key className="w-3.5 h-3.5" />
                Need More Privileges?
              </p>
              <p className="text-[11px] text-slate-400 mb-2">
                Institution Admins cannot grant permissions directly. Submit requests to Super Admin.
              </p>
              <button
                onClick={() => setShowChangeReqModal(true)}
                className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Request Privileges
              </button>
            </div>
          )}
        </aside>

        {/* Central Dynamic Content Screen */}
        <main className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-6 text-slate-100">

          {/* ================================================================= */}
          {/* TAB 1: ROLE-BASED DASHBOARD OVERVIEW WORKSPACE */}
          {/* ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl">
              <RoleWorkspaceDispatcher
                currentRole={currentRole}
                onNavigateTab={(tabId) => setActiveTab(tabId)}
              />

              {/* RBAC Access Boundaries Summary - Shown ONLY to Platform Super Admin & Backup Super Admin */}
              {(currentRole === 'SUPER_ADMIN' || currentRole === 'BACKUP_SUPER_ADMIN') ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Platform Security & Active Role Authorization Matrix
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Permitted Actions</p>
                      <ul className="text-xs space-y-1.5 text-slate-300">
                        {currentPrivilege.canEdit.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Approval Powers</p>
                      <ul className="text-xs space-y-1.5 text-slate-300">
                        {currentPrivilege.canApprove.map((app, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <span>{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Security Restrictions</p>
                      <ul className="text-xs space-y-1.5 text-slate-300">
                        {currentPrivilege.restrictedActions.map((res, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* Institutional Operations Summary for Ordinary Roles */
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        Campus Operations & Academic Live Highlights
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Term 1 (2026-2027) • Affiliated with CBSE & Karnataka Pre-University Board
                      </p>
                    </div>
                    <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-3 py-1 rounded-full font-bold">
                      Session Active • All Streams Operating
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">Class Attendance Today</p>
                      <p className="text-lg font-bold text-emerald-400 mt-1">96.5%</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">1,348 of 1,396 students present</p>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">Term 1 Fee Realisation</p>
                      <p className="text-lg font-bold text-blue-400 mt-1">₹85.4 Lakhs</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">77.6% of ₹1.10 Cr target collected</p>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">Ongoing Exam Cycles</p>
                      <p className="text-lg font-bold text-amber-400 mt-1">4 Batches Active</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">NEET Foundation & Term Tests</p>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 font-medium">GPS Transport Tracking</p>
                      <p className="text-lg font-bold text-teal-400 mt-1">8 Buses on Route</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Live geo-telemetry broadcasting</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: CENTRAL PERMISSION MANAGEMENT CONTROL CENTRE (Super Admin) */}
          {/* ================================================================= */}
          
          {/* ================================================================= */}
          {/* INSTITUTION MANAGEMENT CONTROL CENTRE (Chairman / Director) */}
          {/* ================================================================= */}
          {activeTab === 'institution-control-centre' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-purple-950/40 p-6 rounded-2xl border border-purple-800/60">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40 mb-2">
                    <Building2 className="w-3 h-3" />
                    Institution Super Admin Control Room
                  </div>
                  <h1 className="text-2xl font-black text-white">Institution Management & Governance Centre</h1>
                  <p className="text-xs text-purple-200 mt-1">
                    Chairman & Director Executive Suite • Staff Role Delegations • Central Permission Matrix • Strategic Financial Oversight
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-900/60 text-purple-200 border border-purple-700 text-xs font-bold">
                    Akshara Global Educational Trust
                  </span>
                </div>
              </div>

              {/* Executive Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Enrolled Students</span>
                  <p className="text-2xl font-black text-white mt-1">1,396</p>
                  <p className="text-xs text-slate-400 mt-0.5">School (680) • PU College (480) • Degree (236)</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Gross Fee Realisation</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">₹85.4 Lakhs</p>
                  <p className="text-xs text-slate-400 mt-0.5">77.6% of ₹1.10 Cr target collected</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Faculty & Non-Teaching Staff</span>
                  <p className="text-2xl font-black text-blue-400 mt-1">84 Staff</p>
                  <p className="text-xs text-slate-400 mt-0.5">58 Teaching • 26 Administrative & Support</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">NEET & Board Projection</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">98.4% Pass</p>
                  <p className="text-xs text-slate-400 mt-0.5">62 Students targeting NEET &gt; 580+</p>
                </div>
              </div>

              {/* Chairman Executive Direct Actions */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Institutional Super Admin Governance Capabilities
                </h3>
                <p className="text-xs text-slate-400">
                  As Chairman / Director, you hold institutional authority. Principal handles daily academic operations and exam approvals, while you control users, custom roles, campus permissions, custom fee heads, and dashboard layouts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                      <Key className="w-4 h-4" />
                      Central Permission Matrix
                    </div>
                    <p className="text-xs text-slate-400">
                      Configure granular action permissions (view, edit, approve, collect, publish) for all 18 institutional roles.
                    </p>
                    <button
                      onClick={() => setActiveTab('permissions-centre')}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Open Permission Matrix →
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                      <Layout className="w-4 h-4" />
                      Dynamic Dashboard Designer
                    </div>
                    <p className="text-xs text-slate-400">
                      Control which sidebar menus are visible, locked, or completely hidden for Teachers, Students, and Parents.
                    </p>
                    <button
                      onClick={() => setActiveTab('dashboard-designer')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Open Dashboard Designer →
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <CreditCard className="w-4 h-4" />
                      Financial Ledger & Statements
                    </div>
                    <p className="text-xs text-slate-400">
                      Review consolidated fee statements, audit ₹50k + ₹30k partial payments, and inspect receipt histories.
                    </p>
                    <button
                      onClick={() => { setActiveTab('fees'); setFeeSubTab('statement'); }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Consolidated Ledger →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions-centre' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-purple-950/40 p-6 rounded-2xl border border-purple-800/60">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40 mb-2">
                    <Key className="w-3 h-3" />
                    Platform Super Admin Only
                  </div>
                  <h1 className="text-2xl font-black text-white">Central Permission Management Control Centre</h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Configure granular action-level privileges, scopes, temporary expiries, and review audit history.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-3 py-1 rounded-lg">
                    Permission Database: Immutable & Non-Destructive
                  </span>
                </div>
              </div>

              {/* Pending Permission Change Requests from Institutions */}
              {changeRequests.length > 0 && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
                    <span>Pending Permission Change Requests from Institution Admins ({changeRequests.filter(r => r.status === 'PENDING').length})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Super Admin Approval Workflow</span>
                  </h3>

                  <div className="space-y-2">
                    {changeRequests.map((req) => (
                      <div key={req.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            <span>{req.requestedByName}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              Target Role: {req.targetRole}
                            </span>
                            <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono">
                              Action: {req.action}
                            </span>
                          </p>
                          <p className="text-slate-400 mt-1">{req.justification}</p>
                          <span className="text-[10px] text-slate-500">Submitted: {req.submittedAt}</span>
                        </div>
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => reviewPermissionChangeRequest(req.id, true, 'Approved by Super Admin')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => reviewPermissionChangeRequest(req.id, false, 'Denied due to institutional security policy')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable Action-Level Matrix */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    Role × Fine-Grained Action Permission Matrix
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Click any checkbox to toggle live permission • Deny-by-default enforced
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="p-2.5 font-bold">Role</th>
                        <th className="p-2.5 font-bold text-center">View</th>
                        <th className="p-2.5 font-bold text-center">Create</th>
                        <th className="p-2.5 font-bold text-center">Edit</th>
                        <th className="p-2.5 font-bold text-center">Delete</th>
                        <th className="p-2.5 font-bold text-center">Submit</th>
                        <th className="p-2.5 font-bold text-center">Verify</th>
                        <th className="p-2.5 font-bold text-center">Approve</th>
                        <th className="p-2.5 font-bold text-center">Publish</th>
                        <th className="p-2.5 font-bold text-center">Export</th>
                        <th className="p-2.5 font-bold text-center">Collect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {(Object.keys(rolePermissions) as UserRoleType[]).map((role) => {
                        const actions = rolePermissions[role];
                        const isSuper = role === 'SUPER_ADMIN';
                        return (
                          <tr key={role} className="hover:bg-slate-900/60">
                            <td className="p-2.5 font-bold text-slate-200">
                              <span>{role.replace('_', ' ')}</span>
                              {isSuper && <span className="ml-1.5 text-[9px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">Lockout Protected</span>}
                            </td>
                            {(['view', 'create', 'edit', 'delete', 'submit', 'verify', 'approve', 'publish', 'export', 'collect'] as FineGrainedAction[]).map((act) => (
                              <td key={act} className="p-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={actions[act] || false}
                                  disabled={isSuper && act === 'view'}
                                  onChange={(e) => {
                                    updateRoleActionPermission(role, act, e.target.checked, `Super Admin matrix toggle for ${act}`);
                                  }}
                                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Version History & Audited Rollback */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    Permission Version History & Audit Trail
                  </h3>
                  <span className="text-[10px] text-slate-400">Rollback creates a new audited record (never erases history)</span>
                </div>

                <div className="space-y-2">
                  {permissionAudits.map((audit) => (
                    <div key={audit.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span className="bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono text-[10px]">
                            v{audit.version}
                          </span>
                          <span>{audit.actionType}</span>
                          <span className="text-[10px] text-slate-400 font-normal">by {audit.actingSuperAdmin}</span>
                        </div>
                        <p className="text-slate-300 text-xs mt-1">{audit.description}</p>
                        <span className="text-[10px] text-slate-500">{audit.timestamp}</span>
                      </div>
                      {audit.canRollback && (
                        <button
                          onClick={() => rollbackPermissionVersion(audit.version)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Rollback to v{audit.version}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: SUPER ADMIN DASHBOARD & ACCESS DESIGNER */}
          {/* ================================================================= */}
          {activeTab === 'dashboard-designer' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-950/40 p-6 rounded-2xl border border-blue-800/60">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/40 mb-2">
                    <Layout className="w-3 h-3" />
                    Super Admin Exclusive
                  </div>
                  <h1 className="text-2xl font-black text-white">Institution Dashboard & Access Designer</h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Configure the 3 independent controls per role: Menu Visibility (Show/Hide), Module Access (Allowed/Blocked), and Presentation State (Visible / Locked / Hidden).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg ${designerStatus === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                    Version {designerVersion} ({designerStatus})
                  </span>
                  <button
                    onClick={() => publishDashboardDesignerConfig('Published updated presentation states and module locks')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Publish Config
                  </button>
                </div>
              </div>

              {/* Role Preview Switcher */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview Dashboard As:</span>
                  <select
                    value={designerRolePreview}
                    onChange={(e) => setDesignerRolePreview(e.target.value as UserRoleType)}
                    className="bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="PRINCIPAL">Principal / Director</option>
                    <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                    <option value="ACCOUNTANT">Finance & Accounts Officer</option>
                    <option value="EXAM_CONTROLLER">Controller of Examinations</option>
                    <option value="TEACHER">Faculty / Teacher</option>
                    <option value="PARENT">Parent / Guardian</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400">
                  <span>Simulating safe layout preview • Zero leakage of production credentials</span>
                </div>
              </div>

              {/* Designer Config Table */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Navigation Tab Controls for {designerRolePreview}
                </h3>

                <div className="divide-y divide-slate-800">
                  {(designerNavConfigs[designerRolePreview] || []).map((nav) => (
                    <div key={nav.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{nav.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            nav.presentationState === 'VISIBLE_ACCESSIBLE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : nav.presentationState === 'VISIBLE_LOCKED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {nav.presentationState}
                          </span>
                        </p>
                        {nav.lockReason && (
                          <p className="text-[11px] text-amber-400/90 mt-0.5">🔒 Lock Explanation: {nav.lockReason}</p>
                        )}
                      </div>

                      {/* Control buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => updateDesignerItemState(designerRolePreview, nav.id, 'VISIBLE_ACCESSIBLE')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            nav.presentationState === 'VISIBLE_ACCESSIBLE'
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          Visible & Open
                        </button>

                        <button
                          onClick={() => updateDesignerItemState(designerRolePreview, nav.id, 'VISIBLE_LOCKED', `Restricted for role ${designerRolePreview}`)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            nav.presentationState === 'VISIBLE_LOCKED'
                              ? 'bg-amber-600 text-white border-amber-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          Visible but Locked
                        </button>

                        <button
                          onClick={() => updateDesignerItemVisibility(designerRolePreview, nav.id, nav.menuVisibility === 'SHOW' ? 'HIDE' : 'SHOW')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            nav.menuVisibility === 'HIDE'
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {nav.menuVisibility === 'HIDE' ? 'Hidden (Omitted)' : 'Hide Tab'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: INSTITUTIONAL EXAMINATION MANAGEMENT SUITE */}
          {/* ================================================================= */}
          {activeTab === 'examinations' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Institutional Examination Management System</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Institutional Exam Schedules • Paper-based Offline & Online CBT • 4-Stage Approval Workflow
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('marks-register')}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Marks Register
                  </button>
                  <button
                    onClick={() => setActiveTab('hall-tickets')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Hall Tickets
                  </button>
                  <button
                    onClick={() => setActiveTab('notice-board')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Notice Board
                  </button>
                  <button
                    onClick={() => setShowExamModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    + Schedule New Exam
                  </button>
                </div>
              </div>

              {/* Sync Feedback Toast */}
              {syncFeedback && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                  syncFeedback.status === 'APPLIED'
                    ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
                    : 'bg-amber-950/80 text-amber-200 border-amber-800'
                }`}>
                  <span>{syncFeedback.message}</span>
                  <span className="font-mono text-[10px] uppercase font-bold">{syncFeedback.status}</span>
                </div>
              )}

              {/* Category & Delivery Mode Filters */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-400 uppercase text-[11px]">Category:</span>
                {(['ALL', 'Weekly Test', 'Unit Test', 'Half-Yearly', 'NEET Foundation', 'Model Exam'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setExamCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      examCategoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <span className="ml-3 font-bold text-slate-400 uppercase text-[11px]">Mode:</span>
                {(['ALL', 'Offline (Paper-based)', 'Internal Online', 'External Provider Adapter'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setExamModeFilter(m)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      examModeFilter === m
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Examinations List */}
              <div className="space-y-4">
                {exams
                  .filter(e => examCategoryFilter === 'ALL' || e.category === examCategoryFilter)
                  .filter(e => examModeFilter === 'ALL' || e.exam_mode === examModeFilter)
                  .map((exam) => (
                    <div key={exam.id} className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white">{exam.title}</h3>
                            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                              {exam.category}
                            </span>
                            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
                              {exam.exam_mode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Target: {exam.class_name} • Academic Year {exam.academic_year}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg font-mono ${
                            exam.status === 'PUBLISHED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : exam.status === 'PRINCIPAL_APPROVED'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            Status: {exam.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* 4-Stage Approval Workflow Visualizer */}
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Strict 4-Stage Academic Result Approval Workflow:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                          {/* Stage 1 */}
                          <div className={`p-2.5 rounded-lg border ${
                            exam.status !== 'SCHEDULED'
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            <p className="font-bold">Stage 1: Marks Entry</p>
                            <p className="text-[10px] text-slate-400">Teacher marks entry</p>
                            {exam.status === 'SCHEDULED' && (
                              <button
                                onClick={() => submitMarksAsTeacher(exam.id)}
                                className="mt-1.5 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Submit Draft Marks
                              </button>
                            )}
                          </div>

                          {/* Stage 2 */}
                          <div className={`p-2.5 rounded-lg border ${
                            ['CONTROLLER_VERIFIED', 'PRINCIPAL_APPROVED', 'PUBLISHED'].includes(exam.status)
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            <p className="font-bold">Stage 2: Exam Controller</p>
                            <p className="text-[10px] text-slate-400">Audit missing marks</p>
                            {exam.status === 'MARKS_ENTRY' && (
                              <button
                                onClick={() => verifyExamAsController(exam.id)}
                                className="mt-1.5 px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Verify & Audit
                              </button>
                            )}
                          </div>

                          {/* Stage 3 */}
                          <div className={`p-2.5 rounded-lg border ${
                            ['PRINCIPAL_APPROVED', 'PUBLISHED'].includes(exam.status)
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            <p className="font-bold">Stage 3: Principal Seal</p>
                            <p className="text-[10px] text-slate-400">Official approval</p>
                            {exam.status === 'CONTROLLER_VERIFIED' && (
                              <button
                                onClick={() => approveExamAsPrincipal(exam.id)}
                                className="mt-1.5 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Approve as Principal
                              </button>
                            )}
                          </div>

                          {/* Stage 4 */}
                          <div className={`p-2.5 rounded-lg border ${
                            exam.status === 'PUBLISHED'
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            <p className="font-bold">Stage 4: Publication</p>
                            <p className="text-[10px] text-slate-400">Parent & Student Portal</p>
                            {exam.status === 'PRINCIPAL_APPROVED' && (
                              <button
                                onClick={() => publishExamResults(exam.id)}
                                className="mt-1.5 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Publish Live
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timetable & Logistics Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                              <th className="p-2.5">Date & Time</th>
                              <th className="p-2.5">Subject</th>
                              <th className="p-2.5">Hall / Room</th>
                              <th className="p-2.5">Invigilator</th>
                              <th className="p-2.5">Theory Max</th>
                              <th className="p-2.5">Pract. Max</th>
                              <th className="p-2.5">Pass Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {exam.schedules.map((sch) => (
                              <tr key={sch.id} className="hover:bg-slate-900/50">
                                <td className="p-2.5 font-mono text-slate-300">
                                  {sch.exam_date} <span className="text-[10px] text-slate-500">{sch.start_time} - {sch.end_time}</span>
                                </td>
                                <td className="p-2.5 font-bold text-white">{sch.subject}</td>
                                <td className="p-2.5 text-slate-300">{sch.room}</td>
                                <td className="p-2.5 text-slate-300">{sch.invigilator}</td>
                                <td className="p-2.5 font-mono text-slate-300">{sch.theory_max}</td>
                                <td className="p-2.5 font-mono text-slate-300">{sch.practical_max}</td>
                                <td className="p-2.5 font-mono text-amber-400 font-bold">{sch.passing_marks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Offline Sync & Export Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSyncOffline(exam.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-bold cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                            Simulate Offline Local Sync
                          </button>

                          <button
                            onClick={() => alert(`Bulk Excel template generated for ${exam.title} with validation schema.`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-bold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            Download Marks Excel Template
                          </button>
                        </div>

                        {exam.status === 'PUBLISHED' && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Live on Parent & Student Portals
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: INSTITUTION LOGIN SIMULATOR WITH ROLE AUTOCOMPLETE */}
          {/* ================================================================= */}
          
          {/* ================================================================= */}
          {/* TAB 4B: ADVANCED STUDENT PROGRESS CARDS & ACADEMIC ANALYTICS */}
          {/* ================================================================= */}
          {activeTab === 'progress-cards' && (() => {
            const indCard = individualProgressCards[0];
            const consCard = consolidatedProgressCards[0];
            const compRep = competitiveReports[0];

            return (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <h1 className="text-2xl font-black text-white">Advanced Student Progress Cards & Academic Analytics</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Multi-Exam Report Cards • Annual Consolidated Trajectory • NEET & JEE Foundation Analytics
                    </p>
                  </div>

                  {/* Sub-tab pills */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setProgressCardSubTab('individual')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        progressCardSubTab === 'individual'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Individual Exam Card
                    </button>
                    <button
                      onClick={() => setProgressCardSubTab('consolidated')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        progressCardSubTab === 'consolidated'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Annual Trajectory (+13%)
                    </button>
                    <button
                      onClick={() => setProgressCardSubTab('competitive')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        progressCardSubTab === 'competitive'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      NEET Foundation Analytics
                    </button>
                  </div>
                </div>

                {/* Sub-tab 1: Individual Exam Progress Card */}
                {progressCardSubTab === 'individual' && indCard && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                          Official Term Assessment Report Card
                        </span>
                        <h2 className="text-xl font-black text-white mt-0.5">{indCard.examName}</h2>
                        <p className="text-xs text-slate-400">
                          Academic Session: {indCard.academicYear} • Class: {indCard.className}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Student: <strong className="text-white">{indCard.studentName}</strong></span>
                        <span className="text-xs text-slate-400 block font-mono">Admission #: {indCard.admissionNumber}</span>
                        <span className="text-xs text-emerald-400 font-bold block">Class Attendance: {indCard.attendancePct}%</span>
                      </div>
                    </div>

                    {/* Marks Breakdown Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3 text-right">Theory (Max)</th>
                            <th className="px-4 py-3 text-right">Practical (Max)</th>
                            <th className="px-4 py-3 text-right">Total Obtained</th>
                            <th className="px-4 py-3 text-center">Grade</th>
                            <th className="px-4 py-3">Teacher Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {indCard.subjects.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="px-4 py-3 font-bold text-white">{sub.subjectName}</td>
                              <td className="px-4 py-3 text-right font-mono text-slate-300">{sub.theoryObtained} / {sub.theoryMax}</td>
                              <td className="px-4 py-3 text-right font-mono text-slate-300">{sub.practicalMax > 0 ? `${sub.practicalObtained} / ${sub.practicalMax}` : '-'}</td>
                              <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">
                                {sub.totalObtained} / {sub.totalMax}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-black text-[11px]">
                                  {sub.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 text-[11px]">{sub.remarks}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-900 font-black border-t-2 border-slate-700">
                            <td className="px-4 py-3 text-white uppercase tracking-wider">Grand Total</td>
                            <td colSpan={2} className="px-4 py-3 text-center text-slate-400 text-xs">Four Core Disciplines</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-400 text-base font-black">
                              {indCard.totalObtained} / {indCard.totalMax}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2.5 py-0.5 rounded bg-blue-900 text-blue-200 font-black text-xs">
                                {indCard.overallPercentage}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-emerald-300 font-bold">{indCard.overallGrade}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Teacher Remarks & Approval Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Class Teacher Remarks:</span>
                        <p className="text-xs text-slate-200 italic">"{indCard.teacherRemarks}"</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Exam Controller Verification:</span>
                          <span className="text-xs font-bold text-white block mt-1">{indCard.controllerVerifiedBy}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Stage 2 Audit Passed</span>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Principal Approval Seal:</span>
                          <span className="text-xs font-bold text-white block mt-1">{indCard.principalApprovedBy}</span>
                          <span className="text-[10px] text-blue-400 font-mono">Stage 3 Officially Sealed</span>
                        </div>
                        <Award className="w-6 h-6 text-blue-400 shrink-0" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Annual Trajectory (+13% Gain) */}
                {progressCardSubTab === 'consolidated' && consCard && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-xl font-black text-white">Consolidated Annual Academic Trajectory</h2>
                        <p className="text-xs text-slate-400">
                          Student: <strong className="text-white">{consCard.studentName}</strong> • Class: {consCard.className} • Overall GPA: <strong className="text-emerald-400">{consCard.overallGpa}</strong>
                        </p>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Net Gain: +{consCard.netGainPercentagePoints}% Improvement
                      </div>
                    </div>

                    {/* Progression Timeline Chart Simulation */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {consCard.trajectoryTrend.map((t, idx) => (
                        <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.examName}</span>
                          <p className="text-2xl font-black text-white mt-1">{t.percentage}%</p>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{t.date}</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${t.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Academic Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Class Attendance</span>
                        <p className="text-xl font-black text-emerald-400 mt-1">{consCard.overallAttendancePct}%</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Regularity benchmark achieved</p>
                      </div>
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Practical Lab Proficiency</span>
                        <p className="text-xl font-black text-blue-400 mt-1">{consCard.practicalProficiencyPct}%</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Physics & Chemistry practical logbooks</p>
                      </div>
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Assignments & Homework</span>
                        <p className="text-xl font-black text-purple-400 mt-1">{consCard.assignmentsScore}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Continuous assessment record</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 3: NEET Foundation Analytics */}
                {progressCardSubTab === 'competitive' && compRep && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-1">
                          {compRep.programme}
                        </div>
                        <h2 className="text-xl font-black text-white">{compRep.testName}</h2>
                        <p className="text-xs text-slate-400">
                          Student: <strong className="text-white">{compRep.studentName}</strong> ({compRep.admissionNumber})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-400 block">{compRep.netScore} / {compRep.totalMarks}</span>
                        <span className="text-xs text-slate-400">Percentile: <strong className="text-white">{compRep.percentileEstimate}th %tile</strong></span>
                      </div>
                    </div>

                    {/* Question Attempt Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Questions</span>
                        <p className="text-2xl font-black text-white mt-1">{compRep.totalQuestions}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Physics, Chem, Botany, Zoo</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">Correct Answers (+4)</span>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{compRep.correctAnswers}</p>
                        <p className="text-[10px] text-emerald-300 mt-0.5">+{compRep.correctMarks} Marks</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-rose-400 block">Incorrect (-1)</span>
                        <p className="text-2xl font-black text-rose-400 mt-1">{compRep.incorrectAnswers}</p>
                        <p className="text-[10px] text-rose-300 mt-0.5">{compRep.negativeMarks} Negative Marks</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy Ratio</span>
                        <p className="text-2xl font-black text-amber-400 mt-1">{compRep.accuracyPct}%</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Unattempted: {compRep.unattemptedQuestions}</p>
                      </div>
                    </div>

                    {/* Subject Breakdown Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-2.5">Subject Section</th>
                            <th className="px-4 py-2.5 text-center">Questions</th>
                            <th className="px-4 py-2.5 text-center">Correct</th>
                            <th className="px-4 py-2.5 text-center">Incorrect</th>
                            <th className="px-4 py-2.5 text-right">Net Score</th>
                            <th className="px-4 py-2.5 text-right">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {compRep.subjectBreakdown.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="px-4 py-3 font-bold text-white">{s.subject}</td>
                              <td className="px-4 py-3 text-center text-slate-300">{s.questions}</td>
                              <td className="px-4 py-3 text-center text-emerald-400 font-bold">{s.correct}</td>
                              <td className="px-4 py-3 text-center text-rose-400 font-bold">{s.incorrect}</td>
                              <td className="px-4 py-3 text-right font-mono font-black text-emerald-400">{s.netMarks} / 180</td>
                              <td className="px-4 py-3 text-right font-mono text-slate-300 font-bold">{s.accuracyPct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'institution-login' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Institution-Branded Login Portal Experience
                </div>
                <h1 className="text-2xl font-black text-white">Role-Based Autocomplete & Secure Session</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Restricted user suggestion after 2-4 characters • Verified tenant isolation
                </p>
              </div>

              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                {/* 1. Select Login Role Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>1. Select Login Role</span>
                    </label>
                    <span className="text-[10px] text-blue-400 font-semibold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                      Scope: {loginRole}
                    </span>
                  </div>
                  <select
                    value={loginRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRoleType;
                      setLoginRole(r);
                      if (r === 'TEACHER') setSelectedUserIdentity('Dr. V. Murthy (EMP-PHY-102)');
                      else if (r === 'PARENT') setSelectedUserIdentity('Rajesh Sharma (Father of Aarav - Class 10)');
                      else if (r === 'STUDENT') setSelectedUserIdentity('Ananya Hegde (ADM-2026-092)');
                      else if (r === 'ACCOUNTANT') setSelectedUserIdentity('K. S. Narayana (EMP-ACC-09)');
                      else if (r === 'EXAM_CONTROLLER') setSelectedUserIdentity('Prof. S. Joshi (EMP-EC-02)');
                      else if (r === 'TRANSPORT_MANAGER') setSelectedUserIdentity('Suresh Gowda (Route 104 Fleet)');
                      else if (r === 'SUPER_ADMIN') setSelectedUserIdentity('Platform Super Administrator (PLATFORM-ROOT)');
                      else if (r === 'BACKUP_SUPER_ADMIN') setSelectedUserIdentity('Secondary Platform Administrator (PLATFORM-BACKUP-01)');
                      else if (r === 'DEVELOPER') setSelectedUserIdentity('Lead Platform Engineer / Support (DEV-ENG-42)');
                      else setSelectedUserIdentity('Dr. Ramesh Kumar (EMP-PRIN-01)');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="PRINCIPAL">👑 Principal / Director (Leadership)</option>
                    <option value="INSTITUTION_ADMIN">🏛️ Institution Admin (Operations)</option>
                    <option value="ACCOUNTANT">💰 Accountant / Finance Desk (Accounts)</option>
                    <option value="EXAM_CONTROLLER">📝 Examination Controller (Academics)</option>
                    <option value="TEACHER">👩‍🏫 Faculty / Lecturer (Academics)</option>
                    <option value="PARENT">👨‍👩‍👧 Parent / Guardian (Portal)</option>
                    <option value="STUDENT">🎒 Enrolled Student (Portal)</option>
                    <option value="TRANSPORT_MANAGER">🚌 Transport Manager (Fleet)</option>
                    <option value="SUPER_ADMIN">🌐 Platform Super Admin (Root)</option>
                    <option value="BACKUP_SUPER_ADMIN">🛡️ Backup Super Admin (Security)</option>
                    <option value="DEVELOPER">💻 Developer / Tech Support (DevOps)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Role selection filters accounts and loads assigned permissions.
                  </p>
                </div>

                {/* 2. User Autocomplete Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>2. User Account (Restricted to {loginRole})</span>
                    <span className="text-[10px] text-slate-400">Minimal Identifying Info</span>
                  </label>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">{selectedUserIdentity}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      Verified Active
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={loginSearch}
                      onChange={(e) => setLoginSearch(e.target.value)}
                      placeholder={`Type 2+ characters to search ${loginRole}s...`}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 3. Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoginSuccess(true);
                    switchRole(loginRole);
                    setTimeout(() => {
                      setLoginSuccess(false);
                      setActiveTab('dashboard');
                    }, 1200);
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginSuccess ? 'Session Verified! Loading Dashboard...' : `Sign In as ${loginRole.replace('_', ' ')}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: ACADEMIC CURRICULUM & SUBJECT MANAGEMENT */}
          {/* ================================================================= */}
          {activeTab === 'academics' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Academic Structure & Subject Management</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Schools, PU Colleges & Degree Colleges Curriculum • Visual Priority Reordering & Safe Archival
                  </p>
                </div>
                <button
                  onClick={() => alert('New subject creator ready for Institution Admin.')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  + Add Subject to Curriculum
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Configured Subjects ({subjects.filter(s => !s.is_archived).length} Active)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Use Up/Down controls to reorder subjects in syllabus & timetable
                  </span>
                </div>

                <div className="space-y-2">
                  {subjects
                    .filter(s => !s.is_archived)
                    .map((subj, idx) => (
                      <div
                        key={subj.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {/* Reordering Controls */}
                          <div className="flex flex-col gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => reorderSubjects(idx, idx - 1)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                              title="Move Up in Curriculum Priority"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === subjects.length - 1}
                              onClick={() => reorderSubjects(idx, idx + 1)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                              title="Move Down in Curriculum Priority"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded font-bold">
                                {subj.code}
                              </span>
                              <h4 className="font-bold text-white text-sm">{subj.name}</h4>
                              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-semibold">
                                {subj.institution_level}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                subj.is_compulsory ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {subj.is_compulsory ? 'Compulsory' : 'Elective'}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">
                              Class: {subj.target_class} {subj.stream_or_comb ? `(${subj.stream_or_comb})` : ''} • Assigned Faculty: {subj.assigned_teacher}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right font-mono">
                            <span className="text-slate-400 block text-[10px]">Marks Split</span>
                            <span className="text-white font-bold">{subj.theory_marks} Theory / {subj.practical_marks} Pract.</span>
                          </div>

                          <button
                            onClick={() => archiveSubject(subj.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                            title="Archives subject while preserving historical marks"
                          >
                            Archive Subject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: FLEXIBLE FEE MANAGEMENT & AUTOMATIC RECEIPT GENERATION */}
          {/* ================================================================= */}
          {activeTab === 'fees' && (
            <div className="space-y-6 max-w-7xl">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Authoritative Finance & Ledger
                    </span>
                    <span className="text-xs text-slate-400">
                      {currentRole === 'ACCOUNTANT' ? 'Cashier Desk Session' : `${currentRole} View`}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white mt-1">
                    School-Defined Fees & Receipt Management
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Multi-Term Flexible Structures • Instant Multi-Format Thermal/A4 Receipts • Duplicate Anti-Fraud Watermarking • Consolidated & Aging Due Reports
                  </p>
                </div>

                {/* Sub-Tab Navigation Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setFeeSubTab('statement')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'statement'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Consolidated Statement (Acceptance Test)
                  </button>
                  <button
                    onClick={() => setFeeSubTab('collection')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'collection'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Fee Collection
                  </button>
                  <button
                    onClick={() => setFeeSubTab('register')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'register'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Receipt Register ({receipts.length})
                  </button>
                  <button
                    onClick={() => setFeeSubTab('consolidated')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'consolidated'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Consolidated Reports
                  </button>
                  <button
                    onClick={() => setFeeSubTab('dues')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'dues'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Due Reports
                  </button>
                  <button
                    onClick={() => setFeeSubTab('structures')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      feeSubTab === 'structures'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Fee Structures
                  </button>
                </div>
              </div>

              {/* Feedback Notifications */}
              {reprintFeedback && (
                <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl flex items-center justify-between text-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{reprintFeedback}</span>
                  </div>
                  <button onClick={() => setReprintFeedback(null)} className="text-emerald-400 hover:text-white font-bold">Dismiss</button>
                </div>
              )}

              {/* ============================================================= */}
              {/* SUB-TAB 1: ACCOUNTANT FEE COLLECTION DESK */}
              {/* ============================================================= */}
                            {/* ============================================================= */}
              {/* SUB-TAB 0: CONSOLIDATED STUDENT FEE STATEMENT & ACCEPTANCE TEST */}
              {/* ============================================================= */}
              {feeSubTab === 'statement' && (() => {
                const statement = getStudentConsolidatedStatement(selectedStatementStudentId);
                const testState = acceptanceTestState;

                const handleRunPayment1 = () => {
                  const receipt = runAcceptanceTestPayment1();
                  setAcceptanceTestFeedback('Step 1 Complete: Payment 1 (₹50,000) successfully processed! Receipt REC-2026-00125 generated.');
                  setActiveReceiptForModal(receipt);
                  setTimeout(() => setAcceptanceTestFeedback(null), 6000);
                };

                const handleRunPayment2 = () => {
                  const receipt = runAcceptanceTestPayment2();
                  setAcceptanceTestFeedback('Step 2 Complete: Payment 2 (₹30,000) processed! Receipt REC-2026-00126 generated. Receipt REC-2026-00125 preserved intact!');
                  setActiveReceiptForModal(receipt);
                  setTimeout(() => setAcceptanceTestFeedback(null), 6000);
                };

                const handleResetTest = () => {
                  resetAcceptanceTest();
                  setAcceptanceTestFeedback('Acceptance test state reset to initial unpaid baseline (₹1,50,000 Due).');
                  setTimeout(() => setAcceptanceTestFeedback(null), 4000);
                };

                return (
                  <div className="space-y-6">
                    {/* Feedback Toast */}
                    {acceptanceTestFeedback && (
                      <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-between">
                        <span>{acceptanceTestFeedback}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px]">VERIFIED</span>
                      </div>
                    )}

                    {/* Acceptance Test Control Banner */}
                    <div className="bg-slate-950 p-6 rounded-2xl border-2 border-blue-500/40 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 mb-1">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                            Official Architecture Acceptance Test Runner
                          </div>
                          <h2 className="text-xl font-black text-white">
                            Two-Payment Dynamic Recalculation Acceptance Test (Rahul Kumar)
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Demonstrates individual payment receipts, persistent receipt preservation, and consolidated fee statement recalculation.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            testState.stage === 'STAGE_2_PAID_30K'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : testState.stage === 'STAGE_1_PAID_50K'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {testState.stage === 'STAGE_2_PAID_30K' ? 'Payment 1 & 2 Both Paid (Balance ₹70,000)' : testState.stage === 'STAGE_1_PAID_50K' ? 'Payment 1 Paid (Balance ₹1,00,000)' : 'Initial State (Balance ₹1,50,000)'}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Step-by-Step Test Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          onClick={handleRunPayment1}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          ▶ Step 1: Simulate Payment 1 (₹50,000)
                        </button>
                        <button
                          onClick={handleRunPayment2}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          ▶ Step 2: Simulate Payment 2 (₹30,000)
                        </button>
                        <button
                          onClick={handleResetTest}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset to Initial State (₹0 Paid)
                        </button>
                      </div>

                      {/* 4 Accountant Operations Buttons */}
                      <div className="border-t border-slate-800/80 pt-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                          Mandatory Accountant Action Suite:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              const targetReceipt = testState.generatedReceipts[testState.generatedReceipts.length - 1] || receipts[0];
                              setActiveReceiptForModal(targetReceipt);
                              setShowReceiptModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-blue-400" />
                            1. View / Print Individual Receipt
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            2. Generate Consolidated Fee Statement
                          </button>
                          <button
                            onClick={() => {
                              alert(`Term-wise Fee History for ${statement.studentName}:\nTerm 1 (June-Aug): ₹85,000 due, Paid ₹50,000 (REC-2026-00125)\nTerm 2 (Sept-Nov): ₹65,000 due, Paid ₹30,000 (REC-2026-00126)\nRemaining Total Balance: ₹70,000`);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            3. Term-wise Fee History
                          </button>
                          <button
                            onClick={() => {
                              alert(`FEE DUE NOTICE GENERATED\nStudent: ${statement.studentName} (${statement.admissionNumber})\nParent: ${statement.parentName}\nTotal Outstanding Due: ₹${statement.totalBalanceDue.toLocaleString('en-IN')}\nNotice dispatched to registered phone: +91 98450 99887`);
                            }}
                            className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            4. Generate Fee Due Statement
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Student Selection Header & Details */}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Select Student for Consolidated Financial Statement:
                          </label>
                          <select
                            value={selectedStatementStudentId}
                            onChange={(e) => setSelectedStatementStudentId(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white font-bold text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="st-rahul">Rahul Kumar (AKG-2026-0152 • I PUC PCMB • Acceptance Test Student)</option>
                            <option value="st-2">Ananya Hegde (ADM-2026-002 • I PUC PCMB)</option>
                            <option value="st-1">Aarav Sharma (ADM-2026-001 • Class 10-A)</option>
                            <option value="st-3">Rohan Verma (ADM-2026-003 • B.Sc Computer Science)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent / Guardian:</span>
                            <span className="text-white font-bold">{statement.parentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Course & Stream:</span>
                            <span className="text-white font-bold">{statement.courseClass} - {statement.sectionOrStream}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Session:</span>
                            <span className="text-white font-bold">{statement.academicYear}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial KPI Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 uppercase font-bold">Total Annual Fee</span>
                          <p className="text-2xl font-black text-white mt-1">₹{statement.totalAnnualFee.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Approved annual institutional schedule</p>
                        </div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 uppercase font-bold">Total Amount Paid</span>
                          <p className="text-2xl font-black text-emerald-400 mt-1">₹{statement.totalPaid.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Realised across {statement.receiptHistory.length} confirmed receipts</p>
                        </div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 uppercase font-bold">Outstanding Balance Due</span>
                          <p className={`text-2xl font-black mt-1 ${statement.totalBalanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            ₹{statement.totalBalanceDue.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Status: {statement.paymentStatus}</p>
                        </div>
                      </div>

                      {/* Fee-Head Allocation Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Fee Head / Description</th>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3 text-right">Annual Fee</th>
                              <th className="px-4 py-3 text-right">Term 1 Due</th>
                              <th className="px-4 py-3 text-right">Term 2 Due</th>
                              <th className="px-4 py-3 text-right">Total Paid</th>
                              <th className="px-4 py-3 text-right">Outstanding Balance</th>
                              <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {statement.feeHeads.map((head) => (
                              <tr key={head.feeHeadId} className="hover:bg-slate-900/60">
                                <td className="px-4 py-3 font-bold text-white">{head.feeHeadName}</td>
                                <td className="px-4 py-3 text-slate-400">{head.category}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-200">₹{head.annualFee.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-400">₹{head.term1Due.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-slate-400">₹{head.term2Due.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">₹{head.paidAmount.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-mono text-amber-400 font-bold">₹{head.balanceDue.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    head.status === 'PAID' ? 'bg-emerald-950 text-emerald-300' : head.status === 'PARTIAL' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                                  }`}>
                                    {head.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-slate-900 font-black border-t-2 border-slate-700">
                              <td colSpan={2} className="px-4 py-3.5 text-white uppercase tracking-wider text-xs">Total Consolidated Account</td>
                              <td className="px-4 py-3.5 text-right font-mono text-white text-sm">₹{statement.totalAnnualFee.toLocaleString('en-IN')}</td>
                              <td colSpan={2} className="px-4 py-3.5 text-slate-400 text-center text-[10px]">Installments Active</td>
                              <td className="px-4 py-3.5 text-right font-mono text-emerald-400 text-sm">₹{statement.totalPaid.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3.5 text-right font-mono text-amber-400 text-sm">₹{statement.totalBalanceDue.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-900 text-blue-200">
                                  {statement.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Linked Payment Receipts History Table */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Receipt className="w-3.5 h-3.5 text-blue-400" />
                          Permanent Payment Receipts Linked to this Student ({statement.receiptHistory.length})
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                              <tr>
                                <th className="px-4 py-2.5">Receipt #</th>
                                <th className="px-4 py-2.5">Payment Date</th>
                                <th className="px-4 py-2.5">Method & Reference</th>
                                <th className="px-4 py-2.5">Fee Allocations Breakdown</th>
                                <th className="px-4 py-2.5 text-right">Amount Received</th>
                                <th className="px-4 py-2.5 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {statement.receiptHistory.map((rcp) => (
                                <tr key={rcp.id} className="hover:bg-slate-900/60">
                                  <td className="px-4 py-3 font-mono font-bold text-blue-400">{rcp.receipt_number}</td>
                                  <td className="px-4 py-3 text-slate-300">{rcp.payment_date}</td>
                                  <td className="px-4 py-3 text-slate-300">
                                    <span className="font-semibold text-white">{rcp.payment_method}</span>
                                    <span className="block text-[10px] text-slate-500 font-mono">{rcp.transaction_reference}</span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    <div className="flex flex-wrap gap-1">
                                      {rcp.allocations.map((a, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                                          {a.title}: <strong className="text-emerald-400">₹{a.allocated.toLocaleString('en-IN')}</strong>
                                        </span>
                                      ))}
                                    </div>
                                    <span className="block text-[10px] text-slate-500 italic mt-0.5">
                                      Words: {rcp.amount_in_words || 'Confirmed in full'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm">
                                    ₹{rcp.amount_paid.toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => {
                                        setActiveReceiptForModal(rcp);
                                        setShowReceiptModal(true);
                                      }}
                                      className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      View / Print
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {feeSubTab === 'collection' && (
                <div className="space-y-6">
                  {/* Searchable Multi-Head Fee Collection Counter */}
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div>
                        <h2 className="text-base font-black text-white flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-emerald-400" />
                          Multi-Head Cashier Fee Collection & Instant Receipt
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Search & select multiple fee heads in a single transaction • Auto-calculated dues, concessions & instant receipt emission
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddHeadModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Institution Fee Head
                        </button>
                      </div>
                    </div>

                    {/* Form Controls: Student, Academic Year, Term, Stream */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* 1. Student Selector */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">1. Select Enrolled Student</label>
                        <select
                          value={multiStudentId}
                          onChange={(e) => {
                            setMultiStudentId(e.target.value);
                            const st = students.find(s => s.id === e.target.value);
                            if (st) {
                              const isPuc = st.institution_level === 'PU College';
                              setMultiStream(isPuc ? 'PU College' : 'School');
                              setMultiSelectedHeadCodes(isPuc
                                ? ['PU_TUITION_FEE', 'PHYSICS_CHEM_BIO_LAB', 'PU_LIBRARY_READING']
                                : ['TUITION_FEE', 'SCIENCE_LAB_FEE', 'LIBRARY_FEE']);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                        >
                          {students.map((st) => (
                            <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                              {st.first_name} {st.last_name} ({st.admission_number} • {st.class_name})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Academic Year */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">2. Academic Session</label>
                        <select
                          value={multiAcademicYear}
                          onChange={(e) => setMultiAcademicYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="2026-2027">2026-2027 (Active Session)</option>
                          <option value="2027-2028">2027-2028 (Next Session)</option>
                        </select>
                      </div>

                      {/* 3. Term / Installment */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">3. Term / Installment</label>
                        <select
                          value={multiTerm}
                          onChange={(e) => setMultiTerm(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="TERM_1">Term 1 / Semester 1 (June-Aug)</option>
                          <option value="TERM_2">Term 2 / Semester 2 (Sept-Nov)</option>
                          <option value="TERM_3">Term 3 / Semester 3 (Dec-Feb)</option>
                          <option value="ANNUAL">Full Annual Consolidated</option>
                        </select>
                      </div>

                      {/* 4. Curriculum / Stream */}
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">4. Standard Fee Catalog</label>
                        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700">
                          <button
                            type="button"
                            onClick={() => {
                              setMultiStream('School');
                              setMultiSelectedHeadCodes(['TUITION_FEE', 'SCIENCE_LAB_FEE', 'LIBRARY_FEE']);
                            }}
                            className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                              multiStream === 'School'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            School (21 Heads)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMultiStream('PU College');
                              setMultiSelectedHeadCodes(['PU_TUITION_FEE', 'PHYSICS_CHEM_BIO_LAB', 'PU_LIBRARY_READING']);
                            }}
                            className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                              multiStream === 'PU College'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            PU College (18 Heads)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Searchable Multi-Select Fee Head Dropdown & Active Pills */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-blue-400" />
                          Search & Select Fee Heads ({multiSelectedHeadCodes.length} Selected)
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Searchable dropdown across {availableHeads.length} institution fee heads
                        </span>
                      </div>

                      {/* Search Input */}
                      <div className="relative mb-2">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={headSearchQuery}
                          onChange={(e) => setHeadSearchQuery(e.target.value)}
                          placeholder="Search fee head by name, code or category (e.g. Tuition, Lab, Hostel, Transport, Caution Deposit)..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Active Selected Fee Heads Pills */}
                      {multiSelectedHeadCodes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                          <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Active Heads:</span>
                          {multiSelectedHeadCodes.map(code => {
                            const hd = availableHeads.find(h => h.head_code === code) || { title: code.replace(/_/g, ' '), head_code: code };
                            return (
                              <span
                                key={code}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900/40 border border-blue-500/40 text-blue-200 text-xs font-semibold"
                              >
                                <span>{hd.title}</span>
                                <button
                                  type="button"
                                  onClick={() => setMultiSelectedHeadCodes(multiSelectedHeadCodes.filter(c => c !== code))}
                                  className="text-blue-400 hover:text-white font-bold ml-1 cursor-pointer"
                                  title="Remove fee head"
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Filtered Dropdown Options (shows matching results when searching or click to view) */}
                      {headSearchQuery.trim().length > 0 && (
                        <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 shadow-xl mb-3">
                          {filteredHeads.map(h => {
                            const isSelected = multiSelectedHeadCodes.includes(h.head_code);
                            return (
                              <button
                                key={h.id}
                                type="button"
                                onClick={() => toggleFeeHead(h)}
                                className={`p-2 rounded-lg text-left text-xs flex items-center justify-between border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <div className="truncate min-w-0 pr-2">
                                  <p className="truncate font-semibold">{h.title}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">₹{h.default_amount.toLocaleString()} • {h.category}</span>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                  {isSelected ? '✓ Added' : '+ Add'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Fee Head Breakdown & Collection Input Table */}
                    {multiSelectedHeadCodes.length > 0 ? (
                      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                              <th className="p-3">Fee Head Title</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Configured Base</th>
                              <th className="p-3">Concession / Disc. (₹)</th>
                              <th className="p-3">Net Due (₹)</th>
                              <th className="p-3 text-right">Collect In This Receipt (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {multiSelectedHeadCodes.map(code => {
                              const headDef = availableHeads.find(h => h.head_code === code) || {
                                head_code: code,
                                title: code.replace(/_/g, ' '),
                                category: 'General',
                                default_amount: 5000,
                                id: code,
                                is_refundable: false,
                                institution_type: 'All'
                              };
                              const amounts = multiHeadAmounts[code] || { collected: headDef.default_amount, concession: 0 };
                              const netDue = Math.max(0, headDef.default_amount - (amounts.concession || 0));

                              return (
                                <tr key={code} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="p-3 font-semibold text-white">
                                    {headDef.title}
                                    {headDef.is_refundable && (
                                      <span className="ml-1.5 text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">Refundable</span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-semibold">
                                      {headDef.category}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-bold text-slate-300">₹{headDef.default_amount.toLocaleString()}</td>
                                  <td className="p-3">
                                    <input
                                      type="number"
                                      min="0"
                                      max={headDef.default_amount}
                                      value={amounts.concession || ''}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const conc = Math.max(0, Number(e.target.value) || 0);
                                        const newColl = Math.max(0, headDef.default_amount - conc);
                                        setMultiHeadAmounts(prev => ({
                                          ...prev,
                                          [code]: { collected: newColl, concession: conc }
                                        }));
                                      }}
                                      className="w-24 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    />
                                  </td>
                                  <td className="p-3 font-mono font-bold text-rose-400">₹{netDue.toLocaleString()}</td>
                                  <td className="p-3 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      max={netDue}
                                      value={amounts.collected !== undefined ? amounts.collected : netDue}
                                      onChange={(e) => {
                                        const coll = Math.max(0, Number(e.target.value) || 0);
                                        setMultiHeadAmounts(prev => ({
                                          ...prev,
                                          [code]: { ...amounts, collected: coll }
                                        }));
                                      }}
                                      className="w-28 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300 font-mono font-bold text-xs text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-950 border-t border-slate-800 font-bold text-xs">
                              <td colSpan={4} className="p-3 text-slate-400 text-right uppercase">
                                Total Collection in this Transaction:
                              </td>
                              <td colSpan={2} className="p-3 text-right">
                                <span className="text-xl font-black text-emerald-400 font-mono">
                                  ₹{multiSelectedHeadCodes.reduce((sum, code) => {
                                    const hd = availableHeads.find(h => h.head_code === code);
                                    const defAmt = hd?.default_amount || 5000;
                                    const amt = multiHeadAmounts[code];
                                    return sum + (amt?.collected !== undefined ? Number(amt.collected) : defAmt);
                                  }, 0).toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-slate-400 text-xs">
                        No fee heads selected. Choose from the catalog or search above to add heads to this collection.
                      </div>
                    )}

                    {/* Payment Mode, Reference & Instant Collect Action */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">Payment Method</label>
                        <select
                          value={multiPaymentMethod}
                          onChange={(e) => setMultiPaymentMethod(e.target.value as PaymentMethodType)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="UPI">UPI / QR Code Scan</option>
                          <option value="CASH">Cash Counter Payment</option>
                          <option value="ONLINE_NETBANKING">Online / Netbanking</option>
                          <option value="CHEQUE">Bank Cheque / DD</option>
                          <option value="BANK_TRANSFER">NEFT / RTGS Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">Transaction Ref / Cheque #</label>
                        <input
                          type="text"
                          value={multiTxnRef}
                          onChange={(e) => setMultiTxnRef(e.target.value)}
                          placeholder="e.g. UPI-UTR-90128471"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">Front Desk Receipt Note</label>
                        <input
                          type="text"
                          value={multiNotes}
                          onChange={(e) => setMultiNotes(e.target.value)}
                          placeholder="e.g. Collected at main counter"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleExecuteMultiHeadCollection}
                        disabled={multiSelectedHeadCodes.length === 0}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Confirm & Collect Fee • Generate Official Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Filter & Historical Ledger Invoices Table */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-400 uppercase text-[11px]">Ledger Head Filter:</span>
                      {(['ALL', 'COLLEGE_FEE', 'LAB_FEE', 'HOSTEL_MESS_FEE', 'TRANSPORT_FEE', 'EXAM_FEE'] as const).map((head) => (
                        <button
                          key={head}
                          onClick={() => setFeeCategoryFilter(head)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            feeCategoryFilter === head
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {head.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="text-slate-400 text-xs">
                      Total Ledger Invoices: <span className="text-white font-bold">{invoices.length}</span>
                    </div>
                  </div>

                  {/* Student Ledger Invoices Table */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        Active Student Fee Accounts & Invoices
                      </h2>
                      <span className="text-[11px] text-slate-400">
                        Select an invoice below to process partial or full settlement with instantaneous receipt emission.
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                            <th className="p-3">Invoice #</th>
                            <th className="p-3">Student & Admission</th>
                            <th className="p-3">Term / Head</th>
                            <th className="p-3">Total Payable</th>
                            <th className="p-3">Paid Amount</th>
                            <th className="p-3">Outstanding Balance</th>
                            <th className="p-3">Due Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Collection Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {invoices
                            .filter(inv => feeCategoryFilter === 'ALL' || inv.fee_head === feeCategoryFilter)
                            .map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-900/60 transition-colors">
                                <td className="p-3 font-mono text-slate-300 font-bold">{inv.invoice_number}</td>
                                <td className="p-3">
                                  <span className="font-bold text-white block">{inv.student_name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{inv.admission_number} • {inv.class_name}</span>
                                </td>
                                <td className="p-3">
                                  <span className="text-slate-200 block font-semibold">{inv.term_name || 'Term 1'}</span>
                                  <span className="text-[9px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                    {inv.fee_head.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="p-3 font-mono font-bold text-slate-200">₹{inv.total_amount.toLocaleString()}</td>
                                <td className="p-3 font-mono text-emerald-400 font-semibold">₹{inv.paid_amount.toLocaleString()}</td>
                                <td className="p-3 font-mono font-bold text-rose-400">₹{inv.balance_amount.toLocaleString()}</td>
                                <td className="p-3 font-mono text-slate-400 text-[11px]">{inv.due_date}</td>
                                <td className="p-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    inv.status === 'PAID'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : inv.status === 'OVERDUE'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                                  }`}>
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  {inv.balance_amount > 0 ? (
                                    <button
                                      onClick={() => {
                                        setSelectedInvoiceForPayment(inv);
                                        setPaymentAmount(inv.balance_amount);
                                        setTransactionRef(`TXN/${Date.now().toString().slice(-6)}`);
                                      }}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-blue-500/20 cursor-pointer"
                                    >
                                      Collect & Issue Receipt
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        const rcp = receipts.find(r => r.invoice_id === inv.id);
                                        if (rcp) {
                                          setActiveReceiptForModal(rcp);
                                          setShowReceiptModal(true);
                                        }
                                      }}
                                      className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                                    >
                                      <Receipt className="w-3.5 h-3.5" /> View Receipt
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Collection Drawer / Form Modal */}
                  {selectedInvoiceForPayment && (
                    <div className="bg-slate-950 p-6 rounded-2xl border-2 border-blue-500/50 shadow-2xl space-y-4">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Active Collection Terminal
                          </span>
                          <h3 className="text-lg font-bold text-white mt-1">
                            Collect Payment for {selectedInvoiceForPayment.student_name} ({selectedInvoiceForPayment.admission_number})
                          </h3>
                          <p className="text-xs text-slate-400">
                            Invoice #{selectedInvoiceForPayment.invoice_number} • {selectedInvoiceForPayment.class_name} • {selectedInvoiceForPayment.fee_title}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedInvoiceForPayment(null)}
                          className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Invoice Due:</span>
                          <p className="text-lg font-black text-white font-mono">₹{selectedInvoiceForPayment.total_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Already Paid:</span>
                          <p className="text-lg font-black text-emerald-400 font-mono">₹{selectedInvoiceForPayment.paid_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Current Balance:</span>
                          <p className="text-lg font-black text-rose-400 font-mono">₹{selectedInvoiceForPayment.balance_amount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Payment Amount (Supports Partial Instalments):
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="1"
                              max={selectedInvoiceForPayment.balance_amount}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(Math.min(selectedInvoiceForPayment.balance_amount, Math.max(1, Number(e.target.value))))}
                              className="w-full bg-slate-900 border border-slate-700 text-white pl-8 pr-3 py-2 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex gap-2 mt-1.5">
                            <button
                              onClick={() => setPaymentAmount(selectedInvoiceForPayment.balance_amount)}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold px-2 py-0.5 rounded cursor-pointer"
                            >
                              Pay Full (₹{selectedInvoiceForPayment.balance_amount.toLocaleString()})
                            </button>
                            <button
                              onClick={() => setPaymentAmount(Math.ceil(selectedInvoiceForPayment.balance_amount / 2))}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded cursor-pointer"
                            >
                              50% Instalment
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Payment Method:
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                            className="w-full bg-slate-900 border border-slate-700 text-amber-300 px-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="UPI">📱 UPI (QR / PhonePe / GPay / Paytm)</option>
                            <option value="CASH">💵 Cash at Counter</option>
                            <option value="BANK_TRANSFER">🏦 Bank Transfer (NEFT / RTGS / IMPS)</option>
                            <option value="ONLINE_NETBANKING">💳 Online Net Banking / Gateway</option>
                            <option value="CHEQUE">📑 Cheque / Demand Draft</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Transaction Reference / UTR Number:
                          </label>
                          <input
                            type="text"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            placeholder="e.g. UPI/89210 or UTR987654321"
                            className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentVerificationConfirmed}
                            onChange={(e) => setPaymentVerificationConfirmed(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
                          />
                          <span>Confirm funds verified in bank account or cash drawer</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoiceForPayment(null)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={!paymentVerificationConfirmed || paymentAmount <= 0}
                            onClick={() => {
                              const rcp = collectFeeWithReceipt({
                                invoiceId: selectedInvoiceForPayment.id,
                                amount: paymentAmount,
                                paymentMethod,
                                transactionRef,
                                notes: paymentNotes
                              });
                              setSelectedInvoiceForPayment(null);
                              setActiveReceiptForModal(rcp);
                              setShowReceiptModal(true);
                            }}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm Payment & Issue Official Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* SUB-TAB 2: SEARCHABLE RECEIPT REGISTER & HISTORICAL REPRINTS */}
              {/* ============================================================= */}
              {feeSubTab === 'register' && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={receiptRegisterSearch}
                        onChange={(e) => setReceiptRegisterSearch(e.target.value)}
                        placeholder="Search by Receipt #, Student Name, or Admission ID..."
                        className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">Method:</span>
                      <select
                        value={receiptRegisterFilterMethod}
                        onChange={(e) => setReceiptRegisterFilterMethod(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold"
                      >
                        <option value="ALL">All Methods</option>
                        <option value="UPI">UPI</option>
                        <option value="CASH">Cash</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="ONLINE_NETBANKING">Online Gateway</option>
                      </select>
                    </div>
                  </div>

                  {/* Register Table */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                            <th className="p-3">Receipt #</th>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Payment Date</th>
                            <th className="p-3">Term / Academic</th>
                            <th className="p-3">Method & Ref</th>
                            <th className="p-3">Amount Paid</th>
                            <th className="p-3">Rem. Balance</th>
                            <th className="p-3">Duplicate Status</th>
                            <th className="p-3 text-center">Receipt Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {receipts
                            .filter(r => {
                              const matchQ =
                                !receiptRegisterSearch ||
                                r.receipt_number.toLowerCase().includes(receiptRegisterSearch.toLowerCase()) ||
                                r.student_name.toLowerCase().includes(receiptRegisterSearch.toLowerCase()) ||
                                r.admission_number.toLowerCase().includes(receiptRegisterSearch.toLowerCase());
                              const matchMethod =
                                receiptRegisterFilterMethod === 'ALL' || r.payment_method === receiptRegisterFilterMethod;
                              return matchQ && matchMethod;
                            })
                            .map((rcp) => (
                              <tr key={rcp.id} className="hover:bg-slate-900/60 transition-colors">
                                <td className="p-3 font-mono font-bold text-amber-300">
                                  {rcp.receipt_number}
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-white block">{rcp.student_name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{rcp.admission_number} • {rcp.class_name}</span>
                                </td>
                                <td className="p-3 font-mono text-slate-300 text-[11px]">{rcp.payment_date}</td>
                                <td className="p-3">
                                  <span className="text-slate-200 block">{rcp.term_name}</span>
                                  <span className="text-[10px] text-slate-400">{rcp.academic_year}</span>
                                </td>
                                <td className="p-3">
                                  <span className="text-blue-400 font-bold block">{rcp.payment_method}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{rcp.transaction_reference}</span>
                                </td>
                                <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                                  ₹{rcp.amount_paid.toLocaleString()}
                                </td>
                                <td className="p-3 font-mono text-slate-300">
                                  ₹{rcp.current_balance.toLocaleString()}
                                </td>
                                <td className="p-3">
                                  {rcp.is_duplicate ? (
                                    <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                      DUPLICATE (x{rcp.reprint_count})
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                      ORIGINAL
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setActiveReceiptForModal(rcp);
                                        setShowReceiptModal(true);
                                      }}
                                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                      title="View / Print Receipt Layout"
                                    >
                                      <Printer className="w-3 h-3" /> Preview
                                    </button>
                                    <button
                                      onClick={() => {
                                        const updated = reprintReceipt(rcp.id);
                                        setActiveReceiptForModal(updated);
                                        setShowReceiptModal(true);
                                        setReprintFeedback(`Receipt ${updated.receipt_number} reprinted. Watermarked as DUPLICATE (#${updated.reprint_count}).`);
                                      }}
                                      className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Reprint with DUPLICATE stamp & audit logging"
                                    >
                                      <RotateCcw className="w-3 h-3" /> Reprint Duplicate
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* SUB-TAB 3: CONSOLIDATED COLLECTION REPORTS */}
              {/* ============================================================= */}
              {feeSubTab === 'consolidated' && (() => {
                const totalExpected = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
                const totalCollected = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
                const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance_amount, 0);
                const collectionPct = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0';
                const fullyPaid = invoices.filter(i => i.balance_amount <= 0.01).length;
                const partialPaid = invoices.filter(i => i.paid_amount > 0 && i.balance_amount > 0.01).length;
                const unpaid = invoices.filter(i => i.paid_amount <= 0.01).length;

                // Category-wise mapping
                const catMap: Record<string, { expected: number; collected: number; balance: number }> = {};
                invoices.forEach(inv => {
                  const c = inv.fee_head;
                  if (!catMap[c]) catMap[c] = { expected: 0, collected: 0, balance: 0 };
                  catMap[c].expected += inv.total_amount;
                  catMap[c].collected += inv.paid_amount;
                  catMap[c].balance += inv.balance_amount;
                });

                const handleExportCSV = () => {
                  const headers = "Category,Expected,Collected,Outstanding,Collection %\n";
                  const rows = Object.entries(catMap)
                    .map(([cat, d]) => `${cat},${d.expected},${d.collected},${d.balance},${((d.collected/d.expected)*100).toFixed(1)}%`)
                    .join("\n");
                  const blob = new Blob([headers + rows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Consolidated_Fee_Report_${reportAcademicYear}.csv`;
                  a.click();
                };

                return (
                  <div className="space-y-6">
                    {/* Report Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400 uppercase">Academic Year:</span>
                        <select
                          value={reportAcademicYear}
                          onChange={(e) => setReportAcademicYear(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-xl font-bold"
                        >
                          <option value="2026-2027">2026-2027 (Current)</option>
                          <option value="2025-2026">2025-2026</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportCSV}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Excel (CSV)
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Report
                        </button>
                      </div>
                    </div>

                    {/* Executive KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Expected Fee</span>
                        <p className="text-2xl font-black text-white font-mono mt-1">₹{totalExpected.toLocaleString()}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Institutional Total Demand</span>
                      </div>
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                        <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">Total Fee Collected</span>
                        <p className="text-2xl font-black text-emerald-400 font-mono mt-1">₹{totalCollected.toLocaleString()}</p>
                        <span className="text-[10px] text-emerald-500 mt-1 block">{collectionPct}% of demand collected</span>
                      </div>
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                        <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">Total Outstanding Balance</span>
                        <p className="text-2xl font-black text-rose-400 font-mono mt-1">₹{totalOutstanding.toLocaleString()}</p>
                        <span className="text-[10px] text-rose-500 mt-1 block">Pending across all terms</span>
                      </div>
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                        <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">Settlement Health</span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">{fullyPaid} Paid</span>
                          <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold">{partialPaid} Partial</span>
                          <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-bold">{unpaid} Unpaid</span>
                        </div>
                      </div>
                    </div>

                    {/* Category-Wise Breakdown Matrix */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="text-sm font-bold text-white">Fee Head Category Wise Collection Breakdown</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                              <th className="p-3">Fee Category Head</th>
                              <th className="p-3">Expected Amount</th>
                              <th className="p-3">Collected Amount</th>
                              <th className="p-3">Outstanding Amount</th>
                              <th className="p-3">Collection Progress</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {Object.entries(catMap).map(([cat, d]) => {
                              const pct = d.expected > 0 ? Math.round((d.collected / d.expected) * 100) : 0;
                              return (
                                <tr key={cat} className="hover:bg-slate-900/60">
                                  <td className="p-3 font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    {cat.replace('_', ' ')}
                                  </td>
                                  <td className="p-3 font-mono font-bold text-slate-200">₹{d.expected.toLocaleString()}</td>
                                  <td className="p-3 font-mono font-bold text-emerald-400">₹{d.collected.toLocaleString()}</td>
                                  <td className="p-3 font-mono font-bold text-rose-400">₹{d.balance.toLocaleString()}</td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        ></div>
                                      </div>
                                      <span className="font-mono text-[11px] font-bold text-slate-300 w-9 text-right">{pct}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ============================================================= */}
              {/* SUB-TAB 4: OUTSTANDING FEE DUE REPORTS (AGING & OVERDUE) */}
              {/* ============================================================= */}
              {feeSubTab === 'dues' && (() => {
                const today = new Date();
                const dueInvoices = invoices.filter(inv => inv.balance_amount > 0);

                const handleExportDueCSV = () => {
                  const headers = "Invoice,Student,AdmissionNo,Class,Category,Total,Paid,Balance,DueDate,OverdueDays,Status\n";
                  const rows = dueInvoices
                    .map(inv => {
                      const d = new Date(inv.due_date);
                      const overdueDays = Math.max(0, Math.floor((today.getTime() - d.getTime()) / (1000 * 3600 * 24)));
                      return `${inv.invoice_number},${inv.student_name},${inv.admission_number},${inv.class_name},${inv.fee_head},${inv.total_amount},${inv.paid_amount},${inv.balance_amount},${inv.due_date},${overdueDays},${inv.status}`;
                    })
                    .join("\n");
                  const blob = new Blob([headers + rows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Outstanding_Fee_Due_Report.csv`;
                  a.click();
                };

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400 uppercase">Filter Status:</span>
                        <select
                          value={dueReportStatusFilter}
                          onChange={(e) => setDueReportStatusFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-xl font-bold"
                        >
                          <option value="ALL">All Outstanding Dues</option>
                          <option value="OVERDUE">Strictly Overdue Only</option>
                          <option value="PARTIAL">Partially Settled</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportDueCSV}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Due Excel (CSV)
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Due List
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                              <th className="p-3">Student Name</th>
                              <th className="p-3">Admission #</th>
                              <th className="p-3">Class / Level</th>
                              <th className="p-3">Fee Category</th>
                              <th className="p-3">Total Amount</th>
                              <th className="p-3">Paid Amount</th>
                              <th className="p-3">Outstanding Balance</th>
                              <th className="p-3">Due Date</th>
                              <th className="p-3">Overdue Aging</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {dueInvoices
                              .filter(inv => dueReportStatusFilter === 'ALL' || inv.status === dueReportStatusFilter)
                              .map(inv => {
                                const d = new Date(inv.due_date);
                                const overdueDays = Math.max(0, Math.floor((today.getTime() - d.getTime()) / (1000 * 3600 * 24)));
                                return (
                                  <tr key={inv.id} className="hover:bg-slate-900/60">
                                    <td className="p-3 font-bold text-white">{inv.student_name}</td>
                                    <td className="p-3 font-mono text-slate-300">{inv.admission_number}</td>
                                    <td className="p-3 text-slate-300">{inv.class_name}</td>
                                    <td className="p-3">
                                      <span className="text-slate-200 block font-semibold">{inv.fee_title}</span>
                                      <span className="text-[9px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                                        {inv.fee_head.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="p-3 font-mono text-slate-200">₹{inv.total_amount.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-emerald-400">₹{inv.paid_amount.toLocaleString()}</td>
                                    <td className="p-3 font-mono font-bold text-rose-400 text-sm">₹{inv.balance_amount.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-slate-400">{inv.due_date}</td>
                                    <td className="p-3">
                                      {overdueDays > 0 ? (
                                        <span className="bg-rose-950 text-rose-300 border border-rose-800 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                                          {overdueDays} Days Overdue
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 text-[11px]">Due in future</span>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        inv.status === 'OVERDUE' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                                      }`}>
                                        {inv.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ============================================================= */}
              {/* SUB-TAB 5: SCHOOL-DEFINED FEE STRUCTURES & TERM CONFIGURATIONS */}
              {/* ============================================================= */}
              {feeSubTab === 'structures' && (
                <div className="space-y-6">
                  {/* Security Permission Status Banner */}
                  {currentRole !== 'SUPER_ADMIN' && currentRole !== 'INSTITUTION_ADMIN' ? (
                    <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl flex items-center gap-3 text-amber-200 text-xs">
                      <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold block">Financial Integrity Protection:</span>
                        <span>
                          Accountants and non-administrative staff have read-only access to academic fee configurations. Modifying fee amounts or term schedules requires explicit Super Admin authorization.
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {feeStructures.map((fs) => (
                      <div key={fs.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                          <div>
                            <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {fs.institution_type} Schedule ({fs.term_count} Terms)
                            </span>
                            <h3 className="text-lg font-bold text-white mt-1.5">{fs.institution_name}</h3>
                            <p className="text-xs text-slate-400 font-mono">
                              {fs.class_or_stream} • Academic Year {fs.academic_year} (v{fs.version})
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Total Fee</span>
                            <span className="text-xl font-black text-emerald-400 font-mono">₹{fs.total_annual_fee.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Term Schedule Breakdown */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                            Configured Terms / Semesters Schedule
                          </h4>
                          <div className="space-y-1.5">
                            {fs.terms_config.map((t) => (
                              <div key={t.term_code} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-white block">{t.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">Due Date: {t.due_date}</span>
                                </div>
                                <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                                  {t.share_pct}% Installment
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Fee Heads Breakdown */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                            Institution-Defined Fee Heads
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {fs.fee_heads.map((h) => (
                              <div key={h.head_code} className="bg-slate-900/40 p-2 rounded-lg border border-slate-850 flex items-center justify-between">
                                <span className="text-slate-300 text-[11px] truncate pr-2">{h.title}</span>
                                <span className="font-mono font-bold text-slate-200 shrink-0">₹{h.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 italic border-t border-slate-800/60 pt-2">
                          {fs.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* MULTI-FORMAT OFFICIAL RECEIPT PREVIEW & PRINT MODAL */}
              {/* ============================================================= */}
              {showReceiptModal && activeReceiptForModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
                    {/* Modal Top Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Official Verified Fee Receipt
                          </span>
                          {activeReceiptForModal.is_duplicate && (
                            <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-bold uppercase">
                              DUPLICATE (Reprint #{activeReceiptForModal.reprint_count})
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-black text-white mt-1">
                          Receipt #{activeReceiptForModal.receipt_number}
                        </h2>
                      </div>

                      {/* Format Switcher */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          onClick={() => setReceiptPrintLayout('A4')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            receiptPrintLayout === 'A4' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          A4 Standard
                        </button>
                        <button
                          onClick={() => setReceiptPrintLayout('80MM')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            receiptPrintLayout === '80MM' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          80mm Thermal
                        </button>
                        <button
                          onClick={() => setReceiptPrintLayout('58MM')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            receiptPrintLayout === '58MM' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          58mm Pocket
                        </button>
                      </div>
                    </div>

                    {/* LIVE RECEIPT CANVAS ACCORDING TO SELECTED LAYOUT */}
                    <div className="bg-white text-slate-900 rounded-xl p-6 shadow-inner overflow-x-auto relative">
                      {/* DUPLICATE WATERMARK (if duplicate) */}
                      {activeReceiptForModal.is_duplicate && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 rotate-[-25deg]">
                          <span className="text-5xl font-black text-rose-600 border-8 border-rose-600 px-6 py-2 rounded-2xl tracking-widest uppercase">
                            DUPLICATE
                          </span>
                        </div>
                      )}

                      {/* LAYOUT 1: A4 STANDARD OFFICIAL */}
                      {receiptPrintLayout === 'A4' && (
                        <div className="space-y-4 text-xs font-sans">
                          {/* Institutional Letterhead */}
                          <div className="text-center border-b-2 border-slate-900 pb-3">
                            <h1 className="text-base font-black uppercase tracking-wider text-slate-950">
                              {activeReceiptForModal.institution_branding.institution_name}
                            </h1>
                            <p className="text-[10px] text-slate-600 font-medium">
                              {activeReceiptForModal.institution_branding.affiliation}
                            </p>
                            <p className="text-[10px] text-slate-600">
                              {activeReceiptForModal.institution_branding.address} • Ph: {activeReceiptForModal.institution_branding.phone}
                            </p>
                            <span className="inline-block mt-1 bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 rounded uppercase">
                              FEE PAYMENT RECEIPT (OFFICIAL COPY)
                            </span>
                          </div>

                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                            <div>
                              <p><span className="font-bold text-slate-600">Receipt No:</span> <span className="font-mono font-bold text-slate-950">{activeReceiptForModal.receipt_number}</span></p>
                              <p><span className="font-bold text-slate-600">Date & Time:</span> <span>{activeReceiptForModal.payment_date}</span></p>
                              <p><span className="font-bold text-slate-600">Admission No:</span> <span className="font-mono font-bold">{activeReceiptForModal.admission_number}</span></p>
                              <p><span className="font-bold text-slate-600">Student Name:</span> <span className="font-bold text-slate-950">{activeReceiptForModal.student_name}</span></p>
                            </div>
                            <div>
                              <p><span className="font-bold text-slate-600">Class / Stream:</span> <span className="font-bold">{activeReceiptForModal.class_name}</span></p>
                              <p><span className="font-bold text-slate-600">Term / Session:</span> <span>{activeReceiptForModal.term_name} ({activeReceiptForModal.academic_year})</span></p>
                              <p><span className="font-bold text-slate-600">Payment Mode:</span> <span className="font-bold text-blue-700">{activeReceiptForModal.payment_method}</span></p>
                              <p><span className="font-bold text-slate-600">Transaction Ref:</span> <span className="font-mono">{activeReceiptForModal.transaction_reference}</span></p>
                            </div>
                          </div>

                          {/* Fee Allocations Table */}
                          <table className="w-full text-left text-[11px] border border-slate-300">
                            <thead className="bg-slate-100 border-b border-slate-300">
                              <tr>
                                <th className="p-2 border-r border-slate-300">Sl.</th>
                                <th className="p-2 border-r border-slate-300">Fee Head Category</th>
                                <th className="p-2 text-right border-r border-slate-300">Allocated Amount</th>
                                <th className="p-2 text-right">Head Balance Remaining</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-mono">
                              {activeReceiptForModal.allocations.map((alloc, idx) => (
                                <tr key={idx}>
                                  <td className="p-2 border-r border-slate-200">{idx + 1}</td>
                                  <td className="p-2 font-sans font-bold border-r border-slate-200 text-slate-900">{alloc.title}</td>
                                  <td className="p-2 text-right border-r border-slate-200 font-bold text-slate-950">₹{alloc.allocated.toLocaleString()}</td>
                                  <td className="p-2 text-right text-slate-600">₹{alloc.remaining.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Financial Summary */}
                          <div className="flex justify-between items-end border-t border-slate-300 pt-2 font-mono">
                            <div className="text-[10px] text-slate-600 space-y-0.5">
                              <p><span className="font-bold">QR Verification Code:</span> {activeReceiptForModal.qr_verification_code}</p>
                              <p><span className="font-bold">Status:</span> CONFIRMED • Cashier: {activeReceiptForModal.collected_by}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[11px] text-slate-600">Previous Balance: ₹{activeReceiptForModal.previous_balance.toLocaleString()}</p>
                              <p className="text-sm font-black text-slate-950">Net Amount Paid: ₹{activeReceiptForModal.amount_paid.toLocaleString()}</p>
                              <p className="text-[11px] font-bold text-slate-800">Remaining Balance: ₹{activeReceiptForModal.current_balance.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Signatures & Seal */}
                          <div className="flex justify-between items-center pt-6 text-[10px] text-slate-600 border-t border-slate-200">
                            <div className="text-center">
                              <div className="w-24 border-b border-slate-400 mb-1"></div>
                              <span>Student / Parent</span>
                            </div>
                            <div className="text-center">
                              <span className="font-bold text-slate-800 uppercase block mb-1">Akshara Accounts Dept</span>
                              <div className="w-28 border-b border-slate-900 mb-1"></div>
                              <span>Authorized Signatory Seal</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* LAYOUT 2: 80MM THERMAL POS (COUNTER POS PRINTER) */}
                      {receiptPrintLayout === '80MM' && (
                        <div className="max-w-[320px] mx-auto text-left font-mono text-[11px] leading-tight space-y-2 border border-dashed border-slate-400 p-4 bg-amber-50/20">
                          <div className="text-center border-b border-dashed border-slate-400 pb-2">
                            <p className="font-black text-sm">AKSHARA GLOBAL CAMPUS</p>
                            <p className="text-[9px]">BENGALURU - 560085</p>
                            <p className="text-[9px]">PH: +91 80 2345 6789</p>
                            {activeReceiptForModal.is_duplicate && (
                              <p className="text-rose-600 font-black text-[10px] mt-1">*** DUPLICATE RECEIPT (#{activeReceiptForModal.reprint_count}) ***</p>
                            )}
                          </div>
                          <div>
                            <p>RCPT #: {activeReceiptForModal.receipt_number}</p>
                            <p>DATE  : {activeReceiptForModal.payment_date}</p>
                            <p>STU   : {activeReceiptForModal.student_name}</p>
                            <p>ADM NO: {activeReceiptForModal.admission_number}</p>
                            <p>CLASS : {activeReceiptForModal.class_name}</p>
                          </div>
                          <div className="border-t border-b border-dashed border-slate-400 py-1.5 space-y-1">
                            {activeReceiptForModal.allocations.map((a, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="truncate pr-1">{a.title.slice(0, 18)}</span>
                                <span className="font-bold">₹{a.allocated.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-0.5 pt-1">
                            <div className="flex justify-between font-black text-sm">
                              <span>TOTAL PAID:</span>
                              <span>₹{activeReceiptForModal.amount_paid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span>BALANCE DUE:</span>
                              <span>₹{activeReceiptForModal.current_balance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span>METHOD:</span>
                              <span>{activeReceiptForModal.payment_method}</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-500">
                              <span>REF:</span>
                              <span className="truncate max-w-[140px]">{activeReceiptForModal.transaction_reference}</span>
                            </div>
                          </div>
                          <div className="text-center border-t border-dashed border-slate-400 pt-2 text-[9px]">
                            <p>VERIFY: {activeReceiptForModal.qr_verification_code.slice(0, 24)}...</p>
                            <p className="mt-1 font-bold">THANK YOU - AKSHARA ACCOUNTS</p>
                          </div>
                        </div>
                      )}

                      {/* LAYOUT 3: 58MM POCKET THERMAL (MOBILE POS PRINTER) */}
                      {receiptPrintLayout === '58MM' && (
                        <div className="max-w-[240px] mx-auto text-left font-mono text-[10px] leading-snug space-y-1.5 border border-dashed border-slate-400 p-3 bg-amber-50/20">
                          <div className="text-center border-b border-dashed border-slate-400 pb-1.5">
                            <p className="font-black">AKSHARA ERP</p>
                            <p className="text-[8px]">FEES RECEIPT</p>
                            {activeReceiptForModal.is_duplicate && (
                              <p className="text-rose-600 font-bold text-[8px]">* DUPLICATE *</p>
                            )}
                          </div>
                          <div>
                            <p>RCP: {activeReceiptForModal.receipt_number}</p>
                            <p>STU: {activeReceiptForModal.student_name}</p>
                            <p>ADM: {activeReceiptForModal.admission_number}</p>
                            <p>DATE: {activeReceiptForModal.payment_date.split(' ')[0]}</p>
                          </div>
                          <div className="border-t border-b border-dashed border-slate-400 py-1 font-bold">
                            <div className="flex justify-between text-xs">
                              <span>PAID:</span>
                              <span>₹{activeReceiptForModal.amount_paid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[9px]">
                              <span>BAL:</span>
                              <span>₹{activeReceiptForModal.current_balance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[8px]">
                              <span>MODE:</span>
                              <span>{activeReceiptForModal.payment_method}</span>
                            </div>
                          </div>
                          <div className="text-center text-[8px] pt-1">
                            <p>SCAN TO VERIFY</p>
                            <p className="font-bold text-[7px] break-all">{activeReceiptForModal.qr_verification_code}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updated = reprintReceipt(activeReceiptForModal.id);
                            setActiveReceiptForModal(updated);
                            setReprintFeedback(`Receipt stamped as DUPLICATE (#${updated.reprint_count}) with audit logging.`);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-950 hover:bg-amber-900 border border-amber-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Reprint marks receipt as DUPLICATE"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Stamp Duplicate & Reprint
                        </button>
                        <button
                          onClick={() => {
                            logReceiptAction(activeReceiptForModal.receipt_number, 'DOWNLOADED_PDF');
                            const element = document.createElement('a');
                            const file = new Blob([JSON.stringify(activeReceiptForModal, null, 2)], { type: 'application/json' });
                            element.href = URL.createObjectURL(file);
                            element.download = `${activeReceiptForModal.receipt_number}.json`;
                            element.click();
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" /> Download PDF/Data
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            logReceiptAction(activeReceiptForModal.receipt_number, `PRINTED_${receiptPrintLayout}`);
                            window.print();
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shadow-lg shadow-blue-500/20 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" /> Print ({receiptPrintLayout})
                        </button>
                        <button
                          onClick={() => setShowReceiptModal(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                        >
                          Close Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Institution-Specific Fee Head Modal */}
              {showAddHeadModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl text-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-purple-400" />
                        Add Institution-Specific Fee Head
                      </h3>
                      <button
                        onClick={() => { setShowAddHeadModal(false); setNewHeadFeedback(null); }}
                        className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {newHeadFeedback && (
                      <div className={`p-3 rounded-xl text-xs font-semibold ${
                        newHeadFeedback.startsWith('Permission denied')
                          ? 'bg-rose-950 text-rose-200 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-200 border border-emerald-800'
                      }`}>
                        {newHeadFeedback}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Fee Head Name / Title *</label>
                        <input
                          type="text"
                          value={newHeadTitle}
                          onChange={(e) => {
                            setNewHeadTitle(e.target.value);
                            setNewHeadCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '_'));
                          }}
                          placeholder="e.g. Robotics & AI Lab Fee"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Fee Head Identifier Code</label>
                        <input
                          type="text"
                          value={newHeadCode}
                          onChange={(e) => setNewHeadCode(e.target.value)}
                          placeholder="e.g. ROBOTICS_AI_LAB"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Category</label>
                          <select
                            value={newHeadCategory}
                            onChange={(e) => setNewHeadCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="Tuition">Tuition</option>
                            <option value="Admission">Admission</option>
                            <option value="Laboratory">Laboratory</option>
                            <option value="Library">Library</option>
                            <option value="Transport">Transport</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Examination">Examination</option>
                            <option value="Technology">Technology</option>
                            <option value="Development">Development</option>
                            <option value="Activities">Activities</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Default Base Amount (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={newHeadAmount}
                            onChange={(e) => setNewHeadAmount(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Applicable Level</label>
                          <select
                            value={newHeadInstType}
                            onChange={(e) => setNewHeadInstType(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="School">School Only</option>
                            <option value="PU College">PU College Only</option>
                            <option value="Degree College">Degree College Only</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Refundable Caution?</label>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              id="refToggle"
                              checked={newHeadRefundable}
                              onChange={(e) => setNewHeadRefundable(e.target.checked)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="refToggle" className="text-slate-300">Yes (Security Deposit)</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowAddHeadModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newHeadTitle.trim()) {
                            setNewHeadFeedback('Please provide a valid fee head name.');
                            return;
                          }
                          const finalCode = newHeadCode.trim() || newHeadTitle.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                          const res = addCustomFeeHead({
                            head_code: finalCode,
                            title: newHeadTitle,
                            category: newHeadCategory,
                            default_amount: newHeadAmount,
                            is_refundable: newHeadRefundable,
                            institution_type: newHeadInstType
                          });
                          setNewHeadFeedback(res.message);
                          if (res.success) {
                            setMultiSelectedHeadCodes(prev => [...prev, finalCode]);
                            setMultiHeadAmounts(prev => ({
                              ...prev,
                              [finalCode]: { collected: newHeadAmount, concession: 0 }
                            }));
                            setTimeout(() => {
                              setShowAddHeadModal(false);
                              setNewHeadFeedback(null);
                              setNewHeadTitle('');
                              setNewHeadCode('');
                            }, 1200);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                      >
                        Save Fee Head
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 8: TRANSPORT FLEET & LIVE GPS TELEMETRY */}
          {/* ================================================================= */}
          
          {/* ================================================================= */}
          {/* TAB 7B: SMART DATA MIGRATION & BULK INGEST CENTRE */}
          {/* ================================================================= */}
          {activeTab === 'data-migration' && (() => {
            const batch = migrationBatches[0];

            const handleExecute = () => {
              const res = executeMigrationBatch(batch.id);
              setMigrationFeedback(res.message);
              setTimeout(() => setMigrationFeedback(null), 6000);
            };

            return (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <h1 className="text-2xl font-black text-white">Smart Data Migration & Bulk Ingest Centre</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Multi-Format Ingestion (XLSX, CSV, PDF OCR) • Smart Column Alias Mapping • Duplicate Resolution Engine
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-900/40 text-blue-300 border border-blue-700/60 text-xs font-bold">
                      Zero Data-Loss Migration Engine
                    </span>
                  </div>
                </div>

                {/* Sync Feedback Toast */}
                {migrationFeedback && (
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span>{migrationFeedback}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px]">MIGRATION COMMITTED</span>
                  </div>
                )}

                {/* 5-Step Progress Bar */}
                <div className="grid grid-cols-5 gap-2 text-xs font-bold text-center">
                  {[
                    { step: 1, title: '1. Upload File' },
                    { step: 2, title: '2. Column Mapping' },
                    { step: 3, title: '3. Duplicate Resolution' },
                    { step: 4, title: '4. Preview Validation' },
                    { step: 5, title: '5. Ingest Execution' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => setMigrationStep(s.step)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        migrationStep === s.step
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                {/* Wizard Step 1: Upload Source Data */}
                {migrationStep === 1 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 1: Upload Source Master File</h3>
                    <p className="text-xs text-slate-400">
                      Supported formats: Excel (.xlsx, .xls), CSV (.csv), Word (.docx), Scanned PDF (OCR Extraction), and JSON.
                    </p>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center space-y-3 bg-slate-900/40">
                      <Upload className="w-8 h-8 text-blue-400 mx-auto" />
                      <div>
                        <p className="text-sm font-bold text-white">Active Ingest File: {batch.fileName}</p>
                        <p className="text-xs text-slate-400">Format: {batch.fileFormat} • Total Records: {batch.totalRecords.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => setMigrationStep(2)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        Proceed to Column Mapping →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 2: Intelligent Column Mapping */}
                {migrationStep === 2 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 2: Smart Column Alias Mapping</h3>
                    <p className="text-xs text-slate-400">
                      The migration engine automatically matches non-standard legacy header names to institutional ERP fields.
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Legacy Source Header</th>
                            <th className="px-4 py-3">Mapped Target Field</th>
                            <th className="px-4 py-3">Match Confidence</th>
                            <th className="px-4 py-3">Sample Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {batch.columnMappings.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="px-4 py-3 font-mono font-bold text-amber-300">{m.sourceHeader}</td>
                              <td className="px-4 py-3 font-bold text-blue-400">{m.targetField}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">
                                  {(m.confidence * 100).toFixed(0)}% MATCH
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{m.sampleValue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMigrationStep(3)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Proceed to Duplicate Resolution →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 3: Identity Resolution & Duplicate Prevention */}
                {migrationStep === 3 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 3: Identity Resolution & Duplicate Candidates</h3>
                    <p className="text-xs text-slate-400">
                      Detected 12 exact duplicates and 8 probable matches against existing enrolled students.
                    </p>
                    <div className="space-y-3">
                      {batch.duplicateCandidates.map((c) => (
                        <div key={c.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.matchType === 'EXACT_DUPLICATE' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                            }`}>
                              {c.matchType}
                            </span>
                            <p className="font-bold text-white text-sm mt-1">Source Row #{c.sourceRow}: {c.sourceName} ({c.sourceAdmissionNo})</p>
                            <p className="text-slate-400 text-[11px]">Matches Existing: {c.existingRecordName} • Phone: {c.sourcePhone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => resolveMigrationCandidate(batch.id, c.id, 'SKIP')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                                c.resolvedAction === 'SKIP' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              Skip
                            </button>
                            <button
                              onClick={() => resolveMigrationCandidate(batch.id, c.id, 'MERGE')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                                c.resolvedAction === 'MERGE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              Merge
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMigrationStep(4)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Proceed to Validation Preview →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 4: Validation Preview */}
                {migrationStep === 4 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 4: Pre-Commit Validation Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Total Ingest Records</span>
                        <p className="text-2xl font-black text-white mt-1">{batch.totalRecords}</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">Clean New Admissions</span>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{batch.cleanNewRecordsCount}</p>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-amber-400 uppercase font-bold">Resolved Duplicates</span>
                        <p className="text-2xl font-black text-amber-400 mt-1">{batch.exactMatchesCount + batch.probableMatchesCount}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMigrationStep(5)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Proceed to Ingest Execution →
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Step 5: Ingest Execution & Audit */}
                {migrationStep === 5 && (
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h3 className="text-lg font-black text-white">Ready for Production Ingestion</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All validation checks passed with zero integrity errors. Clicking execute will import {batch.cleanNewRecordsCount} student records with opening balances.
                    </p>
                    <button
                      onClick={handleExecute}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      Execute Migration Batch Now
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'transport' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Transport Fleet & Live GPS Tracking</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Bus Routes, Student Stops, Driver Telemetry, and Parent Arrival ETA Alerts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {transportRoutes.map((rt) => (
                  <div key={rt.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                            {rt.route_code}
                          </span>
                          <h3 className="font-bold text-white text-sm">{rt.route_name}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {rt.vehicle_type} • Reg: {rt.vehicle_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rt.status === 'IN_TRANSIT' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rt.status.replace('_', ' ')}
                        </span>
                        {rt.status === 'IN_TRANSIT' && (
                          <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Speed: {rt.current_speed_kmh} km/h</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-400">Driver: <strong className="text-slate-200">{rt.driver_name}</strong></p>
                        <p className="text-slate-400">Phone: <strong className="text-slate-200">{rt.driver_phone}</strong></p>
                      </div>
                      <div>
                        <p className="text-slate-400">Attendant: <strong className="text-slate-200">{rt.attendant_name}</strong></p>
                        <p className="text-slate-400">Capacity: <strong className="text-slate-200">{rt.capacity} Students</strong></p>
                      </div>
                    </div>

                    {/* Stops List */}
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Route Stops & Arrival Schedule:</p>
                      {rt.stops.map((st, sidx) => (
                        <div key={sidx} className={`p-2 rounded-lg flex items-center justify-between text-xs ${
                          st.is_passed ? 'bg-slate-900/40 text-slate-500' : 'bg-slate-900 text-slate-200 font-medium'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${st.is_passed ? 'bg-slate-600' : 'bg-emerald-400'}`}></span>
                            <span>{st.stop_name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px]">{st.scheduled_time}</span>
                            {st.student_count > 0 && (
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                {st.student_count} Students
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleTripStatus(rt.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {rt.status === 'IN_TRANSIT' ? 'End Morning Bus Trip' : 'Start Morning Bus Trip'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 9: ATTENDANCE */}
          {/* ================================================================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Daily & Period-Wise Attendance</h1>
                  <p className="text-xs text-slate-400 mt-1">Classroom Attendance • Biometric Device Synchronization</p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="p-3">Roll #</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Mark Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {attendance.map((rec) => (
                      <tr key={rec.student_id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-mono text-slate-300">{rec.roll_number}</td>
                        <td className="p-3 font-bold text-white">{rec.student_name}</td>
                        <td className="p-3 text-slate-400">{rec.class_name}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rec.status === 'PRESENT'
                              ? 'bg-emerald-950 text-emerald-300'
                              : rec.status === 'LATE'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-rose-950 text-rose-300'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                            <button
                              onClick={() => updateAttendance(rec.student_id, 'PRESENT')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${rec.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => updateAttendance(rec.student_id, 'ABSENT')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${rec.status === 'ABSENT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => updateAttendance(rec.student_id, 'LATE')}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${rec.status === 'LATE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 10: ADMISSIONS */}
          {/* ================================================================= */}
          {activeTab === 'admissions' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Admissions Pipeline</h1>
                  <p className="text-xs text-slate-400 mt-1">Application Ingestion • Verification • Approval</p>
                </div>
              </div>

              <div className="space-y-3">
                {admissions.map((adm) => (
                  <div key={adm.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded font-bold">
                          {adm.application_number}
                        </span>
                        <h4 className="font-bold text-white text-sm">{adm.applicant_name}</h4>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {adm.target_class} ({adm.level})
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        Parent: {adm.parent_name} • Phone: {adm.parent_phone} • Submitted: {adm.submission_date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        adm.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {adm.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 11: STUDENTS (SIS) */}
          {/* ================================================================= */}
          {activeTab === 'students' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Student Information System (SIS)</h1>
                  <p className="text-xs text-slate-400 mt-1">Enrolled Directory across School, PU College & Degree College</p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="p-3">Admission #</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Level & Class</th>
                      <th className="p-3">Section / Stream</th>
                      <th className="p-3">Guardian Contact</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-mono text-slate-300 font-bold">{st.admission_number}</td>
                        <td className="p-3 font-bold text-white">{st.first_name} {st.last_name}</td>
                        <td className="p-3 text-slate-300">{st.institution_level} - {st.class_name}</td>
                        <td className="p-3 text-slate-400">{st.section_or_stream}</td>
                        <td className="p-3 text-slate-300">{st.guardian_name} ({st.guardian_phone})</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">{st.attendance_pct}%</td>
                        <td className="p-3">
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 12: STAFF (HR) */}
          {/* ================================================================= */}
          {activeTab === 'staff' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Faculty & Staff Directory</h1>
                  <p className="text-xs text-slate-400 mt-1">Teaching and Operational Staff Profiles</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Dr. Ramesh Kumar', role: 'Principal / Director', dept: 'Leadership', email: 'principal@akshara.edu.in', id: 'EMP-PRIN-01' },
                  { name: 'Dr. V. Murthy', role: 'Senior Lecturer in Physics', dept: 'PU College Science', email: 'v.murthy@akshara.edu.in', id: 'EMP-PHY-102' },
                  { name: 'Prof. S. Joshi', role: 'Head of Chemistry', dept: 'PU College Science', email: 's.joshi@akshara.edu.in', id: 'EMP-CHEM-103' },
                  { name: 'Mrs. K. Swamy', role: 'Senior Mathematics Faculty', dept: 'Secondary & PU', email: 'k.swamy@akshara.edu.in', id: 'EMP-MTH-105' },
                  { name: 'K. S. Narayana', role: 'Senior Accounts Officer', dept: 'Finance & Accounts', email: 'accountant@akshara.edu.in', id: 'EMP-ACC-09' },
                  { name: 'Suresh Gowda', role: 'Transport Supervisor', dept: 'Logistics', email: 'transport@akshara.edu.in', id: 'EMP-TRP-07' },
                ].map((st, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{st.name}</h4>
                      <p className="text-blue-400 mt-0.5">{st.role}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Dept: {st.dept} • {st.email}</p>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono px-2 py-1 rounded">
                      {st.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 13: WEEKLY TIMETABLE */}
          {/* ================================================================= */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Weekly Academic Timetable</h1>
                  <p className="text-xs text-slate-400 mt-1">Period Allocations • Lab Sessions • Classroom Schedules</p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">I PUC - Science (PCMB Batch A) Schedule:</p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <div key={day} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <p className="font-bold text-white text-sm border-b border-slate-800 pb-1">{day}</p>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="p-1.5 rounded bg-slate-850 text-slate-200">
                          <p className="font-bold text-blue-300">09:00 - 10:00 AM</p>
                          <p>Physics (Dr. V. Murthy)</p>
                        </div>
                        <div className="p-1.5 rounded bg-slate-850 text-slate-200">
                          <p className="font-bold text-blue-300">10:00 - 11:00 AM</p>
                          <p>Chemistry (Prof. S. Joshi)</p>
                        </div>
                        <div className="p-1.5 rounded bg-slate-850 text-slate-200">
                          <p className="font-bold text-amber-300">11:15 - 01:15 PM</p>
                          <p>Biology Lab Practical</p>
                        </div>
                        <div className="p-1.5 rounded bg-slate-850 text-slate-200">
                          <p className="font-bold text-blue-300">02:00 - 03:00 PM</p>
                          <p>Mathematics (Mrs. K. Swamy)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        
          {/* ================================================================= */}
          {/* TAB 9: LABORATORY MANAGEMENT & QR INVENTORY */}
          {/* ================================================================= */}
          {activeTab === 'laboratory' && (
            <LaboratoryManagementView />
          )}

          {/* ================================================================= */}
          {/* TAB 10: MULTI-CHANNEL COMMUNICATION HUB (WHATSAPP & TELEGRAM) */}
          {/* ================================================================= */}
          {activeTab === 'communication' && (
            <CommunicationHubView />
          )}

          {/* ================================================================= */}
          {/* TAB 11: CENTRAL PLATFORM SUPER ADMIN (1,000+ TENANCIES) */}
          {/* ================================================================= */}
          {activeTab === 'platform-superadmin' && (
            <PlatformSuperAdminView />
          )}

          {/* ================================================================= */}
          {/* TAB 12: ACADEMIC STRUCTURE & SECTION CAPACITY (CLASS 6 & I PUC) */}
          {/* ================================================================= */}
          {activeTab === 'academic-structure' && (
            <AcademicStructureView />
          )}

          {/* ================================================================= */}
          {/* TAB 13: STAFF DUTY & RESPONSIBILITY ASSIGNMENT */}
          {/* ================================================================= */}
          {activeTab === 'staff-duties' && (
            <StaffDutyAssignmentView />
          )}

          {/* ================================================================= */}
          {/* TAB 14: MULTI-COMPONENT MARKS ENTRY REGISTER (THEORY/PRACTICAL/INTERNAL) */}
          {/* ================================================================= */}
          {activeTab === 'marks-register' && (
            <MarksEntryRegisterView />
          )}

          {/* ================================================================= */}
          {/* TAB 15: HALL TICKET MANAGEMENT & ELIGIBILITY VERIFICATION */}
          {/* ================================================================= */}
          {activeTab === 'hall-tickets' && (
            <HallTicketManagementView />
          )}

          {/* ================================================================= */}
          {/* TAB 16: CONSOLIDATED STUDENT FEE LEDGER & CHAIRMAN REVIEW */}
          {/* ================================================================= */}
          {activeTab === 'fee-review' && (
            <ConsolidatedFeeReportReviewView currentRole={currentRole} />
          )}

          {/* ================================================================= */}
          {/* TAB 17: OFFICIAL RESULT NOTICE BOARD & PROGRESS CARDS */}
          {/* ================================================================= */}
          {activeTab === 'notice-board' && (
            <ResultNoticeBoardView currentRole={currentRole} />
          )}

        </main>
      </div>

      {/* Schedule New Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-black text-white">Schedule New Institutional Examination</h3>
            
            <form onSubmit={handleCreateExamSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Category</label>
                  <select
                    value={newExamCategory}
                    onChange={(e) => setNewExamCategory(e.target.value as InstitutionalExamCategory)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Weekly Test">Weekly Test</option>
                    <option value="Unit Test">Unit Test</option>
                    <option value="Monthly Test">Monthly Test</option>
                    <option value="Quarterly Exam">Quarterly Exam</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Annual Board Pre-Mock">Annual Board Pre-Mock</option>
                    <option value="Practical Lab">Practical Lab</option>
                    <option value="NEET Foundation">NEET Foundation</option>
                    <option value="JEE Foundation">JEE Foundation</option>
                    <option value="KCET Foundation">KCET Foundation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Delivery Mode</label>
                  <select
                    value={newExamMode}
                    onChange={(e) => setNewExamMode(e.target.value as ExamDeliveryMode)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Offline (Paper-based)">Offline (Paper-based)</option>
                    <option value="Internal Online">Internal Online CBT</option>
                    <option value="External Provider Adapter">External Provider Adapter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Target Class</label>
                <input
                  type="text"
                  required
                  value={newExamClass}
                  onChange={(e) => setNewExamClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Change Request Modal */}
      {showChangeReqModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-black text-white">Submit Privilege Request to Super Admin</h3>
            <p className="text-slate-400">
              Institution Admins cannot grant permissions directly. Requests are submitted to the Platform Super Admin for audit and approval.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Target Role</label>
                <select
                  value={reqRole}
                  onChange={(e) => setReqRole(e.target.value as UserRoleType)}
                  className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none cursor-pointer"
                >
                  <option value="EXAM_CONTROLLER">Examination Controller</option>
                  <option value="TEACHER">Faculty / Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="VICE_PRINCIPAL">Vice Principal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Requested Action</label>
                <select
                  value={reqAction}
                  onChange={(e) => setReqAction(e.target.value as FineGrainedAction)}
                  className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none cursor-pointer"
                >
                  <option value="publish">publish (Publish examination results)</option>
                  <option value="export">export (Export student ledgers & reports)</option>
                  <option value="edit">edit (Modify examination records)</option>
                  <option value="approve">approve (Sign-off on grade corrections)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Justification</label>
                <textarea
                  rows={3}
                  value={reqJustification}
                  onChange={(e) => setReqJustification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeReqModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    submitPermissionChangeRequest({
                      requestedByRole: currentRole,
                      requestedByName: currentPrivilege.title,
                      targetRole: reqRole,
                      action: reqAction,
                      module: 'examinations',
                      justification: reqJustification
                    });
                    setShowChangeReqModal(false);
                    alert('Permission Change Request submitted to Platform Super Admin for review.');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
