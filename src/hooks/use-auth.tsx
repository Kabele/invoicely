
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthInstance } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import type { User, Auth } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, pass: string) => Promise<any>;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<any>;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  getAuthToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAuthInstance().then(async (authInstance) => {
        setAuth(authInstance);
        const { onAuthStateChanged } = await import('firebase/auth');
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    });
  }, []);

  const signup = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth not initialized");
    const { signOut } = await import('firebase/auth');
    router.push('/login');
    return signOut(auth);
  };

  const getAuthToken = async () => {
    if (!auth?.currentUser) return null;
    const { getIdToken } = await import('firebase/auth');
    return getIdToken(auth.currentUser);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    