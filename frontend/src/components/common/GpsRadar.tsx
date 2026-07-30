import React, { useState, useEffect, useRef } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { calculateDistanceMeters } from '../../services/gpsUtils';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, RefreshCw, Radio } from 'lucide-react';

interface GpsRadarProps {
  onCoordsChange?: (coords: { lat: number; lng: number } | undefined) => void;
}

export const GpsRadar: React.FC<GpsRadarProps> = ({ onCoordsChange }) => {
  const { location } = useAttendance();
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const watchIdRef = useRef<number | null>(null);

  const updatePosition = (lat: number, lng: number) => {
    setCurrentCoords({ lat, lng });
    setGpsError(null);
    const dist = calculateDistanceMeters(lat, lng, location.latitude, location.longitude);
    setDistance(dist);
    setIsLoading(false);
    setLastUpdatedTime(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    if (onCoordsChange) {
      onCoordsChange({ lat, lng });
    }
  };

  const getRealGPS = () => {
    setIsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updatePosition(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setIsLoading(false);
          setGpsError('GPS ruxsati berilmadi yoki aniqlanmadi.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLoading(false);
      setGpsError('Qurilmangizda Geolocation qo\'llab-quvvatlanmaydi.');
    }
  };

  // Automatic real-time GPS tracking & auto-poll interval
  useEffect(() => {
    getRealGPS();

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          updatePosition(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => console.warn('GPS Watch error:', err.message),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    }

    // Auto poll fallback every 4 seconds
    const pollInterval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => updatePosition(pos.coords.latitude, pos.coords.longitude),
          () => {},
          { enableHighAccuracy: true, timeout: 4000 }
        );
      }
    }, 4000);

    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      clearInterval(pollInterval);
    };
  }, [location]);

  const isInside = distance !== null && distance <= location.radiusMeters;

  return (
    <div className="sky-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(59,130,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Navigation size={18} color="#3b82f6" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Avto-GPS Radar</h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2px 7px', borderRadius: 99,
                background: 'rgba(16,185,129,0.14)', color: '#10b981',
                fontSize: 10, fontWeight: 700,
              }}>
                <Radio size={10} className="animate-pulse" />
                <span>LIVE GPS</span>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 1 }}>{location.addressName}</p>
          </div>
        </div>
        <button
          onClick={getRealGPS}
          title="GPS qayta yangilash"
          style={{
            width: 34, height: 34, borderRadius: 9, background: 'rgba(0,0,0,0.05)',
            border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
          }}
          className="dark:bg-white/5"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Radar Canvas */}
      <div style={{
        margin: '12px 16px',
        height: 140,
        background: '#070c17',
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Concentric rings */}
        {[120, 85, 50].map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: s, height: s,
            borderRadius: '50%',
            border: '1px solid rgba(59,130,246,0.25)',
            ...(i === 0 ? { animation: 'ping-slow 2.8s ease-in-out infinite' } : {}),
          }} />
        ))}

        {/* HQ dot */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#3b82f6', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
          boxShadow: '0 0 16px rgba(59,130,246,0.6)',
          position: 'relative', zIndex: 2,
        }}>HQ</div>

        {/* User position dot */}
        {currentCoords && (
          <div style={{
            position: 'absolute', zIndex: 3,
            transform: `translate(${isInside ? 24 : 72}px, ${isInside ? -16 : -40}px)`,
            transition: 'transform 0.7s ease',
            color: isInside ? '#10b981' : '#f43f5e',
          }}>
            <MapPin size={22} />
          </div>
        )}

        {/* Labels */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: '#475569', fontFamily: 'monospace',
        }}>
          <span>Ruxsat: {location.radiusMeters}m</span>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>
            {distance !== null ? `Masofa: ${distance}m` : 'GPS izlanmoqda…'}
          </span>
          <span>{lastUpdatedTime && `Yangilandi: ${lastUpdatedTime}`}</span>
        </div>
      </div>

      {/* Status banner */}
      <div style={{
        margin: '0 16px 14px',
        padding: '10px 14px',
        borderRadius: 12,
        background: gpsError
          ? 'rgba(245,158,11,0.12)'
          : isInside
            ? 'rgba(16,185,129,0.12)'
            : 'rgba(244,63,94,0.12)',
        border: `1px solid ${gpsError ? 'rgba(245,158,11,0.25)' : isInside ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600,
        color: gpsError ? '#f59e0b' : isInside ? '#10b981' : '#f43f5e',
      }}>
        {gpsError ? (
          <><AlertTriangle size={16} /><span>⚠️ {gpsError}</span></>
        ) : isInside ? (
          <><ShieldCheck size={16} /><span>✅ Siz Markaz hududidasiz ({distance}m)</span></>
        ) : (
          <><AlertTriangle size={16} /><span>❌ Markazdan tashqaridasiz ({distance}m)</span></>
        )}
      </div>
    </div>
  );
};
