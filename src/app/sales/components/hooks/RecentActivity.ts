// src/hooks/useRecentActivity.ts
import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "../../../../common/lib/endpoints";
import { API } from "../../../../common/lib/endpoints";
import { SalesActivity } from "../types/sales";

export interface ActivityWithMeta extends SalesActivity {
  timeAgo: string;
  config: {
    label: string;
    bg: string;
    text: string;
    icon: string;
  };
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<ActivityWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: format ISO timestamp → "2 hours ago", "Yesterday", etc.
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? "s" : ""} ago`;
    if (diffInDays < 2) return "Yesterday";
    if (diffInDays < 7) return `${Math.floor(diffInDays)} days ago`;
    return date.toLocaleDateString();
  };

  // Status styling map
  const getStatusConfig = (status: string) => {
    const map: Record<string, ActivityWithMeta["config"]> = {
      Created: { label: "Created", bg: "bg-blue-50", text: "text-blue-700", icon: "+" },
      Packed: { label: "Packed", bg: "bg-amber-50", text: "text-amber-700", icon: "Package" },
      "Ready for Dispatch": { label: "Ready for Dispatch", bg: "bg-emerald-50", text: "text-emerald-700", icon: "Check" }, // UPDATED KEY
      Dispatched: { label: "Dispatched", bg: "bg-purple-50", text: "text-purple-700", icon: "Truck" },
    };
    return map[status] || { label: status, bg: "bg-gray-50", text: "text-gray-700", icon: "?" };
  };

  // fetchActivity is stable so refetch can call it directly
  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithAuth(API.DASHBOARD.SALES_ACTIVITY);

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (res.status === 403) throw new Error("You don't have permission to view this data.");
        throw new Error(`Failed to load activity (${res.status})`);
      }

      const data: SalesActivity[] = await res.json();

      const enriched: ActivityWithMeta[] = data.map((item) => ({
        ...item,
        timeAgo: formatTimeAgo(new Date(item.activityTimestamp)),
        config: getStatusConfig(item.status),
      }));

      setActivities(enriched);
    } catch (err: unknown) {
      // Narrow unknown -> Error or fallback to string
      const message = err instanceof Error ? err.message : String(err ?? "Something went wrong");
      console.error("useRecentActivity error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    fetchActivity();
  }, [fetchActivity]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivity, // call to re-run the fetch immediately
  };
}