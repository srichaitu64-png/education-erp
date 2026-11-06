import React from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { BengalTigerAnimation } from './BengalTigerAnimation';
import { ChitalDeerAnimation } from './ChitalDeerAnimation';
import { OceanMarineLife } from './OceanMarineLife';
import { PolarPenguinsAnimation } from './PolarPenguinsAnimation';
import { ButterfliesAndFlora } from './ButterfliesAndFlora';

export const WildlifeEcosystemLayer: React.FC = () => {
  const { ecosystem, timeOfDay, weather } = useEnvironmentStore();

  const isStorm = weather.condition === 'THUNDERSTORM';

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
      {/* 1. Ocean Coastal Habitat */}
      {ecosystem === 'OCEAN_COASTAL' && <OceanMarineLife />}

      {/* 2. Snow & Polar World Habitat */}
      {ecosystem === 'SNOW_POLAR' && <PolarPenguinsAnimation />}

      {/* 3. Indian Forest & Savanna & Botanical Garden */}
      {(ecosystem === 'INDIAN_FOREST' || ecosystem === 'BOTANICAL_GARDEN' || ecosystem === 'SAVANNA_GRASSLAND') && (
        <>
          {/* Flora: Swaying Bamboo & Butterflies */}
          <ButterfliesAndFlora />

          {/* Peaceful Chital Deer on Left Meadow */}
          <div className="absolute left-[3%] sm:left-[8%] lg:left-[10%] bottom-0 opacity-85 transition-opacity duration-1000">
            <ChitalDeerAnimation />
          </div>

          {/* Majestic Royal Bengal Tiger Resting on Right Forest Bed */}
          {!isStorm && (
            <div className="absolute right-[2%] sm:right-[6%] lg:right-[8%] bottom-0 opacity-90 transition-opacity duration-1000">
              <BengalTigerAnimation />
            </div>
          )}
        </>
      )}
    </div>
  );
};
