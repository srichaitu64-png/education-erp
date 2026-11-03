import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Target,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Zap,
  Globe2
} from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout';

export const AboutPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-white py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200">
              <Target className="w-3.5 h-3.5" /> Our Mission & Architecture
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight max-w-4xl mx-auto">
              Built for Indian Education. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800">
                Architected for Enterprise Scale.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We started EduOmni with a singular conviction: Indian educational institutions deserve software as modern, reliable, and secure as the world’s best enterprise SaaS platforms.
            </p>
          </div>
        </div>

        {/* Pillars / Values */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200/80 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Absolute Data Isolation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every institution's students, fee records, and marks are mathematically partitioned at the PostgreSQL kernel level via forced Row-Level Security. Cross-tenant leakage is architecturally impossible.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200/80 hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Offline-Resilient Sync</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Unstable campus Wi-Fi or regional fiber cuts never halt campus operations. Teachers can mark daily attendance and enter exam marks locally via IndexedDB with automatic background sync when reconnected.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200/80 hover:border-purple-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% White-Label Identity</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your institution is the brand. From custom subdomains (<code className="text-xs bg-gray-200 px-1 py-0.5 rounded font-mono">yourschool.eduomni.in</code>) to branded fee receipts and report cards, your heritage takes center stage.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Architecture Comparison */}
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Why Legacy School ERPs Fail and How EduOmni Solves It
              </h2>
              <p className="mt-4 text-base text-gray-400">
                A modern engineering approach to complex educational workloads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-3xl bg-gray-800/80 border border-red-500/30">
                <div className="text-red-400 font-bold uppercase tracking-wider text-xs mb-3">Legacy School Software</div>
                <ul className="space-y-3.5 text-sm text-gray-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span> Single server desktop installs prone to hard drive crashes
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span> Unsecured shared passwords and no granular role-based access
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span> Clunky manual Excel exports and fragile macro sheets
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-400 font-bold">✕</span> Zero mobile offline support during admissions rush
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-gradient-to-b from-blue-900/50 to-indigo-900/40 border border-blue-500/40">
                <div className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-3">EduOmni Modern SaaS</div>
                <ul className="space-y-3.5 text-sm text-gray-200">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> Multi-region high availability with automatic daily encrypted backups
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> Argon2id hashing, JWT rotation, and PostgreSQL Row-Level Security
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> Automated UPI QR fee collection with instant receipt reconciliation
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span> PWA + native offline Dexie.js sync for high-volume attendance & marks
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950">
              Ready to Upgrade Your Institution?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              Join over 100+ schools and colleges who have modernized their campus operations with EduOmni.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/demo"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold transition-all"
              >
                Explore Live Demo Sandbox
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
