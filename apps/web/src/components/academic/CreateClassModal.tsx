import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
  Building2
} from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addAcademicSection, staffMembers } = useDemoStore();

  const [courseLevel, setCourseLevel] = useState<'School' | 'PU College' | 'Degree College'>('School');
  const [className, setClassName] = useState('');
  const [sectionCode, setSectionCode] = useState('A');
  const [stream, setStream] = useState('General');
  const [roomNumber, setRoomNumber] = useState('Room S-105');
  const [maxCapacity, setMaxCapacity] = useState('40');
  const [classTeacher, setClassTeacher] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!className.trim()) {
      setErrorMessage('Class name is required (e.g. Class 7, I PUC Science).');
      return;
    }

    const capacity = parseInt(maxCapacity, 10);
    if (isNaN(capacity) || capacity <= 0) {
      setErrorMessage('Capacity must be a positive integer.');
      return;
    }

    try {
      addAcademicSection({
        academic_year: '2026-2027',
        course_level: courseLevel,
        class_name: className.trim(),
        section_code: sectionCode.trim().toUpperCase() || 'A',
        stream: stream.trim() || 'General',
        room_number: roomNumber.trim() || 'Room S-101',
        max_capacity: capacity,
        class_teacher_name: classTeacher.trim() || 'Assigned Faculty',
        status: 'ACTIVE',
      });

      setSuccessMessage(`Class '${className.trim()} - Section ${sectionCode.trim().toUpperCase()}' created successfully!`);
      setTimeout(() => {
        setSuccessMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create class section.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add Academic Class / Section</h2>
              <p className="text-xs text-slate-500">Configure new classroom grade, section, capacity & teacher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Level Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Institution Academic Level *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['School', 'PU College', 'Degree College'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setCourseLevel(lvl);
                    if (lvl === 'School') setStream('General');
                    else if (lvl === 'PU College') setStream('PCMB (Science)');
                    else setStream('B.Com Accounting');
                  }}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                    courseLevel === lvl
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Class Name & Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Class / Grade Name *
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Class 8 or I PUC"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Section Code *
              </label>
              <input
                type="text"
                required
                value={sectionCode}
                onChange={(e) => setSectionCode(e.target.value)}
                placeholder="e.g. A, B, or C"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stream & Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Stream / Course
              </label>
              <input
                type="text"
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                placeholder="e.g. General, Science, Commerce"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Room / Block Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room S-204"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Capacity & Teacher */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Student Capacity *
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Class Teacher
              </label>
              <input
                type="text"
                value={classTeacher}
                onChange={(e) => setClassTeacher(e.target.value)}
                placeholder="e.g. Mrs. Priya Sharma"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Register Class</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
