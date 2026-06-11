"use client";

import { useCallback, useEffect, useState } from "react";
import {
  API,
  fetchWithAuth,
  ManualFgLocationQuery,
} from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";

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
  totalCount?: number;
  data?:
    | unknown[]
    | {
        count?: number;
        totalCount?: number;
        data?: unknown[];
        items?: unknown[];
        rows?: unknown[];
        reportData?: unknown[];
      };
  items?: unknown[];
  rows?: unknown[];
  reportData?: unknown[];
};

function normalizeRow(item: Record<string, any>): ManualFgStorageRow {
  return {
    id: Number(item.id ?? item.ID ?? item.manualFgLocationId ?? 0),
    salesOrderNumber:
      item.salesOrderNumber ?? item.saleOrderNumber ?? item.soNumber ?? "",
    fgLocation: item.fgLocation ?? item.location ?? "",
    user: item.user ?? item.username ?? item.updatedBy ?? item.createdBy ?? "-",
    dateTime: item.dateTime ?? item.createdAt ?? item.updatedAt ?? "",
  };
}

function extractRows(json: ManualFgStorageResponse | unknown[]): unknown[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.rows)) return json.rows;
  if (Array.isArray(json.items)) return json.items;
  if (Array.isArray(json.reportData)) return json.reportData;
  if (Array.isArray(json.data)) return json.data;
  if (json.data && !Array.isArray(json.data)) {
    if (Array.isArray(json.data.data)) return json.data.data;
    if (Array.isArray(json.data.items)) return json.data.items;
    if (Array.isArray(json.data.rows)) return json.data.rows;
    if (Array.isArray(json.data.reportData)) return json.data.reportData;
  }
  return [];
}

function extractCount(json: ManualFgStorageResponse, fallback: number) {
  if (typeof json.count === "number") return json.count;
  if (typeof json.totalCount === "number") return json.totalCount;
  if (json.data && !Array.isArray(json.data)) {
    if (typeof json.data.count === "number") return json.data.count;
    if (typeof json.data.totalCount === "number") return json.data.totalCount;
  }
  return fallback;
}

function getDownloadFilename(response: Response, fallback: string) {
  const disposition = response.headers.get("content-disposition");
  const encodedMatch = disposition?.match(/filename\*=UTF-8''([^;]+)/i);
  const plainMatch = disposition?.match(/filename="?([^"]+)"?/i);
  const filename = encodedMatch?.[1] ?? plainMatch?.[1];
  return filename ? decodeURIComponent(filename) : fallback;
}

function getExcelFilename(filters: ManualFgLocationQuery) {
  const datePart = filters.date || new Date().toISOString().slice(0, 10);
  const soPart = filters.salesOrderNumber
    ? `-${filters.salesOrderNumber.replace(/[^a-zA-Z0-9_-]+/g, "_")}`
    : "";
  return `manual-fg-location-${datePart}${soPart}.xlsx`;
}

export async function downloadManualFgLocationExcel(
  filters: ManualFgLocationQuery = {},
) {
  const res = await fetchWithAuth(
    API.FG_STORAGE.MANUAL_DOWNLOAD_EXCEL(filters),
  );

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return;
  }

  if (!res.ok) throw new Error("Failed to download manual FG location Excel");

  const blob = await res.blob();
  secureDownload(blob, getDownloadFilename(res, getExcelFilename(filters)));
}

export function useManualFgStorageList(filters: ManualFgLocationQuery = {}) {
  const [rows, setRows] = useState<ManualFgStorageRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromDate = filters.fromDate;
  const toDate = filters.toDate;
  const salesOrderNumber = filters.salesOrderNumber?.trim() || undefined;

  const fetchData = useCallback(
    async (isSilent = false) => {
      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await fetchWithAuth(
          API.FG_STORAGE.MANUAL_LIST({ fromDate, toDate, salesOrderNumber }),
        );

        if (res.status === 401 || res.status === 403) {
          if (typeof window !== "undefined") window.location.href = "/login";
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch manual FG location list");

        const json = (await res.json()) as ManualFgStorageResponse;
        const data = extractRows(json);
        const normalizedRows = data.map((item) =>
          normalizeRow(item as Record<string, any>),
        );

        setRows(normalizedRows);
        setTotalCount(extractCount(json, normalizedRows.length));
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load manual FG location list",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fromDate, toDate, salesOrderNumber],
  );

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
