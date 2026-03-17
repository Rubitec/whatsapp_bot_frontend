import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth-store';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Missing VITE_API_URL');
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    // Try refreshing the token
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getAccessToken();
      const retryRes = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(newToken && { Authorization: `Bearer ${newToken}` }),
          ...options?.headers,
        },
      });

      if (retryRes.ok) {
        return retryRes.json();
      }
    }

    // Refresh failed — clear tokens and redirect
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
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

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let errorMessage = 'Login failed';
    try {
      const error = await res.json();
      errorMessage = error.error?.message || errorMessage;
    } catch {
      // Non-JSON error response
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
}
