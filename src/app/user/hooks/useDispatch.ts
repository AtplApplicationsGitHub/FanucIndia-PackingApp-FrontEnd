import { useState, useEffect, useCallback } from 'react';
import { API, fetchWithAuth } from '../../../common/lib/endpoints';

interface DispatchSummaryData {
  ordersToBeDispatched: number;
  readyForDispatchToday: number;
  ordersDispatchedToday: number;
}

export function useDispatchSummary() {
  const [data, setData] = useState<DispatchSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(API.TERMINAL_USER_DASHBOARD.TODAYS_DISPATCH);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch dispatch summary`);
      }
      
      const result: DispatchSummaryData = await response.json();
      setData(result);
    } catch (err: unknown) {
      console.error("Error fetching dispatch summary:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dispatch summary';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
