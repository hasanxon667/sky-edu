import { Router, Request, Response } from 'express';

const router = Router();

const SKYLINE_CENTER = {
  latitude: 41.311081,
  longitude: 69.240562,
  radiusMeters: 100
};

// Haversine Distance Formula
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
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

// POST /api/attendance/checkin
router.post('/checkin', async (req: Request, res: Response): Promise<any> => {
  const { userId, userName, latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'GPS koordinatalari kiritilishi shart' });
  }

  const distance = getDistanceMeters(latitude, longitude, SKYLINE_CENTER.latitude, SKYLINE_CENTER.longitude);

  if (distance > SKYLINE_CENTER.radiusMeters) {
    return res.status(403).json({
      error: `Siz markaz hududida emassiz! Hozirgi masofangiz: ${distance} metr. (Maksimal ruxsat: ${SKYLINE_CENTER.radiusMeters} metr)`
    });
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let status = 'ON_TIME';
  let minutesLate = 0;

  if (currentHour > 9 || (currentHour === 9 && currentMinute > 5)) {
    status = 'LATE';
    minutesLate = (currentHour * 60 + currentMinute) - (9 * 60);
  }

  const record = {
    id: `att-${Date.now()}`,
    userId,
    userName,
    date: now.toISOString().split('T')[0],
    checkInTime: now.toTimeString().split(' ')[0],
    status,
    minutesLate,
    distanceMeters: distance
  };

  return res.json({
    message: status === 'LATE' ? `Kechikib ishga kelindi (${minutesLate} min)` : 'Vaqtida kelindi',
    record
  });
});

// POST /api/attendance/checkout
router.post('/checkout', async (req: Request, res: Response): Promise<any> => {
  const { latitude, longitude } = req.body;

  const distance = getDistanceMeters(latitude, longitude, SKYLINE_CENTER.latitude, SKYLINE_CENTER.longitude);

  if (distance > SKYLINE_CENTER.radiusMeters) {
    return res.status(403).json({
      error: `Ishdan ketishni tasdiqlash uchun markaz hududida (${SKYLINE_CENTER.radiusMeters}m ichida) bo'lishingiz kerak.`
    });
  }

  const now = new Date();
  return res.json({
    message: 'Ishdan ketganingiz muvaffaqiyatli qayd etildi.',
    checkOutTime: now.toTimeString().split(' ')[0]
  });
});

export default router;
