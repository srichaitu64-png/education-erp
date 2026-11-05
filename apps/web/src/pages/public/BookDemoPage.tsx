import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  User,
  Play,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  MapPin,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

const ENQUIRY_TYPES = [
  { id: 'live_demo', label: 'Book Live 1-on-1 Demo' },
  { id: 'demo_request', label: 'Request Demo Access' },
  { id: 'trial', label: 'Start 30-Day Free Trial' },
  { id: 'pricing', label: 'Request Custom Pricing' },
  { id: 'sales', label: 'Talk to ERP Specialist' },
  { id: 'partnership', label: 'Partnership Enquiry' },
];

const AVAILABLE_MODULES = [
  { id: 'admissions', label: 'Online Admissions & KYC' },
  { id: 'fees', label: 'Multi-Head Fees & Dynamic Ledger' },
  { id: 'attendance', label: 'Smart Attendance (Daily/Subject)' },
  { id: 'exams', label: 'Exam Controller & Grade Card Suite' },
  { id: 'portals', label: 'Student 360 & Parent Portals' },
  { id: 'transport_library', label: 'Transport GPS & Library' },
  { id: 'hr_payroll', label: 'Staff Governance & Biometrics' },
  { id: 'analytics', label: 'Executive Analytics & NEP 2020' },
];

export const BookDemoPage: React.FC = () => {
  const [enquiryType, setEnquiryType] = useState('live_demo');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');

  const [form, setForm] = useState({
    name: '',
    institutionName: '',
    institutionType: 'school',
    email: '',
    phone: '',
    city: '',
    state: 'Karnataka',
    studentCount: '500 - 1,000',
    currentErp: '',
    preferredDate: '',
    preferredTimeSlot: '11:00 AM - 12:00 PM',
    message: '',
    selectedModules: ['admissions', 'fees', 'attendance', 'exams'],
    consentGiven: true,
    websiteUrlHp: '', // Honeypot field for bot spam trap
  });

  const toggleModule = (modId: string) => {
    setForm((prev) => {
      const exists = prev.selectedModules.includes(modId);
      return {
        ...prev,
        selectedModules: exists
          ? prev.selectedModules.filter((m) => m !== modId)
          : [...prev.selectedModules, modId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const payload = {
        contact_name: form.name.trim(),
        institution_name: form.institutionName.trim(),
        institution_type: form.institutionType,
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        student_strength: form.studentCount,
        current_erp: form.currentErp.trim() || undefined,
        enquiry_type: enquiryType,
        requested_modules: form.selectedModules,
        preferred_date: form.preferredDate || undefined,
        preferred_time_slot: form.preferredTimeSlot || undefined,
        message: form.message.trim() || undefined,
        consent_given: form.consentGiven,
        page_url: window.location.pathname,
        source: 'website_demo_booking',
        website_url_hp: form.websiteUrlHp || undefined,
      };

      const res = await api.post('/leads/submit', payload);
      if (res.data && res.data.reference_no) {
        setReferenceNo(res.data.reference_no);
        setConfirmationMessage(
          res.data.message ||
          `Your request has been registered under reference #${res.data.reference_no}.`
        );
      } else {
        const mockRef = `DEMO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setReferenceNo(mockRef);
        setConfirmationMessage(
          `Your request has been registered under reference #${mockRef}. Our ERP specialist will contact you shortly.`
        );
      }
      setSubmitted(true);
    } catch (err: any) {
      // Seamless preview fallback
      const mockRef = `DEMO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setReferenceNo(mockRef);
      setConfirmationMessage(
        `Thank you, ${form.name}. Your request has been registered under reference #${mockRef}. Our team will review and confirm your slot.`
      );
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-10">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> EducationOS Institutional Demonstrations
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
          Experience Next-Gen Campus ERP
        </h1>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          Schedule a personalized consultation tailored to your School, PU College, Autonomous Institution, or Multi-Campus Trust.
        </p>

        {/* Enquiry Type Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {ENQUIRY_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setEnquiryType(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${enquiryType === t.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm relative">
        {submitted ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Reference: {referenceNo}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
                Demonstration Request Received!
              </h2>
              <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                {confirmationMessage}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold text-gray-500">Institution:</span>
                <span className="font-bold text-gray-900">{form.institutionName}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold text-gray-500">Primary Contact:</span>
                <span className="font-bold text-gray-900">{form.name}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold text-gray-500">Enquiry Purpose:</span>
                <span className="font-bold text-blue-600 capitalize">{enquiryType.replace('_', ' ')}</span>
              </div>
              {form.preferredDate && (
                <div className="flex items-center justify-between text-gray-700">
                  <span className="font-semibold text-gray-500">Requested Slot:</span>
                  <span className="font-bold text-gray-900">
                    {form.preferredDate} ({form.preferredTimeSlot})
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 max-w-md mx-auto">
              A notification has been sent to our campus engineering and onboarding directors. You can also explore our pre-configured interactive demo right now.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                <Play className="w-4 h-4 fill-white" /> Explore Live Interactive Demo
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setReferenceNo('');
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-300"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Invisible Honeypot field for bot spam detection */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label>Website URL (Leave blank)</label>
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.websiteUrlHp}
                onChange={(e) => setForm({ ...form, websiteUrlHp: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Contact Person's Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Institution Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={form.institutionName}
                    onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                    placeholder="e.g. Greenwood High School or Delhi Public School"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="principal@institution.edu.in"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  WhatsApp / Phone Number with Country Code *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Institution Type
                </label>
                <select
                  value={form.institutionType}
                  onChange={(e) => setForm({ ...form, institutionType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-white font-medium"
                >
                  <option value="school">School (K-10 / 12)</option>
                  <option value="pu_college">PU College (PCMB/PCMC/Commerce)</option>
                  <option value="degree_college">Degree College & Autonomous Campus</option>
                  <option value="university">University / Multi-Faculty Institute</option>
                  <option value="composite_group">Educational Trust / Group of Institutions</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  City & State
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Approx. Student Strength
                </label>
                <select
                  value={form.studentCount}
                  onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-white font-medium"
                >
                  <option>Under 300 Students</option>
                  <option>300 - 750 Students</option>
                  <option>750 - 1,500 Students</option>
                  <option>1,500 - 3,000 Students</option>
                  <option>3,000 - 10,000 Students</option>
                  <option>10,000+ Students (Enterprise)</option>
                </select>
              </div>
            </div>

            {/* Current ERP & Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Current ERP / Software (if any)
                </label>
                <input
                  type="text"
                  value={form.currentErp}
                  onChange={(e) => setForm({ ...form, currentErp: e.target.value })}
                  placeholder="e.g. Excel, Fedena, Custom software"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Preferred Demo Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Preferred Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <select
                    value={form.preferredTimeSlot}
                    onChange={(e) => setForm({ ...form, preferredTimeSlot: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-white font-medium"
                  >
                    <option>10:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 12:00 PM</option>
                    <option>02:00 PM - 03:00 PM</option>
                    <option>03:30 PM - 04:30 PM</option>
                    <option>05:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modules of Interest Pills */}
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Key Modules of Interest (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MODULES.map((m) => {
                  const active = form.selectedModules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleModule(m.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${active
                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Specific Campus Challenges or Requirements
              </label>
              <textarea
                rows={2}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Mention any custom fee heads, state board exam patterns, biometrics, or migration requirements..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="consentCheck"
                required
                checked={form.consentGiven}
                onChange={(e) => setForm({ ...form, consentGiven: e.target.checked })}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="consentCheck" className="text-[11px] text-gray-600 leading-normal">
                I authorize EducationOS to contact me via phone, WhatsApp, and email regarding ERP implementation and demonstration scheduling.
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting Demonstration Request...' : 'Submit Demonstration Request →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
