import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Plus,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Building2,
  ArrowRight,
  Clock,
  Eye,
  Settings,
  Layers,
  ChevronRight,
  Check,
  Bus,
  MapPin,
  AlertTriangle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Archive,
  Compass,
  ShieldCheck,
  Play,
  Square,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import {
  useDemoStore,
  UserRoleType,
  ROLE_PRIVILEGES,
  FeeHeadType,
  DemoFeeInvoice,
  AcademicSubject,
  CompetitiveQuestion,
} from '../../store/demoStore';

export const InteractiveDemoPage: React.FC = () => {
  const {
    currentRole,
    switchRole,
    students,
    admissions,
    invoices,
    attendance,
    marks,
    exams,
    subjects,
    competitiveQuestions,
    transportRoutes,
    addStudent,
    createAdmission,
    approveAdmission,
    collectFee,
    updateAttendance,
    saveMark,
    verifyExamAsController,
    approveExamAsPrincipal,
    publishExamResults,
    addSubject,
    archiveSubject,
    reorderSubjects,
    toggleTripStatus,
    resetDemoData,
  } = useDemoStore();

  const roleInfo = ROLE_PRIVILEGES[currentRole];

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Search & Filter state
  const [studentSearch, setStudentSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [feeCategoryFilter, setFeeCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState<DemoFeeInvoice | null>(null);
  const [feeCollectAmount, setFeeCollectAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);

  // Subject Modal state
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    institution_level: 'PU College' as 'School' | 'PU College' | 'Degree College',
    target_class: 'I PUC',
    stream_or_comb: 'PCMB',
    theory_marks: 70,
    practical_marks: 30,
    credits: 4,
    is_compulsory: true,
    assigned_teacher: '',
  });

  // Competitive Exam State
  const [selectedCompExam, setSelectedCompExam] = useState<'NEET' | 'JEE_MAIN' | 'KCET'>('NEET');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [compExamSubmitted, setCompExamSubmitted] = useState(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    admission_number: `ADM-2026-00${students.length + 1}`,
    roll_number: `10${students.length + 1}`,
    first_name: '',
    last_name: '',
    institution_level: 'School' as 'School' | 'PU College' | 'Degree College',
    class_name: 'Class 10',
    section_or_stream: 'Section A',
    guardian_name: '',
    guardian_phone: '',
    fee_balance: 15000,
    attendance_pct: 100,
    status: 'ACTIVE' as const,
  });

  // New Admission Form State
  const [newApp, setNewApp] = useState({
    applicant_name: '',
    level: 'School',
    target_class: 'Class 8',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
  });

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.first_name || !newStudent.last_name) return;
    addStudent(newStudent);
    setShowAddStudentModal(false);
    setNewStudent({
      admission_number: `ADM-2026-00${students.length + 2}`,
      roll_number: `10${students.length + 2}`,
      first_name: '',
      last_name: '',
      institution_level: 'School',
      class_name: 'Class 10',
      section_or_stream: 'Section A',
      guardian_name: '',
      guardian_phone: '',
      fee_balance: 15000,
      attendance_pct: 100,
      status: 'ACTIVE',
    });
  };

  const handleCreateAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApp.applicant_name) return;
    createAdmission(newApp);
    setShowAdmissionModal(false);
    setNewApp({
      applicant_name: '',
      level: 'School',
      target_class: 'Class 8',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
    });
  };

  const handleCollectFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeeModal || feeCollectAmount <= 0) return;
    const res = collectFee(showFeeModal.id, feeCollectAmount);
    setLastReceipt(`Recorded ₹${feeCollectAmount.toLocaleString()} via ${paymentMode}! Official Receipt: ${res.receiptNumber}`);
    setShowFeeModal(null);
    setFeeCollectAmount(0);
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.code) return;
    addSubject(newSubject);
    setShowAddSubjectModal(false);
    setNewSubject({
      code: '',
      name: '',
      institution_level: 'PU College',
      target_class: 'I PUC',
      stream_or_comb: 'PCMB',
      theory_marks: 70,
      practical_marks: 30,
      credits: 4,
      is_compulsory: true,
      assigned_teacher: '',
    });
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.last_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || s.institution_level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const filteredInvoices = invoices.filter((inv) => {
    if (feeCategoryFilter === 'ALL') return true;
    return inv.fee_head === feeCategoryFilter;
  });

  // Calculate competitive test score
  const activeQuestions = competitiveQuestions.filter((q) => q.exam_type === selectedCompExam);
  let compScore = 0;
  let compAttempted = 0;
  let compCorrect = 0;
  activeQuestions.forEach((q) => {
    const ans = selectedAnswers[q.id];
    if (ans) {
      compAttempted++;
      if (ans === q.correct_label) {
        compCorrect++;
        compScore += q.marks_positive;
      } else {
        compScore -= q.marks_negative;
      }
    }
  });

  // Navigation Items
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Layers },
    { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap },
    { id: 'students', label: 'Students (SIS)', icon: Users },
    { id: 'academics', label: 'Academic & Subjects', icon: BookOpen },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
    { id: 'examinations', label: 'Examinations Module', icon: Award },
    { id: 'competitive-exams', label: 'NEET / JEE / KCET', icon: Compass },
    { id: 'marks', label: 'Marks Entry', icon: FileText },
    { id: 'report-cards', label: 'Report Cards PDF', icon: Printer },
    { id: 'transport', label: 'Transport & GPS', icon: Bus },
    { id: 'staff', label: 'Faculty & HR', icon: Users },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
    { id: 'parents', label: 'Parent Portal View', icon: Eye },
    { id: 'analytics', label: 'Analytics & Trends', icon: Sparkles },
    { id: 'settings', label: 'White-Label Branding', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Top Banner with Role Switcher & Reset */}
      <header className="bg-slate-950 border-b border-slate-800 text-white px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Interactive Product Sandbox
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Simulating full RBAC permissions, multi-tier academics & offline workflows
            </span>
          </div>

          {/* Quick Role Switcher Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulate Role:</span>
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value as UserRoleType)}
              className="bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PRINCIPAL">👑 Principal / Director</option>
              <option value="INSTITUTION_ADMIN">🏛️ Institution Admin</option>
              <option value="ACCOUNTANT">💰 Accountant / Finance</option>
              <option value="EXAM_CONTROLLER">📝 Examination Controller</option>
              <option value="TEACHER">👩‍🏫 Teacher (I PUC Physics)</option>
              <option value="PARENT">👨‍👩‍👧 Parent (Aarav's Guardian)</option>
              <option value="STUDENT">🎒 Student (Ananya - I PUC)</option>
              <option value="TRANSPORT_MANAGER">🚌 Transport Manager</option>
              <option value="SUPER_ADMIN">🌐 Platform Super Admin</option>
            </select>

            <button
              onClick={resetDemoData}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Reset sandbox data to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data
            </button>

            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm transition-colors"
            >
              Create Institution <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Role Privilege Inspector Banner */}
      <div className="bg-slate-800 border-b border-slate-700 text-xs text-slate-300 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${roleInfo.badgeColor}`}>
              {roleInfo.title}
            </span>
            <span className="text-slate-400">
              <strong className="text-slate-200">Can Edit:</strong> {roleInfo.canEdit.join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong className="text-amber-200">Role Restriction:</strong> {roleInfo.restrictedActions[0]}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center font-black text-white text-base shadow-sm">
                A
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900 leading-tight">Akshara Global ERP</h2>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">
                  School & College Campus
                </span>
              </div>
            </div>
          </div>

          <nav className="p-2.5 flex-1 space-y-1 overflow-y-auto text-xs font-semibold text-gray-700">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = roleInfo.allowedTabs.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {!isAllowed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                      Restricted
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 bg-gray-50 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">
                    {roleInfo.title}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Logged in with active role-based privileges • PostgreSQL RLS Tenant Boundary
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-sm">
                    Academic Year 2026–2027
                  </span>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Total Enrolled</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{students.length} Students</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">School: 2 • PUC: 2 • Degree: 1</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Today's Attendance</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">94.8%</p>
                  <p className="text-xs text-gray-400 mt-1">Period & Biometric verified</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Fee Collections</p>
                  <p className="text-3xl font-black text-amber-600 mt-1">₹85,000</p>
                  <p className="text-xs text-gray-400 mt-1">Tuition, Labs, Hostel & Bus</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Mid-Term Exams</p>
                  <p className="text-3xl font-black text-purple-600 mt-1">Verified</p>
                  <p className="text-xs text-gray-400 mt-1">Pending Principal sign-off</p>
                </div>
              </div>

              {/* Role-Specific Active Privileges Matrix */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Active Role Authorization & Access Boundaries
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="font-bold text-emerald-900 uppercase tracking-wider mb-2">Permitted Actions</p>
                    <ul className="space-y-1.5 text-emerald-800">
                      {roleInfo.canEdit.map((act, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="font-bold text-blue-900 uppercase tracking-wider mb-2">Approval Powers</p>
                    <ul className="space-y-1.5 text-blue-800">
                      {roleInfo.canApprove.map((appr, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{appr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="font-bold text-red-900 uppercase tracking-wider mb-2">Security Restrictions</p>
                    <ul className="space-y-1.5 text-red-800">
                      {roleInfo.restrictedActions.map((res, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXAMINATIONS MODULE (FIXES THE BLANK SCREEN!) */}
          {activeTab === 'examinations' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Examinations & Assessment Lifecycle</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Unit Tests, Board Pre-Mocks, Laboratory Practicals, and Multi-Tier Approval Workflows
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('marks')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Go to Marks Entry
                  </button>
                  <button
                    onClick={() => setActiveTab('report-cards')}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Print Report Cards
                  </button>
                </div>
              </div>

              {/* Active Exams with Multi-Stage Approval Workflow */}
              <div className="space-y-6">
                {exams.map((exam) => (
                  <div key={exam.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-black text-gray-900">{exam.title}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                            {exam.exam_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Target: {exam.class_name} ({exam.target_level}) • Academic Year {exam.academic_year}
                        </p>
                      </div>

                      {/* Approval Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          exam.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          exam.status === 'PRINCIPAL_APPROVED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          exam.status === 'CONTROLLER_VERIFIED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                          Status: {exam.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* 4-Stage Approval Workflow Stepper */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">
                        Strict 4-Stage Academic Result Approval Workflow:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-lg border border-emerald-300">
                          <span className="font-bold text-emerald-700 block">Stage 1: Marks Entry</span>
                          <span className="text-[10px] text-gray-500">Teacher marks submitted</span>
                          <span className="mt-1 block text-emerald-600 font-bold">✓ Completed</span>
                        </div>

                        <div className={`p-3 bg-white rounded-lg border ${
                          exam.status !== 'SCHEDULED' && exam.status !== 'MARKS_ENTRY' ? 'border-emerald-300' : 'border-amber-400'
                        }`}>
                          <span className="font-bold text-gray-900 block">Stage 2: Exam Controller</span>
                          <span className="text-[10px] text-gray-500">Audit for missing marks</span>
                          {exam.status === 'MARKS_ENTRY' ? (
                            <button
                              onClick={() => verifyExamAsController(exam.id)}
                              className="mt-1.5 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                            >
                              Verify as Controller
                            </button>
                          ) : (
                            <span className="mt-1 block text-emerald-600 font-bold">✓ Verified</span>
                          )}
                        </div>

                        <div className={`p-3 bg-white rounded-lg border ${
                          exam.status === 'PRINCIPAL_APPROVED' || exam.status === 'PUBLISHED' ? 'border-emerald-300' : 'border-blue-400'
                        }`}>
                          <span className="font-bold text-gray-900 block">Stage 3: Principal Approval</span>
                          <span className="text-[10px] text-gray-500">Official sign-off & seal</span>
                          {exam.status === 'CONTROLLER_VERIFIED' ? (
                            <button
                              onClick={() => approveExamAsPrincipal(exam.id)}
                              className="mt-1.5 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
                            >
                              Approve as Principal
                            </button>
                          ) : exam.status === 'PRINCIPAL_APPROVED' || exam.status === 'PUBLISHED' ? (
                            <span className="mt-1 block text-emerald-600 font-bold">✓ Approved</span>
                          ) : (
                            <span className="mt-1 block text-gray-400">Awaiting Verification</span>
                          )}
                        </div>

                        <div className={`p-3 bg-white rounded-lg border ${
                          exam.status === 'PUBLISHED' ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-200'
                        }`}>
                          <span className="font-bold text-gray-900 block">Stage 4: Publication</span>
                          <span className="text-[10px] text-gray-500">Live on Student & Parent Portal</span>
                          {exam.status === 'PRINCIPAL_APPROVED' ? (
                            <button
                              onClick={() => publishExamResults(exam.id)}
                              className="mt-1.5 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              Publish Live
                            </button>
                          ) : exam.status === 'PUBLISHED' ? (
                            <span className="mt-1 block text-emerald-700 font-black">📢 Published Live</span>
                          ) : (
                            <span className="mt-1 block text-gray-400">Awaiting Approval</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Examination Timetable & Seating Allocation */}
                    <div>
                      <h4 className="font-bold text-xs uppercase text-gray-700 tracking-wider mb-2">
                        Exam Timetable, Room Allocation & Mark Weightage
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600">
                          <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2.5">Date & Time</th>
                              <th className="px-4 py-2.5">Subject</th>
                              <th className="px-4 py-2.5">Hall / Room</th>
                              <th className="px-4 py-2.5">Invigilator</th>
                              <th className="px-4 py-2.5">Theory Max</th>
                              <th className="px-4 py-2.5">Practical Max</th>
                              <th className="px-4 py-2.5">Pass Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {exam.schedules.map((sch) => (
                              <tr key={sch.id} className="hover:bg-gray-50/80">
                                <td className="px-4 py-3 font-medium">
                                  <span className="font-bold text-gray-900">{sch.exam_date}</span>
                                  <span className="block text-[10px] text-gray-400">{sch.start_time} - {sch.end_time}</span>
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-900">{sch.subject}</td>
                                <td className="px-4 py-3 font-medium text-blue-600">{sch.room}</td>
                                <td className="px-4 py-3 text-gray-700">{sch.invigilator}</td>
                                <td className="px-4 py-3 font-semibold">{sch.theory_max}</td>
                                <td className="px-4 py-3 font-semibold">{sch.practical_max}</td>
                                <td className="px-4 py-3 font-bold text-emerald-600">{sch.passing_marks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PU COLLEGE & COMPETITIVE EXAMS (NEET / JEE / KCET) */}
          {activeTab === 'competitive-exams' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">PU College Competitive Examination Engine</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    NEET-UG, JEE Main, JEE Advanced, KCET & COMEDK Mock Test Simulator with Instant Scoring
                  </p>
                </div>
                {/* Exam Template Selector */}
                <div className="flex items-center gap-2">
                  {(['NEET', 'JEE_MAIN', 'KCET'] as const).map((ex) => (
                    <button
                      key={ex}
                      onClick={() => {
                        setSelectedCompExam(ex);
                        setCompExamSubmitted(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCompExam === ex
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {ex === 'JEE_MAIN' ? 'JEE Main' : ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Competitive Exam Overview & Marking Scheme */}
              <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
                    {selectedCompExam} 2026 Format
                  </span>
                  <h3 className="text-xl font-black">
                    {selectedCompExam === 'NEET' && 'NEET-UG: Physics, Chemistry & Biology (Botany/Zoology)'}
                    {selectedCompExam === 'JEE_MAIN' && 'JEE Main: Physics, Chemistry & Mathematics'}
                    {selectedCompExam === 'KCET' && 'Karnataka CET: PCMB Multiple Choice Questions'}
                  </h3>
                  <p className="text-indigo-200 text-xs mt-1">
                    Marking Scheme: {selectedCompExam === 'KCET' ? '+1 Mark (No Negative)' : '+4 Correct, -1 Incorrect'} • Full Length Simulator
                  </p>
                </div>

                {compExamSubmitted && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-right">
                    <p className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold">Your Score</p>
                    <p className="text-2xl font-black text-white">{compScore} / {activeQuestions.length * 4}</p>
                    <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                      Est. Percentile: 98.4%ile • Est. State Rank: ~140
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive Mock Test Questions */}
              <div className="space-y-4">
                {activeQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-gray-900">{q.subject}</span>
                        <span className="text-[11px] text-gray-500">• {q.chapter}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        +{q.marks_positive} / -{q.marks_negative}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                      {q.question_text}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswers[q.id] === opt.label;
                        const isCorrect = q.correct_label === opt.label;

                        let btnStyle = 'bg-gray-50 border-gray-200 hover:bg-blue-50/50';
                        if (compExamSubmitted) {
                          if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                          else if (isSelected) btnStyle = 'bg-red-50 border-red-400 text-red-900 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-blue-600 text-white border-blue-600 font-bold';
                        }

                        return (
                          <button
                            key={opt.label}
                            disabled={compExamSubmitted}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.label })}
                            className={`p-3.5 rounded-xl border text-xs text-left flex items-start gap-3 transition-all ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0">
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box (Post submission) */}
                    {compExamSubmitted && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <p className="font-bold text-slate-900">
                          Solution Explanation ({q.correct_label} is correct):
                        </p>
                        <p className="text-slate-600">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}

                {!compExamSubmitted ? (
                  <button
                    onClick={() => setCompExamSubmitted(true)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all"
                  >
                    Submit Test & Generate Rank Analytics
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setCompExamSubmitted(false);
                    }}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-2xl text-xs font-bold transition-all"
                  >
                    Retake Competitive Test
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: ACADEMICS & SUBJECT DRAG-AND-DROP REORDERING */}
          {activeTab === 'academics' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Academic Structure & Subject Management</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Schools, PU Colleges, and Degree Colleges Curriculum Configurator with Drag-and-Drop Reordering
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Subject to Curriculum
                </button>
              </div>

              {/* Subject Cards with Reordering and Archiving */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider">
                    Configured Subjects ({subjects.filter((s) => !s.is_archived).length} Active)
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    Use Up/Down controls to reorder subjects in syllabus & timetable
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {subjects.map((sub, idx) => {
                    if (sub.is_archived) return null;
                    return (
                      <div key={sub.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => reorderSubjects(idx, idx - 1)}
                              className="p-1 rounded bg-gray-100 hover:bg-blue-100 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                            <button
                              disabled={idx === subjects.length - 1}
                              onClick={() => reorderSubjects(idx, idx + 1)}
                              className="p-1 rounded bg-gray-100 hover:bg-blue-100 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {sub.code}
                              </span>
                              <h4 className="font-bold text-sm text-gray-900">{sub.name}</h4>
                              <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {sub.institution_level}
                              </span>
                              {sub.is_compulsory ? (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                  Compulsory
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                  Elective
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Class: {sub.target_class} {sub.stream_or_comb && `(${sub.stream_or_comb})`} • Assigned Faculty: <span className="text-gray-800 font-medium">{sub.assigned_teacher}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-normal">Marks Split</span>
                            <span>{sub.theory_marks} Theory / {sub.practical_marks} Pract.</span>
                          </div>

                          {/* Safe Archival Action */}
                          <button
                            onClick={() => archiveSubject(sub.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Archive Subject (Preserves historical marks records)"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FEE MANAGEMENT (MULTI-CATEGORY HEADS) */}
          {activeTab === 'fees' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Multi-Category Fee Collection Engine</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Tuition Fees, Laboratory Fees, Hostel & Mess Charges, Transport Fees with Digital Receipts
                  </p>
                </div>
                {lastReceipt && (
                  <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {lastReceipt}
                  </div>
                )}
              </div>

              {/* Fee Category Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fee Head:</span>
                {[
                  { id: 'ALL', label: 'All Fee Heads' },
                  { id: 'COLLEGE_FEE', label: 'College / Tuition Fee' },
                  { id: 'LAB_FEE', label: 'Laboratory Fee' },
                  { id: 'HOSTEL_MESS_FEE', label: 'Hostel & Mess Fee' },
                  { id: 'TRANSPORT_FEE', label: 'Transport Fee' },
                  { id: 'EXAM_FEE', label: 'Examination Fee' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFeeCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      feeCategoryFilter === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Invoices Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5">Invoice #</th>
                      <th className="px-5 py-3.5">Student Name</th>
                      <th className="px-5 py-3.5">Fee Category Head</th>
                      <th className="px-5 py-3.5">Total Amount</th>
                      <th className="px-5 py-3.5">Collected</th>
                      <th className="px-5 py-3.5">Balance Due</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Collect Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-4 font-mono font-bold text-gray-900">{inv.invoice_number}</td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {inv.student_name}
                          <span className="block text-[10px] font-normal text-gray-500">{inv.class_name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-800">{inv.fee_title}</span>
                          <span className="block text-[10px] font-bold text-blue-600 uppercase">{inv.fee_head.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">₹{inv.total_amount.toLocaleString()}</td>
                        <td className="px-5 py-4 text-emerald-600 font-bold">₹{inv.paid_amount.toLocaleString()}</td>
                        <td className="px-5 py-4 font-bold text-red-600">₹{inv.balance_amount.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                            inv.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {inv.balance_amount > 0 ? (
                            <button
                              onClick={() => {
                                setShowFeeModal(inv);
                                setFeeCollectAmount(inv.balance_amount);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TRANSPORT MANAGEMENT & LIVE GPS TRACKING */}
          {activeTab === 'transport' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Transport Fleet & Live GPS Tracking</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Bus Routes, Student Stops, Driver Telemetry, and Parent Arrival ETA Alerts
                  </p>
                </div>
              </div>

              {/* Routes Grid with Live Tracking Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {transportRoutes.map((route) => (
                  <div key={route.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                          {route.route_code}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 mt-1">{route.route_name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {route.vehicle_type} • Reg: <span className="font-mono font-bold text-gray-800">{route.vehicle_number}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          route.status === 'IN_TRANSIT' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {route.status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Speed: {route.current_speed_kmh} km/h</p>
                      </div>
                    </div>

                    {/* Driver & Attendant Card */}
                    <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-800">Driver: {route.driver_name}</p>
                        <p className="text-gray-500 text-[11px]">Phone: {route.driver_phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-[11px]">Attendant: {route.attendant_name}</p>
                        <p className="text-blue-600 font-bold">Capacity: {route.capacity} Students</p>
                      </div>
                    </div>

                    {/* Stops & Route Progress */}
                    <div>
                      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Route Stops & Arrival Schedule:
                      </p>
                      <div className="space-y-2">
                        {route.stops.map((stop, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-3.5 h-3.5 ${stop.is_passed ? 'text-emerald-600' : 'text-amber-500'}`} />
                              <span className={stop.is_passed ? 'line-through text-gray-400 font-medium' : 'font-bold text-gray-800'}>
                                {stop.stop_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px]">
                              <span className="font-semibold text-gray-500">{stop.scheduled_time}</span>
                              {stop.student_count > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                  {stop.student_count} Students
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Driver Trip Toggle */}
                    <div className="pt-2">
                      <button
                        onClick={() => toggleTripStatus(route.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm ${
                          route.status === 'IN_TRANSIT'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {route.status === 'IN_TRANSIT' ? (
                          <>
                            <Square className="w-3.5 h-3.5" /> End Morning Bus Trip
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Start Morning Bus Trip
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STUDENTS (SIS) */}
          {activeTab === 'students' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Student Information System (SIS)</h1>
                  <p className="text-xs text-gray-500 mt-1">Multi-tier Enrolment: School, PU College (PCMB/PCMC/Commerce) and Degree</p>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Enrol New Student
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by student name or admission number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="ALL">All Levels (Schools, PUC, College)</option>
                  <option value="School">School (CBSE / State)</option>
                  <option value="PU College">PU College (Science & Commerce)</option>
                  <option value="Degree College">Degree College (Undergraduate)</option>
                </select>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Adm No / Roll</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Class / Program</th>
                      <th className="px-5 py-3">Stream / Section</th>
                      <th className="px-5 py-3">Guardian Contact</th>
                      <th className="px-5 py-3">Attendance</th>
                      <th className="px-5 py-3">Fee Due</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-mono">
                          <span className="font-bold text-gray-900">{st.admission_number}</span>
                          <span className="block text-[10px] text-gray-400">Roll: {st.roll_number}</span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          {st.first_name} {st.last_name}
                          <span className="block text-[10px] font-normal text-gray-500">{st.institution_level}</span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">{st.class_name}</td>
                        <td className="px-5 py-3.5">{st.section_or_stream}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-800">{st.guardian_name}</p>
                          <p className="text-[10px] text-gray-400">{st.guardian_phone}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-bold ${st.attendance_pct >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {st.attendance_pct}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold">
                          {st.fee_balance === 0 ? (
                            <span className="text-emerald-600 font-semibold">Cleared (₹0)</span>
                          ) : (
                            <span className="text-red-600">₹{st.fee_balance.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
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

          {/* TAB: DAILY ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Daily Attendance Marker</h1>
                  <p className="text-xs text-gray-500 mt-1">Period-wise roll-call with duplicate prevention</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                    Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Roll #</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Class</th>
                      <th className="px-5 py-3">Current Status</th>
                      <th className="px-5 py-3 text-right">Quick Mark Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.map((rec) => (
                      <tr key={rec.student_id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{rec.roll_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{rec.student_name}</td>
                        <td className="px-5 py-3.5">{rec.class_name}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => updateAttendance(rec.student_id, 'PRESENT')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                rec.status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => updateAttendance(rec.student_id, 'ABSENT')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                rec.status === 'ABSENT' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => updateAttendance(rec.student_id, 'LATE')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                rec.status === 'LATE' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-amber-50'
                              }`}
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

          {/* TAB: MARKS ENTRY */}
          {activeTab === 'marks' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Faculty Marks Entry Screen</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter examination scores for authorized classes with instantaneous grade calculation
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Roll #</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">Max Marks</th>
                      <th className="px-5 py-3">Obtained Marks</th>
                      <th className="px-5 py-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {marks.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{m.roll_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{m.student_name}</td>
                        <td className="px-5 py-3.5 font-medium">{m.subject}</td>
                        <td className="px-5 py-3.5">{m.max_marks}</td>
                        <td className="px-5 py-3.5">
                          <input
                            type="number"
                            min="0"
                            max={m.max_marks}
                            defaultValue={m.obtained_marks}
                            onBlur={(e) => saveMark(m.student_id, m.subject, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded font-bold text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: REPORT CARDS PDF */}
          {activeTab === 'report-cards' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Student Progress Report Card</h1>
                  <p className="text-xs text-gray-500 mt-1">Official Board & University Format Report Cards</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
              </div>

              {/* Printable Card */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6 print:border-none print:shadow-none">
                <div className="text-center border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">AKSHARA GLOBAL SCHOOL & PU COLLEGE</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Bengaluru, Karnataka • Affiliated to State & CBSE Boards</p>
                  <p className="text-xs font-bold text-blue-600 mt-2">CUMULATIVE PERFORMANCE REPORT CARD — 2026</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Student Name</span>
                    <span className="font-bold text-gray-900">Ananya Hegde</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Admission Number</span>
                    <span className="font-mono font-bold text-gray-900">ADM-2026-002</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Class & Stream</span>
                    <span className="font-bold text-gray-900">I PUC (PCMB Science)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Attendance Record</span>
                    <span className="font-bold text-emerald-600">92.0% (Regular)</span>
                  </div>
                </div>

                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-100 uppercase font-semibold text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-4 py-2.5">Max Marks</th>
                      <th className="px-4 py-2.5">Obtained Marks</th>
                      <th className="px-4 py-2.5">Grade</th>
                      <th className="px-4 py-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Physics (Theory 70 + Lab 30)</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3 font-bold text-blue-600">88</td>
                      <td className="px-4 py-3 font-bold">A</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">Distinction</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Biology (Botany + Zoology)</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3 font-bold text-blue-600">92</td>
                      <td className="px-4 py-3 font-bold">A+</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">Exemplary</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Chemistry (Inorganic & Organic)</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3 font-bold text-blue-600">86</td>
                      <td className="px-4 py-3 font-bold">A</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">Distinction</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Pure Mathematics</td>
                      <td className="px-4 py-3">100</td>
                      <td className="px-4 py-3 font-bold text-blue-600">90</td>
                      <td className="px-4 py-3 font-bold">A+</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">Exemplary</td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-8 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="text-center">
                    <p className="font-bold text-gray-800">Class Teacher Signature</p>
                    <p className="text-[10px] text-gray-400 mt-1">Verified on 04 Nov 2026</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">Examination Controller</p>
                    <p className="text-[10px] text-gray-400 mt-1">Sealed & Audited</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">Dr. Ramesh Kumar (Principal)</p>
                    <p className="text-[10px] text-gray-400 mt-1">Authorized Seal of Institution</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other standard tabs: admissions, staff, timetable, etc. */}
          {activeTab === 'admissions' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Admissions Pipeline</h1>
                  <p className="text-xs text-gray-500 mt-1">Enquiries, Document Verifications and Approval Queue</p>
                </div>
                <button
                  onClick={() => setShowAdmissionModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> New Admission Application
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">App #</th>
                      <th className="px-5 py-3">Applicant Name</th>
                      <th className="px-5 py-3">Target Level & Class</th>
                      <th className="px-5 py-3">Parent Contact</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admissions.map((adm) => (
                      <tr key={adm.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{adm.application_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{adm.applicant_name}</td>
                        <td className="px-5 py-3.5">{adm.target_class} ({adm.level})</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-800">{adm.parent_name}</p>
                          <p className="text-[10px] text-gray-400">{adm.parent_phone}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            adm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            adm.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {adm.status !== 'APPROVED' ? (
                            <button
                              onClick={() => approveAdmission(adm.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                            >
                              Approve & Enroll
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Enrolled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Faculty & Staff Directory</h1>
                <p className="text-xs text-gray-500 mt-1">Academic departments, qualifications and payroll permissions</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-900">Dr. V. Murthy</h4>
                  <p className="text-xs text-blue-600 font-semibold">Head of Physics (PU College)</p>
                  <p className="text-xs text-gray-500">Ph.D. in Applied Physics • 14 Years Teaching Experience</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-900">Prof. S. Joshi</h4>
                  <p className="text-xs text-blue-600 font-semibold">Senior Lecturer in Chemistry</p>
                  <p className="text-xs text-gray-500">M.Sc. Organic Chemistry • KCET & NEET Lead Faculty</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-900">Dr. Anita Rao</h4>
                  <p className="text-xs text-blue-600 font-semibold">Head of Biology & Life Sciences</p>
                  <p className="text-xs text-gray-500">Botany & Zoology Specialist • NEET Mentor</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Weekly Master Timetable</h1>
                <p className="text-xs text-gray-500 mt-1">Period allocation, laboratory slots, and conflict warnings</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-4">I PUC Science (PCMB) Timetable Matrix</h3>
                <div className="grid grid-cols-5 gap-3 text-xs text-center font-medium">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900">Monday</p>
                    <p className="text-gray-600 mt-2">09:00 - Physics (Theory)</p>
                    <p className="text-gray-600 mt-1">10:00 - Chemistry</p>
                    <p className="text-gray-600 mt-1">11:15 - Mathematics</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900">Tuesday</p>
                    <p className="text-gray-600 mt-2">09:00 - Biology</p>
                    <p className="text-gray-600 mt-1">10:00 - Physics Lab</p>
                    <p className="text-gray-600 mt-1">11:15 - English</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900">Wednesday</p>
                    <p className="text-gray-600 mt-2">09:00 - NEET Coaching</p>
                    <p className="text-gray-600 mt-1">10:00 - Mathematics</p>
                    <p className="text-gray-600 mt-1">11:15 - Chemistry Lab</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900">Thursday</p>
                    <p className="text-gray-600 mt-2">09:00 - Physics</p>
                    <p className="text-gray-600 mt-1">10:00 - Biology Lab</p>
                    <p className="text-gray-600 mt-1">11:15 - KCET Practice</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900">Friday</p>
                    <p className="text-gray-600 mt-2">09:00 - Mathematics</p>
                    <p className="text-gray-600 mt-1">10:00 - Chemistry</p>
                    <p className="text-gray-600 mt-1">11:15 - Mock Test Analysis</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parents' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Parent & Guardian Portal Preview</h1>
                <p className="text-xs text-gray-500 mt-1">Strictly isolated to linked children only</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    AS
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">Aarav Sharma (Class 10-A)</h3>
                    <p className="text-xs text-gray-500">Guardian: Rajesh Sharma (+91 98450 12345)</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block">Attendance: 96.5%</span>
                    <span className="text-emerald-700 text-[11px]">Regular • 0 Unexcused absences</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block">Fee Balance: ₹0 (Cleared)</span>
                    <span className="text-blue-700 text-[11px]">Term 2 fees settled</span>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="font-bold text-purple-900 block">Latest Exam: 92.5% Distinction</span>
                    <span className="text-purple-700 text-[11px]">Unit Test 2 published</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Enterprise Academic & Financial Analytics</h1>
                <p className="text-xs text-gray-500 mt-1">Cross-campus comparative reporting and performance forecasting</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-900">Academic Distinction Cohort</h4>
                  <p className="text-3xl font-black text-blue-600">84 Students</p>
                  <p className="text-xs text-gray-500">Predicted &gt;90% in upcoming Board examinations based on continuous assessments.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-900">Fee Collection Efficiency</h4>
                  <p className="text-3xl font-black text-emerald-600">91.4%</p>
                  <p className="text-xs text-gray-500">₹1,48,500 collected across Cash, UPI & Gateway with zero ledger discrepancies.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-2xl font-black text-gray-900">White-Label Branding & Campus Config</h1>
                <p className="text-xs text-gray-500 mt-1">Custom domains, logos, primary colors and tenant isolation settings</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Institution Legal Name</label>
                    <input
                      type="text"
                      disabled
                      value="Akshara Global School & College"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Primary Color Scheme</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-700 border"></div>
                      <span className="font-mono text-gray-800">#1E40AF (Royal Blue)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Collect Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900">Collect Student Fee Payment</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Recording payment for {showFeeModal.student_name} ({showFeeModal.invoice_number})
            </p>
            <form onSubmit={handleCollectFeeSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">
                  Fee Category Head: {showFeeModal.fee_head.replace(/_/g, ' ')}
                </span>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Collection Amount (INR)
                </label>
                <input
                  type="number"
                  min="1"
                  max={showFeeModal.balance_amount}
                  value={feeCollectAmount}
                  onChange={(e) => setFeeCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Remaining balance due: ₹{showFeeModal.balance_amount.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash (Counter Collection)</option>
                  <option value="NetBanking">Net Banking / NEFT / IMPS</option>
                  <option value="Gateway">Razorpay Online Gateway</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900">Add Academic Subject</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Configure subject code, theory/practical breakdown and teacher</p>
            <form onSubmit={handleAddSubjectSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PHY-201"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optics & Modern Physics"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Institution Tier</label>
                  <select
                    value={newSubject.institution_level}
                    onChange={(e: any) => setNewSubject({ ...newSubject, institution_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="School">School (K-12)</option>
                    <option value="PU College">PU College (I/II PUC)</option>
                    <option value="Degree College">Degree College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Teacher</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. V. Murthy"
                    value={newSubject.assigned_teacher}
                    onChange={(e) => setNewSubject({ ...newSubject, assigned_teacher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Theory Max Marks</label>
                  <input
                    type="number"
                    value={newSubject.theory_marks}
                    onChange={(e) => setNewSubject({ ...newSubject, theory_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Practical Max Marks</label>
                  <input
                    type="number"
                    value={newSubject.practical_marks}
                    onChange={(e) => setNewSubject({ ...newSubject, practical_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrol Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900">Enrol New Student</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Complete student enrollment form</p>
            <form onSubmit={handleAddStudentSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Institution Level</label>
                  <select
                    value={newStudent.institution_level}
                    onChange={(e: any) => setNewStudent({ ...newStudent, institution_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  >
                    <option value="School">School</option>
                    <option value="PU College">PU College</option>
                    <option value="Degree College">Degree College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Class / Program</label>
                  <input
                    type="text"
                    required
                    value={newStudent.class_name}
                    onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={newStudent.guardian_name}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={newStudent.guardian_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Complete Enrolment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admission Modal */}
      {showAdmissionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900">New Admission Application</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Record applicant details</p>
            <form onSubmit={handleCreateAdmissionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Applicant Name</label>
                <input
                  type="text"
                  required
                  value={newApp.applicant_name}
                  onChange={(e) => setNewApp({ ...newApp, applicant_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Level</label>
                  <select
                    value={newApp.level}
                    onChange={(e) => setNewApp({ ...newApp, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  >
                    <option value="School">School</option>
                    <option value="PU College">PU College</option>
                    <option value="Degree College">Degree College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Class</label>
                  <input
                    type="text"
                    required
                    value={newApp.target_class}
                    onChange={(e) => setNewApp({ ...newApp, target_class: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parent Name</label>
                  <input
                    type="text"
                    required
                    value={newApp.parent_name}
                    onChange={(e) => setNewApp({ ...newApp, parent_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parent Phone</label>
                  <input
                    type="text"
                    required
                    value={newApp.parent_phone}
                    onChange={(e) => setNewApp({ ...newApp, parent_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
