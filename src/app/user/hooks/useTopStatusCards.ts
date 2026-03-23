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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsUrl = dateStr 
          ? `${API.USER_DASHBOARD.STATS}?date=${dateStr}` 
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

        setData({
          assignedOrdersCount: statsData.assignedOrdersCount ?? 0,
          completedOrdersCount: statsData.completedOrdersCount,
          overdueOrdersCount: kpisData.overdueSoCount ?? 0,
        });
      } catch (err) {
        console.error("Error fetching top status cards data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateStr]);

  return { data, loading, error };
};
