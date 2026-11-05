import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Lock } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Multi-Tenant Row-Level Security guarantee our student data privacy?',
      a: 'EduOmni uses PostgreSQL 16 Row-Level Security (RLS) forced at the database engine level. Every table has a tenant_id foreign key, and before any SQL query executes, the transaction context sets app.current_tenant_id from the verified JWT. School A can never query, read, or infer School B records, even if someone tampers with UUIDs in API calls.',
    },
    {
      q: 'Does EduOmni comply with India’s Digital Personal Data Protection (DPDP) Act, 2023?',
      a: 'Yes. We implement verified guardian workflows for child consent, encrypted storage for student personal information and medical records, strict RBAC authorization, and automated data retention and deletion pipelines in accordance with DPDP requirements.',
    },
    {
      q: 'What happens if our school internet connection goes down?',
      a: 'Our Progressive Web App (PWA) and Android app use IndexedDB (Dexie.js) and SQLite to store records locally. Teachers can mark daily attendance and draft examination marks completely offline. As soon as connectivity returns, our sync engine reconciles the operation journal with idempotent checks.',
    },
    {
      q: 'Can every school use its own logo, colors, and custom domain?',
      a: 'Yes! Every institution configures its brand colors, logo, receipt headers, and report-card templates. Institutions on Professional and Enterprise plans can also link their own custom CNAME domain (e.g., portal.yourschool.edu.in).',
    },
    {
      q: 'Can we migrate existing student and fee data from Excel?',
      a: 'Yes. We provide an automated bulk Excel import tool with column mapping, data validation preview, duplicate detection, and rollback safety.',
    },
  ];

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-950">
          Everything You Need to Know
        </h1>
        <p className="text-gray-600 text-sm">
          Technical, security, and commercial questions answered for educational trustees and IT leaders.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-5 text-left font-bold text-gray-900 text-sm flex items-center justify-between gap-4 hover:bg-gray-50/70"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

