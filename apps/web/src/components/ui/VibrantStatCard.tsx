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
    cardBorder: 'border-teal-500/40 hover:border-teal-400/70',
    gradientBg: 'bg-gradient-to-br from-teal-950/50 via-slate-900/70 to-slate-950/90',
    iconBg: 'bg-teal-500/20 border-teal-500/30',
    iconColor: 'text-teal-400',
    valueColor: 'text-teal-200',
    badgeBg: 'bg-teal-950/80 border-teal-700/60',
    badgeText: 'text-teal-300',
    glow: 'shadow-[0_0_25px_-5px_rgba(13,148,136,0.15)]',
  },
  blue: {
    cardBorder: 'border-blue-500/40 hover:border-blue-400/70',
    gradientBg: 'bg-gradient-to-br from-blue-950/50 via-slate-900/70 to-slate-950/90',
    iconBg: 'bg-blue-500/20 border-blue-500/30',
    iconColor: 'text-blue-400',
    valueColor: 'text-blue-200',
    badgeBg: 'bg-blue-950/80 border-blue-700/60',
    badgeText: 'text-blue-300',
    glow: 'shadow-[0_0_25px_-5px_rgba(37,99,235,0.15)]',
  },
  purple: {
    cardBorder: 'border-purple-500/40 hover:border-purple-400/70',
    gradientBg: 'bg-gradient-to-br from-purple-950/50 via-slate-900/70 to-slate-950/90',
    iconBg: 'bg-purple-500/20 border-purple-500/30',
    iconColor: 'text-purple-400',
    valueColor: 'text-purple-200',
    badgeBg: 'bg-purple-950/80 border-purple-700/60',
    badgeText: 'text-purple-300',
    glow: 'shadow-[0_0_25px_-5px_rgba(147,51,234,0.15)]',
  },
  emerald: {
    cardBorder: 'border-emerald-500/40 hover:border-emerald-400/70',
    gradientBg: 'bg-gradient-to-br from-emerald-950/50 via-slate-900/70 to-slate-950/90',
    iconBg: 'bg-emerald-500/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-200',
    badgeBg: 'bg-emerald-950/80 border-emerald-700/60',
    badgeText: 'text-emerald-300',
    glow: 'shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)]',
  },
  amber: {
    cardBorder: 'border-amber-500/40 hover:border-amber-400/70',
    gradientBg: 'bg-gradient-to-br from-amber-950/50 via-slate-900/70 to-slate-950/90',
    iconBg: 'bg-amber-500/20 border-amber-500/30',
    iconColor: 'text-amber-400',
    valueColor: 'text-amber-200',
    badgeBg: 'bg-amber-950/80 border-amber-700/60',
    badgeText: 'text-amber-300',
    glow: 'shadow-[0_0_25px_-5px_rgba(245,158,11,0.15)]',
  },
  rose: {
    cardBorder: 'border-rose-500/40 hover:border-rose-400/70',
    gradientBg: 'bg-gradient-to-br from-rose-950/50 via-slate-900/70 to-slate-950/90',
    iconBg: 'bg-rose-500/20 border-rose-500/30',
    iconColor: 'text-rose-400',
    valueColor: 'text-rose-200',
    badgeBg: 'bg-rose-950/80 border-rose-700/60',
    badgeText: 'text-rose-300',
    glow: 'shadow-[0_0_25px_-5px_rgba(244,63,94,0.15)]',
  },
  indigo: {
    cardBorder: 'border-indigo-500/40 hover:border-indigo-400/70',
    gradientBg: 'bg-gradient-to-br from-indigo-950/50 via-slate-900/70 to-slate-950/90',
    iconBg: 'bg-indigo-500/20 border-indigo-500/30',
    iconColor: 'text-indigo-400',
    valueColor: 'text-indigo-200',
    badgeBg: 'bg-indigo-950/80 border-indigo-700/60',
    badgeText: 'text-indigo-300',
    glow: 'shadow-[0_0_25px_-5px_rgba(99,102,241,0.15)]',
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
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">
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
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] gap-2">
          {subtitle && (
            <span className="text-slate-400 truncate">{subtitle}</span>
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
