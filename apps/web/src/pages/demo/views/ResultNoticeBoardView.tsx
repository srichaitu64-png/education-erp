import React, { useState, useMemo } from 'react';
import {
  Award, TrendingUp, Users, Download, Printer, Shield, CheckCircle,
  FileText, Search, Star, AlertTriangle, Eye, Lock
} from 'lucide-react';
import { useDemoStore } from '../../../store/demoStore';

interface ResultNoticeBoardViewProps {
  currentRole: string;
}

export const ResultNoticeBoardView: React.FC<ResultNoticeBoardViewProps> = ({ currentRole }) => {
  const { exams, marks, students } = useDemoStore();

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || 'exam-001');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<any | null>(null);

  const isStudentOrParent = ['STUDENT', 'PARENT'].includes(currentRole);

  const activeExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Comprehensive results dataset combining examMarks and student profiles
  const studentResults = useMemo(() => {
    // Generate simulated comprehensive result sheet for the exam
    const demoRows = [
      {
        id: 'res-1',
        studentId: 'std-001',
        admissionNo: 'AK-2026-1001',
        name: 'Rahul Kumar',
        className: 'Class 6 - Section A',
        theory: 62,
        practical: 18,
        internal: 9,
        totalObtained: 89,
        totalMax: 100,
        percentage: 89.0,
        grade: 'A+',
        rank: 2,
        status: 'PASSED',
        attendancePct: 94.5
      },
      {
        id: 'res-2',
        studentId: 'std-002',
        admissionNo: 'AK-2026-1002',
        name: 'Pooja Reddy',
        className: 'Class 6 - Section A',
        theory: 68,
        practical: 19,
        internal: 10,
        totalObtained: 97,
        totalMax: 100,
        percentage: 97.0,
        grade: 'O (Outstanding)',
        rank: 1,
        status: 'PASSED',
        attendancePct: 98.2
      },
      {
        id: 'res-3',
        studentId: 'std-003',
        admissionNo: 'AK-2026-1003',
        name: 'Aarav Sharma',
        className: 'Class 6 - Section B',
        theory: 54,
        practical: 16,
        internal: 8,
        totalObtained: 78,
        totalMax: 100,
        percentage: 78.0,
        grade: 'A',
        rank: 5,
        status: 'PASSED',
        attendancePct: 88.0
      },
      {
        id: 'res-4',
        studentId: 'std-004',
        admissionNo: 'AK-2026-1004',
        name: 'Ananya Hegde',
        className: 'Class 6 - Section C',
        theory: 45,
        practical: 14,
        internal: 7,
        totalObtained: 66,
        totalMax: 100,
        percentage: 66.0,
        grade: 'B+',
        rank: 8,
        status: 'PASSED',
        attendancePct: 84.0
      },
      {
        id: 'res-5',
        studentId: 'std-005',
        admissionNo: 'AK-2026-1005',
        name: 'Siddharth Iyer',
        className: 'I PUC PCMB - Section A',
        theory: 64,
        practical: 20,
        internal: 10,
        totalObtained: 94,
        totalMax: 100,
        percentage: 94.0,
        grade: 'O (Outstanding)',
        rank: 1,
        status: 'PASSED',
        attendancePct: 96.0
      },
      {
        id: 'res-6',
        studentId: 'std-006',
        admissionNo: 'AK-2026-1006',
        name: 'Kavya Patil',
        className: 'I PUC PCMB - Section A',
        theory: 58,
        practical: 19,
        internal: 9,
        totalObtained: 86,
        totalMax: 100,
        percentage: 86.0,
        grade: 'A+',
        rank: 3,
        status: 'PASSED',
        attendancePct: 91.5
      },
      {
        id: 'res-7',
        studentId: 'std-007',
        admissionNo: 'AK-2026-1007',
        name: 'Chetan Gowda',
        className: 'I PUC PCMB - Section B',
        theory: 32,
        practical: 14,
        internal: 6,
        totalObtained: 52,
        totalMax: 100,
        percentage: 52.0,
        grade: 'C',
        rank: 14,
        status: 'PASSED',
        attendancePct: 76.0
      },
      {
        id: 'res-8',
        studentId: 'std-008',
        admissionNo: 'AK-2026-1008',
        name: 'Deepa Hegde',
        className: 'I PUC PCMB - Section E',
        theory: 60,
        practical: 19,
        internal: 9,
        totalObtained: 88,
        totalMax: 100,
        percentage: 88.0,
        grade: 'A+',
        rank: 2,
        status: 'PASSED',
        attendancePct: 95.0
      }
    ];

    // Filter if role is Student or Parent (Privacy Gating)
    if (isStudentOrParent) {
      // Linked to Rahul Kumar
      return demoRows.filter(r => r.name.includes('Rahul'));
    }

    return demoRows;
  }, [isStudentOrParent]);

  const filteredResults = useMemo(() => {
    return studentResults.filter(row => {
      const matchClass = selectedClass === 'ALL' || row.className.includes(selectedClass);
      const matchQuery = !searchQuery || 
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        row.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchQuery;
    });
  }, [studentResults, selectedClass, searchQuery]);

  // Analytics Metrics
  const classAnalytics = useMemo(() => {
    if (filteredResults.length === 0) return { passRate: 0, avgMarks: 0, highest: 0, lowest: 0 };
    const passed = filteredResults.filter(r => r.status === 'PASSED').length;
    const passRate = (passed / filteredResults.length) * 100;
    const avgMarks = filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length;
    const highest = Math.max(...filteredResults.map(r => r.percentage));
    const lowest = Math.min(...filteredResults.map(r => r.percentage));
    return { passRate, avgMarks, highest, lowest };
  }, [filteredResults]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="bg-[#172B4D] rounded-2xl p-6 text-white border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-500/40 px-2.5 py-0.5 rounded-full">
                Phase 7 Academic Progress & Notice Board
              </span>
              {isStudentOrParent && (
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private Student Portal Gating Active
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black mt-1">Official Result Notice Board & Progress Cards</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Subject-wise & Section-wise Consolidations • Institutional Seal & Signatures • Secure Parent Progress Card Downloads
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Notice Board
            </button>
            <button
              onClick={() => alert('Official Result Spreadsheet exported (Excel format).')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Register
            </button>
          </div>
        </div>

        {/* Analytics Summary */}
        {!isStudentOrParent && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Pass Rate</span>
              <p className="text-xl font-black text-emerald-400">{classAnalytics.passRate.toFixed(1)}%</p>
              <span className="text-[10px] text-slate-400">Class threshold 40%</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Class Average</span>
              <p className="text-xl font-black text-white">{classAnalytics.avgMarks.toFixed(1)}%</p>
              <span className="text-[10px] text-slate-400">Weighted cohort avg</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Highest Score</span>
              <p className="text-xl font-black text-blue-400">{classAnalytics.highest.toFixed(1)}%</p>
              <span className="text-[10px] text-slate-400">Cohort topper</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Evaluated Students</span>
              <p className="text-xl font-black text-purple-300">{filteredResults.length}</p>
              <span className="text-[10px] text-slate-400">Verified by Controller</span>
            </div>
          </div>
        )}
      </div>

      {/* Notice Board Table & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isStudentOrParent ? 'My Term Progress Card' : 'Consolidated Examination Register'}
            </h2>
            <p className="text-xs text-slate-500">
              {isStudentOrParent
                ? 'Confidential result view. Only your verified student performance is displayed.'
                : 'Section-wise performance breakdown with multi-component marks and final grade allocations.'}
            </p>
          </div>

          {!isStudentOrParent && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-44 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Classes & Sections</option>
                <option value="Class 6">Class 6 (A-D)</option>
                <option value="I PUC PCMB">I PUC PCMB (A-F)</option>
              </select>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8FC] text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Admission #</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class & Section</th>
                <th className="py-2.5 px-3">Theory (70/80)</th>
                <th className="py-2.5 px-3">Practical (20)</th>
                <th className="py-2.5 px-3">Internal (10/20)</th>
                <th className="py-2.5 px-3 font-bold text-slate-900">Total Marks</th>
                <th className="py-2.5 px-3 font-bold text-blue-700">Percentage</th>
                <th className="py-2.5 px-3">Grade</th>
                {!isStudentOrParent && <th className="py-2.5 px-3 text-center">Rank</th>}
                <th className="py-2.5 px-3 text-right">Progress Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{row.admissionNo}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.className}</td>
                  <td className="py-2.5 px-3 font-mono">{row.theory}</td>
                  <td className="py-2.5 px-3 font-mono">{row.practical}</td>
                  <td className="py-2.5 px-3 font-mono">{row.internal}</td>
                  <td className="py-2.5 px-3 font-mono font-black text-slate-900">{row.totalObtained} / {row.totalMax}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{row.percentage.toFixed(1)}%</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {row.grade}
                    </span>
                  </td>
                  {!isStudentOrParent && (
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                      #{row.rank}
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedStudentForCard(row)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Student Progress Card Modal */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in">
            {/* Institution Brand Header */}
            <div className="text-center border-b border-slate-200 pb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                Official Institutional Academic Transcript
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">AKSHARA GLOBAL CAMPUS</h2>
              <p className="text-xs text-slate-500">Affiliated to State Board & Pre-University Education Board • Academic Year 2026-2027</p>
            </div>

            {/* Student Profile Info */}
            <div className="flex items-center justify-between bg-[#F6F8FC] p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <div><span className="text-slate-500">Student Name:</span> <strong className="text-slate-900">{selectedStudentForCard.name}</strong></div>
                <div><span className="text-slate-500">Admission No:</span> <strong className="font-mono text-slate-900">{selectedStudentForCard.admissionNo}</strong></div>
                <div><span className="text-slate-500">Class & Section:</span> <strong className="text-slate-900">{selectedStudentForCard.className}</strong></div>
              </div>
              <div className="text-right space-y-1">
                <div><span className="text-slate-500">Overall Grade:</span> <strong className="text-emerald-700">{selectedStudentForCard.grade}</strong></div>
                <div><span className="text-slate-500">Attendance:</span> <strong className="text-blue-700">{selectedStudentForCard.attendancePct}%</strong></div>
                <div><span className="text-slate-500">Result Status:</span> <strong className="text-emerald-700 uppercase">{selectedStudentForCard.status}</strong></div>
              </div>
            </div>

            {/* Subject Marks Breakdown */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3">Theory</th>
                    <th className="py-2 px-3">Practical</th>
                    <th className="py-2 px-3">Internal</th>
                    <th className="py-2 px-3 font-bold text-slate-900">Total</th>
                    <th className="py-2 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-800">Core Subject (Paper I)</td>
                    <td className="py-2 px-3 font-mono">{selectedStudentForCard.theory} / 70</td>
                    <td className="py-2 px-3 font-mono">{selectedStudentForCard.practical} / 20</td>
                    <td className="py-2 px-3 font-mono">{selectedStudentForCard.internal} / 10</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{selectedStudentForCard.totalObtained} / 100</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">{selectedStudentForCard.grade}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Signatures & Seal */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
              <div>
                <div className="h-8 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center font-serif text-slate-800 text-xs italic">
                  Class Teacher
                </div>
                <span>Class Teacher Sign</span>
              </div>
              <div>
                <div className="h-8 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center font-serif text-slate-800 text-xs italic">
                  Controller of Exams
                </div>
                <span>Exam Controller</span>
              </div>
              <div>
                <div className="h-8 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center font-serif text-slate-800 text-xs italic font-bold">
                  Principal Seal
                </div>
                <span>Principal Approval</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Card
                </button>
                <button
                  onClick={() => alert(`Progress Card for ${selectedStudentForCard.name} downloaded as PDF.`)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
