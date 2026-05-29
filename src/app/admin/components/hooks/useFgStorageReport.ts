"use client";
import { useState, useEffect, useCallback } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export type FgStorageReportRow = {
    fgLocation: string | null;
    saleOrderNumber: string;
    user: string;
    outboundDelivery: string;
    LastUpdatedBy: string;
    dateTime: string;
    durationText: string;
};

function normalizeRow(item: any): FgStorageReportRow {
    return {
        fgLocation: item.fgLocation ?? null,
        saleOrderNumber: item.saleOrderNumber ?? item.salesOrderNumber ?? "",
        user: item.user ?? item.LastUpdatedBy ?? "-",
        outboundDelivery: item.outboundDelivery ?? "",
        LastUpdatedBy: item.LastUpdatedBy === "Unknown" ? "-" : (item.LastUpdatedBy ?? "-"),
        dateTime: item.dateTime ?? "",
        durationText: item.durationText ?? "-",
    };
}

export function useFgStorageReport(page: number, rowsPerPage: number, search: string) {
    const [rows, setRows] = useState<FgStorageReportRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const url = API.ADMIN.FG_STORAGE_REPORT({
                page: page + 1,    
                limit: rowsPerPage,
                search: search || undefined,
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
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load FG Storage Report");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, rowsPerPage, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { rows, totalCount, loading, refreshing, error, refresh: fetchData };
}
