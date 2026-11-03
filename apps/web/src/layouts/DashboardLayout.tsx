import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  BookOpen,
  Settings,
  Shield,
  Wifi,
  WifiOff,
  LogOut,
  Sparkles,
  BarChart3,
  MessageSquare,
  Building2,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tenant, entitlements, logout } = useAuthStore();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isSuperAdmin = user?.is_superadmin;

  const institutionNavItems = [
    { label: 'Overview', path: '/dashboard', icon: GraduationCap },
    { label: 'Admissions & Students', path: '/dashboard/students', icon: Users, featureId: 'students.management' },
    { label: 'Fees & Invoicing', path: '/dashboard/fees', icon: CreditCard, featureId: 'fees.basic' },
    { label: 'Daily Attendance', path: '/dashboard/attendance', icon: CalendarCheck, featureId: 'attendance.basic' },
    { label: 'Examinations & Marks', path: '/dashboard/examinations', icon: Award, featureId: 'examinations.basic' },
    { label: 'Academics & Timetable', path: '/dashboard/academics', icon: BookOpen },
    { label: 'WhatsApp Automation', path: '/dashboard/whatsapp', icon: MessageSquare, featureId: 'communication.whatsapp' },
    { label: 'AI Performance Reports', path: '/dashboard/ai-reports', icon: Sparkles, featureId: 'analytics.ai_reports' },
    { label: 'Multi-Campus Directory', path: '/dashboard/campuses', icon: Building2, featureId: 'multi_campus' },
  ];

  const superAdminNavItems = [
    { label: 'Platform Overview', path: '/superadmin', icon: Shield },
    { label: 'Institutions Directory', path: '/superadmin/institutions', icon: Building2 },
    { label: 'Subscription Plans', path: '/superadmin/plans', icon: CreditCard },
    { label: 'Feature Entitlements', path: '/superadmin/entitlements', icon: Lock },
    { label: 'Global Audit Logs', path: '/superadmin/audit', icon: BarChart3 },
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : institutionNavItems;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: 'var(--brand-primary, #1E40AF)' }}>
              {tenant?.name ? tenant.name.charAt(0) : 'E'}
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 truncate max-w-[140px]">
                {tenant?.name || 'Education ERP'}
              </h2>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">
                {isSuperAdmin ? 'Super Admin' : (tenant?.institution_type?.replace('_', ' ') || 'SaaS Portal')}
              </span>
            </div>
          </div>
        </div>

        {/* Offline Synchronisation Banner */}
        <div className={`px-4 py-2 text-xs flex items-center justify-between font-medium ${isOnline ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-100' : 'bg-amber-50 text-amber-800 border-b border-amber-200'}`}>
          <div className="flex items-center gap-1.5">
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
            <span>{isOnline ? 'Cloud Synchronized' : 'Offline Mode (Local Store)'}</span>
          </div>
          {!isOnline && <span className="bg-amber-200 px-1.5 py-0.5 rounded text-[10px]">Queue Active</span>}
        </div>

        <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const feature = item.featureId ? entitlements[item.featureId] : null;
            const isLocked = !isSuperAdmin && feature && !feature.is_enabled;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isLocked && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Lock className="w-2.5 h-2.5" />
                    {feature.required_plan}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800">
              {isSuperAdmin ? 'Platform Management Console' : (tenant?.name || 'Dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {tenant?.subdomain && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono">
                {tenant.subdomain}.erp.local
              </span>
            )}
            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              {isSuperAdmin ? 'Super Administrator' : 'Production SaaS'}
            </span>
          </div>
        </header>

        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

