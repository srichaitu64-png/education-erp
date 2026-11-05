import React, { useState, useMemo } from 'react';
import {
  CalendarCheck, Clock, Users, AlertTriangle, CheckCircle2, ShieldCheck,
  Search, Filter, Settings, FileSpreadsheet, Printer, Download, Eye,
  ArrowRight, Sparkles, Building2, UserCheck, Layers, Upload, MessageSquare, Phone,
  X, Check, Flame, ChevronRight, SlidersHorizontal, UserX, Award, ShieldAlert
} from 'lucide-react';
import { useDemoStore, AttendanceMode, DemoDailyAttendanceDetail } from '../../../store/demoStore';

interface ConfigurableAttendanceViewProps {
  onOpenStudent360?: (studentOrId: any) => void;
  onOpenImportModal?: (module: 'ATTENDANCE', type: string) => void;
}

interface AbsentFirstModalState {
  isOpen: boolean;
  className: string;
  sectionCode: string;
  stream: string;
  totalStrength: number;
}

export const ConfigurableAttendanceView: React.FC<ConfigurableAttendanceViewProps> = ({
  onOpenStudent360,
  onOpenImportModal,
}) => {
  const {
    attendanceConfig,
    updateAttendanceConfig,
    detailedDailyAttendance,
    updateDailyAttendanceStatus,
    batchMarkDailyAttendance,
    periodAttendance,
    students,
    currentRole
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'DAILY_ROLL' | 'PERIOD_WISE' | 'ABSENTEES' | 'REPORTS' | 'SETTINGS'>('DASHBOARD');
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [configToast, setConfigToast] = useState<string | null>(null);

  // Absent-First Modal State
  const [absentFirstModal, setAbsentFirstModal] = useState<AbsentFirstModalState | null>(null);
  const [absentFirstSearch, setAbsentFirstSearch] = useState('');
  const [tempAbsenteeMap, setTempAbsenteeMap] = useState<Record<string, { status: 'ABSENT' | 'LATE'; reason: string }>>({});

  const isDailyActive = attendanceConfig.attendance_mode === 'DAILY_ONLY' || attendanceConfig.attendance_mode === 'BOTH';
  const isPeriodActive = attendanceConfig.attendance_mode === 'PERIOD_WISE_ONLY' || attendanceConfig.attendance_mode === 'BOTH';
  const canConfigure = ['SUPER_ADMIN', 'CHAIRMAN_DIRECTOR', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(currentRole);

  // Section summary calculation
  const sectionSummaries = useMemo(() => {
    const list = [
      { id: 'sec-6a', className: 'Class 6', sectionCode: 'A', stream: 'Secondary (CBSE)', totalStrength: 38 },
      { id: 'sec-6b', className: 'Class 6', sectionCode: 'B', stream: 'Secondary (CBSE)', totalStrength: 40 },
      { id: 'sec-10a', className: 'Class 10', sectionCode: 'A', stream: 'Secondary (CBSE)', totalStrength: 42 },
      { id: 'sec-puc-a', className: 'I PUC', sectionCode: 'A', stream: 'PCMB (Science)', totalStrength: 45 },
      { id: 'sec-puc-b', className: 'I PUC', sectionCode: 'B', stream: 'PCMB (Science)', totalStrength: 44 },
      { id: 'sec-puc-comm', className: 'II PUC', sectionCode: 'A', stream: 'Commerce (EBAC)', totalStrength: 40 },
      { id: 'sec-bsc', className: 'B.Sc CS', sectionCode: 'Sem 3', stream: 'Computer Science (AI/ML)', totalStrength: 36 }
    ];

    return list.map(sec => {
      const records = detailedDailyAttendance.filter(
        r => r.class_name.toLowerCase().includes(sec.className.toLowerCase()) && 
             (r.section_code === sec.sectionCode || !r.section_code)
      );

      const absCount = records.filter(r => r.status === 'ABSENT').length || (sec.className === 'B.Sc CS' ? 2 : 1);
      const lateCount = attendanceConfig.enable_late_tracking ? (records.filter(r => r.status === 'LATE').length || (sec.className === 'Class 10' ? 1 : 0)) : 0;
      const leaveCount = attendanceConfig.enable_parent_leave_requests ? (records.filter(r => r.status === 'LEAVE').length || (sec.className === 'I PUC' && sec.sectionCode === 'A' ? 1 : 0)) : 0;
      const presCount = sec.totalStrength - (absCount + lateCount + leaveCount);
      const pct = Math.round(((presCount + (lateCount * 0.5)) / sec.totalStrength) * 1000) / 10;

      return {
        ...sec,
        present: presCount,
        absent: absCount,
        late: lateCount,
        leave: leaveCount,
        percentage: pct
      };
    });
  }, [detailedDailyAttendance, attendanceConfig]);

  // Overall metrics
  const overallMetrics = useMemo(() => {
    const totStrength = sectionSummaries.reduce((a, b) => a + b.totalStrength, 0);
    const totPres = sectionSummaries.reduce((a, b) => a + b.present, 0);
    const totAbs = sectionSummaries.reduce((a, b) => a + b.absent, 0);
    const totLate = sectionSummaries.reduce((a, b) => a + b.late, 0);
    const totLeave = sectionSummaries.reduce((a, b) => a + b.leave, 0);
    const avgPct = Math.round(((totPres + (totLate * 0.5)) / totStrength) * 1000) / 10;

    return { totStrength, totPres, totAbs, totLate, totLeave, avgPct };
  }, [sectionSummaries]);

  // Filtered detailed daily attendance
  const filteredDailyRecords = useMemo(() => {
    return detailedDailyAttendance.filter(r => {
      const matchClass = selectedClassFilter === 'ALL' || r.class_name.includes(selectedClassFilter);
      const matchQuery = !searchQuery || 
        r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.admission_number.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchQuery;
    });
  }, [detailedDailyAttendance, selectedClassFilter, searchQuery]);

  // Absent student list
  const absentStudents = useMemo(() => {
    return detailedDailyAttendance.filter(r => r.status === 'ABSENT' || r.status === 'LEAVE');
  }, [detailedDailyAttendance]);

  // Filtered period attendance
  const currentPeriodRecords = useMemo(() => {
    return periodAttendance.filter(p => p.period_number === selectedPeriod);
  }, [periodAttendance, selectedPeriod]);

  // Mode change handler with safe preservation
  const handleModeChange = (newMode: AttendanceMode) => {
    updateAttendanceConfig({ attendance_mode: newMode });
    setConfigToast(`Attendance mode switched to ${newMode}. All historical daily and period records preserved.`);
    setTimeout(() => setConfigToast(null), 5000);
  };

  const handleExportCSV = () => {
    const headers = "StudentName,AdmissionNo,Class,Section,Status,AbsenceReason,Date\n";
    const rows = detailedDailyAttendance.map(r => 
      `${r.student_name},${r.admission_number},${r.class_name},${r.section_code},${r.status},${r.absence_reason || 'N/A'},${r.attendance_date}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Summary_${selectedDate}.csv`;
    a.click();
  };

  // Open Absent-First Attendance Modal for a Class & Section
  const handleOpenAbsentFirst = (sec: typeof sectionSummaries[0]) => {
    // Pre-populate any existing absences for this class
    const initialMap: Record<string, { status: 'ABSENT' | 'LATE'; reason: string }> = {};
    const existing = detailedDailyAttendance.filter(
      r => r.class_name.toLowerCase().includes(sec.className.toLowerCase()) &&
           (r.section_code === sec.sectionCode || !r.section_code) &&
           (r.status === 'ABSENT' || r.status === 'LATE')
    );
    existing.forEach(r => {
      initialMap[r.student_id] = {
        status: r.status as 'ABSENT' | 'LATE',
        reason: r.absence_reason || 'Uninformed Absence'
      };
    });

    setTempAbsenteeMap(initialMap);
    setAbsentFirstSearch('');
    setAbsentFirstModal({
      isOpen: true,
      className: sec.className,
      sectionCode: sec.sectionCode,
      stream: sec.stream,
      totalStrength: sec.totalStrength
    });
  };

  // Roster of students for the selected modal class
  const modalRoster = useMemo(() => {
    if (!absentFirstModal) return [];

    // Find real students in store matching this class
    const storeMatches = students.filter(
      s => s.class_name.toLowerCase().includes(absentFirstModal.className.toLowerCase())
    );

    // If store has fewer than mock totalStrength, fill with realistic demo cohort roster
    const fullCohort = [...storeMatches];
    const needed = Math.max(0, absentFirstModal.totalStrength - fullCohort.length);
    const names = [
      'Pooja Kulkarni', 'Kavya Deshmukh', 'Aditya Patil', 'Manish Reddy', 'Siddharth Nair',
      'Divya Murthy', 'Chirag Shah', 'Meera Iyer', 'Rohan Verma', 'Priya Rao',
      'Naveen Hegde', 'Sneha Joshi', 'Vikas Gowda', 'Shreya Bhat', 'Varun Menon',
      'Tejaswini N.', 'Deepak Kumar', 'Anjali Shenoy', 'Pranav K.', 'Swathi Pai'
    ];

    for (let i = 0; i < needed; i++) {
      const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : '');
      fullCohort.push({
        id: `mock-st-${absentFirstModal.className}-${i + 1}`,
        admission_number: `OUR-2026-${(100 + i).toString().padStart(4, '0')}`,
        roll_number: `${i + 1}`,
        first_name: name.split(' ')[0],
        last_name: name.split(' ')[1] || 'Kumar',
        institution_level: absentFirstModal.className.includes('PUC') ? 'PU College' : 'School',
        class_name: absentFirstModal.className,
        section_or_stream: `Section ${absentFirstModal.sectionCode}`,
        guardian_name: 'Guardian Contact',
        guardian_phone: '+91 98450 00000',
        fee_balance: 0,
        attendance_pct: 95.0,
        status: 'ACTIVE'
      });
    }

    return fullCohort;
  }, [absentFirstModal, students]);

  // Filtered modal roster
  const filteredModalRoster = useMemo(() => {
    if (!absentFirstSearch.trim()) return modalRoster;
    const q = absentFirstSearch.toLowerCase();
    return modalRoster.filter(
      s => s.first_name.toLowerCase().includes(q) ||
           s.last_name.toLowerCase().includes(q) ||
           s.admission_number.toLowerCase().includes(q) ||
           s.roll_number.includes(q)
    );
  }, [modalRoster, absentFirstSearch]);

  // Modal stats
  const modalAbsentCount = Object.values(tempAbsenteeMap).filter(v => v.status === 'ABSENT').length;
  const modalLateCount = Object.values(tempAbsenteeMap).filter(v => v.status === 'LATE').length;
  const modalTotal = modalRoster.length;
  const modalPresentCount = modalTotal - (modalAbsentCount + modalLateCount);
  const modalAttendancePct = modalTotal > 0 ? ((modalPresentCount / modalTotal) * 100).toFixed(1) : '100.0';

  // Toggle student absent status
  const handleToggleAbsent = (studentId: string, reason = 'Uninformed Absence') => {
    setTempAbsenteeMap(prev => {
      const next = { ...prev };
      if (next[studentId]?.status === 'ABSENT') {
        delete next[studentId]; // Restore to PRESENT
      } else {
        next[studentId] = { status: 'ABSENT', reason };
      }
      return next;
    });
  };

  // Toggle student late status
  const handleToggleLate = (studentId: string) => {
    setTempAbsenteeMap(prev => {
      const next = { ...prev };
      if (next[studentId]?.status === 'LATE') {
        delete next[studentId]; // Restore to PRESENT
      } else {
        next[studentId] = { status: 'LATE', reason: 'Late Entry (15 mins)' };
      }
      return next;
    });
  };

  // Save absent-first batch attendance
  const handleSaveAbsentFirst = () => {
    if (!absentFirstModal) return;

    const records = modalRoster.map(s => {
      const absentee = tempAbsenteeMap[s.id];
      if (absentee) {
        return {
          student_id: s.id,
          status: absentee.status,
          reason: absentee.reason,
          late_minutes: absentee.status === 'LATE' ? 15 : undefined
        };
      }
      return {
        student_id: s.id,
        status: 'PRESENT' as const,
        reason: undefined
      };
    });

    batchMarkDailyAttendance(`${absentFirstModal.className}-${absentFirstModal.sectionCode}`, selectedDate, records);

    setConfigToast(`✓ Attendance finalized for ${absentFirstModal.className} (Section ${absentFirstModal.sectionCode})! ${modalPresentCount} Present • ${modalAbsentCount} Absent. Instant alerts dispatched.`);
    setTimeout(() => setConfigToast(null), 5000);
    setAbsentFirstModal(null);
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-slate-900">
      
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
              Configurable Institutional Attendance
            </span>
            <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-mono font-bold">
              Mode: {attendanceConfig.attendance_mode.replace(/_/g, ' ')}
            </span>
            {attendanceConfig.enable_biometric_sync && (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Biometric Sync Active
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Daily Class & Lecture Attendance Management
          </h1>
          <p className="text-xs text-slate-600">
            Visual Class Cards • Fast Absent-First Roll-Call (Present by Default) • Multi-Department Master Sync
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenImportModal?.('ATTENDANCE', 'DAILY_ATTENDANCE')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-200" />
            Bulk Import Roll
          </button>

          {canConfigure && (
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              Configure Mode
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {configToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{configToast}</span>
          </div>
          <button onClick={() => setConfigToast(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation Pills */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Attendance Dashboard & Class Cards
        </button>

        {isDailyActive && (
          <button
            onClick={() => setActiveTab('DAILY_ROLL')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'DAILY_ROLL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Daily Roll-Call Register
          </button>
        )}

        {isPeriodActive ? (
          <button
            onClick={() => setActiveTab('PERIOD_WISE')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'PERIOD_WISE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Period-Wise Timetable Roll
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 font-medium italic px-2 shrink-0">
            (Period-wise disabled by institution)
          </span>
        )}

        <button
          onClick={() => setActiveTab('ABSENTEES')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'ABSENTEES' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          Absentee & Leave Management ({absentStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'REPORTS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Shortage & Analytics Reports
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 1. VISUAL CLASS CARDS & MANDATORY DAILY DASHBOARD */}
      {/* ==================================================================== */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          
          {/* Institutional Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Total Enrolled</span>
              <p className="text-2xl font-mono font-black text-slate-900 mt-1">{overallMetrics.totStrength}</p>
              <span className="text-[10px] text-slate-500 font-medium">7 Active Sections</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Present Today</span>
              <p className="text-2xl font-mono font-black text-emerald-700 mt-1">{overallMetrics.totPres}</p>
              <span className="text-[10px] text-slate-500 font-medium">In Classrooms</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">Absent Today</span>
              <p className="text-2xl font-mono font-black text-rose-700 mt-1">{overallMetrics.totAbs}</p>
              <span className="text-[10px] text-rose-600 font-medium">SMS Alerts Sent</span>
            </div>

            {attendanceConfig.enable_late_tracking && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">Late Arrivals</span>
                <p className="text-2xl font-mono font-black text-amber-800 mt-1">{overallMetrics.totLate}</p>
                <span className="text-[10px] text-slate-500 font-medium">Entry logs tracked</span>
              </div>
            )}

            {attendanceConfig.enable_parent_leave_requests && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-purple-800 block tracking-wider">Approved Leave</span>
                <p className="text-2xl font-mono font-black text-purple-800 mt-1">{overallMetrics.totLeave}</p>
                <span className="text-[10px] text-slate-500 font-medium">Medical / Excusal</span>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">Overall Rate</span>
              <p className="text-2xl font-mono font-black text-indigo-700 mt-1">{overallMetrics.avgPct}%</p>
              <span className="text-[10px] text-emerald-700 font-bold">Board Target Met</span>
            </div>
          </div>

          {/* VISUAL CLASS CARDS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Institutional Class Cards
                </h2>
                <p className="text-xs text-slate-500">
                  Select any class card to launch the fast <strong>Absent-First Roll-Call Workspace</strong> (All students present by default).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                Session: 2026-11-04 (Today)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectionSummaries.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                            {sec.stream}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            Sec {sec.sectionCode}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {sec.className}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl block">
                          {sec.percentage.toFixed(1)}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 block">Attendance</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, sec.percentage)}%` }}
                      ></div>
                    </div>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Strength</span>
                        <span className="font-mono font-black text-slate-800">{sec.totalStrength}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold block">Present</span>
                        <span className="font-mono font-black text-emerald-700">{sec.present}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-700 font-bold block">Absent</span>
                        <span className="font-mono font-black text-rose-700">{sec.absent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Absent-First Action Button */}
                  <div className="pt-4 mt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenAbsentFirst(sec)}
                      className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      Take Roll (Absent-First)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Summary Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Class & Section Attendance Breakdown</h3>
                <p className="text-[11px] text-slate-500">Click any row to open the full daily roll-call register</p>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Class & Section</th>
                    <th className="p-3.5">Stream / Level</th>
                    <th className="p-3.5 text-right">Total Strength</th>
                    <th className="p-3.5 text-right text-emerald-700">Present</th>
                    <th className="p-3.5 text-right text-rose-700">Absent</th>
                    {attendanceConfig.enable_late_tracking && <th className="p-3.5 text-right text-amber-700">Late</th>}
                    {attendanceConfig.enable_parent_leave_requests && <th className="p-3.5 text-right text-purple-700">Leave</th>}
                    <th className="p-3.5 text-right">Attendance %</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sectionSummaries.map((sec) => (
                    <tr
                      key={sec.id}
                      onClick={() => {
                        setSelectedClassFilter(sec.className);
                        if (isDailyActive) setActiveTab('DAILY_ROLL');
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {sec.className} - Section {sec.sectionCode}
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">{sec.stream}</td>
                      <td className="p-3.5 text-right font-mono text-slate-800 font-bold">{sec.totalStrength}</td>
                      <td className="p-3.5 text-right font-mono text-emerald-700 font-bold">{sec.present}</td>
                      <td className="p-3.5 text-right font-mono text-rose-700 font-bold">{sec.absent}</td>
                      {attendanceConfig.enable_late_tracking && (
                        <td className="p-3.5 text-right font-mono text-amber-700 font-bold">{sec.late}</td>
                      )}
                      {attendanceConfig.enable_parent_leave_requests && (
                        <td className="p-3.5 text-right font-mono text-purple-700 font-bold">{sec.leave}</td>
                      )}
                      <td className="p-3.5 text-right font-mono font-black text-slate-900">
                        {sec.percentage.toFixed(1)}%
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sec.percentage >= 85
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {sec.percentage >= 85 ? 'HEALTHY' : 'SHORTAGE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="text-[11px] text-blue-600 group-hover:text-blue-800 font-bold inline-flex items-center gap-1">
                          Open Roll →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. DAILY ROLL-CALL REGISTER */}
      {/* ==================================================================== */}
      {activeTab === 'DAILY_ROLL' && isDailyActive && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-700 font-bold uppercase text-[11px]">Filter Class:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 px-3 py-1.5 rounded-xl font-bold cursor-pointer"
              >
                <option value="ALL">All Classes & Sections</option>
                <option value="Class 6">Class 6 (A-B)</option>
                <option value="Class 10">Class 10 (A)</option>
                <option value="I PUC">I PUC PCMB (A-B)</option>
                <option value="II PUC">II PUC Commerce (A)</option>
                <option value="B.Sc CS">B.Sc CS Sem 3</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or roll #..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Roll #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class & Section</th>
                  <th className="p-3 text-center">Status</th>
                  {attendanceConfig.enable_absence_reasons && <th className="p-3">Reason / Details</th>}
                  <th className="p-3 text-center">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDailyRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{r.roll_number}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onOpenStudent360?.(r.student_id || r.admission_number)}
                        className="text-left group cursor-pointer inline-flex items-center gap-1.5"
                        title="Click to inspect Student 360° Profile"
                      >
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {r.student_name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          360°
                        </span>
                      </button>
                      <span className="block text-[10px] text-slate-500 font-mono font-medium">{r.admission_number}</span>
                    </td>
                    <td className="p-3 text-slate-700 font-mono text-[11px]">
                      {r.class_name} - {r.section_code}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : r.status === 'ABSENT'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : r.status === 'LATE'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    {attendanceConfig.enable_absence_reasons && (
                      <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate">
                        {r.absence_reason || '—'}
                      </td>
                    )}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => updateDailyAttendanceStatus(r.id, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            r.status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => updateDailyAttendanceStatus(r.id, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            r.status === 'ABSENT' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => updateDailyAttendanceStatus(r.id, 'LATE')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            r.status === 'LATE' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. ABSENT-FIRST ATTENDANCE MODAL WORKSPACE */}
      {/* ==================================================================== */}
      {absentFirstModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      Absent-First Attendance: {absentFirstModal.className} (Section {absentFirstModal.sectionCode})
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Present By Default
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {absentFirstModal.stream} • Date: {selectedDate} • All students pre-filled as PRESENT. Only mark absent or late students.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAbsentFirstModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Live KPI Roll Counter Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Class Strength</span>
                  <p className="text-xl font-mono font-black text-slate-900 mt-0.5">{modalTotal}</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Present (Default)</span>
                  <p className="text-xl font-mono font-black text-emerald-700 mt-0.5">{modalPresentCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-rose-700 uppercase font-bold block">Marked Absent</span>
                  <p className="text-xl font-mono font-black text-rose-700 mt-0.5">{modalAbsentCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 uppercase font-bold block">Attendance Rate</span>
                  <p className="text-xl font-mono font-black text-indigo-700 mt-0.5">{modalAttendancePct}%</p>
                </div>
              </div>

              {/* PROMINENT ABSENTEE TRAY */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span>Absentee Tray ({modalAbsentCount} Absent • {modalLateCount} Late)</span>
                  </div>
                  {modalAbsentCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setTempAbsenteeMap({})}
                      className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                    >
                      Clear All Absentees (Mark All Present)
                    </button>
                  )}
                </div>

                {modalAbsentCount === 0 && modalLateCount === 0 ? (
                  <p className="text-xs text-rose-700/80 italic py-1">
                    ✓ All {modalTotal} students are currently marked <strong>PRESENT</strong>. Use the student list below or search bar to mark any absent student.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {Object.entries(tempAbsenteeMap).map(([sId, record]) => {
                      const student = modalRoster.find(s => s.id === sId);
                      const sName = student ? `${student.first_name} ${student.last_name}` : sId;
                      const sRoll = student?.roll_number ? `#${student.roll_number}` : '';

                      return (
                        <div
                          key={sId}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-xs ${
                            record.status === 'ABSENT'
                              ? 'bg-white text-rose-900 border-rose-300'
                              : 'bg-white text-amber-900 border-amber-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${record.status === 'ABSENT' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                          <span>{sName} {sRoll}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({record.reason})</span>
                          <button
                            type="button"
                            onClick={() => handleToggleAbsent(sId)}
                            className="p-0.5 rounded-md text-slate-400 hover:text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Unmark absent (Restore to Present)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Bar for Rapid Absentee Toggling */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={absentFirstSearch}
                  onChange={(e) => setAbsentFirstSearch(e.target.value)}
                  placeholder="Type student name or roll number to mark absent..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Student Roster Table with 1-Click Toggles */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Roll #</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Admission #</th>
                      <th className="p-3 text-center">Current Status</th>
                      <th className="p-3 text-right">Quick Absent-First Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredModalRoster.map((st) => {
                      const isAbsent = tempAbsenteeMap[st.id]?.status === 'ABSENT';
                      const isLate = tempAbsenteeMap[st.id]?.status === 'LATE';
                      const isPresent = !isAbsent && !isLate;

                      return (
                        <tr
                          key={st.id}
                          className={`transition-colors ${
                            isAbsent
                              ? 'bg-rose-50/60'
                              : isLate
                              ? 'bg-amber-50/60'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-slate-800">#{st.roll_number}</td>
                          <td className="p-3 font-bold text-slate-900">
                            {st.first_name} {st.last_name}
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{st.admission_number}</td>
                          <td className="p-3 text-center">
                            {isPresent && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                ✓ Present
                              </span>
                            )}
                            {isAbsent && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                                ✕ Absent
                              </span>
                            )}
                            {isLate && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                ⏰ Late
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleAbsent(st.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 border border-slate-200'
                                }`}
                              >
                                {isAbsent ? '✕ Marked Absent' : 'Mark Absent'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleLate(st.id)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isLate
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 border border-slate-200'
                                }`}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setAbsentFirstModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAbsentFirst}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Confirm & Submit Attendance ({modalPresentCount} Present • {modalAbsentCount} Absent)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. PERIOD-WISE ATTENDANCE (ONLY WHEN ENABLED) */}
      {/* ==================================================================== */}
      {activeTab === 'PERIOD_WISE' && isPeriodActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
            <div>
              <h3 className="font-bold text-slate-900">Period-Wise Timetable Roll-Call</h3>
              <p className="text-slate-500">Tracks subject faculty attendance per timetable hour</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase">Period:</span>
              {[1, 2, 3, 4, 5, 6].map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center cursor-pointer transition-colors ${
                    selectedPeriod === p ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Period & Time</th>
                  <th className="p-3">Subject & Teacher</th>
                  <th className="p-3">Class & Section</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3 text-center">Lecture Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {currentPeriodRecords.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-700">{p.period_time}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {p.subject_name}
                      <span className="block text-[10px] text-slate-500 font-normal">Faculty: {p.teacher_name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{p.class_name} - {p.section_code}</td>
                    <td className="p-3 font-bold text-slate-900">{p.student_name}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. ABSENTEE & LEAVE MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'ABSENTEES' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-900">Immediate Absentee Notification Roster</h3>
              <p className="text-slate-500">Automated SMS & WhatsApp notifications queued for non-attending wards</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold">
              {absentStudents.length} Active Absentees
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class & Section</th>
                  <th className="p-3">Absence Reason</th>
                  <th className="p-3">Guardian Mobile</th>
                  <th className="p-3 text-right">Dispatch Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {absentStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      {st.student_name}
                      <span className="block text-[10px] font-mono text-slate-500">{st.admission_number}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{st.class_name} - {st.section_code}</td>
                    <td className="p-3 text-slate-600">{st.absence_reason || 'Uninformed Absence'}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">+91 98450 12345</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        SMS & WhatsApp Queued
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. REPORTS & SHORTAGE */}
      {/* ==================================================================== */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-900">Attendance Shortage & Eligibility Register</h3>
              <p className="text-slate-500">Below institutional requirement ({attendanceConfig.minimum_attendance_pct}%) flagged for hall ticket review</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Shortage Register
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Board Requirement</span>
              <p className="text-2xl font-mono font-black text-slate-900 mt-1">{attendanceConfig.minimum_attendance_pct}% Minimum</p>
              <span className="text-[10px] text-emerald-700 font-bold">PU Board & CBSE Norm</span>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Shortage Candidates</span>
              <p className="text-2xl font-mono font-black text-rose-700 mt-1">12 Students</p>
              <span className="text-[10px] text-rose-600 font-medium">Require Principal Condone</span>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Average Overall Rate</span>
              <p className="text-2xl font-mono font-black text-indigo-700 mt-1">{overallMetrics.avgPct}%</p>
              <span className="text-[10px] text-slate-500 font-medium">Academic Year 2026-2027</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. SETTINGS */}
      {/* ==================================================================== */}
      {activeTab === 'SETTINGS' && canConfigure && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-xs">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Institution-Level Attendance Configuration
            </h3>
            <p className="text-slate-500 mt-0.5">
              Toggle operational mode between Daily Roll-Call, Period-Wise Lecture Roll, or Dual Mode.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider block">
              1. Configured Operational Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { mode: 'DAILY_ONLY', label: 'Daily Attendance Only', desc: 'Standard classroom morning roll-call with absent-first workflow.' },
                { mode: 'PERIOD_WISE_ONLY', label: 'Period-Wise Attendance Only', desc: 'Lecture-by-lecture timetable tracking.' },
                { mode: 'BOTH', label: 'Both Daily & Period-Wise', desc: 'Dual mode: Morning roll-call + lecture slots.' }
              ].map((m) => (
                <div
                  key={m.mode}
                  onClick={() => handleModeChange(m.mode as AttendanceMode)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    attendanceConfig.attendance_mode === m.mode
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{m.label}</span>
                    {attendanceConfig.attendance_mode === m.mode && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
