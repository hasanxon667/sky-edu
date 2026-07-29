import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { INITIAL_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (phone: string, pass: string) => boolean;
  loginAs: (user: User) => void;
  logout: () => void;
  usersList: User[];
  registerUser: (data: { name: string; phone: string; position: string; password: string }) => { success: boolean; message: string };
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
    return users.map(u => u.role === 'ADMIN' ? { ...u, phone: '+998903503304', password: 'skyline-edu' } : u);
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

  useEffect(() => {
    localStorage.setItem('sky_edu_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sky_edu_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sky_edu_auth_user');
    }
  }, [user]);

  const login = (phone: string, pass: string): boolean => {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const foundUser = usersList.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);

    if (!foundUser) return false;

    // Admin requires special phone +998903503304 and password 'skyline-edu'
    if (foundUser.role === 'ADMIN') {
      if (pass === 'skyline-edu' && cleanPhone === '+998903503304') {
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

  const registerUser = (data: { name: string; phone: string; position: string; password: string }) => {
    const cleanPhone = data.phone.trim().replace(/\s+/g, '');
    const existing = usersList.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);

    if (existing) {
      return { success: false, message: 'Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan!' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      position: data.position || 'Support Teacher',
      password: data.password,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    };

    setUsersList((prev) => [...prev, newUser]);
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
      id: `usr-${Date.now()}`,
    };
    setUsersList((prev) => [...prev, created]);
  };

  const updateUser = (updated: User) => {
    setUsersList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (user?.id === updated.id) {
      setUser(updated);
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
