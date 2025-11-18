// hooks/useOrderZoneBarChart.ts
import { useEffect, useState } from "react";
import { API } from "@/common/lib/endpoints";
import { fetchWithAuth } from "@/common/lib/endpoints";

export interface ZoneStatus {
  zoneName: string;
  r105Count: number;     // Imported
  w105Count: number;     // Issued
  f105Count: number;     // Packed
  dispatchedCount: number;
}

interface UseOrderZoneBarChartResult {
  data: ZoneStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOrderZoneBarChart = (): UseOrderZoneBarChartResult => {
  const [data, setData] = useState<ZoneStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth(API.DASHBOARD.ADMIN_STATUS_BY_ZONE);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const result: ZoneStatus[] = await response.json();

      // Optional: Sort zones alphabetically or keep backend order
      const sorted = result.sort((a, b) => a.zoneName.localeCompare(b.zoneName));
      setData(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching zone status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};