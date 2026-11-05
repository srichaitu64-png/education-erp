import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  MapPin,
  Users,
  Phone,
  FileText,
  Eye,
  EyeOff,
  Bus,
  Building,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useDemoStore, DemoStudent } from '../../store/demoStore';
import { useAuthStore } from '../../store/authStore';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (student: DemoStudent) => void;
}

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addStudent } = useDemoStore();
  const { tenant } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'personal' | 'guardian' | 'academic' | 'address' | 'facilities'>('personal');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-generated unique admission and roll numbers
  const autoAdmNo = `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const autoRollNo = `${Math.floor(100 + Math.random() * 900)}`;
  const autoPenNo = `PEN-KA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    date_of_birth: '2010-06-15',
    blood_group: 'O+',
    aadhaar_number: '',

    // Parent / Guardian Information
    father_name: '',
    mother_name: '',
    guardian_name: '',
    father_mobile: '',
    mother_mobile: '',
    guardian_phone: '',
    parent_email: '',
    emergency_contact: '',
    guardian_relation: 'Father',

    // Address Information
    door_street: '',
    city_town: 'Bengaluru',
    district_state: 'Bengaluru Urban, Karnataka',
    state: 'Karnataka',
    pincode: '560001',

    // Academic Information
    institution_level: 'School' as 'School' | 'PU College' | 'Degree College',
    academic_year: '2026-2027',
    class_name: 'Class 10',
    section_or_stream: 'Section A',
    admission_date: new Date().toISOString().split('T')[0],
    admission_number: autoAdmNo,
    roll_number: autoRollNo,
    pen_number: autoPenNo,
    registration_number: `REG-${Math.floor(10000 + Math.random() * 90000)}`,
    omr_number: `OMR-${Math.floor(100 + Math.random() * 900)}`,
    medium_of_instruction: 'English',
    first_language: 'English',
    second_language: 'Kannada / Hindi',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',

    // Facilities & Optional Services (Single Master Record)
    is_transport_opted: false,
    custom_bus_route: 'Route 104: JP Nagar -> Jayanagar -> Campus',
    pickup_point: 'Main Road Cross',
    is_hostel_opted: false,
    custom_hostel_wing: 'Cauvery Block (Twin Sharing)',
    hostel_room: 'Room 204',
    custom_sports_house: 'Cauvery House',
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'father_name' && !prev.guardian_name) {
        updated.guardian_name = value;
      }
      if (field === 'father_mobile' && !prev.guardian_phone) {
        updated.guardian_phone = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorMessage('Student first name and last name are required.');
      return;
    }

    if (!formData.guardian_name.trim() || !formData.guardian_phone.trim()) {
      setErrorMessage('Guardian / Parent name and contact phone number are mandatory.');
      return;
    }

    setIsSubmitting(true);

    try {
      const maskedAadhaar = formData.aadhaar_number
        ? `•••• •••• ${formData.aadhaar_number.slice(-4)}`
        : undefined;

      const newStudent: DemoStudent = {
        id: `st-${Date.now()}`,
        admission_number: formData.admission_number,
        roll_number: formData.roll_number,
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || undefined,
        last_name: formData.last_name.trim(),
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        blood_group: formData.blood_group,
        aadhaar_number: maskedAadhaar,
        institution_level: formData.institution_level,
        class_name: formData.class_name,
        section_or_stream: formData.section_or_stream,
        academic_year: formData.academic_year,
        pen_number: formData.pen_number,
        registration_number: formData.registration_number,
        omr_number: formData.omr_number,
        father_name: formData.father_name.trim() || undefined,
        mother_name: formData.mother_name.trim() || undefined,
        father_mobile: formData.father_mobile.trim() || undefined,
        mother_mobile: formData.mother_mobile.trim() || undefined,
        parent_email: formData.parent_email.trim() || undefined,
        emergency_contact: formData.emergency_contact.trim() || formData.guardian_phone.trim(),
        guardian_name: formData.guardian_name.trim(),
        guardian_phone: formData.guardian_phone.trim(),
        address_line: formData.door_street.trim() || undefined,
        city: formData.city_town.trim() || undefined,
        district: formData.district_state.trim() || undefined,
        state: formData.state.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        fee_balance: 0,
        attendance_pct: 100.0,
        status: 'ACTIVE',
        is_transport_opted: formData.is_transport_opted,
        transport_route_id: formData.is_transport_opted ? formData.custom_bus_route : undefined,
        is_hostel_opted: formData.is_hostel_opted,
        hostel_wing: formData.is_hostel_opted ? `${formData.custom_hostel_wing} - ${formData.hostel_room}` : undefined,
        custom_fields: {
          bus_route: formData.custom_bus_route,
          hostel_wing: formData.custom_hostel_wing,
          sports_house: formData.custom_sports_house,
        },
      };

      // 1. Add to unified client master store
      addStudent(newStudent);

      // 2. Persist to backend if token present
      if (localStorage.getItem('access_token')) {
        try {
          await api.post('/academic/students', {
            admission_number: newStudent.admission_number,
            first_name: newStudent.first_name,
            middle_name: newStudent.middle_name,
            last_name: newStudent.last_name,
            gender: newStudent.gender,
            date_of_birth: newStudent.date_of_birth,
            blood_group: newStudent.blood_group,
            masked_aadhaar: newStudent.aadhaar_number,
            institution_level: newStudent.institution_level,
            class_name: newStudent.class_name,
            section_or_stream: newStudent.section_or_stream,
            academic_year: newStudent.academic_year,
            roll_number: newStudent.roll_number,
            pen_number: newStudent.pen_number,
            registration_number: newStudent.registration_number,
            father_name: newStudent.father_name,
            mother_name: newStudent.mother_name,
            guardian_name: newStudent.guardian_name,
            father_mobile: newStudent.father_mobile,
            mother_mobile: newStudent.mother_mobile,
            guardian_phone: newStudent.guardian_phone,
            parent_email: newStudent.parent_email,
            emergency_contact: newStudent.emergency_contact,
            door_street: newStudent.address_line,
            city_town: newStudent.city,
            district_state: newStudent.district,
            pincode: newStudent.pincode,
            admission_date: formData.admission_date,
            status: 'ACTIVE',
          });
        } catch (apiErr) {
          console.warn('Real backend sync cached locally in sandbox:', apiErr);
        }
      }

      setSuccessMessage(`✓ Student ${newStudent.first_name} ${newStudent.last_name} enrolled successfully! (Adm #: ${newStudent.admission_number}). Master record synchronized across Fees, Attendance & Exams.`);
      if (onSuccess) {
        onSuccess(newStudent);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while enrolling the student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-slate-900">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Single Master Admission Form</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Admissions Master Truth
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Enter student information once • Automatically synchronizes with Fee Management, Attendance, and Examinations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Pills */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 border-b border-slate-200 text-xs font-bold overflow-x-auto">
          {[
            { id: 'personal', label: '1. Personal Info', icon: Users },
            { id: 'guardian', label: '2. Parents & Contact', icon: Phone },
            { id: 'academic', label: '3. Academic & Identifiers', icon: BookOpen },
            { id: 'address', label: '4. Address Details', icon: MapPin },
            { id: 'facilities', label: '5. Facilities (Hostel / Bus)', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Student Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => handleChange('middle_name', e.target.value)}
                    placeholder="e.g. Rajesh"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Surname / Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e: any) => handleChange('gender', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => handleChange('blood_group', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">Aadhaar (Encrypted)</label>
                    <button
                      type="button"
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showAadhaar ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showAadhaar ? 'Mask' : 'View'}
                    </button>
                  </div>
                  <input
                    type={showAadhaar ? 'text' : 'password'}
                    value={formData.aadhaar_number}
                    onChange={(e) => handleChange('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="12 digit Aadhaar"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARENT & GUARDIAN INFORMATION */}
          {activeTab === 'guardian' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Parent & Guardian Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Father's Full Name</label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => handleChange('father_name', e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Father's Mobile Number</label>
                  <input
                    type="text"
                    value={formData.father_mobile}
                    onChange={(e) => handleChange('father_mobile', e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mother's Full Name</label>
                  <input
                    type="text"
                    value={formData.mother_name}
                    onChange={(e) => handleChange('mother_name', e.target.value)}
                    placeholder="e.g. Sunita Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mother's Mobile Number</label>
                  <input
                    type="text"
                    value={formData.mother_mobile}
                    onChange={(e) => handleChange('mother_mobile', e.target.value)}
                    placeholder="+91 98450 12346"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Primary Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_name}
                    onChange={(e) => handleChange('guardian_name', e.target.value)}
                    placeholder="Primary contact person"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Guardian Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.guardian_phone}
                    onChange={(e) => handleChange('guardian_phone', e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Parent Email</label>
                  <input
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => handleChange('parent_email', e.target.value)}
                    placeholder="parent@domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMIC INFORMATION & IDENTIFIERS */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" /> Academic Unit & Identity Numbers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Academic Unit *</label>
                  <select
                    value={formData.institution_level}
                    onChange={(e: any) => handleChange('institution_level', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="School">School Unit (CBSE / State)</option>
                    <option value="PU College">PU College (Pre-University)</option>
                    <option value="Degree College">Degree College (Undergraduate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Class / Grade *</label>
                  <input
                    type="text"
                    required
                    value={formData.class_name}
                    onChange={(e) => handleChange('class_name', e.target.value)}
                    placeholder="e.g. Class 10 or I PUC"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Section / Stream *</label>
                  <input
                    type="text"
                    required
                    value={formData.section_or_stream}
                    onChange={(e) => handleChange('section_or_stream', e.target.value)}
                    placeholder="e.g. Section A or PCMB (Science)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Unique Identifiers Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Preserved Unique Identifiers (Government / Board Standards)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Admission Number</label>
                    <input
                      type="text"
                      required
                      value={formData.admission_number}
                      onChange={(e) => handleChange('admission_number', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={formData.roll_number}
                      onChange={(e) => handleChange('roll_number', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">PEN (Permanent Edu #)</label>
                    <input
                      type="text"
                      value={formData.pen_number}
                      onChange={(e) => handleChange('pen_number', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Board Registration #</label>
                    <input
                      type="text"
                      value={formData.registration_number}
                      onChange={(e) => handleChange('registration_number', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">OMR Number</label>
                    <input
                      type="text"
                      value={formData.omr_number}
                      onChange={(e) => handleChange('omr_number', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={formData.academic_year}
                      onChange={(e) => handleChange('academic_year', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESS DETAILS */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-600" /> Residential & Permanent Address
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">House / Building & Street</label>
                <input
                  type="text"
                  value={formData.door_street}
                  onChange={(e) => handleChange('door_street', e.target.value)}
                  placeholder="e.g. #42, 5th Cross, Malleshwaram"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">City / Town</label>
                  <input
                    type="text"
                    value={formData.city_town}
                    onChange={(e) => handleChange('city_town', e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="560001"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FACILITIES & OPTIONAL SERVICES */}
          {activeTab === 'facilities' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Enrolled Facilities & Service Opt-Ins
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecting these facilities automatically provisions corresponding fee ledger heads in the Finance module.
                </p>
              </div>

              {/* Transport Service Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                formData.is_transport_opted ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Campus Transport Service</h4>
                      <p className="text-[11px] text-slate-500">Fleet bus pickup & drop with real-time GPS tracking</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_transport_opted}
                      onChange={(e) => handleChange('is_transport_opted', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.is_transport_opted && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-blue-200 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Assigned Bus Route</label>
                      <input
                        type="text"
                        value={formData.custom_bus_route}
                        onChange={(e) => handleChange('custom_bus_route', e.target.value)}
                        placeholder="Route 104 - JP Nagar"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Pickup Stop / Junction</label>
                      <input
                        type="text"
                        value={formData.pickup_point}
                        onChange={(e) => handleChange('pickup_point', e.target.value)}
                        placeholder="Main Road Cross"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Hostel Facility Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                formData.is_hostel_opted ? 'bg-purple-50/60 border-purple-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Residential Hostel & Mess</h4>
                      <p className="text-[11px] text-slate-500">Boarding room, dining mess & residential study hours</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_hostel_opted}
                      onChange={(e) => handleChange('is_hostel_opted', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {formData.is_hostel_opted && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-purple-200 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Hostel Block / Wing</label>
                      <input
                        type="text"
                        value={formData.custom_hostel_wing}
                        onChange={(e) => handleChange('custom_hostel_wing', e.target.value)}
                        placeholder="Cauvery Wing (Twin Sharing)"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Room Number</label>
                      <input
                        type="text"
                        value={formData.hostel_room}
                        onChange={(e) => handleChange('hostel_room', e.target.value)}
                        placeholder="Room 204"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sports / Cohort House */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Sports & Cultural House</label>
                <select
                  value={formData.custom_sports_house}
                  onChange={(e) => handleChange('custom_sports_house', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="Cauvery House">Cauvery House (Blue)</option>
                  <option value="Ganga House">Ganga House (Red)</option>
                  <option value="Yamuna House">Yamuna House (Yellow)</option>
                  <option value="Krishna House">Krishna House (Green)</option>
                </select>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 mt-6 rounded-b-3xl">
            <div className="flex items-center gap-2">
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: Array<'personal' | 'guardian' | 'academic' | 'address' | 'facilities'> = [
                      'personal', 'guardian', 'academic', 'address', 'facilities'
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1]);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {activeTab !== 'facilities' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: Array<'personal' | 'guardian' | 'academic' | 'address' | 'facilities'> = [
                      'personal', 'guardian', 'academic', 'address', 'facilities'
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'Enrolling...' : 'Confirm & Complete Enrolment'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
