import React, { useState } from 'react';
import { 
  Award, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, 
  Upload, Save, UserCheck, ShieldCheck, ChevronRight, Search
} from 'lucide-react';
import { useDemoStore } from '../../../store/demoStore';

interface MarksEntryRegisterViewProps {
  onOpenStudent360?: (studentOrId: any) => void;
  onOpenImportModal?: (module: 'MARKS', type: string) => void;
}

export const MarksEntryRegisterView: React.FC<MarksEntryRegisterViewProps> = ({ onOpenStudent360, onOpenImportModal }) => {
  const { marks, students, updateComponentMarks, currentRole } = useDemoStore();

  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedSection, setSelectedSection] = useState('A');
  const [entryMode, setEntryMode] = useState<'REGISTER_EXCEL' | 'INDIVIDUAL_CARDS'>('REGISTER_EXCEL');
  const [operatorName, setOperatorName] = useState(
    currentRole === 'COMPUTER_OPERATOR' ? 'Suresh Data Operator' : 'Dr. Ananya Sharma'
  );

  // Subject structure configuration
  const subjectConfigs: Record<string, { theoryMax: number; practicalMax: number; internalMax: number; totalMax: number }> = {
    'Physics': { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 },
    'Chemistry': { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 },
    'Mathematics': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Biology': { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 },
    'English': { theoryMax: 80, practicalMax: 0, internalMax: 20, totalMax: 100 },
    'Computer Science': { theoryMax: 70, practicalMax: 30, internalMax: 0, totalMax: 100 }
  };

  const currentConfig = subjectConfigs[selectedSubject] || { theoryMax: 70, practicalMax: 20, internalMax: 10, totalMax: 100 };

  // Filter marks for selected subject
  const currentMarks = marks.filter(m => m.subject.toLowerCase() === selectedSubject.toLowerCase());

  const handleFieldChange = (studentId: string, field: 'theory' | 'practical' | 'internal' | 'status', value: any) => {
    const existing = currentMarks.find(m => m.student_id === studentId);
    if (!existing) return;

    const t = field === 'theory' ? Number(value) : (existing.theory_obtained || 0);
    const p = field === 'practical' ? Number(value) : (existing.practical_obtained || 0);
    const i = field === 'internal' ? Number(value) : (existing.internal_obtained || 0);
    const status = field === 'status' ? value : (existing.attendance_status || 'PRESENT');

    updateComponentMarks(studentId, selectedSubject, {
      theory: t,
      practical: p,
      internal: i,
      status: status,
      enteredBy: operatorName,
      enteredByRole: currentRole
    });
  };

  const handleExportExcel = () => {
    alert(`Exported Section ${selectedSection} ${selectedSubject} Marks Register to Excel (.xlsx) successfully.`);
  };

  const handleImportExcel = () => {
    if (onOpenImportModal) {
      onOpenImportModal('MARKS', 'THEORY_PRACTICAL_MARKS');
    } else {
      alert(`Imported pre-validated Excel file for Section ${selectedSection} ${selectedSubject}. All entries loaded into draft register.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-[#172B4D]">
      {/* Header Banner */}
      <div className="bg-[#172B4D] text-white p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
              Multi-Component Assessment Engine
            </span>
            <span className="text-xs text-slate-300">
              Data Entry User: <strong>{operatorName}</strong> ({currentRole})
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Subject-Wise Theory, Practical & Internal Marks Register</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Physics (70/20/10) • Math (80/-/20) • Auto-Total & Grade • Preserves 'A' (Absent) without coercion to zero
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
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {Object.keys(subjectConfigs).map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#172B4D] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="A">Section A (Room ST-201)</option>
              <option value="B">Section B (Room ST-202)</option>
              <option value="C">Section C (Room ST-203)</option>
              <option value="D">Section D (Room ST-204)</option>
              <option value="E">Section E (Room ST-205)</option>
              <option value="F">Section F (Room ST-206)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Entry Interface</label>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setEntryMode('REGISTER_EXCEL')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  entryMode === 'REGISTER_EXCEL' ? 'bg-[#172B4D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Section Register
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
        </div>

        {/* Current Assessment Pattern Pill */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center gap-3">
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
      </div>

      {/* MARKS REGISTER TABLE */}
      {entryMode === 'REGISTER_EXCEL' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-black text-[#172B4D]">
                I PUC PCMB - Section {selectedSection} • {selectedSubject} Marks Sheet
              </h2>
              <p className="text-[11px] text-slate-500">
                Use Tab or Enter to navigate between editable cells. Drafts auto-saved instantly.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-Save Active
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Roll #</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Attendance Status</th>
                  <th className="p-3.5 text-center">Theory ({currentConfig.theoryMax})</th>
                  {currentConfig.practicalMax > 0 && (
                    <th className="p-3.5 text-center">Practical ({currentConfig.practicalMax})</th>
                  )}
                  {currentConfig.internalMax > 0 && (
                    <th className="p-3.5 text-center">Internal ({currentConfig.internalMax})</th>
                  )}
                  <th className="p-3.5 text-center">Total (100)</th>
                  <th className="p-3.5 text-center">Grade</th>
                  <th className="p-3.5">Attributed Entry User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {currentMarks.map(item => {
                  const student = students.find(s => s.id === item.student_id);
                  const isAbsent = item.attendance_status === 'ABSENT';
                  const isWithheld = item.attendance_status === 'WITHHELD';
                  const isExempted = item.attendance_status === 'EXEMPTED';
                  const total = (item.theory_obtained || 0) + (item.practical_obtained || 0) + (item.internal_obtained || 0);

                  return (
                    <tr key={item.student_id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">{item.roll_number}</td>
                      <td className="p-3.5 font-bold text-[#172B4D]">
                        <button
                          type="button"
                          onClick={() => onOpenStudent360?.(student || item.student_id)}
                          className="text-left group cursor-pointer inline-flex flex-col"
                          title="Click to inspect Student 360° Profile"
                        >
                          <span className="font-bold text-[#172B4D] group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                            {item.student_name}
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              360°
                            </span>
                          </span>
                          <span className="block text-[10px] text-slate-400 font-normal">{student?.admission_number}</span>
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
                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          disabled={isAbsent || isWithheld}
                          min={0}
                          max={currentConfig.theoryMax}
                          value={isAbsent ? '' : (item.theory_obtained !== undefined ? item.theory_obtained : 62)}
                          onChange={e => handleFieldChange(item.student_id, 'theory', e.target.value)}
                          className="w-16 p-1.5 text-center bg-slate-50 border border-slate-200 rounded font-mono font-bold text-[#172B4D] focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {currentConfig.practicalMax > 0 && (
                        <td className="p-3.5 text-center">
                          <input
                            type="number"
                            disabled={isAbsent || isWithheld}
                            min={0}
                            max={currentConfig.practicalMax}
                            value={isAbsent ? '' : (item.practical_obtained !== undefined ? item.practical_obtained : 18)}
                            onChange={e => handleFieldChange(item.student_id, 'practical', e.target.value)}
                            className="w-16 p-1.5 text-center bg-slate-50 border border-slate-200 rounded font-mono font-bold text-[#172B4D] focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      {currentConfig.internalMax > 0 && (
                        <td className="p-3.5 text-center">
                          <input
                            type="number"
                            disabled={isAbsent || isWithheld}
                            min={0}
                            max={currentConfig.internalMax}
                            value={isAbsent ? '' : (item.internal_obtained !== undefined ? item.internal_obtained : 9)}
                            onChange={e => handleFieldChange(item.student_id, 'internal', e.target.value)}
                            className="w-16 p-1.5 text-center bg-slate-50 border border-slate-200 rounded font-mono font-bold text-[#172B4D] focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="p-3.5 text-center font-mono font-black text-sm">
                        {isAbsent ? (
                          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">A</span>
                        ) : isWithheld ? (
                          <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">W</span>
                        ) : isExempted ? (
                          <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">E</span>
                        ) : (
                          <span className="text-[#172B4D]">{total}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                          isAbsent ? 'bg-rose-100 text-rose-800' :
                          total >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          total >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {isAbsent ? 'F' : item.grade || 'A'}
                        </span>
                      </td>
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

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Showing {currentMarks.length} student marks records • Stage 1 Draft Ready
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Draft marks saved successfully in local SQLite & synced to backend.')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Save Draft
              </button>
              <button
                onClick={() => alert('Marks sheet submitted for Examination Controller verification (Stage 2).')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white transition-colors shadow-sm cursor-pointer"
              >
                Submit for Controller Verification →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* INDIVIDUAL CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentMarks.map(item => (
            <div key={item.student_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="text-sm font-black text-[#172B4D]">{item.student_name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Roll: {item.roll_number} • {item.subject}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-black bg-blue-100 text-blue-800">
                  Grade {item.grade || 'A'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Theory</p>
                  <p className="text-base font-black text-[#172B4D]">{item.theory_obtained || 62}</p>
                  <p className="text-[9px] text-slate-400">/ {currentConfig.theoryMax}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Practical</p>
                  <p className="text-base font-black text-emerald-700">{item.practical_obtained || 18}</p>
                  <p className="text-[9px] text-slate-400">/ {currentConfig.practicalMax}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Internal</p>
                  <p className="text-base font-black text-purple-700">{item.internal_obtained || 9}</p>
                  <p className="text-[9px] text-slate-400">/ {currentConfig.internalMax}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">Total Marks:</span>
                <span className="text-lg font-black text-[#172B4D]">
                  {(item.theory_obtained || 62) + (item.practical_obtained || 18) + (item.internal_obtained || 9)} / 100
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

