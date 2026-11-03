import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  Sparkles,
  ShieldCheck,
  WifiOff,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Layers,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      title: 'Multi-Tier Academic Structures',
      icon: GraduationCap,
      tier: 'Standard',
      description: 'Native support for CBSE, ICSE, and State Boards in Schools; PCMB, PCMC, Commerce in PU Colleges; Semesters, Credits, and NEP 2020 in Degree Colleges.',
      points: ['Classes & Sections', 'Stream specializations', 'Semester credit courses', 'Dynamic syllabus tracking'],
    },
    {
      title: 'Double-Entry Fee Management',
      icon: CreditCard,
      tier: 'Starter / Pro',
      description: 'Automated student fee structures, partial instalment collection, cashbook daybook, and Razorpay/UPI gateway integration.',
      points: ['Instant PDF receipts', 'Late fee rules & concessions', 'Defaulter SMS reminders', 'Settlement reconciliation'],
    },
    {
      title: 'Offline-First Attendance Sync',
      icon: CalendarCheck,
      tier: 'Standard',
      description: 'Mark attendance with zero internet connectivity. Stored securely in IndexedDB / SQLite and synced automatically upon reconnection.',
      points: ['Period-wise & daily roll call', 'Biometric device sync (Premium)', 'WhatsApp absence push', 'Monthly % reports'],
    },
    {
      title: 'Tamper-Proof Examination Engine',
      icon: Award,
      tier: 'Standard / Pro',
      description: 'Complete examination scheduling, teacher marks entry with validation checks, verification workflows, and published result locking.',
      points: ['Configurable grading schemes', 'University SGPA/CGPA support', 'Printable PDF report cards', 'Revaluation tracking'],
    },
    {
      title: 'Official WhatsApp Business Automation',
      icon: MessageSquare,
      tier: 'Premium',
      description: 'Reach 99% of parents where they are. Trigger automated attendance alerts, fee invoice links, circulars, and exam results via WhatsApp.',
      points: ['Approved Meta message templates', 'Parent fee payment links', 'Emergency circular broadcast', 'Delivery tracking logs'],
    },
    {
      title: 'AI Academic Risk Insights',
      icon: Sparkles,
      tier: 'Enterprise',
      description: 'Early intervention algorithms identifying students with declining academic performance or excessive absenteeism.',
      points: ['Subject-wise risk flags', 'Predictive exam performance', 'Automated revision alerts', 'Teacher action recommendations'],
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Platform Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
          Enterprise Features Built for Modern Institutions
        </h1>
        <p className="text-gray-600 text-base">
          From student admissions to automated fee collection and examination report cards, discover how EduOmni transforms educational administration.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {f.tier}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">{f.description}</p>
                <ul className="space-y-2 text-xs text-gray-700">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black">Want to test these features hands-on?</h2>
          <p className="text-blue-100 text-xs mt-1">Our live interactive demo sandbox allows you to test every feature without any login.</p>
        </div>
        <Link
          to="/demo"
          className="px-6 py-3.5 rounded-xl text-sm font-extrabold bg-white text-indigo-900 hover:bg-blue-50 shrink-0 shadow-md transition-colors"
        >
          Launch Interactive Sandbox &rarr;
        </Link>
      </div>
    </div>
  );
};
