import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, Building, Mail, Phone, User, Play } from 'lucide-react';

export const BookDemoPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    institutionName: '',
    institutionType: 'School (K-10/12)',
    email: '',
    phone: '',
    studentCount: '500 - 1,000',
    preferredDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Personalized Demonstration
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-950">
          Book a 1-on-1 Product Walkthrough
        </h1>
        <p className="text-gray-600 text-sm max-w-xl mx-auto">
          See how EduOmni ERP configures specifically for your school, PU college, or degree campus.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm">
        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Demo Session Requested!</h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Thank you, {form.name}. Our education technology specialist will reach out within 4 business hours to confirm your demonstration slot.
            </p>
            <div className="pt-4">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" /> Explore Interactive Demo Right Now
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={form.institutionName}
                  onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                  placeholder="e.g. Akshara Global School"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="principal@institution.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">WhatsApp / Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98450 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Institution Category</label>
                <select
                  value={form.institutionType}
                  onChange={(e) => setForm({ ...form, institutionType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white font-medium"
                >
                  <option>School (K-10 / 12)</option>
                  <option>PU College (PCMB/PCMC/Commerce)</option>
                  <option>Degree College & Autonomous Institute</option>
                  <option>Educational Group (Multiple Campuses)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Estimated Student Count</label>
                <select
                  value={form.studentCount}
                  onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white font-medium"
                >
                  <option>Under 300 Students</option>
                  <option>300 - 750 Students</option>
                  <option>750 - 1,500 Students</option>
                  <option>1,500 - 5,000 Students</option>
                  <option>5,000+ Students</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                Confirm Demo Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
