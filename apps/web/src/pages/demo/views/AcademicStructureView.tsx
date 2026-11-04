import React, { useState } from 'react';
import { 
  Building2, Plus, Users, ArrowRightLeft, CheckCircle2, AlertTriangle, 
  Layers, School, GraduationCap, DoorOpen, ShieldCheck, Search
} from 'lucide-react';
import { useDemoStore, AcademicSectionModel } from '../../../store/demoStore';

export const AcademicStructureView: React.FC = () => {
  const { academicSections, studentTransfers, addAcademicSection, transferStudentSection, currentRole } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'TRANSFERS' | 'NEW_SECTION'>('SECTIONS');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'School' | 'PU College' | 'Degree College'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for new section
  const [newLevel, setNewLevel] = useState<'School' | 'PU College' | 'Degree College'>('PU College');
  const [newClassName, setNewClassName] = useState('I PUC');
  const [newStream, setNewStream] = useState('PCMB');
  const [newSectionCode, setNewSectionCode] = useState('G');
  const [newRoom, setNewRoom] = useState('Hall ST-207');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newTeacher, setNewTeacher] = useState('Dr. S. Kulkarni');

  // Form states for section transfer
  const [transferStudentName, setTransferStudentName] = useState('Rahul Kumar');
  const [transferSource, setTransferSource] = useState('A');
  const [transferTarget, setTransferTarget] = useState('B');
  const [transferReason, setTransferReason] = useState('Accommodate laboratory session batch timing');

  const filteredSections = academicSections.filter(sec => {
    const matchesLevel = levelFilter === 'ALL' || sec.course_level === levelFilter;
    const matchesSearch = 
      sec.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.section_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.stream.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.class_teacher_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addAcademicSection({
      academic_year: '2026-2027',
      course_level: newLevel,
      class_name: newClassName,
      stream: newStream,
      section_code: newSectionCode,
      room_number: newRoom,
      max_capacity: Number(newCapacity),
      class_teacher_name: newTeacher,
      status: 'ACTIVE'
    });
    alert(res.message);
    if (res.success) {
      setActiveTab('SECTIONS');
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const res = transferStudentSection({
      studentId: 'st-rahul',
      studentName: transferStudentName,
      sourceSection: transferSource,
      targetSection: transferTarget,
      reason: transferReason
    });
    alert(res.message);
    if (res.success) {
      setActiveTab('TRANSFERS');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-[#172B4D]">
      {/* Header Banner */}
      <div className="bg-[#172B4D] text-white p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Central Academic Architecture
            </span>
            <span className="text-xs text-slate-300">Affiliation # 830192 • Karnataka PU Board & CBSE</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Academic Structure & Section Management</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            School (Class 6 with Sections A–D) • PU College (I PUC PCMB with Sections A–F) • Degree College • Capacity Limits & Transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('NEW_SECTION')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Configure New Section
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Sections</p>
          <p className="text-2xl font-black text-[#172B4D] mt-1">{academicSections.length}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Across School, PU & Degree</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">I PUC PCMB Sections</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {academicSections.filter(s => s.class_name === 'I PUC' && s.stream === 'PCMB').length} Sections
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sections A through F Active</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 6 Sections</p>
          <p className="text-2xl font-black text-[#172B4D] mt-1">
            {academicSections.filter(s => s.class_name === 'Class 6').length} Sections
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sections A, B, C, D Active</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Section Transfers</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{studentTransfers.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Historical records preserved</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'SECTIONS' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Active Section Directory ({filteredSections.length})
        </button>
        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'TRANSFERS' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Student Section Transfer Registry ({studentTransfers.length})
        </button>
        <button
          onClick={() => setActiveTab('NEW_SECTION')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'NEW_SECTION' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add / Configure Section
        </button>
      </div>

      {/* TAB 1: SECTION DIRECTORY */}
      {activeTab === 'SECTIONS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase mr-1">Level:</span>
              {(['ALL', 'School', 'PU College', 'Degree College'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    levelFilter === lvl ? 'bg-[#172B4D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search class, section, teacher..."
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
                    <th className="p-3.5">Class & Section</th>
                    <th className="p-3.5">Course Level</th>
                    <th className="p-3.5">Stream / Department</th>
                    <th className="p-3.5">Room Allocation</th>
                    <th className="p-3.5">Class Teacher</th>
                    <th className="p-3.5">Enrolment / Capacity</th>
                    <th className="p-3.5">Utilization</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSections.map(sec => {
                    const pct = Math.round((sec.enrolled_count / sec.max_capacity) * 100);
                    const isNearFull = pct >= 90;
                    return (
                      <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-[#172B4D]">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                              {sec.section_code}
                            </span>
                            {sec.class_name} - Section {sec.section_code}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sec.course_level === 'PU College' ? 'bg-purple-100 text-purple-800' :
                            sec.course_level === 'Degree College' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sec.course_level}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-[#172B4D]">{sec.stream}</td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{sec.room_number || 'Unassigned'}</td>
                        <td className="p-3.5 font-bold text-slate-700">{sec.class_teacher_name}</td>
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-[#172B4D]">{sec.enrolled_count}</span>
                          <span className="text-slate-400"> / {sec.max_capacity} seats</span>
                        </td>
                        <td className="p-3.5">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full rounded-full ${isNearFull ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{pct}% full</span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {sec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECTION TRANSFERS */}
      {activeTab === 'TRANSFERS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transfer Request Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 space-y-4">
              <h3 className="text-sm font-black text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#2563EB]" />
                Process Section Transfer
              </h3>
              <p className="text-xs text-slate-500">
                Transfers update section capacity and preserve all historical exam marks, attendance, and fee ledgers.
              </p>
              <form onSubmit={handleExecuteTransfer} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={transferStudentName}
                    onChange={e => setTransferStudentName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Source Section</label>
                    <select
                      value={transferSource}
                      onChange={e => setTransferSource(e.target.value)}
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
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Target Section</label>
                    <select
                      value={transferTarget}
                      onChange={e => setTransferTarget(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                    >
                      <option value="B">Section B</option>
                      <option value="A">Section A</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                      <option value="E">Section E</option>
                      <option value="F">Section F</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Transfer Reason</label>
                  <textarea
                    value={transferReason}
                    onChange={e => setTransferReason(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D]"
                    placeholder="Enter reason for transfer..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white transition-colors cursor-pointer"
                >
                  Approve & Execute Transfer
                </button>
              </form>
            </div>

            {/* Historical Transfer Log */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
              <h3 className="text-sm font-black text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Transfer History & Historical Preservation Log
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Transfer ID</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Movement</th>
                      <th className="p-3">Effective Date</th>
                      <th className="p-3">Approved By</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Audit State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {studentTransfers.map(tr => (
                      <tr key={tr.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-[11px] text-blue-600">{tr.id}</td>
                        <td className="p-3 font-bold text-[#172B4D]">
                          {tr.student_name}
                          <span className="block text-[10px] text-slate-400 font-normal">{tr.admission_number}</span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                            {tr.source_section} <span className="text-blue-500">→</span> {tr.target_section}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{tr.effective_date}</td>
                        <td className="p-3 text-slate-700 font-semibold">{tr.approved_by}</td>
                        <td className="p-3 text-slate-500 italic max-w-xs truncate">{tr.reason}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {tr.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURE NEW SECTION */}
      {activeTab === 'NEW_SECTION' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#172B4D]">Configure New Academic Section</h3>
          <p className="text-xs text-slate-500">
            Define dynamic sections for School (Nursery to 12), PU College (I & II PUC PCMB/Commerce), or Degree College.
          </p>
          <form onSubmit={handleCreateSection} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course Level</label>
                <select
                  value={newLevel}
                  onChange={e => setNewLevel(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                >
                  <option value="School">School (Nursery - Class 12)</option>
                  <option value="PU College">PU College (I & II PUC)</option>
                  <option value="Degree College">Degree College (UG / PG)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Class / Course Name</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="e.g. Class 6, I PUC, B.Sc"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Stream / Specialization</label>
                <input
                  type="text"
                  value={newStream}
                  onChange={e => setNewStream(e.target.value)}
                  placeholder="e.g. PCMB, PCMC, Commerce, General"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Section Code</label>
                <input
                  type="text"
                  value={newSectionCode}
                  onChange={e => setNewSectionCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A, B, C, D, E, F"
                  maxLength={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-black uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Classroom / Hall Number</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  placeholder="e.g. Hall ST-204"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Maximum Student Capacity</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={e => setNewCapacity(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D] font-bold"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Class Teacher Name</label>
                <input
                  type="text"
                  value={newTeacher}
                  onChange={e => setNewTeacher(e.target.value)}
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#172B4D]"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white transition-colors cursor-pointer"
              >
                Save & Initialize Section
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SECTIONS')}
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
