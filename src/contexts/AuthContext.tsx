import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api';
import type { User, CompanyFull, MeResponse } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  company: CompanyFull | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await apiClient<MeResponse>('/me');
      setUser(res.data.user);
      setCompany(res.data.company);
    } catch {
      setUser(null);
      setCompany(null);
    }
  }, []);

  useEffect(() => {
    const initializeSession = async (session: Session | null) => {
      try {
        if (session?.access_token) {
          const { data: { user: authUser }, error } = await supabase.auth.getUser(session.access_token);

          if (error || !authUser || authUser.id !== session.user.id) {
            setUser(null);
            setSession(null);
            await supabase.auth.signOut();
            return;
          }

          await fetchMe();
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSessionChange = async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session);

      if (event === 'INITIAL_SESSION') {
        initializeSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCompany(null);
      } else if (event === 'TOKEN_REFRESHED') {
        // Session refreshed — no action needed
      } else if (event === 'USER_UPDATED') {
        await fetchMe();
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleSessionChange);

    return () => subscription.unsubscribe();
  }, [fetchMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      await fetchMe();
      navigate('/', { replace: true });
    } catch (error) {
      setUser(null);
      setSession(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMe, navigate]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setCompany(null);
  }, []);

  const refetchMe = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ session, user, company, isLoading, signIn, signOut, refetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
