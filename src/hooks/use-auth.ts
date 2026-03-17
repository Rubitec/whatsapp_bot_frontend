import { useState, useCallback } from 'react';
import { login as apiLogin } from '@/lib/api';
import { clearTokens, isAuthenticated } from '@/lib/auth-store';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const signIn = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
    setAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    setAuthenticated(false);
  }, []);

  return { authenticated, signIn, signOut };
}
