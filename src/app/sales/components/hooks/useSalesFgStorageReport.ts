"use client";
import { useState, useEffect, useCallback } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export type SalesFgStorageReportRow = {
  fgLocation: string | null;
  saleOrderNumber: string;
  outboundDelivery: string;
  LastUpdatedBy: string;
  dateTime: string;
  durationText: string;
  durationDays: number;
  salesZoneName: string;
  customerName: string;
};

export type AgeCounts = {
  age0to3Months: number;
  age3to6Months: number;
  age6to12Months: number;
  ageAbove12Months: number;
};

function normalizeRow(item: any): SalesFgStorageReportRow {
  return {
    fgLocation: item.fgLocation ?? null,
    saleOrderNumber: item.saleOrderNumber ?? "",
    outboundDelivery: item.outboundDelivery ?? "",
    LastUpdatedBy: item.LastUpdatedBy === "Unknown" ? "-" : (item.LastUpdatedBy ?? "-"),
    dateTime: item.dateTime ?? "",
    durationText: item.durationText ?? "-",
    durationDays: item.durationDays ?? 0,
    salesZoneName: item.salesZoneName ?? "-",
    customerName: item.customerName ?? "-",
  };
}

export function useSalesFgStorageReport(
  page: number,
  rowsPerPage: number,
  search: string,
  ageFilter?: string,
) {
  const [rows, setRows] = useState<SalesFgStorageReportRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ageCounts, setAgeCounts] = useState<AgeCounts>({
    age0to3Months: 0,
    age3to6Months: 0,
    age6to12Months: 0,
    ageAbove12Months: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = API.SALES.SALES_FG_STORAGE_REPORT({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        ageFilter: ageFilter || undefined,
      });

      const res = await fetchWithAuth(url);
      if (res.status === 401 || res.status === 403) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch FG Storage Report");

      const json = await res.json();
      const reportData = json.data?.reportData ?? [];
      setRows(reportData.map(normalizeRow));
      setTotalCount(json.data?.totalOrders ?? 0);
      if (json.data?.ageCounts) setAgeCounts(json.data.ageCounts);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load FG Storage Report");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, ageFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rows, totalCount, loading, error, ageCounts };
}