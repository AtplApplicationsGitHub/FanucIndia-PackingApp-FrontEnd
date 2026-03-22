import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import type { StatusCardData } from "../types/admin";

export const useStatusCards = (selectedDate: string) => {
  const [cards, setCards] = useState<StatusCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = async (date: string) => {
    try {
      setLoading(true);
      const url = date ? `${API.DASHBOARD.ADMIN_KPIS}?date=${date}` : API.DASHBOARD.ADMIN_KPIS;
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to fetch KPIs");
      const data = await res.json();

      const formattedCards: StatusCardData[] = [
        {
          title: "Total Order Count",
          value: data.totalSoCount.toLocaleString(),
          percentage: `${Math.abs(data.totalSoCountPercentageChange)}%`,
          isPositive: data.totalSoCountPercentageChange >= 0,
          iconType: "cart",
          iconColor: "text-blue-500 dark:text-blue-400",
        },
        {
          title: "Dispatched Orders",
          value: data.dispatchedSoCount.toLocaleString(),
          percentage: `${Math.abs(data.dispatchedSoCountPercentageChange)}%`,
          isPositive: data.dispatchedSoCountPercentageChange >= 0,
          iconType: "truck",
          iconColor: "text-green-500 dark:text-green-400",
        },
        {
          title: "Overdue Orders",
          value: data.overdueSoCount.toLocaleString(),
          percentage: `${Math.abs(data.overdueSoCountPercentageChange)}%`,
          isPositive: data.overdueSoCountPercentageChange <= 0, // Less overdue is positive
          iconType: "alert",
          iconColor: "text-red-500 dark:text-red-400",
        },
      ];
      setCards(formattedCards);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis(selectedDate);
  }, [selectedDate]);

  return { cards, loading, error, refetch: () => fetchKpis(selectedDate) };
};