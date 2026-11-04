import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  Users,
  CreditCard,
  DollarSign,
  CalendarCheck,
  BookOpen,
  Award,
  Eye,
  Smartphone,
  Briefcase,
  Clock,
  MessageSquare,
  BookMarked,
  Bus,
  Home,
  BarChart3,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';

export const ModulesPage: React.FC = () => {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const modules = [
    { id: 1, name: 'Institution Management', category: 'Core', icon: Building2, desc: 'Campuses, academic years, white-label branding, logo, colors, and accreditation settings.' },
    { id: 2, name: 'Admission Pipeline', category: 'Core', icon: GraduationCap, desc: 'Enquiries, online applications, document verification, waiting lists, and automated admission numbers.' },
    { id: 3, name: 'Student Information System (SIS)', category: 'Core', icon: Users, desc: 'Comprehensive profiles, guardian linking, medical records, student transfers, and ID cards.' },
    { id: 4, name: 'Fee Invoicing & Payments', category: 'Core', icon: CreditCard, desc: 'Structures, installment schedules, online Razorpay/UPI gateway, late fees, and instant receipts.' },
    { id: 5, name: 'Accounting & Ledger', category: 'Finance', icon: DollarSign, desc: 'Double-entry cashbook, daybook reconciliation, expense categories, and audited financial trails.' },
    { id: 6, name: 'Attendance & Biometrics', category: 'Core', icon: CalendarCheck, desc: 'Daily and period-wise attendance, staff roll call, biometric machine sync, and offline recording.' },
    { id: 7, name: 'Academic Framework', category: 'Core', icon: BookOpen, desc: 'Schools (Classes & Sections), PU (Streams), Degree (Programmes, Semesters, Credits, Courses).' },
    { id: 8, name: 'Examinations & Marks', category: 'Core', icon: Award, desc: 'Exam schedules, maximum marks, internal/practical marks, grade calculation, and result locking.' },
    { id: 9, name: 'Parent Portal & App', category: 'Portals', icon: Eye, desc: 'Linked children access, real-time attendance percentage, fee balance, online payment, and homework.' },
    { id: 10, name: 'Student Portal & App', category: 'Portals', icon: Smartphone, desc: 'Digital ID cards, academic records, timetable, homework submissions, and exam results.' },
    { id: 11, name: 'Staff & HR Management', category: 'Operations', icon: Briefcase, desc: 'Employee records, designations, leave approval workflows, payroll structures, and payslips.' },
    { id: 12, name: 'Timetable Scheduling', category: 'Operations', icon: Clock, desc: 'Class and teacher timetables, subject allocation, conflict detection, and room allocations.' },
    { id: 13, name: 'Communication Suite', category: 'Operations', icon: MessageSquare, desc: 'Official WhatsApp Business API, SMS gateway, email circulars, and push notifications.' },
    { id: 14, name: 'Library Management', category: 'Operations', icon: BookMarked, desc: 'Book catalog, ISBN barcodes, book issues, return tracking, overdue fines, and inventory.' },
    { id: 15, name: 'Transport & GPS', category: 'Operations', icon: Bus, desc: 'Bus vehicles, drivers, route stops, transport fees allocation, and live vehicle tracking.' },
    { id: 16, name: 'Hostel Management', category: 'Operations', icon: Home, desc: 'Hostel buildings, room allocations, bed tracking, hostel fees, and visitor registers.' },
    { id: 17, name: 'Reports & Analytics', category: 'Reporting', icon: BarChart3, desc: 'Excel exports, PDF report cards, fee collection summaries, and class performance comparisons.' },
    { id: 18, name: 'AI Academic Intelligence', category: 'AI', icon: Sparkles, desc: 'Predictive student performance, drop-out risk indicators, and fee forecasting algorithms.' },
  ];

  const filtered = modules.filter((m) => {
    const matchesCat = filter === 'ALL' || m.category === filter;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Complete Modular Monolith
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
          18 Enterprise Modules. Zero Clutter.
        </h1>
        <p className="text-gray-600 text-base">
          Every module is built with real backend database persistence, validation, and role-based permissions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Core', 'Finance', 'Operations', 'Portals', 'Reporting', 'AI'].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filter === c
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                    {m.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{m.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fully Functional
                </span>
                <Link
                  to="/demo"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Test in Demo &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

