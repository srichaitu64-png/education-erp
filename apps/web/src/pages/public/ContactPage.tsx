import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building,
  MessageSquare,
  HelpCircle,
  Headphones
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    role: 'Principal',
    subject: 'Request a Campus ERP Consultation',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <PublicLayout>
      <div className="bg-gray-50/60 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
              <Headphones className="w-3.5 h-3.5" /> 24/7 Dedicated Institution Support
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
              Get in Touch with our <span className="text-blue-600">ERP Specialists</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Have questions about multi-campus deployments, custom fee rule engines, or offline sync? Our engineering and sales team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-sm space-y-6">
                <h3 className="text-xl font-black text-gray-900">Direct Contact Channels</h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toll-Free Helpline</div>
                      <div className="text-base font-extrabold text-gray-900 mt-0.5">1800-EDU-OMNI / +91 98450 00000</div>
                      <div className="text-xs text-gray-500 mt-0.5">Mon–Sat, 8:00 AM – 8:00 PM IST</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Support</div>
                      <div className="text-base font-extrabold text-gray-900 mt-0.5">support@eduomni.in</div>
                      <div className="text-xs text-gray-500 mt-0.5">sales@eduomni.in for enterprise RFPs</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Headquarters</div>
                      <div className="text-sm font-bold text-gray-900 mt-0.5">
                        EduOmni SaaS Technologies Pvt. Ltd.
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Level 4, Tech Park Boulevard, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="text-xs text-blue-900 font-semibold">
                      Guaranteed response within 2 hours for pilot institutions and active subscriptions.
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick FAQ note */}
              <div className="bg-gray-900 rounded-3xl p-6 text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" /> Need an instant walkthrough?
                </div>
                <p className="text-sm text-gray-300">
                  Skip the phone call and explore the live in-browser demonstration sandbox with pre-loaded student records and fee invoices.
                </p>
                <div className="pt-2">
                  <a
                    href="/demo"
                    className="inline-flex items-center gap-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all"
                  >
                    Open Live Sandbox &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-md">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Message Received!</h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      Thank you for contacting us, {formState.name}. An Education ERP specialist assigned to your region will reach out within 2 hours.
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-bold text-gray-700"
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Send us a Message</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Fill out the details below and we will tailor our response to your institution type.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Dr. Ramesh Rao"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Official Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="principal@institution.edu.in"
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98450 12345"
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Institution Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Vidya Niketan PU College"
                          value={formState.institution}
                          onChange={(e) => setFormState({ ...formState, institution: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Your Role *
                        </label>
                        <select
                          value={formState.role}
                          onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        >
                          <option value="Principal">Principal / Director</option>
                          <option value="Trustee">Trustee / Chairman</option>
                          <option value="Administrator">Administrator / Registrar</option>
                          <option value="Accountant">Chief Accountant</option>
                          <option value="IT Head">IT / Technology Head</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Inquiry Subject *
                        </label>
                        <select
                          value={formState.subject}
                          onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        >
                          <option value="Request a Campus ERP Consultation">Request a Campus ERP Consultation</option>
                          <option value="Pricing and Custom Plan Quote">Pricing and Custom Plan Quote</option>
                          <option value="Offline Sync Architecture Inquiry">Offline Sync Architecture Inquiry</option>
                          <option value="Data Migration from Legacy Software">Data Migration from Legacy Software</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Specific Questions or Requirements
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your campus size, current pain points, and target go-live date..."
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Send Inquiry to Sales & Engineering'}
                      <Send className="w-4 h-4" />
                    </button>
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
