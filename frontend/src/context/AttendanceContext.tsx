import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AttendanceRecord, LocationSetting, TelegramConfig, PushNotificationSetting } from '../types';
import {
  INITIAL_ATTENDANCE,
  INITIAL_LOCATION,
  INITIAL_TELEGRAM,
  INITIAL_PUSH_NOTIFICATIONS
} from '../services/mockData';
import { calculateDistanceMeters, detectLocationSpoofing, calculateLateness } from '../services/gpsUtils';
import confetti from 'canvas-confetti';

interface AttendanceContextType {
  records: AttendanceRecord[];
  location: LocationSetting;
  telegramConfig: TelegramConfig;
  pushSettings: PushNotificationSetting;
  isOffline: boolean;
  pendingOfflineCount: number;
  updateLocation: (loc: LocationSetting) => void;
  updateTelegramConfig: (cfg: TelegramConfig) => void;
  updatePushSettings: (cfg: PushNotificationSetting) => void;
  checkIn: (
    userId: string,
    userName: string,
    userPosition: string,
    userAvatar?: string,
    customCoords?: { lat: number; lng: number },
    workStartTime?: string
  ) => Promise<{ success: boolean; message: string; record?: AttendanceRecord }>;
  checkOut: (
    userId: string,
    customCoords?: { lat: number; lng: number }
  ) => Promise<{ success: boolean; message: string }>;
  sendTelegramTest: (message: string, overrideConfig?: TelegramConfig) => Promise<{ success: boolean; message: string } | boolean>;
  todayRecord: (userId: string) => AttendanceRecord | undefined;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('sky_edu_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [location, setLocation] = useState<LocationSetting>(() => {
    const saved = localStorage.getItem('sky_edu_location');
    return saved ? JSON.parse(saved) : INITIAL_LOCATION;
  });

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('sky_edu_telegram');
    return saved ? JSON.parse(saved) : INITIAL_TELEGRAM;
  });

  const [pushSettings, setPushSettings] = useState<PushNotificationSetting>(() => {
    const saved = localStorage.getItem('sky_edu_push');
    return saved ? JSON.parse(saved) : INITIAL_PUSH_NOTIFICATIONS;
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingOfflineCount, setPendingOfflineCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sky_edu_attendance', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('sky_edu_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('sky_edu_telegram', JSON.stringify(telegramConfig));
  }, [telegramConfig]);

  useEffect(() => {
    localStorage.setItem('sky_edu_push', JSON.stringify(pushSettings));
  }, [pushSettings]);

  const updateLocation = (loc: LocationSetting) => setLocation(loc);
  const updateTelegramConfig = (cfg: TelegramConfig) => setTelegramConfig(cfg);
  const updatePushSettings = (cfg: PushNotificationSetting) => setPushSettings(cfg);

  const todayRecord = (userId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return records.find((r) => r.userId === userId && r.date === todayStr);
  };

  const sendTelegramNotification = async (text: string) => {
    if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) return;
    try {
      const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } catch (e) {
      console.warn('Telegram notification offline log:', text, e);
    }
  };

  const sendTelegramTest = async (customMsg: string, overrideConfig?: TelegramConfig) => {
    const cfg = overrideConfig || telegramConfig;
    if (!cfg.botToken || !cfg.chatId) {
      return { success: false, message: "⚠️ Bot Token va Chat ID kiritilishi shart!" };
    }
    try {
      const url = `https://api.telegram.org/bot${cfg.botToken.trim()}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cfg.chatId.trim(),
          text: `📱 <b>Skyline Education Telegram Bot Test</b>\n\n${customMsg}\n\n⏰ Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}`,
          parse_mode: 'HTML'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        return { success: true, message: "✅ Test xabari Telegram guruhiga muvaffaqiyatli yuborildi!" };
      } else {
        const desc = data.description || "Bot token yoki Chat ID noto'g'ri";
        return { success: false, message: `⚠️ Telegram API Xatosi: ${desc}` };
      }
    } catch (e: any) {
      return { success: false, message: `⚠️ Ulanish xatosi: ${e.message || 'Tarmoq xatosi'}` };
    }
  };

  const checkIn = async (
    userId: string,
    userName: string,
    userPosition: string,
    userAvatar?: string,
    customCoords?: { lat: number; lng: number },
    workStartTime?: string
  ): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> => {
    return new Promise((resolve) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const existing = todayRecord(userId);

      if (existing && existing.checkInTime) {
        return resolve({
          success: false,
          message: `Siz bugun allaqachon soat ${existing.checkInTime} da ishga kelgansiz!`
        });
      }

      const processCheckIn = (lat: number, lng: number, accuracy: number = 10) => {
        const spoofCheck = detectLocationSpoofing({ coords: { accuracy } } as any);
        if (spoofCheck.isSuspicious) {
          return resolve({
            success: false,
            message: `⚠️ Xatolik: ${spoofCheck.reason}`
          });
        }

        const distance = calculateDistanceMeters(lat, lng, location.latitude, location.longitude);

        if (distance > location.radiusMeters) {
          return resolve({
            success: false,
            message: `❌ Siz markaz hududida emassiz! Hozirgi masofangiz: ${distance} metr. (Maksimal ruxsat: ${location.radiusMeters} metr)`
          });
        }

        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const { status, minutesLate } = calculateLateness(now, workStartTime || '09:00');

        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          userId,
          userName,
          userPosition,
          userAvatar,
          date: todayStr,
          checkInTime: timeStr,
          status,
          minutesLate,
          checkInLat: lat,
          checkInLng: lng,
          distanceMeters: distance,
          isOfflineSync: isOffline
        };

        setRecords((prev) => [newRecord, ...prev]);

        if (isOffline) {
          setPendingOfflineCount((p) => p + 1);
        }

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });

        let tgMsg = '';
        if (status === 'LATE') {
          tgMsg = `⚠️ <b>${userName}</b> (${userPosition}) ${minutesLate} daqiqa kechikdi!\n⏰ Kelgan vaqti: ${timeStr.slice(0, 5)}`;
        } else {
          tgMsg = `✅ <b>${userName}</b> (${userPosition}) ishga keldi.\n⏰ Vaqti: ${timeStr.slice(0, 5)}`;
        }
        sendTelegramNotification(tgMsg);

        resolve({
          success: true,
          message: status === 'LATE'
            ? `✅ Ishga kelganingiz qayd etildi! (${minutesLate} daqiqa kechikish yozildi)`
            : `🎉 Rahmat! Ishga o'z vaqtida kelganingiz qabul qilindi.`,
          record: newRecord
        });
      };

      if (customCoords) {
        processCheckIn(customCoords.lat, customCoords.lng, 5);
      } else if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => processCheckIn(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
          () => processCheckIn(location.latitude, location.longitude, 10),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        processCheckIn(location.latitude, location.longitude, 10);
      }
    });
  };

  const checkOut = async (
    userId: string,
    customCoords?: { lat: number; lng: number }
  ): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const existing = records.find((r) => r.userId === userId && r.date === todayStr);

      if (!existing || !existing.checkInTime) {
        return resolve({
          success: false,
          message: '❌ Siz hali bugun ishga kelish tugmasini bosmagansiz!'
        });
      }

      if (existing.checkOutTime) {
        return resolve({
          success: false,
          message: `Siz bugun allaqachon soat ${existing.checkOutTime} da ishdan ketgansiz.`
        });
      }

      const processCheckOut = (lat: number, lng: number) => {
        const distance = calculateDistanceMeters(lat, lng, location.latitude, location.longitude);

        if (distance > location.radiusMeters) {
          return resolve({
            success: false,
            message: `❌ Ishdan ketishni tasdiqlash uchun markaz hududida (${location.radiusMeters}m ichida) bo'lishingiz kerak. Masofangiz: ${distance}m`
          });
        }

        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        const [inH, inM] = existing.checkInTime!.split(':').map(Number);
        const inTotalMins = inH * 60 + inM;
        const outTotalMins = now.getHours() * 60 + now.getMinutes();
        const hoursWorked = Number(((outTotalMins - inTotalMins) / 60).toFixed(1));

        setRecords((prev) =>
          prev.map((r) =>
            r.id === existing.id
              ? {
                  ...r,
                  checkOutTime: timeStr,
                  checkOutLat: lat,
                  checkOutLng: lng,
                  workHours: hoursWorked > 0 ? hoursWorked : 8.0
                }
              : r
          )
        );

        const tgMsg = `🚪 <b>${existing.userName}</b> ishdan ketdi.\n⏰ Vaqti: ${timeStr.slice(0, 5)} (Ishlagan vaqti: ${hoursWorked > 0 ? hoursWorked : 8.0} soat)`;
        sendTelegramNotification(tgMsg);

        resolve({
          success: true,
          message: `🚪 Yaxshi hordiq chiqaring! Ishdan ketganingiz qayd etildi.`
        });
      };

      if (customCoords) {
        processCheckOut(customCoords.lat, customCoords.lng);
      } else if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => processCheckOut(pos.coords.latitude, pos.coords.longitude),
          () => processCheckOut(location.latitude, location.longitude),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        processCheckOut(location.latitude, location.longitude);
      }
    });
  };

  return (
    <AttendanceContext.Provider
      value={{
        records,
        location,
        telegramConfig,
        pushSettings,
        isOffline,
        pendingOfflineCount,
        updateLocation,
        updateTelegramConfig,
        updatePushSettings,
        checkIn,
        checkOut,
        sendTelegramTest,
        todayRecord
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
};
