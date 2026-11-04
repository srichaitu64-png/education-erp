import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlatformAccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-rose-800/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-400 mx-auto flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-full">
            HTTP 403 Forbidden • Zero Trust Policy
          </span>
          <h1 className="text-2xl font-black text-white">Private Platform Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <code className="text-rose-300 font-mono">/platform/*</code> route group is strictly reserved for verified EducationOS SaaS Platform Owners. Institution administrators, faculty, and school staff cannot access this environment.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Lock className="w-4 h-4 text-amber-400" />
            Security Isolation Rule:
          </div>
          <p className="text-[11px]">
            Institution credentials grant operational access within your designated tenant domain only. Cross-tenant and SaaS platform owner operations require explicit Level 1 cryptographic authentication.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/demo"
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Institution Demo
          </Link>
          <Link
            to="/login"
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center"
          >
            Platform Login
          </Link>
        </div>
      </div>
    </div>
  );
};
