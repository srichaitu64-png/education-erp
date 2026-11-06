import React from 'react';
import { useExperience } from './useExperience';

interface SmoothPageTransitionProps {
  children: React.ReactNode;
  pageKey?: string;
  className?: string;
}

export const SmoothPageTransition: React.FC<SmoothPageTransitionProps> = ({
  children,
  pageKey,
  className = '',
}) => {
  const { settings, isReducedMotion } = useExperience();

  if (!settings.pageTransitionsEnabled || isReducedMotion) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <div
      key={pageKey}
      className={`w-full animate-fade-in-up transition-opacity duration-300 ease-out ${className}`}
      style={{
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
};

