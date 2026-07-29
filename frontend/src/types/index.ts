export type Role = 'ADMIN' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'CHECKED_OUT';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: Role;
  status: UserStatus;
  position: string;
  startDate: string;
  profileImage?: string;
  password?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userPosition: string;
  userAvatar?: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  minutesLate: number;
  workHours?: number; // calculated hours
  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
  distanceMeters?: number;
  isOfflineSync?: boolean;
}

export interface LocationSetting {
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g., 100
  addressName: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifyOnCheckIn: boolean;
  notifyOnLate: boolean;
  notifyOnCheckOut: boolean;
}

export interface DashboardStats {
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
  totalEmployees: number;
  avgCheckInTime: string;
  weeklyAttendanceRate: number;
  monthlyLateMinutes: number;
}

export interface PushNotificationSetting {
  morningReminderTime: string; // e.g. "08:50"
  eveningReminderTime: string; // e.g. "18:00"
  enabled: boolean;
}
