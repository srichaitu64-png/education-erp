import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  // Public offers intentionally mirror the homepage: 30-day trial + three paid plans.
  // Intermediate internal tiers remain available to platform administrators, not public checkout.
  const plans = [
    {
      code: 'TRIAL',
      name: '30-Day Free Trial',
      tier: 'Evaluation',
      students: 'Up to 100 Students',
      campuses: '1 Campus',
      annualPrice: 0,
      monthlyPrice: 0,
      description: 'Explore the core school workflows before choosing a subscription.',
      features: [
        'Student and admissions records',
        'Daily attendance',
        'Basic fee management',
        'Examinations and report cards',
        '30 days of evaluation access',
      ],
      notIncluded: [
        'Parent & student portals',
        'Advanced communication and automation',
        'Multi-campus governance and AI analytics',
      ],
    },
    {
      code: 'STARTER',
      name: 'Starter Plan',
      tier: 'For growing schools',
      students: 'Up to 300 Students',
      campuses: '1 Campus',
      annualPrice: 9999,
      monthlyPrice: 999,
      description: 'Core digital administration for schools and smaller institutions.',
      features: [
        'Student Information System and admissions',
        'Daily student and staff attendance',
        'Fee structures, invoices and counter receipts',
        'Examinations and printable report cards',
        'Academic years, classes and standard reports',
        'Email notifications',
      ],
      notIncluded: [
        'Parent & student portals and offline sync',
        'Advanced HR, library, transport and hostel modules',
        'WhatsApp automation, biometric sync and AI analytics',
      ],
    },
    {
      code: 'STANDARD',
      name: 'Standard Plan',
      tier: 'Most Popular',
      isPopular: true,
      students: 'Up to 750 Students',
      campuses: '1 Campus',
      annualPrice: 19999,
      monthlyPrice: 1999,
      description: 'Everything in Starter, with connected parent and student experiences.',
      features: [
        'Everything in Starter Plan',
        'Parent and student portals',
        'Offline PWA and local queue synchronisation',
        'SMS alerts and fee reminders',
        'White-label institution branding',
        'Expanded capacity and storage',
      ],
      notIncluded: [
        'Advanced HR, library, transport and hostel modules',
        'WhatsApp Business API and biometric hardware sync',
        'AI performance forecasting and dedicated infrastructure',
      ],
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Suite',
      tier: 'For institutions and groups',
      students: 'Up to 10,000 Students',
      campuses: 'Up to 20 Campuses',
      annualPrice: 99999,
      monthlyPrice: 9999,
      description: 'Advanced operations, multi-campus governance and enterprise capabilities.',
      features: [
        'Everything in Standard Plan',
        'Professional operations: HR, payroll, library, transport and hostel',
        'PU and degree-college academic capabilities',
        'Online payment gateway integrations',
        'WhatsApp Business and biometric integrations',
        'Multi-campus governance and advanced analytics',
        'AI performance forecasting and enterprise controls',
      ],
      notIncluded: [
        'Dedicated physical database and separately branded mobile app are subject to deployment scope',
      ],
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
                to={`/register?plan=${p.code}&billing=${billingCycle}`}
                className={`w-full block text-center py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  p.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {p.code === 'TRIAL' ? 'Start Free Trial' : `Choose ${p.name}`}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/pricing/compare"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-bold shadow-sm transition-all"
        >
          Compare All 28 Capabilities in Feature Entitlement Matrix &rarr;
        </Link>
      </div>
    </div>
  );
};

