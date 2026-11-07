import React, { useState } from 'react';
import { 
  Building2, Plus, Users, ArrowRightLeft, CheckCircle2, AlertTriangle, 
  Layers, School, GraduationCap, DoorOpen, ShieldCheck, Search,
  X, BookOpen, Calendar, UserCheck, BarChart3, ChevronRight, Edit3, Save, Sparkles, Clock, Check, Eye
} from 'lucide-react';
import { useDemoStore, AcademicSectionModel } from '../../../store/demoStore';

interface AcademicStructureViewProps {
  onOpenStudent360?: (student: any) => void;
  onNavigateTab?: (tab: string, meta?: any) => void;
}

export const AcademicStructureView: React.FC<AcademicStructureViewProps> = ({ onOpenStudent360, onNavigateTab }) => {
  const { 
    academicSections, 
    studentTransfers, 
    addAcademicSection, 
    updateAcademicSection, 
    transferStudentSection, 
    currentRole, 
    students, 
    staffMembers, 
    subjects, 
    exams, 
    marks 
  } = useDemoStore();

  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'TRANSFERS' | 'NEW_SECTION'>('SECTIONS');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'School' | 'PU College' | 'Degree College'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer state
  const [selectedSection, setSelectedSection] = useState<AcademicSectionModel | null>(null);
  const [drawerTab, setDrawerTab] = useState<'OVERVIEW' | 'STUDENTS' | 'TEACHER' | 'SUBJECTS' | 'TIMETABLE' | 'PERFORMANCE'>('OVERVIEW');
  const [editRoom, setEditRoom] = useState('');
  const [editCapacity, setEditCapacity] = useState(50);
  const [editTeacher, setEditTeacher] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleOpenDrawer = (sec: AcademicSectionModel) => {
    setSelectedSection(sec);
    setDrawerTab('OVERVIEW');
    setEditRoom(sec.room_number || '');
    setEditCapacity(sec.max_capacity);
    setEditTeacher(sec.class_teacher_name);
    setEditStatus(sec.status);
    setSaveSuccessMsg(null);
  };

  const handleSaveSectionEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;
    updateAcademicSection(selectedSection.id, {
      room_number: editRoom,
      max_capacity: Number(editCapacity),
      class_teacher_name: editTeacher,
      status: editStatus
    });
    setSelectedSection(prev => prev ? {
      ...prev,
      room_number: editRoom,
      max_capacity: Number(editCapacity),
      class_teacher_name: editTeacher,
      status: editStatus
    } : null);
    setSaveSuccessMsg('Section configuration updated successfully.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

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
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSections.map(sec => {
                    const pct = Math.round((sec.enrolled_count / sec.max_capacity) * 100);
                    const isNearFull = pct >= 90;
                    return (
                      <tr 
                        key={sec.id} 
                        onClick={() => handleOpenDrawer(sec)}
                        className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                      >
                        <td className="p-3.5 font-bold text-[#172B4D]">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {sec.section_code}
                            </span>
                            <span className="group-hover:text-blue-700 transition-colors">
                              {sec.class_name} - Section {sec.section_code}
                            </span>
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
                        <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDrawer(sec)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 transition-all border border-blue-200/80 shadow-2xs cursor-pointer"
                            title="Open Section 360 Workspace (Enrolled Students, Timetable, Subjects, Teacher)"
                          >
                            Manage Section
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
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

      {/* ================================================================= */}
      {/* SECTION 360 INTERACTIVE WORKSPACE DRAWER / MODAL */}
      {/* ================================================================= */}
      {selectedSection && (() => {
        const sec = selectedSection;
        const pct = Math.round((sec.enrolled_count / sec.max_capacity) * 100);
        const availableSeats = Math.max(0, sec.max_capacity - sec.enrolled_count);

        // Filter enrolled students for this class and section
        const matchingStudents = students.filter(s => {
          const classMatch = s.class_name.toLowerCase().includes(sec.class_name.toLowerCase()) ||
                             sec.class_name.toLowerCase().includes(s.class_name.toLowerCase());
          return classMatch;
        });

        // Filter subjects mapped to this class level
        const classSubjects = subjects.filter(sub => {
          if (sec.course_level === 'School') {
            return ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Kannada'].includes(sub.name);
          }
          if (sec.stream === 'PCMB') {
            return ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Kannada'].includes(sub.name);
          }
          return true;
        });

        // Filter exams targeting this class
        const classExams = exams.filter(ex => 
          ex.class_name?.toLowerCase().includes(sec.class_name.toLowerCase()) || 
          sec.class_name.toLowerCase().includes((ex.class_name || '').toLowerCase())
        );

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in slide-in-from-right duration-200">
              
              {/* Drawer Top Header */}
              <div className="bg-[#172B4D] text-white p-5 flex items-start justify-between gap-4 border-b border-slate-700 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {sec.course_level}
                    </span>
                    <span className="text-xs text-slate-300">
                      Academic Year 2026–2027
                    </span>
                  </div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                      {sec.section_code}
                    </span>
                    {sec.class_name} • Section {sec.section_code}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Stream: <strong>{sec.stream}</strong> • Room: <strong>{sec.room_number || 'Unassigned'}</strong> • Class Teacher: <strong>{sec.class_teacher_name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSection(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close section workspace"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-bold gap-1 shrink-0 overflow-x-auto">
                <button
                  onClick={() => setDrawerTab('OVERVIEW')}
                  className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    drawerTab === 'OVERVIEW' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Overview & Capacity
                </button>
                <button
                  onClick={() => setDrawerTab('STUDENTS')}
                  className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    drawerTab === 'STUDENTS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Enrolled Students ({matchingStudents.length})
                </button>
                <button
                  onClick={() => setDrawerTab('TEACHER')}
                  className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    drawerTab === 'TEACHER' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Class Teacher & Staff
                </button>
                <button
                  onClick={() => setDrawerTab('SUBJECTS')}
                  className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    drawerTab === 'SUBJECTS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Subjects & Curriculum
                </button>
                <button
                  onClick={() => setDrawerTab('TIMETABLE')}
                  className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    drawerTab === 'TIMETABLE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Weekly Timetable
                </button>
                <button
                  onClick={() => setDrawerTab('PERFORMANCE')}
                  className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    drawerTab === 'PERFORMANCE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Academic Performance
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* TAB 1: OVERVIEW & CAPACITY */}
                {drawerTab === 'OVERVIEW' && (
                  <div className="space-y-6">
                    {/* Capacity Utilization Card */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Seat Capacity & Enrolment Utilization
                        </span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                          {pct}% Allocated
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Enrolled Students</p>
                          <p className="text-xl font-black text-slate-900 mt-0.5">{sec.enrolled_count}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Maximum Seats</p>
                          <p className="text-xl font-black text-slate-900 mt-0.5">{sec.max_capacity}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Vacant Seats</p>
                          <p className="text-xl font-black text-emerald-600 mt-0.5">{availableSeats}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${pct >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>0 seats</span>
                          <span>{availableSeats} seats remaining for new admissions</span>
                          <span>{sec.max_capacity} limit</span>
                        </div>
                      </div>
                    </div>

                    {/* Room & Facility Specifications */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <DoorOpen className="w-4 h-4 text-blue-600" />
                        Classroom & Infrastructure Allocation
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-slate-400 text-[10px] font-bold uppercase">Room Code</p>
                          <p className="font-bold text-slate-900 mt-0.5 font-mono">{sec.room_number || 'Unallocated'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-slate-400 text-[10px] font-bold uppercase">Wing / Floor</p>
                          <p className="font-bold text-slate-900 mt-0.5">Academic Block B • Floor 2</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-slate-400 text-[10px] font-bold uppercase">Smart Class / AV</p>
                          <p className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Interactive Projector Installed
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-slate-400 text-[10px] font-bold uppercase">Ventilation & CCTV</p>
                          <p className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Monitored (Camera IP-207)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Edit Section Configuration Form */}
                    <form onSubmit={handleSaveSectionEdits} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-600" />
                        Edit Section Configuration
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Assigned Classroom / Hall</label>
                          <input
                            type="text"
                            value={editRoom}
                            onChange={e => setEditRoom(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Hall ST-101"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Max Student Capacity</label>
                          <input
                            type="number"
                            min={sec.enrolled_count}
                            max={100}
                            value={editCapacity}
                            onChange={e => setEditCapacity(Number(e.target.value))}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Class Teacher Assignment</label>
                          <select
                            value={editTeacher}
                            onChange={e => setEditTeacher(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            {staffMembers.map(st => (
                              <option key={st.id} value={st.name}>
                                {st.name} ({st.role} - {st.dept})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Operational Status</label>
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as any)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            <option value="ACTIVE">ACTIVE (Accepting Enrollments)</option>
                            <option value="ARCHIVED">ARCHIVED (Frozen / Inactive)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save Section Settings
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 2: ENROLLED STUDENTS ROSTER */}
                {drawerTab === 'STUDENTS' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900">{matchingStudents.length} Students Enrolled</span>
                        <p className="text-[11px] text-slate-500">Live roster for {sec.class_name} Section {sec.section_code}</p>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        100% Verified Enrolment
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">Roll #</th>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Admission No</th>
                            <th className="p-3">Attendance</th>
                            <th className="p-3">Fee Status</th>
                            <th className="p-3 text-right">Profile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {matchingStudents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400">
                                No students currently assigned to this section.
                              </td>
                            </tr>
                          ) : (
                            matchingStudents.map((st, idx) => (
                              <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-mono font-bold text-slate-900">
                                  #{String(idx + 1).padStart(2, '0')}
                                </td>
                                <td className="p-3 font-bold text-slate-900">
                                  {st.first_name} {st.last_name}
                                  <span className="text-[10px] text-slate-400 font-normal block font-mono">{st.parent_email || 'student@ourschool.edu.in'}</span>
                                </td>
                                <td className="p-3 font-mono text-slate-600 text-[11px]">
                                  {st.admission_number}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                                    {st.attendance_pct || 94}%
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    st.fee_balance > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}>
                                    {st.fee_balance > 0 ? `Due ₹${st.fee_balance.toLocaleString()}` : 'Fee Cleared'}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      if (onOpenStudent360) {
                                        onOpenStudent360(st);
                                        setSelectedSection(null);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Student 360
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: CLASS TEACHER & STAFF ASSIGNMENT */}
                {drawerTab === 'TEACHER' && (() => {
                  const currentTeacherObj = staffMembers.find(st => st.name === sec.class_teacher_name) || staffMembers[0];

                  return (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                          {sec.class_teacher_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              Assigned Class Teacher
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                              Active Staff
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 mt-1">{sec.class_teacher_name}</h3>
                          <p className="text-xs text-slate-500">
                            {currentTeacherObj?.email || 'faculty@institution.edu.in'} • {currentTeacherObj?.mobile || '+91 98450 12345'}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                            <span>Role: <strong>{currentTeacherObj?.role || 'Faculty Member'}</strong></span>
                            <span>Department: <strong>{currentTeacherObj?.dept || sec.stream}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Reassign Faculty Dropdown */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Reassign Class Teacher for Section {sec.section_code}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Class teachers have direct authority over attendance verification, terminal report signing, and parent conferences.
                        </p>
                        <div className="flex items-center gap-3">
                          <select
                            value={editTeacher}
                            onChange={e => setEditTeacher(e.target.value)}
                            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            {staffMembers.map(st => (
                              <option key={st.id} value={st.name}>
                                {st.name} — {st.role} ({st.dept})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              updateAcademicSection(sec.id, { class_teacher_name: editTeacher });
                              setSelectedSection(prev => prev ? { ...prev, class_teacher_name: editTeacher } : null);
                              setSaveSuccessMsg(`Reassigned class teacher to ${editTeacher}`);
                              setTimeout(() => setSaveSuccessMsg(null), 3000);
                            }}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shrink-0 shadow-sm"
                          >
                            Confirm Assignment
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 4: SUBJECTS & CURRICULUM */}
                {drawerTab === 'SUBJECTS' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900">{classSubjects.length} Mapped Curriculum Subjects</span>
                        <p className="text-[11px] text-slate-500">Karnataka State Pre-University & Secondary Board Curriculum</p>
                      </div>
                      <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                        {sec.stream} Stream
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {classSubjects.map((sub, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{sub.name}</span>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {sub.code}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Credits: <strong className="text-slate-700">{sub.credits || 4}</strong></span>
                            <span>Theory / Lab: <strong className="text-blue-700 font-mono">{sub.theory_marks}M / {sub.practical_marks}M</strong></span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5 text-slate-400">
                            <span>Faculty: {sub.assigned_teacher || 'Department Assigned'}</span>
                            <span className="text-emerald-600 font-bold">Curriculum Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: WEEKLY TIMETABLE SHORTCUT */}
                {drawerTab === 'TIMETABLE' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Interactive Weekly Timetable for {sec.class_name} Section {sec.section_code}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          6 Working Days • 7 Periods / Day • Laboratory & Theory Scheduling
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (onNavigateTab) {
                            onNavigateTab('timetable');
                            setSelectedSection(null);
                          }
                        }}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Calendar className="w-4 h-4" />
                        Open Full Timetable View →
                      </button>
                    </div>

                    {/* Schedule Snapshot Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Day</th>
                            <th className="p-2.5">Period 1 (09:00)</th>
                            <th className="p-2.5">Period 2 (10:00)</th>
                            <th className="p-2.5">Period 3 (11:15)</th>
                            <th className="p-2.5">Period 4 (12:15)</th>
                            <th className="p-2.5">Period 5 (02:00)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                            <tr key={day} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">{day}</td>
                              <td className="p-2.5 font-semibold text-blue-700">Physics (Dr. Sharma)</td>
                              <td className="p-2.5 font-semibold text-purple-700">Chemistry (S. Rao)</td>
                              <td className="p-2.5 font-semibold text-emerald-700">Mathematics (Prof. Murthy)</td>
                              <td className="p-2.5 font-semibold text-amber-700">Biology (Dr. Priya)</td>
                              <td className="p-2.5 font-semibold text-slate-600">English Language</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 6: ACADEMIC PERFORMANCE */}
                {drawerTab === 'PERFORMANCE' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Section Performance Metrics & Exam Register
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Standardized assessment analytics across Mid-Term and Formative Unit Tests
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (onNavigateTab) {
                            onNavigateTab('marks-register');
                            setSelectedSection(null);
                          }
                        }}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Open Marks Register →
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Class Average</p>
                        <p className="text-2xl font-black text-blue-600 mt-1 font-mono">79.4%</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">+3.2% vs last term</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pass Percentage</p>
                        <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">96.8%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">30/31 students cleared</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Top Scorer</p>
                        <p className="text-lg font-black text-slate-900 mt-1">Rahul Kumar</p>
                        <p className="text-[10px] text-purple-600 font-mono mt-0.5 font-bold">94.8% Aggregate</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Section ID: {sec.id} • RLS Multi-Tenant Isolated
                </span>
                <button
                  onClick={() => setSelectedSection(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

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

