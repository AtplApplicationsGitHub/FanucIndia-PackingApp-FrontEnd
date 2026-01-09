
import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export interface UserOrderImportItem {
  id: string | number;
  label: string;
  date: string;
  count: number;
  abbr: string;
  type: "today" | "yesterday" | "past";
}

export function useUserOrderImports() {
  const [data, setData] = useState<UserOrderImportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(API.TERMINAL_USER_DASHBOARD.ORDERS_CREATED);
      if (res.ok) {
        const apiData = await res.json();
        const transformed: UserOrderImportItem[] = apiData.map(
          (item: { dayLabel: string; date: string; count: number }, index: number) => {
            let type: "today" | "yesterday" | "past" = "past";
            const lowerLabel = item.dayLabel.toLowerCase();
            
            if (lowerLabel.includes("today")) {
              type = "today";
            } else if (lowerLabel.includes("yesterday")) {
              type = "yesterday";
            }

            let abbr = "Jan"; // Default fallback
            if (type === "today") {
              abbr = "TD";
            } else if (type === "yesterday") {
              abbr = "YD";
            } else {
              // Extract Month from date (e.g., "2026-01-06" -> "Jan")
              const dateObj = new Date(item.date);
              if (!isNaN(dateObj.getTime())) {
                abbr = dateObj.toLocaleString("en-US", { month: "short" });
              }
            }

            return {
              id: index, // unique key
              label: item.dayLabel,
              date: item.date,
              count: item.count,
              abbr,
              type,
            };
          }
        );
        setData(transformed);
      } else {
        console.error("Failed to fetch user order imports");
        setError("Failed to fetch data");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchImports,
  };
}
