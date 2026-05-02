"use client";
import { useState, useEffect, useCallback } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export type TimelineState = "completed" | "pending" | "upcoming";

export interface TimelineNode {
  key: string;
  label: string;
  state: TimelineState;
}

export type ReportRow = {
    rowIndex: number;
    saleOrderNumber: string;
    outboundDelivery: string;
    customerNameText: string;
    salesZone: string;
    paymentClearance: boolean;
    status: string;
    statusHubTimeline: TimelineNode[];
};

export type ReportLookup = {
    salesZones: { id: number; name: string }[];
    customers: { id: number; name: string }[];
};

function mapToReportRow(item: any, index: number): ReportRow {
    return {
        rowIndex: index + 1,
        saleOrderNumber: item.saleOrderNumber ?? "",
        outboundDelivery: item.outboundDelivery ?? "",
        customerNameText: item.customerName ?? "-",
        salesZone: item.salesZone ?? "",
        paymentClearance: item.paymentClearance ?? false,
        status: item.status ?? "N/A",
        statusHubTimeline: item.statusHubTimeline || [], 
    };
}


export function useReport(filters?: {
    search?: string;
    payment?: string;
    salesZoneId?: string;
    customerId?: string;
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
}) {
    const [rows, setRows] = useState<ReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const [lookup, setLookup] = useState<ReportLookup>({
        salesZones: [],
        customers: [],
    });

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await fetchWithAuth(API.ADMIN.REPORT_ANALYSIS({
                search: filters?.search || undefined,
                payment: filters?.payment || undefined,
                salesZoneId: filters?.salesZoneId || undefined,
                customerId: filters?.customerId || undefined,
                date: filters?.date || undefined,
                status: filters?.status || undefined,
                page: filters?.page !== undefined ? filters.page + 1 : 1,  // MUI is 0-indexed
                limit: filters?.limit ?? 10,
            }));

            if (res.status === 401 || res.status === 403) {
                if (typeof window !== "undefined") window.location.href = "/login";
                return;
            }
            if (!res.ok) {
                throw new Error("Failed to fetch report summary");
            }

            const data = await res.json();
            // NEW
            const grouped = data?.data?.groupedOrders ?? [];
            const allRows: ReportRow[] = [];
            let idx = 0;
            for (const group of grouped) {
                for (const order of group.orders ?? []) {
                    allRows.push(mapToReportRow(order, idx++));
                }
            }
            setRows(allRows);
            setTotalCount(data?.data?.totalOrders ?? 0); setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to load report summary");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters?.search, filters?.payment, filters?.salesZoneId, filters?.customerId, filters?.date, filters?.status, filters?.page, filters?.limit]);

    const fetchLookups = useCallback(async () => {
        try {
            const [zonesRes, customersRes] = await Promise.all([
                fetchWithAuth(API.LOOKUP.SALES_ZONES),
                fetchWithAuth(API.ADMIN.USED_CUSTOMERS),
            ]);

            if (zonesRes.status === 401 || customersRes.status === 401) {
                if (typeof window !== "undefined") window.location.href = "/login";
                return;
            }

            const [zones, customers] = await Promise.all([
                zonesRes.json(),
                customersRes.json(),
            ]);

            setLookup({
                salesZones: Array.isArray(zones)
                    ? zones.map((z: any) => ({ id: z.id, name: z.name || "" }))
                    : [],
                customers: Array.isArray(customers)
                    ? customers.map((c: any) => ({ id: c.id, name: c.name || "Unknown" }))
                    : [],
            });
        } catch (err) {
            console.error("Failed to load report lookups", err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchLookups();
    }, [fetchData, fetchLookups]);

   
    return { rows, totalCount, lookup, loading, refreshing, error, refresh: fetchData };
}