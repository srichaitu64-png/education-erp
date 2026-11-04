import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface RoleOption {
  code: string;
  label: string;
}

// Institution-level roles only (Platform Super Admin is separate)
const INSTITUTION_ROLES: RoleOption[] = [
  { code: 'CHAIRMAN_DIRECTOR', label: 'Chairman / Director' },
  { code: 'INSTITUTION_ADMIN', label: 'Institution Admin' },
  { code: 'PRINCIPAL', label: 'Principal' },
  { code: 'VICE_PRINCIPAL', label: 'Vice Principal' },
  { code: 'ACCOUNTANT', label: 'Accountant' },
  { code: 'EXAM_CONTROLLER', label: 'Examination Controller' },
  { code: 'TEACHER', label: 'Teacher / Lecturer' },
  { code: 'ADMISSION_OFFICER', label: 'Admission Officer' },
  { code: 'HR_MANAGER', label: 'HR Manager' },
  { code: 'TRANSPORT_MANAGER', label: 'Transport Manager' },
  { code: 'LIBRARIAN', label: 'Librarian' },
  { code: 'PARENT', label: 'Parent' },
  { code: 'STUDENT', label: 'Student' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Mode: Institutional User vs SaaS Platform Admin
  const [isPlatformAdminMode, setIsPlatformAdminMode] = useState(false);

  // Form Fields
  const [selectedRole, setSelectedRole] = useState('PRINCIPAL');
  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  // Strictly null initially; only populated on actual failed submission
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    // Clear stale error when user modifies inputs
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrId.trim() || !password.trim()) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: usernameOrId.includes('@') ? usernameOrId : `${usernameOrId.toLowerCase()}@akshara.edu.in`,
        password,
        role: isPlatformAdminMode ? 'SUPER_ADMIN' : selectedRole,
      };

      const res = await api.post('/auth/login', payload);
      const { access_token, refresh_token, user } = res.data;
      await login(access_token, refresh_token, user);

      if (user.is_superadmin || isPlatformAdminMode) {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setErrorMessage(detail);
      } else {
        setErrorMessage('Invalid credentials or unassigned role. Please verify your ID and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Central Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Institution Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Akshara Global ERP</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {isPlatformAdminMode 
                ? 'Platform Super Admin Infrastructure Portal' 
                : 'Sign in to access your institutional campus portal'}
            </p>
          </div>
        </div>

        {/* Real Error Banner (Only shown after actual failed attempt) */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. Role Dropdown (Institution roles only) */}
          {!isPlatformAdminMode && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Designated Role
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => handleInputChange(setSelectedRole, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs"
                >
                  {INSTITUTION_ROLES.map((r) => (
                    <option key={r.code} value={r.code} className="bg-slate-900 text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 2. Identifier (Username / Employee ID / Admission No) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {isPlatformAdminMode ? 'Root Administrator Email' : 'Username / Employee ID / Admission No.'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder={isPlatformAdminMode ? 'superadmin@educationos.internal' : 'e.g. EMP-PRIN-01 or rahul.k'}
                value={usernameOrId}
                onChange={(e) => handleInputChange(setUsernameOrId, e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
          </div>

          {/* 3. Password Input with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => alert('Password reset link will be dispatched to your registered institutional guardian/staff phone or email.')}
              className="text-[11px] text-slate-400 hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Prominent Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Institution</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator & Separate Platform Super Admin Login */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsPlatformAdminMode(!isPlatformAdminMode);
              setErrorMessage(null);
            }}
            className="text-[11px] text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {isPlatformAdminMode ? '← Back to School & College Sign In' : 'Platform Super Admin Access (SaaS Root)'}
            </span>
          </button>

          <Link
            to="/demo"
            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            Looking for Interactive In-Browser Sandbox Demo? Click here →
          </Link>
        </div>

      </div>

      {/* Footer Branding */}
      <p className="text-[11px] text-slate-500 mt-6 text-center font-medium">
        EducationOS™ Multi-Tenant SaaS Platform • SOC2 & ISO 27001 Certified Campus Security
      </p>
    </div>
  );
};
