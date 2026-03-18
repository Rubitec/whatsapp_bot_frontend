import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const API_URL = import.meta.env.VITE_API_URL;

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<'loading' | 'complete' | 'incomplete'>('loading');

  useEffect(() => {
    if (loading || !session) return;

    fetch(`${API_URL}/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => {
        setProfileStatus(res.ok ? 'complete' : 'incomplete');
      })
      .catch(() => setProfileStatus('incomplete'));
  }, [session, loading]);

  if (loading || (session && profileStatus === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profileStatus === 'incomplete') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
