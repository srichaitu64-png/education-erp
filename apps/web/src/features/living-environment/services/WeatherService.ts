import { WeatherCondition, WeatherData } from '../types/environment';

export class WeatherService {
  private static CACHE_PREFIX = 'akshara_weather_v2_';
  private static CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

  public static async fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `${this.CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;

    // 1. Check local cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.lastFetched < this.CACHE_TTL_MS) {
          return parsed;
        }
      }
    } catch {}

    // 2. Query Open-Meteo API
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=auto`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

      if (response.ok) {
        const data = await response.json();
        const current = data.current;
        const daily = data.daily;

        const wmoCode = current?.weather_code ?? 0;
        const conditionInfo = this.mapWmoCodeToCondition(wmoCode);

        const weatherResult: WeatherData = {
          temperature: Math.round(current?.temperature_2m ?? 24),
          apparentTemperature: Math.round(current?.apparent_temperature ?? 24),
          condition: conditionInfo.condition,
          conditionText: conditionInfo.text,
          cloudCover: current?.cloud_cover ?? 15,
          precipitation: current?.precipitation ?? 0,
          windSpeed: Math.round(current?.wind_speed_10m ?? 8),
          windDirection: current?.wind_direction_10m ?? 180,
          humidity: current?.relative_humidity_2m ?? 60,
          sunrise: daily?.sunrise?.[0] || '06:15',
          sunset: daily?.sunset?.[0] || '18:15',
          isLive: true,
          lastFetched: Date.now(),
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify(weatherResult));
        } catch {}

        return weatherResult;
      }
    } catch (err) {
      console.warn('Weather fetch from Open-Meteo encountered an issue; using seasonal fallback:', err);
    }

    // 3. Fallback: Intelligent seasonal defaults
    return this.getSeasonalFallbackWeather();
  }

  public static mapWmoCodeToCondition(code: number): { condition: WeatherCondition; text: string } {
    switch (code) {
      case 0:
        return { condition: 'CLEAR', text: 'Clear Sky' };
      case 1:
        return { condition: 'CLEAR', text: 'Mainly Clear' };
      case 2:
        return { condition: 'PARTLY_CLOUDY', text: 'Partly Cloudy' };
      case 3:
        return { condition: 'OVERCAST', text: 'Overcast Sky' };
      case 45:
      case 48:
        return { condition: 'MIST_FOG', text: 'Morning Mist & Fog' };
      case 51:
      case 53:
      case 55:
        return { condition: 'DRIZZLE', text: 'Light Drizzle' };
      case 61:
      case 63:
      case 65:
        return { condition: 'RAIN', text: 'Gentle Rain' };
      case 66:
      case 67:
        return { condition: 'RAIN', text: 'Freezing Rain' };
      case 71:
      case 73:
      case 75:
      case 77:
        return { condition: 'SNOW', text: 'Falling Snow' };
      case 80:
      case 81:
      case 82:
        return { condition: 'HEAVY_RAIN', text: 'Monsoon Showers' };
      case 85:
      case 86:
        return { condition: 'SNOW', text: 'Snow Showers' };
      case 95:
      case 96:
      case 99:
        return { condition: 'THUNDERSTORM', text: 'Thunderstorm' };
      default:
        return { condition: 'CLEAR', text: 'Pleasant & Fair' };
    }
  }

  private static getSeasonalFallbackWeather(): WeatherData {
    const month = new Date().getMonth(); // 0 to 11
    let temp = 25;
    let cond: WeatherCondition = 'CLEAR';
    let text = 'Sunny & Fair';
    let rain = 0;
    let clouds = 20;

    // Indian seasonal fallback
    if (month >= 5 && month <= 8) {
      // Monsoon (June - September)
      temp = 23;
      cond = 'RAIN';
      text = 'Monsoon Rain';
      rain = 4.2;
      clouds = 80;
    } else if (month >= 2 && month <= 4) {
      // Summer (March - May)
      temp = 31;
      cond = 'CLEAR';
      text = 'Warm & Sunny';
      clouds = 10;
    } else if (month === 11 || month === 0) {
      // Winter (December - January)
      temp = 19;
      cond = 'PARTLY_CLOUDY';
      text = 'Cool Morning Mist';
      clouds = 30;
    }

    return {
      temperature: temp,
      apparentTemperature: temp,
      condition: cond,
      conditionText: text,
      cloudCover: clouds,
      precipitation: rain,
      windSpeed: 10,
      windDirection: 210,
      humidity: cond === 'RAIN' ? 85 : 55,
      sunrise: '06:15',
      sunset: '18:20',
      isLive: false,
      lastFetched: Date.now(),
    };
  }
}
