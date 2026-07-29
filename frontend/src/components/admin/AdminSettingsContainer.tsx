import React, { useState } from 'react';
import { TelegramSettings } from './TelegramSettings';
import { GpsSettings } from './GpsSettings';
import { NotificationSettings } from './NotificationSettings';
import { Bot, MapPin, Bell } from 'lucide-react';

type Tab = 'telegram' | 'gps' | 'notifications';

const tabs: { id: Tab; label: string; icon: React.FC<any>; color: string }[] = [
  { id: 'telegram', label: 'Telegram Bot', icon: Bot, color: '#3b82f6' },
  { id: 'gps', label: 'GPS Hudud', icon: MapPin, color: '#6366f1' },
  { id: 'notifications', label: 'Bildirishnomalar', icon: Bell, color: '#f59e0b' },
];

export const AdminSettingsContainer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<Tab>('telegram');

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Tizim Sozlamalari</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          GPS lokatsiya, Telegram bot integratsiyasi va bildirishnomalarni sozlash
        </p>
      </div>

      {/* Sub-tab pills */}
      <div style={{
        display: 'flex', gap: 4, padding: 4, borderRadius: 16,
        background: 'rgba(0,0,0,0.05)', border: '1.5px solid var(--surface-border)',
        width: 'fit-content', flexWrap: 'wrap',
      }} className="dark:bg-white/5">
        {tabs.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeSubTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSubTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? color : 'var(--text-muted)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div>
        {activeSubTab === 'telegram' && <TelegramSettings />}
        {activeSubTab === 'gps' && <GpsSettings />}
        {activeSubTab === 'notifications' && <NotificationSettings />}
      </div>
    </div>
  );
};
