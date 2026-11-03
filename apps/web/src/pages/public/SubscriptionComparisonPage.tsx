import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Lock, ArrowLeft } from 'lucide-react';

export const SubscriptionComparisonPage: React.FC = () => {
  const comparisonData = [
    { module: 'Core Student Info', feature: 'Student Information System (SIS)', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Admissions', feature: 'Online Enquiries & Applications', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Fees', feature: 'Fee Structures, Invoices & Cash Receipts', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Fees', feature: 'Online Payment Gateway (Razorpay/UPI)', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Attendance', feature: 'Daily & Period-wise Student Roll-Call', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Attendance', feature: 'Biometric Machine Hardware Sync', trial: false, starter: false, std: false, pro: false, prem: true, ent: true },
    { module: 'Examinations', feature: 'Exams Scheduling & Marks Entry', trial: true, starter: true, std: true, pro: true, prem: true, ent: true },
    { module: 'Examinations', feature: 'University Credits, SGPA & Backlogs', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Portals', feature: 'Parent Web & Mobile Portal', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'Portals', feature: 'Student Web & Mobile Portal', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'Offline Sync', feature: 'Offline PWA & Local Queue Sync', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'White-Label', feature: 'Custom Logo & Color Themes', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'White-Label', feature: 'Custom Subdomain & Domain CNAME', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'White-Label', feature: 'Dedicated Branded Android App', trial: false, starter: false, std: false, pro: false, prem: false, ent: true },
    { module: 'Communication', feature: 'Automated SMS Alerts & Dues Notice', trial: false, starter: false, std: true, pro: true, prem: true, ent: true },
    { module: 'Communication', feature: 'Official WhatsApp Business API Push', trial: false, starter: false, std: false, pro: false, prem: true, ent: true },
    { module: 'Operations', feature: 'Staff HR, Leaves & Salary Payroll', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Operations', feature: 'Library Catalog, Barcodes & Issues', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Operations', feature: 'Bus Transport & Route Allocations', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Operations', feature: 'Hostel Rooms & Bed Allocations', trial: false, starter: false, std: false, pro: true, prem: true, ent: true },
    { module: 'Multi-Campus', feature: 'Centralized Multi-Branch Governance', trial: false, starter: false, std: false, pro: false, prem: true, ent: true },
    { module: 'AI & Analytics', feature: 'AI Academic Risk & Performance Forecaster', trial: false, starter: false, std: false, pro: false, prem: false, ent: true },
    { module: 'Infrastructure', feature: 'Dedicated Physically Isolated Database', trial: false, starter: false, std: false, pro: false, prem: false, ent: true },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <Link to="/pricing" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Pricing Overview
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950">
          Complete Feature Entitlement Matrix
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Detailed plan breakdown demonstrating how our central EntitlementService enforces feature gating.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="p-4 font-bold">Module / Capability</th>
              <th className="p-4 text-center font-bold">Trial</th>
              <th className="p-4 text-center font-bold">Starter</th>
              <th className="p-4 text-center font-bold text-blue-600">Standard</th>
              <th className="p-4 text-center font-bold">Pro</th>
              <th className="p-4 text-center font-bold">Premium</th>
              <th className="p-4 text-center font-bold text-purple-700">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/70">
                <td className="p-4 font-medium text-gray-900">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">{row.module}</span>
                  {row.feature}
                </td>
                <td className="p-4 text-center">{row.trial ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-gray-300 mx-auto" />}</td>
                <td className="p-4 text-center">{row.starter ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-gray-300 mx-auto" />}</td>
                <td className="p-4 text-center bg-blue-50/40">{row.std ? <Check className="w-4 h-4 text-blue-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-gray-300 mx-auto" />}</td>
                <td className="p-4 text-center">{row.pro ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-gray-300 mx-auto" />}</td>
                <td className="p-4 text-center">{row.prem ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-gray-300 mx-auto" />}</td>
                <td className="p-4 text-center bg-purple-50/30">{row.ent ? <Check className="w-4 h-4 text-purple-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-gray-300 mx-auto" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
