// app/admin/components/admindashboard/hooks/useDispatchSummary.ts
import { useEffect, useState } from "react";
import { API } from "../../../../common/lib/endpoints";
import { fetchWithAuth } from "../../../../common/lib/endpoints";

interface DispatchSummaryData {
  ordersToBeDispatched: number;
  ordersDispatchedToday: number;
}

interface UseDispatchSummaryReturn {
  data: DispatchSummaryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDispatchSummary = (): UseDispatchSummaryReturn => {
  const [data, setData] = useState<DispatchSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth(API.DASHBOARD.ADMIN_DISPATCH_SUMMARY);

      if (!response.ok) {
        throw new Error(`Failed to fetch dispatch summary: ${response.status}`);
      }

      const result: DispatchSummaryData = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Dispatch Summary Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};