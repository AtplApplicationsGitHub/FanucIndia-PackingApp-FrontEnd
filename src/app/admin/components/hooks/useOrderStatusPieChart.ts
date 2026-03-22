import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import { AdminOverallStatusDto } from "../types/admin";

export const useOrderOverallStatus = (selectedDate: string) => {
  const [data, setData] = useState<AdminOverallStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (date: string) => {
    try {
      setLoading(true);
      const url = date ? `${API.DASHBOARD.ADMIN_OVERALL_STATUS}?date=${date}` : API.DASHBOARD.ADMIN_OVERALL_STATUS;
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to fetch overall status");
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
    fetchStatus(selectedDate);
  }, [selectedDate]);

  return { data, loading, error, refetch: () => fetchStatus(selectedDate) };
};