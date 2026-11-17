/**
 * Geofencing & Geospatial Calculation Utility for SGVS
 * Implements high-precision Haversine distance formula
 */

/**
 * Calculates the great-circle distance between two points on the Earth's surface (in meters).
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface GeofenceVerificationResult {
  isWithin: boolean;
  distance: number;
  radius: number;
  deviation: number; // positive if outside
  accuracy: number;
  status: 'VALID' | 'WARNING_ACCURACY' | 'OUT_OF_BOUNDS';
}

/**
 * Verifies whether user coordinates fall within the guard post's radial perimeter.
 * Incorporates GPS accuracy tolerance.
 */
export function verifyGeofence(
  userLat: number,
  userLng: number,
  postLat: number,
  postLng: number,
  radius: number,
  accuracy: number = 5
): GeofenceVerificationResult {
  const distance = calculateDistance(userLat, userLng, postLat, postLng);
  const deviation = Math.max(0, Math.round((distance - radius) * 10) / 10);
  
  // If GPS accuracy is too poor (> 50m), issue a warning
  let status: 'VALID' | 'WARNING_ACCURACY' | 'OUT_OF_BOUNDS' = 'VALID';
  
  if (distance <= radius) {
    status = accuracy > 60 ? 'WARNING_ACCURACY' : 'VALID';
    return {
      isWithin: true,
      distance,
      radius,
      deviation: 0,
      accuracy,
      status,
    };
  } else {
    // Check if within accuracy margin
    const isMarginal = distance <= radius + Math.min(accuracy, 15);
    return {
      isWithin: isMarginal,
      distance,
      radius,
      deviation,
      accuracy,
      status: isMarginal ? 'VALID' : 'OUT_OF_BOUNDS',
    };
  }
}
