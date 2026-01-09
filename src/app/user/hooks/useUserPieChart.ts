import { useState, useEffect, useCallback } from 'react';
import { API, fetchWithAuth } from '../../../common/lib/endpoints';

interface OrderStatusData {
  totalOrders: number;
  toBeIssuedCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
  dispatchedCount: number;
}

export function useSalesKpis() {
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(API.TERMINAL_USER_DASHBOARD.ORDER_STATUS_DISTRIBUTION);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order status data: ${response.statusText}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      console.error('Error fetching order status data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totalSoCount: data?.totalOrders ?? 0,
    loading,
    error,
    refetch: fetchData,
  };
}
