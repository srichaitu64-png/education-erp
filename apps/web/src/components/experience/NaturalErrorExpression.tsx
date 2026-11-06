import React from 'react';
import { useExperience } from './useExperience';
import { AlertCircle, AlertTriangle, ShieldAlert, X, RefreshCw } from 'lucide-react';

export const NaturalErrorExpression: React.FC = () => {
  const { activeError, clearError, settings } = useExperience();

  if (!activeError || !settings.errorExpressionsEnabled) return null;

  const isLevel3 = activeError.severity === 'level-3-critical';
  const isLevel2 = activeError.severity === 'level-2-validation';

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 pointer-events-auto"
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl p-5 shadow-2xl backdrop-blur-xl border
          ${
            isLevel3
              ? 'bg-rose-950/95 text-rose-50 border-rose-700/80 shadow-rose-950/50'
              : isLevel2
              ? 'bg-amber-950/95 text-amber-50 border-amber-700/80 shadow-amber-950/50'
              : 'bg-slate-900/95 text-slate-50 border-slate-700/80 shadow-slate-950/50'
          }
          animate-fade-in-up
        `}
      >
        {/* Subtle background pulse for Level 2 and Level 3 */}
        {(isLevel2 || isLevel3) && (
          <span
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none bg-rose-500"
          />
        )}

        <div className="flex items-start gap-3.5">
          {/* Visual icon or emblem */}
          <div className="flex-shrink-0 mt-0.5">
            {isLevel3 ? (
              <div className="relative">
                {/* Optional noble crest visual emblem for critical errors (STRICTLY SILENT) */}
                {settings.enableExpressiveErrorIllustrations ? (
                  <div
                    title="Security & Fault Guard"
                    className="w-10 h-10 rounded-xl bg-rose-900/80 border border-rose-500/50 flex items-center justify-center text-amber-300 font-serif text-lg shadow-inner select-none"
                  >
                    <ShieldAlert className="w-6 h-6 text-rose-300" />
                  </div>
                ) : (
                  <ShieldAlert className="w-7 h-7 text-rose-400" />
                )}
              </div>
            ) : isLevel2 ? (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-sky-400" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isLevel3
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : isLevel2
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}
              >
                {isLevel3 ? 'Critical Alert' : isLevel2 ? 'Validation Guard' : 'Notice'}
              </span>
            </div>
            <h4 className="text-sm font-bold mt-1 text-white">{activeError.title}</h4>
            <p className="text-xs mt-1 text-slate-300 leading-relaxed">{activeError.message}</p>

            {/* Recovery Action if provided */}
            {activeError.onRecover && (
              <div className="mt-3 pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    activeError.onRecover?.();
                    clearError();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 active:scale-95"
                >
                  <RefreshCw className="w-3 h-3" />
                  {activeError.recoveryActionLabel || 'Retry Operation'}
                </button>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={clearError}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss error notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

