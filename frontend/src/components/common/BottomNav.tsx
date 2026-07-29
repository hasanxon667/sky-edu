import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, User, LayoutDashboard, BookOpen, Users, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const employeeTabs = [
    { id: 'checkin', label: 'Davomat', icon: MapPin },
    { id: 'history', label: 'Tarix', icon: Clock },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', label: 'Jurnal', icon: BookOpen },
    { id: 'employees', label: 'Xodimlar', icon: Users },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  const tabs = isAdmin ? adminTabs : employeeTabs;

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99,
        padding: '6px 12px 10px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '6px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: 12,
              color: isActive ? '#60a5fa' : '#94a3b8',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 38, height: 32, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <Icon size={20} color={isActive ? '#60a5fa' : '#94a3b8'} />
            </div>
            <span style={{
              fontSize: 11, fontWeight: isActive ? 800 : 500,
              lineHeight: 1, whiteSpace: 'nowrap',
              color: isActive ? '#60a5fa' : '#94a3b8',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
