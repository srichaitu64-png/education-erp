import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Key,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Server,
  DollarSign,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  useDemoStore,
  PlatformTenant,
  TechnicalSupportTicket,
  PlatformProcurementItem
} from '../../../store/demoStore';

export const PlatformSuperAdminView: React.FC = () => {
  const {
    platformTenants,
    supportTickets,
    procurementItems,
    provisionNewTenant,
    approveSupportAccess,
    revokeSupportAccess
  } = useDemoStore();

  const [activeSubTab, setActiveSubTab] = useState<'register' | 'provision' | 'consent_support' | 'procurement'>('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'SUSPENDED'>('ALL');

  // Tenant Provisioning Form State
  const [provName, setProvName] = useState('');
  const [provType, setProvType] = useState<PlatformTenant['type']>('COMPOSITE_GROUP');
  const [provState, setProvState] = useState('Karnataka');
  const [provCity, setProvCity] = useState('Bengaluru');
  const [provPlan, setProvPlan] = useState<PlatformTenant['plan']>('ENTERPRISE');
  const [provCapacity, setProvCapacity] = useState(2500);
  const [provisionSuccess, setProvisionSuccess] = useState<{ tenant: PlatformTenant; activationLink: string } | null>(null);

  // Filtered Tenants
  const filteredTenants = platformTenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName) return;

    const res = provisionNewTenant({
      name: provName,
      type: provType,
      state: provState,
      city: provCity,
      plan: provPlan,
      capacity: provCapacity
    });

    setProvisionSuccess(res);
    setProvName('');
  };

  const totalMRR = platformTenants.reduce((sum, t) => sum + t.mrrAmount, 0);
  const totalStudents = platformTenants.reduce((sum, t) => sum + t.studentCount, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            Central SaaS Operator Authority • 1,000+ Tenancies Managed
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform SaaS Command Centre</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global Institution Register • Zero-Trust Tenant Provisioning • Consent-Based Technical Support Access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('provision')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Provision New Institution
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Institutions</p>
          <p className="text-2xl font-black text-slate-900 mt-1">1,248</p>
          <p className="text-[10px] text-purple-400 font-medium mt-0.5">Across 18 States in India</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tenants</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">1,180</p>
          <p className="text-[10px] text-emerald-300 font-medium mt-0.5">42 Trials • 26 Suspended</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue (MRR)</p>
          <p className="text-2xl font-black text-blue-400 mt-1">₹48.5L</p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">ARR: ₹5.82 Crores</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
          <p className="text-2xl font-black text-slate-900 mt-1">4.82 Lakhs</p>
          <p className="text-[10px] text-slate-600 font-medium mt-0.5">24,500+ Faculty members</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Sessions</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{supportTickets.length}</p>
          <p className="text-[10px] text-amber-300 font-medium mt-0.5">Consent-gated audit</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Health</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">99.98%</p>
          <p className="text-[10px] text-slate-600 font-medium mt-0.5">Zero cross-tenant leaks</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'register', label: 'Institution Register (1,000+ Tenancies)', icon: Building2 },
          { id: 'provision', label: 'Tenant Account Provisioning Wizard', icon: Plus },
          { id: 'consent_support', label: 'Consent-Based Technical Support Access', icon: Lock },
          { id: 'procurement', label: 'Vendor Procurement & Infrastructure Checklist', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: INSTITUTION REGISTER (1,000+ TENANCIES) */}
      {/* ===================================================================== */}
      {activeSubTab === 'register' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mr-1">Status:</span>
              {(['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    statusFilter === st ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tenant ID, school name, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Tenant Identity</th>
                    <th className="p-4">Type & Location</th>
                    <th className="p-4">SaaS Plan</th>
                    <th className="p-4 text-center">Student Capacity</th>
                    <th className="p-4 text-right">MRR (₹)</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Consent Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredTenants.map((tn) => (
                    <tr key={tn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center font-mono font-bold text-purple-700 text-[10px]">
                            {tn.id.split('-')[2]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{tn.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              ID: <span className="text-purple-700 font-bold">{tn.id}</span> • {tn.chairmanEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {tn.type}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{tn.city}, {tn.state} ({tn.activeCampuses} Campuses)</p>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                          tn.plan === 'ENTERPRISE'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : tn.plan === 'PRO'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {tn.plan}
                        </span>
                      </td>

                      <td className="p-4 text-center font-mono text-slate-800">
                        {tn.studentCount.toLocaleString('en-IN')} students
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-emerald-700">
                        ₹{tn.mrrAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tn.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : tn.status === 'TRIAL'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {tn.status}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {tn.consentSupportActive ? (
                          <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1">
                            <Unlock className="w-3 h-3 text-emerald-600" /> ACTIVE SESSION
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3 text-slate-500" /> LOCKED (NO ACCESS)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: TENANT ACCOUNT PROVISIONING WIZARD */}
      {/* ===================================================================== */}
      {activeSubTab === 'provision' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                1-Click Institution Tenant Provisioning
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provisions isolated database schemas, default roles, academic terms, and generates an expiring single-use Chairman invitation link.
              </p>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase">Institution Legal Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Public Academy & Pre-University College"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase">Institution Type:</label>
                  <select
                    value={provType}
                    onChange={(e) => setProvType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="COMPOSITE_GROUP">Composite School & College</option>
                    <option value="SCHOOL">K-12 School</option>
                    <option value="PU_COLLEGE">PU College (I & II PUC)</option>
                    <option value="DEGREE_COLLEGE">Degree Autonomous College</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase">Subscription Tier:</label>
                  <select
                    value={provPlan}
                    onChange={(e) => setProvPlan(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="ENTERPRISE">Enterprise (All Features & Channels)</option>
                    <option value="PRO">Pro (Standard + Labs)</option>
                    <option value="STANDARD">Standard (Academics + Fees)</option>
                    <option value="STARTER">Starter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase">State:</label>
                  <input
                    type="text"
                    required
                    value={provState}
                    onChange={(e) => setProvState(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase">City:</label>
                  <input
                    type="text"
                    required
                    value={provCity}
                    onChange={(e) => setProvCity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase">Initial Student Capacity Limit:</label>
                <input
                  type="number"
                  min="100"
                  value={provCapacity}
                  onChange={(e) => setProvCapacity(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" /> Provision Tenant & Generate Claim Link
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Provisioning Output & Security Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Zero plaintext password storage. Chairman completes initial password setup through a single-use token.
              </p>

              {provisionSuccess ? (
                <div className="mt-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-slate-800">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tenant Successfully Provisioned!
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p>
                      <strong>Tenant ID:</strong> <span className="font-mono text-purple-700 font-bold">{provisionSuccess.tenant.id}</span>
                    </p>
                    <p>
                      <strong>Legal Name:</strong> {provisionSuccess.tenant.name}
                    </p>
                    <p>
                      <strong>Plan Assigned:</strong> <span className="text-emerald-700 font-bold">{provisionSuccess.tenant.plan}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Single-Use Chairman Activation URL:</span>
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-[10px] text-blue-700 break-all select-all font-bold">
                      {provisionSuccess.activationLink}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center text-slate-500 text-xs py-10">
                  <Server className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  Fill out the provisioning form on the left to initialize a tenant schema and generate credentials.
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 space-y-1">
              <p className="font-bold">🔐 Platform Lockout & Isolation Policy:</p>
              <p className="text-purple-800">Platform Super Admin has zero access to individual student grades, fee ledgers, or attendance rolls without explicit consent from the Chairman.</p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: CONSENT-BASED TECHNICAL SUPPORT ACCESS */}
      {/* ===================================================================== */}
      {activeSubTab === 'consent_support' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              Consent-Based Technical Support Access Manager
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Demonstrating strict enterprise data governance: Platform support staff <strong>cannot</strong> enter a school's database without an explicit, time-bounded approval grant from the Chairman.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {supportTickets.map((tkt) => {
              const isApproved = tkt.status === 'APPROVED_ACTIVE';

              return (
                <div key={tkt.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-purple-700">{tkt.id}</span>
                      <span className="font-bold text-slate-900 text-xs">{tkt.tenantName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {tkt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 pt-1">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Category</span>
                        <span className="text-slate-800 font-medium">{tkt.category}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Requested Scope</span>
                        <span className="text-blue-700 font-mono font-bold">{tkt.requestedScope}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Requested Duration</span>
                        <span className="text-slate-800 font-medium">{tkt.requestedDurationHours} Hours</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Expiry Status</span>
                        <span className="text-emerald-700 font-mono font-bold">{tkt.expiresAt || 'Pending Grant'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isApproved ? (
                      <button
                        onClick={() => {
                          const res = approveSupportAccess(tkt.id, 'Dr. Ramesh Kumar (Chairman)');
                          alert(res.message);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Chairman: Grant 4hr Consent
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          revokeSupportAccess(tkt.id);
                          alert(`Support session for ${tkt.id} immediately terminated.`);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" /> Revoke Access Immediately
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 4: VENDOR PROCUREMENT & INFRASTRUCTURE CHECKLIST */}
      {/* ===================================================================== */}
      {activeSubTab === 'procurement' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Platform Vendor Procurement & Infrastructure Checklist
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active vendor contracts and managed services powering EducationOS across AWS, Meta Cloud, and PostgreSQL RDS.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Procurement Item</th>
                  <th className="p-3.5">Vendor / Cloud Provider</th>
                  <th className="p-3.5 text-right">Monthly Cost (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Next Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {procurementItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-xs">{item.serviceCategory}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</p>
                    </td>

                    <td className="p-3.5 text-slate-800 font-semibold">
                      {item.vendor}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                      ₹{item.monthlyCost.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right text-slate-600 font-mono text-[11px]">
                      {item.renewalDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

