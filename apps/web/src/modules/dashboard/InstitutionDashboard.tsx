import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  Sparkles,
  MessageSquare,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  BookOpen,
  Building2,
  Clock,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { FeatureGate } from '../../components/FeatureGate';
import { useDemoStore, DemoFeeInvoice } from '../../store/demoStore';

export const InstitutionDashboard: React.FC = () => {
  const { tenant, currentPlan, entitlements } = useAuthStore();
  const location = useLocation();

  const {
    students,
    invoices,
    attendance,
    marks,
    addStudent,
    collectFee,
    updateAttendance,
  } = useDemoStore();

  // Search & Filter state for students
  const [studentSearch, setStudentSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
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

  const pathname = location.pathname;

  // Render subpage content based on current route
  const renderContent = () => {
    // 1. STUDENTS & ADMISSIONS
    if (pathname.includes('/students')) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Student Information System (SIS)</h2>
              <p className="text-xs text-gray-500">Live student directory, multi-stream enrolment, and demographic records</p>
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Enrol New Student
            </button>
          </div>

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
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="ALL">All Levels (Schools, PUC, College)</option>
                <option value="School">School (CBSE / State)</option>
                <option value="PU College">PU College (Science & Commerce)</option>
                <option value="Degree College">Degree College (Undergraduate)</option>
              </select>
            </div>
          </div>

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
      );
    }

    // 2. FEES & INVOICING
    if (pathname.includes('/fees')) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Fee Management & Invoicing</h2>
              <p className="text-xs text-gray-500">Structured fee collections, instant thermal/A4 receipt generation, and ledger reconciliations</p>
            </div>
            {lastReceipt && (
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {lastReceipt}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Invoiced</p>
              <p className="text-xl font-black text-gray-900 mt-1">₹1,56,000</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">Total Collected</p>
              <p className="text-xl font-black text-emerald-600 mt-1">₹1,15,000</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-red-600 font-bold">Outstanding Balance</p>
              <p className="text-xl font-black text-red-600 mt-1">₹41,000</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider">Fee Invoices & Dues</h3>
              <span className="text-xs text-gray-400">Showing {invoices.length} invoices</span>
            </div>
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Fee Title</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Balance Due</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80">
                    <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{inv.student_name}</td>
                    <td className="px-5 py-3.5">{inv.class_name}</td>
                    <td className="px-5 py-3.5">{inv.fee_title}</td>
                    <td className="px-5 py-3.5 font-bold">₹{inv.total_amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">₹{inv.paid_amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-bold text-red-600">₹{inv.balance_amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
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
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          Collect Fee
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Official Receipt for ${inv.invoice_number}\nStudent: ${inv.student_name}\nAmount: ₹${inv.total_amount}\nStatus: Paid in Full`)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-[11px] flex items-center gap-1.5 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 3. ATTENDANCE
    if (pathname.includes('/attendance')) {
      const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
      const pct = Math.round((presentCount / attendance.length) * 100);

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Daily Attendance Marker</h2>
              <p className="text-xs text-gray-500">Live period and daily biometric / roll-call attendance with instant parent alerting</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                Attendance: {pct}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider">Class Roster Attendance Marking</h3>
              <span className="text-xs text-gray-400">Click buttons to instantly toggle status</span>
            </div>
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
      );
    }

    // 4. EXAMINATIONS & MARKS
    if (pathname.includes('/examinations')) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Examinations & Marks Registry</h2>
              <p className="text-xs text-gray-500">Board examination scheduling, grade schemes (CBSE/PUC/SGPA), and automated report cards</p>
            </div>
            <button
              onClick={() => alert('Generating cumulative semester report cards for all enrolled students.')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print All Report Cards
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider">Mid-Term Assessment Marks</h3>
              <span className="text-xs text-gray-400">Total Entries: {marks.length}</span>
            </div>
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase font-semibold text-gray-400 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Roll #</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Max Marks</th>
                  <th className="px-5 py-3">Obtained</th>
                  <th className="px-5 py-3">Percentage</th>
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
                    <td className="px-5 py-3.5 font-bold text-blue-600">{m.obtained_marks}</td>
                    <td className="px-5 py-3.5 font-semibold">{Math.round((m.obtained_marks / m.max_marks) * 100)}%</td>
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
      );
    }

    // 5. ACADEMICS & TIMETABLE
    if (pathname.includes('/academics')) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-900">Academics, Class Schedules & Timetable</h2>
            <p className="text-xs text-gray-500">Period schedules, subject teachers, lab rooms, and academic calendar</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-4">Class 10-A Timetable Matrix</h3>
            <div className="grid grid-cols-5 gap-3 text-xs text-center font-medium">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900">Monday</p>
                <p className="text-gray-600 mt-2">09:00 - Mathematics</p>
                <p className="text-gray-600 mt-1">10:00 - Physics</p>
                <p className="text-gray-600 mt-1">11:15 - English</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900">Tuesday</p>
                <p className="text-gray-600 mt-2">09:00 - Chemistry</p>
                <p className="text-gray-600 mt-1">10:00 - Biology Lab</p>
                <p className="text-gray-600 mt-1">11:15 - Social Studies</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900">Wednesday</p>
                <p className="text-gray-600 mt-2">09:00 - Computer Sci</p>
                <p className="text-gray-600 mt-1">10:00 - Mathematics</p>
                <p className="text-gray-600 mt-1">11:15 - Hindi / Kannada</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900">Thursday</p>
                <p className="text-gray-600 mt-2">09:00 - Physics Lab</p>
                <p className="text-gray-600 mt-1">10:00 - Chemistry</p>
                <p className="text-gray-600 mt-1">11:15 - Physical Ed</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-blue-900">Friday</p>
                <p className="text-gray-600 mt-2">09:00 - Mathematics</p>
                <p className="text-gray-600 mt-1">10:00 - Social Studies</p>
                <p className="text-gray-600 mt-1">11:15 - Library</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 6. WHATSAPP AUTOMATION (GATED)
    if (pathname.includes('/whatsapp')) {
      return (
        <div className="space-y-6">
          <FeatureGate featureId="communication.whatsapp">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-black text-gray-900">Official WhatsApp Business API Automation</h2>
              <p className="text-xs text-gray-500 mt-1 mb-4">Send instant fee receipts, absence alerts, and report cards directly to parent WhatsApp numbers.</p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <p className="font-bold">✓ WhatsApp Cloud API Gateway Connected</p>
                <p>Status: Template verified by Meta. Daily quota: 10,000 automated utility messages.</p>
              </div>
            </div>
          </FeatureGate>
        </div>
      );
    }

    // 7. AI REPORTS (GATED)
    if (pathname.includes('/ai-reports')) {
      return (
        <div className="space-y-6">
          <FeatureGate featureId="analytics.ai_reports">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-black text-gray-900">AI Student Academic Risk & Forecasting</h2>
              <p className="text-xs text-gray-500 mt-1 mb-4">Neural models analyze cross-semester trends to detect students who need early academic support.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50">
                  <h4 className="font-bold text-xs text-purple-900">High Performance Cohort</h4>
                  <p className="text-2xl font-black text-purple-700 mt-1">84 Students</p>
                  <p className="text-[11px] text-purple-800 mt-1">Predicted &gt;90% in upcoming Board examinations.</p>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                  <h4 className="font-bold text-xs text-amber-900">Early Intervention Required</h4>
                  <p className="text-2xl font-black text-amber-700 mt-1">12 Students</p>
                  <p className="text-[11px] text-amber-800 mt-1">Declining attendance correlation detected in Mathematics.</p>
                </div>
              </div>
            </div>
          </FeatureGate>
        </div>
      );
    }

    // 8. MULTI-CAMPUS DIRECTORY (GATED)
    if (pathname.includes('/campuses')) {
      return (
        <div className="space-y-6">
          <FeatureGate featureId="multi_campus">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-black text-gray-900">Multi-Campus Institution Directory</h2>
              <p className="text-xs text-gray-500 mt-1 mb-4">Centralized governance for primary schools, PU college campuses, and degree colleges.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-sm text-gray-900">{tenant?.name || 'OUR SCHOOL'} Main Campus</h4>
                  <p className="text-xs text-gray-500 mt-1">Campus Ground, Bengaluru • School & PU Units</p>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Main Campus</span>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-sm text-gray-900">{tenant?.name || 'OUR SCHOOL'} Extended Campus</h4>
                  <p className="text-xs text-gray-500 mt-1">Science & Technology Block • Laboratories & Sports</p>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">Affiliated Campus</span>
                </div>
              </div>
            </div>
          </FeatureGate>
        </div>
      );
    }

    // DEFAULT: OVERVIEW DASHBOARD
    return (
      <div className="space-y-6">
        {/* Welcome & Plan Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-800/80 text-blue-200 border border-blue-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              Verified Institution
            </span>
            <h2 className="text-2xl font-black">
              {tenant?.name || (tenant?.code === 'akshara-trial' ? 'AKSHARA GLOBAL SCHOOL AND PU COLLEGE' : 'OUR SCHOOL')}
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              Academic Year 2026–2027 • Main Campus Active • Multi-Tenant Isolated
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-right">
            <p className="text-xs text-blue-200 uppercase tracking-wider">Subscription Tier</p>
            <p className="text-xl font-extrabold text-white">{currentPlan}</p>
            <Link
              to="/pricing"
              className="text-xs text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1 mt-1"
            >
              Upgrade Modules <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/app/students" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{students.length} / 750</p>
              <div className="w-32 bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(students.length / 750) * 100}%` }}></div>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </Link>

          <Link to="/app/attendance" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-colors">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Today's Attendance</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">94.8%</p>
              <p className="text-xs text-gray-400 mt-1">427 present • 23 absent</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </Link>

          <Link to="/app/fees" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-amber-300 transition-colors">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Total Collections</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹1,15,000</p>
              <p className="text-xs text-gray-400 mt-1">Cash, UPI & Gateway</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </Link>

          <Link to="/app/examinations" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-purple-300 transition-colors">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Examinations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
              <p className="text-xs text-gray-400 mt-1">Mid-Term Grade Registry</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </Link>
        </div>

        {/* Quick Launchpad */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Institutional Module Capabilities</h3>
              <p className="text-sm text-gray-500">Live feature gating based on plan entitlements and administrator overrides</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
              {Object.keys(entitlements).length || 28} Modules Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Link to="/app/students" className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-900">Student Information System</h4>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Full lifecycle student registration, guardian mapping and class assignments.</p>
              </div>
            </Link>

            <Link to="/app/fees" className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-900">Basic Fee Management</h4>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Fee structures, student invoicing, receipt generation and ledger audit trails.</p>
              </div>
            </Link>
          </div>

          {/* Premium Locked Feature Showcase with FeatureGate */}
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Enterprise Premium Modules</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <FeatureGate featureId="analytics.ai_reports">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-900 font-bold mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Academic Risk & Performance Forecasting
                  </div>
                  <p className="text-xs text-purple-800">
                    Unlocked by active subscription or Super Admin override! Real-time student academic risk predictors active.
                  </p>
                </div>
              </FeatureGate>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <FeatureGate featureId="communication.whatsapp">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold mb-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Official WhatsApp Business Automation
                  </div>
                  <p className="text-xs text-emerald-800">
                    Automated attendance SMS/WhatsApp alerts, fee reminders and report cards broadcasting enabled.
                  </p>
                </div>
              </FeatureGate>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {renderContent()}

      {/* Collect Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900">Collect Student Fee</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Recording payment for {showFeeModal.student_name} ({showFeeModal.invoice_number})
            </p>
            <form onSubmit={handleCollectFeeSubmit} className="space-y-4">
              <div>
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
                  Confirm & Print Receipt
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Institution Level</label>
                  <select
                    value={newStudent.institution_level}
                    onChange={(e: any) => setNewStudent({ ...newStudent, institution_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={newStudent.guardian_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
    </div>
  );
};
