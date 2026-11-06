import React from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Sun,
  CloudRain,
  Moon,
  Sparkles,
  Waves,
  Snowflake,
  Compass,
} from 'lucide-react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { TimeOfDay, WeatherCondition, WildlifeEcosystem } from '../../types/environment';

export const DeveloperEnvironmentStudio: React.FC = () => {
  const {
    isDevStudioOpen,
    toggleDevStudio,
    timeOfDay,
    weather,
    ecosystem,
    location,
    isDeveloperOverride,
    setDeveloperOverride,
    resetToLive,
  } = useEnvironmentStore();

  if (!isDevStudioOpen) return null;

  const presets = [
    {
      name: '🌅 Bengaluru Morning Sunshine',
      city: 'Bengaluru',
      timeOfDay: 'MORNING' as TimeOfDay,
      condition: 'CLEAR' as WeatherCondition,
      temperature: 24,
      windSpeed: 8,
      ecosystem: 'INDIAN_FOREST' as WildlifeEcosystem,
    },
    {
      name: '🌧️ Monsoon Downpour & Stream',
      city: 'Mangaluru',
      timeOfDay: 'AFTERNOON' as TimeOfDay,
      condition: 'HEAVY_RAIN' as WeatherCondition,
      temperature: 22,
      windSpeed: 24,
      ecosystem: 'INDIAN_FOREST' as WildlifeEcosystem,
    },
    {
      name: '🌇 Golden Hour & Atmospheric Sunset',
      city: 'Mysuru',
      timeOfDay: 'GOLDEN_HOUR' as TimeOfDay,
      condition: 'CLEAR' as WeatherCondition,
      temperature: 27,
      windSpeed: 10,
      ecosystem: 'BOTANICAL_GARDEN' as WildlifeEcosystem,
    },
    {
      name: '🌌 Starlit Night Sky & Moon Phase',
      city: 'Bengaluru',
      timeOfDay: 'NIGHT' as TimeOfDay,
      condition: 'CLEAR' as WeatherCondition,
      temperature: 18,
      windSpeed: 6,
      ecosystem: 'INDIAN_FOREST' as WildlifeEcosystem,
    },
    {
      name: '🌊 Coastal Waves, Dolphins & Turtles',
      city: 'Goa',
      timeOfDay: 'MIDDAY' as TimeOfDay,
      condition: 'CLEAR' as WeatherCondition,
      temperature: 29,
      windSpeed: 16,
      ecosystem: 'OCEAN_COASTAL' as WildlifeEcosystem,
    },
    {
      name: '❄️ Polar Snowscape & Penguins',
      city: 'Srinagar',
      timeOfDay: 'MORNING' as TimeOfDay,
      condition: 'SNOW' as WeatherCondition,
      temperature: 1,
      windSpeed: 12,
      ecosystem: 'SNOW_POLAR' as WildlifeEcosystem,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-900">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                  Developer Simulation Studio
                </span>
                {isDeveloperOverride ? (
                  <span className="text-xs text-amber-700 font-bold">Manual Simulation Active</span>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">Live Automatic Mode</span>
                )}
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                Simulate Real-World Environments
              </h2>
            </div>
          </div>

          <button
            onClick={toggleDevStudio}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Controls */}
        <div className="p-6 space-y-6 text-xs">
          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              One-Click Environmental Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setDeveloperOverride(preset)}
                  className="p-3 text-left rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition-all font-bold text-slate-800 flex items-center justify-between cursor-pointer group"
                >
                  <span>{preset.name}</span>
                  <span className="text-slate-400 group-hover:text-blue-600 font-mono text-[10px]">
                    {preset.temperature}°C
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day Control */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Time of Day & Solar Angle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'DAWN', label: '🌅 Dawn (06:00)' },
                { id: 'MORNING', label: '☀️ Morning (09:00)' },
                { id: 'MIDDAY', label: '🌞 Midday (12:30)' },
                { id: 'AFTERNOON', label: '🌤️ Afternoon (16:00)' },
                { id: 'GOLDEN_HOUR', label: '🌇 Golden Hour (17:45)' },
                { id: 'SUNSET', label: '🌆 Sunset (18:45)' },
                { id: 'TWILIGHT', label: '🔮 Twilight (19:30)' },
                { id: 'NIGHT', label: '🌌 Night (22:00)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDeveloperOverride({ timeOfDay: t.id as TimeOfDay })}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    timeOfDay === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Condition Control */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Atmospheric Weather Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CLEAR', label: '☀️ Clear Sky' },
                { id: 'PARTLY_CLOUDY', label: '⛅ Partly Cloudy' },
                { id: 'OVERCAST', label: '☁️ Overcast' },
                { id: 'DRIZZLE', label: '🌦️ Light Drizzle' },
                { id: 'RAIN', label: '🌧️ Monsoon Rain' },
                { id: 'THUNDERSTORM', label: '⛈️ Thunderstorm' },
                { id: 'MIST_FOG', label: '🌫️ Morning Mist' },
                { id: 'SNOW', label: '❄️ Snowfall' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => setDeveloperOverride({ condition: w.id as WeatherCondition })}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    weather.condition === w.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wildlife & Natural Ecosystem Habitat */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Wildlife Habitat & Animal Ecosystem
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'INDIAN_FOREST', label: '🐅 Indian Forest (Tiger & Deer)' },
                { id: 'OCEAN_COASTAL', label: '🐬 Coastal Ocean (Waves & Dolphins)' },
                { id: 'SNOW_POLAR', label: '🐧 Polar Snowscape (Penguins)' },
                { id: 'BOTANICAL_GARDEN', label: '🌺 Botanical Garden (Deer & Flora)' },
                { id: 'SAVANNA_GRASSLAND', label: '🌾 Grassland Savanna' },
              ].map((eco) => (
                <button
                  key={eco.id}
                  onClick={() => setDeveloperOverride({ ecosystem: eco.id as WildlifeEcosystem })}
                  className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                    ecosystem === eco.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {eco.label}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature & Wind Speed Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Temperature</span>
                <span className="font-mono font-bold text-slate-900">{weather.temperature}°C</span>
              </div>
              <input
                type="range"
                min="-5"
                max="45"
                value={weather.temperature}
                onChange={(e) => setDeveloperOverride({ temperature: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Wind Velocity</span>
                <span className="font-mono font-bold text-slate-900">{weather.windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weather.windSpeed}
                onChange={(e) => setDeveloperOverride({ windSpeed: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer with Reset to Live */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              resetToLive();
              toggleDevStudio();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return to Live Automatic Environment</span>
          </button>

          <button
            onClick={toggleDevStudio}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>
  );
};
