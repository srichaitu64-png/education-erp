import React from 'react';
import { useExperience } from './useExperience';

interface LivingTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  children: React.ReactNode;
}

export const LivingTab: React.FC<LivingTabProps> = ({
  isActive,
  icon,
  badge,
  children,
  className = '',
  ...props
}) => {
  const { isReducedMotion } = useExperience();

  return (
    <button
      type="button"
      className={`
        relative flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl select-none
        transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
        ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
        }
        ${!isReducedMotion ? 'active:scale-[0.98]' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>

      {badge !== undefined && (
        <span
          className={`
            ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full
            ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}
          `}
        >
          {badge}
        </span>
      )}

      {/* Subtle active indicator sweep */}
      {isActive && !isReducedMotion && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-3 right-3 h-0.5 bg-white/40 rounded-full"
        />
      )}
    </button>
  );
};

