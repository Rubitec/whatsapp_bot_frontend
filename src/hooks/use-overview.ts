import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { OverviewData, OverviewResponse } from '@/types';

export function useOverview(from: string, to: string) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const res = await apiClient<OverviewResponse>(`/overview?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}
