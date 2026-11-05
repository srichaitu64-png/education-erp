import React, { useState } from 'react';
import {
  Layers, BookOpen, GraduationCap, Users, CalendarCheck, Clock,
  Award, FileSpreadsheet, QrCode, FileCheck, CreditCard, DollarSign,
  UserCheck, Key, Layout, Building2, FlaskConical, Bus, MessageSquare,
  Upload, ShieldAlert, Lock, ChevronDown, ChevronRight, Menu, X, Shield, ShieldCheck
} from 'lucide-react';
import { UserRoleType } from '../../../store/demoStore';
import { useAuthStore } from '../../../store/authStore';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  isSuperAdminOnly?: boolean;
  badge?: string;
}

export interface NavGroupConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}

interface ProfessionalSidebarNavigationProps {
  currentRole: UserRoleType;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isTabLocked: (tabId: string) => { locked: boolean; reason?: string };
  isTabAllowed: (tabId: string) => boolean;
  designerNavConfigs: Record<string, any[]>;
}

export const ProfessionalSidebarNavigation: React.FC<ProfessionalSidebarNavigationProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  isTabLocked,
  isTabAllowed,
  designerNavConfigs
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Group state persistence
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'platform': true,
    'main': true,
    'academic': true,
    'finance': true,
    'people': true,
    'campus': true,
    'communication': true,
    'data': true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const isSuperAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'BACKUP_SUPER_ADMIN';
  const isLeadership = isSuperAdmin || ['CHAIRMAN_DIRECTOR', 'DIRECTOR', 'MANAGING_DIRECTOR'].includes(currentRole);

  // 7 Professional Collapsible Groups + Dedicated Platform Owner Group
  const navigationHierarchy: NavGroupConfig[] = [
    ...(isSuperAdmin ? [{
      id: 'platform',
      title: 'Platform SaaS Command',
      items: [
        { id: 'platform-superadmin', label: 'SaaS Command (1,248 Tenancies)', icon: ShieldAlert, badge: 'SaaS Root' },
        { id: 'permissions-centre', label: 'Central Permission Matrix', icon: Key, isSuperAdminOnly: true },
        { id: 'dashboard-designer', label: 'Dashboard & Access Designer', icon: Layout, isSuperAdminOnly: true },
      ]
    }] : []),
    {
      id: 'main',
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: Layers }
      ]
    },
    {
      id: 'academic',
      title: 'Academic Management',
      items: [
        { id: 'academics', label: 'Academic & Subjects', icon: BookOpen },
        { id: 'academic-structure', label: 'Class & Section Capacity', icon: Layers },
        { id: 'admissions', label: 'Admissions Pipeline', icon: GraduationCap },
        { id: 'students', label: 'Students (SIS)', icon: Users },
        { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
        { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
        { id: 'examinations', label: 'Examinations Lifecycle', icon: Award },
        { id: 'marks-register', label: 'Marks Register (Theory/Prac)', icon: FileSpreadsheet },
        { id: 'hall-tickets', label: 'Hall Tickets & Verification', icon: QrCode },
        { id: 'notice-board', label: 'Result Notice Board', icon: Award },
        { id: 'progress-cards', label: 'Student Progress Cards', icon: FileCheck }
      ]
    },
    {
      id: 'finance',
      title: 'Finance & Accounts',
      items: [
        { id: 'fees', label: 'Fee Invoices & Statements', icon: CreditCard },
        { id: 'fee-review', label: 'Consolidated Ledger & Signoff', icon: DollarSign }
      ]
    },
    {
      id: 'people',
      title: 'People & Administration',
      items: [
        { id: 'security-password', label: 'Security & Password', icon: ShieldCheck, badge: 'Protected' },
        { id: 'staff', label: 'Faculty & HR', icon: Users },
        { id: 'staff-duties', label: 'Staff Duty Assignments', icon: UserCheck },
        { id: 'institution-login', label: 'User Directory & Login', icon: UserCheck },
        ...(isLeadership ? [
          { id: 'institution-control-centre', label: 'Institution Control Centre', icon: Building2 },
          { id: 'permissions-centre', label: 'Roles & Permission Matrix', icon: Key, isSuperAdminOnly: true },
          { id: 'dashboard-designer', label: 'Dashboard & Access Designer', icon: Layout, isSuperAdminOnly: true }
        ] : [])
      ]
    },
    {
      id: 'campus',
      title: 'Campus Operations',
      items: [
        { id: 'laboratory', label: 'Laboratory & QR Inventory', icon: FlaskConical },
        { id: 'transport', label: 'Transport Fleet & GPS', icon: Bus }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      items: [
        { id: 'communication', label: 'Communication Hub (WhatsApp)', icon: MessageSquare }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      items: [
        { id: 'data-migration', label: 'Data Migration Centre', icon: Upload }
      ]
    }
  ];

  // Helper to determine if an item is visible for current role
  const isItemVisible = (item: NavItemConfig) => {
    const designerItems = designerNavConfigs[currentRole] || [];
    const designerMatch = designerItems.find(it => it.id === item.id);
    if (designerMatch && designerMatch.presentationState === 'COMPLETELY_HIDDEN') {
      return false;
    }

    if (item.isSuperAdminOnly && !isLeadership) {
      return false;
    }

    if (item.id === 'institution-control-centre' && !isLeadership) {
      return false;
    }

    return isTabAllowed(item.id);
  };

  const { tenant } = useAuthStore();
  const isTrial = tenant?.code === 'akshara-trial' || (tenant?.name && tenant.name.toLowerCase().includes('akshara'));
  const brandName = isTrial ? 'Akshara Global ERP' : 'OUR SCHOOL ERP';
  const brandSub = isTrial ? 'School & PU College (Trial)' : 'Demonstration Campus (Demo)';
  const brandInitial = isTrial ? 'A' : 'O';
  const brandBg = isTrial ? 'bg-amber-600' : 'bg-blue-600';

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden bg-[#172B4D] text-white p-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${brandBg} flex items-center justify-center font-bold text-xs text-white`}>{brandInitial}</div>
          <span className="font-bold text-xs">{brandName}</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`w-full md:w-64 bg-[#172B4D] text-slate-200 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto transition-all ${
          isMobileOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {/* Campus / Institution Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${brandBg} text-white font-black flex items-center justify-center text-sm shadow-md`}>
              {brandInitial}
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">{brandName}</h2>
              <span className="text-[10px] text-slate-400">{brandSub}</span>
            </div>
          </div>
        </div>

        {/* Navigation Hierarchy */}
        <nav className="p-3 space-y-4 flex-1">
          {navigationHierarchy.map((group) => {
            // Filter items in this group that are visible for current role
            const visibleItems = group.items.filter(isItemVisible);
            if (visibleItems.length === 0) return null; // Don't clutter UI with empty sections

            const isExpanded = expandedGroups[group.id] !== false;

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header with Subtle Toggle */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group"
                >
                  <span className="group-hover:text-blue-400 transition-colors">{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                  )}
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <div className="space-y-0.5 pt-0.5 pl-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const lockInfo = isTabLocked(item.id);
                      const isActive = activeTab === item.id;

                      if (lockInfo.locked) {
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              alert(`🔒 Subscription / Permission Locked:\n\n${lockInfo.reason}`);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-900/40 border border-slate-800/60 hover:bg-slate-850 transition-all cursor-not-allowed"
                            title={lockInfo.reason}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Locked
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectTab(item.id);
                            setIsMobileOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded font-bold uppercase">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Current Role Badge */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 truncate">Logged in as:</span>
            <strong className="text-white font-mono text-[11px] truncate">{currentRole}</strong>
          </div>
        </div>
      </aside>
    </>
  );
};

