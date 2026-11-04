import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, X, ArrowLeft, Search, Filter, ShieldCheck, Sparkles, 
  Building2, Server, Lock, Layers, Cpu, Award, CreditCard, ChevronRight
} from 'lucide-react';

interface ComparisonRow {
  module: string;
  category: 'CORE' | 'FINANCE' | 'ACADEMICS' | 'PORTALS' | 'OPERATIONS' | 'SECURITY';
  feature: string;
  description?: string;
  trial: boolean;
  starter: boolean;
  std: boolean;
  pro: boolean;
  prem: boolean;
  ent: boolean;
  tag?: string;
}

export const SubscriptionComparisonPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showTechDetails, setShowTechDetails] = useState(false);

  const plans = [
    { code: 'TRIAL', name: 'Free Trial', badge: '14 Days', price: '₹0', students: '50 Students', highlight: false },
    { code: 'STARTER', name: 'Starter', badge: 'Tier 1', price: '₹999/mo', students: '300 Students', highlight: false },
    { code: 'STANDARD', name: 'Standard', badge: 'Most Popular', price: '₹1,999/mo', students: '750 Students', highlight: true, popular: true },
    { code: 'PRO', name: 'Professional', badge: 'Tier 3', price: '₹3,499/mo', students: '1,500 Students', highlight: false },
    { code: 'PREMIUM', name: 'Premium Group', badge: 'Multi-Campus', price: '₹5,999/mo', students: '5,000 Students', highlight: false },
    { code: 'ENTERPRISE', name: 'Enterprise', badge: 'Dedicated SLA', price: '₹9,999/mo', students: 'Unlimited', highlight: true, enterprise: true }
  ];

  const comparisonData: ComparisonRow[] = [
    // Core SIS
    { module: 'Core Student Info', category: 'CORE', feature: 'Student Information System (SIS)', description: 'Master demographics, enrollment tracking, parent details & history', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Admissions', category: 'CORE', feature: 'Online Enquiries & Applications', description: 'Public application forms, document upload & applicant approval queue', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Attendance', category: 'CORE', feature: 'Daily & Period-wise Student Roll-Call', description: 'Classroom attendance register with instant absent SMS trigger', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Attendance', category: 'CORE', feature: 'Biometric Machine Hardware Sync', description: 'Real-time LAN/TCP biometric punch capture with deduplication', trial: false, starter: false, std: false, pro: false, prem: true, ent: true, tag: 'Hardware API' },
    
    // Finance & Fees
    { module: 'Fees & Finance', category: 'FINANCE', feature: 'Multi-Head Fee Structures & Counter Receipts', description: 'Tuition, Lab, Transport, Library heads with thermal & A4 printouts', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Fees & Finance', category: 'FINANCE', feature: 'Consolidated Student Financial Ledger', description: 'Annual fee trajectory, head-wise breakdown & audit trail', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Fees & Finance', category: 'FINANCE', feature: 'Online Payment Gateway (Razorpay/UPI)', description: 'Instant QR code payments, automated ledger settlement & webhooks', trial: false, starter: false, std: false, pro: true, prem: true, ent: true, tag: 'Automated Dues' },
    { module: 'Fees & Finance', category: 'FINANCE', feature: 'Chairman Ledger Snapshot & Freeze Control', description: 'Tamper-evident frozen balance audit reports with digital authorization', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    
    // Academics & Exams
    { module: 'Examinations', category: 'ACADEMICS', feature: 'Multi-Exam Scheduling & Marks Entry', description: 'Custom terms, tests, practicals and internal assessment registers', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Examinations', category: 'ACADEMICS', feature: 'Tamper-Evident Hall Tickets with Encrypted QR', description: 'Hall ticket issuance with student photo, room, seat & verification QR', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Examinations', category: 'ACADEMICS', feature: 'University Credits, SGPA & PU Streams', description: 'Credit point weighing, backlogs tracking & state board grade calculation', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Examinations', category: 'ACADEMICS', feature: 'NEET & JEE Foundation Analytics Trajectory', description: 'Competitive mock tests, chapter analytics & percentile tracking', trial: false, starter: false, std: false, pro: false, prem: true, ent: true, tag: 'Competitive AI' },

    // Portals & Mobile
    { module: 'Portals & Mobile', category: 'PORTALS', feature: 'Parent Web & Mobile PWA Portal', description: 'Real-time marks, fee dues, attendance percentage & child tracking', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'Portals & Mobile', category: 'PORTALS', feature: 'Student Self-Service Portal', description: 'Timetables, study materials, exam dates & personal results', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'Portals & Mobile', category: 'PORTALS', feature: 'Offline PWA & Local Queue Sync', description: 'Zero-downtime offline mark/attendance caching with auto background sync', trial: false, starter: false, std: true, pro: true, prem: true, ent: true, tag: 'IndexedDB Sync' },
    { module: 'Portals & Mobile', category: 'PORTALS', feature: 'Custom White-Label Android App', description: 'Dedicated Google Play Store app with institution logo & package name', trial: false, starter: false, std: false, pro: false, prem: false, ent: true, tag: 'Custom APK' },

    // Communication & Operations
    { module: 'Communication', category: 'OPERATIONS', feature: 'Automated SMS Alerts & Dues Notice', description: 'DLT-registered template SMS for attendance, fee reminders & notices', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'Communication', category: 'OPERATIONS', feature: 'Official Meta WhatsApp Business API Push', description: 'Green badge direct interactive WhatsApp messaging with PDF attachments', trial: false, starter: false, std: false, pro: false, prem: true, ent: true, tag: 'WhatsApp Cloud' },
    { module: 'Operations', category: 'OPERATIONS', feature: 'Staff HR, Leaves & Salary Payroll', description: 'Teacher biometric attendance, leave credits, pay slips & salary slips', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Operations', category: 'OPERATIONS', feature: 'Library Barcode Catalog & Book Returns', description: 'ISBN scanning, fine collection & student circulation registers', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Operations', category: 'OPERATIONS', feature: 'Bus Transport Fleet & Route Stops', description: 'Vehicle allocation, driver tracking & seat management', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Operations', category: 'OPERATIONS', feature: 'Hostel Rooms & Bed Allocations', description: 'Block, room, warden management & mess fee billing', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },

    // Enterprise Security & Multi-Campus
    { module: 'Multi-Campus', category: 'SECURITY', feature: 'Centralized Multi-Branch Governance', description: 'Single dashboard controlling multiple school branches with consolidated reports', trial: false, starter: false, std: false, pro: false, prem: true, ent: true, tag: 'Multi-Branch' },
    { module: 'AI & Analytics', category: 'SECURITY', feature: 'AI Academic Risk & Performance Forecaster', description: 'Early dropout detection, learning deficit prediction & subject diagnostics', trial: false, starter: false, std: false, pro: false, prem: false, ent: true, tag: 'Predictive ML' },
    { module: 'Infrastructure', category: 'SECURITY', feature: 'Dedicated Physically Isolated Database', description: 'Separate PostgreSQL instance with custom VPC peering & dedicated backup vault', trial: false, starter: false, std: false, pro: false, prem: false, ent: true, tag: 'Dedicated DB' },
    { module: 'Infrastructure', category: 'SECURITY', feature: 'Enterprise Row-Level Security (RLS) & Audit', description: 'Kernel-level PostgreSQL RLS tenant isolation with immutable forensic logs', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
  ];

  const categories = [
    { id: 'ALL', label: 'All Capabilities', count: comparisonData.length },
    { id: 'CORE', label: 'Core SIS & Attendance', count: comparisonData.filter(d => d.category === 'CORE').length },
    { id: 'FINANCE', label: 'Finance & Fees', count: comparisonData.filter(d => d.category === 'FINANCE').length },
    { id: 'ACADEMICS', label: 'Academics & Exams', count: comparisonData.filter(d => d.category === 'ACADEMICS').length },
    { id: 'PORTALS', label: 'Portals & Mobile', count: comparisonData.filter(d => d.category === 'PORTALS').length },
    { id: 'OPERATIONS', label: 'Operations & Logistics', count: comparisonData.filter(d => d.category === 'OPERATIONS').length },
    { id: 'SECURITY', label: 'Security & Enterprise', count: comparisonData.filter(d => d.category === 'SECURITY').length },
  ];

  const filteredData = useMemo(() => {
    return comparisonData.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchQuery = !searchQuery || 
        item.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [comparisonData, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Pricing Overview
            </Link>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                Architectural Matrix
              </span>
              <span className="text-xs text-slate-500 font-medium">
                EducationOS Kernel v2.4 Entitlements
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Complete Feature Entitlement Matrix
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              Transparent tier comparison across SIS, Examinations, Financial Ledgers, and Multi-Campus Governance. 
              Enforced server-side via our high-speed <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">EntitlementService</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/demo"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Launch Live Demo
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              Start Free Trial &rarr;
            </Link>
          </div>
        </div>

        {/* Plan Header Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {plans.map((p) => (
            <div
              key={p.code}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                p.popular
                  ? 'bg-indigo-50/70 border-indigo-300 shadow-sm relative ring-2 ring-indigo-500/20'
                  : p.enterprise
                  ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {p.popular && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full block mx-auto w-fit mb-1.5">
                  Most Popular
                </span>
              )}
              {p.enterprise && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-teal-500 text-slate-950 px-2 py-0.5 rounded-full block mx-auto w-fit mb-1.5">
                  High Scale
                </span>
              )}
              <h3 className={`font-black text-sm ${p.enterprise ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
              <p className={`text-base font-black mt-1 ${p.popular ? 'text-indigo-600' : p.enterprise ? 'text-teal-300' : 'text-slate-800'}`}>
                {p.price}
              </p>
              <span className={`text-[11px] block mt-0.5 font-medium ${p.enterprise ? 'text-slate-400' : 'text-slate-500'}`}>
                {p.students}
              </span>
            </div>
          ))}
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capability (e.g. Biometric, WhatsApp, SGPA, RLS, QR)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">{filteredData.length}</span> capabilities shown
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === c.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                  <th className="p-4 min-w-[280px]">Module / Capability</th>
                  <th className="p-4 text-center min-w-[90px]">Trial</th>
                  <th className="p-4 text-center min-w-[90px]">Starter</th>
                  <th className="p-4 text-center min-w-[100px] bg-indigo-900/90 text-indigo-200 border-x border-indigo-800">
                    Standard
                  </th>
                  <th className="p-4 text-center min-w-[90px]">Pro</th>
                  <th className="p-4 text-center min-w-[95px]">Premium</th>
                  <th className="p-4 text-center min-w-[110px] bg-slate-950 text-teal-300 border-l border-slate-800">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Capability Name & Description */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          {row.module}
                        </span>
                        {row.tag && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {row.tag}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5 group-hover:text-indigo-600 transition-colors">
                        {row.feature}
                      </div>
                      {row.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {row.description}
                        </p>
                      )}
                    </td>

                    {/* Trial */}
                    <td className="p-4 text-center">
                      {row.trial ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono text-sm">—</span>
                      )}
                    </td>

                    {/* Starter */}
                    <td className="p-4 text-center">
                      {row.starter ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono text-sm">—</span>
                      )}
                    </td>

                    {/* Standard (Popular Column Accent) */}
                    <td className="p-4 text-center bg-indigo-50/30 border-x border-indigo-100/60">
                      {row.std ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center mx-auto text-indigo-700 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono text-sm">—</span>
                      )}
                    </td>

                    {/* Pro */}
                    <td className="p-4 text-center">
                      {row.pro ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono text-sm">—</span>
                      )}
                    </td>

                    {/* Premium */}
                    <td className="p-4 text-center">
                      {row.prem ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono text-sm">—</span>
                      )}
                    </td>

                    {/* Enterprise */}
                    <td className="p-4 text-center bg-slate-900/5 border-l border-slate-200">
                      {row.ent ? (
                        <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-300 flex items-center justify-center mx-auto text-teal-700 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Architecture Callout */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">How EducationOS Enforces Feature Gating</h3>
                <p className="text-xs text-slate-400">Zero-trust, database-verified entitlement validation at every layer</p>
              </div>
            </div>
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
            >
              {showTechDetails ? 'Hide Technical Blueprint' : 'Inspect Server Architecture & API Blueprint'}
            </button>
          </div>

          {showTechDetails && (
            <div className="pt-4 border-t border-slate-800 space-y-4 text-xs text-slate-300 animate-in fade-in duration-200">
              <p>
                Unlike basic ERPs that hide menu buttons on the client side, EducationOS implements multi-tenant cryptographic gating:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-teal-400 font-bold block">1. FastAPI API Decorator</span>
                  <code>@router.post(...)</code>
                  <br />
                  <code>@require_entitlement("biometric_sync")</code>
                  <p className="text-[10px] text-slate-400 font-sans mt-1">Rejects unauthorized tenant requests with HTTP 403 Forbidden before DB hit.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-indigo-400 font-bold block">2. PostgreSQL Row-Level Security</span>
                  <code>app.current_tenant_id</code>
                  <br />
                  <code>TENANT_SCOPED_TABLES</code>
                  <p className="text-[10px] text-slate-400 font-sans mt-1">Enforced directly in the database engine kernel on every single query.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold block">3. Signed JWT Claims</span>
                  <code>sid: session_uuid</code>
                  <br />
                  <code>features: ["SIS", "FEES", ...]</code>
                  <p className="text-[10px] text-slate-400 font-sans mt-1">Instant revocation checks on active UserSessions on every request.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 text-white border border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black">Ready to deploy EducationOS in your institution?</h2>
            <p className="text-xs text-indigo-200">
              Set up your school, PU college, or degree campus in under 5 minutes with zero upfront setup fees.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/pricing"
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
            >
              Review Plan Pricing
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all"
            >
              Start 14-Day Free Trial
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
