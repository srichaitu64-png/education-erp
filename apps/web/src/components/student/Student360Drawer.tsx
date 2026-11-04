import React, { useState } from 'react';
import {
  X, User, GraduationCap, CalendarCheck, CreditCard, Award, QrCode,
  Phone, CheckCircle2, ArrowRight, ShieldCheck, DollarSign, FileCheck,
  FileSpreadsheet, ExternalLink, AlertCircle, Building2, BookOpen
} from 'lucide-react';
import { DemoStudent, UserRoleType, useDemoStore } from '../../store/demoStore';

interface Student360DrawerProps {
  student: DemoStudent | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRoleType;
  onNavigateTab: (tabId: string) => void;
  onSelectStudentForProgress?: (studentId: string) => void;
  onSelectStudentForFee?: (studentId: string) => void;
}

export const Student360Drawer: React.FC<Student360DrawerProps> = ({
  student,
  isOpen,
  onClose,
  currentRole,
  onNavigateTab,
  onSelectStudentForProgress,
  onSelectStudentForFee,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'ACADEMICS' | 'FEES' | 'ATTENDANCE'>('OVERVIEW');
  const { exams } = useDemoStore();

  if (!isOpen || !student) return null;

  // Strict Parent and Student Privacy Shield
  const isParent = currentRole === 'PARENT';
  const isStudent = currentRole === 'STUDENT';
  const isLinkedChild = student.id === 'st-rahul' || student.admission_number === 'ADM-2026-001';

  if ((isParent || isStudent) && !isLinkedChild) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/50 rounded-3xl p-6 text-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold">Privacy Shield: Access Restricted</h3>
            <p className="text-xs text-slate-400">
              Under EducationOS student data governance rules, you may only inspect records belonging to your linked family account.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Close & Return to Authorized Portal
          </button>
        </div>
      </div>
    );
  }

  // Cross-Tab Drilldowns
  const handleJumpToFee = () => {
    if (onSelectStudentForFee) onSelectStudentForFee(student.id);
    onNavigateTab('fees');
    onClose();
  };

  const handleJumpToMarks = () => {
    onNavigateTab('marks-register');
    onClose();
  };

  const handleJumpToHallTicket = () => {
    onNavigateTab('hall-tickets');
    onClose();
  };

  const handleJumpToProgressCard = () => {
    if (onSelectStudentForProgress) onSelectStudentForProgress(student.id);
    onNavigateTab('progress-cards');
    onClose();
  };

  const handleJumpToAttendance = () => {
    onNavigateTab('attendance');
    onClose();
  };

  // Mock computed ledger based on student balance
  const annualFee = student.institution_level === 'PU College' ? 84000 : 65000;
  const paidAmount = annualFee - student.fee_balance;
  const paymentPct = Math.round((paidAmount / annualFee) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-xl shadow-inner">
              {student.first_name[0]}{student.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{student.first_name} {student.last_name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  student.status === 'ACTIVE'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-red-950/80 text-red-400 border-red-800/60'
                }`}>
                  {student.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="font-mono text-indigo-300 font-semibold">{student.admission_number}</span>
                <span>•</span>
                <span>Roll: #{student.roll_number}</span>
                <span>•</span>
                <span className="text-teal-400 font-medium">{student.institution_level} — {student.class_name} ({student.section_or_stream})</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Navigation Tabs inside Drawer */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Holistic 360° Overview
          </button>
          <button
            onClick={() => setActiveSubTab('ACADEMICS')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'ACADEMICS'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Marks & Exam Register
          </button>
          <button
            onClick={() => setActiveSubTab('FEES')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'FEES'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Financial Ledger & Fees
          </button>
          <button
            onClick={() => setActiveSubTab('ATTENDANCE')}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'ATTENDANCE'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Attendance Roll
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          
          {/* 1. Holistic Overview SubTab */}
          {activeSubTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Attendance Rate</span>
                  <p className="text-xl font-mono font-black text-emerald-400 mt-1">{student.attendance_pct}%</p>
                  <span className="text-[10px] text-slate-500">Target $\ge 85\%$ met</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Outstanding Fees</span>
                  <p className={`text-xl font-mono font-black mt-1 ${
                    student.fee_balance > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    ₹{student.fee_balance.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-500">{paymentPct}% annual paid</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Academic Grade</span>
                  <p className="text-xl font-mono font-black text-indigo-400 mt-1">A+ (92.4%)</p>
                  <span className="text-[10px] text-slate-500">Batch Rank #3</span>
                </div>
              </div>

              {/* Cross-Module Quick Jump Actions (Role Synchronized) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                  Cross-Module Drilldown Shortcuts
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Jump directly to specific operational workspaces with this student's context automatically preserved:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleJumpToFee}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-600/50 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-white block">Fee Collection Counter</span>
                        <span className="text-[10px] text-slate-400">Issue receipt for ₹{student.fee_balance}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={handleJumpToMarks}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-600/50 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="font-bold text-white block">Marks Register</span>
                        <span className="text-[10px] text-slate-400">Theory & practical evaluation</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={handleJumpToHallTicket}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-600/50 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="font-bold text-white block">Hall Ticket & QR Code</span>
                        <span className="text-[10px] text-slate-400">Verify admission seating</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={handleJumpToProgressCard}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-600/50 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-teal-400" />
                      <div>
                        <span className="font-bold text-white block">Student Progress Card</span>
                        <span className="text-[10px] text-slate-400">Generate printable term card</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Family & Contact Details */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Verified Parent / Guardian Record
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Primary Guardian</span>
                    <span className="font-bold text-white mt-0.5 block">{student.guardian_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Emergency Phone</span>
                    <span className="font-mono text-teal-400 font-bold mt-0.5 block">{student.guardian_phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Enrolled Section</span>
                    <span className="text-slate-300 mt-0.5 block">{student.class_name} — Section {student.section_or_stream}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Academic Year</span>
                    <span className="text-slate-300 mt-0.5 block">2026-2027 (Current)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. Marks & Exam Register SubTab */}
          {activeSubTab === 'ACADEMICS' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Continuous Evaluation</span>
                  <h4 className="text-sm font-bold text-white">Term 1 Assessment Scores</h4>
                </div>
                <button
                  onClick={handleJumpToProgressCard}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>View Full Progress Card</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="p-3">Subject</th>
                      <th className="p-3">Theory (80)</th>
                      <th className="p-3">Practical / CIE (20)</th>
                      <th className="p-3">Total (100)</th>
                      <th className="p-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-mono">
                    <tr>
                      <td className="p-3 font-sans font-bold text-white">Mathematics / Biology</td>
                      <td className="p-3 text-slate-300">76 / 80</td>
                      <td className="p-3 text-slate-300">19 / 20</td>
                      <td className="p-3 text-emerald-400 font-bold">95</td>
                      <td className="p-3 font-sans font-bold text-emerald-400">A+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-bold text-white">Physics</td>
                      <td className="p-3 text-slate-300">71 / 80</td>
                      <td className="p-3 text-slate-300">18 / 20</td>
                      <td className="p-3 text-emerald-400 font-bold">89</td>
                      <td className="p-3 font-sans font-bold text-emerald-400">A</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-bold text-white">Chemistry</td>
                      <td className="p-3 text-slate-300">74 / 80</td>
                      <td className="p-3 text-slate-300">19 / 20</td>
                      <td className="p-3 text-emerald-400 font-bold">93</td>
                      <td className="p-3 font-sans font-bold text-emerald-400">A+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Financial Ledger SubTab */}
          {activeSubTab === 'FEES' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consolidated Annual Dues</span>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">
                    ₹{student.fee_balance.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">remaining</span>
                  </p>
                </div>
                <button
                  onClick={handleJumpToFee}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Collect Payment Now</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Configured Head-Wise Allocation
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-300 font-medium">Annual Tuition Fee</span>
                    <span className="font-mono text-white">₹50,000 (Paid: ₹40,000)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-300 font-medium">Laboratory & Practical Equipment</span>
                    <span className="font-mono text-white">₹18,000 (Paid: ₹18,000)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-300 font-medium">Digital Library & Learning Resources</span>
                    <span className="font-mono text-white">₹6,000 (Paid: ₹4,000)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Attendance Roll SubTab */}
          {activeSubTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cumulative Attendance</span>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{student.attendance_pct}%</p>
                </div>
                <button
                  onClick={handleJumpToAttendance}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Open Daily Roll-Call</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                Student has maintained regular attendance without chronic absenteeism. Bio-metric punching record verified.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
