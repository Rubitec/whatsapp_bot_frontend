import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api';
import type { User, CompanyFull, MeResponse } from '@/types';

interface AuthContextType {
  authenticated: boolean;
  user: User | null;
  company: CompanyFull | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [loading, setLoading] = useState(true);

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
    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setAuthenticated(true);
        await fetchMe();
      }
      setLoading(false);
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setAuthenticated(true);
        if (event === 'SIGNED_IN') {
          await fetchMe();
        }
      } else {
        setAuthenticated(false);
        setUser(null);
        setCompany(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
    setUser(null);
    setCompany(null);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, user, company, loading, signIn, signOut, refetchMe: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
