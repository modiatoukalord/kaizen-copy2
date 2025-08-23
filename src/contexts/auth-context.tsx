
'use client';

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  username: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (username: string, pin: string) => void;
  logout: () => void;
  changePin: (username: string, oldPin: string, newPin: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock hashing function for the PIN. In a real app, use a robust library like bcrypt.
const mockHash = (pin: string) => `hashed-${pin}`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This effect runs on the client-side after hydration
    try {
      const sessionUser = sessionStorage.getItem('finance-app-session');
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (error) {
      console.error("Failed to parse session user:", error);
      sessionStorage.removeItem('finance-app-session');
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = useCallback((username: string, pin: string) => {
    const storedUser = localStorage.getItem('finance-app-user');
    
    if (storedUser) {
      // Login existing user
      const { username: storedUsername, pinHash } = JSON.parse(storedUser);
      if (username === storedUsername && mockHash(pin) === pinHash) {
        const currentUser = { username };
        setUser(currentUser);
        sessionStorage.setItem('finance-app-session', JSON.stringify(currentUser));
        router.replace('/dashboard');
      } else {
        throw new Error('Nom d\'utilisateur ou code PIN incorrect.');
      }
    } else {
      // Register new user
      const pinHash = mockHash(pin);
      const newUser = { username, pinHash };
      localStorage.setItem('finance-app-user', JSON.stringify(newUser));
      const currentUser = { username };
      setUser(currentUser);
      sessionStorage.setItem('finance-app-session', JSON.stringify(currentUser));
      router.replace('/dashboard');
    }
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('finance-app-session');
    router.replace('/login');
  }, [router]);

  const changePin = useCallback((username: string, oldPin: string, newPin: string) => {
    const storedUser = localStorage.getItem('finance-app-user');
    if (!storedUser) {
      throw new Error("Aucun utilisateur trouvé. Impossible de changer le PIN.");
    }
    const { username: storedUsername, pinHash } = JSON.parse(storedUser);
    if (username === storedUsername && mockHash(oldPin) === pinHash) {
        const updatedUser = { username, pinHash: mockHash(newPin) };
        localStorage.setItem('finance-app-user', JSON.stringify(updatedUser));
    } else {
        throw new Error("L'ancien code PIN est incorrect.");
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAuthLoading,
    login,
    logout,
    changePin
  }), [user, isAuthLoading, login, logout, changePin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
