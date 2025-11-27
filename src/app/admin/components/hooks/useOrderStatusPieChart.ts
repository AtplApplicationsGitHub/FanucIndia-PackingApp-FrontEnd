import { useEffect, useState } from "react";
import { API } from "@/common/lib/endpoints";
import { fetchWithAuth } from "@/common/lib/endpoints";

export type OrderOverallStatus = {
  toBeIssuedCount: number;
  r105Count: number;       
  w105Count: number;      
  f105Count: number;       
  dispatchedCount: number; 
  totalOrders: number;    
};

type UseOrderOverallStatus = {
  data: OrderOverallStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useOrderOverallStatus(): UseOrderOverallStatus {
  const [data, setData] = useState<OrderOverallStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithAuth(API.DASHBOARD.ADMIN_OVERALL_STATUS);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();

      const normalized: OrderOverallStatus = {
        r105Count: json.r105Count ?? 0,
        w105Count: json.w105Count ?? 0,
        f105Count: json.f105Count ?? 0,
        toBeIssuedCount: json.toBeIssuedCount ?? 0,
        dispatchedCount: json.dispatchedCount ?? 0,
        totalOrders: json.totalOrders ?? 0,
      };

      setData(normalized);
    } catch (err: unknown) { 
      console.error("[useOrderOverallStatus] Error:", err);
      const message = err instanceof Error ? err.message : "Failed to load order status";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}