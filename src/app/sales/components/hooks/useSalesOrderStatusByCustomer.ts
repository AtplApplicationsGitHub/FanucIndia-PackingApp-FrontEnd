import { useEffect, useState } from "react";
import { API_BASE_URL, fetchWithAuth } from "../../../../common/lib/endpoints";

export const useSalesOrderStatusByCustomer = (selectedDate: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatusByCustomer = async (date: string) => {
    try {
      setLoading(true);
      const url = date 
        ? `${API_BASE_URL}/dashboard/sales-status-by-customer?date=${date}` 
        : `${API_BASE_URL}/dashboard/sales-status-by-customer`;
      
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to fetch status by customer");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusByCustomer(selectedDate);
  }, [selectedDate]);

  return { data, loading, error, refetch: () => fetchStatusByCustomer(selectedDate) };
};