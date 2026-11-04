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
  Zap
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'school' | 'pu' | 'degree'>('school');
  const [activePortalRole, setActivePortalRole] = useState<'principal' | 'accountant' | 'teacher' | 'parent'>('principal');
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

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
          <div className="mt-14 relative max-w-6xl mx-auto">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-20 transform -rotate-1"></div>
            <div className="relative bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden">
              {/* Fake Browser Toolbar */}
              <div className="bg-gray-100/90 px-6 py-3.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-3 text-xs font-mono text-gray-500 bg-white px-3 py-1 rounded-md border border-gray-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> https://akshara.eduomni.in/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Instance</span>
                </div>
              </div>

              {/* Role Switcher Toolbar inside the Preview */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-wider">Preview Role:</span>
                  {[
                    { id: 'principal', label: 'Principal / Admin' },
                    { id: 'accountant', label: 'Accountant' },
                    { id: 'teacher', label: 'Faculty / Teacher' },
                    { id: 'parent', label: 'Parent Portal' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setActivePortalRole(role.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activePortalRole === role.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
                <Link
                  to="/demo"
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Open Sandbox Sandbox &rarr;
                </Link>
              </div>

              {/* Dynamic Preview Viewport */}
              <div className="p-6 lg:p-8 bg-slate-50/50">
                {activePortalRole === 'principal' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Akshara Global School & College</h3>
                        <p className="text-xs text-gray-500">Academic Year 2026–27 • CBSE & State Board • Main Campus</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold">
                        All Modules Operational
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Enrolled Students</p>
                        <p className="text-2xl font-black text-gray-950 mt-1">1,240</p>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">98.4% Retention</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Today's Attendance</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1">96.2%</p>
                        <p className="text-xs text-gray-400 mt-1">1,193 present • 47 absent</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Fee Collection (Today)</p>
                        <p className="text-2xl font-black text-gray-950 mt-1">₹3,45,000</p>
                        <p className="text-xs text-blue-600 font-semibold mt-1">UPI, Gateway & Cash</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Pending Approvals</p>
                        <p className="text-2xl font-black text-amber-600 mt-1">8</p>
                        <p className="text-xs text-gray-400 mt-1">Admissions & Leave</p>
                      </div>
                    </div>
                  </div>
                )}

                {activePortalRole === 'accountant' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Finance & Fee Collection Daybook</h3>
                      <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">Auto-Reconciled</span>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-xs text-emerald-800 font-semibold uppercase">Total Collected (Nov)</p>
                          <p className="text-xl font-black text-emerald-900 mt-0.5">₹42,80,000</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800 font-semibold uppercase">Pending Dues (Term 2)</p>
                          <p className="text-xl font-black text-amber-900 mt-0.5">₹6,15,000</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800 font-semibold uppercase">Razorpay Settlements</p>
                          <p className="text-xl font-black text-blue-900 mt-0.5">Instant Webhook Verified</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Every payment transaction is immutable and logged in the double-entry financial ledger.</p>
                    </div>
                  </div>
                )}

                {activePortalRole === 'teacher' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Faculty Workspace • Class 10-A Science</h3>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">Draft Marks Entry Active</span>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-800 mb-2">Mid-Term Physics Assessment (Max: 100)</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs">
                          <span className="font-bold text-gray-800">Aarav Sharma (Roll 101)</span>
                          <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">94/100 (Grade A+)</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs">
                          <span className="font-bold text-gray-800">Ananya Hegde (Roll 102)</span>
                          <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">88/100 (Grade A)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePortalRole === 'parent' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Parent Portal • Student: Aarav Sharma (Class 10-A)</h3>
                      <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">Verified Guardian</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Attendance Record</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">96.5% Present</p>
                        <p className="text-xs text-gray-400 mt-1">Eligible for Board Exams</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Term 2 Fee Status</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">₹0.00 Outstanding (Fully Settled)</p>
                        <p className="text-xs text-blue-600 mt-1 font-semibold">Download Receipt #REC-2026-9182</p>
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

