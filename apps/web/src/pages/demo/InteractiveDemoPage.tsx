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
  Download,
  Building2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Eye,
  Settings,
  Layers,
  ChevronRight,
  Check,
  Building
} from 'lucide-react';
import { useDemoStore, DemoStudent, DemoAdmission, DemoFeeInvoice } from '../../store/demoStore';

export const InteractiveDemoPage: React.FC = () => {
  const {
    students,
    admissions,
    invoices,
    attendance,
    marks,
    addStudent,
    createAdmission,
    approveAdmission,
    collectFee,
    updateAttendance,
    saveMark,
    resetDemoData,
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'admissions'
    | 'students'
    | 'fees'
    | 'attendance'
    | 'examinations'
    | 'marks'
    | 'report-cards'
    | 'staff'
    | 'timetable'
    | 'parents'
    | 'analytics'
    | 'settings'
  >('dashboard');

  // Search & Filter state
  const [studentSearch, setStudentSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState<DemoFeeInvoice | null>(null);
  const [feeCollectAmount, setFeeCollectAmount] = useState<number>(0);
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);

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
    setLastReceipt(`Payment recorded! Official Receipt issued: ${res.receiptNumber}`);
    setShowFeeModal(null);
    setFeeCollectAmount(0);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.last_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || s.institution_level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Demo Banner */}
      <div className="bg-slate-950 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-extrabold uppercase tracking-wider text-amber-300">
            Interactive Product Demo Sandbox
          </span>
          <span className="text-gray-400 hidden sm:inline">• Test live forms, fee collections, marks entry, and report cards.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sample Data
          </button>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Create My Institution &rarr;
          </Link>
        </div>
      </div>

      {lastReceipt && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {lastReceipt}
          </span>
          <button onClick={() => setLastReceipt(null)} className="text-white hover:text-emerald-200 font-black">✕</button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Interactive Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
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
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: Layers },
              { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap },
              { id: 'students', label: 'Students (SIS)', icon: Users },
              { id: 'fees', label: 'Fee Management', icon: CreditCard },
              { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
              { id: 'examinations', label: 'Examinations', icon: Award },
              { id: 'marks', label: 'Marks Entry', icon: FileText },
              { id: 'report-cards', label: 'Report Cards PDF', icon: Printer },
              { id: 'staff', label: 'Faculty & HR', icon: Users },
              { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
              { id: 'parents', label: 'Parent Portal View', icon: Eye },
              { id: 'analytics', label: 'Analytics & Trends', icon: Sparkles },
              { id: 'settings', label: 'White-Label Branding', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 bg-gray-50 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Institution Control Center</h1>
                  <p className="text-xs text-gray-500 mt-1">Live demo reflecting reactive memory store data.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Student
                  </button>
                  <button
                    onClick={() => setShowAdmissionModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> New Admission
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Active Students</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{students.length}</p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">100% Enrolled</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase font-semibold">New Enquiries</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{admissions.length}</p>
                  <p className="text-[11px] text-indigo-600 font-bold mt-1">Academic Year 2026-27</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Fee Collection</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    ₹{invoices.reduce((acc, curr) => acc + curr.paid_amount, 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-blue-600 font-bold mt-1">Total Received</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Today's Attendance</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {Math.round((attendance.filter((a) => a.status === 'PRESENT').length / attendance.length) * 100)}%
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">In Session</p>
                </div>
              </div>

              {/* Recent Admissions Activity */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm">Recent Admission Applications</h3>
                  <button onClick={() => setActiveTab('admissions')} className="text-xs font-bold text-blue-600 hover:text-blue-700">View All Pipeline &rarr;</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {admissions.map((adm) => (
                    <div key={adm.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{adm.applicant_name} ({adm.target_class})</p>
                        <p className="text-gray-400">Parent: {adm.parent_name} • {adm.parent_phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                          adm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {adm.status}
                        </span>
                        {adm.status !== 'APPROVED' && (
                          <button
                            onClick={() => approveAdmission(adm.id)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADMISSIONS */}
          {activeTab === 'admissions' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Admission Applications Pipeline</h2>
                  <p className="text-xs text-gray-500">Review enquiries, verify uploaded documents, and approve applications.</p>
                </div>
                <button
                  onClick={() => setShowAdmissionModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create Application
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">App Number</th>
                      <th className="px-5 py-3">Applicant Name</th>
                      <th className="px-5 py-3">Level / Target Class</th>
                      <th className="px-5 py-3">Guardian Contact</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admissions.map((adm) => (
                      <tr key={adm.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{adm.application_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{adm.applicant_name}</td>
                        <td className="px-5 py-3.5">{adm.target_class}</td>
                        <td className="px-5 py-3.5">{adm.parent_name} ({adm.parent_phone})</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            adm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {adm.status !== 'APPROVED' ? (
                            <button
                              onClick={() => approveAdmission(adm.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                            >
                              Approve Admission
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
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

          {/* TAB 3: STUDENTS (SIS) */}
          {activeTab === 'students' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Student Information System (SIS)</h2>
                  <p className="text-xs text-gray-500">Complete student records, parent linkage, attendance %, and fee dues.</p>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Student
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
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-medium"
                >
                  <option value="ALL">All Institutions</option>
                  <option value="School">Schools (K-10)</option>
                  <option value="PU College">PU College (I & II PUC)</option>
                  <option value="Degree College">Degree College</option>
                </select>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Adm No.</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Class / Programme</th>
                      <th className="px-5 py-3">Stream / Section</th>
                      <th className="px-5 py-3">Guardian</th>
                      <th className="px-5 py-3">Attendance</th>
                      <th className="px-5 py-3">Fee Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{s.admission_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{s.first_name} {s.last_name}</td>
                        <td className="px-5 py-3.5">{s.class_name}</td>
                        <td className="px-5 py-3.5">{s.section_or_stream}</td>
                        <td className="px-5 py-3.5">{s.guardian_name}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-emerald-600">{s.attendance_pct}%</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {s.fee_balance === 0 ? (
                            <span className="text-emerald-700 font-bold">Paid</span>
                          ) : (
                            <span className="text-amber-700 font-bold">₹{s.fee_balance.toLocaleString()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Fee Invoices & Live Collection</h2>
                  <p className="text-xs text-gray-500">Collect fee installments, record payments, and issue instantaneous receipts.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Invoice #</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Fee Title</th>
                      <th className="px-5 py-3">Total Amount</th>
                      <th className="px-5 py-3">Paid Amount</th>
                      <th className="px-5 py-3">Balance</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Collect Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{inv.invoice_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{inv.student_name}</td>
                        <td className="px-5 py-3.5">{inv.fee_title}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">₹{inv.total_amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-emerald-600 font-bold">₹{inv.paid_amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-amber-600 font-bold">₹{inv.balance_amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {inv.balance_amount > 0 ? (
                            <button
                              onClick={() => {
                                setShowFeeModal(inv);
                                setFeeCollectAmount(inv.balance_amount);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
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

          {/* TAB 5: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Daily Attendance Marking</h2>
                  <p className="text-xs text-gray-500">Interactive roll-call. Click buttons to toggle Present, Absent, or Late.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Class: <strong>Class 10-A</strong></span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                    Today: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Roll No</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Class</th>
                      <th className="px-5 py-3 text-center">Current Status</th>
                      <th className="px-5 py-3 text-right">Toggle Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.map((rec) => (
                      <tr key={rec.student_id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-bold font-mono text-gray-900">{rec.roll_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{rec.student_name}</td>
                        <td className="px-5 py-3.5">{rec.class_name}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            rec.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'ABSENT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => updateAttendance(rec.student_id, 'PRESENT')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-bold"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => updateAttendance(rec.student_id, 'ABSENT')}
                            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-bold"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => updateAttendance(rec.student_id, 'LATE')}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md font-bold"
                          >
                            Late
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: MARKS ENTRY */}
          {activeTab === 'marks' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Examinations & Marks Entry</h2>
                  <p className="text-xs text-gray-500">Enter marks. Automatic grade and GPA calculations update instantaneously.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Roll</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">Max Marks</th>
                      <th className="px-5 py-3">Obtained Marks</th>
                      <th className="px-5 py-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {marks.map((m) => (
                      <tr key={`${m.student_id}-${m.subject}`} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-bold font-mono">{m.roll_number}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{m.student_name}</td>
                        <td className="px-5 py-3.5">{m.subject}</td>
                        <td className="px-5 py-3.5">{m.max_marks}</td>
                        <td className="px-5 py-3.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={m.obtained_marks}
                            onChange={(e) => saveMark(m.student_id, m.subject, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded-md border border-gray-300 font-bold text-gray-900"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-extrabold">
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

          {/* TAB 7: REPORT CARDS */}
          {activeTab === 'report-cards' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Student Progress Report Card</h2>
                  <p className="text-xs text-gray-500">Official, print-ready institutional report card with branding.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>

              {/* Printable Report Card Card */}
              <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-md space-y-6">
                <div className="text-center pb-6 border-b-2 border-gray-100 space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg mx-auto mb-2">
                    A
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">AKSHARA GLOBAL SCHOOL & COLLEGE</h3>
                  <p className="text-xs text-gray-500">100 Feet Ring Road, JP Nagar, Bengaluru, Karnataka • Affiliation: CBSE / State Board</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700 pt-2">Mid-Term Academic Progress Report 2026–27</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <span className="text-gray-400 block font-semibold">STUDENT NAME</span>
                    <strong className="text-gray-900">Aarav Sharma</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">ADMISSION NO</span>
                    <strong className="text-gray-900">ADM-2026-001</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">CLASS & SECTION</span>
                    <strong className="text-gray-900">Class 10 - Section A</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">ROLL NUMBER</span>
                    <strong className="text-gray-900">101</strong>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-gray-200">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th className="p-3 border-b border-gray-200">Subject</th>
                      <th className="p-3 border-b border-gray-200 text-center">Maximum Marks</th>
                      <th className="p-3 border-b border-gray-200 text-center">Marks Obtained</th>
                      <th className="p-3 border-b border-gray-200 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Mathematics</td>
                      <td className="p-3 text-center">100</td>
                      <td className="p-3 text-center font-bold text-gray-900">94</td>
                      <td className="p-3 text-center font-extrabold text-emerald-700">A+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Science</td>
                      <td className="p-3 text-center">100</td>
                      <td className="p-3 text-center font-bold text-gray-900">91</td>
                      <td className="p-3 text-center font-extrabold text-emerald-700">A+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">Social Science</td>
                      <td className="p-3 text-center">100</td>
                      <td className="p-3 text-center font-bold text-gray-900">89</td>
                      <td className="p-3 text-center font-extrabold text-blue-700">A</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-gray-900">English Language & Literature</td>
                      <td className="p-3 text-center">100</td>
                      <td className="p-3 text-center font-bold text-gray-900">92</td>
                      <td className="p-3 text-center font-extrabold text-emerald-700">A+</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold text-xs">
                    <tr>
                      <td className="p-3">Aggregate Total</td>
                      <td className="p-3 text-center">400</td>
                      <td className="p-3 text-center font-black text-gray-950">366 (91.5%)</td>
                      <td className="p-3 text-center font-black text-emerald-700">Distinction (A+)</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="pt-8 flex items-center justify-between text-xs text-gray-500 border-t border-gray-200">
                  <div className="text-center">
                    <div className="h-10"></div>
                    <span className="border-t border-gray-300 pt-1 block font-semibold">Class Teacher Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="h-10"></div>
                    <span className="border-t border-gray-300 pt-1 block font-semibold">Principal Seal & Signature</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STAFF / HR */}
          {activeTab === 'staff' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900">Faculty & Staff Directory</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Dr. Ramesh Kumar', role: 'Principal', dept: 'Administration', exp: '18 Years' },
                  { name: 'Mrs. Sunita Rao', role: 'Senior Faculty', dept: 'Mathematics', exp: '12 Years' },
                  { name: 'Mr. Pradeep Joshi', role: 'HOD Science', dept: 'Physics & Labs', exp: '15 Years' },
                  { name: 'Ms. Meenakshi Sundaram', role: 'Lecturer', dept: 'Computer Science', exp: '8 Years' },
                ].map((s) => (
                  <div key={s.name} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center mb-3">
                      {s.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900">{s.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{s.role} • {s.dept}</p>
                    <p className="text-xs text-gray-400 mt-2">Experience: {s.exp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900">Class Timetable Grid (Class 10-A)</h2>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto p-4 shadow-sm">
                <table className="w-full text-center text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
                    <tr>
                      <th className="p-3">Day</th>
                      <th className="p-3">Period 1 (09:00 - 09:45)</th>
                      <th className="p-3">Period 2 (09:45 - 10:30)</th>
                      <th className="p-3">Period 3 (10:45 - 11:30)</th>
                      <th className="p-3">Period 4 (11:30 - 12:15)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                      <tr key={d}>
                        <td className="p-3 font-bold text-left text-gray-900">{d}</td>
                        <td className="p-3 bg-blue-50/50 rounded font-semibold text-blue-900">Mathematics</td>
                        <td className="p-3 bg-purple-50/50 rounded font-semibold text-purple-900">Physics Lab</td>
                        <td className="p-3 bg-emerald-50/50 rounded font-semibold text-emerald-900">English</td>
                        <td className="p-3 bg-amber-50/50 rounded font-semibold text-amber-900">Social Studies</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: PARENTS */}
          {activeTab === 'parents' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Parent Portal Preview
                </span>
                <h2 className="text-2xl font-black mt-2">Welcome, Rajesh Sharma</h2>
                <p className="text-blue-100 text-xs">Guardian linked to: Aarav Sharma (Class 10-A, Roll 101)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Child Attendance</h3>
                  <p className="text-2xl font-black text-emerald-600">96.5%</p>
                  <p className="text-xs text-gray-400 mt-1">Excellent attendance consistency this term.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-2">Pending Dues</h3>
                  <p className="text-2xl font-black text-gray-900">₹0.00</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1">All invoices cleared.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900">Institutional Analytics & Performance</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-sm text-gray-900 mb-4">Fee Collection Trajectory</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Term 1 Tuition</span>
                        <strong className="text-emerald-600">98% Collected</strong>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Term 2 Tuition</span>
                        <strong className="text-blue-600">82% Collected</strong>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Lab & Activity Fees</span>
                        <strong className="text-purple-600">91% Collected</strong>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-sm text-gray-900 mb-4">Academic Risk Indicator (AI Gated)</h3>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Early Intervention Forecaster Active
                    </p>
                    <p className="text-purple-800">
                      3 students flagged for math revision based on formative test score regressions. Automated revision schedules sent to respective subject teachers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SETTINGS (WHITE-LABEL BRANDING) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900">White-Label Brand Customization</h2>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Institution Brand Name</label>
                  <input
                    type="text"
                    defaultValue="Akshara Global School & College"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#1E40AF" className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer" />
                      <span className="font-mono text-xs">#1E40AF</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Secondary Accent</label>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#F59E0B" className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer" />
                      <span className="font-mono text-xs">#F59E0B</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => alert('Brand configuration saved! Applied to student ID cards, portal header, and report cards.')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Save Brand Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD STUDENT */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-black text-gray-900 mb-1">Add Student (SIS Enrolment)</h3>
            <p className="text-xs text-gray-500 mb-4">Creates student profile with guardian link and fee structure.</p>
            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    placeholder="e.g. Diya"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    placeholder="e.g. Reddy"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Institution Level</label>
                  <select
                    value={newStudent.institution_level}
                    onChange={(e) => setNewStudent({ ...newStudent, institution_level: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="School">School (Class 1-10)</option>
                    <option value="PU College">PU College (I & II PUC)</option>
                    <option value="Degree College">Degree College</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700">Class / Grade</label>
                  <input
                    type="text"
                    value={newStudent.class_name}
                    onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Guardian Name</label>
                  <input
                    type="text"
                    value={newStudent.guardian_name}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_name: e.target.value })}
                    placeholder="e.g. Anand Reddy"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Guardian Phone</label>
                  <input
                    type="text"
                    value={newStudent.guardian_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                    placeholder="+91 98450..."
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW ADMISSION APPLICATION */}
      {showAdmissionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-black text-gray-900 mb-1">Create Admission Application</h3>
            <p className="text-xs text-gray-500 mb-4">Parent inquiry and registration form.</p>
            <form onSubmit={handleCreateAdmissionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700">Applicant Full Name *</label>
                <input
                  type="text"
                  required
                  value={newApp.applicant_name}
                  onChange={(e) => setNewApp({ ...newApp, applicant_name: e.target.value })}
                  placeholder="e.g. Samarth Gowda"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Target Grade / Class</label>
                  <input
                    type="text"
                    value={newApp.target_class}
                    onChange={(e) => setNewApp({ ...newApp, target_class: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Parent Phone</label>
                  <input
                    type="text"
                    value={newApp.parent_phone}
                    onChange={(e) => setNewApp({ ...newApp, parent_phone: e.target.value })}
                    placeholder="+91 9900..."
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COLLECT FEE */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-black text-gray-900 mb-1">Fee Payment Collection</h3>
            <p className="text-xs text-gray-500 mb-4">
              Invoice #{showFeeModal.invoice_number} • {showFeeModal.student_name}
            </p>
            <form onSubmit={handleCollectFeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700">Amount to Collect (INR)</label>
                <input
                  type="number"
                  min="1"
                  max={showFeeModal.balance_amount}
                  value={feeCollectAmount}
                  onChange={(e) => setFeeCollectAmount(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300 font-bold text-base text-gray-900"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Remaining Balance: ₹{showFeeModal.balance_amount.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700">Payment Mode</label>
                <select className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium">
                  <option>UPI / QR Code</option>
                  <option>Cash at Counter</option>
                  <option>Net Banking / NEFT</option>
                  <option>Cheque / DD</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(null)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
