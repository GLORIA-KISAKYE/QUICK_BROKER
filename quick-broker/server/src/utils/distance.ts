// KIU coordinates (approximate)
const KIU_LAT = -0.5587;
const KIU_LNG = 30.1442;

// OSRM public demo server (self-host for production)
const OSRM_URL = process.env.OSRM_URL || 'https://router.project-osrm.org';

/**
 * Get road distance from KIU to a location using OSRM
 * Returns distance in km, or null if OSRM is unavailable
 */
export async function getRoadDistanceFromKiu(lat: number, lng: number): Promise<number | null> {
  try {
    // OSRM expects coordinates in lng,lat order
  const url = `${OSRM_URL}/route/v1/driving/${KIU_LNG},${KIU_LAT};${lng},${lat}?overview=false`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // Distance is in meters, convert to km
      const distanceKm = data.routes[0].distance / 1000;
      return Math.round(distanceKm * 100) / 100;
    }

    return null;
  } catch (error) {
    console.error('OSRM distance calculation failed:', error);
    return null;
  }
}

/**
 * Get road distance and duration between two points using OSRM
 */
export async function getRouteInfo(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<{ distanceKm: number; durationMin: number } | null> {
  try {
    const url = `${OSRM_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return {
        distanceKm: Math.round((data.routes[0].distance / 1000) * 100) / 100,
        durationMin: Math.round(data.routes[0].duration / 60)
      };
    }

    return null;
  } catch (error) {
    console.error('OSRM route calculation failed:', error);
    return null;
  }
}

// Keep for backward compatibility (returns straight-line distance as fallback)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
