import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';

// Views
import { LoginPage } from './components/auth/LoginPage';
import { EmployeeCheckIn } from './components/employee/EmployeeCheckIn';
import { AttendanceHistory } from './components/employee/AttendanceHistory';
import { EmployeeProfile } from './components/employee/EmployeeProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AttendanceJournal } from './components/admin/AttendanceJournal';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { AdminSettingsContainer } from './components/admin/AdminSettingsContainer';

const MaintenanceBanner: React.FC = () => (
  <div style={{
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#ffffff',
    textAlign: 'center',
    padding: '14px 16px',
    fontWeight: 900,
    fontSize: 16,
    letterSpacing: '0.02em',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
    zIndex: 999999,
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  }}>
    <span style={{ fontSize: 20 }}>🚧</span>
    <span>Texnik Ishlar olib borilmoqda (Sinov rejimi)</span>
  </div>
);

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    return user?.role === 'ADMIN' ? 'dashboard' : 'checkin';
  });

  if (!user) {
    return (
      <>
        <MaintenanceBanner />
        <LoginPage />
      </>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <MaintenanceBanner />
      {/* Top Header Navbar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto pb-28 sm:pb-8 px-4 sm:px-6" style={{ maxWidth: '100%' }}>
        {isAdmin ? (
          <>
            {activeTab === 'dashboard' && <AdminDashboard setActiveTab={setActiveTab} />}
            {activeTab === 'journal' && <AttendanceJournal />}
            {activeTab === 'employees' && <EmployeeManagement />}
            {activeTab === 'settings' && <AdminSettingsContainer />}
          </>
        ) : (
          <>
            {activeTab === 'checkin' && <EmployeeCheckIn />}
            {activeTab === 'history' && <AttendanceHistory />}
            {activeTab === 'profile' && <EmployeeProfile />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AttendanceProvider>
          <MainApp />
        </AttendanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
