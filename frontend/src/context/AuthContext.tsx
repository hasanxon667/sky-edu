import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { INITIAL_USERS } from '../services/mockData';
import { normalizePhone, formatUzPhone } from '../utils/phoneUtils';
import { API_BASE_URL } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (phone: string, pass: string) => boolean;
  loginAs: (user: User) => void;
  logout: () => void;
  usersList: User[];
  registerUser: (data: { name: string; phone: string; position: string; password: string; workStartTime?: string }) => { success: boolean; message: string };
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('sky_edu_users');
    let users: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    const mapped = users.map(u => u.role === 'ADMIN' ? { ...u, phone: '+998903503304', password: 'skyline-edu' } : u);
    localStorage.setItem('sky_edu_users', JSON.stringify(mapped));
    return mapped;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sky_edu_auth_user');
    let u: User | null = saved ? JSON.parse(saved) : null;
    if (u && u.role === 'ADMIN') {
      u.phone = '+998903503304';
      u.password = 'skyline-edu';
    }
    return u;
  });

  // Sync users list with backend API on mount and periodically
  useEffect(() => {
    const fetchBackendUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/users`);
        if (res.ok) {
          const data = await res.json();
          if (data.users && Array.isArray(data.users)) {
            setUsersList((prev) => {
              const prevMap = new Map(prev.map((u) => [normalizePhone(u.phone), u]));
              data.users.forEach((bu: any) => {
                const norm = normalizePhone(bu.phone);
                if (!prevMap.has(norm)) {
                  prevMap.set(norm, {
                    id: bu.id || `usr-${Date.now()}`,
                    name: bu.name,
                    phone: formatUzPhone(bu.phone) || bu.phone,
                    position: bu.position || 'Support Teacher',
                    workStartTime: bu.workStartTime || '09:00',
                    password: bu.password || '123456',
                    role: bu.role || 'EMPLOYEE',
                    status: bu.status || 'ACTIVE',
                    startDate: bu.startDate || new Date().toISOString().split('T')[0],
                    profileImage: bu.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                  });
                }
              });
              const merged = Array.from(prevMap.values());
              localStorage.setItem('sky_edu_users', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (err) {
        // Fallback to localStorage gracefully if offline
      }
    };

    fetchBackendUsers();
  }, []);

  // Cross-tab synchronization so admin tab updates immediately when new employee registers
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sky_edu_users' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setUsersList(parsed);
        } catch (err) {
          console.error('Error parsing sky_edu_users from storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('sky_edu_users', JSON.stringify(usersList));
    if (user) {
      const latest = usersList.find((u) => u.id === user.id);
      if (latest && JSON.stringify(latest) !== JSON.stringify(user)) {
        setUser(latest);
      }
    }
  }, [usersList]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sky_edu_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sky_edu_auth_user');
    }
  }, [user]);

  const login = (phone: string, pass: string): boolean => {
    const normInput = normalizePhone(phone);
    const foundUser = usersList.find((u) => normalizePhone(u.phone) === normInput || u.phone.trim() === phone.trim());

    if (!foundUser) return false;

    // Admin requires special phone +998903503304 and password 'skyline-edu'
    if (foundUser.role === 'ADMIN') {
      if (pass === 'skyline-edu' && (normInput === '998903503304' || phone.trim() === '+998903503304')) {
        setUser(foundUser);
        return true;
      }
      return false;
    }

    // Standard employee password check
    if (foundUser.password && foundUser.password !== pass) {
      return false;
    }

    setUser(foundUser);
    return true;
  };

  const registerUser = (data: { name: string; phone: string; position: string; password: string; workStartTime?: string }) => {
    const normInputPhone = normalizePhone(data.phone);
    const existing = usersList.find((u) => normalizePhone(u.phone) === normInputPhone);

    if (existing) {
      return { success: false, message: 'Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan!' };
    }

    const formattedPhone = formatUzPhone(data.phone) || data.phone.trim();

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      phone: formattedPhone,
      position: data.position || 'Support Teacher',
      workStartTime: data.workStartTime || '09:00',
      password: data.password,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    };

    setUsersList((prev) => {
      const next = [...prev, newUser];
      localStorage.setItem('sky_edu_users', JSON.stringify(next));
      return next;
    });

    // Also send POST request to backend API so all devices see this user
    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUser.name,
        phone: newUser.phone,
        position: newUser.position,
        password: newUser.password,
      }),
    }).catch(() => {});

    return { success: true, message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Endi tizimga kiring.' };
  };

  const loginAs = (u: User) => {
    setUser(u);
  };

  const logout = () => {
    setUser(null);
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const created: User = {
      ...newUser,
      phone: formatUzPhone(newUser.phone) || newUser.phone.trim(),
      role: newUser.role || 'EMPLOYEE',
      id: `usr-${Date.now()}`,
    };
    setUsersList((prev) => {
      const next = [...prev, created];
      localStorage.setItem('sky_edu_users', JSON.stringify(next));
      return next;
    });
  };

  const updateUser = (updated: User) => {
    setUsersList((prev) => {
      const next = prev.map((u) => (u.id === updated.id ? updated : u));
      localStorage.setItem('sky_edu_users', JSON.stringify(next));
      return next;
    });
    if (user && user.id === updated.id) {
      setUser(updated);
      localStorage.setItem('sky_edu_auth_user', JSON.stringify(updated));
    }
  };

  const deleteUser = (id: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    if (user?.id === id) {
      setUser(null);
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'EMPLOYEE',
        login,
        loginAs,
        logout,
        usersList,
        registerUser,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
