import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { UserCheck, UserX, Clock, Calendar, ArrowUpRight } from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

const KpiCard = ({
  label, value, sub, icon: Icon, iconColor, iconBg, delay = 0,
}: {
  label: string; value: string | number; sub: string;
  icon: React.FC<any>; iconColor: string; iconBg: string; delay?: number;
}) => (
  <div
    className="sky-card animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.3 }}>{label}</span>
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={19} color={iconColor} />
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{value}</span>
    </div>

    <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{sub}</span>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { usersList } = useAuth();
  const { records } = useAttendance();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter((r) => r.date === todayStr);
  const totalEmployees = usersList.filter((u) => u.role === 'EMPLOYEE' || u.role?.toUpperCase() === 'EMPLOYEE' || u.role !== 'ADMIN').length;
  const todayPresent = todayRecords.length;
  const todayLate = todayRecords.filter((r) => r.status === 'LATE').length;
  const todayAbsent = Math.max(0, totalEmployees - todayPresent);

  // Compute dynamic average arrival time for today's check-ins
  let avgCheckInTime = '08:55';
  if (todayRecords.length > 0) {
    let totalMinutes = 0;
    let validCount = 0;
    todayRecords.forEach((r) => {
      if (r.checkInTime) {
        const parts = r.checkInTime.split(':');
        if (parts.length >= 2) {
          const hh = parseInt(parts[0], 10);
          const mm = parseInt(parts[1], 10);
          totalMinutes += hh * 60 + mm;
          validCount++;
        }
      }
    });
    if (validCount > 0) {
      const avgMins = Math.round(totalMinutes / validCount);
      const avgH = Math.floor(avgMins / 60).toString().padStart(2, '0');
      const avgM = (avgMins % 60).toString().padStart(2, '0');
      avgCheckInTime = `${avgH}:${avgM}`;
    }
  }

  // Dynamically calculate current week chart data (Monday..Saturday)
  const daysOfWeek = [
    { key: 'Dush', dayIdx: 1 },
    { key: 'Sesh', dayIdx: 2 },
    { key: 'Chorsh', dayIdx: 3 },
    { key: 'Paysh', dayIdx: 4 },
    { key: 'Juma', dayIdx: 5 },
    { key: 'Shanba', dayIdx: 6 },
  ];

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ...
  const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + distanceToMon);

  const chartData = daysOfWeek.map(({ key, dayIdx }) => {
    const targetDateObj = new Date(mondayDate);
    targetDateObj.setDate(mondayDate.getDate() + (dayIdx - 1));
    const dateStr = targetDateObj.toISOString().split('T')[0];

    const dayRecords = records.filter((r) => r.date === dateStr);
    const kelgan = dayRecords.length;
    const kechikkan = dayRecords.filter((r) => r.status === 'LATE').length;

    return {
      day: key,
      kelgan: kelgan,
      kechikkan: kechikkan,
    };
  });

  return (
    <div style={{
      padding: '20px 16px 100px',
      maxWidth: 900, margin: '0 auto',
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Admin Dashboard
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Xodimlar davomati va haftalik ko'rsatkichlar
          </p>
        </div>
        <button
          onClick={() => setActiveTab('journal')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
            transition: 'all 0.15s',
          }}
        >
          <span>Davomat jurnali</span>
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}
        className="sm:grid-cols-4"
      >
        <KpiCard
          label="Bugun kelganlar"
          value={`${todayPresent} / ${totalEmployees}`}
          sub="Faol davomat"
          icon={UserCheck}
          iconColor="#10b981"
          iconBg="rgba(16,185,129,0.13)"
          delay={0}
        />
        <KpiCard
          label="Kelmaganlar"
          value={todayAbsent}
          sub="Yo'qlamada"
          icon={UserX}
          iconColor="#f43f5e"
          iconBg="rgba(244,63,94,0.13)"
          delay={80}
        />
        <KpiCard
          label="Kechikkanlar"
          value={todayLate}
          sub="Grafikdan kechikkanlar"
          icon={Clock}
          iconColor="#f59e0b"
          iconBg="rgba(245,158,11,0.13)"
          delay={160}
        />
        <KpiCard
          label="O'rtacha kelish"
          value={avgCheckInTime}
          sub="Shaxsiy grafik bo'yicha"
          icon={Calendar}
          iconColor="#3b82f6"
          iconBg="rgba(59,130,246,0.13)"
          delay={240}
        />
      </div>

      {/* Chart + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="lg:grid-cols-3">
        {/* Chart */}
        <div className="sky-card lg:col-span-2" style={{ gridColumn: 'span 1' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Haftalik Davomat Grafigi
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              Kelgan va kechikkan xodimlar nisbati
            </p>
          </div>
          <div style={{ width: '100%', height: 260, minHeight: 260, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, fontSize: 12, color: '#f1f5f9',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="kelgan" name="Kelganlar" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="kechikkan" name="Kechikkanlar" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today Live Activity */}
        <div className="sky-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Bugungi faollik</h3>
            <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
              {todayRecords.length} ta
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
            {todayRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Bugun hali hech kim kelmadi
              </div>
            ) : (
              todayRecords.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, padding: '10px 12px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid var(--surface-border)',
                  }}
                  className="dark:bg-white/5"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <img
                      src={r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={r.userName}
                      style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.userName}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.userPosition}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>
                      {r.checkInTime}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: r.status === 'LATE' ? '#f59e0b' : '#10b981' }}>
                      {r.status === 'LATE' ? `${r.minutesLate}m kechikdi` : 'Vaqtida'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
