import { useState, useEffect } from "react";
import { API, fetchWithAuth } from "../../../common/lib/endpoints";

interface DashboardStats {
  assignedOrdersCount: number;
  completedOrdersCount?: number;
}

interface AdminKpis {
  totalSoCount: number;
  totalSoCountPercentageChange: number;
  overdueSoCount: number;
  overdueSoCountPercentageChange: number;
  dispatchedSoCount: number;
  dispatchedSoCountPercentageChange: number;
}

interface TopStatusData {
  assignedOrdersCount: number;
  overdueOrdersCount: number;
  completedOrdersCount?: number;
}

export const useTopStatusCards = (dateStr?: string) => {
  const [data, setData] = useState<TopStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      try {
        if (isActive) {
          setLoading(true);
          setError(null);
        }

        const statsUrl = dateStr
          ? `${API.USER_DASHBOARD.STATS}?date=${encodeURIComponent(dateStr)}`
          : API.USER_DASHBOARD.STATS;

        const [statsResponse, kpisResponse] = await Promise.all([
          fetchWithAuth(statsUrl),
          fetchWithAuth(API.DASHBOARD.ADMIN_KPIS),
        ]);

        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch user stats: ${statsResponse.statusText}`);
        }
        if (!kpisResponse.ok) {
          throw new Error(`Failed to fetch admin KPIs: ${kpisResponse.statusText}`);
        }

        const statsData: DashboardStats = await statsResponse.json();
        const kpisData: AdminKpis = await kpisResponse.json();
        if (!isActive) return;
        setData({
          assignedOrdersCount: statsData.assignedOrdersCount ?? 0,
          completedOrdersCount: statsData.completedOrdersCount,
          overdueOrdersCount: kpisData.overdueSoCount ?? 0,
        });
      } catch (err: unknown) {
        if (!isActive) return;
        console.error("Error fetching top status cards data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, [dateStr]);

  return { data, loading, error };
};
