import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Server,
  Loader2
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';

export const RegisterInstitutionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedPlan = (searchParams.get('plan') || 'TRIAL').toUpperCase();
  const initialPlan = ['TRIAL', 'STARTER', 'STANDARD', 'ENTERPRISE'].includes(requestedPlan) ? requestedPlan : 'TRIAL';

  const [formData, setFormData] = useState({
    institutionName: '',
    subdomain: '',
    institutionType: 'pu_college',
    adminName: '',
    email: '',
    phone: '',
    city: '',
    state: 'Karnataka',
    studentStrength: '500-1500',
    selectedPlan: initialPlan,
    acceptTerms: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [leadReference, setLeadReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // auto-generate clean subdomain suggestion
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
    setFormData((prev) => ({
      ...prev,
      institutionName: name,
      subdomain: prev.subdomain ? prev.subdomain : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.subdomain || !/^[a-z0-9-]+$/.test(formData.subdomain)) {
      setError('Institution code must contain only lowercase letters, numbers, and hyphens.');
      return;
    }

    setLoading(true);

    try {
      // Public sign-up creates a verified sales/trial request. Tenant credentials
      // and production access are issued only after platform-owner approval.
      const res = await fetch('/api/v1/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: formData.adminName,
          email: formData.email,
          phone: formData.phone,
          institution_name: formData.institutionName,
          institution_type: formData.institutionType,
          city: formData.city,
          state: formData.state,
          student_strength: formData.studentStrength,
          enquiry_type: formData.selectedPlan === 'TRIAL' ? 'trial' : 'pricing',
          requested_modules: [],
          message: `Requested plan: ${formData.selectedPlan}. Preferred institution code: ${formData.subdomain}.`,
          consent_given: formData.acceptTerms,
          page_url: window.location.href,
          source: 'website',
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.detail || `Unable to submit your request (Status ${res.status}).`);
      }
      setLeadReference(data.reference_no || '');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Unable to submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-blue-50/50 via-white to-gray-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> 30-Day Free Trial
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
              Onboard Your Institution in <span className="text-blue-600">3 Minutes</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Zero setup fee. No credit card required. Get instant multi-tenant database isolation, custom branding, and full ERP capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Value Props & Guarantees */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
                <h3 className="text-xl font-extrabold text-gray-900">What happens after signup?</h3>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Dedicated Tenant Isolated</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        PostgreSQL Row-Level Security ensures your student records and fees are mathematically isolated.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Instant Custom Subdomain</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Access your portal at <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">your-code.eduomni.in</code> with your custom logo and colours.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">30-Day Trial Evaluation</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Explore the core admissions, fee, attendance and examination workflows during your 30-day evaluation.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Free historical data migration assistance</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Compliant with Indian DPDP Act 2023</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Offline PWA sync for remote network areas</span>
                  </div>
                </div>
              </div>

              {/* Pilot Reference Testimonial */}
              <div className="bg-gradient-to-tr from-gray-900 to-blue-950 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {'★'.repeat(5)}
                </div>
                <p className="text-sm italic text-gray-300">
                  "EduOmni onboarded our PU College in less than an hour. Within one week, our fee collection reconciliation dropped from 3 days to instantaneous UPI verification."
                </p>
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">Dr. R. K. Hegde</div>
                    <div className="text-gray-400">Principal, Vidya Niketan Pre-University</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-900/60 text-blue-300 font-mono">1,450 Students</span>
                </div>
              </div>
            </div>

            {/* Right Registration Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-xl">
                {success ? (
                  <div className="text-center py-10 space-y-5">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Your Request Has Been Received!</h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Thank you. Our platform team will review your request and contact you to confirm the trial and institution setup.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl font-mono text-sm font-bold text-blue-800 max-w-sm mx-auto">
                      Reference: {leadReference || 'Pending'}
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        Return to Home
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate('/demo')}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold transition-all"
                      >
                        Explore Demo Sandbox
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Institution Details</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Tell us about your institution and the plan you would like to explore.</p>
                    </div>

                    {error && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Institution Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Institution Name *
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Greenwood PU College"
                            value={formData.institutionName}
                            onChange={handleNameChange}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold"
                          />
                        </div>
                      </div>

                      {/* Institution Subdomain / Code */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Preferred Institution Code *
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            required
                            placeholder="greenwood-pu"
                            value={formData.subdomain}
                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().trim() })}
                            className="flex-1 px-3.5 py-2.5 rounded-l-xl border border-r-0 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono font-bold text-blue-700"
                          />
                          <span className="px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-r-xl text-xs font-bold text-gray-500">
                            .educationos.in
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">This is a requested code only; the platform team confirms availability before provisioning.</p>
                      </div>

                      {/* Institution Type */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Category *
                        </label>
                        <select
                          value={formData.institutionType}
                          onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        >
                          <option value="school">Primary / High School (K-10)</option>
                          <option value="pu_college">Pre-University College (+1 / +2)</option>
                          <option value="degree_college">Degree College / Autonomous</option>
                          <option value="group_institution">Educational Trust / Multi-Campus</option>
                        </select>
                      </div>

                      {/* Requested Plan */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Plan to Explore *
                        </label>
                        <select
                          value={formData.selectedPlan}
                          onChange={(e) => setFormData({ ...formData, selectedPlan: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        >
                          <option value="TRIAL">30-Day Free Trial — ₹0</option>
                          <option value="STARTER">Starter — ₹999/month or ₹9,999/year</option>
                          <option value="STANDARD">Standard — ₹1,999/month or ₹19,999/year</option>
                          <option value="ENTERPRISE">Enterprise — ₹9,999/month or ₹99,999/year</option>
                        </select>
                      </div>

                      {/* Student Strength */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Student Strength *
                        </label>
                        <select
                          value={formData.studentStrength}
                          onChange={(e) => setFormData({ ...formData, studentStrength: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        >
                          <option value="<500">Under 500 Students</option>
                          <option value="500-1500">500 - 1,500 Students</option>
                          <option value="1500-3000">1,500 - 3,000 Students</option>
                          <option value="3000+">3,000+ Students</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h2 className="text-lg font-black text-gray-900 mb-3">Contact Person</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Admin Name */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Administrator Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Dr. Ramesh Kumar"
                              value={formData.adminName}
                              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                            />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Official Email *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                            <input
                              type="email"
                              required
                              placeholder="principal@institution.edu.in"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Contact Phone *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                            <input
                              type="tel"
                              required
                              placeholder="+91 98450 XXXXX"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                            />
                          </div>
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            City & State *
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                            <input
                              type="text"
                              required
                              placeholder="Bengaluru, Karnataka"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                            />
                          </div>
                        </div>


                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-500">
                          I agree to EduOmni's Terms of Service and Privacy Policy. I confirm that I am an authorized representative of this educational institution.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !formData.acceptTerms}
                      className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...
                        </>
                      ) : (
                        <>
                          Submit Trial / Plan Request
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <span className="text-xs text-gray-500">
                        Already have an institution registered?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                          Sign In here
                        </Link>
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

