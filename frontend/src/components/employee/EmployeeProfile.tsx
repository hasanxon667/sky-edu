import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Briefcase, Calendar, ShieldCheck, LogOut, CheckCircle2, Camera, Upload } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export const EmployeeProfile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { records } = useAttendance();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi juda katta! 5MB dan kichik rasm tanlang.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateUser({
          ...user,
          profileImage: base64,
        });
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const myRecords = records.filter((r) => r.userId === user.id);
  const totalDays = myRecords.length;
  const onTimeDays = myRecords.filter((r) => r.status === 'ON_TIME').length;
  const attendance = totalDays > 0 ? Math.round((onTimeDays / totalDays) * 100) : 100;

  const infoRows = [
    { icon: Phone, color: '#3b82f6', label: 'Telefon', value: user.phone },
    { icon: Briefcase, color: '#6366f1', label: 'Lavozim', value: user.position },
    { icon: Calendar, color: '#10b981', label: 'Ishga kirgan', value: user.startDate },
    { icon: ShieldCheck, color: '#f59e0b', label: 'Rol', value: user.role === 'ADMIN' ? 'Administrator' : 'Xodim' },
    { icon: CheckCircle2, color: '#10b981', label: 'Holat', value: user.status === 'ACTIVE' ? 'Faol' : 'Nofaol' },
  ];

  return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      {/* Header Profile Card */}
      <div className="sky-card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
        <div style={{
          height: 90,
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={triggerFileInput}>
              <img
                src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user.name}
                style={{
                  width: 76, height: 76, borderRadius: 24, objectFit: 'cover',
                  border: '3px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  transition: 'opacity 0.2s',
                }}
              />
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 28, height: 28, borderRadius: '50%',
                background: '#3b82f6', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>
                <Camera size={14} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 46, paddingBottom: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', margin: 0 }}>{user.name}</h2>
          <p style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600, margin: 0 }}>{user.position}</p>
          
          <button
            onClick={triggerFileInput}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
              color: '#3b82f6', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              marginTop: 4, transition: 'all 0.15s',
            }}
          >
            <Upload size={13} />
            <span>Profil rasmini o'zgartirish</span>
          </button>

          {uploadSuccess && (
            <div style={{
              fontSize: 12, color: '#10b981', fontWeight: 700,
              background: 'rgba(16,185,129,0.12)', padding: '4px 12px', borderRadius: 99,
              marginTop: 4,
            }}>
              ✅ Rasm muvaffaqiyatli saqlandi!
            </div>
          )}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid var(--surface-border)',
        }}>
          {[
            { label: 'Jami kunlar', value: totalDays, color: '#3b82f6' },
            { label: 'O\'z vaqtida', value: onTimeDays, color: '#10b981' },
            { label: 'Davomat', value: `${attendance}%`, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '14px 8px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid var(--surface-border)' : 'none',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Rows Card */}
      <div className="sky-card">
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Shaxsiy ma'lumotlar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {infoRows.map(({ icon: Icon, color, label, value }, i) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', gap: 10,
                borderBottom: i < infoRows.length - 1 ? '1px solid var(--surface-border)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textAlign: 'right', fontFamily: label === 'Telefon' ? 'monospace' : 'inherit' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '14px 20px', borderRadius: 16,
          background: 'rgba(244,63,94,0.1)',
          border: '1.5px solid rgba(244,63,94,0.25)',
          color: '#f43f5e', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <LogOut size={17} />
        <span>Tizimdan chiqish</span>
      </button>
    </div>
  );
};
