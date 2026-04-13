import { useEffect, useState } from "react";
import { API } from "../../../../common/lib/endpoints";
import { SalesKPIsResponse } from "../types/sales";
import { fetchWithAuth } from "../../../../common/lib/endpoints";

export function useSalesDashboard() {
  const [data, setData] = useState<SalesKPIsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchWithAuth(API.DASHBOARD.SALES_KPIS);
        if (!res.ok) throw new Error("Failed to fetch KPIs");
        const json: SalesKPIsResponse = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error, refetch: () => setLoading(true) };
}