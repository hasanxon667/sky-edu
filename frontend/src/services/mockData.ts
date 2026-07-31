import type { User, AttendanceRecord, LocationSetting, TelegramConfig, PushNotificationSetting } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Akmal Karimov',
    phone: '+998901234567',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    position: 'Support Teacher',
    startDate: '2024-01-15',
    password: 'akmal123',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'usr-admin',
    name: 'Skyline Admin (Direktor)',
    phone: '+998903503304',
    role: 'ADMIN',
    status: 'ACTIVE',
    position: 'Bosh Menecer / Admin',
    startDate: '2022-01-01',
    password: 'skyline-edu',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'
  }
];

export const INITIAL_LOCATION: LocationSetting = {
  latitude: 41.2615,
  longitude: 69.2177,
  radiusMeters: 100,
  addressName: 'Skyline Education Markazi, Toshkent sh.'
};

export const INITIAL_TELEGRAM: TelegramConfig = {
  botToken: '789123456:AAFx_SkylineEducationSampleTokenKey',
  chatId: '-1001987654321',
  enabled: true,
  notifyOnCheckIn: true,
  notifyOnLate: true,
  notifyOnCheckOut: true
};

export const INITIAL_PUSH_NOTIFICATIONS: PushNotificationSetting = {
  morningReminderTime: '08:50',
  eveningReminderTime: '18:00',
  enabled: true
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    userId: 'usr-1',
    userName: 'Akmal Karimov',
    userPosition: 'Support Teacher',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:54:12',
    checkOutTime: undefined,
    status: 'ON_TIME',
    minutesLate: 0,
    checkInLat: 41.2615,
    checkInLng: 69.2177,
    distanceMeters: 12
  }
];
