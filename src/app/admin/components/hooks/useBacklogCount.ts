import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";

interface BacklogOrder {
  saleOrderNumber: string;
  outboundDelivery: string;
  customerName: string | null;
  paymentClearance: boolean;
}

interface BacklogItem {
  date: string;
  dayLabel: string;
  count: number;
  orders: BacklogOrder[];
}

interface BacklogCount {
  totalBacklog: number;
  breakdown: BacklogItem[];
}

export const useBacklogCount = (date?: string) => {
  const [data, setData] = useState<BacklogCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    try {
      setLoading(true);
      const url = API.DASHBOARD.ADMIN_BACKLOG_COUNT(date);
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to fetch backlog count");
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
    fetchCount();
  }, [date]);

  return { data, loading, error, refetch: fetchCount };
};
