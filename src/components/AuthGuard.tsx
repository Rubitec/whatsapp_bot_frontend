import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<'loading' | 'complete' | 'incomplete'>('loading');

  useEffect(() => {
    if (loading || !session) return;

    apiClient('/profile')
      .then(() => setProfileStatus('complete'))
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
