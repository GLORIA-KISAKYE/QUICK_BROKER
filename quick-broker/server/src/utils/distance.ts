// KIU coordinates (approximate)
const KIU_LAT = -0.5587;
const KIU_LNG = 30.1442;

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
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

export function distanceFromKiu(lat: number, lng: number): number {
  return Math.round(calculateDistance(KIU_LAT, KIU_LNG, lat, lng) * 100) / 100;
}

export function bodaTime(distanceKm: number): number {
  // Average boda speed in Ishaka: ~20 km/h in town
  return Math.round((distanceKm / 20) * 60);
}

export function walkTime(distanceKm: number): number {
  // Average walking speed: ~5 km/h
  return Math.round((distanceKm / 5) * 60);
}
