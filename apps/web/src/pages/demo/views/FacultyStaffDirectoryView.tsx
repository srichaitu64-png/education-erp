import React, { useState } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  Award,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  UserCheck,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useDemoStore } from '../../../store/demoStore';

interface FacultyStaffDirectoryViewProps {
  onOpenCreateFaculty: () => void;
  onOpenImportModal: (moduleName: string, title: string) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const FacultyStaffDirectoryView: React.FC<FacultyStaffDirectoryViewProps> = ({
  onOpenCreateFaculty,
  onOpenImportModal,
  onNavigateTab,
}) => {
  const { staffMembers } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRoleType, setSelectedRoleType] = useState<'ALL' | 'TEACHING' | 'ADMIN'>('ALL');

  // Derive unique departments
  const rawDepts = Array.from(new Set(staffMembers.map((s) => s.dept).filter(Boolean)));
  const departments = ['ALL', ...rawDepts];

  // Filtering logic
  const filteredStaff = staffMembers.filter((staff) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      staff.name.toLowerCase().includes(q) ||
      (staff.email || '').toLowerCase().includes(q) ||
      (staff.employee_id || '').toLowerCase().includes(q) ||
      (staff.designation || '').toLowerCase().includes(q) ||
      (staff.dept || '').toLowerCase().includes(q);

    const matchesDept = selectedDept === 'ALL' || staff.dept === selectedDept;

    const isTeachingRole =
      (staff.role || '').includes('TEACHER') ||
      (staff.designation || '').toLowerCase().includes('lecturer') ||
      (staff.designation || '').toLowerCase().includes('professor') ||
      (staff.designation || '').toLowerCase().includes('teacher') ||
      (staff.designation || '').toLowerCase().includes('hod');

    const matchesRoleType =
      selectedRoleType === 'ALL' ||
      (selectedRoleType === 'TEACHING' && isTeachingRole) ||
      (selectedRoleType === 'ADMIN' && !isTeachingRole);

    return matchesSearch && matchesDept && matchesRoleType;
  });

  // Calculate metrics
  const totalStaff = staffMembers.length;
  const teachingCount = staffMembers.filter((s) => {
    const des = (s.designation || '').toLowerCase();
    const rol = (s.role || '').toLowerCase();
    return rol.includes('teacher') || des.includes('lecturer') || des.includes('teacher') || des.includes('hod') || des.includes('professor');
  }).length || Math.round(totalStaff * 0.69);
  const adminCount = totalStaff - teachingCount;
  const deptCount = rawDepts.length || 4;

  const getAvatarTheme = (name: string) => {
    const themes = [
      { bg: 'bg-blue-100 text-blue-700 border-blue-200' },
      { bg: 'bg-purple-100 text-purple-700 border-purple-200' },
      { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      { bg: 'bg-amber-100 text-amber-700 border-amber-200' },
      { bg: 'bg-rose-100 text-rose-700 border-rose-200' },
      { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    ];
    const index = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % themes.length;
    return themes[index];
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-600" />
              Human Resources & Academic Staff
            </span>
            <span className="text-xs text-slate-500 font-medium">Academic Year 2026–2027</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Faculty & Staff Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional directory of professors, lecturers, lab demonstrators, coordinators, and administrative officers.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCreateFaculty}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Faculty / Staff
          </button>

          <button
            type="button"
            onClick={() => onOpenImportModal('STAFF', 'Faculty & Staff Directory')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>

          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Staff Roster
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Enrolled Staff</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalStaff}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">100% Biometrically Registered</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Teaching Faculty</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{teachingCount}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Lecturers, HODs & Demonstrators</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Administrative Staff</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{adminCount}</p>
          <p className="text-[11px] text-purple-600 mt-0.5">Finance, Exam & Operations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Academic Departments</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{deptCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">School, PU & Degree Wings</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, employee ID, department, or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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

          {/* Role Type Filter */}
          <div className="flex items-center gap-1.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedRoleType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRoleType === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Staff
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleType('TEACHING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRoleType === 'TEACHING'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Teaching Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleType('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRoleType === 'ADMIN'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Admin / Non-Teaching
            </button>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Dept:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-400 font-bold">
            Showing {filteredStaff.length} of {staffMembers.length} staff
          </span>
        </div>
      </div>

      {/* Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">No staff members match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or department filter to see more profiles.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('ALL');
              setSelectedRoleType('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const avatarTheme = getAvatarTheme(staff.name);
            const initials = staff.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const isTeaching =
              (staff.role || '').includes('TEACHER') ||
              (staff.designation || '').toLowerCase().includes('lecturer') ||
              (staff.designation || '').toLowerCase().includes('professor') ||
              (staff.designation || '').toLowerCase().includes('teacher') ||
              (staff.designation || '').toLowerCase().includes('hod');

            return (
              <div
                key={staff.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header with Avatar and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${avatarTheme.bg}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                            {staff.name}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-xs text-blue-600 font-bold mt-0.5 truncate">
                          {staff.designation || staff.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                      {staff.employee_id}
                    </span>
                  </div>

                  {/* Detail Info Grid */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department:
                      </span>
                      <span className="font-bold text-slate-900">{staff.dept || 'Academics'}</span>
                    </div>

                    {staff.email && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                        </span>
                        <span className="font-medium text-slate-700 truncate max-w-[170px]" title={staff.email}>
                          {staff.email}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Role Class:
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isTeaching
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {isTeaching ? 'Teaching Faculty' : 'Administrative Staff'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active & Rostered
                  </span>

                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('staff-duties')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      Assign Duty <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
