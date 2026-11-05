import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Layers
} from 'lucide-react';
import { useDemoStore, DemoStaffMember } from '../../store/demoStore';
import { useAuthStore } from '../../store/authStore';

interface CreateFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (staff: DemoStaffMember) => void;
}

export const CreateFacultyModal: React.FC<CreateFacultyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addStaffMember } = useDemoStore();
  const { tenant } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'employment'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const autoEmpId = `EMP-2026-${Math.floor(100 + Math.random() * 900)}`;

  const [formData, setFormData] = useState({
    name: '',
    employee_id: autoEmpId,
    role: 'TEACHER',
    designation: 'Senior Subject Faculty',
    dept: 'Science & Mathematics',
    academic_unit: 'School' as 'School' | 'PU College' | 'Degree College' | 'All',
    email: '',
    mobile: '',
    status: 'ACTIVE' as 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE',
    joining_date: new Date().toISOString().split('T')[0],
    employment_type: 'PERMANENT' as 'PERMANENT' | 'CONTRACT' | 'PROBATION',
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!formData.email.trim() && !formData.mobile.trim()) {
      setErrorMessage('Please provide either mobile number or email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStaff: DemoStaffMember = {
        id: `stf-${Date.now()}`,
        name: formData.name.trim(),
        employee_id: formData.employee_id || autoEmpId,
        role: formData.role,
        designation: formData.designation,
        dept: formData.dept,
        academic_unit: formData.academic_unit,
        email: formData.email.trim() || `staff.${formData.employee_id.toLowerCase()}@ourschool.edu.in`,
        mobile: formData.mobile.trim() || '+91 98450 00000',
        status: formData.status,
        joining_date: formData.joining_date,
        employment_type: formData.employment_type,
      };

      addStaffMember(newStaff);

      setSuccessMessage(`Faculty member '${newStaff.name}' (${newStaff.employee_id}) onboarded successfully!`);
      if (onSuccess) onSuccess(newStaff);

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add faculty member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Add New Faculty / Staff Member</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {tenant?.name || 'EducationOS'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Staff Master Provisioning • Automatic Employee ID • Role & Academic Unit Assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> 1. Profile & Designation
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'academic'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> 2. Academic Unit & Role
          </button>
          <button
            onClick={() => setActiveTab('employment')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'employment'
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 3. Employment & Contact
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & DESIGNATION */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajeshwari Murthy"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Employee ID (Auto-Generated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employee_id}
                    onChange={(e) => handleChange('employee_id', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-teal-300 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Lecturer in Physics"
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Department
                  </label>
                  <select
                    value={formData.dept}
                    onChange={(e) => handleChange('dept', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Science & Mathematics">Science & Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Commerce & Economics">Commerce & Economics</option>
                    <option value="Languages & Humanities">Languages & Humanities</option>
                    <option value="Leadership & Administration">Leadership & Administration</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Logistics & Transport">Logistics & Transport</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC UNIT & ROLE */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Academic Unit
                  </label>
                  <select
                    value={formData.academic_unit}
                    onChange={(e) => handleChange('academic_unit', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="School">School (Primary & Secondary)</option>
                    <option value="PU College">PU College (Science & Commerce)</option>
                    <option value="Degree College">Degree College (Undergraduate)</option>
                    <option value="All">All Campuses / Central Institution</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    ERP System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="PRINCIPAL">👑 Principal / Academic Director</option>
                    <option value="VICE_PRINCIPAL">🎓 Vice Principal</option>
                    <option value="TEACHER">👩‍🏫 Teacher (School / High School)</option>
                    <option value="LECTURER">🔬 PU Lecturer (Pre-University)</option>
                    <option value="EXAM_CONTROLLER">📝 Examination Controller</option>
                    <option value="ACCOUNTANT">💰 Finance & Accounts Officer</option>
                    <option value="LIBRARIAN">📚 Librarian</option>
                    <option value="TRANSPORT_MANAGER">🚌 Transport Supervisor</option>
                    <option value="ADMISSION_OFFICER">📋 Admission Officer</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <p className="font-bold text-teal-400 uppercase text-[10px] mb-1">Role Permission Preview</p>
                {formData.role === 'PRINCIPAL' && 'Complete academic supervisory authority, student promotion approvals, and report card signing.'}
                {formData.role === 'TEACHER' && 'Class attendance register, subject marks entry, assignments, and parent communication alerts.'}
                {formData.role === 'LECTURER' && 'PU science/commerce syllabus delivery, practical lab records, and mock exam grading.'}
                {formData.role === 'ACCOUNTANT' && 'Fee collections, multi-head invoicing, thermal POS receipt issuance, and ledger reconciliations.'}
                {formData.role === 'EXAM_CONTROLLER' && 'Assessment lifecycle creation, hall ticket generation, question paper uploads, and result publication.'}
                {formData.role === 'LIBRARIAN' && 'Book catalogue master, barcode scanning, student lending logs, and overdue fine collection.'}
                {formData.role === 'TRANSPORT_MANAGER' && 'Bus route assignment, GPS tracking device status, and driver roster maintenance.'}
              </div>
            </div>
          )}

          {/* TAB 3: EMPLOYMENT & CONTACT */}
          {activeTab === 'employment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98450 12345"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Official Institutional Email
                  </label>
                  <input
                    type="email"
                    placeholder="faculty@ourschool.edu.in"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleChange('employment_type', e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="PERMANENT">Permanent / Tenured</option>
                    <option value="PROBATION">Probationary (1 Year)</option>
                    <option value="CONTRACT">Contractual / Visiting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => handleChange('joining_date', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {activeTab !== 'profile' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'employment' ? 'academic' : 'profile')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Back
                </button>
              )}
              {activeTab !== 'employment' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'profile' ? 'academic' : 'employment')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Next Step &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : '✓ Complete Staff Onboarding'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

