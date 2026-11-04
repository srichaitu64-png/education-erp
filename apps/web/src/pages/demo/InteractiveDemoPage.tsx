import React, { useState } from 'react';
import {
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
  FileText
} from 'lucide-react';
import {
  useDemoStore,
  UserRoleType,
  ROLE_PRIVILEGES,
  InstitutionalExamCategory,
  ExamDeliveryMode,
  FineGrainedAction,
  PresentationState
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
    collectFee,
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
    { id: 'permissions-centre', label: 'Central Permission Matrix', icon: Key, isSuperAdminOnly: true },
    { id: 'dashboard-designer', label: 'Dashboard & Access Designer', icon: Layout, isSuperAdminOnly: true },
    { id: 'examinations', label: 'Examinations Lifecycle', icon: Award, isSuperAdminOnly: false },
    { id: 'institution-login', label: 'Institution Login & Autocomplete', icon: UserCheck, isSuperAdminOnly: false },
    { id: 'academics', label: 'Academic & Subjects', icon: BookOpen, isSuperAdminOnly: false },
    { id: 'fees', label: 'Fee Management', icon: CreditCard, isSuperAdminOnly: false },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, isSuperAdminOnly: false },
    { id: 'transport', label: 'Transport Fleet & GPS', icon: Bus, isSuperAdminOnly: false },
    { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap, isSuperAdminOnly: false },
    { id: 'students', label: 'Students (SIS)', icon: Users, isSuperAdminOnly: false },
    { id: 'staff', label: 'Faculty & HR', icon: Users, isSuperAdminOnly: false },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock, isSuperAdminOnly: false },
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
              <option value="PRINCIPAL">👑 Principal / Director</option>
              <option value="SUPER_ADMIN">🌐 Platform Super Admin (Full Control)</option>
              <option value="INSTITUTION_ADMIN">🏛️ Institution Admin</option>
              <option value="VICE_PRINCIPAL">🎓 Vice Principal</option>
              <option value="ACCOUNTANT">💰 Accountant / Finance</option>
              <option value="EXAM_CONTROLLER">📝 Examination Controller</option>
              <option value="TEACHER">👩‍🏫 Teacher (I PUC Physics)</option>
              <option value="PARENT">👨‍👩‍👧 Parent (Aarav's Guardian)</option>
              <option value="STUDENT">🎒 Student (Ananya - I PUC)</option>
              <option value="TRANSPORT_MANAGER">🚌 Transport Manager</option>
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
            <strong className="text-slate-100 font-semibold">Scope: </strong>
            {currentPrivilege.scopes.map(s => `${s.scopeType}: ${s.description}`).join(' • ')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400">
            <strong>Can Edit:</strong> {currentPrivilege.canEdit.join(', ')}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400">
            <strong>Restriction:</strong> {currentPrivilege.restrictedActions[0]}
          </span>
        </div>
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

              if (item.isSuperAdminOnly && currentRole !== 'SUPER_ADMIN') {
                // Render as Locked with explanation
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      alert(`🔒 Super Admin Exclusive Control:\n\nThis module ('${item.label}') can only be accessed by Platform Super Admin. Ordinary roles (including Institution Admin & Principal) cannot manage platform permissions or layouts.`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-500 bg-slate-900/40 border border-slate-800/60 opacity-60 hover:opacity-100 transition-all cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  </button>
                );
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
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">{currentPrivilege.title}</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Authenticated session with zero-trust PostgreSQL Row-Level Security tenant boundary
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-800">
                    Academic Year 2026–2027
                  </span>
                </div>
              </div>

              {/* High-level Overview Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase">Total Enrolled</p>
                  <p className="text-2xl font-black text-white mt-1">{students.length} Students</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">School, PU College & Degree College</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase">Scheduled Exams</p>
                  <p className="text-2xl font-black text-white mt-1">{exams.length} Institutional Exams</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">Offline Paper + Online CBT</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase">Fee Collections</p>
                  <p className="text-2xl font-black text-white mt-1">₹85,000 Collected</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tuition, Labs, Hostel, Bus & Board</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase">Active Bus Fleet</p>
                  <p className="text-2xl font-black text-white mt-1">{transportRoutes.length} GPS Routes</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">Live telemetry in transit</p>
                </div>
              </div>

              {/* RBAC Access Boundaries Summary */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Active Role Authorization & Access Boundaries
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
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: CENTRAL PERMISSION MANAGEMENT CONTROL CENTRE (Super Admin) */}
          {/* ================================================================= */}
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
                <div className="flex items-center gap-2">
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
                {/* 1. Select Login Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    1. Select Role to Authenticate:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['PRINCIPAL', 'INSTITUTION_ADMIN', 'ACCOUNTANT', 'EXAM_CONTROLLER', 'TEACHER', 'PARENT', 'STUDENT'] as UserRoleType[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setLoginRole(r);
                          if (r === 'TEACHER') setSelectedUserIdentity('Dr. V. Murthy (EMP-PHY-102)');
                          else if (r === 'PARENT') setSelectedUserIdentity('Rajesh Sharma (Father of Aarav - Class 10)');
                          else if (r === 'STUDENT') setSelectedUserIdentity('Ananya Hegde (ADM-2026-092)');
                          else setSelectedUserIdentity('Dr. Ramesh Kumar (EMP-PRIN-01)');
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border text-left transition-colors cursor-pointer ${
                          loginRole === r
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        {r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
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
          {/* TAB 7: MULTI-CATEGORY FEE COLLECTION ENGINE */}
          {/* ================================================================= */}
          {activeTab === 'fees' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-white">Multi-Category Fee Collection Engine</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Tuition Fees, Laboratory Fees, Hostel & Mess Charges, Transport Fees with Digital Receipts
                  </p>
                </div>
              </div>

              {/* Fee Head Filter */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-400 uppercase text-[11px]">Fee Head:</span>
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

              {/* Invoices Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Fee Category Head</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Collected</th>
                      <th className="p-3">Balance Due</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Collect Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {invoices
                      .filter(inv => feeCategoryFilter === 'ALL' || inv.fee_head === feeCategoryFilter)
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-900/60">
                          <td className="p-3 font-mono text-slate-300 font-bold">{inv.invoice_number}</td>
                          <td className="p-3">
                            <span className="font-bold text-white block">{inv.student_name}</span>
                            <span className="text-[10px] text-slate-400">{inv.class_name}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-200 block">{inv.fee_title}</span>
                            <span className="text-[9px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              {inv.fee_head.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-200">₹{inv.total_amount.toLocaleString()}</td>
                          <td className="p-3 font-mono text-emerald-400">₹{inv.paid_amount.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-rose-400">₹{inv.balance_amount.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300'
                                : inv.status === 'OVERDUE'
                                ? 'bg-rose-950 text-rose-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {inv.balance_amount > 0 ? (
                              <button
                                onClick={() => {
                                  const pay = collectFee(inv.id, inv.balance_amount);
                                  alert(`Payment Recorded!\n\nReceipt #${pay.receiptNumber}\nAmount: ₹${inv.balance_amount.toLocaleString()}`);
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Collect Fee
                              </button>
                            ) : (
                              <span className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Settled
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

          {/* ================================================================= */}
          {/* TAB 8: TRANSPORT FLEET & LIVE GPS TELEMETRY */}
          {/* ================================================================= */}
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
