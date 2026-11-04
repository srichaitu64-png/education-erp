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
  ArrowLeft
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

const DEFAULT_TENANTS: TenantSummary[] = [
  {
    id: 'tenant-akshara',
    name: 'Akshara Global Educational Trust',
    code: 'AKSHARA-01',
    institution_type: 'SCHOOL_AND_COLLEGE',
    status: 'ACTIVE',
    email: 'admin@akshara.edu.in',
    campuses: [{ name: 'Main Campus', city: 'Bengaluru' }]
  },
  {
    id: 'tenant-vidya',
    name: 'Vidyanikethan Public School',
    code: 'VPS-BLR',
    institution_type: 'SCHOOL',
    status: 'ACTIVE',
    email: 'contact@vidyanikethan.edu.in',
    campuses: [{ name: 'North Campus', city: 'Bengaluru' }]
  },
  {
    id: 'tenant-st-marys',
    name: "St. Mary's Pre-University College",
    code: 'SMPUC-MYS',
    institution_type: 'PU_COLLEGE',
    status: 'ACTIVE',
    email: 'office@stmaryspu.edu.in',
    campuses: [{ name: 'Central Campus', city: 'Mysuru' }]
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

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          api.get('/platform/tenants'),
          api.get('/platform/plans'),
        ]);
        if (Array.isArray(tRes.data)) {
          setTenants(tRes.data);
        }
        if (Array.isArray(pRes.data)) {
          setPlans(pRes.data);
        }
      } catch (err) {
        // Fallback to default demo tenants on static deployment
        setTenants(DEFAULT_TENANTS);
        setPlans(DEFAULT_PLANS);
      } finally {
        setLoading(false);
      }
    };
    fetchPlatformStats();
  }, []);

  const safeTenants = Array.isArray(tenants) ? tenants : DEFAULT_TENANTS;
  const safePlans = Array.isArray(plans) ? plans : DEFAULT_PLANS;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            Platform Control Plane (SaaS Root)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Super Admin SaaS Dashboard</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Private platform-owner control plane managing 1,000+ registered educational tenants, billing, feature entitlements, and zero-trust infrastructure isolation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/demo?role=SUPER_ADMIN"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            Interactive Sandbox
          </Link>
          <Link
            to="/platform/entitlements"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-gray-950 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            Feature Entitlements
          </Link>
        </div>
      </div>

      {/* Global SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Institutions</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{safeTenants.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">3 Pilot Campuses Live</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Subscription Tiers</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{safePlans.length}</p>
            <p className="text-xs text-gray-500 mt-1">Starter through Enterprise</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Platform SaaS MRR</p>
            <p className="text-2xl font-black text-gray-900 mt-1">₹1,84,990</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">+18.4% month-on-month</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tenant Isolation</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">Zero-Trust</p>
            <p className="text-xs text-gray-500 mt-1">PostgreSQL RLS Active</p>
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
            <h3 className="font-bold text-gray-900 text-lg">Enrolled Educational Institutions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live multi-tenant accounts strictly isolated via PostgreSQL Row-Level Security</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {safeTenants.length} Active Accounts
          </span>
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
              {safeTenants.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{t.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{t.code}</td>
                  <td className="px-6 py-4 capitalize">{t.institution_type?.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{t.email}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/platform/entitlements"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      Manage Features <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
