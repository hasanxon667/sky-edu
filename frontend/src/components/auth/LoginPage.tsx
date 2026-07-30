import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, LogIn, UserPlus, User, Briefcase, CheckCircle2 } from 'lucide-react';
import { formatUzPhone } from '../../utils/phoneUtils';

export const LoginPage: React.FC = () => {
  const { login, registerUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPosition, setRegPosition] = useState('Support Teacher');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const ok = login(phone, password);
    if (!ok) {
      setError("Telefon raqam yoki parol noto'g'ri!");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setError("To'liq ismingizni kiriting!");
      return;
    }
    if (!regPhone.trim() || regPhone === '+998') {
      setError("Telefon raqamingizni kiriting!");
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    const res = registerUser({
      name: regName,
      phone: regPhone,
      position: regPosition,
      password: regPassword,
    });

    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setPhone(regPhone);
      setPassword(regPassword);
      setMode('login');
      // Reset register form
      setRegName('');
      setRegPhone('+998');
      setRegPosition('Support Teacher');
      setRegPassword('');
    }
  };

  return (
    <div
      style={{ background: 'linear-gradient(135deg, #070c17 0%, #0f172a 50%, #0a1020 100%)' }}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Decorative Orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '-80px',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '-80px',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Main Card */}
      <div
        className="animate-fade-in-up"
        style={{
          width: '100%', maxWidth: 430,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 28,
          padding: '32px 24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <img
            src="/skyline-logo.jpg"
            alt="Skyline Education Logo"
            style={{
              width: 68, height: 68, borderRadius: 20,
              objectFit: 'cover',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
          />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em' }}>
              Skyline Education
            </h1>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, fontWeight: 500 }}>
              Xodimlar Davomati Tizimi
            </p>
          </div>
        </div>

        {/* Tab Switcher (Kirish / Ro'yxatdan o'tish) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: 4, gap: 4,
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: mode === 'login' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : '#94a3b8',
              fontSize: 13, fontWeight: 800, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <LogIn size={15} />
            <span>Kirish</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: mode === 'register' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : '#94a3b8',
              fontSize: 13, fontWeight: 800, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <UserPlus size={15} />
            <span>Ro'yxatdan o'tish</span>
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.35)',
            borderRadius: 14,
            padding: '12px 16px',
            color: '#6ee7b7',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.15)',
            border: '1px solid rgba(244,63,94,0.35)',
            borderRadius: 14,
            padding: '12px 16px',
            color: '#fda4af',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Phone field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Telefon raqam</label>
              <div style={{ position: 'relative' }}>
                <span className="sky-input-icon">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatUzPhone(e.target.value))}
                  placeholder="+998 90 350 33 04"
                  className="sky-input"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Parol</label>
              <div style={{ position: 'relative' }}>
                <span className="sky-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="sky-input"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#ffffff', fontSize: 15, fontWeight: 800,
                boxShadow: '0 6px 20px rgba(37,99,235,0.4)', marginTop: 4,
              }}
            >
              <LogIn size={18} />
              <span>Tizimga kirish</span>
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Ism va Familiya *</label>
              <div style={{ position: 'relative' }}>
                <span className="sky-input-icon">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Sarvar Abdullayev"
                  className="sky-input"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Telefon raqami *</label>
              <div style={{ position: 'relative' }}>
                <span className="sky-input-icon">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(formatUzPhone(e.target.value))}
                  placeholder="+998 90 350 33 04"
                  className="sky-input"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            {/* Position Manual Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Lavozim *</label>
              <div style={{ position: 'relative' }}>
                <span className="sky-input-icon">
                  <Briefcase size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={regPosition}
                  onChange={(e) => setRegPosition(e.target.value)}
                  placeholder="Masalan: Support Teacher, IELTS Instruktur..."
                  className="sky-input"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Parol yarating *</label>
              <div style={{ position: 'relative' }}>
                <span className="sky-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="sky-input"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
                />
              </div>
            </div>

            {/* Submit Register */}
            <button
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff', fontSize: 15, fontWeight: 800,
                boxShadow: '0 6px 20px rgba(16,185,129,0.35)', marginTop: 4,
              }}
            >
              <UserPlus size={18} />
              <span>Ro'yxatdan o'tish</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
