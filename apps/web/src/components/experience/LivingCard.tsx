import React from 'react';
import { useExperience } from './useExperience';

interface LivingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat' | 'glass';
  interactive?: boolean;
}

export const LivingCard: React.FC<LivingCardProps> = ({
  children,
  variant = 'elevated',
  interactive = false,
  className = '',
  ...props
}) => {
  const { isReducedMotion } = useExperience();

  const variantClass = {
    elevated: 'bg-white/95 dark:bg-slate-900/90 shadow-sm border border-slate-200/80 dark:border-slate-800',
    flat: 'bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800',
    glass: 'bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-white/40 dark:border-slate-700/50 shadow-sm',
  }[variant];

  const hoverClass =
    interactive && !isReducedMotion
      ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400/50 transition-all duration-200 ease-out cursor-pointer'
      : '';

  return (
    <div
      className={`rounded-2xl p-5 ${variantClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

