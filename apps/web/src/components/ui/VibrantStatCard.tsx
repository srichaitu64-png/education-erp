import React from 'react';
import { LucideIcon } from 'lucide-react';
import { NumberTicker } from './NumberTicker';

export type VibrantColorTheme = 'teal' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo';

interface VibrantStatCardProps {
  title: string;
  value?: number | string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  subtitle?: string;
  badge?: string;
  icon: LucideIcon;
  theme?: VibrantColorTheme;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  className?: string;
}

const themeStyles: Record<VibrantColorTheme, {
  cardBorder: string;
  gradientBg: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
}> = {
  teal: {
    cardBorder: 'border-teal-500/50 hover:border-teal-400',
    gradientBg: 'bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950',
    iconBg: 'bg-teal-500/20 border-teal-500/40',
    iconColor: 'text-teal-300',
    valueColor: 'text-white',
    badgeBg: 'bg-teal-900/90 border-teal-600',
    badgeText: 'text-teal-100 font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(13,148,136,0.25)]',
  },
  blue: {
    cardBorder: 'border-blue-500/50 hover:border-blue-400',
    gradientBg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950',
    iconBg: 'bg-blue-500/20 border-blue-500/40',
    iconColor: 'text-blue-300',
    valueColor: 'text-white',
    badgeBg: 'bg-blue-900/90 border-blue-600',
    badgeText: 'text-blue-100 font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(37,99,235,0.25)]',
  },
  purple: {
    cardBorder: 'border-purple-500/50 hover:border-purple-400',
    gradientBg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950',
    iconBg: 'bg-purple-500/20 border-purple-500/40',
    iconColor: 'text-purple-300',
    valueColor: 'text-white',
    badgeBg: 'bg-purple-900/90 border-purple-600',
    badgeText: 'text-purple-100 font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(147,51,234,0.25)]',
  },
  emerald: {
    cardBorder: 'border-emerald-500/50 hover:border-emerald-400',
    gradientBg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950',
    iconBg: 'bg-emerald-500/20 border-emerald-500/40',
    iconColor: 'text-emerald-300',
    valueColor: 'text-white',
    badgeBg: 'bg-emerald-900/90 border-emerald-600',
    badgeText: 'text-emerald-100 font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]',
  },
  amber: {
    cardBorder: 'border-amber-500/50 hover:border-amber-400',
    gradientBg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950',
    iconBg: 'bg-amber-500/20 border-amber-500/40',
    iconColor: 'text-amber-300',
    valueColor: 'text-white',
    badgeBg: 'bg-amber-900/90 border-amber-600',
    badgeText: 'text-amber-100 font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]',
  },
  rose: {
    cardBorder: 'border-rose-500/50 hover:border-rose-400',
    gradientBg: 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950',
    iconBg: 'bg-rose-500/20 border-rose-500/40',
    iconColor: 'text-rose-300',
    valueColor: 'text-white',
    badgeBg: 'bg-rose-900/90 border-rose-600',
    badgeText: 'text-rose-100 font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)]',
  },
  indigo: {
    cardBorder: 'border-indigo-500/50 hover:border-indigo-400',
    gradientBg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950',
    iconBg: 'bg-indigo-500/20 border-indigo-500/40',
    iconColor: 'text-indigo-300',
    valueColor: 'text-white',
    badgeBg: 'bg-indigo-900/90 border-indigo-600',
    badgeText: 'text-indigo-100 font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)]',
  },
};

export const VibrantStatCard: React.FC<VibrantStatCardProps> = ({
  title,
  value,
  numericValue,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  subtitle,
  badge,
  icon: Icon,
  theme = 'teal',
  trend,
  onClick,
  className = '',
}) => {
  const current = themeStyles[theme];

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-2xl border ${current.cardBorder} ${current.gradientBg} ${current.glow} transition-all duration-300 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] uppercase font-black tracking-wider text-slate-200 block truncate">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-black tracking-tight">
            {numericValue !== undefined ? (
              <NumberTicker
                value={numericValue}
                prefix={prefix}
                suffix={suffix}
                decimalPlaces={decimalPlaces}
                className={current.valueColor}
              />
            ) : (
              <span className={`font-mono ${current.valueColor}`}>{value}</span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border ${current.iconBg} ${current.iconColor} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend || badge) && (
        <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] gap-2">
          {subtitle && (
            <span className="text-slate-300 font-medium truncate">{subtitle}</span>
          )}
          {trend && (
            <span className={`font-bold font-mono px-2 py-0.5 rounded-md border text-[10px] ${current.badgeBg} ${current.badgeText} shrink-0`}>
              {trend}
            </span>
          )}
          {badge && (
            <span className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${current.badgeBg} ${current.badgeText} shrink-0`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
