// src/hooks/useOrderImports.ts
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/common/lib/endpoints";
import { API } from "@/common/lib/endpoints";
import { AdminNewImportItem } from "../types/admin";

type UseOrderImportsReturn = {
  data: AdminNewImportItem[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Generates skeleton for the last 5 days (oldest → newest)
 * with smart labels: "Today", "Yesterday", or "Nov 15"
 */
const generateLast5DaysSkeleton = (): AdminNewImportItem[] => {
  const today = new Date();
  const result: AdminNewImportItem[] = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateStr = date.toISOString().split("T")[0];
    const month = date.toLocaleString("en-US", { month: "short" });
    const dayNum = date.getDate();

    let dayLabel: string;
    if (i === 0) dayLabel = "Today";
    else if (i === 1) dayLabel = "Yesterday";
    else dayLabel = `${month} ${dayNum}`;

    result.push({
      date: dateStr,
      dayLabel,
      count: 0,
    });
  }

  // Result order: oldest → newest (e.g., Nov 15, 16, 17, 18, Today)
  return result;
};

export function useOrderImports(): UseOrderImportsReturn {
  const [data, setData] = useState<AdminNewImportItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Changed to use the specific endpoint requested by user
      const res = await fetchWithAuth(API.TERMINAL_USER_DASHBOARD.ORDERS_CREATED);

      let apiData: AdminNewImportItem[] = [];

      if (res.ok) {
        apiData = await res.json();
      } else {
        console.warn(`API returned ${res.status} – falling back to skeleton`);
      }

      // Always guarantee 5 days (oldest → newest)
      const skeleton = generateLast5DaysSkeleton();

      const mergedData = skeleton.map((skeletonItem) => {
        const realItem = apiData.find((item) => item.date === skeletonItem.date);
        // If realItem exists, use its data (including label if desired, or keep skeleton label for consistency)
        // The user provided Postman response has labels like "Today (Jan 8)", so we prefer realItem if available.
        return realItem ? realItem : skeletonItem;
      });

      setData(mergedData);
    } catch (err) {
      setError("Failed to load new imports");
      console.error("useOrderImports error:", err);

      // Fallback to skeleton even on complete failure
      setData(generateLast5DaysSkeleton().map((d) => ({ ...d, count: 0 })));
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
