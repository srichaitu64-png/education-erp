import React from 'react';
import { MapPin, Sparkles, Atom, Sliders } from 'lucide-react';
import { useEnvironmentStore } from '../../store/environmentStore';

export const LiveEnvironmentStatusPill: React.FC = () => {
  const {
    location,
    localTimeFormatted,
    weather,
    ecosystem,
    toggleScienceDrawer,
    toggleDevStudio,
    isDeveloperOverride,
  } = useEnvironmentStore();

  const ecosystemLabel =
    ecosystem === 'INDIAN_FOREST'
      ? '🌿 Indian Forest'
      : ecosystem === 'OCEAN_COASTAL'
      ? '🌊 Coastal Ocean'
      : ecosystem === 'SNOW_POLAR'
      ? '❄️ Snowscape'
      : ecosystem === 'BOTANICAL_GARDEN'
      ? '🌺 Botanical Garden'
      : '🌾 Grassland Savanna';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Real-World Environment Status Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-800 text-xs shadow-xs">
        <span className="flex items-center gap-1 font-extrabold text-slate-900">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{location.city}</span>
        </span>

        <span className="text-slate-300">•</span>

        <span className="font-mono text-slate-600 font-semibold">{localTimeFormatted}</span>

        <span className="text-slate-300">•</span>

        <span className="font-bold text-slate-700">
          {weather.temperature}°C {weather.conditionText}
        </span>

        <span className="hidden sm:inline text-slate-300">•</span>

        <span className="hidden sm:inline text-[11px] font-semibold text-slate-600">
          {ecosystemLabel}
        </span>

        {isDeveloperOverride ? (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
            Simulated
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Living Science Explorer Trigger Button */}
      <button
        onClick={toggleScienceDrawer}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/90 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
        title="Explore educational science behind this environment"
      >
        <Atom className="w-3.5 h-3.5 text-blue-600" />
        <span>Science of Nature</span>
      </button>

      {/* Developer Environment Studio Trigger Button (Discreet) */}
      <button
        onClick={toggleDevStudio}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
        title="Developer Environment Studio (Simulate weather & time)"
      >
        <Sliders className="w-3 h-3" />
        <span className="hidden md:inline text-[11px]">Dev Studio</span>
      </button>
    </div>
  );
};
