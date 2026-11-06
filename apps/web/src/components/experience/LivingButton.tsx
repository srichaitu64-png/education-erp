import React, { useState, useRef, ButtonHTMLAttributes } from 'react';
import { useExperience } from './useExperience';

export interface LivingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const LivingButton: React.FC<LivingButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isSuccess = false,
  isError = false,
  icon,
  children,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const { settings, isReducedMotion } = useExperience();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    if (settings.buttonInteractionsEnabled && !isReducedMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rippleId = Date.now();

      setRipples((prev) => [...prev, { x, y, id: rippleId }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  // Base sizing
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-6 py-2.5 text-base font-semibold rounded-xl gap-2.5',
  }[size];

  // Variant themes
  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md hover:shadow-blue-500/20 border border-blue-500/30',
    secondary:
      'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white shadow-sm hover:shadow-md hover:shadow-slate-500/20 border border-slate-700',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 border border-emerald-500/30',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm hover:shadow-md hover:shadow-rose-500/20 border border-rose-500/30',
    outline:
      'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100/80 active:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-transparent',
  }[variant];

  // Dynamic feedback classes
  const feedbackClass = isSuccess
    ? 'ring-2 ring-emerald-400 bg-emerald-600 text-white shadow-emerald-400/40'
    : isError
    ? 'ring-2 ring-rose-400 animate-pulse'
    : '';

  return (
    <button
      ref={buttonRef}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center overflow-hidden
        transition-all duration-200 ease-out select-none
        active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100
        ${sizeStyles}
        ${variantStyles}
        ${feedbackClass}
        ${className}
      `}
      {...props}
    >
      {/* Interactive expanding light ripples */}
      {settings.buttonInteractionsEnabled &&
        !isReducedMotion &&
        ripples.map((ripple) => (
          <span
            key={ripple.id}
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none animate-ripple bg-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 10,
              height: 10,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

      {/* Loading state indicator */}
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0 transition-transform duration-200">{icon}</span>}
          <span>{children}</span>
        </>
      )}

      {/* Soft hover illumination shimmer */}
      {settings.buttonInteractionsEnabled && !isReducedMotion && !disabled && (
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out"
        />
      )}
    </button>
  );
};

