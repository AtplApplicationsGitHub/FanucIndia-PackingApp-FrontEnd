"use client";

import { useCallback, useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export type ManualFgStorageRow = {
  id: number;
  salesOrderNumber: string;
  fgLocation: string;
  user: string;
  dateTime: string;
};

type ManualFgStorageResponse = {
  message?: string;
  count?: number;
  data?: unknown[];
};

function normalizeRow(item: any): ManualFgStorageRow {
  return {
    id: Number(item.id ?? 0),
    salesOrderNumber: item.salesOrderNumber ?? item.saleOrderNumber ?? "",
    fgLocation: item.fgLocation ?? "",
    user: item.user ?? "-",
    dateTime: item.dateTime ?? "",
  };
}

export function useManualFgStorageList() {
  const [rows, setRows] = useState<ManualFgStorageRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isSilent = false) => {
    if (isSilent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetchWithAuth(API.FG_STORAGE.MANUAL_LIST);

      if (res.status === 401 || res.status === 403) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch manual FG storage list");

      const json = (await res.json()) as ManualFgStorageResponse;
      const data = Array.isArray(json.data) ? json.data : [];
      const normalizedRows = data.map(normalizeRow);

      setRows(normalizedRows);
      setTotalCount(json.count ?? normalizedRows.length);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load manual FG storage list",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    rows,
    totalCount,
    loading,
    refreshing,
    error,
    refresh: fetchData,
  };
}
