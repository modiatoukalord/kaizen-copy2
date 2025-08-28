
'use client';

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByUsername, createUser, updateUserByUsername } from '@/lib/data';
import type { FirestoreUser } from '@/lib/types';

type User = {
  username: string;
  profilePictureUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (username: string, pin: string) => Promise<void>;
  logout: () => void;
  changePin: (oldPin: string, newPin: string) => Promise<void>;
  changeUsername: (newUsername: string, pin: string) => Promise<void>;
  changeProfilePicture: (url: string) => Promise<void>;
  isRegistering: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockHash = (pin: string) => `hashed-${pin}`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
        try {
          const sessionUserJson = sessionStorage.getItem('finance-app-session');
          if (sessionUserJson) {
            setUser(JSON.parse(sessionUserJson));
          } else {
             const checkUser = await getUserByUsername(null); 
             setIsRegistering(!checkUser);
          }
        } catch (error) {
          console.error("Failed to parse session user:", error);
          sessionStorage.removeItem('finance-app-session');
        } finally {
          setIsAuthLoading(false);
        }
    };
    checkUserStatus();
  }, []);
  
  const handleLoginSuccess = (userData: FirestoreUser) => {
    const currentUser: User = { 
        username: userData.username, 
        profilePictureUrl: userData.profilePictureUrl 
    };
    setUser(currentUser);
    sessionStorage.setItem('finance-app-session', JSON.stringify(currentUser));
    router.replace('/dashboard');
  };

  const login = useCallback(async (username: string, pin: string) => {
    const existingUser = await getUserByUsername(username);
    
    if (existingUser) {
      if (mockHash(pin) === existingUser.pinHash) {
        handleLoginSuccess(existingUser);
      } else {
        throw new Error('Nom d\'utilisateur ou code PIN incorrect.');
      }
    } else {
       const anyUser = await getUserByUsername(null);
       if (anyUser) {
            throw new Error('Nom d\'utilisateur ou code PIN incorrect.');
       } else {
            const pinHash = mockHash(pin);
            const userId = await createUser(username, pinHash);
            const newUser = await getUserByUsername(username);
            if (newUser) {
                handleLoginSuccess(newUser);
            } else {
                throw new Error("Échec de la création de l'utilisateur.");
            }
       }
    }
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('finance-app-session');
    router.replace('/login');
  }, [router]);

  const changePin = useCallback(async (oldPin: string, newPin: string) => {
    if (!user) throw new Error("Utilisateur non connecté.");
    
    const storedUser = await getUserByUsername(user.username);
    if (!storedUser) throw new Error("Utilisateur non trouvé.");
    
    if (mockHash(oldPin) === storedUser.pinHash) {
        const newPinHash = mockHash(newPin);
        await updateUserByUsername(user.username, { pinHash: newPinHash });
    } else {
        throw new Error("L'ancien code PIN est incorrect.");
    }
  }, [user]);
  
  const changeUsername = useCallback(async (newUsername: string, pin: string) => {
    if (!user) throw new Error("Utilisateur non connecté.");

    const storedUser = await getUserByUsername(user.username);
    if (!storedUser) throw new Error("Utilisateur non trouvé.");

    if (mockHash(pin) !== storedUser.pinHash) {
      throw new Error("Le code PIN est incorrect.");
    }
    
    const newUsernameExists = await getUserByUsername(newUsername);
    if (newUsernameExists) {
        throw new Error("Ce nom d'utilisateur est déjà pris.");
    }

    await updateUserByUsername(user.username, { username: newUsername });
    const updatedUser: User = { ...user, username: newUsername };
    setUser(updatedUser);
    sessionStorage.setItem('finance-app-session', JSON.stringify(updatedUser));
  }, [user]);

  const changeProfilePicture = useCallback(async (url: string) => {
    if (!user) throw new Error("Utilisateur non connecté.");

    await updateUserByUsername(user.username, { profilePictureUrl: url });
    const updatedUser: User = { ...user, profilePictureUrl: url };
    setUser(updatedUser);
    sessionStorage.setItem('finance-app-session', JSON.stringify(updatedUser));
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAuthLoading,
    isRegistering,
    login,
    logout,
    changePin,
    changeUsername,
    changeProfilePicture,
  }), [user, isAuthLoading, isRegistering, login, logout, changePin, changeUsername, changeProfilePicture]);

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
