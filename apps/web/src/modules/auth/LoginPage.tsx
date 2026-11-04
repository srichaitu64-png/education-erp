import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  Building,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Search,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface RoleOption {
  code: string;
  label: string;
  icon: string;
  badge: string;
}

const INSTITUTION_ROLES: RoleOption[] = [
  { code: 'PRINCIPAL', label: 'Principal / Director', icon: '👑', badge: 'Leadership' },
  { code: 'INSTITUTION_ADMIN', label: 'Institution Admin', icon: '🏛️', badge: 'Operations' },
  { code: 'ACCOUNTANT', label: 'Accountant / Finance', icon: '💰', badge: 'Finance' },
  { code: 'EXAM_CONTROLLER', label: 'Exam Controller', icon: '📝', badge: 'Academics' },
  { code: 'TEACHER', label: 'Faculty / Lecturer', icon: '👩‍🏫', badge: 'Academics' },
  { code: 'PARENT', label: 'Parent / Guardian', icon: '👨‍👩‍👧', badge: 'Portal' },
  { code: 'STUDENT', label: 'Enrolled Student', icon: '🎒', badge: 'Portal' },
  { code: 'TRANSPORT_MANAGER', label: 'Transport Manager', icon: '🚌', badge: 'Logistics' },
  { code: 'SUPER_ADMIN', label: 'Platform Super Admin', icon: '🌐', badge: 'Platform' },
  { code: 'BACKUP_SUPER_ADMIN', label: 'Backup Super Admin', icon: '🛡️', badge: 'Security' },
  { code: 'DEVELOPER', label: 'Developer / Technical Support', icon: '💻', badge: 'DevOps' },
];

interface UserSuggestion {
  id: string;
  displayName: string;
  identifier: string;
  email: string;
  roleCode: string;
}

const PRESET_ACCOUNTS: Record<string, UserSuggestion[]> = {
  PRINCIPAL: [
    { id: 'u-prin-1', displayName: 'Dr. Ramesh Kumar', identifier: 'EMP-PRIN-01', email: 'principal@akshara.edu.in', roleCode: 'PRINCIPAL' }
  ],
  INSTITUTION_ADMIN: [
    { id: 'u-adm-1', displayName: 'Smt. Gayatri Devi', identifier: 'EMP-ADM-04', email: 'admin@akshara.edu.in', roleCode: 'INSTITUTION_ADMIN' }
  ],
  ACCOUNTANT: [
    { id: 'u-acc-1', displayName: 'K. S. Narayana', identifier: 'EMP-ACC-09', email: 'accountant@akshara.edu.in', roleCode: 'ACCOUNTANT' }
  ],
  EXAM_CONTROLLER: [
    { id: 'u-ec-1', displayName: 'Prof. S. Joshi', identifier: 'EMP-EC-02', email: 'exam.controller@akshara.edu.in', roleCode: 'EXAM_CONTROLLER' }
  ],
  TEACHER: [
    { id: 'u-tea-1', displayName: 'Dr. V. Murthy (Physics - I PUC)', identifier: 'EMP-PHY-102', email: 'v.murthy@akshara.edu.in', roleCode: 'TEACHER' },
    { id: 'u-tea-2', displayName: 'Mrs. K. Swamy (Mathematics)', identifier: 'EMP-MTH-105', email: 'k.swamy@akshara.edu.in', roleCode: 'TEACHER' }
  ],
  PARENT: [
    { id: 'u-par-1', displayName: 'Rajesh Sharma (Father of Aarav - Class 10)', identifier: 'GRD-90421', email: 'parent.aarav@akshara.edu.in', roleCode: 'PARENT' }
  ],
  STUDENT: [
    { id: 'u-stu-1', displayName: 'Ananya Hegde (I PUC - PCMB)', identifier: 'ADM-2026-092', email: 'ananya.puc@akshara.edu.in', roleCode: 'STUDENT' }
  ],
  TRANSPORT_MANAGER: [
    { id: 'u-trp-1', displayName: 'Suresh Gowda (Route 104 Fleet)', identifier: 'EMP-TRP-07', email: 'transport@akshara.edu.in', roleCode: 'TRANSPORT_MANAGER' }
  ],
  SUPER_ADMIN: [
    { id: 'u-sa-1', displayName: 'Platform Super Administrator', identifier: 'PLATFORM-ROOT', email: 'admin@platform.erp.in', roleCode: 'SUPER_ADMIN' }
  ],
  BACKUP_SUPER_ADMIN: [
    { id: 'u-bsa-1', displayName: 'Secondary Platform Administrator', identifier: 'PLATFORM-BACKUP-01', email: 'backup_admin@platform.erp.in', roleCode: 'BACKUP_SUPER_ADMIN' }
  ],
  DEVELOPER: [
    { id: 'u-dev-1', displayName: 'Lead Platform Engineer / Support', identifier: 'DEV-ENG-42', email: 'developer@platform.erp.in', roleCode: 'DEVELOPER' }
  ]
};

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('PRINCIPAL');
  const [email, setEmail] = useState('principal@akshara.edu.in');
  const [password, setPassword] = useState('PrincipalSecurePassword2026!');
  const [schoolCode, setSchoolCode] = useState('akshara');
  const [showPassword, setShowPassword] = useState(false);
  
  // Role-based User Autocomplete
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [selectedUserLabel, setSelectedUserLabel] = useState<string>('Dr. Ramesh Kumar (EMP-PRIN-01)');
  const [isSearching, setIsSearching] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Handle role switch
  const handleRoleSelect = (roleCode: string) => {
    setSelectedRole(roleCode);
    const defaults = PRESET_ACCOUNTS[roleCode];
    if (defaults && defaults.length > 0) {
      const first = defaults[0];
      setEmail(first.email);
      setSelectedUserLabel(`${first.displayName} (${first.identifier})`);
      setSearchTerm('');
      setSuggestions([]);
      if (roleCode === 'SUPER_ADMIN' || roleCode === 'BACKUP_SUPER_ADMIN' || roleCode === 'DEVELOPER') {
        setPassword('AdminSecurePassword2026!');
        setSchoolCode('');
      } else {
        setPassword('PrincipalSecurePassword2026!');
        setSchoolCode('akshara');
      }
    }
  };

  // Search autocomplete triggered after 2-4 chars
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      setIsSearching(true);
      const accounts = PRESET_ACCOUNTS[selectedRole] || [];
      const filtered = accounts.filter(
        a => a.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             a.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
             a.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
      setIsSearching(false);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, selectedRole]);

  const handleSelectSuggestion = (user: UserSuggestion) => {
    setEmail(user.email);
    setSelectedUserLabel(`${user.displayName} (${user.identifier})`);
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        tenant_code: schoolCode || undefined,
      });

      const { access_token, refresh_token, user } = res.data;
      await login(access_token, refresh_token, user);

      if (user.is_superadmin) {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // In sandbox mode fallback or simulated auth failure
      setError(err.response?.data?.detail || 'Authentication failed. Please verify selected role and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      {/* Top Brand Banner */}
      <div className="max-w-xl w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Institution Portal • Zero-Trust Role Isolation
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Akshara Global ERP</h1>
        <p className="text-sm text-slate-400 mt-1">Composite School & Pre-University College Campus</p>
      </div>

      <div className="max-w-xl w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-slate-100">
        
        {/* Step 1: Login Role Dropdown */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Select Login Role</span>
            </label>
            <span className="text-[11px] text-blue-400 font-semibold bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800/50">
              Role: {selectedRole}
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {INSTITUTION_ROLES.map((r) => (
                <option key={r.code} value={r.code} className="bg-slate-900 text-white">
                  {r.icon} {r.label} ({r.badge})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Role selection scopes autocomplete users and target dashboard. Privileges are strictly verified by the backend.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-xs text-red-200 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 2: Role-based User Autocomplete */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>2. User Account (Restricted to {selectedRole})</span>
              <span className="text-[10px] text-slate-400 font-normal">Active Identity Search</span>
            </label>
            
            {/* Active Selected User Chip */}
            <div className="mb-2 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200 truncate">{selectedUserLabel}</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/50 font-bold shrink-0">
                Verified
              </span>
            </div>

            {/* Search Input for Autocomplete */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Type 2+ chars to search ${selectedRole} accounts...`}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {suggestions.length > 0 && (
              <div className="mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl divide-y divide-slate-700/60 z-20">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-700/80 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{s.displayName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {s.identifier} • {s.email}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email / Principal Login
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Password with Visibility Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Institution Code */}
          {selectedRole !== 'SUPER_ADMIN' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Institution Code</span>
                <span className="text-[10px] text-slate-400 font-normal">Verified Campus Tenant</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  placeholder="e.g. akshara"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs py-1">
            <button
              type="button"
              onClick={() => alert("Password Recovery Notice:\n\nPlease contact your Platform Super Admin (admin@platform.erp.in) or Institution IT Desk to obtain an OTP reset link.")}
              className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
            >
              Forgot password?
            </button>
            <span className="text-[11px] text-slate-400">Zero-Trust Protected</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Validating Session & Authorizing...' : `Authenticate as ${selectedRole.replace('_', ' ')}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Argon2id Salted • PostgreSQL RLS Boundary
          </span>
          <a href="/demo" className="text-blue-400 hover:underline font-semibold">
            Explore Demo Sandbox →
          </a>
        </div>
      </div>
    </div>
  );
};
