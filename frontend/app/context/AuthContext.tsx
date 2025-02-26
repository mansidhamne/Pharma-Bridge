// /frontend/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await api.get<User>('/api/auth/me');
      setState(prev => ({ ...prev, user: data }));
    } catch (error) {
      setState(prev => ({ ...prev, user: null }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    const { data } = await api.post<{ user: User }>('/api/auth/signup', {
      username,
      email,
      password,
    });
    setState(prev => ({ ...prev, user: data.user }));
    router.push('/dashboard');
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ user: User }>('/api/auth/login', {
      email,
      password,
    });
    setState(prev => ({ ...prev, user: data.user }));
    router.push('/dashboard');
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setState(prev => ({ ...prev, user: null }));
    router.push('/login');
  };

  const value = {
    ...state,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}