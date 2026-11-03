import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
  Heart,
  Globe,
  Award
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">EduOmni ERP</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              India's leading commercial multi-tenant Education ERP SaaS platform. Powering schools, PU colleges, and degree colleges with cloud agility, offline resilience, and white-label branding.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>India DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/60 px-3 py-1.5 rounded-full border border-blue-800">
                <Lock className="w-4 h-4" />
                <span>PostgreSQL RLS Isolated</span>
              </div>
            </div>
          </div>

          {/* Solutions by Institution Level */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/features" className="hover:text-white transition-colors">Primary & High Schools</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">PU Colleges (PCMB/PCMC)</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Degree Colleges & Universities</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Multi-Campus Groups</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Offline Campus Sync</Link></li>
            </ul>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform Modules</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/modules" className="hover:text-white transition-colors">Online Admissions</Link></li>
              <li><Link to="/modules" className="hover:text-white transition-colors">Student Information (SIS)</Link></li>
              <li><Link to="/modules" className="hover:text-white transition-colors">Fee Invoicing & Receipts</Link></li>
              <li><Link to="/modules" className="hover:text-white transition-colors">Biometric & Daily Attendance</Link></li>
              <li><Link to="/modules" className="hover:text-white transition-colors">Exam Results & Report Cards</Link></li>
              <li><Link to="/modules" className="hover:text-white transition-colors">Parent & Student Portals</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+91 98450 00000 / 1800-EDU-OMNI</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>sales@eduomni.in</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  Launch Interactive Demo &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} EduOmni SaaS Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/faq" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/faq" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link to="/faq" className="hover:text-gray-400 transition-colors">Security Whitepaper</Link>
            <Link to="/contact" className="hover:text-gray-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
