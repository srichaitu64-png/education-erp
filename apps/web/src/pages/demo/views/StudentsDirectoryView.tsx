import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  CreditCard,
  Phone,
  Bus,
  Home,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useDemoStore, DemoStudent } from '../../../store/demoStore';

interface StudentsDirectoryViewProps {
  onOpenStudent360: (student: DemoStudent) => void;
  onOpenCreateStudent: () => void;
  onOpenImportModal: (moduleName: string, title: string) => void;
  onOpenCollectFee?: () => void;
}

export const StudentsDirectoryView: React.FC<StudentsDirectoryViewProps> = ({
  onOpenStudent360,
  onOpenCreateStudent,
  onOpenImportModal,
  onOpenCollectFee,
}) => {
  const { students } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'School' | 'PU College' | 'Degree College'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FEE_DUE' | 'FEE_CLEARED' | 'HOSTEL' | 'TRANSPORT'>('ALL');
  const [sortBy, setSortBy] = useState<'ADMISSION' | 'NAME' | 'FEE_DUE' | 'ATTENDANCE'>('ADMISSION');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Filtered & Sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter((st) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          st.first_name.toLowerCase().includes(q) ||
          st.last_name.toLowerCase().includes(q) ||
          st.admission_number.toLowerCase().includes(q) ||
          (st.roll_number && st.roll_number.toLowerCase().includes(q)) ||
          (st.guardian_name && st.guardian_name.toLowerCase().includes(q)) ||
          (st.guardian_phone && st.guardian_phone.includes(q)) ||
          st.class_name.toLowerCase().includes(q) ||
          st.section_or_stream.toLowerCase().includes(q);

        const matchesLevel = levelFilter === 'ALL' || st.institution_level === levelFilter;

        let matchesStatus = true;
        if (statusFilter === 'FEE_DUE') {
          matchesStatus = (st.fee_balance || 0) > 0;
        } else if (statusFilter === 'FEE_CLEARED') {
          matchesStatus = (st.fee_balance || 0) === 0;
        } else if (statusFilter === 'HOSTEL') {
          matchesStatus = Boolean(st.is_hostel_opted);
        } else if (statusFilter === 'TRANSPORT') {
          matchesStatus = Boolean(st.is_transport_opted);
        }

        return matchesSearch && matchesLevel && matchesStatus;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'ADMISSION') {
          diff = a.admission_number.localeCompare(b.admission_number);
        } else if (sortBy === 'NAME') {
          diff = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        } else if (sortBy === 'FEE_DUE') {
          diff = (a.fee_balance || 0) - (b.fee_balance || 0);
        } else if (sortBy === 'ATTENDANCE') {
          diff = (a.attendance_pct || 0) - (b.attendance_pct || 0);
        }
        return sortOrder === 'ASC' ? diff : -diff;
      });
  }, [students, searchQuery, levelFilter, statusFilter, sortBy, sortOrder]);

  // Aggregate metrics
  const totalStudents = students.length;
  const dueStudents = students.filter((s) => (s.fee_balance || 0) > 0);
  const totalDueAmount = dueStudents.reduce((acc, s) => acc + (s.fee_balance || 0), 0);
  const clearedCount = totalStudents - dueStudents.length;
  const hostelCount = students.filter((s) => s.is_hostel_opted).length;
  const transportCount = students.filter((s) => s.is_transport_opted).length;

  const toggleSort = (field: 'ADMISSION' | 'NAME' | 'FEE_DUE' | 'ATTENDANCE') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-blue-600" />
              Student Information System (SIS)
            </span>
            <span className="text-xs text-slate-500 font-medium">Academic Year 2026–2027</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Enrolled Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative directory across School, PU College & Degree College • Click any student row to inspect full 360° Profile
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCreateStudent}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Student
          </button>

          <button
            type="button"
            onClick={() => onOpenImportModal('STUDENTS', 'Admissions / Student Roster')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV/Excel
          </button>

          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Directory
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Enrolled</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalStudents}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active Academic Roster</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fees Cleared</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{clearedCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {totalStudents ? Math.round((clearedCount / totalStudents) * 100) : 0}% Zero Dues
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Outstanding Fee Dues</p>
          <p className="text-2xl font-black text-amber-600 mt-1">₹{totalDueAmount.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">{dueStudents.length} Students Pending</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hostel & Transport</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{hostelCount + transportCount}</p>
          <p className="text-[11px] text-purple-600 mt-0.5">{hostelCount} Hostel • {transportCount} Bus</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, admission #, guardian name, phone, class, section..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 self-start md:self-auto flex-wrap">
            {(['ALL', 'School', 'PU College', 'Degree College'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'ALL' ? 'All Wings' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {[
            { id: 'ALL', label: 'All Status' },
            { id: 'FEE_DUE', label: 'Fee Dues Pending' },
            { id: 'FEE_CLEARED', label: 'Zero Dues' },
            { id: 'HOSTEL', label: 'Hostel Resident' },
            { id: 'TRANSPORT', label: 'Bus Transport' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}

          <span className="ml-auto text-[11px] text-slate-400 font-bold">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-900">No students found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No enrolled students matched your search criteria. Try modifying your filter settings.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setLevelFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => toggleSort('ADMISSION')}
                  >
                    <div className="flex items-center gap-1">
                      Admission # <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => toggleSort('NAME')}
                  >
                    <div className="flex items-center gap-1">
                      Student Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">Level & Class</th>
                  <th className="p-3.5">Section / Stream</th>
                  <th className="p-3.5">Guardian Contact</th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => toggleSort('ATTENDANCE')}
                  >
                    <div className="flex items-center gap-1">
                      Attendance <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-slate-900 select-none"
                    onClick={() => toggleSort('FEE_DUE')}
                  >
                    <div className="flex items-center gap-1">
                      Fee Balance <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => {
                  const hasDue = (st.fee_balance || 0) > 0;
                  const attendancePct = st.attendance_pct || 95;
                  const isLowAttendance = attendancePct < 75;

                  return (
                    <tr
                      key={st.id}
                      onClick={() => onOpenStudent360(st)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="p-3.5 font-mono text-blue-600 font-bold group-hover:underline">
                        {st.admission_number}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 group-hover:text-blue-600">
                        <div className="font-bold text-slate-900">
                          {st.first_name} {st.last_name}
                        </div>
                        {(st.is_hostel_opted || st.is_transport_opted) && (
                          <div className="flex items-center gap-1 mt-1">
                            {st.is_hostel_opted && (
                              <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Home className="w-2.5 h-2.5" /> Hostel
                              </span>
                            )}
                            {st.is_transport_opted && (
                              <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Bus className="w-2.5 h-2.5" /> Bus
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-700 font-medium">{st.class_name}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{st.section_or_stream}</td>

                      <td className="p-3.5 text-slate-600">
                        <div className="font-bold text-slate-800">{st.guardian_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {st.guardian_phone || '—'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              isLowAttendance ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {attendancePct}%
                          </span>
                          {isLowAttendance && (
                            <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1 rounded font-bold">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-bold">
                        <span className={hasDue ? 'text-amber-600' : 'text-emerald-600'}>
                          ₹{(st.fee_balance || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {st.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStudent360(st);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-bold border border-slate-200 transition-colors"
                        >
                          Inspect 360° →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
