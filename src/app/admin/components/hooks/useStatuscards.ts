// src/app/admin/components/hooks/useStatusCards.ts
import { useEffect, useState } from "react";
import { API } from "../../../../common/lib/endpoints";
import { fetchWithAuth } from "../../../../common/lib/endpoints";
import { AdminKpisResponse, StatusCardData } from "../types/admin";

export const useStatusCards = () => {
  const [cards, setCards] = useState<StatusCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(API.DASHBOARD.ADMIN_KPIS);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} – Failed to fetch KPIs`);
      }

      const data: AdminKpisResponse = await res.json();

      const formattedCards: StatusCardData[] = [
        {
          title: "TOTAL SO COUNT",
          value: data.totalSoCount.toLocaleString("en-IN"),
          percentage: `${Math.abs(data.totalSoCountPercentageChange)}%`,
          isPositive: data.totalSoCountPercentageChange >= 0,
          iconType: "cart",
          iconColor: "text-blue-600",
        },
        {
          title: "DISPATCHED ORDERS",
          value: data.dispatchedSoCount.toLocaleString("en-IN"),
          percentage: `${Math.abs(data.dispatchedSoCountPercentageChange)}%`,
          isPositive: data.dispatchedSoCountPercentageChange >= 0,
          iconType: "truck",
          iconColor: "text-green-600",
        },
        {
          title: "OVERDUE ORDERS",
          value: data.overdueSoCount.toLocaleString("en-IN"),
          percentage: `${Math.abs(data.overdueSoCountPercentageChange)}%`,
          // lower overdue = positive trend
          isPositive: data.overdueSoCountPercentageChange <= 0,
          iconType: "alert",
          iconColor: "text-red-600",
        },
      ];

      setCards(formattedCards);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("useStatusCards →", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { cards, loading, error, refetch: fetchKpis };
};