import {
  ScienceTopic,
  ScienceVisualizationConcept,
  Season,
  TimeOfDay,
  WeatherCondition,
  WildlifeEcosystem,
} from '../types/environment';

export class SeasonService {
  public static getSeason(date: Date = new Date(), lat: number = 12.97): Season {
    const month = date.getMonth(); // 0 = Jan, 11 = Dec

    // Indian Subcontinent (latitude 8°N to 35°N)
    if (lat >= 8 && lat <= 35) {
      if (month >= 2 && month <= 4) return 'SUMMER'; // March to May
      if (month >= 5 && month <= 8) return 'MONSOON'; // June to September
      if (month >= 9 && month <= 10) return 'POST_MONSOON'; // October to November
      return 'WINTER'; // December to February
    }

    // Standard temperate Northern Hemisphere
    if (lat > 35) {
      if (month >= 2 && month <= 4) return 'SPRING';
      if (month >= 5 && month <= 7) return 'SUMMER';
      if (month >= 8 && month <= 10) return 'POST_MONSOON';
      return 'WINTER';
    }

    // Southern Hemisphere
    if (month >= 2 && month <= 4) return 'POST_MONSOON';
    if (month >= 5 && month <= 7) return 'WINTER';
    if (month >= 8 && month <= 10) return 'SPRING';
    return 'SUMMER';
  }

  public static selectEcosystem(
    locationCountry: string,
    condition: WeatherCondition,
    time: TimeOfDay,
    season: Season
  ): WildlifeEcosystem {
    // If snow condition is present
    if (condition === 'SNOW') {
      return 'SNOW_POLAR';
    }

    // If near coast or explicitly requested coastal
    if (locationCountry.toLowerCase().includes('island') || condition === 'MIST_FOG') {
      return 'OCEAN_COASTAL';
    }

    // Default for Indian academic context: Rich Indian Wildlife Forest
    if (locationCountry.toLowerCase().includes('india')) {
      if (time === 'AFTERNOON' || time === 'GOLDEN_HOUR') {
        return 'BOTANICAL_GARDEN';
      }
      return 'INDIAN_FOREST';
    }

    return 'INDIAN_FOREST';
  }

  public static getScienceConcept(
    condition: WeatherCondition,
    time: TimeOfDay,
    windSpeed: number
  ): ScienceVisualizationConcept {
    // 1. Rainy / Monsoon -> The Water Cycle (Earth Science & Physics)
    if (condition === 'RAIN' || condition === 'DRIZZLE' || condition === 'HEAVY_RAIN' || condition === 'THUNDERSTORM') {
      return {
        topic: 'WATER_CYCLE',
        title: 'The Hydrological Water Cycle',
        subject: 'Earth Science',
        conceptExplanation:
          'Solar heat causes surface water to evaporate into vapor, cooling and condensing into liquid cloud droplets before falling as life-giving precipitation.',
        formulaOrSummary: 'Evaporation → Condensation → Precipitation → Ground Transpiration',
        interactiveNote: 'Raindrops falling at an angle calculated from live wind vector.',
      };
    }

    // 2. High Wind -> Fluid Aerodynamics (Physics)
    if (windSpeed > 18) {
      return {
        topic: 'FLUID_AERODYNAMICS',
        title: 'Bernoulli Lift & Fluid Aerodynamics',
        subject: 'Physics',
        conceptExplanation:
          'Air traveling over the cambered upper surface of leaves and wings moves faster, creating a low-pressure zone that produces aerodynamic lift.',
        formulaOrSummary: 'P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂',
        interactiveNote: 'Wind velocity curves influence tree swaying and bird flight paths.',
      };
    }

    // 3. Golden Hour / Sunset -> Rayleigh Atmospheric Scattering (Physics)
    if (time === 'GOLDEN_HOUR' || time === 'SUNSET' || time === 'DAWN') {
      return {
        topic: 'RAYLEIGH_SCATTERING',
        title: 'Rayleigh Atmospheric Scattering',
        subject: 'Physics',
        conceptExplanation:
          'Shorter blue wavelengths scatter strongly in the atmosphere (∝ 1/λ⁴), leaving longer amber, crimson, and gold wavelengths to illuminate the horizon.',
        formulaOrSummary: 'I(λ) ∝ 1 / λ⁴ (Wavelength-dependent scattering)',
        interactiveNote: 'Atmospheric light warm shifting matching local solar elevation.',
      };
    }

    // 4. Night -> Celestial Mechanics & Astronomy
    if (time === 'NIGHT' || time === 'TWILIGHT') {
      return {
        topic: 'CELESTIAL_ASTRONOMY',
        title: 'Stellar Constellations & Lunar Mechanics',
        subject: 'Astronomy',
        conceptExplanation:
          'The visible night sky displays ancient celestial constellations alongside the illuminated phases of our Moon orbiting Earth every 29.53 days.',
        formulaOrSummary: 'Synodic Lunar Cycle = 29.5306 Days • Axial Tilt = 23.44°',
        interactiveNote: 'Live lunar phase and stellar constellations shimmering overhead.',
      };
    }

    // 5. Daylight / Sunshine -> Photosynthesis & Chloroplasts (Biology)
    return {
      topic: 'PHOTOSYNTHESIS',
      title: 'Solar Photons & Chloroplast Photosynthesis',
      subject: 'Biology',
      conceptExplanation:
        'Chlorophyll molecules in green plant leaves capture solar photons to synthesize biochemical glucose from carbon dioxide and water, releasing oxygen.',
      formulaOrSummary: '6 CO₂ + 6 H₂O + Photons → C₆H₁₂O₆ + 6 O₂',
      interactiveNote: 'Subtle photon energy rays absorbed by swaying vegetation.',
    };
  }
}
