// hooks/useSalesKpis.ts
import { useEffect, useState, useCallback } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import { SalesKpisResponse } from "../types/sales";

function getErrorMessage(err: unknown, fallback = "Failed to load KPIs"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    // attempt to stringify other shapes (e.g. objects)
    const str = JSON.stringify(err);
    return str === "{}" ? fallback : str;
  } catch {
    return fallback;
  }
}

export function useSalesKpis() {
  const [data, setData] = useState<SalesKpisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKpis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth(API.DASHBOARD.SALES_KPIS);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json: SalesKpisResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKpis();
  }, [loadKpis]);

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
