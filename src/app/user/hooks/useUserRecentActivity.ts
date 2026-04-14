import { useState, useEffect, useCallback } from "react";
import { API, fetchWithAuth } from "../../../common/lib/endpoints";

export interface RecentActivityItem {
  id: string;
  text: string;
  timestamp: string;
  type: string;
}

export function useUserRecentActivity() {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(API.TERMINAL_USER_DASHBOARD.RECENT_ACTIVITY);

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }

        const data: RecentActivityItem[] = await response.json();
        setActivities(data);
      } catch (err) {
        console.error("Error fetching recent activities:", err);
        setError("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return { activities, loading, error };
}
