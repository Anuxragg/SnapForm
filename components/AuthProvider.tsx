'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import AuthModal from '@/components/auth/AuthModal';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth modal management state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
          try {
            localStorage.setItem('snapform_user', JSON.stringify(json.user));
          } catch {}
          return;
        }
      }
      // If not authenticated, clear user
      setUser(null);
      try {
        localStorage.removeItem('snapform_user');
      } catch {}
    } catch (err) {
      console.warn('Silent session check failed (anonymous state).');
    } finally {
      setLoading(false);
    }
  };

  // Check active session on mount & listen to cross-tab auth state changes
  useEffect(() => {
    // Optimistically hydrate cached user from localStorage for instant smooth UX
    try {
      const cached = localStorage.getItem('snapform_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {}

    checkSession();

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'snapform_user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {}
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        try {
          localStorage.setItem('snapform_user', JSON.stringify(data.user));
        } catch {}
        toast.success(`Welcome back, ${data.user.name}!`);
        closeAuthModal();
        return true;
      } else {
        toast.error(data.message || 'Login failed');
        return false;
      }
    } catch (err: any) {
      toast.error('Network error during login');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        try {
          localStorage.setItem('snapform_user', JSON.stringify(data.user));
        } catch {}
        toast.success(`Account created! Welcome, ${data.user.name}!`);
        closeAuthModal();
        return true;
      } else {
        toast.error(data.message || 'Registration failed');
        return false;
      }
    } catch (err: any) {
      toast.error('Network error during signup');
      return false;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setUser(null);
        try {
          localStorage.removeItem('snapform_user');
        } catch {}
        toast.success('Logged out successfully');
        // Redirect cleanly to login page
        window.location.href = '/login';
      }
    } catch (err) {
      toast.error('Failed to log out cleanly');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
        refreshSession: checkSession,
      }}
    >
      {children}
      <AuthModal />
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
