import React from 'react';
import {
  Shield, Users, Award, DollarSign, Bus, BookOpen, Clock, Calendar,
  CheckCircle2, AlertTriangle, ArrowRight, FileText, Lock, PlusCircle,
  HelpCircle, UserCheck, Activity, BarChart3, TrendingUp, Layers,
  Phone, AlertCircle, Building2, Flame, Wrench, RefreshCw
} from 'lucide-react';
import { useDemoStore } from '../../../store/demoStore';

interface RoleWorkspaceDispatcherProps {
  currentRole: string;
  onNavigateTab: (tabId: string) => void;
}

export const RoleWorkspaceDispatcher: React.FC<RoleWorkspaceDispatcherProps> = ({
  currentRole,
  onNavigateTab
}) => {
  const { academicSections, staffDuties, exams, feeSnapshots } = useDemoStore();

  // Unified Design Token Classes
  const cardCls = "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4";
  const headerCls = "bg-[#172B4D] rounded-2xl p-6 text-white border border-slate-700 shadow-md";

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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Enrolled</span>
                <p className="text-lg font-black text-white">3,420</p>
                <span className="text-[10px] text-emerald-400">98.2% capacity</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fee Realization</span>
                <p className="text-lg font-black text-emerald-400">88.4%</p>
                <span className="text-[10px] text-slate-400">₹4.82 Cr collected</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Academic Pass %</span>
                <p className="text-lg font-black text-blue-400">96.8%</p>
                <span className="text-[10px] text-slate-400">State rank #4</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Faculty Strength</span>
                <p className="text-lg font-black text-white">164</p>
                <span className="text-[10px] text-emerald-400">94.5% present today</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Active Bus Fleet</span>
                <p className="text-lg font-black text-white">18 / 18</p>
                <span className="text-[10px] text-emerald-400">Live GPS tracking</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Hostel Occupancy</span>
                <p className="text-lg font-black text-white">284 / 300</p>
                <span className="text-[10px] text-slate-400">94.6% beds full</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Approvals</span>
                <p className="text-lg font-black text-amber-400">3</p>
                <span className="text-[10px] text-amber-400">Requires signoff</span>
              </div>
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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Configured Sections</span>
                <p className="text-xl font-black text-white">{academicSections.length}</p>
                <span className="text-[10px] text-blue-400">Class 6 (A-D), I PUC (A-F)</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Staff Duties Assigned</span>
                <p className="text-xl font-black text-emerald-400">{staffDuties.length}</p>
                <span className="text-[10px] text-slate-400">Class teachers & operators</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Student Attendance</span>
                <p className="text-xl font-black text-emerald-400">96.4%</p>
                <span className="text-[10px] text-emerald-400">Today's morning roll</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Approvals</span>
                <p className="text-xl font-black text-amber-400">2</p>
                <span className="text-[10px] text-amber-400">Exam results verification</span>
              </div>
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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Classes</span>
                <p className="text-xl font-black text-white">2 Sections</p>
                <span className="text-[10px] text-blue-400">I PUC PCMB (A & B)</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Students</span>
                <p className="text-xl font-black text-white">118</p>
                <span className="text-[10px] text-slate-400">Under instruction</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Today's Lectures</span>
                <p className="text-xl font-black text-emerald-400">3 Sessions</p>
                <span className="text-[10px] text-emerald-400">Physics Lab scheduled</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Marks Entry</span>
                <p className="text-xl font-black text-amber-400">1 Assessment</p>
                <span className="text-[10px] text-amber-400">Half-Yearly Physics</span>
              </div>
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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Queues</span>
                <p className="text-xl font-black text-white">4 Registers</p>
                <span className="text-[10px] text-blue-400">Class 6 (A, B, C, D)</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Saved Drafts</span>
                <p className="text-xl font-black text-emerald-400">128 Records</p>
                <span className="text-[10px] text-emerald-400">Auto-saved to cloud</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Entries</span>
                <p className="text-xl font-black text-amber-400">32 Missing</p>
                <span className="text-[10px] text-amber-400">Absentees to verify</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Approval Rights</span>
                <p className="text-xl font-black text-rose-400">LOCKED</p>
                <span className="text-[10px] text-slate-400">Requires Teacher/Principal</span>
              </div>
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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Today's Counter Cash</span>
                <p className="text-xl font-black text-emerald-400">₹1,84,500</p>
                <span className="text-[10px] text-emerald-400">24 Receipts issued</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Online Payments</span>
                <p className="text-xl font-black text-blue-400">₹3,42,000</p>
                <span className="text-[10px] text-slate-400">Razorpay / UPI settled</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Aging Dues (&gt;30 Days)</span>
                <p className="text-xl font-black text-rose-400">₹14.8L</p>
                <span className="text-[10px] text-rose-400">38 Student notices sent</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Chairman Snapshots</span>
                <p className="text-xl font-black text-white">{feeSnapshots.length}</p>
                <span className="text-[10px] text-emerald-400">Audited & frozen</span>
              </div>
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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Attendance Rate</span>
                <p className="text-xl font-black text-emerald-400">94.5%</p>
                <span className="text-[10px] text-emerald-400">Present in 142/150 days</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Term 1 Grade</span>
                <p className="text-xl font-black text-blue-400">A+ (89.0%)</p>
                <span className="text-[10px] text-blue-400">Rank #2 in Section A</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Fee Dues</span>
                <p className="text-xl font-black text-amber-400">₹4,500</p>
                <span className="text-[10px] text-amber-400">Term 2 Labs due Nov 15</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bus Live Tracking</span>
                <p className="text-xl font-black text-emerald-400">Route #4</p>
                <span className="text-[10px] text-slate-400">Driver: Manjunath (On Time)</span>
              </div>
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
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">My Attendance</span>
                <p className="text-xl font-black text-emerald-400">94.5%</p>
                <span className="text-[10px] text-emerald-400">Eligible for Exams (&gt;75%)</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Latest Term Grade</span>
                <p className="text-xl font-black text-blue-400">A+ (89%)</p>
                <span className="text-[10px] text-blue-400">Rank #2 in Section</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Next Examination</span>
                <p className="text-xl font-black text-white">Nov 12</p>
                <span className="text-[10px] text-slate-400">Mathematics Paper I</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Library Books</span>
                <p className="text-xl font-black text-white">2 Issued</p>
                <span className="text-[10px] text-slate-400">Return due Nov 18</span>
              </div>
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
