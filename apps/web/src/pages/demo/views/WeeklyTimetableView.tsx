import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Building2,
  Users,
  Download,
  Printer,
  Sparkles,
  BookOpen,
  FlaskConical,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Filter,
  UserCheck,
  Layers,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { useDemoStore } from '../../../store/demoStore';

interface PeriodItem {
  id: string;
  time: string;
  subject: string;
  subjectCode: string;
  teacher: string;
  room: string;
  type: 'theory' | 'lab' | 'break' | 'assembly' | 'sports' | 'library';
  batch?: string;
}

export const WeeklyTimetableView: React.FC = () => {
  const { staffMembers } = useDemoStore();

  const classOptions = [
    { id: 'PUC_1_PCMB_A', label: 'I PUC – Science (PCMB Section A)', level: 'PU College', room: 'ST-101' },
    { id: 'PUC_1_PCMB_B', label: 'I PUC – Science (PCMB Section B)', level: 'PU College', room: 'ST-102' },
    { id: 'PUC_1_COMM_A', label: 'I PUC – Commerce (CEBA Section A)', level: 'PU College', room: 'CT-201' },
    { id: 'PUC_2_PCMB_A', label: 'II PUC – Science (PCMB Section A)', level: 'PU College', room: 'ST-301' },
    { id: 'CLASS_10_A', label: 'Class 10 – Section A (CBSE High School)', level: 'High School', room: 'HS-401' },
    { id: 'CLASS_9_A', label: 'Class 9 – Section A (CBSE High School)', level: 'High School', room: 'HS-302' },
    { id: 'DEG_BCA_1', label: 'BCA – 1st Semester (Computer Applications)', level: 'Degree College', room: 'UG-105' },
  ];

  const [selectedClassId, setSelectedClassId] = useState<string>('PUC_1_PCMB_A');
  const [activeDayFilter, setActiveDayFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'DAY_LIST'>('GRID');

  const selectedClass = classOptions.find(c => c.id === selectedClassId) || classOptions[0];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Master schedule data matrix
  const schedulesByClass: Record<string, Record<string, PeriodItem[]>> = {
    PUC_1_PCMB_A: {
      Monday: [
        { id: 'M0', time: '08:30 - 08:45', subject: 'Morning Assembly & Value Thought', subjectCode: 'GEN-ASM', teacher: 'Campus Chaplain', room: 'Auditorium', type: 'assembly' },
        { id: 'M1', time: '08:45 - 09:40', subject: 'Physics (Mechanics & Newton Laws)', subjectCode: 'PHY-101', teacher: 'Dr. V. Murthy', room: selectedClass.room, type: 'theory' },
        { id: 'M2', time: '09:40 - 10:35', subject: 'Chemistry (Chemical Bonding)', subjectCode: 'CHE-101', teacher: 'Prof. S. Joshi', room: selectedClass.room, type: 'theory' },
        { id: 'MB1', time: '10:35 - 10:50', subject: 'Mid-Morning Nutrition Interval', subjectCode: 'BRK', teacher: '', room: 'Campus Cafeteria', type: 'break' },
        { id: 'M3', time: '10:50 - 11:45', subject: 'Mathematics (Calculus & Functions)', subjectCode: 'MAT-101', teacher: 'Mrs. K. Swamy', room: selectedClass.room, type: 'theory' },
        { id: 'M4', time: '11:45 - 13:15', subject: 'Physics Lab (Optics & Ray Bench)', subjectCode: 'PHY-PRAC', teacher: 'Dr. V. Murthy & Lab Asst', room: 'Physics Lab II', type: 'lab', batch: 'Batch A1' },
        { id: 'MB2', time: '13:15 - 14:00', subject: 'Lunch & Student Fellowship Hour', subjectCode: 'LUNCH', teacher: '', room: 'Dining Hall', type: 'break' },
        { id: 'M5', time: '14:00 - 14:55', subject: 'Biology (Cell Biology & Genetics)', subjectCode: 'BIO-101', teacher: 'Dr. R. Nair', room: selectedClass.room, type: 'theory' },
        { id: 'M6', time: '14:55 - 15:45', subject: 'English (Communication & Prose)', subjectCode: 'ENG-101', teacher: 'Ms. P. Rao', room: selectedClass.room, type: 'theory' },
      ],
      Tuesday: [
        { id: 'T1', time: '08:30 - 09:25', subject: 'Mathematics (Trigonometry & Vectors)', subjectCode: 'MAT-101', teacher: 'Mrs. K. Swamy', room: selectedClass.room, type: 'theory' },
        { id: 'T2', time: '09:25 - 10:20', subject: 'Physics (Thermodynamics & Heat)', subjectCode: 'PHY-101', teacher: 'Dr. V. Murthy', room: selectedClass.room, type: 'theory' },
        { id: 'TB1', time: '10:20 - 10:35', subject: 'Mid-Morning Interval', subjectCode: 'BRK', teacher: '', room: 'Cafeteria', type: 'break' },
        { id: 'T3', time: '10:35 - 12:05', subject: 'Chemistry Lab (Titration & Analysis)', subjectCode: 'CHE-PRAC', teacher: 'Prof. S. Joshi', room: 'Chemistry Lab I', type: 'lab', batch: 'Batch A1' },
        { id: 'T4', time: '12:05 - 13:00', subject: 'Biology (Plant Physiology)', subjectCode: 'BIO-101', teacher: 'Dr. R. Nair', room: selectedClass.room, type: 'theory' },
        { id: 'TB2', time: '13:00 - 13:50', subject: 'Lunch Break', subjectCode: 'LUNCH', teacher: '', room: 'Dining Hall', type: 'break' },
        { id: 'T5', time: '13:50 - 14:45', subject: 'Computer Science (Python & Algorithms)', subjectCode: 'CS-101', teacher: 'Mr. A. Kumar', room: 'Computer Lab 3', type: 'lab' },
        { id: 'T6', time: '14:45 - 15:45', subject: 'Library & Guided NEET Problem Solving', subjectCode: 'LIB-NEET', teacher: 'Faculty Mentors', room: 'Central Library', type: 'library' },
      ],
      Wednesday: [
        { id: 'W1', time: '08:30 - 09:25', subject: 'Biology (Human Anatomy & Physiology)', subjectCode: 'BIO-101', teacher: 'Dr. R. Nair', room: selectedClass.room, type: 'theory' },
        { id: 'W2', time: '09:25 - 10:20', subject: 'Chemistry (Organic Chemistry)', subjectCode: 'CHE-101', teacher: 'Prof. S. Joshi', room: selectedClass.room, type: 'theory' },
        { id: 'WB1', time: '10:20 - 10:35', subject: 'Mid-Morning Interval', subjectCode: 'BRK', teacher: '', room: 'Cafeteria', type: 'break' },
        { id: 'W3', time: '10:35 - 11:30', subject: 'Mathematics (Matrices & Determinants)', subjectCode: 'MAT-101', teacher: 'Mrs. K. Swamy', room: selectedClass.room, type: 'theory' },
        { id: 'W4', time: '11:30 - 13:00', subject: 'Biology Lab (Microscopy & Specimens)', subjectCode: 'BIO-PRAC', teacher: 'Dr. R. Nair', room: 'Biology Lab II', type: 'lab', batch: 'Batch A1' },
        { id: 'WB2', time: '13:00 - 13:50', subject: 'Lunch Break', subjectCode: 'LUNCH', teacher: '', room: 'Dining Hall', type: 'break' },
        { id: 'W5', time: '13:50 - 14:45', subject: 'Physics (Electromagnetism Introduction)', subjectCode: 'PHY-101', teacher: 'Dr. V. Murthy', room: selectedClass.room, type: 'theory' },
        { id: 'W6', time: '14:45 - 15:45', subject: 'Physical Education & Sports Fitness', subjectCode: 'PED-101', teacher: 'Coach R. Singh', room: 'Main Sports Complex', type: 'sports' },
      ],
      Thursday: [
        { id: 'TH1', time: '08:30 - 09:25', subject: 'Chemistry (Periodic Table & Kinetics)', subjectCode: 'CHE-101', teacher: 'Prof. S. Joshi', room: selectedClass.room, type: 'theory' },
        { id: 'TH2', time: '09:25 - 10:20', subject: 'Mathematics (Coordinate Geometry)', subjectCode: 'MAT-101', teacher: 'Mrs. K. Swamy', room: selectedClass.room, type: 'theory' },
        { id: 'THB1', time: '10:20 - 10:35', subject: 'Mid-Morning Interval', subjectCode: 'BRK', teacher: '', room: 'Cafeteria', type: 'break' },
        { id: 'TH3', time: '10:35 - 11:30', subject: 'Physics (Waves & Oscillations)', subjectCode: 'PHY-101', teacher: 'Dr. V. Murthy', room: selectedClass.room, type: 'theory' },
        { id: 'TH4', time: '11:30 - 12:25', subject: 'English (Essay & Analytical Writing)', subjectCode: 'ENG-101', teacher: 'Ms. P. Rao', room: selectedClass.room, type: 'theory' },
        { id: 'TH5', time: '12:25 - 13:10', subject: 'Biology (Genetics & Biotechnology)', subjectCode: 'BIO-101', teacher: 'Dr. R. Nair', room: selectedClass.room, type: 'theory' },
        { id: 'THB2', time: '13:10 - 14:00', subject: 'Lunch Break', subjectCode: 'LUNCH', teacher: '', room: 'Dining Hall', type: 'break' },
        { id: 'TH6', time: '14:00 - 15:45', subject: 'NEET Foundation & Practice Paper', subjectCode: 'NEET-TEST', teacher: 'Senior Faculty Panel', room: selectedClass.room, type: 'theory' },
      ],
      Friday: [
        { id: 'F1', time: '08:30 - 09:25', subject: 'English (Grammar & Comprehension)', subjectCode: 'ENG-101', teacher: 'Ms. P. Rao', room: selectedClass.room, type: 'theory' },
        { id: 'F2', time: '09:25 - 10:20', subject: 'Physics (Gravitation & Planetary)', subjectCode: 'PHY-101', teacher: 'Dr. V. Murthy', room: selectedClass.room, type: 'theory' },
        { id: 'FB1', time: '10:20 - 10:35', subject: 'Mid-Morning Interval', subjectCode: 'BRK', teacher: '', room: 'Cafeteria', type: 'break' },
        { id: 'F3', time: '10:35 - 12:05', subject: 'Mathematics Problem Solving Lab', subjectCode: 'MAT-PRAC', teacher: 'Mrs. K. Swamy', room: 'Math Computational Room', type: 'lab' },
        { id: 'F4', time: '12:05 - 13:00', subject: 'Chemistry (Environmental Chemistry)', subjectCode: 'CHE-101', teacher: 'Prof. S. Joshi', room: selectedClass.room, type: 'theory' },
        { id: 'FB2', time: '13:00 - 13:50', subject: 'Lunch Break', subjectCode: 'LUNCH', teacher: '', room: 'Dining Hall', type: 'break' },
        { id: 'F5', time: '13:50 - 14:45', subject: 'Biology (Ecology & Ecosystems)', subjectCode: 'BIO-101', teacher: 'Dr. R. Nair', room: selectedClass.room, type: 'theory' },
        { id: 'F6', time: '14:45 - 15:45', subject: 'Student Counseling & Mentor Review', subjectCode: 'MENTOR', teacher: 'Class Teacher', room: selectedClass.room, type: 'assembly' },
      ],
      Saturday: [
        { id: 'S1', time: '08:30 - 09:25', subject: 'Weekly Physics Revision & Quiz', subjectCode: 'PHY-REV', teacher: 'Dr. V. Murthy', room: selectedClass.room, type: 'theory' },
        { id: 'S2', time: '09:25 - 10:20', subject: 'Weekly Chemistry Formulas & Viva', subjectCode: 'CHE-REV', teacher: 'Prof. S. Joshi', room: selectedClass.room, type: 'theory' },
        { id: 'SB1', time: '10:20 - 10:35', subject: 'Mid-Morning Interval', subjectCode: 'BRK', teacher: '', room: 'Cafeteria', type: 'break' },
        { id: 'S3', time: '10:35 - 11:30', subject: 'Mathematics Speed Calculation Drill', subjectCode: 'MAT-REV', teacher: 'Mrs. K. Swamy', room: selectedClass.room, type: 'theory' },
        { id: 'S4', time: '11:30 - 12:45', subject: 'Club Activities / Science Fair Projects', subjectCode: 'CLUB-ACT', teacher: 'Club Coordinators', room: 'Innovation Hub', type: 'sports' },
      ],
    },
  };

  const currentSchedule = schedulesByClass[selectedClassId] || schedulesByClass['PUC_1_PCMB_A'];

  // Metrics computation
  const allPeriods = Object.values(currentSchedule).flat();
  const theoryCount = allPeriods.filter(p => p.type === 'theory').length;
  const labCount = allPeriods.filter(p => p.type === 'lab').length;
  const totalTeachingHours = theoryCount + (labCount * 1.5);
  const facultySet = new Set(allPeriods.map(p => p.teacher).filter(Boolean));

  const getTypeStyle = (type: PeriodItem['type']) => {
    switch (type) {
      case 'theory':
        return {
          bg: 'bg-blue-50/70 hover:bg-blue-100/80 border-blue-200 text-blue-950',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          indicator: 'bg-blue-600',
        };
      case 'lab':
        return {
          bg: 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          indicator: 'bg-amber-600',
        };
      case 'break':
        return {
          bg: 'bg-slate-50/90 border-dashed border-slate-200 text-slate-500',
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          indicator: 'bg-slate-400',
        };
      case 'assembly':
        return {
          bg: 'bg-purple-50/70 hover:bg-purple-100/80 border-purple-200 text-purple-950',
          badge: 'bg-purple-100 text-purple-800 border-purple-300',
          indicator: 'bg-purple-600',
        };
      case 'sports':
        return {
          bg: 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          indicator: 'bg-emerald-600',
        };
      case 'library':
        return {
          bg: 'bg-indigo-50/70 hover:bg-indigo-100/80 border-indigo-200 text-indigo-950',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          indicator: 'bg-indigo-600',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          indicator: 'bg-slate-500',
        };
    }
  };

  const displayedDays = activeDayFilter === 'ALL' ? days : [activeDayFilter];

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              Academic Master Schedule 2026–2027
            </span>
            <span className="text-xs text-slate-500 font-medium">Semester 1 • Official Institutional Timetable</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Weekly Academic & Laboratory Timetable</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete period allocations, science practical laboratories, faculty assignments and classroom schedules across 6 working days.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Class Switcher */}
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {classOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Schedule
          </button>

          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class & Room</p>
          <p className="text-sm font-black text-slate-900 mt-1 truncate">{selectedClass.label.split('–')[0]}</p>
          <p className="text-[11px] text-blue-600 font-bold mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Room {selectedClass.room}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Teaching Hours</p>
          <p className="text-xl font-black text-blue-700 mt-1">{totalTeachingHours} Hrs / Wk</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{theoryCount} Theory • {labCount} Labs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Science Practical Labs</p>
          <p className="text-xl font-black text-amber-600 mt-1">{labCount} Sessions</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Physics, Chem, Bio & CS</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Faculty</p>
          <p className="text-xl font-black text-purple-700 mt-1">{facultySet.size} Teachers</p>
          <p className="text-[11px] text-purple-800 font-medium mt-0.5">100% Rostered & Verified</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Academic Week</p>
          <p className="text-xl font-black text-emerald-600 mt-1">6 Days Active</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Mon–Sat • Full Curriculum</p>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Day Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Day:
          </span>
          <button
            type="button"
            onClick={() => setActiveDayFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeDayFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All 6 Days
          </button>
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDayFilter(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDayFilter === day
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Theory Lecture
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Practical Lab
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Sports / Activity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Interval / Lunch
          </span>
        </div>
      </div>

      {/* Main Timetable Matrix View */}
      <div className="space-y-4">
        {displayedDays.map((day) => {
          const periods = currentSchedule[day] || [];
          const isSaturday = day === 'Saturday';

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Day Header */}
              <div
                className={`px-6 py-3.5 border-b flex items-center justify-between ${
                  isSaturday
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {day}
                  </h3>
                  {isSaturday && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                      Half-Day & Club Enrichment
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">
                    {periods.filter(p => p.type !== 'break').length} Academic Slots
                  </span>
                  <span>•</span>
                  <span>Room {selectedClass.room}</span>
                </div>
              </div>

              {/* Day Period Schedule Cards */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {periods.map((period) => {
                  const style = getTypeStyle(period.type);

                  if (period.type === 'break') {
                    return (
                      <div
                        key={period.id}
                        className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-4"
                      >
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-bold">
                          <Coffee className="w-4 h-4 text-slate-400" />
                          <span>{period.subject}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({period.room})</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-500">{period.time}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={period.id}
                      className={`p-4 rounded-xl border transition-all duration-150 ${style.bg} space-y-2.5 shadow-2xs`}
                    >
                      {/* Top Time and Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-mono font-black text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">
                          {period.time}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}>
                          {period.type === 'theory' ? 'Theory' : period.type === 'lab' ? 'Lab Practical' : period.type}
                        </span>
                      </div>

                      {/* Subject Name and Code */}
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {period.subjectCode} {period.batch && `• ${period.batch}`}
                        </div>
                        <h4 className="font-black text-slate-900 text-sm mt-0.5 leading-snug line-clamp-2">
                          {period.subject}
                        </h4>
                      </div>

                      {/* Teacher and Room */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold text-slate-800 text-[11px] truncate">
                            {period.teacher || 'Class Teacher'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{period.room}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
