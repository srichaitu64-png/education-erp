import React, { useState, useEffect } from 'react';
import {
  Search, X, BookOpen, Layers, Users, CalendarCheck, Clock, Award,
  FileSpreadsheet, QrCode, CreditCard, DollarSign, UserCheck, ShieldCheck,
  FlaskConical, Bus, MessageSquare, Upload, ShieldAlert, ArrowRight, CornerDownLeft
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Academic' | 'Finance' | 'Administration' | 'Operations' | 'Platform';
  icon: React.ElementType;
  shortcut?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: 'dashboard', title: 'Dashboard & Role Workspace', category: 'Administration', icon: Layers },
  { id: 'students', title: 'Student Information System (SIS)', category: 'Academic', icon: Users, shortcut: 'S' },
  { id: 'attendance', title: 'Attendance & Absentees (Daily/Period)', category: 'Academic', icon: CalendarCheck, shortcut: 'A' },
  { id: 'marks-register', title: 'Marks Register (Theory & Practical)', category: 'Academic', icon: FileSpreadsheet, shortcut: 'M' },
  { id: 'examinations', title: 'Examination Lifecycle & Schedules', category: 'Academic', icon: Award, shortcut: 'E' },
  { id: 'hall-tickets', title: 'Hall Tickets & Clearance Check', category: 'Academic', icon: QrCode },
  { id: 'notice-board', title: 'Result Notice Board & Gazette', category: 'Academic', icon: Award },
  { id: 'academic-structure', title: 'Academic Sections & Capacity', category: 'Academic', icon: BookOpen },
  { id: 'timetable', title: 'Weekly Timetable Matrix', category: 'Academic', icon: Clock },
  { id: 'fees', title: 'Fee Invoices & Cashier Desk', category: 'Finance', icon: CreditCard, shortcut: 'F' },
  { id: 'fee-review', title: 'Consolidated Fee Ledger & Chairman Signoff', category: 'Finance', icon: DollarSign },
  { id: 'staff', title: 'Faculty & HR Directory', category: 'Administration', icon: Users },
  { id: 'staff-duties', title: 'Staff Duty Assignments (Invigilation/Bus)', category: 'Administration', icon: UserCheck },
  { id: 'security-password', title: 'Security & Password Settings', category: 'Administration', icon: ShieldCheck },
  { id: 'laboratory', title: 'Laboratory Equipment & Reagent Inventory', category: 'Operations', icon: FlaskConical },
  { id: 'transport', title: 'Transport Fleet & Live GPS Tracking', category: 'Operations', icon: Bus },
  { id: 'communication', title: 'Communication Hub (WhatsApp/SMS Broadcast)', category: 'Operations', icon: MessageSquare },
  { id: 'data-migration', title: 'Data Migration Centre (CSV/Excel Import)', category: 'Operations', icon: Upload },
  { id: 'platform-superadmin', title: 'Platform SaaS Command (1,248 Tenancies)', category: 'Platform', icon: ShieldAlert },
];

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = COMMAND_ITEMS.filter(it =>
    it.title.toLowerCase().includes(query.toLowerCase()) ||
    it.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-950/50">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to any module (e.g. Fees, Attendance, Marks)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching modules or actions found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/60 text-white border border-teal-700/50'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg border ${
                      isSelected ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                        {item.shortcut}
                      </kbd>
                    )}
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↵</kbd> to select</span>
          </div>
          <span className="text-teal-400 font-semibold">EducationOS Fast Navigator</span>
        </div>
      </div>
    </div>
  );
};

