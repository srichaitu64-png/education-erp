import {
  AmbientSkyPalette,
  SolarPosition,
  TimeOfDay,
  WeatherCondition,
} from '../types/environment';

export class SolarTimeService {
  /**
   * Determine the current time of day bucket from a Date object
   */
  public static getTimeOfDay(date: Date = new Date()): TimeOfDay {
    const hours = date.getHours() + date.getMinutes() / 60;

    if (hours >= 5.0 && hours < 6.5) return 'DAWN';
    if (hours >= 6.5 && hours < 11.5) return 'MORNING';
    if (hours >= 11.5 && hours < 15.5) return 'MIDDAY';
    if (hours >= 15.5 && hours < 17.5) return 'AFTERNOON';
    if (hours >= 17.5 && hours < 18.5) return 'GOLDEN_HOUR';
    if (hours >= 18.5 && hours < 19.25) return 'SUNSET';
    if (hours >= 19.25 && hours < 20.0) return 'TWILIGHT';
    return 'NIGHT';
  }

  /**
   * Compute normalized sun & moon coordinates and lunar phase
   */
  public static calculateSolarPosition(date: Date = new Date(), lat: number = 12.97): SolarPosition {
    const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

    // Approximate Sun trajectory arc (0 = dawn horizon, 0.5 = midday zenith, 1 = sunset horizon)
    let sunX = 0.5;
    let sunY = 0.5;
    let elevation = 0;

    if (hours >= 5.5 && hours <= 19.0) {
      // Daytime arc
      const dayProgress = (hours - 5.5) / 13.5; // 0 to 1
      sunX = 0.1 + dayProgress * 0.8; // traverses from left (10%) to right (90%)
      // Parabolic elevation: reaches peak height at midday
      const normalizedElevation = Math.sin(dayProgress * Math.PI);
      sunY = 0.85 - normalizedElevation * 0.65; // from 0.85 (horizon) to 0.20 (zenith)
      elevation = normalizedElevation * 75; // up to ~75 degrees
    } else {
      // Nighttime: sun below horizon
      elevation = -45;
      sunX = 0.5;
      sunY = 1.2;
    }

    // Moon phase calculation based on synodic lunar cycle (~29.53 days)
    // Reference epoch: Jan 6, 2000 (New Moon)
    const epoch = new Date(Date.UTC(2000, 0, 6, 18, 14));
    const diffDays = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);
    const moonPhase = (diffDays % 29.53058867) / 29.53058867;

    let moonPhaseName = 'Full Moon';
    if (moonPhase < 0.03 || moonPhase > 0.97) moonPhaseName = 'New Moon';
    else if (moonPhase < 0.22) moonPhaseName = 'Waxing Crescent';
    else if (moonPhase < 0.28) moonPhaseName = 'First Quarter';
    else if (moonPhase < 0.47) moonPhaseName = 'Waxing Gibbous';
    else if (moonPhase < 0.53) moonPhaseName = 'Full Moon';
    else if (moonPhase < 0.72) moonPhaseName = 'Waning Gibbous';
    else if (moonPhase < 0.78) moonPhaseName = 'Last Quarter';
    else moonPhaseName = 'Waning Crescent';

    return {
      elevation: Number(elevation.toFixed(1)),
      azimuth: Number(((hours / 24) * 360).toFixed(1)),
      sunX: Number(sunX.toFixed(3)),
      sunY: Number(sunY.toFixed(3)),
      moonPhase: Number(moonPhase.toFixed(3)),
      moonPhaseName,
    };
  }

  /**
   * Produce rich, natural sky ambient colors matching time of day and live weather
   */
  public static getSkyPalette(time: TimeOfDay, condition: WeatherCondition): AmbientSkyPalette {
    // Base time of day palettes
    let palette: AmbientSkyPalette;

    switch (time) {
      case 'DAWN':
        palette = {
          skyTop: '#3B4E76',
          skyMiddle: '#B37D8D',
          skyBottom: '#FCD5B5',
          hazeColor: 'rgba(255, 218, 185, 0.25)',
          sunGlow: 'rgba(255, 183, 114, 0.45)',
          cloudTint: '#FFE8D6',
          ambientLightLevel: 0.45,
        };
        break;

      case 'MORNING':
        palette = {
          skyTop: '#4B92DB',
          skyMiddle: '#96C6F5',
          skyBottom: '#E8F3FE',
          hazeColor: 'rgba(255, 255, 255, 0.3)',
          sunGlow: 'rgba(255, 243, 176, 0.55)',
          cloudTint: '#FFFFFF',
          ambientLightLevel: 0.85,
        };
        break;

      case 'MIDDAY':
        palette = {
          skyTop: '#2575DC',
          skyMiddle: '#79B5F6',
          skyBottom: '#E2F0FD',
          hazeColor: 'rgba(255, 255, 255, 0.2)',
          sunGlow: 'rgba(255, 255, 210, 0.65)',
          cloudTint: '#FFFFFF',
          ambientLightLevel: 1.0,
        };
        break;

      case 'AFTERNOON':
        palette = {
          skyTop: '#2C6CB5',
          skyMiddle: '#80B2EA',
          skyBottom: '#FDEFD6',
          hazeColor: 'rgba(253, 239, 214, 0.25)',
          sunGlow: 'rgba(255, 220, 130, 0.6)',
          cloudTint: '#FFF9E6',
          ambientLightLevel: 0.9,
        };
        break;

      case 'GOLDEN_HOUR':
        palette = {
          skyTop: '#2C497F',
          skyMiddle: '#CE6C47',
          skyBottom: '#F9C265',
          hazeColor: 'rgba(249, 194, 101, 0.35)',
          sunGlow: 'rgba(255, 140, 50, 0.7)',
          cloudTint: '#FFE2B8',
          ambientLightLevel: 0.65,
        };
        break;

      case 'SUNSET':
        palette = {
          skyTop: '#1E2952',
          skyMiddle: '#8C3D6E',
          skyBottom: '#E87258',
          hazeColor: 'rgba(232, 114, 88, 0.3)',
          sunGlow: 'rgba(240, 90, 60, 0.65)',
          cloudTint: '#F3B1A2',
          ambientLightLevel: 0.4,
        };
        break;

      case 'TWILIGHT':
        palette = {
          skyTop: '#121735',
          skyMiddle: '#2A295C',
          skyBottom: '#5B4B7E',
          hazeColor: 'rgba(91, 75, 126, 0.2)',
          sunGlow: 'rgba(150, 100, 170, 0.3)',
          cloudTint: '#8F82A8',
          ambientLightLevel: 0.25,
        };
        break;

      case 'NIGHT':
      default:
        palette = {
          skyTop: '#080C1B',
          skyMiddle: '#0F182F',
          skyBottom: '#1B2745',
          hazeColor: 'rgba(27, 39, 69, 0.15)',
          sunGlow: 'rgba(200, 220, 255, 0.25)', // soft moon glow
          cloudTint: '#2A3654',
          ambientLightLevel: 0.15,
        };
        break;
    }

    // Weather adjustments (rain, storm, fog, snow)
    if (condition === 'RAIN' || condition === 'DRIZZLE' || condition === 'HEAVY_RAIN') {
      palette = {
        skyTop: '#2B394A',
        skyMiddle: '#526377',
        skyBottom: '#8A9BAE',
        hazeColor: 'rgba(138, 155, 174, 0.4)',
        sunGlow: 'rgba(180, 200, 220, 0.2)',
        cloudTint: '#64748B',
        ambientLightLevel: Math.max(0.2, palette.ambientLightLevel * 0.6),
      };
    } else if (condition === 'THUNDERSTORM') {
      palette = {
        skyTop: '#131A26',
        skyMiddle: '#222F3E',
        skyBottom: '#3B4B5E',
        hazeColor: 'rgba(59, 75, 94, 0.5)',
        sunGlow: 'rgba(160, 180, 210, 0.25)',
        cloudTint: '#334155',
        ambientLightLevel: 0.2,
      };
    } else if (condition === 'MIST_FOG') {
      palette = {
        skyTop: '#687B8E',
        skyMiddle: '#96A8B8',
        skyBottom: '#D0DBE5',
        hazeColor: 'rgba(208, 219, 229, 0.6)',
        sunGlow: 'rgba(255, 255, 255, 0.3)',
        cloudTint: '#CBD5E1',
        ambientLightLevel: 0.5,
      };
    } else if (condition === 'SNOW') {
      palette = {
        skyTop: '#5B7088',
        skyMiddle: '#8FA6BE',
        skyBottom: '#E8F0F8',
        hazeColor: 'rgba(232, 240, 248, 0.5)',
        sunGlow: 'rgba(240, 248, 255, 0.4)',
        cloudTint: '#F1F5F9',
        ambientLightLevel: 0.7,
      };
    }

    return palette;
  }
}
