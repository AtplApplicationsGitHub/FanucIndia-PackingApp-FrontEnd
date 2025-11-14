// hooks/useSalesKpis.ts
import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import { SalesKpisResponse } from "../types/sales";

export function useSalesKpis() {
  const [data, setData] = useState<SalesKpisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadKpis() {
    try {
      const res = await fetchWithAuth(API.DASHBOARD.SALES_KPIS);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json: SalesKpisResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load KPIs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKpis();
  }, []);

  /*  
   ----------------------------------------------------------
   FIXED: totalSoCount NOW TAKEN DIRECTLY FROM API FIELD  
   ----------------------------------------------------------
  */
  const totalSoCount = data?.totalSoCount ?? 0;

  return {
    data,
    totalSoCount,
    loading,
    error,
    refetch: loadKpis,
  };
}
