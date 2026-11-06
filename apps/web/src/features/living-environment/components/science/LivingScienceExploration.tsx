import React from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Atom,
  Droplets,
  Sun,
  Moon,
  Wind,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { ScienceTopic } from '../../types/environment';

export const LivingScienceExploration: React.FC = () => {
  const {
    activeScienceConcept,
    isScienceDrawerOpen,
    toggleScienceDrawer,
    timeOfDay,
    weather,
    solar,
  } = useEnvironmentStore();

  const [selectedTopic, setSelectedTopic] = React.useState<ScienceTopic>(activeScienceConcept.topic);

  React.useEffect(() => {
    setSelectedTopic(activeScienceConcept.topic);
  }, [activeScienceConcept.topic]);

  if (!isScienceDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-900">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <Atom className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                  Interactive Living Science Lab
                </span>
                <span className="text-xs text-slate-500 font-medium">Real-World Environmental Phenomena</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                The Science of This Moment
              </h2>
            </div>
          </div>

          <button
            onClick={toggleScienceDrawer}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Live Environmental Context Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800">Live External Sensors:</span>
              <span className="text-slate-600">
                {weather.temperature}°C • {weather.conditionText} • Wind {weather.windSpeed} km/h • Solar Elevation {solar.elevation}°
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-200">
              {solar.moonPhaseName}
            </span>
          </div>

          {/* Science Topic Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'PHOTOSYNTHESIS', label: '🌱 Photosynthesis (Biology)', icon: Sun },
              { id: 'WATER_CYCLE', label: '🌧️ Water Cycle (Earth Science)', icon: Droplets },
              { id: 'RAYLEIGH_SCATTERING', label: '🌅 Rayleigh Scattering (Physics)', icon: Sparkles },
              { id: 'CELESTIAL_ASTRONOMY', label: '🔭 Lunar & Stars (Astronomy)', icon: Moon },
              { id: 'FLUID_AERODYNAMICS', label: '🦅 Aerodynamics (Physics)', icon: Wind },
            ].map((t) => {
              const isSelected = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id as ScienceTopic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Topic Detail View */}
          {selectedTopic === 'PHOTOSYNTHESIS' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Biology & Plant Physiology
                </span>
                <h3 className="text-lg font-black text-emerald-950">
                  Solar Photons, Chloroplasts & The Calvin Cycle
                </h3>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  When solar radiation reaches green foliage, pigments called <strong>Chlorophyll-a and Chlorophyll-b</strong> located within the thylakoid membranes of chloroplasts absorb photons in the blue (~430nm) and red (~660nm) spectrums. This light excitation powers photolysis, splitting water into hydrogen ions and releasing pure oxygen into our atmosphere.
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-xs font-bold text-emerald-800 text-center">
                  6 CO₂ + 6 H₂O + Photons (hν) ⟶ C₆H₁₂O₆ (Glucose) + 6 O₂ ↑
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">Light Phase (Thylakoids)</p>
                  <p className="text-slate-500 mt-1 text-[11px]">Produces ATP & NADPH via Photosystem I & II.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">Dark Phase (Stroma)</p>
                  <p className="text-slate-500 mt-1 text-[11px]">Fixes CO₂ into sugars via enzyme RuBisCO.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">Biomass Generation</p>
                  <p className="text-slate-500 mt-1 text-[11px]">Fuels growth of bamboo, mango trees & forests.</p>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'WATER_CYCLE' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                  Earth Science & Thermodynamics
                </span>
                <h3 className="text-lg font-black text-sky-950">
                  The Global Hydrological Cycle & Phase Changes
                </h3>
                <p className="text-xs text-sky-900 leading-relaxed font-medium">
                  Solar thermal energy drives evaporation from lakes, oceans, and plant transpiration into the troposphere. As moist warm air ascends, adiabatic expansion cools it to its dew point, forming micro-droplets of clouds that coalesce until gravity precipitates them as rain or snow.
                </p>
                <div className="p-3 bg-white rounded-xl border border-sky-200 font-mono text-xs font-bold text-sky-800 text-center">
                  Evaporation & Transpiration ⟶ Adiabatic Condensation ⟶ Precipitation ⟶ Groundwater Infiltration
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">Monsoon Dynamics</p>
                  <p className="text-slate-500 mt-1 text-[11px]">Thermal land-ocean temperature differential.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">Terminal Velocity</p>
                  <p className="text-slate-500 mt-1 text-[11px]">Raindrops reach steady fall speed of ~9 m/s.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">Ecological Recharge</p>
                  <p className="text-slate-500 mt-1 text-[11px]">Replenishes Cauvery river basin & groundwater.</p>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'RAYLEIGH_SCATTERING' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Optics & Atmospheric Physics
                </span>
                <h3 className="text-lg font-black text-amber-950">
                  Rayleigh Scattering: Why Day Sky Is Blue & Sunsets Are Gold
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  Molecules of nitrogen ($N_2$) and oxygen ($O_2$) are significantly smaller than the wavelength of visible light. Lord Rayleigh formulated that scattering intensity is inversely proportional to the fourth power of the wavelength: $I \propto 1 / \lambda^4$. Shorter wavelengths (blue ~450nm) scatter 5 to 6 times more than red wavelengths (~700nm), flooding the dome of the sky with blue. At sunset, the path length increases by 10×, leaving only the unscattered gold and crimson tones.
                </p>
                <div className="p-3 bg-white rounded-xl border border-amber-200 font-mono text-xs font-bold text-amber-800 text-center">
                  Scattering Intensity: I(λ) ∝ 1 / λ⁴
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'CELESTIAL_ASTRONOMY' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                  Celestial Mechanics & Astrophysics
                </span>
                <h3 className="text-lg font-black text-indigo-950">
                  Lunar Synodic Cycle ({solar.moonPhaseName}) & Stellar Navigators
                </h3>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  The Moon revolves around Earth with an orbital synodic period of 29.5306 days. The current lunar phase calculated for today is <strong>{solar.moonPhaseName}</strong> (Phase: {(solar.moonPhase * 100).toFixed(0)}%). Navigators since ancient Vedic astronomy used constellations like the Saptarshi (Ursa Major) to locate the North Star (Dhruva Tara / Polaris).
                </p>
                <div className="p-3 bg-white rounded-xl border border-indigo-200 font-mono text-xs font-bold text-indigo-800 text-center">
                  Synodic Orbit = 29.5306 Days • Earth Axial Obliquity = 23.44°
                </div>
              </div>
            </div>
          )}

          {selectedTopic === 'FLUID_AERODYNAMICS' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                  Fluid Dynamics & Biomimicry
                </span>
                <h3 className="text-lg font-black text-purple-950">
                  Bernoulli's Equation & Aerodynamic Bird Flight
                </h3>
                <p className="text-xs text-purple-900 leading-relaxed font-medium">
                  A flying bird's wing is an asymmetric airfoil with positive camber. Air traveling over the upper curved surface accelerates faster than the air underneath. In accordance with Bernoulli's principle, this velocity differential produces a pressure drop on top, creating a net upward lift force ($F_L$) that overcomes gravity.
                </p>
                <div className="p-3 bg-white rounded-xl border border-purple-200 font-mono text-xs font-bold text-purple-800 text-center">
                  Lift: L = ½ · ρ · v² · S · C_L
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Living Environmental Science Curriculum • Inspiring curiosity in everyday nature
          </p>
          <button
            onClick={toggleScienceDrawer}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Close Exploration
          </button>
        </div>
      </div>
    </div>
  );
};
