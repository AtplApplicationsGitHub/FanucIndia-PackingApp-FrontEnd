import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";

interface BinCounts {
  oneBinCount: number;
  twoToThreeBinCount: number;
  fourPlusBinCount: number;
}

export const useBinCounts = (date?: string) => {
  const [data, setData] = useState<BinCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const url = API.DASHBOARD.ADMIN_BIN_COUNTS(date);
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to fetch bin counts");
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
    fetchCounts();
  }, [date]);

  return { data, loading, error, refetch: fetchCounts };
};