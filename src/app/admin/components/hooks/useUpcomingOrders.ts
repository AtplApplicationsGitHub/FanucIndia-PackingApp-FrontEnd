import { useEffect, useState } from "react";
import { API } from "../../../../common/lib/endpoints";
import { fetchWithAuth } from "../../../../common/lib/endpoints";

export interface UpcomingOrderData {
  dayLabel: string;
  date: string;
  count: number;
}

export const useUpcomingOrders = () => {
  const [data, setData] = useState<UpcomingOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(API.DASHBOARD.ADMIN_UPCOMING_ORDERS);
        if (!res.ok) throw new Error("Failed to fetch upcoming orders");
        
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  return { data, loading, error };
};