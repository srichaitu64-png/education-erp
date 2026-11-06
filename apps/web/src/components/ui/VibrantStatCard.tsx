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
    cardBorder: 'border-slate-200 hover:border-teal-300',
    gradientBg: 'bg-white hover:bg-teal-50/30',
    iconBg: 'bg-teal-50 border-teal-200',
    iconColor: 'text-teal-700',
    valueColor: 'text-slate-900',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-800 font-bold',
    glow: 'shadow-xs',
  },
  blue: {
    cardBorder: 'border-slate-200 hover:border-blue-300',
    gradientBg: 'bg-white hover:bg-blue-50/30',
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-700',
    valueColor: 'text-slate-900',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800 font-bold',
    glow: 'shadow-xs',
  },
  purple: {
    cardBorder: 'border-slate-200 hover:border-purple-300',
    gradientBg: 'bg-white hover:bg-purple-50/30',
    iconBg: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-700',
    valueColor: 'text-slate-900',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-800 font-bold',
    glow: 'shadow-xs',
  },
  emerald: {
    cardBorder: 'border-slate-200 hover:border-emerald-300',
    gradientBg: 'bg-white hover:bg-emerald-50/30',
    iconBg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-700',
    valueColor: 'text-slate-900',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800 font-bold',
    glow: 'shadow-xs',
  },
  amber: {
    cardBorder: 'border-slate-200 hover:border-amber-300',
    gradientBg: 'bg-white hover:bg-amber-50/30',
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-700',
    valueColor: 'text-slate-900',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800 font-bold',
    glow: 'shadow-xs',
  },
  rose: {
    cardBorder: 'border-slate-200 hover:border-rose-300',
    gradientBg: 'bg-white hover:bg-rose-50/30',
    iconBg: 'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-700',
    valueColor: 'text-slate-900',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-800 font-bold',
    glow: 'shadow-xs',
  },
  indigo: {
    cardBorder: 'border-slate-200 hover:border-indigo-300',
    gradientBg: 'bg-white hover:bg-indigo-50/30',
    iconBg: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-700',
    valueColor: 'text-slate-900',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-800 font-bold',
    glow: 'shadow-xs',
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
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 block truncate">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
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
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
          {subtitle && (
            <span className="text-slate-600 font-medium truncate">{subtitle}</span>
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
