import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import { AdminStatusByCustomerDto } from "../types/admin";

export const useOrderStatusByCustomer = (selectedDate: string) => {
  const [data, setData] = useState<AdminStatusByCustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatusByCustomer = async (date: string) => {
    try {
      setLoading(true);
      const url = date ? `${API.DASHBOARD.ADMIN_STATUS_BY_CUSTOMER}?date=${date}` : API.DASHBOARD.ADMIN_STATUS_BY_CUSTOMER;
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