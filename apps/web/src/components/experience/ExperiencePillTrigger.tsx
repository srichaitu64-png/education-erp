import React from 'react';
import { useExperience } from './useExperience';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { ATMOSPHERE_METADATA } from './experience.config';

export const ExperiencePillTrigger: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = '',
}) => {
  const { openSettingsModal, activeAtmosphere, settings, isReducedMotion } = useExperience();
  const currentMeta = ATMOSPHERE_METADATA[activeAtmosphere] || ATMOSPHERE_METADATA['soap-bubbles'];

  return (
    <button
      type="button"
      onClick={openSettingsModal}
      title="Open Natural Living Experience Studio"
      className={`
        relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full
        bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700
        border border-slate-200/80 dark:border-slate-700
        text-slate-700 dark:text-slate-200 shadow-sm hover:shadow
        transition-all duration-200 ease-out active:scale-95 select-none
        ${className}
      `}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`
            animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
            ${settings.ambientEffectsEnabled && !isReducedMotion ? 'bg-sky-400' : 'bg-slate-400'}
          `}
        />
        <span
          className={`
            relative inline-flex rounded-full h-2 w-2
            ${settings.ambientEffectsEnabled && !isReducedMotion ? 'bg-sky-500' : 'bg-slate-500'}
          `}
        />
      </span>

      <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />

      {!compact && (
        <span className="font-semibold text-[11px] truncate max-w-[130px]">
          {currentMeta.label.split(' ')[0]} {currentMeta.label.split(' ')[1] || ''}
        </span>
      )}

      <SlidersHorizontal className="w-3 h-3 text-slate-400 flex-shrink-0" />
    </button>
  );
};

