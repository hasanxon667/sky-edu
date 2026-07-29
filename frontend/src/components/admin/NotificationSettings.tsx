import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Bell, CheckCircle2, Send, Save } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { pushSettings, updatePushSettings } = useAttendance();
  const [formData, setFormData] = useState(pushSettings);
  const [saved, setSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePushSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushStatus('✅ Push Notification ruxsati berildi!');
        new Notification('Skyline Education Davomat Tizimi', {
          body: '📍 Eslatma: Ish boshlanishiga 10 daqiqa qoldi (08:50)',
          icon: '/favicon.ico',
        });
      } else {
        setPushStatus('❌ Ruxsat rad etildi.');
      }
    } else {
      setPushStatus('Bu brauzer Push Notification-ni qo\'llab-quvvatlamaydi.');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px', fontSize: 13, fontWeight: 500,
    background: 'rgba(0,0,0,0.04)', border: '1.5px solid var(--surface-border)',
    borderRadius: 12, color: 'var(--text)', outline: 'none', fontFamily: 'monospace',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <div className="sky-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bell size={20} color="#f59e0b" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Push Bildirishnomalar</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>Kelish va ketish eslatmalarini sozlash</p>
        </div>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: 13, fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          <span>Eslatma vaqtlari saqlandi!</span>
        </div>
      )}

      {pushStatus && (
        <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6', fontSize: 13, fontWeight: 600 }}>
          {pushStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Ertalabki kelish eslatmasi</label>
            <input type="time" value={formData.morningReminderTime}
              onChange={(e) => setFormData({ ...formData, morningReminderTime: e.target.value })}
              style={inputStyle} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>«Ish boshlanishiga 10 daqiqa qoldi»</p>
          </div>
          <div>
            <label style={labelStyle}>Kechki ketish eslatmasi</label>
            <input type="time" value={formData.eveningReminderTime}
              onChange={(e) => setFormData({ ...formData, eveningReminderTime: e.target.value })}
              style={inputStyle} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>«Ishdan chiqishni unutmang»</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 6, borderTop: '1px solid var(--surface-border)' }}>
          <button type="submit" style={{
            flex: 1, height: 42, borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}>
            <Save size={15} /><span>Saqlash</span>
          </button>
          <button type="button" onClick={requestPushPermission} style={{
            flex: 1, height: 42, borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: 'rgba(245,158,11,0.9)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
          }}>
            <Send size={15} /><span>Push test</span>
          </button>
        </div>
      </form>
    </div>
  );
};
