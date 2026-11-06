import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';
import { FirstLoginPasswordModal } from '../../components/auth/FirstLoginPasswordModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Controlled form state
  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Modals
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [pendingAuthSession, setPendingAuthSession] = useState<{
    token: string;
    refreshToken: string;
    user: any;
    destination: string;
    primaryRole?: string;
  } | null>(null);

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
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: inputVal,
        password,
        remember_me: rememberMe,
      };

      const res = await api.post('/auth/login', payload);
      if (!res.data || typeof res.data !== 'object' || !res.data.access_token) {
        throw new Error('Authentication service returned an invalid response.');
      }

      const {
        access_token,
        refresh_token,
        user,
        destination,
        primary_role,
      } = res.data;

      if (user?.is_superadmin) {
        throw new Error('Use the separate Platform Owner sign-in page.');
      }

      if (user?.must_change_password) {
        setPendingAuthSession({
          token: access_token,
          refreshToken: refresh_token,
          user,
          destination: destination || '/app',
          primaryRole: primary_role,
        });
        setShowFirstLoginModal(true);
        return;
      }

      await login(access_token, refresh_token, user);
      navigate(destination || '/app');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setErrorMessage(detail);
      } else {
        setErrorMessage(err.message || 'Unable to reach the authentication service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstLoginSuccess = async () => {
    setShowFirstLoginModal(false);
    if (pendingAuthSession) {
      await login(
        pendingAuthSession.token,
        pendingAuthSession.refreshToken,
        { ...pendingAuthSession.user, must_change_password: false }
      );
      if (pendingAuthSession.primaryRole) {
        switchRole(pendingAuthSession.primaryRole as UserRoleType);
      }
      navigate(pendingAuthSession.destination);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      
      {/* Central Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* EducationOS Unified Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">EducationOS</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Institutional Portal Sign In
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 font-medium flex items-center gap-2 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Universal Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Username / Identifier */}
          <div>
            <label
              htmlFor="usernameOrId"
              className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Username, Email, or Institutional ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="usernameOrId"
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. username, email@domain.com, or EMP-001"
                value={usernameOrId}
                onChange={(e) => handleInputChange(setUsernameOrId, e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
          </div>

          {/* Password Input with Visibility Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Options Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-slate-400 hover:text-blue-400 transition-colors font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Universal Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Multi-Tenant Assurance */}
        <div className="pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Automatic multi-tenant routing & kernel-isolated access
          </p>
        </div>

      </div>

      {/* Footer Security Badges */}
      <p className="text-[11px] text-slate-600 mt-6 text-center font-medium">
        EducationOS • Multi-Tenant SaaS Platform Security Architecture
      </p>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        portalType="INSTITUTION"
      />

      {/* Mandatory First-Login Password Reset Modal */}
      {pendingAuthSession && (
        <FirstLoginPasswordModal
          isOpen={showFirstLoginModal}
          userEmail={pendingAuthSession.user.email}
          token={pendingAuthSession.token}
          onSuccess={handleFirstLoginSuccess}
        />
      )}
    </div>
  );
};
