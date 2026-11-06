import React from 'react';
import { useExperience } from './useExperience';
import { ATMOSPHERE_METADATA } from './experience.config';
import { AtmosphereType, VisualIntensity } from './experience.types';
import {
  X,
  Sparkles,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Eye,
  Check,
  Compass,
} from 'lucide-react';

export const ExperienceSettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    closeSettingsModal,
    settings,
    updateSettings,
    resetSettings,
    activeAtmosphere,
    setAtmosphere,
    isReducedMotion,
  } = useExperience();

  if (!isSettingsModalOpen) return null;

  const atmospheres = Object.keys(ATMOSPHERE_METADATA) as AtmosphereType[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={closeSettingsModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="experience-settings-title"
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="experience-settings-title" className="text-base font-bold text-slate-900 dark:text-white">
                Natural Living Experience Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize environmental atmosphere, living button feedback, and visual celebrations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSettingsModal}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          {/* Reduced Motion Warning if OS enabled */}
          {isReducedMotion && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-center gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <span>
                <strong>System Reduced Motion Active:</strong> Environmental particle motion is paused by your device
                accessibility preferences.
              </span>
            </div>
          )}

          {/* 1. Atmosphere Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                Living Atmosphere
              </h3>
              <span className="text-xs text-slate-400">
                Current: <strong className="text-blue-600 capitalize">{activeAtmosphere.replace('-', ' ')}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {atmospheres.map((atm) => {
                const meta = ATMOSPHERE_METADATA[atm];
                const isSelected = activeAtmosphere === atm;
                return (
                  <button
                    key={atm}
                    type="button"
                    onClick={() => {
                      setAtmosphere(atm);
                      updateSettings({ atmosphere: atm });
                    }}
                    className={`
                      flex items-start gap-3 p-3 text-left rounded-2xl border transition-all duration-150 select-none
                      ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                        ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }
                      `}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-tight">{meta.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {meta.description}
                      </div>
                      <div className="text-[10px] text-slate-400 italic mt-0.5">{meta.mood}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Visual Intensity */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-blue-500" />
              Visual Particle Intensity
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['subtle', 'balanced', 'expressive'] as VisualIntensity[]).map((level) => {
                const isSelected = settings.intensity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateSettings({ intensity: level })}
                    className={`
                      py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize text-center transition-all select-none
                      ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Particle density adapts automatically to maintain a steady 60fps frame rate.
            </p>
          </div>

          {/* 3. Feature Switches */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Interaction & Celebration Controls
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  id: 'ambientEffectsEnabled',
                  label: 'Ambient Background Canvas',
                  desc: 'Render natural environmental particle dynamics behind content.',
                  checked: settings.ambientEffectsEnabled,
                },
                {
                  id: 'buttonInteractionsEnabled',
                  label: 'Living Button Ripples & Sheen',
                  desc: 'Tactile compression, natural expanding ripples, and hover illumination.',
                  checked: settings.buttonInteractionsEnabled,
                },
                {
                  id: 'pageTransitionsEnabled',
                  label: 'Smooth Tab Transitions',
                  desc: 'Gentle fade and micro-lift between modules without form data reset.',
                  checked: settings.pageTransitionsEnabled,
                },
                {
                  id: 'celebrationsEnabled',
                  label: 'Confirmed Backend Celebrations',
                  desc: 'Petal showers, golden rays, and bubble blooms on actual database success.',
                  checked: settings.celebrationsEnabled,
                },
                {
                  id: 'pointerEffectsEnabled',
                  label: 'Natural Pointer Interaction',
                  desc: 'Gentle particle deflection and ambient motes responding to mouse movements.',
                  checked: settings.pointerEffectsEnabled,
                },
                {
                  id: 'enableExpressiveErrorIllustrations',
                  label: 'Level 3 Critical Error Emblem',
                  desc: 'Restrained visual security crest illustration for serious faults (strictly 0 audio).',
                  checked: settings.enableExpressiveErrorIllustrations,
                },
              ].map((sw) => (
                <label
                  key={sw.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <div className="pr-4">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{sw.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sw.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sw.checked}
                    onChange={(e) => updateSettings({ [sw.id]: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500/50"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={closeSettingsModal}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

