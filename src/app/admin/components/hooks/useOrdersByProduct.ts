// src/hooks/useOrdersByProduct.ts
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/common/lib/endpoints";
import { API } from "@/common/lib/endpoints"; // <-- Import your API constants!

export type OrderByProduct = {
  name: string;
  count: number;
};

type UseOrdersByProductResult = {
  data: OrderByProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useOrdersByProduct(): UseOrdersByProductResult {
  const [data, setData] = useState<OrderByProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // CORRECT WAY: Use the exact endpoint from your API object
      const res = await fetchWithAuth(API.DASHBOARD.ADMIN_ORDERS_BY_PRODUCT);

      if (!res.ok) {
        throw new Error(`Failed to fetch orders by product: ${res.status} ${res.statusText}`);
      }

      const json: OrderByProduct[] = await res.json();
      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
      console.error("[useOrdersByProduct] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}