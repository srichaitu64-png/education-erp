import React from 'react';
import {
  Shield, Users, Award, DollarSign, Bus, BookOpen, Clock, Calendar, CalendarCheck,
  CheckCircle2, AlertTriangle, ArrowRight, FileText, Lock, PlusCircle,
  HelpCircle, UserCheck, Activity, BarChart3, TrendingUp, Layers,
  Phone, AlertCircle, Building2, Flame, Wrench, RefreshCw, Sparkles, GraduationCap,
  CreditCard, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { useDemoStore } from '../../../store/demoStore';
import { VibrantStatCard } from '../../../components/ui/VibrantStatCard';

interface RoleWorkspaceDispatcherProps {
  currentRole: string;
  onNavigateTab: (tabId: string) => void;
}

export const RoleWorkspaceDispatcher: React.FC<RoleWorkspaceDispatcherProps> = ({
  currentRole,
  onNavigateTab
}) => {
  const { academicSections, staffDuties, exams, feeSnapshots } = useDemoStore();

  // Unified Vibrant Enterprise Token Classes
  const cardCls = "bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4 text-slate-100 backdrop-blur-sm";
  const headerCls = "bg-gradient-to-r from-[#172B4D] via-slate-900 to-[#172B4D] rounded-2xl p-6 text-white border border-slate-700/80 shadow-2xl";

  switch (currentRole) {
    // =========================================================================
    // 1. CHAIRMAN / DIRECTOR
    // =========================================================================
    case 'CHAIRMAN_DIRECTOR':
    case 'DIRECTOR':
    case 'MANAGING_DIRECTOR':
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  Executive Governance & Board Overview
                </span>
                <h1 className="text-2xl font-black mt-1">Chairman & Director Command Center</h1>
                <p className="text-xs text-slate-300">
                  Institution-Wide Performance • Multi-Campus Financial Health • Executive Approvals
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('fee-review')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  Review Fee Snapshots ({feeSnapshots.filter((s: any) => s.status === 'SUBMITTED').length} Pending)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <VibrantStatCard
                title="Total Enrolled"
                numericValue={3420}
                icon={Users}
                theme="blue"
                trend="98.2% Cap."
              />
              <VibrantStatCard
                title="Fee Realization"
                numericValue={88.4}
                suffix="%"
                decimalPlaces={1}
                icon={DollarSign}
                theme="emerald"
                trend="₹4.82 Cr Rec."
              />
              <VibrantStatCard
                title="Academic Pass"
                numericValue={96.8}
                suffix="%"
                decimalPlaces={1}
                icon={Award}
                theme="purple"
                trend="State Rank #4"
              />
              <VibrantStatCard
                title="Faculty Strength"
                numericValue={164}
                icon={UserCheck}
                theme="teal"
                trend="94.5% Pres."
              />
              <VibrantStatCard
                title="Active Bus Fleet"
                value="18 / 18"
                icon={Bus}
                theme="indigo"
                trend="Live GPS"
              />
              <VibrantStatCard
                title="Hostel Occupancy"
                value="284 / 300"
                icon={Building2}
                theme="rose"
                trend="94.6% Full"
              />
              <VibrantStatCard
                title="Pending Approvals"
                numericValue={3}
                icon={Shield}
                theme="amber"
                trend="Sign-off Req."
                onClick={() => onNavigateTab('fee-review')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Executive Approval Desk
              </h3>
              <p className="text-xs text-slate-500">Items requiring Chairman / Board sign-off</p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <strong className="text-amber-900 block">Frozen Fee Snapshot (SNP-2026-2027-01)</strong>
                    <span className="text-amber-700 text-[11px]">Submitted by Accounts • 200 Students • ₹1.14 Cr</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('fee-review')}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold"
                  >
                    Review
                  </button>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <strong className="text-blue-900 block">Term 1 Final Examination Publication</strong>
                    <span className="text-blue-700 text-[11px]">Verified by Exam Controller • Ready for Board Seal</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('notice-board')}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Campus Revenue vs Budget
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Tuition Collections</span>
                    <span className="font-bold text-slate-900">₹3.85 Cr / ₹4.20 Cr</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91.6%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Hostel & Mess Operations</span>
                    <span className="font-bold text-slate-900">₹68.4L / ₹75.0L</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '91.2%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Transport Operations</span>
                    <span className="font-bold text-slate-900">₹28.6L / ₹32.0L</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '89.3%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                Key Academic Milestones
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">NEET Foundation Mock Test 3</div>
                  <div className="text-[11px] text-slate-500">I PUC PCMB Batch • Average 580 / 720</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">Karnataka State Pre-University Board</div>
                  <div className="text-[11px] text-slate-500">Affiliation renewal audit scheduled Nov 18</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // =========================================================================
    // 2. PRINCIPAL
    // =========================================================================
    case 'PRINCIPAL':
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full">
                  Academic Command & Institutional Leadership
                </span>
                <h1 className="text-2xl font-black mt-1">Principal Executive Workspace</h1>
                <p className="text-xs text-slate-300">
                  Academics • Section Strengths • Faculty Roster • Examination Approvals
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('academic-structure')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  Manage Sections ({academicSections.length})
                </button>
                <button
                  onClick={() => onNavigateTab('staff-duties')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  Assign Staff Duties
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <VibrantStatCard
                title="Configured Sections"
                numericValue={academicSections.length}
                icon={BookOpen}
                theme="blue"
                trend="Class 6 & I PUC"
                onClick={() => onNavigateTab('academic-structure')}
              />
              <VibrantStatCard
                title="Staff Duties Assigned"
                numericValue={staffDuties.length}
                icon={UserCheck}
                theme="teal"
                trend="Active Roster"
                onClick={() => onNavigateTab('staff-duties')}
              />
              <VibrantStatCard
                title="Student Attendance"
                numericValue={96.4}
                suffix="%"
                decimalPlaces={1}
                icon={CalendarCheck}
                theme="emerald"
                trend="Morning Roll"
                onClick={() => onNavigateTab('attendance')}
              />
              <VibrantStatCard
                title="Pending Approvals"
                numericValue={2}
                icon={Award}
                theme="amber"
                trend="Results Verify"
                onClick={() => onNavigateTab('examinations')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Academic Section Capacities
                </h3>
                <button
                  onClick={() => onNavigateTab('academic-structure')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Manage All Sections →
                </button>
              </div>
              <div className="space-y-2 text-xs">
                {academicSections.slice(0, 5).map(sec => (
                  <div key={sec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">{sec.class_name} - Section {sec.section_code}</strong>
                      <span className="text-slate-500 text-[11px]">Room {sec.room_number} • Class Teacher: {sec.class_teacher_name || 'Unassigned'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">{sec.enrolled_count} / {sec.max_capacity}</span>
                      <span className="text-[10px] block text-slate-400">{sec.max_capacity - sec.enrolled_count} seats left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Examinations Requiring Principal Seal
              </h3>
              <div className="space-y-3 text-xs">
                {exams.slice(0, 3).map(exam => (
                  <div key={exam.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">{exam.title}</strong>
                      <span className="text-slate-500 text-[11px]">{exam.class_name} • Status: {exam.status}</span>
                    </div>
                    <button
                      onClick={() => onNavigateTab('notice-board')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                    >
                      Audit & Seal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    // =========================================================================
    // 3. SUBJECT TEACHER / LECTURER
    // =========================================================================
    case 'TEACHER':
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  Faculty Classroom Desk
                </span>
                <h1 className="text-2xl font-black mt-1">Faculty Academic Workspace</h1>
                <p className="text-xs text-slate-300">
                  Welcome, Prof. S. Ramesh (Senior Lecturer - Physics) • Assigned Sections: I PUC PCMB-A & B
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('marks-register')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  Enter Marks Register
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <VibrantStatCard
                title="Assigned Classes"
                value="2 Sections"
                icon={BookOpen}
                theme="blue"
                trend="I PUC (A & B)"
              />
              <VibrantStatCard
                title="Total Students"
                numericValue={118}
                icon={Users}
                theme="teal"
                trend="Under Instruction"
                onClick={() => onNavigateTab('students')}
              />
              <VibrantStatCard
                title="Today's Lectures"
                value="3 Sessions"
                icon={Clock}
                theme="emerald"
                trend="Physics Lab Sched."
                onClick={() => onNavigateTab('timetable')}
              />
              <VibrantStatCard
                title="Pending Marks Entry"
                value="1 Assessment"
                icon={Award}
                theme="amber"
                trend="Half-Yearly Physics"
                onClick={() => onNavigateTab('marks-register')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Today's Lecture Schedule
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-900 block">Period 2 (09:45 AM - 10:30 AM)</span>
                    <span className="text-blue-700">I PUC PCMB - Section A • Room 201 • Physics: Ray Optics</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-800 font-bold text-[10px]">Upcoming</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Period 4 (11:30 AM - 12:15 PM)</span>
                    <span className="text-slate-600">I PUC PCMB - Section B • Room 202 • Wave Optics Theory</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">Scheduled</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Period 6 & 7 (02:00 PM - 03:30 PM)</span>
                    <span className="text-slate-600">Physics Lab • Optics & Prisms Practical Session</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">Practical</span>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Multi-Component Marks Entry Actions
              </h3>
              <p className="text-xs text-slate-500">
                Direct entry for Theory (70/80), Practical (20), and Internal (10/20) marks.
              </p>
              <div className="p-4 bg-[#F6F8FC] rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block">Half-Yearly Examination - Physics</strong>
                    <span className="text-slate-500">I PUC PCMB - Section A (60 Students)</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Draft</span>
                </div>
                <button
                  onClick={() => onNavigateTab('marks-register')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  Open Excel-Like Marks Register →
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    // =========================================================================
    // 4. COMPUTER OPERATOR
    // =========================================================================
    case 'COMPUTER_OPERATOR':
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-full">
                  Central Examination & Academic Data Entry Desk
                </span>
                <h1 className="text-2xl font-black mt-1">Computer Operator Workspace</h1>
                <p className="text-xs text-slate-300">
                  Data Entry Operator Desk • Fast Keyboard Navigation • Draft Auto-Save • No Approval Privileges
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('marks-register')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  Open Assigned Marks Register
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <VibrantStatCard
                title="Assigned Queues"
                value="4 Registers"
                icon={FileSpreadsheet}
                theme="blue"
                trend="Class 6 (A-D)"
                onClick={() => onNavigateTab('marks-register')}
              />
              <VibrantStatCard
                title="Saved Drafts"
                numericValue={128}
                icon={CheckCircle2}
                theme="emerald"
                trend="Auto-saved to Cloud"
                onClick={() => onNavigateTab('marks-register')}
              />
              <VibrantStatCard
                title="Pending Entries"
                numericValue={32}
                icon={AlertTriangle}
                theme="amber"
                trend="Absentees to Verify"
                onClick={() => onNavigateTab('marks-register')}
              />
              <VibrantStatCard
                title="Approval Rights"
                value="LOCKED"
                icon={Lock}
                theme="rose"
                trend="Principal Protected"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Assigned Data Entry Batches
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block">Class 6 - Section C: Mathematics</strong>
                    <span className="text-slate-500">40 Students • 40 Theory / 0 Practical / 20 Internal</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('marks-register')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                  >
                    Enter Marks
                  </button>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block">Class 6 - Section D: Science</strong>
                    <span className="text-slate-500">38 Students • Paper OMR Sheet Transcription</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('marks-register')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                  >
                    Enter Marks
                  </button>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                Data Entry Operational Guidelines
              </h3>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Preserve Absentee & Withheld Codes
                </p>
                <p>
                  Do NOT enter '0' for absent students. Always use the code <strong>'A'</strong> for Absent and <strong>'W'</strong> for Withheld. The system treats these as distinct non-zero academic exceptions.
                </p>
                <p className="text-[11px] text-amber-800">
                  All submissions are attributed with your operator badge and require Controller/Principal verification before publishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    // =========================================================================
    // 5. ACCOUNTANT
    // =========================================================================
    case 'ACCOUNTANT':
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  Institutional Cashier & Ledger Desk
                </span>
                <h1 className="text-2xl font-black mt-1">Senior Accountant Workspace</h1>
                <p className="text-xs text-slate-300">
                  Daily Counter Collections • Fee Heads Breakdown • Consolidated Ledger Freeze
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('fees')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  Collect Fees & Print Receipts
                </button>
                <button
                  onClick={() => onNavigateTab('fee-review')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  Consolidated Ledger (200 Students)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <VibrantStatCard
                title="Counter Collections"
                numericValue={184500}
                prefix="₹"
                icon={DollarSign}
                theme="emerald"
                trend="24 Receipts Today"
                onClick={() => onNavigateTab('fees')}
              />
              <VibrantStatCard
                title="Online Gateways"
                numericValue={342000}
                prefix="₹"
                icon={CreditCard}
                theme="blue"
                trend="Razorpay/UPI Settled"
                onClick={() => onNavigateTab('fees')}
              />
              <VibrantStatCard
                title="Aging Dues (>30 Days)"
                value="₹14.8 Lakh"
                icon={AlertCircle}
                theme="rose"
                trend="38 Notices Sent"
                onClick={() => onNavigateTab('fee-review')}
              />
              <VibrantStatCard
                title="Audited Snapshots"
                numericValue={feeSnapshots.length}
                icon={ShieldCheck}
                theme="purple"
                trend="Frozen Ledgers"
                onClick={() => onNavigateTab('fee-review')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Fee Heads Reconciliation
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">Tuition Fee</span>
                  <span className="font-mono font-bold text-slate-900">₹68,50,000</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">Hostel & Mess Fee</span>
                  <span className="font-mono font-bold text-slate-900">₹32,40,000</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">Lab & Computer Fee</span>
                  <span className="font-mono font-bold text-slate-900">₹14,20,000</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-800">Transport Fee</span>
                  <span className="font-mono font-bold text-slate-900">₹18,90,000</span>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Consolidated Ledger Snapshot Actions
              </h3>
              <p className="text-xs text-slate-500">
                Compile a 200-student ledger freeze and submit to Chairman for official signoff.
              </p>
              <button
                onClick={() => onNavigateTab('fee-review')}
                className="w-full py-3 bg-[#172B4D] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Open Chairman Review & Snapshot Ledger →
              </button>
            </div>
          </div>
        </div>
      );

    // =========================================================================
    // 6. PARENT PORTAL
    // =========================================================================
    case 'PARENT':
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  Parent Access Portal
                </span>
                <h1 className="text-2xl font-black mt-1">Parent Guardian Dashboard</h1>
                <p className="text-xs text-slate-300">
                  Linked Ward: <strong>Rahul Kumar</strong> • Class 6 - Section A • Roll #14 • Admission #AK-2026-1001
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('notice-board')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  View Progress Card
                </button>
                <button
                  onClick={() => onNavigateTab('fees')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  Pay Term Dues
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <VibrantStatCard
                title="Attendance Rate"
                numericValue={94.5}
                suffix="%"
                decimalPlaces={1}
                icon={CalendarCheck}
                theme="emerald"
                trend="142/150 Days Pres."
                onClick={() => onNavigateTab('attendance')}
              />
              <VibrantStatCard
                title="Term 1 Performance"
                value="A+ (89.0%)"
                icon={Award}
                theme="blue"
                trend="Rank #2 Section A"
                onClick={() => onNavigateTab('notice-board')}
              />
              <VibrantStatCard
                title="Pending Fee Dues"
                numericValue={4500}
                prefix="₹"
                icon={DollarSign}
                theme="amber"
                trend="Due in 11 Days"
                onClick={() => onNavigateTab('fees')}
              />
              <VibrantStatCard
                title="Bus Live GPS"
                value="Route #4"
                icon={Bus}
                theme="teal"
                trend="Driver On Time"
                onClick={() => onNavigateTab('transport')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Recent Daily Activity & Roll-Call
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <strong className="text-emerald-950 block">Today's Attendance: PRESENT</strong>
                    <span className="text-emerald-800 text-[11px]">Morning biometric marked at 08:24 AM</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 block">Science Project Submitted</strong>
                    <span className="text-slate-500 text-[11px]">Topic: Solar Energy • Grade: A+</span>
                  </div>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Fee Payment Status & Receipts
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block">Term 1 Tuition & Admission (Receipt #REC-2026-0042)</strong>
                    <span className="text-slate-500 text-[11px]">₹35,000 paid via UPI on 2026-06-15</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('fees')}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold text-xs"
                  >
                    Download
                  </button>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <strong className="text-amber-900 block">Term 2 Tuition (Due)</strong>
                    <span className="text-amber-700 text-[11px]">₹4,500 due by 15 November 2026</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('fees')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
                  >
                    Pay ₹4,500
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // =========================================================================
    // 7. STUDENT PORTAL
    // =========================================================================
    case 'STUDENT':
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full">
                  Student Learning Desk
                </span>
                <h1 className="text-2xl font-black mt-1">Student Academic Portal</h1>
                <p className="text-xs text-slate-300">
                  Welcome, Rahul Kumar • Class 6 - Section A • Room 101 • Class Teacher: Mrs. Sunita Sharma
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('hall-tickets')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Download Hall Ticket
                </button>
                <button
                  onClick={() => onNavigateTab('notice-board')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  View Term 1 Result Card
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <VibrantStatCard
                title="My Attendance"
                numericValue={94.5}
                suffix="%"
                decimalPlaces={1}
                icon={CalendarCheck}
                theme="emerald"
                trend="Eligible for Exams"
                onClick={() => onNavigateTab('attendance')}
              />
              <VibrantStatCard
                title="Latest Term Grade"
                value="A+ (89%)"
                icon={Award}
                theme="blue"
                trend="Rank #2 Section"
                onClick={() => onNavigateTab('notice-board')}
              />
              <VibrantStatCard
                title="Next Examination"
                value="Nov 12"
                icon={Clock}
                theme="purple"
                trend="Maths Paper I"
                onClick={() => onNavigateTab('examinations')}
              />
              <VibrantStatCard
                title="Library Books"
                value="2 Issued"
                icon={BookOpen}
                theme="teal"
                trend="Return Nov 18"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Today's Class Timetable
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span>Period 1 (09:00 - 09:45 AM)</span>
                  <strong className="text-slate-900">Mathematics (Mr. Anand K.)</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span>Period 2 (09:45 - 10:30 AM)</span>
                  <strong className="text-slate-900">General Science (Mrs. Sunita S.)</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span>Period 3 (10:45 - 11:30 AM)</span>
                  <strong className="text-slate-900">Social Studies (Mr. Rajesh V.)</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span>Period 4 (11:30 - 12:15 PM)</span>
                  <strong className="text-slate-900">English Language (Ms. Priya M.)</strong>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Examinations & Hall Ticket
              </h3>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2 text-xs text-blue-900">
                <div className="font-bold">Term 1 Final Examination Hall Ticket Ready</div>
                <p className="text-[11px] text-blue-800">
                  Seat Number: <strong>A-14</strong> • Hall: <strong>Main Auditorium (Block B)</strong> • Verification QR generated.
                </p>
                <button
                  onClick={() => onNavigateTab('hall-tickets')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  View & Print Official Hall Ticket →
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    // =========================================================================
    // 8. DEFAULT FALLBACK FOR OTHER 13 ROLES (Tailored with role badge & controls)
    // =========================================================================
    default:
      return (
        <div className="space-y-6 max-w-7xl animate-in fade-in">
          <div className={headerCls}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full">
                  Institutional Role Workspace
                </span>
                <h1 className="text-2xl font-black mt-1">{currentRole.replace(/_/g, ' ')} Portal</h1>
                <p className="text-xs text-slate-300">
                  Role-specific workspace tailored for {currentRole.toLowerCase().replace(/_/g, ' ')} operational tasks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Security Tier</span>
                <p className="text-lg font-black text-white">{currentRole}</p>
                <span className="text-[10px] text-blue-400">RBAC Enforced</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Scope</span>
                <p className="text-lg font-black text-emerald-400">Active</p>
                <span className="text-[10px] text-slate-400">Akshara Campus</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Duty Status</span>
                <p className="text-lg font-black text-white">On Duty</p>
                <span className="text-[10px] text-emerald-400">Authenticated</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">System Health</span>
                <p className="text-lg font-black text-emerald-400">100%</p>
                <span className="text-[10px] text-slate-400">Zero errors</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Module Access Privileges
              </h3>
              <p className="text-xs text-slate-500">
                You are logged in with the <strong>{currentRole}</strong> credential. Your left sidebar shows only the modules authorized for this role.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                To switch roles and test other staff desks (Principal, Accountant, Teacher, Student, Chairman), use the <strong>Role Selector</strong> at the top right of the navigation bar.
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Quick Navigation Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onNavigateTab('academic-structure')}
                  className="p-3 bg-[#F6F8FC] hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-bold text-slate-800"
                >
                  Academic Sections →
                </button>
                <button
                  onClick={() => onNavigateTab('marks-register')}
                  className="p-3 bg-[#F6F8FC] hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-bold text-slate-800"
                >
                  Marks Register →
                </button>
                <button
                  onClick={() => onNavigateTab('hall-tickets')}
                  className="p-3 bg-[#F6F8FC] hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-bold text-slate-800"
                >
                  Hall Tickets →
                </button>
                <button
                  onClick={() => onNavigateTab('fees')}
                  className="p-3 bg-[#F6F8FC] hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-bold text-slate-800"
                >
                  Fee Management →
                </button>
              </div>
            </div>
          </div>
        </div>
      );
  }
};
