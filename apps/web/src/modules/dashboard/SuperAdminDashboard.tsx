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
  Server
} from 'lucide-react';
import { api } from '../../services/api';

interface TenantSummary {
  id: string;
  name: string;
  code: string;
  institution_type: string;
  status: string;
  email: string;
  campuses: any[];
}

export const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          api.get('/platform/tenants'),
          api.get('/platform/plans'),
        ]);
        setTenants(tRes.data);
        setPlans(pRes.data);
      } catch (err) {
        console.error('Error fetching platform stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlatformStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            Platform Control Plane
          </span>
          <h2 className="text-2xl font-black">Super Admin SaaS Dashboard</h2>
          <p className="text-slate-300 text-sm mt-1">
            Global management of registered institutions, plans, billing, and feature entitlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/superadmin/entitlements"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-gray-950 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            Feature Entitlements
          </a>
          <button
            onClick={() => alert('Onboarding modal ready for Phase 2 integration.')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Onboard Institution
          </button>
        </div>
      </div>

      {/* Global SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total Institutions</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{tenants.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Target: 100 pilot phase</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Active Plans</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{plans.length}</p>
            <p className="text-xs text-gray-500 mt-1">Starter through Enterprise</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Annual Subscriptions</p>
            <p className="text-2xl font-black text-gray-900 mt-1">₹1,84,990</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">+18% growth</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">System Health</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">Healthy</p>
            <p className="text-xs text-gray-400 mt-1">RLS & API Active</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Registered Institutions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Enrolled Educational Institutions</h3>
            <p className="text-xs text-gray-500">Live multi-tenant accounts isolated via PostgreSQL RLS</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            {tenants.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Institution Name</th>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{t.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{t.code}</td>
                  <td className="px-6 py-4 capitalize">{t.institution_type?.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{t.email}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href="/superadmin/entitlements"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      Manage Features <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No institutions registered yet. Use the Onboard button to add the first pilot school.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
