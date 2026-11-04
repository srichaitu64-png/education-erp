import React from 'react';
import { Star, Quote, Building, Award, CheckCircle2 } from 'lucide-react';

export const TestimonialsPage: React.FC = () => {
  const testimonials = [
    {
      name: 'Dr. Ramesh Kumar',
      role: 'Principal & Director',
      institution: 'Akshara Global School & College, Bengaluru',
      type: 'Composite School & PU College (1,850 Students)',
      quote: 'EduOmni’s offline synchronization completely removed our morning attendance bottleneck. Even during heavy monsoon broadband outages, our 40 teachers mark attendance on their phones and it syncs without losing a single record.',
      impact: '100% on-time roll-call compliance and ₹8.5L in recovered fee arrears within 60 days.',
    },
    {
      name: 'Sister Mary Varghese',
      role: 'Headmistress',
      institution: 'St. Joseph Higher Secondary School, Kochi',
      type: 'Secondary & Higher Secondary (1,200 Students)',
      quote: 'The examination engine is rigorous. Teachers enter marks with immediate grade calculation, and report cards are generated with official seals in PDF in minutes. No manual Excel errors.',
      impact: 'Saved 120+ teacher hours per examination cycle.',
    },
    {
      name: 'Prof. S. N. Hegde',
      role: 'Dean of Academics',
      institution: 'Vidyaniketan PU & Degree College, Hubli',
      type: 'PU College & Autonomous Degree (3,200 Students)',
      quote: 'Having true support for both Karnataka PU streams (PCMB/PCMC) and Degree College semester credits in one single software is rare. We eliminated three separate legacy systems.',
      impact: 'Consolidated admissions, fees, and exam results across 3 campuses.',
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Customer Success & Case Studies
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
          Trusted by Educators Across India
        </h1>
        <p className="text-gray-600 text-base">
          Read how schools, PU colleges, and degree institutions modernised operations with EduOmni ERP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed mb-6">"{t.quote}"</p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-semibold mb-6">
                <strong>Result:</strong> {t.impact}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-bold text-sm text-gray-900">{t.name}</h4>
              <p className="text-xs text-blue-600 font-semibold">{t.role}</p>
              <p className="text-[11px] text-gray-500 mt-1">{t.institution}</p>
              <span className="text-[10px] text-gray-400 block mt-0.5">{t.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

