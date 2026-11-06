import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';
import { useDemoStore, MasterSubjectItem } from '../../store/demoStore';
import { api } from '../../services/api';

interface CreateMasterSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (subject: MasterSubjectItem) => void;
}

export const CreateMasterSubjectModal: React.FC<CreateMasterSubjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addMasterSubject } = useDemoStore();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MasterSubjectItem['category']>('Core Science');
  const [hasPractical, setHasPractical] = useState(false);
  const [theoryMax, setTheoryMax] = useState(80);
  const [practicalMax, setPracticalMax] = useState(20);
  const [credits, setCredits] = useState(4);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      has_practical: hasPractical,
      default_theory_max: Number(theoryMax) || 100,
      default_practical_max: hasPractical ? (Number(practicalMax) || 0) : 0,
      credits: Number(credits) || 4,
      description: description.trim() || undefined,
    };

    try {
      await api.post('/academic/subjects', payload);
    } catch (err) {
      // Gracefully continue in local demo mode if unauthenticated or offline
      console.warn('Backend API subject sync notice:', err);
    }

    addMasterSubject(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-slate-900">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Add Subject to Master Catalogue</h2>
              <p className="text-xs text-slate-500">Institution-wide master repository entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subject Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. PHY-201, ENG-101"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subject Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MasterSubjectItem['category'])}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Language">Language</option>
                <option value="Core Science">Core Science</option>
                <option value="Core Commerce">Core Commerce</option>
                <option value="Arts & Humanities">Arts & Humanities</option>
                <option value="Vocational">Vocational</option>
                <option value="Elective">Elective</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Subject Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Physics (Mechanics & Electromagnetism)"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Practical / Laboratory Component?</span>
                <span className="text-[11px] text-slate-500">Requires lab batches, experiments & practical exam</span>
              </div>
              <input
                type="checkbox"
                checked={hasPractical}
                onChange={(e) => {
                  setHasPractical(e.target.checked);
                  if (e.target.checked) {
                    setTheoryMax(70);
                    setPracticalMax(30);
                  } else {
                    setTheoryMax(100);
                    setPracticalMax(0);
                  }
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Theory Max</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={theoryMax}
                  onChange={(e) => setTheoryMax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Practical Max</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!hasPractical}
                  value={hasPractical ? practicalMax : 0}
                  onChange={(e) => setPracticalMax(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Credits</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description / Syllabus Scope (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Prescribed textbook, curriculum reference, or prerequisite courses."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save to Master Catalogue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
