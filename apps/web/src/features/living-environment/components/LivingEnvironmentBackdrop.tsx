import React, { useEffect } from 'react';
import { useEnvironmentStore } from '../store/environmentStore';
import { SkyAndAtmosphereCanvas } from './canvas/SkyAndAtmosphereCanvas';
import { WeatherParticlesCanvas } from './canvas/WeatherParticlesCanvas';
import { BirdsFlockCanvas } from './canvas/BirdsFlockCanvas';
import { WildlifeEcosystemLayer } from './wildlife/WildlifeEcosystemLayer';
import { LivingScienceExploration } from './science/LivingScienceExploration';
import { DeveloperEnvironmentStudio } from './dev/DeveloperEnvironmentStudio';

export const LivingEnvironmentBackdrop: React.FC = () => {
  const { initEnvironment } = useEnvironmentStore();

  useEffect(() => {
    initEnvironment();
  }, [initEnvironment]);

  return (
    <>
      {/* Immersive Living Sky, Wildlife & Ambient Atmosphere Container */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Layer 1: Sky, Sun/Moon, Stars & Layered Clouds */}
        <SkyAndAtmosphereCanvas />

        {/* Layer 2: Flying Birds Flock */}
        <BirdsFlockCanvas />

        {/* Layer 3: Raindrops / Snow / Ambient Pollen Particles */}
        <WeatherParticlesCanvas />

        {/* Layer 4: Wildlife Animal Kingdom & Swaying Flora */}
        <WildlifeEcosystemLayer />
      </div>

      {/* Interactive Science Lab Drawer (Modal - Pointer Events Active) */}
      <LivingScienceExploration />

      {/* Developer Simulation Studio Drawer (Modal - Pointer Events Active) */}
      <DeveloperEnvironmentStudio />
    </>
  );
};
