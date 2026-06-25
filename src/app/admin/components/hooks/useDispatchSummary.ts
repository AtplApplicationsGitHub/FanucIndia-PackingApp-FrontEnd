import { useEffect, useState } from "react";
import { API } from "../../../../common/lib/endpoints";
import { fetchWithAuth } from "../../../../common/lib/endpoints";
interface FgLocationOrder {
  saleOrderNumber: string;
  outboundDelivery: string | null;
  location: unknown;
}
interface DispatchSummaryData {
  ordersToBeDispatched: number;
  ordersToBeDispatchedPaymentCleared: number;
  readyForDispatchToday: number;
  ordersDispatchedToday: number;
  fgLocationCount: number;
  fgLocationOrders: FgLocationOrder[];
}
interface UseDispatchSummaryReturn {
  data: DispatchSummaryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Update the hook to accept an optional date parameter
export const useDispatchSummary = (date?: string): UseDispatchSummaryReturn => {
  const [data, setData] = useState<DispatchSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Append the date query parameter if provided
      const url = new URL(
        API.DASHBOARD.ADMIN_DISPATCH_SUMMARY,
        window.location.origin,
      );
      if (date) {
        url.searchParams.append("date", date);
      }

      const response = await fetchWithAuth(url.toString());

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
  }, [date]); // Add date as a dependency so it refetches when the date changes

  return { data, loading, error, refetch: fetchData };
};
