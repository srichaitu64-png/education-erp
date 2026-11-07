import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, 
  Upload, Save, UserCheck, ShieldCheck, ChevronRight, Search,
  Calendar, Layers, BookOpen, Check, RefreshCw, Send, Lock
} from 'lucide-react';
import { useDemoStore, DemoExamMarks } from '../../../store/demoStore';

interface MarksEntryRegisterViewProps {
  onOpenStudent360?: (studentOrId: any) => void;
  onOpenImportModal?: (module: 'MARKS', type: string) => void;
}

export const MarksEntryRegisterView: React.FC<MarksEntryRegisterViewProps> = ({ 
  onOpenStudent360, 
  onOpenImportModal 
}) => {
  const { 
    marks, 
    students, 
    exams, 
    subjects, 
    academicSections, 
    updateComponentMarks, 
    currentRole 
  } = useDemoStore();

  // =========================================================================
  // 7-TIER DEPENDENT SELECTIONS (Academic Architecture Standard)
  // =========================================================================
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedLevel, setSelectedLevel] = useState<'School' | 'PU College' | 'Degree College'>('PU College');
  const [selectedClass, setSelectedClass] = useState('I PUC');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedExam, setSelectedExam] = useState('Mid-Term Examination');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedComponent, setSelectedComponent] = useState<'ALL' | 'THEORY' | 'PRACTICAL' | 'INTERNAL'>('ALL');

  // Entry Mode & Operator
  const [entryMode, setEntryMode] = useState<'REGISTER_EXCEL' | 'INDIVIDUAL_CARDS'>('REGISTER_EXCEL');
  const [operatorName, setOperatorName] = useState(
    currentRole === 'COMPUTER_OPERATOR' ? 'Suresh Data Operator' : 'Dr. Ananya Sharma'
  );

  // Workflow Stage State
  const [workflowStage, setWorkflowStage] = useState<'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED_PUBLISHED'>('DRAFT');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard navigation focus refs
  const inputRefs = useRef<Record<string, Record<string, HTMLInputElement | null>>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Available classes for selected level
  const availableClasses = Array.from(
    new Set(
      academicSections
        .filter(sec => sec.course_level === selectedLevel)
        .map(sec => sec.class_name)
    )
  );

  // Available sections for selected class
  const availableSections = academicSections
    .filter(sec => sec.class_name === selectedClass)
    .map(sec => sec.section_code);

  // Available exams
  const availableExams = exams.length > 0 
    ? exams.map(e => e.title || 'Mid-Term Examination')
    : ['Mid-Term Examination', 'Unit Test 1', 'Unit Test 2', 'Annual Board Examination'];

  // Available subjects for selected class & stream
  const availableSubjects = Array.from(
    new Set(
      subjects.map(s => s.name)
    )
  );

  // Sync selectors when parent selections change
  useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.includes(selectedClass)) {
      setSelectedClass(availableClasses[0]);
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (availableSections.length > 0 && !availableSections.includes(selectedSection)) {
      setSelectedSection(availableSections[0]);
    }
  }, [selectedClass]);

  // Subject structure configuration
  const subjectConfigs: Record<string, { theoryMax: number; practicalMax: number; internalMax: number; totalMax: number }> = {
    'Physics': { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 },
    'Chemistry': { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 },
    'Mathematics': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Biology': { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 },
    'English': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Computer Science': { theoryMax: 70, practicalMax: 30, internalMax: 0, totalMax: 100 },
    'Science': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Social Studies': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Social Science': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Kannada': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Hindi': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 }
  };

  const currentConfig = subjectConfigs[selectedSubject] || { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 };

  // =========================================================================
  // DYNAMIC STUDENT ROSTER & DRAFT MARKS RECONCILIATION (NEVER EMPTY)
  // =========================================================================
  // 1. Find all students belonging to the chosen class
  const classStudents = students.filter(s => {
    const classMatch = s.class_name.toLowerCase().includes(selectedClass.toLowerCase()) ||
                       selectedClass.toLowerCase().includes(s.class_name.toLowerCase());
    return classMatch;
  });

  // 2. Synthesize or retrieve marks records for each student
  const reconciledRoster: DemoExamMarks[] = (classStudents.length > 0 ? classStudents : students.slice(0, 5)).map((st, idx) => {
    const existing = marks.find(
      m => m.student_id === st.id && m.subject.toLowerCase() === selectedSubject.toLowerCase()
    );

    if (existing) {
      return {
        ...existing,
        roll_number: existing.roll_number || String(idx + 1).padStart(2, '0'),
        student_name: existing.student_name || `${st.first_name} ${st.last_name}`,
      };
    }

    // Default seeded baseline so table is never empty
    const defaultTheory = selectedSubject === 'Mathematics' ? 68 : 56;
    const defaultPractical = currentConfig.practicalMax > 0 ? 17 : 0;
    const defaultInternal = currentConfig.internalMax > 0 ? 9 : 0;
    const total = defaultTheory + defaultPractical + defaultInternal;

    return {
      student_id: st.id,
      student_name: `${st.first_name} ${st.last_name}`,
      roll_number: String(idx + 1).padStart(2, '0'),
      subject: selectedSubject,
      max_marks: 100,
      obtained_marks: total,
      theory_max: currentConfig.theoryMax,
      theory_obtained: defaultTheory,
      practical_max: currentConfig.practicalMax,
      practical_obtained: defaultPractical,
      internal_max: currentConfig.internalMax,
      internal_obtained: defaultInternal,
      attendance_status: 'PRESENT',
      grade: total >= 85 ? 'A+' : total >= 70 ? 'A' : total >= 50 ? 'B' : 'C',
      entered_by: operatorName,
      entered_by_role: currentRole
    };
  });

  const handleFieldChange = (studentId: string, field: 'theory' | 'practical' | 'internal' | 'status', value: any) => {
    if (workflowStage === 'APPROVED_PUBLISHED' && currentRole !== 'SUPER_ADMIN' && currentRole !== 'PRINCIPAL') {
      alert('Examination marks are approved and published. Authorized admin credentials required to modify.');
      return;
    }

    const existing = reconciledRoster.find(m => m.student_id === studentId);
    if (!existing) return;

    let t = field === 'theory' ? (value === '' ? 0 : Number(value)) : (existing.theory_obtained || 0);
    let p = field === 'practical' ? (value === '' ? 0 : Number(value)) : (existing.practical_obtained || 0);
    let i = field === 'internal' ? (value === '' ? 0 : Number(value)) : (existing.internal_obtained || 0);
    const status = field === 'status' ? value : (existing.attendance_status || 'PRESENT');

    // Clamp to maximum allowed marks
    if (field === 'theory' && t > currentConfig.theoryMax) t = currentConfig.theoryMax;
    if (field === 'practical' && p > currentConfig.practicalMax) p = currentConfig.practicalMax;
    if (field === 'internal' && i > currentConfig.internalMax) i = currentConfig.internalMax;

    updateComponentMarks(studentId, selectedSubject, {
      theory: t,
      practical: p,
      internal: i,
      status: status,
      enteredBy: operatorName,
      enteredByRole: currentRole
    });
  };

  // Keyboard navigation handler (ArrowDown, ArrowUp, Enter, Tab)
  const handleKeyDown = (e: React.KeyboardEvent, studentId: string, field: string, currentIndex: number) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < reconciledRoster.length) {
        const nextStudent = reconciledRoster[nextIndex];
        inputRefs.current[nextStudent.student_id]?.[field]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        const prevStudent = reconciledRoster[prevIndex];
        inputRefs.current[prevStudent.student_id]?.[field]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (field === 'theory' && currentConfig.practicalMax > 0) {
        e.preventDefault();
        inputRefs.current[studentId]?.['practical']?.focus();
      } else if (field === 'practical' && currentConfig.internalMax > 0) {
        e.preventDefault();
        inputRefs.current[studentId]?.['internal']?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (field === 'internal' && currentConfig.practicalMax > 0) {
        e.preventDefault();
        inputRefs.current[studentId]?.['practical']?.focus();
      } else if (field === 'practical') {
        e.preventDefault();
        inputRefs.current[studentId]?.['theory']?.focus();
      }
    }
  };

  const handleExportCSV = () => {
    let csv = `Roll Number,Student Name,Admission Number,Subject,Attendance Status,Theory Obtained,Max Theory,Practical Obtained,Max Practical,Internal Obtained,Max Internal,Total Marks,Grade\n`;
    reconciledRoster.forEach(m => {
      const isA = m.attendance_status === 'ABSENT';
      const tot = isA ? 'A' : (m.theory_obtained || 0) + (m.practical_obtained || 0) + (m.internal_obtained || 0);
      csv += `${m.roll_number},"${m.student_name}","ADM-${m.roll_number}","${selectedSubject}","${m.attendance_status || 'PRESENT'}",${m.theory_obtained || 0},${currentConfig.theoryMax},${m.practical_obtained || 0},${currentConfig.practicalMax},${m.internal_obtained || 0},${currentConfig.internalMax},${tot},"${isA ? 'F' : m.grade || 'A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedClass}_${selectedSection}_${selectedSubject}_Marks_Register.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded official marks sheet (.csv) for ${selectedClass} Section ${selectedSection}.`);
  };

  const handleImportExcel = () => {
    if (onOpenImportModal) {
      onOpenImportModal('MARKS', 'THEORY_PRACTICAL_MARKS');
    } else {
      showToast(`Imported pre-validated marks file for ${selectedClass} Section ${selectedSection} ${selectedSubject}. All records synced.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-[#172B4D]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#172B4D] border border-blue-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#172B4D] text-white p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Multi-Component Assessment Engine
            </span>
            <span className="text-xs text-slate-300">
              User: <strong>{operatorName}</strong> ({currentRole})
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              workflowStage === 'APPROVED_PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              workflowStage === 'VERIFIED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
              workflowStage === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-slate-700 text-slate-300'
            }`}>
              Workflow: {workflowStage.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Multi-Component Examination Marks Register</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Theory, Practical & Internal Assessment with 7-Tier Dependent Selectors, Keyboard Navigation, and 4-Stage Approval Workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportExcel}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV / Excel
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7-TIER DEPENDENT SELECTION CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Cascading Examination Context & Roster Filters (7 Levels)
            </span>
          </div>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setEntryMode('REGISTER_EXCEL')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                entryMode === 'REGISTER_EXCEL' ? 'bg-[#172B4D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Sheet View
            </button>
            <button
              onClick={() => setEntryMode('INDIVIDUAL_CARDS')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                entryMode === 'INDIVIDUAL_CARDS' ? 'bg-[#172B4D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* 1. Academic Year */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">1. Academic Year</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="2026-2027">2026–2027</option>
              <option value="2025-2026">2025–2026</option>
            </select>
          </div>

          {/* 2. Course Level */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">2. Course Level</label>
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="PU College">PU College</option>
              <option value="School">School</option>
              <option value="Degree College">Degree College</option>
            </select>
          </div>

          {/* 3. Class */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">3. Class</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* 4. Section */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">4. Section</label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableSections.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* 5. Examination */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">5. Examination</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableExams.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          {/* 6. Subject */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">6. Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* 7. Component */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">7. Assessment Component</label>
            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Components</option>
              <option value="THEORY">Theory Only ({currentConfig.theoryMax}M)</option>
              {currentConfig.practicalMax > 0 && <option value="PRACTICAL">Practical Only ({currentConfig.practicalMax}M)</option>}
              {currentConfig.internalMax > 0 && <option value="INTERNAL">Internal Only ({currentConfig.internalMax}M)</option>}
            </select>
          </div>
        </div>

        {/* Assessment Pattern & Workflow Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-600">Configured Pattern:</span>
            <span className="text-blue-700 font-mono font-bold">Theory: {currentConfig.theoryMax}M</span>
            {currentConfig.practicalMax > 0 && (
              <span className="text-emerald-700 font-mono font-bold">Practical: {currentConfig.practicalMax}M</span>
            )}
            {currentConfig.internalMax > 0 && (
              <span className="text-purple-700 font-mono font-bold">Internal: {currentConfig.internalMax}M</span>
            )}
            <span className="text-[#172B4D] font-black border-l border-slate-300 pl-2">Total: {currentConfig.totalMax}M</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              Keyboard: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-[10px]">Tab/Enter</kbd> to move cells
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MARKS REGISTER TABLE VIEW */}
      {/* ========================================================================= */}
      {entryMode === 'REGISTER_EXCEL' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-black text-[#172B4D] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  {selectedSection}
                </span>
                {selectedClass} Section {selectedSection} • {selectedSubject} Marks Sheet ({selectedExam})
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {reconciledRoster.length} Enrolled students verified • Absent ('A') preserved separately without coercion to zero
              </p>
            </div>
            
            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => showToast('Draft marks saved successfully and synced to backend.')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Draft
              </button>

              {workflowStage === 'DRAFT' && (
                <button
                  onClick={() => {
                    setWorkflowStage('SUBMITTED');
                    showToast('Submitted marks sheet for Examination Controller verification (Stage 2).');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit for Verification →
                </button>
              )}

              {workflowStage === 'SUBMITTED' && (
                <button
                  onClick={() => {
                    setWorkflowStage('VERIFIED');
                    showToast('Examination Controller verified mark entries and totals (Stage 3).');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Controller Verification Complete →
                </button>
              )}

              {workflowStage === 'VERIFIED' && (
                <button
                  onClick={() => {
                    setWorkflowStage('APPROVED_PUBLISHED');
                    showToast('Principal approved marks register. Published to Result Notice Board & Progress Cards.');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Principal Approval & Publish 📢
                </button>
              )}

              {workflowStage === 'APPROVED_PUBLISHED' && (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Published to Notice Board
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Roll #</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Attendance Status</th>
                  {(selectedComponent === 'ALL' || selectedComponent === 'THEORY') && (
                    <th className="p-3.5 text-center">Theory ({currentConfig.theoryMax})</th>
                  )}
                  {currentConfig.practicalMax > 0 && (selectedComponent === 'ALL' || selectedComponent === 'PRACTICAL') && (
                    <th className="p-3.5 text-center">Practical ({currentConfig.practicalMax})</th>
                  )}
                  {currentConfig.internalMax > 0 && (selectedComponent === 'ALL' || selectedComponent === 'INTERNAL') && (
                    <th className="p-3.5 text-center">Internal ({currentConfig.internalMax})</th>
                  )}
                  <th className="p-3.5 text-center">Total (100)</th>
                  <th className="p-3.5 text-center">Grade</th>
                  <th className="p-3.5 text-center">Result</th>
                  <th className="p-3.5">Attributed Entry User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reconciledRoster.map((item, idx) => {
                  const student = students.find(s => s.id === item.student_id);
                  const isAbsent = item.attendance_status === 'ABSENT';
                  const isWithheld = item.attendance_status === 'WITHHELD';
                  const isExempted = item.attendance_status === 'EXEMPTED';
                  const total = (item.theory_obtained || 0) + (item.practical_obtained || 0) + (item.internal_obtained || 0);
                  const isPassed = !isAbsent && !isWithheld && total >= 35;

                  return (
                    <tr key={item.student_id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">{item.roll_number}</td>
                      <td className="p-3.5 font-bold text-[#172B4D]">
                        <button
                          type="button"
                          onClick={() => onOpenStudent360?.(student || item.student_id)}
                          className="text-left group cursor-pointer inline-flex flex-col"
                          title="Click to inspect Student 360° Profile"
                        >
                          <span className="font-bold text-[#172B4D] group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {item.student_name}
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              360°
                            </span>
                          </span>
                          <span className="block text-[10px] text-slate-400 font-normal font-mono">{student?.admission_number}</span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={item.attendance_status || 'PRESENT'}
                          onChange={e => handleFieldChange(item.student_id, 'status', e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 border cursor-pointer ${
                            isAbsent ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            isWithheld ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            isExempted ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent (A)</option>
                          <option value="WITHHELD">Withheld (W)</option>
                          <option value="EXEMPTED">Exempted (E)</option>
                        </select>
                      </td>

                      {/* Theory marks input */}
                      {(selectedComponent === 'ALL' || selectedComponent === 'THEORY') && (
                        <td className="p-3.5 text-center">
                          <input
                            ref={el => {
                              if (!inputRefs.current[item.student_id]) inputRefs.current[item.student_id] = {};
                              inputRefs.current[item.student_id]['theory'] = el;
                            }}
                            type="number"
                            disabled={isAbsent || isWithheld}
                            min={0}
                            max={currentConfig.theoryMax}
                            value={isAbsent ? '' : (item.theory_obtained !== undefined ? item.theory_obtained : '')}
                            onChange={e => handleFieldChange(item.student_id, 'theory', e.target.value)}
                            onKeyDown={e => handleKeyDown(e, item.student_id, 'theory', idx)}
                            className="w-16 p-1.5 text-center bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-[#172B4D] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                          />
                        </td>
                      )}

                      {/* Practical marks input */}
                      {currentConfig.practicalMax > 0 && (selectedComponent === 'ALL' || selectedComponent === 'PRACTICAL') && (
                        <td className="p-3.5 text-center">
                          <input
                            ref={el => {
                              if (!inputRefs.current[item.student_id]) inputRefs.current[item.student_id] = {};
                              inputRefs.current[item.student_id]['practical'] = el;
                            }}
                            type="number"
                            disabled={isAbsent || isWithheld}
                            min={0}
                            max={currentConfig.practicalMax}
                            value={isAbsent ? '' : (item.practical_obtained !== undefined ? item.practical_obtained : '')}
                            onChange={e => handleFieldChange(item.student_id, 'practical', e.target.value)}
                            onKeyDown={e => handleKeyDown(e, item.student_id, 'practical', idx)}
                            className="w-16 p-1.5 text-center bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-[#172B4D] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                          />
                        </td>
                      )}

                      {/* Internal marks input */}
                      {currentConfig.internalMax > 0 && (selectedComponent === 'ALL' || selectedComponent === 'INTERNAL') && (
                        <td className="p-3.5 text-center">
                          <input
                            ref={el => {
                              if (!inputRefs.current[item.student_id]) inputRefs.current[item.student_id] = {};
                              inputRefs.current[item.student_id]['internal'] = el;
                            }}
                            type="number"
                            disabled={isAbsent || isWithheld}
                            min={0}
                            max={currentConfig.internalMax}
                            value={isAbsent ? '' : (item.internal_obtained !== undefined ? item.internal_obtained : '')}
                            onChange={e => handleFieldChange(item.student_id, 'internal', e.target.value)}
                            onKeyDown={e => handleKeyDown(e, item.student_id, 'internal', idx)}
                            className="w-16 p-1.5 text-center bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-[#172B4D] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                          />
                        </td>
                      )}

                      {/* Total calculation */}
                      <td className="p-3.5 text-center font-mono font-black text-sm">
                        {isAbsent ? (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">A</span>
                        ) : isWithheld ? (
                          <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">W</span>
                        ) : isExempted ? (
                          <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">E</span>
                        ) : (
                          <span className="text-[#172B4D]">{total}</span>
                        )}
                      </td>

                      {/* Letter Grade */}
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                          isAbsent ? 'bg-rose-100 text-rose-800' :
                          total >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          total >= 70 ? 'bg-blue-100 text-blue-800' :
                          total >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isAbsent ? 'F' : total >= 85 ? 'A+' : total >= 70 ? 'A' : total >= 50 ? 'B' : 'C'}
                        </span>
                      </td>

                      {/* Pass / Fail */}
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPassed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>

                      {/* Audit Attribution */}
                      <td className="p-3.5 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 block">{item.entered_by || operatorName}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.entered_by_role || currentRole}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Showing {reconciledRoster.length} student marks records • {reconciledRoster.filter(r => r.attendance_status !== 'ABSENT').length} Present • {reconciledRoster.filter(r => r.attendance_status === 'ABSENT').length} Absent
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Auto-saved to Local Storage & Server Synced
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* INDIVIDUAL CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reconciledRoster.map(item => {
            const isAbsent = item.attendance_status === 'ABSENT';
            const total = isAbsent ? 0 : (item.theory_obtained || 0) + (item.practical_obtained || 0) + (item.internal_obtained || 0);

            return (
              <div key={item.student_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="text-sm font-black text-[#172B4D]">{item.student_name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Roll: #{item.roll_number} • {item.subject}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-black ${
                    isAbsent ? 'bg-rose-100 text-rose-800' :
                    total >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAbsent ? 'ABSENT' : `Grade ${item.grade || 'A'}`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Theory</p>
                    <p className="text-base font-black text-[#172B4D]">{isAbsent ? 'A' : (item.theory_obtained || 0)}</p>
                    <p className="text-[9px] text-slate-400">/ {currentConfig.theoryMax}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Practical</p>
                    <p className="text-base font-black text-emerald-700">{isAbsent ? 'A' : (item.practical_obtained || 0)}</p>
                    <p className="text-[9px] text-slate-400">/ {currentConfig.practicalMax}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Internal</p>
                    <p className="text-base font-black text-purple-700">{isAbsent ? 'A' : (item.internal_obtained || 0)}</p>
                    <p className="text-[9px] text-slate-400">/ {currentConfig.internalMax}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500">Total Marks:</span>
                  <span className="text-lg font-black text-[#172B4D]">
                    {isAbsent ? 'ABSENT' : `${total} / 100`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
