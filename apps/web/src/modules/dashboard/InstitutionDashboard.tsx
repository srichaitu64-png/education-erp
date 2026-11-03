import React from 'react';
import {
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  Sparkles,
  MessageSquare,
  Lock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { FeatureGate } from '../../components/FeatureGate';

export const InstitutionDashboard: React.FC = () => {
  const { tenant, currentPlan, entitlements } = useAuthStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Plan Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-800/80 text-blue-200 border border-blue-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            Verified Institution
          </span>
          <h2 className="text-2xl font-black">{tenant?.name || 'Akshara Global School & College'}</h2>
          <p className="text-blue-200 text-sm mt-1">
            Academic Year 2026–2027 • Main Campus Active • Multi-Tenant Isolated
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-right">
          <p className="text-xs text-blue-200 uppercase tracking-wider">Subscription Tier</p>
          <p className="text-xl font-extrabold text-white">{currentPlan}</p>
          <a
            href="/dashboard/subscription/upgrade"
            className="text-xs text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1 mt-1"
          >
            Upgrade Modules <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Active Students</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">450 / 750</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Today's Attendance</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">94.8%</p>
            <p className="text-xs text-gray-400 mt-1">427 present • 23 absent</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Today's Collections</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹1,48,500</p>
            <p className="text-xs text-gray-400 mt-1">Cash, UPI & Gateway</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Mid-Term Examinations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">Scheduled</p>
            <p className="text-xs text-gray-400 mt-1">Starting Nov 15</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Commercial Feature Locking Demonstration Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Institutional Module Capabilities</h3>
            <p className="text-sm text-gray-500">Live feature gating based on plan entitlements and administrator overrides</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
            {Object.keys(entitlements).length} Modules Registered
          </span>
        </div>

        {/* Unlocked Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-gray-900">Student Information System</h4>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Full lifecycle student registration, guardian mapping and class assignments.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-gray-900">Basic Fee Management</h4>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Fee structures, student invoicing, receipt generation and ledger audit trails.</p>
            </div>
          </div>
        </div>

        {/* Premium Locked Feature Showcase with FeatureGate */}
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Enterprise Premium Modules</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Performance Reports - Enterprise Feature Gate */}
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

          {/* WhatsApp Automation - Premium Feature Gate */}
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

