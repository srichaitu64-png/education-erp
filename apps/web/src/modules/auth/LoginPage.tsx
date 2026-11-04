import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useDemoStore, UserRoleType } from '../../store/demoStore';

interface RoleOption {
  code: string;
  label: string;
}

// Strictly Institutional Campus Roles (Platform Super Admin is completely isolated at /platform/login)
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

export interface InstitutionalDemoAccount {
  role: string;
  label: string;
  shortLabel: string;
  email: string;
  username: string;
  pass: string;
  fullName: string;
  canDo: string;
  badge: string;
}

// Only verified institutional campus demo accounts
export const INSTITUTIONAL_DEMO_ACCOUNTS: InstitutionalDemoAccount[] = [
  {
    role: 'CHAIRMAN_DIRECTOR',
    label: 'Chairman / Director',
    shortLabel: '🏛️ Chairman',
    email: 'chairman@akshara.edu.in',
    username: 'EMP-CHAIR-01',
    pass: 'ChairmanSecure2026!',
    fullName: 'Dr. S. K. Narayana (Chairman)',
    badge: 'Institution Super Admin',
    canDo: 'Campus governance, user roles, permission matrix, custom fee heads, and dashboard designer',
  },
  {
    role: 'PRINCIPAL',
    label: 'Principal (Academics)',
    shortLabel: '👑 Principal',
    email: 'principal@akshara.edu.in',
    username: 'EMP-PRIN-01',
    pass: 'PrincipalSecurePassword2026!',
    fullName: 'Dr. Ramesh Kumar (Principal)',
    badge: 'Academic Authority',
    canDo: 'Approve examination results, assign staff duties, sign progress cards, academic oversight',
  },
  {
    role: 'ACCOUNTANT',
    label: 'Senior Accountant',
    shortLabel: '💰 Accountant',
    email: 'accountant@akshara.edu.in',
    username: 'EMP-ACC-01',
    pass: 'AccountantSecure2026!',
    fullName: 'Venkatesh Iyer (Senior Accountant)',
    badge: 'Finance Counter',
    canDo: 'Collect multi-head fees, issue instant receipts, handle partial dues, bank reconciliation',
  },
  {
    role: 'EXAM_CONTROLLER',
    label: 'Controller of Examinations',
    shortLabel: '📝 Exam Controller',
    email: 'exams@akshara.edu.in',
    username: 'EMP-EXAM-01',
    pass: 'ExamController2026!',
    fullName: 'Prof. Ananth Murthy (Exam Controller)',
    badge: 'Examination Suite',
    canDo: 'Schedule exams, hall ticket batch printing, verify marks registers, publish notice board',
  },
  {
    role: 'TEACHER',
    label: 'Subject Teacher',
    shortLabel: '👩‍🏫 Teacher',
    email: 'teacher.physics@akshara.edu.in',
    username: 'EMP-TCH-01',
    pass: 'TeacherPhysics2026!',
    fullName: 'Lakshmi Prasad (Physics Faculty)',
    badge: 'Teaching Faculty',
    canDo: 'Class roll call attendance, multi-component marks entry (Theory/Lab), lesson syllabus',
  },
  {
    role: 'PARENT',
    label: 'Parent (Ramesh Kumar)',
    shortLabel: '👨‍👩‍👧 Parent',
    email: 'parent.rahul@akshara.edu.in',
    username: 'PAR-2026-001',
    pass: 'ParentRahul2026!',
    fullName: 'Ramesh Kumar (Rahul\'s Parent)',
    badge: 'Parent Portal',
    canDo: 'View linked child attendance, download fee receipts, view report cards, track bus GPS',
  },
  {
    role: 'STUDENT',
    label: 'Student (Rahul Kumar)',
    shortLabel: '🎒 Student',
    email: 'student.rahul@akshara.edu.in',
    username: 'ADM-2026-001',
    pass: 'StudentRahul2026!',
    fullName: 'Rahul Kumar (Class I PUC Science)',
    badge: 'Student Self-Service',
    canDo: 'Check timetable, download hall ticket, view progress report, NEET mock analytics',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { switchRole } = useDemoStore();

  // Form Fields
  const [selectedRole, setSelectedRole] = useState('PRINCIPAL');
  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active account information for display
  const [activeAccount, setActiveAccount] = useState<InstitutionalDemoAccount | null>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleAutofill = (acc: InstitutionalDemoAccount) => {
    setActiveAccount(acc);
    setUsernameOrId(acc.email);
    setPassword(acc.pass);
    setSelectedRole(acc.role);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputVal = usernameOrId.trim();
    if (!inputVal || !password.trim()) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    // Explicit boundary check: Platform owner accounts are barred from institutional login
    if (inputVal.toLowerCase().includes('platform.erp.in') || inputVal.toLowerCase() === 'superadmin') {
      setErrorMessage(
        'Platform Owner credentials cannot be used on this institutional campus portal. Please sign in via the dedicated Platform SaaS Control Portal at /platform/login.'
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: inputVal.includes('@') ? inputVal : `${inputVal.toLowerCase()}@akshara.edu.in`,
        password,
        role: selectedRole,
      };

      try {
        const res = await api.post('/auth/login', payload);
        const { access_token, refresh_token, user } = res.data;
        await login(access_token, refresh_token, user);

        switchRole(selectedRole as UserRoleType);
        navigate(`/demo?role=${selectedRole}`);
        return;
      } catch (apiErr: any) {
        // Fallback for static hosting on Vercel or offline backend
        const searchVal = inputVal.toLowerCase();
        const matched = INSTITUTIONAL_DEMO_ACCOUNTS.find(
          (acc) =>
            (acc.email.toLowerCase() === searchVal ||
              acc.username.toLowerCase() === searchVal ||
              acc.email.toLowerCase() === payload.email.toLowerCase()) &&
            acc.pass === password
        );

        if (matched) {
          const mockUser = {
            id: `usr-${matched.role.toLowerCase()}`,
            email: matched.email,
            full_name: matched.fullName,
            phone: '+91 98450 12345',
            is_active: true,
            is_superadmin: false,
            roles: [
              {
                id: `role-${matched.role.toLowerCase()}`,
                name: matched.label,
                code: matched.role,
                tenant_id: 'tenant-akshara',
                permissions: ['*'],
              },
            ],
          };

          await login('mock_jwt_access_token_inst', 'mock_jwt_refresh_token_inst', mockUser);
          switchRole(matched.role as UserRoleType);
          navigate(`/demo?role=${matched.role}`);
          return;
        }

        throw apiErr;
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setErrorMessage(detail);
      } else {
        setErrorMessage(
          'Invalid credentials or unassigned role. Use the Quick Demo Accounts below to test each institutional role.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Browser Cache Refresh Notice */}
      <div className="w-full max-w-lg mb-4 bg-blue-950/40 border border-blue-800/60 rounded-2xl p-3 text-xs text-blue-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Institutional Release v2.5:</strong> If your browser displays cached older screens, press <kbd className="px-1.5 py-0.5 bg-blue-900 border border-blue-700 rounded font-mono text-[11px] text-white">Ctrl + Shift + R</kbd> to refresh.
          </span>
        </div>
      </div>

      {/* Central Login Card */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Institution Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Akshara Global ERP</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Sign in to access your institutional School, PU College & Degree Campus Portal
            </p>
          </div>
        </div>

        {/* Quick Institutional Demo Credentials Autofill Picker */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Accounts (1-Click Fill)
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Click to populate</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {INSTITUTIONAL_DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleAutofill(acc)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedRole === acc.role && (usernameOrId === acc.email || usernameOrId === acc.username)
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{acc.shortLabel}</span>
              </button>
            ))}
          </div>

          {activeAccount && (
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 space-y-1 mt-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{activeAccount.fullName}</span>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  {activeAccount.badge}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">{activeAccount.canDo}</p>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. Role Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Designated Campus Role
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

          {/* 2. Identifier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email / Employee ID / Admission No.
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. principal@akshara.edu.in or EMP-PRIN-01"
                value={usernameOrId}
                onChange={(e) => handleInputChange(setUsernameOrId, e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
          </div>

          {/* 3. Password Input */}
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

          {/* Prominent Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating Institutional Session...</span>
            ) : (
              <>
                <span>Sign In to Institutional Campus</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center justify-between gap-2.5 text-xs">
          <Link
            to="/demo"
            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            Interactive In-Browser Sandbox Demo with Instant Role Switcher →
          </Link>

          <Link
            to="/platform/login"
            className="text-[11px] text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1.5 pt-1 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>EducationOS SaaS Platform Owner? Sign in to Platform Control Plane →</span>
          </Link>
        </div>

      </div>

      {/* Footer Security Badges */}
      <p className="text-[11px] text-slate-500 mt-6 text-center font-medium">
        Akshara Global Educational Trust • Tenant-Isolated Database Security
      </p>
    </div>
  );
};
