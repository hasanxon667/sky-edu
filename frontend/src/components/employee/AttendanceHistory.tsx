import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { Calendar, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export const AttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const { records } = useAttendance();
  const [filterRange, setFilterRange] = useState<'all' | 'week' | 'month'>('all');

  if (!user) return null;

  const myRecords = records.filter((r) => r.userId === user.id);

  const filteredRecords = myRecords.filter((r) => {
    if (filterRange === 'all') return true;
    const recDate = new Date(r.date);
    const now = new Date();
    if (filterRange === 'week') {
      const diffDays = Math.ceil(Math.abs(now.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (filterRange === 'month') {
      return recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalDays = myRecords.length;
  const lateDays = myRecords.filter((r) => r.status === 'LATE').length;
  const totalLateMins = myRecords.reduce((acc, r) => acc + r.minutesLate, 0);

  const statCards = [
    { label: 'Jami kunlar', value: totalDays, color: '#3b82f6', icon: Calendar },
    { label: 'Kechikkan', value: `${lateDays} kun`, color: '#f59e0b', icon: Clock },
    { label: 'Kechikish', value: `${totalLateMins} daq`, color: '#f43f5e', icon: TrendingUp },
  ];

  const filterBtns: { id: 'all' | 'week' | 'month'; label: string }[] = [
    { id: 'all', label: 'Barchasi' },
    { id: 'week', label: 'Bu hafta' },
    { id: 'month', label: 'Bu oy' },
  ];

  return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Davomat Tarixi
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Shaxsiy keldi-ketdi yozuvlaringiz</p>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 10,
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
          color: '#10b981', fontSize: 12, fontWeight: 700,
        }}>
          ⏰ Ish: {user.workStartTime || '09:00'} dan
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="sky-card"
            style={{ padding: '14px 12px', alignItems: 'center', textAlign: 'center', gap: 6 }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            }}>
              <Icon size={17} color={color} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter range buttons */}
      <div style={{
        display: 'flex', gap: 8,
        background: 'rgba(0,0,0,0.05)',
        padding: 4, borderRadius: 14,
        border: '1px solid var(--surface-border)',
      }} className="dark:bg-white/5">
        {filterBtns.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilterRange(btn.id)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 11,
              border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              background: filterRange === btn.id ? '#3b82f6' : 'transparent',
              color: filterRange === btn.id ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
              boxShadow: filterRange === btn.id ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* History list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredRecords.length === 0 ? (
          <div className="sky-card" style={{ alignItems: 'center', padding: '48px 20px', textAlign: 'center' }}>
            <Calendar size={36} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12, fontWeight: 600 }}>
              Bu davr uchun yozuv topilmadi
            </p>
          </div>
        ) : filteredRecords.map((r) => (
          <div
            key={r.id}
            className="sky-card"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: '12px 14px' }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 13, flexShrink: 0,
              background: r.status === 'LATE' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${r.status === 'LATE' ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
            }}>
              {r.status === 'LATE'
                ? <AlertTriangle size={20} color="#f59e0b" />
                : <CheckCircle2 size={20} color="#10b981" />
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {new Date(r.date).toLocaleDateString('uz-UZ', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: r.status === 'LATE' ? '#f59e0b' : '#10b981' }}>
                {r.status === 'LATE' ? `Kechikkan: ${r.minutesLate} daqiqa` : 'O\'z vaqtida keldi'}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>
                {r.checkInTime || '–'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                → {r.checkOutTime || 'Ketmagan'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
