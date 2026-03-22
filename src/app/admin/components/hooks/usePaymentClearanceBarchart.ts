import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";

export const usePaymentClearanceBarchart = (selectedDate: string) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (date: string) => {
    try {
      setLoading(true);
      const url = date ? `${API.DASHBOARD.ADMIN_PAYMENT_BY_ZONE}?date=${date}` : API.DASHBOARD.ADMIN_PAYMENT_BY_ZONE;
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error("Failed to fetch data");
      const json = await response.json();
      const transformedData = json.map((item: any) => ({
        zone: item.zoneName,
        cleared: item.paymentCleared,
        pending: item.paymentPending,
      }));
      setData(transformedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  return { data, loading, error, refetch: () => fetchData(selectedDate) };
};