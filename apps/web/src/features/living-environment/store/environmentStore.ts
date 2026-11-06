import { create } from 'zustand';
import {
  EnvironmentState,
  LocationData,
  TimeOfDay,
  WeatherCondition,
  WildlifeEcosystem,
} from '../types/environment';
import { LocationDetectionService } from '../services/LocationService';
import { WeatherService } from '../services/WeatherService';
import { SolarTimeService } from '../services/SolarTimeService';
import { SeasonService } from '../services/SeasonService';

interface EnvironmentStore extends EnvironmentState {
  isInitialized: boolean;
  isLoading: boolean;
  isDevStudioOpen: boolean;
  isScienceDrawerOpen: boolean;

  // Actions
  initEnvironment: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  setDeveloperOverride: (overrides: {
    city?: string;
    timeOfDay?: TimeOfDay;
    condition?: WeatherCondition;
    temperature?: number;
    windSpeed?: number;
    ecosystem?: WildlifeEcosystem;
  }) => void;
  resetToLive: () => Promise<void>;
  toggleDevStudio: () => void;
  toggleScienceDrawer: () => void;
  setPaused: (paused: boolean) => void;
}

const DEFAULT_LOCATION: LocationData = {
  city: 'Bengaluru',
  region: 'Karnataka',
  country: 'India',
  latitude: 12.9716,
  longitude: 77.5946,
  isApproximate: true,
  detectedVia: 'FALLBACK',
};

const initialDate = new Date();
const initialTime = SolarTimeService.getTimeOfDay(initialDate);
const initialSeason = SeasonService.getSeason(initialDate, DEFAULT_LOCATION.latitude);
const initialSolar = SolarTimeService.calculateSolarPosition(initialDate, DEFAULT_LOCATION.latitude);
const initialWeather = {
  temperature: 24,
  apparentTemperature: 24,
  condition: 'CLEAR' as WeatherCondition,
  conditionText: 'Morning Sunshine',
  cloudCover: 15,
  precipitation: 0,
  windSpeed: 10,
  windDirection: 180,
  humidity: 60,
  sunrise: '06:15',
  sunset: '18:15',
  isLive: false,
  lastFetched: Date.now(),
};
const initialPalette = SolarTimeService.getSkyPalette(initialTime, initialWeather.condition);
const initialEcosystem = SeasonService.selectEcosystem(
  DEFAULT_LOCATION.country,
  initialWeather.condition,
  initialTime,
  initialSeason
);
const initialScience = SeasonService.getScienceConcept(
  initialWeather.condition,
  initialTime,
  initialWeather.windSpeed
);

export const useEnvironmentStore = create<EnvironmentStore>((set, get) => ({
  location: DEFAULT_LOCATION,
  timeOfDay: initialTime,
  localTimeFormatted: initialDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  weather: initialWeather,
  season: initialSeason,
  solar: initialSolar,
  palette: initialPalette,
  ecosystem: initialEcosystem,
  activeScienceConcept: initialScience,
  isDeveloperOverride: false,
  reducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isPaused: false,
  isInitialized: false,
  isLoading: false,
  isDevStudioOpen: false,
  isScienceDrawerOpen: false,

  initEnvironment: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    // Listen to tab visibility & reduced motion
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        set({ isPaused: document.hidden });
      });
    }

    if (typeof window !== 'undefined') {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      motionQuery.addEventListener('change', (e) => {
        set({ reducedMotion: e.matches });
      });
    }

    // 1. Detect Real Location
    const location = await LocationDetectionService.detectLocation();

    // 2. Fetch Live Weather for Coordinates
    const weather = await WeatherService.fetchWeather(location.latitude, location.longitude);

    // 3. Compute Time, Solar, Season & Palette
    const now = new Date();
    const timeOfDay = SolarTimeService.getTimeOfDay(now);
    const solar = SolarTimeService.calculateSolarPosition(now, location.latitude);
    const season = SeasonService.getSeason(now, location.latitude);
    const palette = SolarTimeService.getSkyPalette(timeOfDay, weather.condition);
    const ecosystem = SeasonService.selectEcosystem(location.country, weather.condition, timeOfDay, season);
    const science = SeasonService.getScienceConcept(weather.condition, timeOfDay, weather.windSpeed);

    set({
      location,
      weather,
      timeOfDay,
      solar,
      season,
      palette,
      ecosystem,
      activeScienceConcept: science,
      localTimeFormatted: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isInitialized: true,
      isLoading: false,
    });

    // 4. Timer tick every 30 seconds for clock & solar elevation
    setInterval(() => {
      const state = get();
      if (state.isDeveloperOverride) return;

      const current = new Date();
      const newTimeOfDay = SolarTimeService.getTimeOfDay(current);
      const newSolar = SolarTimeService.calculateSolarPosition(current, state.location.latitude);
      const newPalette = SolarTimeService.getSkyPalette(newTimeOfDay, state.weather.condition);
      const newScience = SeasonService.getScienceConcept(
        state.weather.condition,
        newTimeOfDay,
        state.weather.windSpeed
      );

      set({
        timeOfDay: newTimeOfDay,
        solar: newSolar,
        palette: newPalette,
        activeScienceConcept: newScience,
        localTimeFormatted: current.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });
    }, 30000);
  },

  refreshWeather: async () => {
    const state = get();
    const weather = await WeatherService.fetchWeather(state.location.latitude, state.location.longitude);
    const now = new Date();
    const palette = SolarTimeService.getSkyPalette(state.timeOfDay, weather.condition);
    const science = SeasonService.getScienceConcept(weather.condition, state.timeOfDay, weather.windSpeed);

    set({
      weather,
      palette,
      activeScienceConcept: science,
    });
  },

  setDeveloperOverride: (overrides) => {
    const state = get();
    const now = new Date();

    const newTime = overrides.timeOfDay ?? state.timeOfDay;
    const newCond = overrides.condition ?? state.weather.condition;
    const newCity = overrides.city ?? state.location.city;
    const newTemp = overrides.temperature ?? state.weather.temperature;
    const newWind = overrides.windSpeed ?? state.weather.windSpeed;
    const newEcosystem = overrides.ecosystem ?? state.ecosystem;

    const newPalette = SolarTimeService.getSkyPalette(newTime, newCond);
    const newScience = SeasonService.getScienceConcept(newCond, newTime, newWind);

    set({
      isDeveloperOverride: true,
      timeOfDay: newTime,
      ecosystem: newEcosystem,
      location: {
        ...state.location,
        city: newCity,
        detectedVia: 'DEVELOPER_OVERRIDE',
      },
      weather: {
        ...state.weather,
        temperature: newTemp,
        apparentTemperature: newTemp,
        condition: newCond,
        conditionText: WeatherService.mapWmoCodeToCondition(newCond === 'RAIN' ? 61 : newCond === 'SNOW' ? 71 : 0).text,
        windSpeed: newWind,
        isLive: false,
      },
      palette: newPalette,
      activeScienceConcept: newScience,
    });
  },

  resetToLive: async () => {
    set({ isDeveloperOverride: false, isLoading: true });
    const location = await LocationDetectionService.detectLocation();
    const weather = await WeatherService.fetchWeather(location.latitude, location.longitude);
    const now = new Date();
    const timeOfDay = SolarTimeService.getTimeOfDay(now);
    const solar = SolarTimeService.calculateSolarPosition(now, location.latitude);
    const season = SeasonService.getSeason(now, location.latitude);
    const palette = SolarTimeService.getSkyPalette(timeOfDay, weather.condition);
    const ecosystem = SeasonService.selectEcosystem(location.country, weather.condition, timeOfDay, season);
    const science = SeasonService.getScienceConcept(weather.condition, timeOfDay, weather.windSpeed);

    set({
      location,
      weather,
      timeOfDay,
      solar,
      season,
      palette,
      ecosystem,
      activeScienceConcept: science,
      localTimeFormatted: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isLoading: false,
    });
  },

  toggleDevStudio: () => set((s) => ({ isDevStudioOpen: !s.isDevStudioOpen })),
  toggleScienceDrawer: () => set((s) => ({ isScienceDrawerOpen: !s.isScienceDrawerOpen })),
  setPaused: (paused: boolean) => set({ isPaused: paused }),
}));
