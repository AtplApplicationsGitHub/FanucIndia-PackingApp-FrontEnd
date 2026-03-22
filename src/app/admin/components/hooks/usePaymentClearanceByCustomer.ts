import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import { AdminPaymentByCustomerDto } from "../types/admin";

export const usePaymentClearanceByCustomer = (selectedDate: string) => {
  const [data, setData] = useState<AdminPaymentByCustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentByCustomer = async (date: string) => {
    try {
      setLoading(true);
      const url = date ? `${API.DASHBOARD.ADMIN_PAYMENT_BY_CUSTOMER}?date=${date}` : API.DASHBOARD.ADMIN_PAYMENT_BY_CUSTOMER;
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to fetch payment by customer");
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
    fetchPaymentByCustomer(selectedDate);
  }, [selectedDate]);

  return { data, loading, error, refetch: () => fetchPaymentByCustomer(selectedDate) };
};