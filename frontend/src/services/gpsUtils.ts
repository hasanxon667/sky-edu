// Haversine formula for calculating distance between 2 coordinates in meters
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface SpoofCheckResult {
  isSuspicious: boolean;
  reason?: string;
}

export function detectLocationSpoofing(position: GeolocationPosition): SpoofCheckResult {
  const { accuracy } = position.coords;

  // 1. Unusually low or zero accuracy can be a red flag for mock location apps
  if (accuracy === 0) {
    return {
      isSuspicious: true,
      reason: 'Fake GPS shakllantirgich aniqlandi (Aniqlik kiritilmagan/0m).'
    };
  }

  // 2. Unusually poor accuracy (e.g., > 200m) is unreliable for radius verification
  if (accuracy > 200) {
    return {
      isSuspicious: true,
      reason: `GPS signali juda zaif (Aniqlik: ${Math.round(accuracy)}m). Ochiq joyga chiqing.`
    };
  }

  return { isSuspicious: false };
}

// Calculate lateness in minutes based on work start time (09:00)
export function calculateLateness(checkInDate: Date = new Date()): { status: 'ON_TIME' | 'LATE'; minutesLate: number } {
  const workStartHour = 9;
  const workStartMinute = 0;
  const graceMinutes = 5; // 5 minute grace period (e.g., 09:03 is ON_TIME)

  const currentHour = checkInDate.getHours();
  const currentMinute = checkInDate.getMinutes();

  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const startTotalMinutes = workStartHour * 60 + workStartMinute;

  const diffMinutes = currentTotalMinutes - startTotalMinutes;

  if (diffMinutes <= graceMinutes) {
    return {
      status: 'ON_TIME',
      minutesLate: 0
    };
  } else {
    return {
      status: 'LATE',
      minutesLate: diffMinutes
    };
  }
}
