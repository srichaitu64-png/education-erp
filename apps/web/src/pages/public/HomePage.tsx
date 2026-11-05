import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  Sparkles,
  ShieldCheck,
  Wifi,
  WifiOff,
  CheckCircle2,
  ArrowRight,
  Play,
  Building2,
  Building,
  School,
  FileSpreadsheet,
  Download,
  Lock,
  ArrowUpRight,
  Smartphone,
  Star,
  ChevronRight,
  HelpCircle,
  Clock,
  Zap,
  BookOpen,
  Receipt,
  Plus,
  ExternalLink,
  FileCheck
} from 'lucide-react';

interface MockInstitution {
  id: string;
  name: string;
  subdomain: string;
  url: string;
  type: string;
  levelBadge: string;
  affiliation: string;
  badge: string;
  initial: string;
  badgeColor: string;
  themeColor: 'emerald' | 'blue' | 'purple';
  studentsCount: string;
  studentsSub: string;
  attendanceRate: string;
  attendanceSub: string;
  feeCollection: string;
  feeSub: string;
  pendingApprovals: number;
  pendingSub: string;
  studentsList: Array<{
    id: string;
    name: string;
    classLevel: string;
    stream: string;
    guardian: string;
    phone: string;
    attendance: string;
    dues: string;
    status: 'ACTIVE' | 'PENDING';
  }>;
}

const MOCK_INSTITUTIONS: Record<string, MockInstitution> = {
  our_school: {
    id: 'our_school',
    name: 'OUR SCHOOL (Demonstration Campus)',
    subdomain: 'demo',
    url: 'https://demo.educationos.in/dashboard',
    type: 'Composite School & PU College',
    levelBadge: 'K-10 / 12 & PU College',
    affiliation: 'CBSE Affiliation #830192 • Karnataka PU Board • Academic Year 2026–2027',
    badge: 'ACTIVE DEMO • Sandbox Isolated',
    initial: 'O',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    themeColor: 'emerald',
    studentsCount: '3 Demonstration Students',
    studentsSub: 'Aarav, Ananya & Rahul (Pre-populated Demo Data)',
    attendanceRate: '96.5%',
    attendanceSub: 'Biometric Roll Call Finalized',
    feeCollection: '₹37,500',
    feeSub: 'Term 2 Fee Receipts Auto-Reconciled',
    pendingApprovals: 3,
    pendingSub: 'Admissions & Hall Tickets',
    studentsList: [
      {
        id: 'OUR-2026-0101',
        name: 'Aarav Sharma',
        classLevel: 'Class 10-A',
        stream: 'Secondary (CBSE)',
        guardian: 'Rajesh Sharma',
        phone: '+91 98450 12345',
        attendance: '96.5%',
        dues: '₹0 (Settled)',
        status: 'ACTIVE'
      },
      {
        id: 'OUR-2026-0102',
        name: 'Ananya Hegde',
        classLevel: 'I PUC',
        stream: 'PCMB (Science)',
        guardian: 'Venkatesh Hegde',
        phone: '+91 98450 23456',
        attendance: '92.0%',
        dues: '₹12,500 Due',
        status: 'ACTIVE'
      },
      {
        id: 'OUR-2026-0103',
        name: 'Rahul Kumar',
        classLevel: 'II PUC',
        stream: 'PCMB (Science)',
        guardian: 'Ramesh Kumar',
        phone: '+91 98450 99887',
        attendance: '94.2%',
        dues: '₹25,000 Due',
        status: 'ACTIVE'
      }
    ]
  },
  apex_pu: {
    id: 'apex_pu',
    name: 'Apex Composite Pre-University College',
    subdomain: 'apex-pu',
    url: 'https://apex.educationos.in/dashboard',
    type: 'Senior Secondary & Pre-University',
    levelBadge: 'I & II PUC (Science & Commerce)',
    affiliation: 'Karnataka State PU Board • College Code #0834 • Bengaluru',
    badge: 'White-Label Production Tenant',
    initial: 'A',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
    themeColor: 'blue',
    studentsCount: '1,420 Enrolled Students',
    studentsSub: '98.8% Academic Retention',
    attendanceRate: '97.1%',
    attendanceSub: '1,379 Present • Practical Lab Batches',
    feeCollection: '₹4,85,000',
    feeSub: 'CET/NEET Coaching & Lab Dues',
    pendingApprovals: 8,
    pendingSub: 'Physics Lab Duty Slips',
    studentsList: [
      {
        id: 'APX-2026-0412',
        name: 'Divya R. Murthy',
        classLevel: 'I PUC',
        stream: 'PCMC (Electronics)',
        guardian: 'R. Murthy',
        phone: '+91 97410 55123',
        attendance: '98.0%',
        dues: '₹0 (Settled)',
        status: 'ACTIVE'
      },
      {
        id: 'APX-2026-0589',
        name: 'Kiran G. Rao',
        classLevel: 'II PUC',
        stream: 'PCMB (Science)',
        guardian: 'Ganesh Rao',
        phone: '+91 98800 66234',
        attendance: '95.5%',
        dues: '₹8,000 Due',
        status: 'ACTIVE'
      },
      {
        id: 'APX-2026-0720',
        name: 'Pooja Kulkarni',
        classLevel: 'II PUC',
        stream: 'Commerce (EBAC)',
        guardian: 'Nitin Kulkarni',
        phone: '+91 99001 77345',
        attendance: '96.2%',
        dues: '₹14,500 Due',
        status: 'ACTIVE'
      }
    ]
  },
  vidya_degree: {
    id: 'vidya_degree',
    name: 'Vidya Niketan Institute of Higher Education',
    subdomain: 'vidyaniketan',
    url: 'https://vidyaniketan.educationos.in/dashboard',
    type: 'Autonomous Degree College & University',
    levelBadge: 'UG & PG (NEP 2020 Semester Credits)',
    affiliation: 'State University Affiliated • NAAC A++ Accredited • Mysuru',
    badge: 'White-Label Production Tenant',
    initial: 'V',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
    themeColor: 'purple',
    studentsCount: '3,850 Enrolled Scholars',
    studentsSub: '6 Departments • Autonomous Credit Bank',
    attendanceRate: '95.4%',
    attendanceSub: 'RFID Smart-Card Biometric Feed',
    feeCollection: '₹14,20,000',
    feeSub: 'Semester Exam Fees & Hostel Accounts',
    pendingApprovals: 14,
    pendingSub: 'Degree Supplementary Clearances',
    studentsList: [
      {
        id: 'VNI-2026-1044',
        name: 'Siddharth Nair',
        classLevel: 'B.Sc Semester 4',
        stream: 'Computer Science (AI & ML)',
        guardian: 'K. Nair',
        phone: '+91 98450 44556',
        attendance: '97.2%',
        dues: '₹0 (Settled)',
        status: 'ACTIVE'
      },
      {
        id: 'VNI-2026-1218',
        name: 'Meera Deshmukh',
        classLevel: 'B.Com Semester 6',
        stream: 'Corporate Accounting',
        guardian: 'Anand Deshmukh',
        phone: '+91 99800 33445',
        attendance: '94.8%',
        dues: '₹18,000 Due',
        status: 'ACTIVE'
      },
      {
        id: 'VNI-2026-1590',
        name: 'Tanmay V. Joshi',
        classLevel: 'MCA Semester 2',
        stream: 'Cloud Computing & Cyber Security',
        guardian: 'Vivek Joshi',
        phone: '+91 97420 11223',
        attendance: '96.0%',
        dues: '₹22,500 Due',
        status: 'ACTIVE'
      }
    ]
  }
};

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'school' | 'pu' | 'degree'>('school');
  const [activeInstitutionKey, setActiveInstitutionKey] = useState<string>('our_school');
  const [activePortalRole, setActivePortalRole] = useState<'principal' | 'accountant' | 'teacher' | 'parent'>('principal');
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  const currentInst = MOCK_INSTITUTIONS[activeInstitutionKey] || MOCK_INSTITUTIONS.our_school;

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 lg:pt-20 pb-16 bg-gradient-to-b from-blue-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-100/80 text-blue-800 border border-blue-300 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Rated #1 Commercial Education ERP SaaS Platform
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-950 tracking-tight leading-[1.1]">
              One Common ERP.{' '}
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Thousands of Institutions.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Complete white-label multi-tenant SaaS for Schools, PU Colleges, and Degree Colleges. Cloud hosting + true offline synchronization + Indian DPDP 2023 compliance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group"
              >
                Start 30-Day Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/demo"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                Launch Live Interactive Demo
              </Link>
            </div>

            {/* Trust Proof Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Card Required for Trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>PostgreSQL RLS Multi-Tenant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-amber-600" />
                <span>True Offline Synchronisation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>White-Label for Every School</span>
              </div>
            </div>
          </div>

          {/* Interactive Live ERP Dashboard Preview Card */}
          <div className="mt-14 max-w-6xl mx-auto">
            {/* Multi-Tenant Campus Showcase Switcher Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Switch Multi-Tenant Architecture:
                </span>
                <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
                  {[
                    { key: 'our_school', label: 'OUR SCHOOL (Live Demo)', icon: School },
                    { key: 'apex_pu', label: 'Apex PU College (PU Board)', icon: Building },
                    { key: 'vidya_degree', label: 'Vidya Niketan University (NEP)', icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeInstitutionKey === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveInstitutionKey(item.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white text-blue-700 shadow-sm border border-slate-200/90 font-black'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold">Kernel PostgreSQL RLS Isolation</span>
              </div>
            </div>

            <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden">
              {/* Modern macOS Browser Frame Header */}
              <div className="bg-slate-100/90 px-6 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20"></div>
                  <span className="ml-3 text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 shadow-xs">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{currentInst.url}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${currentInst.badgeColor}`}>
                    {currentInst.badge}
                  </span>
                  <Link
                    to="/demo"
                    className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Launch Live Interactive Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Role Switcher Toolbar inside the Preview */}
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Inspect Role Workspace:</span>
                  {[
                    { id: 'principal', label: '👑 Principal & Admin' },
                    { id: 'accountant', label: '💳 Fee & Accounts Ledger' },
                    { id: 'teacher', label: '📝 Faculty & Marks Entry' },
                    { id: 'parent', label: '👨‍👩‍👧 Parent Portal' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setActivePortalRole(role.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activePortalRole === role.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-medium hidden md:inline">
                  {currentInst.levelBadge}
                </span>
              </div>

              {/* Dynamic Preview Viewport */}
              <div className="p-6 lg:p-8 bg-slate-50/50 space-y-6">
                {/* Institution Identity Banner */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                        currentInst.themeColor === 'emerald'
                          ? 'bg-emerald-600'
                          : currentInst.themeColor === 'blue'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                      }`}
                    >
                      {currentInst.initial}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{currentInst.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{currentInst.affiliation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-extrabold">
                      {currentInst.levelBadge}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      All Modules Operational
                    </span>
                  </div>
                </div>

                {/* 1. Principal & Leadership View */}
                {activePortalRole === 'principal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Enrolled Directory</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{currentInst.studentsCount}</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">{currentInst.studentsSub}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Today's Attendance</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">{currentInst.attendanceRate}</p>
                        <p className="text-xs text-slate-400 mt-1">{currentInst.attendanceSub}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Collections (Today)</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{currentInst.feeCollection}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">{currentInst.feeSub}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pending Approvals</p>
                        <p className="text-2xl font-black text-amber-600 mt-1">{currentInst.pendingApprovals}</p>
                        <p className="text-xs text-slate-400 mt-1">{currentInst.pendingSub}</p>
                      </div>
                    </div>

                    {/* Live Enrolled Students Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Enrolled Student Roster • Active RLS Context
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to="/demo"
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Enrol Student in Demo</span>
                          </Link>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3">Admission #</th>
                              <th className="px-5 py-3">Student Name</th>
                              <th className="px-5 py-3">Class / Stream</th>
                              <th className="px-5 py-3">Guardian Contact</th>
                              <th className="px-5 py-3">Attendance</th>
                              <th className="px-5 py-3">Fee Status</th>
                              <th className="px-5 py-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentInst.studentsList.map((st) => (
                              <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-5 py-3 font-mono font-bold text-blue-700">{st.id}</td>
                                <td className="px-5 py-3 font-bold text-slate-900">{st.name}</td>
                                <td className="px-5 py-3">{st.classLevel} • {st.stream}</td>
                                <td className="px-5 py-3">{st.guardian} ({st.phone})</td>
                                <td className="px-5 py-3 font-bold text-emerald-600">{st.attendance}</td>
                                <td className="px-5 py-3 font-mono font-semibold text-slate-700">{st.dues}</td>
                                <td className="px-5 py-3 text-right">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                    {st.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Accountant / Fee Daybook View */}
                {activePortalRole === 'accountant' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fee Invoices Billed</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">₹75,000</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Tuition, Science Lab & Activity</p>
                      </div>
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Collections Realized</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">₹37,500</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">Razorpay, UPI & Front Counter</p>
                      </div>
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ledger Reconciliation</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">100% Settled</p>
                        <p className="text-xs text-slate-400 mt-1">Double-Entry Audit Compliant</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Fee Invoices & Statements Breakdown</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Automated multi-head allocation and printed receipt numbering</p>
                        </div>
                        <Link
                          to="/demo?role=ACCOUNTANT"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Open Fee Daybook in Demo</span>
                        </Link>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-mono font-bold text-blue-700">INV-2026-0091</span>
                            <span className="font-bold text-slate-900 ml-2">Aarav Sharma (Class 10-A)</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Tuition & Computer Science Fee • Term 2</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900">₹20,000 Total</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                              Paid • Receipt #RCP-1001
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-mono font-bold text-blue-700">INV-2026-0092</span>
                            <span className="font-bold text-slate-900 ml-2">Ananya Hegde (I PUC PCMB)</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Pre-University Science & Physics Lab Practical</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-amber-700">₹12,500 Balance Due</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                              Partial (₹12,500 Paid)
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-mono font-bold text-blue-700">INV-2026-0093</span>
                            <span className="font-bold text-slate-900 ml-2">Rahul Kumar (II PUC PCMB)</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Senior Science Tuition & Practical Board Assessment</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-red-700">₹25,000 Balance Due</span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px]">
                              Partial (₹20,000 Paid)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Teacher / Faculty View */}
                {activePortalRole === 'teacher' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">
                            Faculty Marks Register • Mid-Term Theory & Practical Assessment
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Course: Physics & Science Laboratory • Max Marks: 100 (70 Theory + 30 Practical)
                          </p>
                        </div>
                        <Link
                          to="/demo?role=TEACHER"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Open Marks Register in Demo</span>
                        </Link>
                      </div>

                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">Roll #</th>
                              <th className="px-4 py-3">Student Name</th>
                              <th className="px-4 py-3">Theory (Max: 70)</th>
                              <th className="px-4 py-3">Practical (Max: 30)</th>
                              <th className="px-4 py-3">Total / 100</th>
                              <th className="px-4 py-3">Grade</th>
                              <th className="px-4 py-3 text-right">Approval Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono font-bold">101</td>
                              <td className="px-4 py-3 font-bold text-slate-900">Aarav Sharma</td>
                              <td className="px-4 py-3 font-mono">68 / 70</td>
                              <td className="px-4 py-3 font-mono">26 / 30</td>
                              <td className="px-4 py-3 font-mono font-black text-emerald-700">94 / 100</td>
                              <td className="px-4 py-3 font-extrabold text-emerald-700">A+ (Outstanding)</td>
                              <td className="px-4 py-3 text-right">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                  Approved
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono font-bold">102</td>
                              <td className="px-4 py-3 font-bold text-slate-900">Ananya Hegde</td>
                              <td className="px-4 py-3 font-mono">60 / 70</td>
                              <td className="px-4 py-3 font-mono">28 / 30</td>
                              <td className="px-4 py-3 font-mono font-black text-emerald-700">88 / 100</td>
                              <td className="px-4 py-3 font-extrabold text-emerald-700">A (Distinction)</td>
                              <td className="px-4 py-3 text-right">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                  Approved
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono font-bold">103</td>
                              <td className="px-4 py-3 font-bold text-slate-900">Rahul Kumar</td>
                              <td className="px-4 py-3 font-mono">65 / 70</td>
                              <td className="px-4 py-3 font-mono">27 / 30</td>
                              <td className="px-4 py-3 font-mono font-black text-emerald-700">92 / 100</td>
                              <td className="px-4 py-3 font-extrabold text-emerald-700">A+ (Outstanding)</td>
                              <td className="px-4 py-3 text-right">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                  Approved
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Parent Self-Service Portal View */}
                {activePortalRole === 'parent' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">
                            Parent Self-Service Portal • Student: Aarav Sharma (Class 10-A)
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Authenticated Guardian: Rajesh Sharma • Admission #: OUR-2026-0101
                          </p>
                        </div>
                        <Link
                          to="/demo?role=PARENT"
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Test Parent Portal in Demo</span>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs text-slate-500 font-bold uppercase">Attendance Record</p>
                          <p className="text-xl font-black text-emerald-600 mt-1">96.5% Present</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Eligible for Board Exams</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs text-slate-500 font-bold uppercase">Term 2 Fee Status</p>
                          <p className="text-xl font-black text-emerald-600 mt-1">₹0.00 Dues</p>
                          <p className="text-[11px] text-blue-600 font-bold mt-0.5">Receipt #RCP-1001 Settled</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs text-slate-500 font-bold uppercase">Examination Hall Ticket</p>
                          <p className="text-xl font-black text-blue-600 mt-1">Issued & Verified</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Room 3 • Desk #14</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs text-slate-500 font-bold uppercase">Latest Assessment</p>
                          <p className="text-xl font-black text-emerald-600 mt-1">94% (Grade A+)</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Class Rank #1 in Science</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Solutions for Schools, PU Colleges & Degree Colleges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950">
            Engineered for Every Tier of Indian Education
          </h2>
          <p className="text-gray-600 text-base">
            Never force university semester rules into a primary school, or force simple classes onto a degree college. EduOmni adapts seamlessly.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 mb-10">
          {[
            { id: 'school', label: 'Schools (K-10 / 12)', icon: School },
            { id: 'pu', label: 'PU Colleges (I & II PUC)', icon: Building },
            { id: 'degree', label: 'Degree Colleges & Universities', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl text-sm font-extrabold flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4 lg:col-span-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {activeTab === 'school' ? 'Primary & Secondary' : activeTab === 'pu' ? 'Karnataka Pre-University' : 'Higher Education & NEP 2020'}
            </span>
            <h3 className="text-2xl font-black text-gray-900">
              {activeTab === 'school' && 'Classes, Sections & CBSE/ICSE/State Boards'}
              {activeTab === 'pu' && 'PCMB, PCMC, Commerce & Arts Streams'}
              {activeTab === 'degree' && 'Programmes, Semesters, Credits & Grading'}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {activeTab === 'school' &&
                'Support for continuous comprehensive evaluation (CCE), class-wise section allocation, timetable conflict avoidance, and parent daily updates.'}
              {activeTab === 'pu' &&
                'Tailored for Karnataka PU Board and senior secondary institutions. Split theory and lab practical marks, separate batch attendance, and KCET/NEET exam prep tracking.'}
              {activeTab === 'degree' &&
                'Multi-department governance, autonomous or university affiliated credit systems (NEET/UGC), semester grade point average (SGPA/CGPA), supplementary examinations, and revaluation logs.'}
            </p>
            <Link
              to="/features"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Explore Academic Hierarchy &rarr;
            </Link>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-2">Automated Admissions & Invoicing</h4>
              <p className="text-xs text-gray-600">Online enquiry to approved enrolment with automated student ID and fee structure generation.</p>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-2">Biometric & WhatsApp Push</h4>
              <p className="text-xs text-gray-600">Sync with hardware biometric devices and trigger automated WhatsApp attendance alerts to parents.</p>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-2">Immutable Examination Locking</h4>
              <p className="text-xs text-gray-600">Teacher draft entry, verification approval, published result locking, and PDF report cards.</p>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-2">Multi-Campus Governance</h4>
              <p className="text-xs text-gray-600">Manage 1 to 50 branch campuses with centralized group accounting and comparative analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. True Offline Operation Spotlight */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <WifiOff className="w-4 h-4 text-amber-400" />
              Zero Internet Downtime Guaranteed
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              True Offline-First Architecture. Works When the Internet Fails.
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Schools often face unstable broadband during morning roll calls or examination entry. EduOmni ERP stores records locally in IndexedDB (Web PWA) and SQLite (Android App).
            </p>
            <ul className="space-y-3 text-sm text-gray-200">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Mark daily attendance offline; auto-syncs when reconnected.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Enter draft examination marks without fear of network loss.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Cryptographic idempotency keys prevent duplicate records.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 text-xs font-mono text-gray-400">
              <span>SYNC_ENGINE_STATUS: MONITORING</span>
              <span className="text-emerald-400 font-bold">QUEUE_HEALTH_OK</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-gray-300">OP_9128: attendance.mark (Sec 10-A)</span>
                <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">SYNCED</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-gray-300">OP_9129: marks.draft (Physics Unit 1)</span>
                <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">SYNCED</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-gray-300">OP_9130: admission.draft (APP-2026-902)</span>
                <span className="text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">LOCAL QUEUE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Commercial Subscription Plans Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Transparent SaaS Subscriptions
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-950">
            Honest Plans for Every Institution Scale
          </h2>
          <p className="text-gray-600 text-base">
            Start small with our Starter plan and unlock advanced WhatsApp, Biometric, and AI reports as your campus grows.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
              className="w-14 h-8 bg-blue-600 rounded-full p-1 transition-colors relative"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>
              Annual Billing <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">Save 17%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Small Institutes</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">Tier 1</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Starter Plan</h3>
              <p className="text-xs text-gray-500 mt-1">Up to 300 students • 1 Campus</p>
              <div className="my-6">
                <span className="text-4xl font-black text-gray-900">
                  {billingCycle === 'annual' ? '₹9,999' : '₹999'}
                </span>
                <span className="text-xs text-gray-500"> / {billingCycle === 'annual' ? 'year' : 'month'}</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Student Information System (SIS)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Basic Fee Invoicing & Receipts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Daily Attendance Marking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Examinations & Marks Entry</li>
                <li className="flex items-center gap-2 text-gray-400"><Lock className="w-3.5 h-3.5" /> Parent / Student App Access</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 block text-center py-3 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              Choose Starter
            </Link>
          </div>

          {/* Standard Plan (Featured) */}
          <div className="bg-white rounded-3xl border-2 border-blue-600 p-8 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
              Most Popular Choice
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Growing Schools</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Tier 2</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Standard Plan</h3>
              <p className="text-xs text-gray-500 mt-1">Up to 750 students • 1 Campus</p>
              <div className="my-6">
                <span className="text-4xl font-black text-gray-900">
                  {billingCycle === 'annual' ? '₹19,999' : '₹1,999'}
                </span>
                <span className="text-xs text-gray-500"> / {billingCycle === 'annual' ? 'year' : 'month'}</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-700">
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Everything in Starter</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Dedicated Parent & Student Portals</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> True Offline PWA Synchronisation</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> White-Label Brand Logo & Color Themes</li>
                <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Automated SMS Reminders</li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 block text-center py-3 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-colors"
            >
              Start 30-Day Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Large Colleges & Groups</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-900 text-purple-200">Tier 5</span>
              </div>
              <h3 className="text-2xl font-black text-white">Enterprise Suite</h3>
              <p className="text-xs text-gray-400 mt-1">Unlimited students • Multi-Campus</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white">
                  {billingCycle === 'annual' ? '₹99,999' : '₹9,999'}
                </span>
                <span className="text-xs text-gray-400"> / {billingCycle === 'annual' ? 'year' : 'month'}</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> AI Performance Risk Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Official WhatsApp Business Automation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Hardware Biometric Machine Sync</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Optional Dedicated Isolated Database</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> Custom Subdomain & Custom CNAME</li>
              </ul>
            </div>
            <Link
              to="/contact"
              className="mt-8 block text-center py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              Contact Enterprise Sales
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/pricing/compare"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700"
          >
            View Complete 28-Feature Comparison Table &rarr;
          </Link>
        </div>
      </section>

      {/* 5. Interactive Demo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-14 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-blue-100">
              Zero Login Required
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Try the Interactive Sandbox Demo
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Experience the real interface: add students, generate fee invoices, mark attendance, enter marks, and generate report cards right inside your browser.
            </p>
          </div>
          <Link
            to="/demo"
            className="px-8 py-4 rounded-2xl text-base font-extrabold bg-white text-indigo-900 hover:bg-blue-50 shadow-lg hover:scale-105 transition-all flex items-center gap-2 shrink-0"
          >
            <Play className="w-5 h-5 fill-indigo-900" />
            Launch Interactive Demo Now
          </Link>
        </div>
      </section>
    </div>
  );
};

