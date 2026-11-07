import React from 'react';
import {
  BookOpen,
  GraduationCap,
  Users,
  CalendarCheck,
  Clock,
  Award,
  FileSpreadsheet,
  QrCode,
  DollarSign,
  Receipt,
  FileText,
  UserCheck,
  Layers,
  Bus,
  Building2,
  FlaskConical,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Plus,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

interface InstitutionalStockCardsViewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenCreateStudent?: () => void;
  onOpenCollectFee?: () => void;
}

export const InstitutionalStockCardsView: React.FC<InstitutionalStockCardsViewProps> = ({
  onNavigateTab,
  onOpenCreateStudent,
  onOpenCollectFee,
}) => {
  const {
    students,
    admissions,
    masterSubjectCatalogue,
    curriculumMappings,
    receipts,
    exams,
    staffMembers,
    staffDuties,
    academicSections,
    transportRoutes,
    laboratories,
    tenantScope,
  } = useDemoStore();

  const isTrial = tenantScope === 'akshara-trial' || tenantScope === 'pilot-clean';
  const totalFeeCollected = receipts.reduce((acc, r) => acc + (r.amount_paid || 0), 0);

  const pillars = [
    {
      pillarId: 'academic',
      title: 'Academic Management',
      subtitle: 'Curriculum structure, admissions pipeline, student records, attendance & examination suite',
      theme: 'blue',
      cards: [
        {
          id: 'academics',
          title: 'Subject Catalogue & Curriculum Mapping',
          description: 'Master subject catalogue, class-wise syllabus mapping & evaluation rules',
          icon: BookOpen,
          badge: isTrial && masterSubjectCatalogue.length === 0
            ? '0 Subjects • Ready'
            : `${masterSubjectCatalogue.length} Subjects (${curriculumMappings.length} Mapped)`,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          id: 'admissions',
          title: 'Admissions Pipeline & Approvals',
          description: 'Prospective applicant tracking, verification, approval & SIS activation',
          icon: GraduationCap,
          badge: isTrial && admissions.length === 0
            ? '0 Enquiries • Ready'
            : `${admissions.length} Applications (${admissions.filter(a => a.status === 'APPROVED').length} Ready)`,
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        },
        {
          id: 'students',
          title: 'Student Information System (SIS)',
          description: 'Enrolled student master directory, 360° academic & parent profile',
          icon: Users,
          badge: isTrial && students.length === 0
            ? '0 Enrolled • Pilot Ready'
            : `${students.length} Enrolled Students`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          id: 'attendance',
          title: 'Daily Attendance & Biometric Roll Call',
          description: 'Class-wise absentee-first roll call with period tracking & SMS trigger',
          icon: CalendarCheck,
          badge: isTrial && students.length === 0
            ? 'Awaiting Pilot Students'
            : 'Absent-First Active',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        },
        {
          id: 'examinations',
          title: 'Examinations Lifecycle & Timetables',
          description: 'Scheduled cycles, room invigilation & 4-stage academic approval workflow',
          icon: Award,
          badge: isTrial && exams.length === 0
            ? '0 Exams Scheduled'
            : `${exams.length} Examination Cycles`,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          id: 'marks-register',
          title: 'Marks Register (Theory & Practical)',
          description: 'Multi-component mark entry, pass criteria calculation & verification audit',
          icon: FileSpreadsheet,
          badge: 'Theory / Lab Split',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
        {
          id: 'hall-tickets',
          title: 'Hall Tickets & Student Verification',
          description: 'QR-coded examination admission cards with financial clearance check',
          icon: QrCode,
          badge: 'QR Signed',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        },
        {
          id: 'academic-structure',
          title: 'Class & Section Capacity',
          description: 'School standard grades, PU streams (PCMB/PCMC/Commerce) & room quotas',
          icon: Layers,
          badge: `${academicSections.length} Sections Configured`,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
      ],
    },
    {
      pillarId: 'finance',
      title: 'Finance & Fee Accounts',
      subtitle: 'Tuition fees, flexible heads, counter collections, receipts & consolidated ledger',
      theme: 'emerald',
      cards: [
        {
          id: 'fees',
          title: 'Fee Collection & Demand Heads',
          description: 'Multi-term demand heads, custom fee structures & counter cashier desk',
          icon: DollarSign,
          badge: isTrial && receipts.length === 0
            ? '₹0 Collected'
            : `₹${totalFeeCollected.toLocaleString('en-IN')} Realized`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          id: 'fees',
          title: 'Consolidated Fee Statements',
          description: 'Student-wise cumulative ledger statement, aging dues & receipt log',
          icon: Receipt,
          badge: `${receipts.length} Issued Receipts`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          id: 'fee-review',
          title: 'Fee Snapshots & Board Sign-off',
          description: 'Immutable frozen institutional financial ledger snapshots for Chairman seal',
          icon: FileText,
          badge: 'Audit Compliant',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        },
      ],
    },
    {
      pillarId: 'people',
      title: 'People & Faculty Administration',
      subtitle: 'Teacher profiles, class teachers, staff duty assignments & multi-academic unit principals',
      theme: 'indigo',
      cards: [
        {
          id: 'faculty',
          title: 'Faculty & HR Directory',
          description: 'Teaching & administrative staff profiles, employee IDs & department tags',
          icon: UserCheck,
          badge: isTrial && staffMembers.length === 0
            ? '0 Staff • Ready'
            : `${staffMembers.length} Staff Members`,
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
        {
          id: 'staff-duties',
          title: 'Staff Duties & Class Teachers',
          description: 'Class teacher designations, exam invigilation & lab duty assignments',
          icon: Award,
          badge: `${staffDuties.length} Assigned Duties`,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          id: 'institution-control-centre',
          title: 'Multi-Academic Unit Leadership',
          description: 'Separate Principals for School, PU College & Degree College units',
          icon: ShieldCheck,
          badge: 'Multi-Principal RBAC',
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        },
      ],
    },
    {
      pillarId: 'services',
      title: 'Campus Services & Student Facilities',
      subtitle: 'GPS fleet transport, hostel accommodation & experimental science laboratories',
      theme: 'amber',
      cards: [
        {
          id: 'transport',
          title: 'GPS Bus Fleet & Route Telemetry',
          description: 'Real-time vehicle tracking, student stop manifests & speed telemetry',
          icon: Bus,
          badge: isTrial && transportRoutes.length === 0
            ? '0 Routes'
            : `${transportRoutes.length} Active Routes`,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          id: 'laboratories',
          title: 'Science & Computer Laboratories',
          description: 'Lab workstations, chemical consumables, movement logs & experiments',
          icon: FlaskConical,
          badge: `${laboratories.length} Laboratories`,
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        },
        {
          id: 'institution-control-centre',
          title: 'Hostel & Boarding Accommodation',
          description: 'Hostel room allocations, warden supervision & dining mess passes',
          icon: Building2,
          badge: 'Cauvery & Sharavathi',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        },
      ],
    },
    {
      pillarId: 'communication',
      title: 'Institutional Communication',
      subtitle: 'Official circulars, notice boards, SMS gateway & parent WhatsApp delivery alerts',
      theme: 'teal',
      cards: [
        {
          id: 'communication',
          title: 'Notice Board & Official Circulars',
          description: 'Broadcast notices, academic circulars & holiday notifications to parents',
          icon: MessageSquare,
          badge: 'Broadcast Active',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        },
        {
          id: 'notice-board',
          title: 'Published Examination Results Notice',
          description: 'Verified merit lists, subject toppers & board sealed score registers',
          icon: Award,
          badge: 'Public Notice Board',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Overview Intro Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Operational Command Centre
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {isTrial ? 'Pilot Institution Operations Workspace' : 'Campus Operations & Institutional Modules'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any module card below for instant navigation. Clean, noise-free presentation for all staff roles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenCreateStudent && (
            <button
              onClick={onOpenCreateStudent}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Add Student
            </button>
          )}
          {onOpenCollectFee && (
            <button
              onClick={onOpenCollectFee}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              Collect Fee
            </button>
          )}
        </div>
      </div>

      {/* Today's Quick Operations Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Today's Quick Operations & Shortcuts
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">1-Click Fast Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            {
              label: 'Mark Attendance',
              desc: 'Roll call & Biometric',
              tab: 'attendance',
              color: 'hover:border-blue-300 hover:bg-blue-50/50',
              iconColor: 'text-blue-600 bg-blue-50',
              icon: CalendarCheck,
            },
            {
              label: 'Collect Fee',
              desc: 'Thermal / A4 receipts',
              tab: 'fees',
              color: 'hover:border-emerald-300 hover:bg-emerald-50/50',
              iconColor: 'text-emerald-600 bg-emerald-50',
              icon: DollarSign,
            },
            {
              label: 'Weekly Timetable',
              desc: '6-Day schedule & labs',
              tab: 'timetable',
              color: 'hover:border-amber-300 hover:bg-amber-50/50',
              iconColor: 'text-amber-600 bg-amber-50',
              icon: Clock,
            },
            {
              label: 'Marks Register',
              desc: 'Theory + practical entry',
              tab: 'marks-register',
              color: 'hover:border-purple-300 hover:bg-purple-50/50',
              iconColor: 'text-purple-600 bg-purple-50',
              icon: FileSpreadsheet,
            },
            {
              label: 'Hall Tickets',
              desc: 'QR admit cards & verify',
              tab: 'hall-tickets',
              color: 'hover:border-indigo-300 hover:bg-indigo-50/50',
              iconColor: 'text-indigo-600 bg-indigo-50',
              icon: QrCode,
            },
            {
              label: 'Result Board',
              desc: 'Publish ranks & notices',
              tab: 'notice-board',
              color: 'hover:border-rose-300 hover:bg-rose-50/50',
              iconColor: 'text-rose-600 bg-rose-50',
              icon: Award,
            },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.tab}
                type="button"
                onClick={() => onNavigateTab(action.tab)}
                className={`p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 text-left transition-all duration-150 cursor-pointer group shadow-2xs ${action.color}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${action.iconColor}`}>
                  <ActionIcon className="w-4 h-4" />
                </div>
                <p className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                  {action.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5 Pillars of Stock Cards */}
      {pillars.map((pillar) => (
        <div key={pillar.pillarId} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-500">{pillar.subtitle}</p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {pillar.cards.length} Modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {pillar.cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={`${card.id}-${idx}`}
                  onClick={() => onNavigateTab(card.id)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:bg-blue-50 group-hover:border-blue-200 flex items-center justify-center text-slate-700 group-hover:text-blue-600 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
