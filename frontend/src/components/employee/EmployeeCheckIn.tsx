import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { GpsRadar } from '../common/GpsRadar';
import { MapPin, LogOut, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';

export const EmployeeCheckIn: React.FC = () => {
  const { user } = useAuth();
  const { checkIn, checkOut, todayRecord } = useAttendance();
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const currentToday = todayRecord(user.id);
  const hasCheckedIn = !!currentToday?.checkInTime;
  const hasCheckedOut = !!currentToday?.checkOutTime;

  const handleCheckIn = async () => {
    setIsLoading(true);
    setFeedback(null);
    const res = await checkIn(user.id, user.name, user.position, user.profileImage, customCoords);
    setIsLoading(false);
    setFeedback({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setFeedback(null);
    const res = await checkOut(user.id, customCoords);
    setIsLoading(false);
    setFeedback({ type: res.success ? 'success' : 'error', text: res.message });
  };

  return (
    <div style={{
      maxWidth: 460, margin: '0 auto',
      padding: '16px 16px 100px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Employee Welcome Card */}
      <div className="sky-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <img
          src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
          alt={user.name}
          style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(59,130,246,0.25)' }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{user.name}</h2>
            <span className="sky-badge sky-badge-green">{user.status}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{user.position}</p>
          <p style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, margin: '4px 0 0' }}>
            📅 {new Date().toLocaleDateString('uz-UZ', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* GPS Radar */}
      <GpsRadar onCoordsChange={setCustomCoords} />

      {/* Feedback message */}
      {feedback && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 16px', borderRadius: 14, fontSize: 13, fontWeight: 600,
          background: feedback.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
          color: feedback.type === 'success' ? '#10b981' : '#f43f5e',
        }}>
          {feedback.type === 'success'
            ? <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            : <AlertCircle size={18} style={{ flexShrink: 0 }} />
          }
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Today record summary */}
      {currentToday && (
        <div className="sky-card" style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px',
        }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Bugungi holat:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, fontWeight: 700, fontSize: 13 }}>
              {currentToday.status === 'LATE'
                ? <><Clock size={14} color="#f59e0b" /><span style={{ color: '#f59e0b' }}>Kechikkan ({currentToday.minutesLate} daq)</span></>
                : <><CheckCircle2 size={14} color="#10b981" /><span style={{ color: '#10b981' }}>O'z vaqtida</span></>
              }
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, fontFamily: 'monospace' }}>
            <div style={{ color: 'var(--text-muted)' }}>Keldi: <strong style={{ color: 'var(--text)' }}>{currentToday.checkInTime || '–'}</strong></div>
            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Ketdi: <strong style={{ color: 'var(--text)' }}>{currentToday.checkOutTime || '–'}</strong></div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
        {/* Check In */}
        <button
          disabled={hasCheckedIn || isLoading}
          onClick={handleCheckIn}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '18px 20px', borderRadius: 20, border: 'none', cursor: hasCheckedIn ? 'default' : 'pointer',
            background: hasCheckedIn
              ? 'rgba(148,163,184,0.18)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: hasCheckedIn ? 'none' : '0 8px 24px rgba(16,185,129,0.3)',
            opacity: hasCheckedIn ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MapPin size={22} color="#fff" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>📍 Ishga keldim</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {hasCheckedIn ? `Keldingiz: ${currentToday?.checkInTime}` : 'GPS lokatsiya bilan davomat'}
              </div>
            </div>
          </div>
          {hasCheckedIn
            ? <CheckCircle2 size={22} color="rgba(255,255,255,0.8)" />
            : <Sparkles size={20} color="rgba(255,255,255,0.8)" />
          }
        </button>

        {/* Check Out */}
        <button
          disabled={!hasCheckedIn || hasCheckedOut || isLoading}
          onClick={handleCheckOut}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '18px 20px', borderRadius: 20, border: 'none',
            cursor: (!hasCheckedIn || hasCheckedOut) ? 'default' : 'pointer',
            background: (!hasCheckedIn || hasCheckedOut)
              ? 'rgba(148,163,184,0.18)'
              : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: (!hasCheckedIn || hasCheckedOut) ? 'none' : '0 8px 24px rgba(99,102,241,0.3)',
            opacity: (!hasCheckedIn || hasCheckedOut) ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LogOut size={22} color="#fff" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>📍 Ishdan ketdim</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {hasCheckedOut
                  ? `Ketdingiz: ${currentToday?.checkOutTime}`
                  : hasCheckedIn ? 'Ish kuningizni yakunlash' : 'Avval ishga kelishni bosing'
                }
              </div>
            </div>
          </div>
          {hasCheckedOut
            ? <CheckCircle2 size={22} color="rgba(255,255,255,0.8)" />
            : <LogOut size={20} color="rgba(255,255,255,0.8)" />
          }
        </button>
      </div>
    </div>
  );
};
