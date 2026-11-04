import React, { useState } from 'react';
import { 
  UserCheck, Shield, BookOpen, Layers, Plus, CheckCircle2, 
  AlertCircle, Search, Clock, Award, KeyRound
} from 'lucide-react';
import { useDemoStore, StaffDutyAssignmentModel } from '../../../store/demoStore';

export const StaffDutyAssignmentView: React.FC = () => {
  const { staffDuties, academicSections, assignStaffDuty, currentRole } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'DUTY_ROSTER' | 'NEW_ASSIGNMENT'>('DUTY_ROSTER');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLASS_TEACHER' | 'SUBJECT_TEACHER' | 'COMPUTER_OPERATOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [staffName, setStaffName] = useState('Dr. Ananya Sharma');
  const [dutyRole, setDutyRole] = useState<'CLASS_TEACHER' | 'SUBJECT_TEACHER' | 'SECTION_COORDINATOR' | 'COMPUTER_OPERATOR'>('SUBJECT_TEACHER');
  const [className, setClassName] = useState('I PUC');
  const [sectionCode, setSectionCode] = useState('A');
  const [subjectCode, setSubjectCode] = useState('PHY-101');
  const [subjectName, setSubjectName] = useState('Physics (Theory & Practical)');
  const [examTitle, setExamTitle] = useState('Mid-Term Examination 2026');
  const [canEnterMarks, setCanEnterMarks] = useState(true);
  const [canTakeAttendance, setCanTakeAttendance] = useState(true);

  const filteredDuties = staffDuties.filter(d => {
    const matchesRole = roleFilter === 'ALL' || d.duty_role === roleFilter;
    const matchesSearch = 
      d.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.subject_name && d.subject_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = assignStaffDuty({
      staff_id: `EMP-${Date.now().toString().slice(-4)}`,
      staff_name: staffName,
      duty_role: dutyRole,
      class_name: className,
      section_code: sectionCode,
      subject_code: dutyRole === 'CLASS_TEACHER' ? undefined : subjectCode,
      subject_name: dutyRole === 'CLASS_TEACHER' ? undefined : subjectName,
      examination_title: dutyRole === 'COMPUTER_OPERATOR' ? examTitle : undefined,
      can_enter_marks: canEnterMarks,
      can_take_attendance: canTakeAttendance,
      can_verify_marks: dutyRole === 'CLASS_TEACHER' || dutyRole === 'SECTION_COORDINATOR'
    });
    if (res.success) {
      alert(`Duty assigned successfully to ${staffName} for ${className} Section ${sectionCode}`);
      setActiveTab('DUTY_ROSTER');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-[#172B4D]">
      {/* Header Banner */}
      <div className="bg-[#172B4D] text-white p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Granular Duty Governance
            </span>
            <span className="text-xs text-slate-300">Enforced by Backend APIs • Deny-by-Default Boundary</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Staff & Section Duty Responsibility Assignment</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Scoped Access Control: Physics Teachers enter marks only for assigned sections • Computer Operators access assigned examinations without self-approval
          </p>
        </div>
        <button
          onClick={() => setActiveTab('NEW_ASSIGNMENT')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Assign New Staff Duty
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Duty Assignments</p>
          <p className="text-2xl font-black text-[#172B4D] mt-1">{staffDuties.length}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Class, Subject & Operator Duties</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Teachers Assigned</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {staffDuties.filter(d => d.duty_role === 'SUBJECT_TEACHER').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Physics, Chem, Maths, Bio</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Teachers</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {staffDuties.filter(d => d.duty_role === 'CLASS_TEACHER').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Section roll call authorities</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Entry Operators</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {staffDuties.filter(d => d.duty_role === 'COMPUTER_OPERATOR').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Restricted data entry scope</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('DUTY_ROSTER')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'DUTY_ROSTER' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Active Duty Roster ({filteredDuties.length})
        </button>
        <button
          onClick={() => setActiveTab('NEW_ASSIGNMENT')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'NEW_ASSIGNMENT' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          Assign Duty & Responsibility
        </button>
      </div>

      {/* TAB 1: DUTY ROSTER */}
      {activeTab === 'DUTY_ROSTER' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase mr-1">Duty Type:</span>
              {(['ALL', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'COMPUTER_OPERATOR'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    roleFilter === role ? 'bg-[#172B4D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, class, subject..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Assigned Duty Role</th>
                    <th className="p-3.5">Class & Section</th>
                    <th className="p-3.5">Assigned Subject / Exam</th>
                    <th className="p-3.5">Marks Entry Authority</th>
                    <th className="p-3.5">Attendance Authority</th>
                    <th className="p-3.5">Approval Boundary</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDuties.map(duty => (
                    <tr key={duty.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-[#172B4D]">
                        <span className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                          {duty.staff_name}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          duty.duty_role === 'CLASS_TEACHER' ? 'bg-purple-100 text-purple-800' :
                          duty.duty_role === 'SUBJECT_TEACHER' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {duty.duty_role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#172B4D]">
                        {duty.class_name} - Section {duty.section_code}
                      </td>
                      <td className="p-3.5">
                        {duty.subject_name ? (
                          <span className="text-[#172B4D] font-semibold">
                            {duty.subject_name}
                            <span className="block text-[10px] text-slate-400 font-mono">{duty.subject_code}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Entire Class Supervised</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {duty.can_enter_marks ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Permitted
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Locked</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {duty.can_take_attendance ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Permitted
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No Roll Call Access</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {duty.can_verify_marks ? (
                          <span className="text-purple-700 font-bold text-[10px] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Can Verify
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                            No Self-Approval
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ACTIVE
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

      {/* TAB 2: ASSIGN NEW DUTY */}
      {activeTab === 'NEW_ASSIGNMENT' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#172B4D]">Assign Staff Duty & Operational Responsibility</h3>
          <p className="text-xs text-slate-500">
            Define specific subject and section duties. Staff members cannot access unassigned sections or subjects.
          </p>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Staff Member Name</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Duty Responsibility Role</label>
                <select
                  value={dutyRole}
                  onChange={e => setDutyRole(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                >
                  <option value="SUBJECT_TEACHER">Subject Teacher / Lecturer</option>
                  <option value="CLASS_TEACHER">Class Teacher</option>
                  <option value="SECTION_COORDINATOR">Section Coordinator</option>
                  <option value="COMPUTER_OPERATOR">Computer Operator (Data Entry)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Class / Course</label>
                <select
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                >
                  <option value="I PUC">I PUC</option>
                  <option value="II PUC">II PUC</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 10">Class 10</option>
                  <option value="B.Sc (CS)">B.Sc (CS)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Section</label>
                <select
                  value={sectionCode}
                  onChange={e => setSectionCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                  <option value="E">Section E</option>
                  <option value="F">Section F</option>
                </select>
              </div>
              {dutyRole !== 'CLASS_TEACHER' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Subject Code</label>
                    <input
                      type="text"
                      value={subjectCode}
                      onChange={e => setSubjectCode(e.target.value)}
                      placeholder="e.g. PHY-101"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Subject Title</label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={e => setSubjectName(e.target.value)}
                      placeholder="e.g. Physics (Theory & Practical)"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D]"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Authority Checks</p>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canEnterMarks}
                  onChange={e => setCanEnterMarks(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Permit Marks Entry for Assigned Subject & Section
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canTakeAttendance}
                  onChange={e => setCanTakeAttendance(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Permit Period Roll Call / Daily Attendance
              </label>
              <p className="text-[11px] text-slate-500 italic mt-1">
                * Note: Under institutional governance, Computer Operators and Teachers cannot verify or approve their own marks entries. Stage 2 verification is restricted to the Examination Controller.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white transition-colors cursor-pointer"
              >
                Confirm & Record Duty Assignment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('DUTY_ROSTER')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

