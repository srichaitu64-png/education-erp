import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Server,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

export const PlatformLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputVal = usernameOrId.trim();
    if (!inputVal || !password.trim()) {
      setErrorMessage('Please enter both your Platform Administrator email and password.');
      return;
    }

    // Explicit boundary check: Institutional accounts are barred from Platform Owner login
    if (inputVal.toLowerCase().includes('pilot-trial.edu.in') || inputVal.toLowerCase().includes('akshara.edu.in') || inputVal.toLowerCase().startsWith('emp-') || inputVal.toLowerCase().startsWith('adm-')) {
      setErrorMessage(
        'Institutional campus accounts (Schools, PU Colleges) cannot access the private SaaS Platform Control Plane. Please sign in via the campus portal at /login.'
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: inputVal,
        password,
      };

      const res = await api.post('/auth/login', payload);
      const { access_token, refresh_token, user } = res.data || {};
      if (!access_token || !user?.is_superadmin) {
        throw new Error('This account does not have SaaS Platform Owner privileges.');
      }
      await login(access_token, refresh_token, user);
      navigate('/platform');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setErrorMessage(detail);
      } else {
        setErrorMessage(
          'Invalid credentials or insufficient platform privileges. Please verify your Platform Owner account.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-purple-600 selection:text-white">
      {/* Central Login Card */}
      <div className="w-full max-w-lg bg-slate-900 border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Platform SaaS Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/10 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40 mb-1.5">
              <ShieldAlert className="w-3 h-3 text-purple-400" />
              Level 1 Private Platform Owner Portal
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">EducationOS Platform Control</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Private SaaS administration and platform governance
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Platform Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Platform Owner Identifier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Platform Owner Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="admin@platform.erp.in"
                value={usernameOrId}
                onChange={(e) => handleInputChange(setUsernameOrId, e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
              />
            </div>
          </div>

          {/* 3. Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Cryptographic Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[11px] text-slate-400 hover:text-purple-400 transition-colors font-medium cursor-pointer"
              >
                Forgot root credentials? Emergency recovery →
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating SaaS Root...</span>
            ) : (
              <>
                <span>Sign In to Platform SaaS Control</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Navigation Link back to Institution Portal */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center justify-between gap-2.5 text-xs">
          <Link
            to="/login"
            className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>← Return to School & College Campus Sign In (/login)</span>
          </Link>
          <Link
            to="/demo"
            className="text-[11px] text-purple-400 hover:text-purple-300 font-bold transition-colors"
          >
            Open Interactive In-Browser Demo Sandbox →
          </Link>
        </div>

      </div>

      {/* Footer Branding */}
      <p className="text-[11px] text-slate-500 mt-6 text-center font-medium">
        EducationOS™ SaaS Platform Infrastructure • SOC2 & ISO 27001 Certified Multi-Tenant Isolation
      </p>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        portalType="PLATFORM"
      />
    </div>
  );
};

