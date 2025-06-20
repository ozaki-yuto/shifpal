import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'admin' | 'staff') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear invalid session data
  const clearSession = async () => {
    setUser(null);
    setSession(null);
    setLoading(false);
    // Clear any stored session data without making API calls
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  };

  useEffect(() => {
    // Set loading to false immediately to show login page
    setLoading(false);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_OUT' || !session || event === 'TOKEN_REFRESHED' && !session) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        clearSession();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
        setLoading(false);
      } else {
        if (data && data.length > 0) {
          setUser({
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            role: data[0].role
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('メールアドレスまたはパスワードが正しくありません');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('メールアドレスの確認が完了していません');
      } else {
        throw new Error('ログインに失敗しました。しばらく時間をおいて再度お試しください。');
      }
    }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'admin' | 'staff') => {
    setLoading(true);
    try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email,
          role,
        });

      if (profileError) {
        throw profileError;
      }
    }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out error:', error.message);
    }
    } finally {
      clearSession();
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}