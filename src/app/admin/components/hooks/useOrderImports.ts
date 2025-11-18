// hooks/useOrderImports.ts
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/common/lib/endpoints";
import { AdminNewImportItem } from "../types/admin";

type UseOrderImportsReturn = {
  data: AdminNewImportItem[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const generateLast5Days = (): AdminNewImportItem[] => {
  const today = new Date();
  const result: AdminNewImportItem[] = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateStr = date.toISOString().split("T")[0];
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();

    let dayLabel = `${month} ${day}`;
    if (i === 0) dayLabel = `Today (Nov ${day})`;
    if (i === 1) dayLabel = `Yesterday (Nov ${day})`;

    result.push({
      date: dateStr,
      dayLabel,
      count: 0, // will be overridden by API if successful
    });
  }

  return result.reverse(); // oldest first → newest on top
};

export function useOrderImports(): UseOrderImportsReturn {
  const [data, setData] = useState<AdminNewImportItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithAuth("/dashboard/admin-new-imports", {
        method: "GET",
      });

      let apiData: AdminNewImportItem[] = [];

      if (res.ok) {
        apiData = await res.json();
      } else {
        console.warn("API failed, falling back to last 5 days skeleton");
      }

      // Merge API data with last 5 days structure
      const skeleton = generateLast5Days();
      const merged = skeleton.map((item) => {
        const found = apiData.find((a) => a.date === item.date);
        return found ? { ...item, count: found.count } : item;
      });

      setData(merged);
    } catch (err: unknown) { 
      setError("Failed to load import stats");
      console.error("useOrderImports error:", err);

      setData(generateLast5Days().map((d) => ({ ...d, count: 0 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  return { data, loading, error, refetch: fetchImports };
}