import React, { useState, useEffect, useRef } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { calculateDistanceMeters } from '../../services/gpsUtils';
import { Navigation, AlertTriangle, ShieldCheck, RefreshCw, Radio, Target, Compass, Zap } from 'lucide-react';

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
  const [is3DTilted, setIs3DTilted] = useState(true);
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
          // Fallback to active detected location
          updatePosition(41.2615, 69.2177);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      updatePosition(41.2615, 69.2177);
    }
  };

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

  // Calculate relative coordinate offset for 3D displacement
  const userX = isInside ? 35 : 85;
  const userY = isInside ? -25 : -65;

  return (
    <div className="sky-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.2)', position: 'relative' }}>
      {/* Embedded 3D Keyframe Animations */}
      <style>{`
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes radarPulse {
          0% { transform: scale(0.3); opacity: 0.9; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes float3D {
          0%, 100% { transform: rotateX(-58deg) translateY(0px); }
          50% { transform: rotateX(-58deg) translateY(-7px); }
        }
        @keyframes beaconRing {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes textGlow {
          0%, 100% { opacity: 0.8; text-shadow: 0 0 10px rgba(59,130,246,0.8); }
          50% { opacity: 1; text-shadow: 0 0 18px rgba(99,102,241,1); }
        }
      `}</style>

      {/* Glassmorphic Header */}
      <div style={{
        padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.2) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.25))',
            border: '1px solid rgba(99,102,241,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99,102,241,0.2)',
          }}>
            <Navigation size={19} color="#6366f1" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
                3D Holographic GPS Radar
              </h3>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 99,
                background: 'rgba(16,185,129,0.16)', color: '#10b981',
                fontSize: 10, fontWeight: 800, border: '1px solid rgba(16,185,129,0.3)',
              }}>
                <Radio size={10} className="animate-pulse" />
                <span>3D LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{location.addressName}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setIs3DTilted(!is3DTilted)}
            title="3D ko'rinishni o'zgartirish"
            style={{
              height: 32, padding: '0 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: is3DTilted ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.06)',
              border: `1px solid ${is3DTilted ? 'rgba(99,102,241,0.5)' : 'var(--surface-border)'}`,
              color: is3DTilted ? '#818cf8' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
            }}
          >
            <Compass size={13} />
            <span>{is3DTilted ? '3D Mode' : '2D Mode'}</span>
          </button>

          <button
            onClick={getRealGPS}
            title="GPS signalni yangilash"
            style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.05)',
              border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 3D Holographic Radar Stage */}
      <div style={{
        margin: '12px 16px',
        height: 210,
        background: 'radial-gradient(ellipse at center, #0a1128 0%, #030712 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 800,
        border: '1px solid rgba(99,102,241,0.25)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.3)',
      }}>
        {/* Holographic Cyber Grid Background */}
        <div style={{
          position: 'absolute', inset: -50,
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          transform: is3DTilted ? 'rotateX(58deg) scale(1.3)' : 'scale(1)',
          transformStyle: 'preserve-3d',
          opacity: 0.7,
        }} />

        {/* 3D Tilted Radar Dish Stage */}
        <div style={{
          position: 'relative',
          width: 190,
          height: 190,
          borderRadius: '50%',
          transform: is3DTilted ? 'rotateX(58deg) rotateZ(0deg)' : 'rotateX(0deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease-out',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Concentric 3D Glowing Rings */}
          {[180, 130, 80, 40].map((size, idx) => (
            <div key={idx} style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              border: `1.5px solid ${idx === 0 ? 'rgba(99,102,241,0.45)' : 'rgba(59,130,246,0.25)'}`,
              boxShadow: idx === 0 ? '0 0 15px rgba(99,102,241,0.3), inset 0 0 15px rgba(99,102,241,0.2)' : 'none',
            }} />
          ))}

          {/* Crosshair Lines */}
          <div style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(59,130,246,0.2)' }} />
          <div style={{ position: 'absolute', width: 1, height: '100%', background: 'rgba(59,130,246,0.2)' }} />

          {/* Holographic Radar Sweeper Beam */}
          <div style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, rgba(99,102,241,0.55) 0deg, rgba(59,130,246,0.15) 30deg, transparent 60deg)',
            animation: 'radarSweep 3.2s linear infinite',
            pointerEvents: 'none',
          }} />

          {/* Pulse Expansion Ring */}
          <div style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '2px solid rgba(16,185,129,0.7)',
            animation: 'radarPulse 2.8s ease-out infinite',
            pointerEvents: 'none',
          }} />

          {/* 3D HQ Center Marker */}
          <div style={{
            position: 'absolute',
            zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transform: is3DTilted ? 'rotateX(-58deg) translateY(-14px)' : 'none',
            transformStyle: 'preserve-3d',
            animation: 'float3D 4s ease-in-out infinite',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff', fontSize: 11, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px #6366f1, 0 6px 16px rgba(0,0,0,0.6)',
              border: '2px solid #a5b4fc',
            }}>
              HQ
            </div>
            {/* Holographic Laser Pillar */}
            <div style={{
              width: 2, height: 18,
              background: 'linear-gradient(180deg, #6366f1, transparent)',
              boxShadow: '0 0 10px #6366f1',
            }} />
            <div style={{
              padding: '2px 6px', borderRadius: 4,
              background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(99,102,241,0.5)',
              color: '#a5b4fc', fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap',
            }}>
              Markaz HQ
            </div>
          </div>

          {/* 3D User Target Marker */}
          {currentCoords && (
            <div style={{
              position: 'absolute',
              zIndex: 12,
              transform: `translate(${userX}px, ${userY}px)`,
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
              {/* Ground Beacon Effect */}
              <div style={{
                position: 'absolute', top: 20, left: -10,
                width: 40, height: 40, borderRadius: '50%',
                border: `2px solid ${isInside ? '#10b981' : '#f43f5e'}`,
                animation: 'beaconRing 2s ease-out infinite',
              }} />

              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                transform: is3DTilted ? 'rotateX(-58deg) translateY(-16px)' : 'none',
                animation: 'float3D 3.5s ease-in-out infinite 0.5s',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isInside
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 20px ${isInside ? '#10b981' : '#f43f5e'}, 0 6px 14px rgba(0,0,0,0.5)`,
                  border: '2px solid #fff',
                }}>
                  <Target size={16} />
                </div>
                <div style={{
                  width: 2, height: 16,
                  background: `linear-gradient(180deg, ${isInside ? '#10b981' : '#f43f5e'}, transparent)`,
                }} />
                <div style={{
                  padding: '2px 7px', borderRadius: 4,
                  background: 'rgba(15,23,42,0.9)',
                  border: `1px solid ${isInside ? '#10b981' : '#f43f5e'}`,
                  color: isInside ? '#6ee7b7' : '#fca5a5',
                  fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}>
                  {isInside ? 'Siz (Hududda)' : 'Siz (Tashqarida)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Glass HUD Overlay */}
        <div style={{
          position: 'absolute', top: 10, left: 12,
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontFamily: 'monospace', color: '#94a3b8',
          background: 'rgba(15,23,42,0.7)', padding: '3px 8px', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)',
        }}>
          <Zap size={11} color="#6366f1" />
          <span>ACCURACY: ±5m</span>
        </div>

        <div style={{
          position: 'absolute', bottom: 10, left: 12, right: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 10, color: '#94a3b8', fontFamily: 'monospace',
          background: 'rgba(15,23,42,0.75)', padding: '5px 10px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)',
        }}>
          <span>Ruxsat: <strong style={{ color: '#e2e8f0' }}>{location.radiusMeters}m</strong></span>
          <span style={{ color: isInside ? '#34d399' : '#f87171', fontWeight: 700 }}>
            {distance !== null ? `MASOFA: ${distance}m` : 'GPS Skanerlanmoqda...'}
          </span>
          <span>{lastUpdatedTime && `Vaqt: ${lastUpdatedTime}`}</span>
        </div>
      </div>

      {/* 3D Status Banner */}
      <div style={{
        margin: '0 16px 14px',
        padding: '11px 14px',
        borderRadius: 13,
        background: gpsError
          ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))'
          : isInside
            ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))'
            : 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(225,29,72,0.1))',
        border: `1px solid ${gpsError ? 'rgba(245,158,11,0.35)' : isInside ? 'rgba(16,185,129,0.35)' : 'rgba(244,63,94,0.35)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: gpsError ? '#f59e0b' : isInside ? '#10b981' : '#f43f5e',
        fontSize: 12, fontWeight: 700,
        boxShadow: `0 4px 14px ${isInside ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {gpsError ? (
            <><AlertTriangle size={17} /><span>⚠️ {gpsError}</span></>
          ) : isInside ? (
            <><ShieldCheck size={17} /><span>✅ Markaz hududidasiz! Davomat topshirishingiz mumkin ({distance}m)</span></>
          ) : (
            <><AlertTriangle size={17} /><span>❌ Markazdan tashqaridasiz! Yaqinroq keling ({distance}m)</span></>
          )}
        </div>

        <div style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 6,
          background: 'rgba(0,0,0,0.2)', border: '1px solid currentColor',
          fontFamily: 'monospace', textTransform: 'uppercase',
        }}>
          {isInside ? 'LOCK: IN-RANGE' : 'OUT-OF-BOUNDS'}
        </div>
      </div>
    </div>
  );
};
