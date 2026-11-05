import React, { useState, useMemo } from 'react';
import {
  CalendarCheck, Clock, Users, AlertTriangle, CheckCircle2, ShieldCheck,
  Search, Filter, Settings, FileSpreadsheet, Printer, Download, Eye,
  ArrowRight, Sparkles, Building2, UserCheck, Layers, Upload, MessageSquare, Phone
} from 'lucide-react';
import { useDemoStore, AttendanceMode, DemoDailyAttendanceDetail } from '../../../store/demoStore';

interface ConfigurableAttendanceViewProps {
  onOpenStudent360?: (studentOrId: any) => void;
  onOpenImportModal?: (module: 'ATTENDANCE', type: string) => void;
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
    periodAttendance,
    updatePeriodAttendanceStatus,
    students,
    currentRole
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'DAILY_ROLL' | 'PERIOD_WISE' | 'ABSENTEES' | 'REPORTS' | 'SETTINGS'>('DASHBOARD');
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [configToast, setConfigToast] = useState<string | null>(null);

  const isDailyActive = attendanceConfig.attendance_mode === 'DAILY_ONLY' || attendanceConfig.attendance_mode === 'BOTH';
  const isPeriodActive = attendanceConfig.attendance_mode === 'PERIOD_WISE_ONLY' || attendanceConfig.attendance_mode === 'BOTH';
  const canConfigure = ['SUPER_ADMIN', 'CHAIRMAN_DIRECTOR', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(currentRole);

  // Section summary calculation
  const sectionSummaries = useMemo(() => {
    const list = [
      { id: 'sec-6a', className: 'Class 6', sectionCode: 'A', stream: 'General', totalStrength: 38 },
      { id: 'sec-6b', className: 'Class 6', sectionCode: 'B', stream: 'General', totalStrength: 40 },
      { id: 'sec-10a', className: 'Class 10', sectionCode: 'A', stream: 'General', totalStrength: 42 },
      { id: 'sec-puc-a', className: 'I PUC', sectionCode: 'A', stream: 'PCMB', totalStrength: 45 },
      { id: 'sec-puc-b', className: 'I PUC', sectionCode: 'B', stream: 'PCMB', totalStrength: 44 },
      { id: 'sec-puc-comm', className: 'II PUC', sectionCode: 'A', stream: 'Commerce', totalStrength: 40 },
      { id: 'sec-bsc', className: 'B.Sc CS', sectionCode: 'Sem 3', stream: 'Computer Science', totalStrength: 36 }
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

  return (
    <div className="space-y-6 max-w-7xl font-sans text-white">
      
      {/* Top Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
              Configurable Institutional Attendance
            </span>
            <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-teal-400 font-mono font-bold">
              Mode: {attendanceConfig.attendance_mode.replace(/_/g, ' ')}
            </span>
            {attendanceConfig.enable_biometric_sync && (
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                Biometric Sync Active
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-white">
            Daily & Lecture Attendance Management
          </h1>
          <p className="text-xs text-slate-400">
            Independent Class-Wise Daily Dashboard • Period-Wise Timetable Roll • Absentee Tracking & Guardian Alerts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Module-Level Import Trigger (Shared Migration Engine) */}
          <button
            type="button"
            onClick={() => onOpenImportModal?.('ATTENDANCE', 'DAILY_ATTENDANCE')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            Bulk Import Attendance
          </button>

          {canConfigure && (
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              Configure Mode
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {configToast && (
        <div className="p-3.5 rounded-xl bg-teal-950/80 border border-teal-800 text-teal-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{configToast}</span>
          </div>
          <button onClick={() => setConfigToast(null)} className="text-teal-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Tab Navigation Pills */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Attendance Dashboard
        </button>

        {isDailyActive && (
          <button
            onClick={() => setActiveTab('DAILY_ROLL')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'DAILY_ROLL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Daily Roll-Call Register
          </button>
        )}

        {/* Period-Wise Attendance Tab - ONLY visible when enabled by institution */}
        {isPeriodActive ? (
          <button
            onClick={() => setActiveTab('PERIOD_WISE')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'PERIOD_WISE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            Period-Wise Timetable Roll
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 italic px-2 shrink-0">
            (Period-wise disabled by institution)
          </span>
        )}

        <button
          onClick={() => setActiveTab('ABSENTEES')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'ABSENTEES' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          Absentee & Leave Management ({absentStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'REPORTS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Shortage & Analytics Reports
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 1. MANDATORY DAILY ATTENDANCE DASHBOARD */}
      {/* ==================================================================== */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          
          {/* Institutional KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Strength</span>
              <p className="text-2xl font-mono font-black text-white mt-1">{overallMetrics.totStrength}</p>
              <span className="text-[10px] text-slate-500">7 Active Sections</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Present Today</span>
              <p className="text-2xl font-mono font-black text-emerald-400 mt-1">{overallMetrics.totPres}</p>
              <span className="text-[10px] text-slate-500">In Classroom</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Absent Today</span>
              <p className="text-2xl font-mono font-black text-rose-400 mt-1">{overallMetrics.totAbs}</p>
              <span className="text-[10px] text-rose-400/80">Requires verification</span>
            </div>

            {attendanceConfig.enable_late_tracking && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Late Arrivals</span>
                <p className="text-2xl font-mono font-black text-amber-400 mt-1">{overallMetrics.totLate}</p>
                <span className="text-[10px] text-slate-500">Tracked arrival mins</span>
              </div>
            )}

            {attendanceConfig.enable_parent_leave_requests && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">Approved Leave</span>
                <p className="text-2xl font-mono font-black text-purple-400 mt-1">{overallMetrics.totLeave}</p>
                <span className="text-[10px] text-slate-500">Parent / Medical excusal</span>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Attendance %</span>
              <p className="text-2xl font-mono font-black text-teal-300 mt-1">{overallMetrics.avgPct}%</p>
              <span className="text-[10px] text-teal-500">Above {attendanceConfig.minimum_attendance_pct}% target</span>
            </div>
          </div>

          {/* Class-Wise and Section-Wise Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Class & Section Attendance Breakdown</h3>
                <p className="text-[11px] text-slate-400">Click any class or section row to open its detailed register.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Date: {selectedDate}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Class & Section</th>
                    <th className="p-3.5">Stream / Level</th>
                    <th className="p-3.5 text-right">Total Strength</th>
                    <th className="p-3.5 text-right text-emerald-400">Present</th>
                    <th className="p-3.5 text-right text-rose-400">Absent</th>
                    {attendanceConfig.enable_late_tracking && <th className="p-3.5 text-right text-amber-400">Late</th>}
                    {attendanceConfig.enable_parent_leave_requests && <th className="p-3.5 text-right text-purple-400">Leave</th>}
                    <th className="p-3.5 text-right">Attendance %</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-medium">
                  {sectionSummaries.map((sec) => (
                    <tr
                      key={sec.id}
                      onClick={() => {
                        setSelectedClassFilter(sec.className);
                        if (isDailyActive) setActiveTab('DAILY_ROLL');
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {sec.className} - Section {sec.sectionCode}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">{sec.stream}</td>
                      <td className="p-3.5 text-right font-mono text-slate-300">{sec.totalStrength}</td>
                      <td className="p-3.5 text-right font-mono text-emerald-400 font-bold">{sec.present}</td>
                      <td className="p-3.5 text-right font-mono text-rose-400 font-bold">{sec.absent}</td>
                      {attendanceConfig.enable_late_tracking && (
                        <td className="p-3.5 text-right font-mono text-amber-400">{sec.late}</td>
                      )}
                      {attendanceConfig.enable_parent_leave_requests && (
                        <td className="p-3.5 text-right font-mono text-purple-400">{sec.leave}</td>
                      )}
                      <td className="p-3.5 text-right font-mono font-black text-white">
                        {sec.percentage.toFixed(1)}%
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sec.percentage >= 85
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {sec.percentage >= 85 ? 'HEALTHY' : 'SHORTAGE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="text-[11px] text-indigo-400 group-hover:text-indigo-300 font-bold inline-flex items-center gap-1">
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
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Class:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-900 px-3 py-1.5 rounded-xl font-bold"
              >
                <option value="ALL">All Classes & Sections</option>
                <option value="Class 6">Class 6 (A-B)</option>
                <option value="Class 10">Class 10 (A)</option>
                <option value="I PUC">I PUC PCMB (A-B)</option>
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
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Roll-Call Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Roll #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class & Section</th>
                  <th className="p-3 text-center">Status</th>
                  {attendanceConfig.enable_absence_reasons && <th className="p-3">Reason / Details</th>}
                  <th className="p-3 text-center">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {filteredDailyRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-300">{r.roll_number}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onOpenStudent360?.(r.student_id || r.admission_number)}
                        className="text-left group cursor-pointer inline-flex items-center gap-1.5"
                        title="Click to inspect Student 360° Profile"
                      >
                        <span className="font-bold text-white group-hover:text-teal-400 transition-colors">
                          {r.student_name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-teal-950 text-teal-300 border border-teal-800/60">
                          360°
                        </span>
                      </button>
                      <span className="block text-[10px] text-slate-400 font-mono">{r.admission_number}</span>
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">
                      {r.class_name} - {r.section_code}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'PRESENT'
                          ? 'bg-emerald-950 text-emerald-300'
                          : r.status === 'ABSENT'
                          ? 'bg-rose-950 text-rose-300'
                          : r.status === 'LATE'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-purple-950 text-purple-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    {attendanceConfig.enable_absence_reasons && (
                      <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
                        {r.absence_reason || '—'}
                      </td>
                    )}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => updateDailyAttendanceStatus(r.id, 'PRESENT')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            r.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => updateDailyAttendanceStatus(r.id, 'ABSENT')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            r.status === 'ABSENT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                        {attendanceConfig.enable_late_tracking && (
                          <button
                            onClick={() => updateDailyAttendanceStatus(r.id, 'LATE')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              r.status === 'LATE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Late
                          </button>
                        )}
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
      {/* 3. PERIOD-WISE ATTENDANCE REGISTER (OPTIONAL MODULE) */}
      {/* ==================================================================== */}
      {activeTab === 'PERIOD_WISE' && isPeriodActive && (
        <div className="space-y-4">
          {/* Period Selector Tabs */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-teal-400 block tracking-wider">Timetable Period Slot</span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                I PUC PCMB-A • Lecture Attendance
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setSelectedPeriod(pNum)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    selectedPeriod === pNum
                      ? 'bg-teal-600 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Period {pNum}
                </button>
              ))}
            </div>
          </div>

          {/* Period Info Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 block text-[10px]">Subject</span>
                <strong className="text-white font-mono">{currentPeriodRecords[0]?.subject_name || 'Physics (Theory)'}</strong>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-400 block text-[10px]">Timing</span>
                <strong className="text-teal-400 font-mono">{currentPeriodRecords[0]?.period_time || '09:00 - 09:50 AM'}</strong>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-400 block text-[10px]">Authorised Teacher</span>
                <strong className="text-white">{currentPeriodRecords[0]?.teacher_name || 'Dr. Ananya Sharma'}</strong>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-bold border border-emerald-800/60">
              Timetable Verified
            </span>
          </div>

          {/* Period Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Period #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Admission #</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3 text-center">Mark Lecture Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {currentPeriodRecords.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-teal-400">P-{p.period_number}</td>
                    <td className="p-3 font-bold text-white">
                      <button
                        type="button"
                        onClick={() => onOpenStudent360?.(p.student_id || p.admission_number)}
                        className="text-left group cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span className="group-hover:text-teal-300 transition-colors">{p.student_name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-teal-950 text-teal-300 border border-teal-800/60">360°</span>
                      </button>
                    </td>
                    <td className="p-3 font-mono text-slate-300 text-[11px]">{p.admission_number}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'PRESENT' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{p.remarks || '—'}</td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => updatePeriodAttendanceStatus(p.id, 'PRESENT')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            p.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => updatePeriodAttendanceStatus(p.id, 'ABSENT')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            p.status === 'ABSENT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Absent
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
      {/* 4. ABSENT STUDENT MANAGEMENT & GUARDIAN ALERTS */}
      {/* ==================================================================== */}
      {activeTab === 'ABSENTEES' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Absentee Register & Leave Tracking ({absentStudents.length} Students)</h3>
              <p className="text-slate-400 text-[11px]">Authorized guardian contact information displayed for SMS/WhatsApp verification.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              Export Absentee List (.csv)
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Admission #</th>
                  <th className="p-3.5">Class & Section</th>
                  <th className="p-3.5">Guardian Contact</th>
                  <th className="p-3.5">Absence Reason</th>
                  <th className="p-3.5">Leave Request Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {absentStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenStudent360?.(st.student_id || st.admission_number)}
                        className="text-left group cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span className="font-bold text-white group-hover:text-rose-400 transition-colors">
                          {st.student_name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                          360°
                        </span>
                      </button>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300 text-[11px]">{st.admission_number}</td>
                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">{st.class_name} - {st.section_code}</td>
                    <td className="p-3.5">
                      <span className="text-white font-bold block">{st.guardian_name || 'Authorized Parent'}</span>
                      <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {st.guardian_phone || '+91 98450 00000'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 text-[11px] max-w-xs">{st.absence_reason || 'Unexcused Absence'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.leave_request_status === 'APPROVED_BY_PRINCIPAL' || st.leave_request_status === 'OFFICIAL_SPORTS_EXCUSAL'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}>
                        {st.leave_request_status || 'UNEXCUSED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => alert(`Triggered WhatsApp/SMS absence notice for ${st.student_name} to guardian ${st.guardian_phone}`)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-teal-400" />
                        Send Notice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. ATTENDANCE SHORTAGE & ANALYTICS REPORTS */}
      {/* ==================================================================== */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div>
              <h3 className="text-sm font-bold text-white">Attendance Shortage & Exam Eligibility Report</h3>
              <p className="text-slate-400 text-[11px]">Students below institutional threshold ({attendanceConfig.minimum_attendance_pct}%) flagged for hall ticket review.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Shortage Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Institution Attendance Policy</span>
              <p className="text-xl font-black text-white mt-1">Minimum {attendanceConfig.minimum_attendance_pct}%</p>
              <span className="text-[10px] text-teal-400">Board Compliant</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Shortage Candidates</span>
              <p className="text-xl font-black text-rose-400 mt-1">12 Students</p>
              <span className="text-[10px] text-rose-400/80">Require Principal exemption pass</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Average Institute Rate</span>
              <p className="text-xl font-black text-teal-300 mt-1">{overallMetrics.avgPct}%</p>
              <span className="text-[10px] text-slate-500">Academic Year 2026-2027</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. INSTITUTION CONFIGURATION & POLICY SETTINGS */}
      {/* ==================================================================== */}
      {activeTab === 'SETTINGS' && canConfigure && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Institution-Level Attendance Configuration
            </h3>
            <p className="text-slate-400 mt-0.5">
              Configure attendance operational mode and enabled features for your institution. Changing modes preserves historical records.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 uppercase text-[10px] tracking-wider block">
              1. Configured Attendance Mode (At least one must remain active)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { mode: 'DAILY_ONLY', label: 'Daily Attendance Only', desc: 'Standard classroom morning roll-call. Period-wise navigation and timetable requirements are disabled.' },
                { mode: 'PERIOD_WISE_ONLY', label: 'Period-Wise Attendance Only', desc: 'Tracks attendance lecture-by-lecture according to timetable slots. Daily roll-call is disabled.' },
                { mode: 'BOTH', label: 'Both Daily & Period-Wise', desc: 'Full dual tracking. Morning roll-call + individual subject lecture registers.' }
              ].map((m) => (
                <div
                  key={m.mode}
                  onClick={() => handleModeChange(m.mode as AttendanceMode)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    attendanceConfig.attendance_mode === m.mode
                      ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{m.label}</span>
                    {attendanceConfig.attendance_mode === m.mode && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="font-bold text-slate-300 uppercase text-[10px] tracking-wider block">
              2. Optional Configurable Features
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Biometric Hardware Integration Sync</span>
                  <span className="text-[10px] text-slate-400">Captures biometric fingerprint/facial punches via LAN/TCP timeclocks.</span>
                </div>
                <input
                  type="checkbox"
                  checked={attendanceConfig.enable_biometric_sync}
                  onChange={(e) => updateAttendanceConfig({ enable_biometric_sync: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </label>

              <label className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Parent Leave & Absence Requests</span>
                  <span className="text-[10px] text-slate-400">Parents can submit absence notices from portal for Principal approval.</span>
                </div>
                <input
                  type="checkbox"
                  checked={attendanceConfig.enable_parent_leave_requests}
                  onChange={(e) => updateAttendanceConfig({ enable_parent_leave_requests: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </label>

              <label className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Absence Reason Tracking</span>
                  <span className="text-[10px] text-slate-400">Class teachers record medical, sports, or personal absence reasons.</span>
                </div>
                <input
                  type="checkbox"
                  checked={attendanceConfig.enable_absence_reasons}
                  onChange={(e) => updateAttendanceConfig({ enable_absence_reasons: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </label>

              <label className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Late Arrival Minutes Tracking</span>
                  <span className="text-[10px] text-slate-400">Tracks late student arrivals with exact delay minutes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={attendanceConfig.enable_late_tracking}
                  onChange={(e) => updateAttendanceConfig({ enable_late_tracking: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

