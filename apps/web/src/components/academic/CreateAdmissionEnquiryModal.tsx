import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';

interface CreateAdmissionEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAdmissionEnquiryModal: React.FC<CreateAdmissionEnquiryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createAdmission } = useDemoStore();

  const [applicantName, setApplicantName] = useState('');
  const [level, setLevel] = useState('PU College');
  const [targetClass, setTargetClass] = useState('I PUC');
  const [stream, setStream] = useState('PCMB');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [source, setSource] = useState('Direct Walk-in');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!applicantName.trim()) {
      setErrorMsg('Prospective student name is required.');
      return;
    }

    if (!parentName.trim()) {
      setErrorMsg('Parent / Guardian name is mandatory.');
      return;
    }

    const cleanPhone = parentPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Parent contact number must be exactly 10 digits (e.g. 9845012345).');
      return;
    }

    createAdmission({
      applicant_name: applicantName.trim(),
      level,
      target_class: level === 'PU College' ? `${targetClass} - ${stream}` : targetClass,
      parent_name: parentName.trim(),
      parent_phone: cleanPhone,
      parent_email: parentEmail.trim() || 'contact@parent.com',
      stream_or_comb: level === 'PU College' ? stream : 'Secondary',
      stage: 'ENQUIRY',
      source,
    } as any);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-slate-900">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Register Admission Enquiry</h2>
              <p className="text-xs text-slate-500">Capture initial applicant & guardian interest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-2">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Prospective Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="e.g. Varun K. Sharma"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Unit</label>
              <select
                value={level}
                onChange={(e) => {
                  const val = e.target.value;
                  setLevel(val);
                  if (val === 'School') setTargetClass('Class 10');
                  else if (val === 'PU College') setTargetClass('I PUC');
                  else setTargetClass('B.Sc CS');
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="School">School (K-10)</option>
                <option value="PU College">PU College (11-12)</option>
                <option value="Degree College">Degree College</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Class</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {level === 'School' ? (
                  <>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </>
                ) : level === 'PU College' ? (
                  <>
                    <option value="I PUC">I PUC</option>
                    <option value="II PUC">II PUC</option>
                  </>
                ) : (
                  <>
                    <option value="B.Sc CS">B.Sc Computer Science</option>
                    <option value="B.Com">B.Com Finance</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Stream / Combination</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="PCMB">PCMB (Science)</option>
                <option value="PCMC">PCMC (Comp Sci)</option>
                <option value="Commerce">Commerce</option>
                <option value="Secondary">CBSE General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Parent / Guardian Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. K. R. Sharma"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Primary Mobile (10 Digits) <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-mono font-bold ${parentPhone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {parentPhone.length}/10 {parentPhone.length === 10 && '✓'}
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9845011223"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Guardian Email</label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="guardian@example.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enquiry Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Direct Walk-in">Direct Walk-in</option>
                <option value="Online Website Portal">Online Website Portal</option>
                <option value="Parent Referral">Parent Referral</option>
                <option value="Education Expo / Fair">Education Expo / Fair</option>
                <option value="Newspaper / Social Media">Newspaper / Social Media</option>
              </select>
            </div>
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Register Admission Enquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
