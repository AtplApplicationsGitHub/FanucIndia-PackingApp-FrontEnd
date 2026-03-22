import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";

export interface ZoneStatus {
  zoneName: string;
  toBeIssuedCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
  dispatchedCount: number;
}

export const useOrderZoneBarChart = (selectedDate: string) => {
  const [data, setData] = useState<ZoneStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (date: string) => {
    try {
      setLoading(true);
      const url = date ? `${API.DASHBOARD.ADMIN_STATUS_BY_ZONE}?date=${date}` : API.DASHBOARD.ADMIN_STATUS_BY_ZONE;
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error("Failed to fetch data");
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  return { data, loading, error, refetch: () => fetchData(selectedDate) };
};