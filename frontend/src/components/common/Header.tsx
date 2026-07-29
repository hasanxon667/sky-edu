import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAttendance } from '../../context/AttendanceContext';
import { Sun, Moon, ShieldCheck, UserCheck, LogOut, WifiOff } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOffline, pendingOfflineCount } = useAttendance();

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        width: '100%',
        padding: '10px 16px',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}
    >
      {/* Logo */}
      <button
        onClick={() => setActiveTab(user?.role === 'ADMIN' ? 'dashboard' : 'checkin')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          flexShrink: 0,
        }}
      >
        <img
          src="/skyline-logo.jpg"
          alt="Skyline Logo"
          style={{
            width: 38, height: 38, borderRadius: 12,
            objectFit: 'cover',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            flexShrink: 0,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Skyline
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1 }}>
            Davomat Tizimi
          </span>
        </div>
      </button>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Offline indicator */}
        {isOffline && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 99,
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#f59e0b', fontSize: 11, fontWeight: 700,
          }}>
            <WifiOff size={13} />
            <span>Offline {pendingOfflineCount > 0 ? `(${pendingOfflineCount})` : ''}</span>
          </div>
        )}

        {/* Current User Role Tag */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 10,
            background: user.role === 'ADMIN' ? 'rgba(99,102,241,0.18)' : 'rgba(59,130,246,0.14)',
            color: user.role === 'ADMIN' ? '#818cf8' : '#60a5fa',
            fontSize: 12, fontWeight: 800,
          }}>
            {user.role === 'ADMIN' ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
            <span>{user.role === 'ADMIN' ? 'Admin' : 'Xodim'}</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid var(--surface-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
          className="dark:bg-white/5"
        >
          {theme === 'dark'
            ? <Sun size={17} color="#f59e0b" />
            : <Moon size={17} color="#6366f1" />
          }
        </button>

        {/* User avatar + Logout */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingLeft: 8, borderLeft: '1px solid var(--surface-border)',
          }}>
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={user.name}
              style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(59,130,246,0.35)' }}
            />
            <div className="hidden lg:flex flex-col" style={{ gap: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{user.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>{user.position}</span>
            </div>
            <button
              onClick={logout}
              title="Chiqish"
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
