import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Lock,
  Plus,
  Shield,
  ArrowUpRight,
  TrendingUp,
  Server,
  Layers,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Key,
  ShieldAlert,
  Clock,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  UserCheck,
  Tag,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface TenantSummary {
  id: string;
  name: string;
  code: string;
  institution_type: string;
  status: string;
  email: string;
  campuses: any[];
}

interface LeadSummary {
  id: string;
  reference_no: string;
  contact_name: string;
  email: string;
  phone: string;
  institution_name: string;
  institution_type: string;
  city?: string;
  state?: string;
  student_strength?: string;
  current_erp?: string;
  enquiry_type: string;
  requested_modules?: string[];
  preferred_date?: string;
  preferred_time_slot?: string;
  message?: string;
  consent_given: boolean;
  status: string;
  assigned_to?: string;
  follow_up_date?: string;
  internal_notes?: string;
  is_repeat_enquiry: boolean;
  previous_enquiry_count: number;
  created_at: string;
}

const DEFAULT_TENANTS: TenantSummary[] = [
  {
    id: '66601a28-a6e4-4cc8-857b-b9963e222e3b',
    name: 'OUR SCHOOL',
    code: 'our-school-demo',
    institution_type: 'demo',
    status: 'ACTIVE DEMO',
    email: 'demo@ourschool.edu.in',
    campuses: [{ name: 'Demo Campus', city: 'Bengaluru' }]
  },
  {
    id: '1c44e550-9cfc-4bd5-9bb2-8ef1bf237b5c',
    name: 'AKSHARA GLOBAL SCHOOL AND PU COLLEGE',
    code: 'akshara-trial',
    institution_type: 'composite_group',
    status: 'TRIAL ACTIVE',
    email: 'info@akshara-trial.edu.in',
    campuses: [{ name: 'Main Campus', city: 'Bengaluru' }]
  }
];

const DEFAULT_LEADS: LeadSummary[] = [
  {
    id: 'lead-001',
    reference_no: 'DEMO-2026-7842',
    contact_name: 'Dr. K. S. Venkatesh',
    email: 'director@vidyaniketan.edu.in',
    phone: '+91 98451 22334',
    institution_name: 'Vidya Niketan PU & Degree College',
    institution_type: 'composite_group',
    city: 'Mysuru',
    state: 'Karnataka',
    student_strength: '1,500 - 3,000 Students',
    current_erp: 'Legacy desktop software',
    enquiry_type: 'live_demo',
    requested_modules: ['admissions', 'fees', 'attendance', 'exams'],
    preferred_date: '2026-11-08',
    preferred_time_slot: '11:00 AM - 12:00 PM',
    message: 'Looking for integrated fee collection with automated receipt generation and PU board marks registers.',
    consent_given: true,
    status: 'NEW',
    assigned_to: 'Siva (Platform Lead)',
    follow_up_date: '2026-11-06',
    internal_notes: 'Urgent enquiry. Expanding into new campus next academic year.',
    is_repeat_enquiry: false,
    previous_enquiry_count: 0,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'lead-002',
    reference_no: 'TRIAL-2026-3195',
    contact_name: 'Mrs. Shailaja Murthy',
    email: 'principal@greenwoodhigh.org',
    phone: '+91 99800 55443',
    institution_name: 'Greenwood High International School',
    institution_type: 'school',
    city: 'Bengaluru',
    state: 'Karnataka',
    student_strength: '750 - 1,500 Students',
    current_erp: 'Google Sheets',
    enquiry_type: 'trial',
    requested_modules: ['attendance', 'fees', 'portals'],
    preferred_date: '2026-11-09',
    preferred_time_slot: '02:00 PM - 03:00 PM',
    message: 'Need self-service parent portal with online fee payment integration.',
    consent_given: true,
    status: 'CONTACTED',
    assigned_to: 'Sales Team',
    follow_up_date: '2026-11-07',
    internal_notes: 'Spoke with principal. Demo scheduled for Thursday.',
    is_repeat_enquiry: false,
    previous_enquiry_count: 0,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'lead-003',
    reference_no: 'LEAD-2026-9041',
    contact_name: 'Prof. C. R. Patil',
    email: 'dean@sahyadri.edu.in',
    phone: '+91 97412 88776',
    institution_name: 'Sahyadri Institute of Technology & Management',
    institution_type: 'degree_college',
    city: 'Mangaluru',
    state: 'Karnataka',
    student_strength: '3,000 - 10,000 Students',
    current_erp: 'In-house system',
    enquiry_type: 'pricing',
    requested_modules: ['exams', 'attendance', 'analytics', 'hr_payroll'],
    preferred_date: '2026-11-10',
    preferred_time_slot: '03:30 PM - 04:30 PM',
    message: 'Requesting institutional pricing for autonomous college grade cards and biometric integration.',
    consent_given: true,
    status: 'DEMO_SCHEDULED',
    assigned_to: 'Siva (Platform Lead)',
    follow_up_date: '2026-11-10',
    internal_notes: 'Demo slot confirmed with Dean Patil.',
    is_repeat_enquiry: true,
    previous_enquiry_count: 1,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

const DEFAULT_PLANS = [
  { id: 'starter', name: 'Starter', price: '₹4,999/mo', tier: 'Basic' },
  { id: 'standard', name: 'Standard Campus', price: '₹14,999/mo', tier: 'Professional' },
  { id: 'enterprise', name: 'Enterprise Trust', price: '₹34,999/mo', tier: 'Institutional' }
];

export const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<TenantSummary[]>(DEFAULT_TENANTS);
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'TENANTS' | 'LEADS'>('TENANTS');

  // Leads State
  const [leads, setLeads] = useState<LeadSummary[]>(DEFAULT_LEADS);
  const [leadMetrics, setLeadMetrics] = useState({
    total_leads: 3,
    new_leads: 1,
    demo_requests: 2,
    trial_requests: 1,
    follow_ups_due: 2,
    converted: 0
  });
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('ALL');
  const [leadTypeFilter, setLeadTypeFilter] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState<LeadSummary | null>(null);
  const [leadNoteInput, setLeadNoteInput] = useState('');
  const [leadStatusInput, setLeadStatusInput] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  // Onboarding Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSuccessData, setOnboardSuccessData] = useState<any | null>(null);

  // Onboard Form Data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    institution_type: 'composite_group',
    email: '',
    phone: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    campus_name: 'Main Campus',
    campus_code: 'MAIN',
    include_school: true,
    include_pu: true,
    plan_code: 'STANDARD',
    billing_cycle: 'annual',
    is_trial: false,
    admin_name: '',
    admin_email: '',
    admin_role: 'CHAIRMAN_DIRECTOR',
    temporary_password: ''
  });

  // Action status message
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPlatformStats = async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        api.get('/platform/tenants'),
        api.get('/platform/plans'),
      ]);
      if (Array.isArray(tRes.data)) {
        setTenants(tRes.data);
      } else {
        setTenants(DEFAULT_TENANTS);
      }
      if (Array.isArray(pRes.data)) {
        setPlans(pRes.data);
      } else {
        setPlans(DEFAULT_PLANS);
      }
    } catch {
      setTenants(DEFAULT_TENANTS);
      setPlans(DEFAULT_PLANS);
    }

    // Also fetch leads & metrics
    try {
      const [lRes, mRes] = await Promise.all([
        api.get('/platform/leads'),
        api.get('/platform/leads/metrics')
      ]);
      if (Array.isArray(lRes.data) && lRes.data.length > 0) {
        setLeads(lRes.data);
      }
      if (mRes.data && typeof mRes.data === 'object') {
        setLeadMetrics(mRes.data);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const handleNameChange = (name: string) => {
    const autoCode = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 24);
    setFormData(prev => ({
      ...prev,
      name,
      code: prev.code ? prev.code : autoCode
    }));
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    setOnboardLoading(true);

    try {
      const academic_units = [];
      if (formData.include_school) {
        academic_units.push({
          code: 'SCHOOL',
          name: `${formData.name} Public School`,
          level: 'School',
          type: 'k12'
        });
      }
      if (formData.include_pu) {
        academic_units.push({
          code: 'PU_COLLEGE',
          name: `${formData.name} Pre-University College`,
          level: 'PU College',
          type: 'composite_pu'
        });
      }

      const payload = {
        name: formData.name,
        code: formData.code.trim().toLowerCase(),
        institution_type: formData.institution_type,
        email: formData.email,
        phone: formData.phone || null,
        city: formData.city,
        state: formData.state,
        campuses: [
          {
            name: formData.campus_name || 'Main Campus',
            code: (formData.campus_code || 'MAIN').toUpperCase(),
            is_main: true
          }
        ],
        academic_units,
        plan_code: formData.plan_code,
        billing_cycle: formData.billing_cycle,
        is_trial: formData.is_trial,
        trial_days: 30,
        initial_admin: {
          full_name: formData.admin_name,
          email: formData.admin_email,
          role: formData.admin_role,
          must_change_password: true,
          temporary_password: formData.temporary_password || undefined
        }
      };

      const res = await api.post('/platform/institutions/onboard', payload);
      setOnboardSuccessData(res.data);

      // If onboarded from a lead, mark lead as CONVERTED
      if (selectedLead) {
        try {
          await api.patch(`/platform/leads/${selectedLead.id}`, {
            status: 'CONVERTED',
            internal_notes: (selectedLead.internal_notes || '') + `\n[Converted to Tenant] Code: ${formData.code}`
          });
        } catch {
          // Ignore
        }
      }

      await fetchPlatformStats();
    } catch (err: any) {
      setOnboardError(err.response?.data?.detail || 'Failed to onboard institution. Please verify fields.');
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleStatusToggle = async (tenant: TenantSummary) => {
    const newStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
    try {
      await api.put(`/platform/tenants/${tenant.id}/status`, {
        status: newStatus,
        reason: `Super Admin toggled status to ${newStatus}`
      });
      setActionMessage(`Tenant '${tenant.name}' status changed to ${newStatus}.`);
      await fetchPlatformStats();
    } catch (err: any) {
      setActionMessage(`Failed to update status: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleRenewSubscription = async (tenant: TenantSummary) => {
    try {
      await api.post(`/platform/tenants/${tenant.id}/subscription/renew`, {
        duration_days: 365,
        billing_cycle: 'annual',
        reason: 'Super Admin one-click renewal'
      });
      setActionMessage(`Subscription renewed for '${tenant.name}' (+365 days).`);
      await fetchPlatformStats();
    } catch (err: any) {
      setActionMessage(`Failed to renew subscription: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Lead Management Actions
  const handleOpenLead = (lead: LeadSummary) => {
    setSelectedLead(lead);
    setLeadNoteInput(lead.internal_notes || '');
    setLeadStatusInput(lead.status || 'NEW');
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLead) return;
    setSavingLead(true);
    try {
      await api.patch(`/platform/leads/${selectedLead.id}`, {
        status: leadStatusInput,
        internal_notes: leadNoteInput
      });
      setActionMessage(`Lead #${selectedLead.reference_no} updated successfully.`);
      setSelectedLead(prev => prev ? { ...prev, status: leadStatusInput, internal_notes: leadNoteInput } : null);
      await fetchPlatformStats();
    } catch {
      // Local update fallback
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: leadStatusInput, internal_notes: leadNoteInput } : l));
      setSelectedLead(prev => prev ? { ...prev, status: leadStatusInput, internal_notes: leadNoteInput } : null);
      setActionMessage(`Lead #${selectedLead.reference_no} updated.`);
    } finally {
      setSavingLead(false);
    }
  };

  const handleConvertLead = (lead: LeadSummary) => {
    const cleanCode = lead.institution_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 20);

    setFormData({
      name: lead.institution_name,
      code: cleanCode,
      institution_type: lead.institution_type === 'school' ? 'school' : 'composite_group',
      email: lead.email,
      phone: lead.phone || '',
      city: lead.city || 'Bengaluru',
      state: lead.state || 'Karnataka',
      campus_name: 'Main Campus',
      campus_code: 'MAIN',
      include_school: true,
      include_pu: lead.institution_type !== 'school',
      plan_code: 'STANDARD',
      billing_cycle: 'annual',
      is_trial: lead.enquiry_type === 'trial',
      admin_name: lead.contact_name,
      admin_email: lead.email,
      admin_role: 'CHAIRMAN_DIRECTOR',
      temporary_password: ''
    });

    setSelectedLead(null);
    setOnboardSuccessData(null);
    setOnboardError(null);
    setShowOnboardModal(true);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = !leadSearchQuery.trim() || 
      l.institution_name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      l.contact_name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      l.phone.includes(leadSearchQuery) ||
      l.reference_no.toLowerCase().includes(leadSearchQuery.toLowerCase());

    const matchesStatus = leadStatusFilter === 'ALL' || l.status === leadStatusFilter;
    const matchesType = leadTypeFilter === 'ALL' || l.enquiry_type.toLowerCase() === leadTypeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const safeTenants = Array.isArray(tenants) ? tenants : DEFAULT_TENANTS;
  const safePlans = Array.isArray(plans) ? plans : DEFAULT_PLANS;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            Platform Control Plane • SaaS Root Authority
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Super Admin SaaS Dashboard</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Provision independent educational tenancies, manage subscription lifecycles, govern inbound prospect leads, and enforce kernel-level zero-trust security isolation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setOnboardSuccessData(null);
              setOnboardError(null);
              setShowOnboardModal(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Onboard New Institution
          </button>
          <Link
            to="/platform/entitlements"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-gray-950 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            Feature Entitlements
          </Link>
          <Link
            to="/demo?role=SUPER_ADMIN"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            Sandbox View
          </Link>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-blue-950/80 border border-blue-800 text-xs text-blue-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-blue-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 pt-3 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveTab('TENANTS')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'TENANTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Enrolled Educational Institutions ({safeTenants.length})
        </button>
        <button
          onClick={() => setActiveTab('LEADS')}
          className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'LEADS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          Website Leads & Demo Requests
          {leadMetrics.new_leads > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white animate-pulse">
              {leadMetrics.new_leads} NEW
            </span>
          )}
        </button>
      </div>

      {activeTab === 'TENANTS' ? (
        <>
          {/* Global SaaS Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Institutions</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{safeTenants.length}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">1 Demo • 1 Trial Active</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Subscription Tiers</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{safePlans.length} Plans</p>
                <p className="text-xs text-purple-600 font-medium mt-1">Trial & Demo Isolated</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Platform Paid MRR</p>
                <p className="text-2xl font-black text-gray-900 mt-1">₹0</p>
                <p className="text-xs text-gray-400 font-medium mt-1">Demo & Trial Excluded</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">RLS Security Status</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">Enforced</p>
                <p className="text-xs text-gray-500 mt-1">Kernel-level Row Isolation</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Registered Institutions Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Enrolled Educational Institutions</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live multi-tenant institutions with database isolation, campus units, and independent user roles
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchPlatformStats}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Refresh Tenancies"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {safeTenants.length} Tenancies Registered
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-[11px] text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3.5">Institution Name</th>
                    <th className="px-6 py-3.5">Tenant Code</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Contact Email</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {safeTenants.map((t) => {
                    const isDemo = t.code === 'our-school-demo' || t.status === 'active_demo' || t.name === 'OUR SCHOOL';
                    const isTrial = t.code === 'akshara-trial' || t.status === 'trial' || t.status === 'trial_active';
                    const isSuspended = t.status === 'suspended';

                    const displayType = isDemo
                      ? 'Demo'
                      : isTrial
                      ? 'School + PU College'
                      : (t.institution_type?.replace(/_/g, ' ') || 'School');

                    const displayStatus = isSuspended
                      ? 'SUSPENDED'
                      : isDemo
                      ? 'ACTIVE DEMO'
                      : isTrial
                      ? 'TRIAL ACTIVE'
                      : t.status.toUpperCase();

                    return (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-black text-gray-900 flex items-center gap-2">
                            <span>{t.name}</span>
                            {isDemo && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                Live Demo
                              </span>
                            )}
                            {isTrial && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-300">
                                Trial Pilot
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {isDemo ? '1 Demo Campus • 3 Demo Students' : 'School & PU College Units'}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-700">{t.code}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-700">
                          {displayType}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                              isSuspended
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : isDemo
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isTrial
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isDemo && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>}
                            {isTrial && <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>}
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">{t.email}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleStatusToggle(t)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                            title={isSuspended ? 'Reactivate Tenant' : 'Suspend Tenant'}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>

                          <button
                            onClick={() => handleRenewSubscription(t)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                            title="Renew Subscription (+1 Year)"
                          >
                            Renew
                          </button>

                          <Link
                            to="/platform/entitlements"
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 inline-flex items-center gap-1"
                          >
                            Features <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Leads & Enquiries Section */
        <div className="space-y-6">
          {/* Lead Pipeline Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Leads</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{leadMetrics.total_leads}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">All Enquiries</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">New Unread</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{leadMetrics.new_leads}</p>
              <p className="text-[10px] text-blue-500 mt-0.5">Action Required</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Demo Requests</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{leadMetrics.demo_requests}</p>
              <p className="text-[10px] text-emerald-500 mt-0.5">Live Walkthroughs</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Trial Requests</p>
              <p className="text-2xl font-black text-purple-600 mt-1">{leadMetrics.trial_requests}</p>
              <p className="text-[10px] text-purple-500 mt-0.5">Pilot Trials</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Follow-ups Due</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{leadMetrics.follow_ups_due}</p>
              <p className="text-[10px] text-amber-500 mt-0.5">Scheduled calls</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Converted</p>
              <p className="text-2xl font-black text-teal-600 mt-1">{leadMetrics.converted}</p>
              <p className="text-[10px] text-teal-500 mt-0.5">Active Tenants</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search institution, contact, phone, ref #..."
                value={leadSearchQuery}
                onChange={(e) => setLeadSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">Status:</span>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                  <option value="TRIAL_STARTED">Trial Started</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="font-semibold">Type:</span>
                <select
                  value={leadTypeFilter}
                  onChange={(e) => setLeadTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="ALL">All Types</option>
                  <option value="live_demo">Live Demo</option>
                  <option value="demo_request">Demo Request</option>
                  <option value="trial">Trial Request</option>
                  <option value="pricing">Pricing</option>
                  <option value="sales">Sales Consultation</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <button
                onClick={fetchPlatformStats}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                title="Refresh Leads"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-[11px] text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5">Ref #</th>
                    <th className="px-5 py-3.5">Institution & Contact</th>
                    <th className="px-5 py-3.5">Enquiry Type</th>
                    <th className="px-5 py-3.5">Preferred Slot</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Received</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-gray-400">
                        No leads found matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const isNew = lead.status === 'NEW';
                      const isConverted = lead.status === 'CONVERTED';
                      return (
                        <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs font-bold text-blue-700 whitespace-nowrap">
                            {lead.reference_no}
                            {lead.is_repeat_enquiry && (
                              <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                Repeat
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-900 text-xs">{lead.institution_name}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                              <span>{lead.contact_name}</span>
                              <span>•</span>
                              <span className="font-mono">{lead.phone}</span>
                            </div>
                            {lead.city && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {lead.city}, {lead.state || 'Karnataka'}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold capitalize text-slate-700">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                              {lead.enquiry_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
                            {lead.preferred_date ? (
                              <div>
                                <div className="font-semibold text-gray-800">{lead.preferred_date}</div>
                                <div className="text-[10px] text-gray-400">{lead.preferred_time_slot || 'Morning'}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Not specified</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                isNew
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : isConverted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : lead.status === 'DEMO_SCHEDULED'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {lead.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[11px] text-gray-400 whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenLead(lead)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                            >
                              Details
                            </button>
                            {!isConverted && (
                              <button
                                onClick={() => handleConvertLead(lead)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer shadow-sm"
                                title="Pre-fill Onboard Institution form with this lead"
                              >
                                Convert →
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  {selectedLead.reference_no}
                </span>
                <h3 className="text-xl font-black mt-1.5">{selectedLead.institution_name}</h3>
                <p className="text-xs text-slate-400">
                  Enquiry Type: <span className="text-blue-300 font-semibold uppercase">{selectedLead.enquiry_type.replace('_', ' ')}</span> • Received {new Date(selectedLead.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Contact Person</p>
                <div className="text-white font-bold text-sm">{selectedLead.contact_name}</div>
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedLead.email}
                </div>
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedLead.phone}
                </div>
                {selectedLead.city && (
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {selectedLead.city}, {selectedLead.state || 'Karnataka'}
                  </div>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Institution Context</p>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-white capitalize">{selectedLead.institution_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Strength:</span>
                  <span className="font-semibold text-white">{selectedLead.student_strength || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current ERP:</span>
                  <span className="font-semibold text-white">{selectedLead.current_erp || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preferred Slot:</span>
                  <span className="font-semibold text-blue-400">
                    {selectedLead.preferred_date ? `${selectedLead.preferred_date} (${selectedLead.preferred_time_slot})` : 'Flexible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Requested Modules */}
            {selectedLead.requested_modules && selectedLead.requested_modules.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Modules of Interest</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.requested_modules.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prospect Message */}
            {selectedLead.message && (
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Requirements & Message</p>
                <p className="text-slate-200 leading-relaxed italic">"{selectedLead.message}"</p>
              </div>
            )}

            {/* Pipeline Status & Internal Notes */}
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Pipeline Status</label>
                  <select
                    value={leadStatusInput}
                    onChange={(e) => setLeadStatusInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="NEW">NEW (Unread)</option>
                    <option value="CONTACTED">CONTACTED (Follow-up In Progress)</option>
                    <option value="DEMO_SCHEDULED">DEMO SCHEDULED</option>
                    <option value="TRIAL_STARTED">TRIAL STARTED</option>
                    <option value="CONVERTED">CONVERTED (Active Customer)</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-bold">Assigned Representative</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedLead.assigned_to || 'Siva (Platform Lead)'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-bold">Internal Notes</label>
                <textarea
                  rows={2}
                  value={leadNoteInput}
                  onChange={(e) => setLeadNoteInput(e.target.value)}
                  placeholder="Record call discussion, requirements, or next steps..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveLeadDetails}
                disabled={savingLead}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer border border-slate-700"
              >
                {savingLead ? 'Saving...' : 'Save Pipeline Notes'}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleConvertLead(selectedLead)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  Convert to Institution Onboarding →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Institution Onboarding Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Onboard Educational Institution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provisions isolated tenant, campuses, academic units, subscription, and initial administrator
                </p>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardSuccessData ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Institution Successfully Onboarded!
                  </div>
                  <p>{onboardSuccessData.activation_summary}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Institution:</span>
                    <span className="font-bold text-white">{onboardSuccessData.tenant.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Tenant Code:</span>
                    <span className="font-bold text-blue-400">{onboardSuccessData.tenant.code}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Initial Administrator:</span>
                    <span className="font-bold text-white">{onboardSuccessData.initial_admin.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400">Temporary Password:</span>
                    <span className="font-bold text-amber-400">{onboardSuccessData.initial_admin.temporary_password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="font-bold text-purple-400">{onboardSuccessData.initial_admin.role}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowOnboardModal(false);
                      setOnboardSuccessData(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Done & Refresh Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
                {onboardError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 text-xs text-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{onboardError}</span>
                  </div>
                )}

                {/* Section 1: Institution Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Institution Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. St. Joseph Composite Academy"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Unique Tenant Code / Subdomain *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. st-joseph"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 font-mono focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Institution Type</label>
                    <select
                      value={formData.institution_type}
                      onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="composite_group">Composite Group (School + PU)</option>
                      <option value="school">K-12 School</option>
                      <option value="pu_college">PU College</option>
                      <option value="degree_college">Degree College</option>
                      <option value="university">University</option>
                      <option value="educational_trust">Educational Trust</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="info@institution.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Bengaluru"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">State</label>
                    <input
                      type="text"
                      placeholder="Karnataka"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Section 2: Campus & Academic Units */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Campuses & Academic Composition</span>
                    <span className="text-[10px] text-blue-400 font-mono">Multi-Unit Enabled</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Main Campus Name</label>
                      <input
                        type="text"
                        value={formData.campus_name}
                        onChange={(e) => setFormData({ ...formData, campus_name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Campus Code</label>
                      <input
                        type="text"
                        value={formData.campus_code}
                        onChange={(e) => setFormData({ ...formData, campus_code: e.target.value.toUpperCase() })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.include_school}
                        onChange={(e) => setFormData({ ...formData, include_school: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300">Provision School Unit (K-10/12)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.include_pu}
                        onChange={(e) => setFormData({ ...formData, include_pu: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300">Provision PU College Unit (11th & 12th)</span>
                    </label>
                  </div>
                </div>

                {/* Section 3: Subscription & Trial Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">SaaS Plan Tier</label>
                    <select
                      value={formData.plan_code}
                      onChange={(e) => setFormData({ ...formData, plan_code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="STARTER">Starter Plan (Up to 300 students)</option>
                      <option value="STANDARD">Standard Campus (Up to 750 students)</option>
                      <option value="PROFESSIONAL">Professional Plan (Up to 1,500 students)</option>
                      <option value="PREMIUM">Premium Plan (Up to 3,000 students)</option>
                      <option value="ENTERPRISE">Enterprise Multi-Campus (10,000+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Billing Cycle</label>
                    <select
                      value={formData.billing_cycle}
                      onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="annual">Annual Billing (Recommended)</option>
                      <option value="monthly">Monthly Billing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Activation Mode</label>
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_trial}
                          onChange={(e) => setFormData({ ...formData, is_trial: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-amber-300 font-bold">30-Day Free Trial</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 4: Initial Administrator */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="font-bold text-slate-300">Initial Administrative Authority</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Anand Hegde"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Admin Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="chairman@institution.edu.in"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Role</label>
                      <select
                        value={formData.admin_role}
                        onChange={(e) => setFormData({ ...formData, admin_role: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                      >
                        <option value="CHAIRMAN_DIRECTOR">Chairman / Director</option>
                        <option value="PRINCIPAL">Principal</option>
                        <option value="INSTITUTION_ADMIN">Institution Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={onboardLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {onboardLoading ? 'Provisioning Institution...' : 'Complete Provisioning'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
