import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Missing VITE_API_URL');
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    let errorMessage = 'Request failed';
    try {
      const error = await res.json();
      errorMessage = error.error?.message || errorMessage;
    } catch {
      // Non-JSON error response
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
