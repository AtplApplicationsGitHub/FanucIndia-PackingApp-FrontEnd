// hooks/useOrdersByCustomer.ts
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/common/lib/endpoints";
import { API } from "@/common/lib/endpoints";

export type CustomerOrderItem = {
  name: string;
  count: number; // matches your API
};

type UseOrdersByCustomerReturn = {
  data: CustomerOrderItem[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useOrdersByCustomer(): UseOrdersByCustomerReturn {
  const [data, setData] = useState<CustomerOrderItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithAuth(API.DASHBOARD.ADMIN_ORDERS_BY_CUSTOMER);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const json: CustomerOrderItem[] = await res.json();

      // Sort descending by count
      json.sort((a, b) => b.count - a.count);

      setData(json);
    } catch (err: unknown) {
      console.error("[useOrdersByCustomer] Error:", err);

      const message =
        err instanceof Error ? err.message : "Failed to load orders by customer";

      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
