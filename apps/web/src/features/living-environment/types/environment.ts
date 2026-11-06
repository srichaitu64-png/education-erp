export type TimeOfDay =
  | 'DAWN'
  | 'MORNING'
  | 'MIDDAY'
  | 'AFTERNOON'
  | 'GOLDEN_HOUR'
  | 'SUNSET'
  | 'TWILIGHT'
  | 'NIGHT';

export type WeatherCondition =
  | 'CLEAR'
  | 'PARTLY_CLOUDY'
  | 'OVERCAST'
  | 'MIST_FOG'
  | 'DRIZZLE'
  | 'RAIN'
  | 'HEAVY_RAIN'
  | 'THUNDERSTORM'
  | 'SNOW';

export type Season =
  | 'SUMMER'
  | 'MONSOON'
  | 'POST_MONSOON'
  | 'WINTER'
  | 'SPRING';

export type WildlifeEcosystem =
  | 'INDIAN_FOREST'
  | 'OCEAN_COASTAL'
  | 'SNOW_POLAR'
  | 'BOTANICAL_GARDEN'
  | 'SAVANNA_GRASSLAND';

export type ScienceTopic =
  | 'PHOTOSYNTHESIS'
  | 'WATER_CYCLE'
  | 'RAYLEIGH_SCATTERING'
  | 'CELESTIAL_ASTRONOMY'
  | 'FLUID_AERODYNAMICS'
  | 'KINETIC_THERMAL';

export interface LocationData {
  city: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  isApproximate?: boolean;
  detectedVia: 'GEOLOCATION' | 'IP' | 'FALLBACK' | 'DEVELOPER_OVERRIDE';
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  condition: WeatherCondition;
  conditionText: string;
  cloudCover: number; // 0 - 100%
  precipitation: number; // mm
  windSpeed: number; // km/h
  windDirection: number; // degrees
  humidity: number; // %
  sunrise: string; // ISO or HH:MM
  sunset: string; // ISO or HH:MM
  isLive: boolean;
  lastFetched: number; // timestamp
}

export interface SolarPosition {
  elevation: number; // degrees (-90 to +90)
  azimuth: number; // degrees
  sunX: number; // 0 to 1 normalized
  sunY: number; // 0 to 1 normalized
  moonPhase: number; // 0 to 1 (0 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Last Quarter)
  moonPhaseName: string;
}

export interface AmbientSkyPalette {
  skyTop: string;
  skyMiddle: string;
  skyBottom: string;
  hazeColor: string;
  sunGlow: string;
  cloudTint: string;
  ambientLightLevel: number; // 0 (midnight) to 1 (bright noon)
}

export interface ScienceVisualizationConcept {
  topic: ScienceTopic;
  title: string;
  subject: 'Biology' | 'Physics' | 'Chemistry' | 'Earth Science' | 'Astronomy';
  conceptExplanation: string;
  formulaOrSummary: string;
  interactiveNote: string;
}

export interface EnvironmentState {
  location: LocationData;
  timeOfDay: TimeOfDay;
  localTimeFormatted: string;
  weather: WeatherData;
  season: Season;
  solar: SolarPosition;
  palette: AmbientSkyPalette;
  ecosystem: WildlifeEcosystem;
  activeScienceConcept: ScienceVisualizationConcept;
  isDeveloperOverride: boolean;
  reducedMotion: boolean;
  isPaused: boolean;
}
