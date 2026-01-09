import { useState, useEffect } from "react";
import { API, fetchWithAuth } from "../../../common/lib/endpoints";

interface DashboardStats {
  assignedOrdersCount: number;
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
}

export const useTopStatusCards = () => {
  const [data, setData] = useState<TopStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, kpisResponse] = await Promise.all([
          fetchWithAuth(API.USER_DASHBOARD.STATS),
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
  }, []);

  return { data, loading, error };
};
