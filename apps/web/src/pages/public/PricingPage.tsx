import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  const plans = [
    {
      code: 'STARTER',
      name: 'Starter Plan',
      tier: 'Tier 1',
      students: 'Up to 300 Students',
      campuses: '1 Campus',
      annualPrice: 9999,
      monthlyPrice: 999,
      description: 'Ideal for early-stage and primary schools starting digital administration.',
      features: [
        'Complete Student Information System (SIS)',
        'Basic Fee Invoicing & Counter Receipts',
        'Daily Student & Staff Attendance',
        'Examinations & Printable Report Cards',
        'Academic Years & Classes Configuration',
        'Standard Email Notifications',
      ],
      notIncluded: [
        'Parent & Student Mobile Portal',
        'Offline PWA Synchronisation',
        'WhatsApp Business Automation',
      ],
    },
    {
      code: 'STANDARD',
      name: 'Standard Plan',
      tier: 'Tier 2',
      isPopular: true,
      students: 'Up to 750 Students',
      campuses: '1 Campus',
      annualPrice: 19999,
      monthlyPrice: 1999,
      description: 'The preferred choice for growing schools with parent and student apps.',
      features: [
        'Everything in Starter Plan',
        'Dedicated Parent & Student Portals',
        'True Offline PWA & Local Queue Sync',
        'White-Label Branding (Logo & Colors)',
        'Automated SMS Fee Due Reminders',
        'Timetable Conflict Scheduling',
        'Standard Data Exports (Excel & CSV)',
      ],
      notIncluded: [
        'Hardware Biometric Attendance Sync',
        'Official WhatsApp Business Automation',
      ],
    },
    {
      code: 'PROFESSIONAL',
      name: 'Professional Plan',
      tier: 'Tier 3',
      students: 'Up to 1,500 Students',
      campuses: 'Up to 2 Campuses',
      annualPrice: 34999,
      monthlyPrice: 3499,
      description: 'Engineered for senior secondary schools, PU colleges, and growing institutions.',
      features: [
        'Everything in Standard Plan',
        'PU College Streams & University Credits',
        'Online Payment Gateway (Razorpay/UPI)',
        'Staff HR, Leaves & Salary Payroll',
        'Library Management & Barcode Issues',
        'Bus Transport & Route Allocations',
        'Hostel Bed & Room Allocations',
      ],
      notIncluded: [
        'AI Performance Risk Forecasting',
        'Dedicated Database Deployment',
      ],
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Suite',
      tier: 'Tier 5',
      students: '10,000+ Students',
      campuses: 'Unlimited Campuses',
      annualPrice: 99999,
      monthlyPrice: 9999,
      description: 'For degree colleges, universities, and multi-campus educational trusts.',
      features: [
        'Everything in Professional Plan',
        'AI Academic Risk & Performance Forecaster',
        'Official WhatsApp Business API Automation',
        'Biometric Hardware Integration Sync',
        'Multi-Campus Centralized Audit Controls',
        'Optional Physical Dedicated Database',
        'Separately Branded Mobile App (Premium)',
        'Dedicated 24/7 Account Manager & SLA',
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Transparent SaaS Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
          Simple, Predictable Plans for Indian Education
        </h1>
        <p className="text-gray-600 text-base">
          No hidden onboarding costs. No mandatory per-student surcharges. Change plans anytime.
        </p>

        {/* Toggle */}
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

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div
            key={p.code}
            className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition-all ${
              p.isPopular
                ? 'border-2 border-blue-600 shadow-xl relative'
                : 'border border-gray-200 shadow-sm'
            }`}
          >
            {p.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                Recommended
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{p.tier}</span>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{p.campuses}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
              <p className="text-xs text-blue-600 font-bold mt-0.5">{p.students}</p>
              <p className="text-xs text-gray-500 mt-2 min-h-[36px]">{p.description}</p>

              <div className="my-6 pt-4 border-t border-gray-100">
                <span className="text-3xl font-black text-gray-950">
                  ₹{billingCycle === 'annual' ? p.annualPrice.toLocaleString() : p.monthlyPrice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500"> / {billingCycle === 'annual' ? 'yr' : 'mo'}</span>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <p className="font-bold text-[11px] text-gray-400 uppercase tracking-wider mb-2">Included Features:</p>
                {p.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))}
                {p.notIncluded.map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-gray-400">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-300" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/register"
                className={`w-full block text-center py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  p.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Choose {p.name}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/pricing/compare"
          className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800"
        >
          Compare All 28 Features Side-by-Side &rarr;
        </Link>
      </div>
    </div>
  );
};
