import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { MapPin, CheckCircle2, Navigation, Save } from 'lucide-react';

export const GpsSettings: React.FC = () => {
  const { location, updateLocation } = useAttendance();
  const [formData, setFormData] = useState(location);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLocation(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const useCurrentDeviceLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 14px', fontSize: 13, fontWeight: 500,
    background: 'rgba(0,0,0,0.04)', border: '1.5px solid var(--surface-border)',
    borderRadius: 12, color: 'var(--text)', outline: 'none', fontFamily: 'monospace',
  };

  return (
    <div className="sky-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MapPin size={20} color="#6366f1" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>GPS Koordinata va Radius</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>Markaz joylashuvi va ruxsat berilgan radius</p>
        </div>
      </div>

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 14,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
          color: '#10b981', fontSize: 13, fontWeight: 600,
        }}>
          <CheckCircle2 size={16} />
          <span>GPS koordinatalari muvaffaqiyatli yangilandi!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Markaz Manzili
          </label>
          <input type="text" value={formData.addressName} onChange={(e) => setFormData({ ...formData, addressName: e.target.value })}
            style={{ ...inputStyle, fontFamily: 'inherit' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Latitude (Kenglik)', key: 'latitude', val: formData.latitude },
            { label: 'Longitude (Uzunlik)', key: 'longitude', val: formData.longitude },
          ].map(({ label, key, val }) => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </label>
              <input type="number" step="any" value={val}
                onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                style={inputStyle} />
            </div>
          ))}
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Ruxsat berilgan Radius (Metr)
          </label>
          <input type="number" value={formData.radiusMeters}
            onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value) || 100 })}
            style={inputStyle} />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Standart tavsiya: 100 metr</p>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 6, borderTop: '1px solid var(--surface-border)' }}>
          <button type="button" onClick={useCurrentDeviceLocation} style={{
            flex: 1, height: 42, borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: 'rgba(0,0,0,0.06)', border: '1.5px solid var(--surface-border)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }} className="dark:bg-white/5">
            <Navigation size={15} />
            <span>Hozirgi joylashuvim</span>
          </button>
          <button type="submit" style={{
            flex: 1, height: 42, borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}>
            <Save size={15} />
            <span>Saqlash</span>
          </button>
        </div>
      </form>
    </div>
  );
};
