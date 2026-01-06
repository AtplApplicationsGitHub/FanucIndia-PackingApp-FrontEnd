import { useState, useEffect } from "react";

export interface ActivityItem {
  salesOrderNumber: string;
  activityTimestamp: string;
  status: string;
  timeAgo: string;
}

export function useUserRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with dummy data
    const timer = setTimeout(() => {
      try {
        const dummyData: ActivityItem[] = [
          {
            salesOrderNumber: "SO-90876",
            activityTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            status: "Packed",
            timeAgo: "30 mins ago",
          },
          {
            salesOrderNumber: "SO-90877",
            activityTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            status: "Issue reported",
            timeAgo: "2 hours ago",
          },
          {
            salesOrderNumber: "SO-90878",
            activityTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            status: "Dispatched",
            timeAgo: "5 hours ago",
          },
          {
            salesOrderNumber: "SO-90879",
            activityTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            status: "Moved to FG location",
            timeAgo: "1 day ago",
          },
          {
            salesOrderNumber: "SO-90880",
            activityTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            status: "Issue found",
            timeAgo: "2 days ago",
          },
        ];
        
        setActivities(dummyData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load activities");
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { activities, loading, error };
}
