import { LocationData } from '../types/environment';

const DEFAULT_FALLBACK_LOCATION: LocationData = {
  city: 'Bengaluru',
  region: 'Karnataka',
  country: 'India',
  latitude: 12.9716,
  longitude: 77.5946,
  isApproximate: true,
  detectedVia: 'FALLBACK',
};

const KNOWN_INDIAN_CITIES = [
  { city: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  { city: 'Mysuru', region: 'Karnataka', country: 'India', lat: 12.2958, lon: 76.6394 },
  { city: 'Mangaluru', region: 'Karnataka', country: 'India', lat: 12.9141, lon: 74.8560 },
  { city: 'Hubballi', region: 'Karnataka', country: 'India', lat: 15.3647, lon: 75.1240 },
  { city: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 },
  { city: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
  { city: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { city: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
  { city: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867 },
  { city: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  { city: 'London', region: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { city: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { city: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { city: 'Sydney', region: 'NSW', country: 'Australia', lat: -33.8688, lon: 151.2093 },
];

function getNearestCityName(lat: number, lon: number): { city: string; region: string; country: string } {
  let closest = KNOWN_INDIAN_CITIES[0];
  let minDistance = Infinity;

  for (const c of KNOWN_INDIAN_CITIES) {
    const dLat = lat - c.lat;
    const dLon = lon - c.lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  return { city: closest.city, region: closest.region, country: closest.country };
}

export class LocationDetectionService {
  private static CACHE_KEY = 'akshara_env_location_v2';

  public static async detectLocation(): Promise<LocationData> {
    // 1. Check cached location
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.latitude && parsed.longitude) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }

    // 2. Attempt Browser Geolocation
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 4500,
            maximumAge: 1000 * 60 * 60, // 1 hour
          });
        });

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const nearest = getNearestCityName(lat, lon);

        // Try reverse geocoding via Open-Meteo or client API
        let cityName = nearest.city;
        let regionName = nearest.region;
        let countryName = nearest.country;

        try {
          const revRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData.city || revData.locality) {
              cityName = revData.city || revData.locality;
              regionName = revData.principalSubdivision || regionName;
              countryName = revData.countryName || countryName;
            }
          }
        } catch {
          // Fall back to nearest known city
        }

        const result: LocationData = {
          city: cityName,
          region: regionName,
          country: countryName,
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lon.toFixed(4)),
          isApproximate: false,
          detectedVia: 'GEOLOCATION',
        };

        try {
          sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(result));
        } catch {}

        return result;
      } catch {
        // Geolocation denied or timed out; proceed to IP fallback
      }
    }

    // 3. Fallback: IP-based lookup
    try {
      const ipRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          const result: LocationData = {
            city: ipData.city || 'Bengaluru',
            region: ipData.region || 'Karnataka',
            country: ipData.country_name || 'India',
            latitude: Number(ipData.latitude),
            longitude: Number(ipData.longitude),
            isApproximate: true,
            detectedVia: 'IP',
          };
          try {
            sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(result));
          } catch {}
          return result;
        }
      }
    } catch {
      // IP lookup failed
    }

    // 4. Ultimate graceful default
    return DEFAULT_FALLBACK_LOCATION;
  }
}
