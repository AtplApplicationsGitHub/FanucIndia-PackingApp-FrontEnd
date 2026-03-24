"use client";
import { useState, useEffect, useCallback } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export type CustomerSOCountRow = {
    customerName: string;
    soCount: number;
};

export type CustomerSOByMaterialRow = {
    customerName: string;
    soCount: number;
};

function normalizeCustomerSOCountRow(item: any): CustomerSOCountRow {
    return {
        customerName: item.customerName ?? "",
        soCount: item.saleOrderNumberCount ?? item.soCount ?? 0,
    };
}

function normalizeCustomerSOByMaterialRow(item: any): CustomerSOByMaterialRow {
    return {
        customerName: item.customerName ?? "",
        soCount: item.totalQuantity ?? item.soCount ?? 0, 
    };
}

// TAB 1

export function useCustomerSOCount(fromDate: string | null, toDate: string | null) {
    const [rows, setRows] = useState<CustomerSOCountRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!fromDate || !toDate) return;

        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const url = `${API.ADMIN.CUSTOMER_SO_COUNT}?startDate=${encodeURIComponent(fromDate)}&endDate=${encodeURIComponent(toDate)}`;
            const res = await fetchWithAuth(url);

            if (res.status === 401 || res.status === 403) {
                if (typeof window !== "undefined") window.location.href = "/login";
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch Customer SO Count");

            const json = await res.json();
            const arr = Array.isArray(json.data) ? json.data : [];
            setRows(arr.map(normalizeCustomerSOCountRow));
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load Customer SO Count");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { rows, loading, refreshing, error, refresh: fetchData };
}

// TAB 2

export function useCustomerSOByMaterial() {
    const [rows, setRows] = useState<CustomerSOByMaterialRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    const fetchData = useCallback(async (materialCode: string, isSilent = false) => {
        if (!materialCode) return;

        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        setNotFound(false);
        setError(null);

        try {
            const url = `${API.ADMIN.CUSTOMER_SO_BY_MATERIAL}/${encodeURIComponent(materialCode)}`;
            const res = await fetchWithAuth(url);

            if (res.status === 401 || res.status === 403) {
                if (typeof window !== "undefined") window.location.href = "/login";
                return;
            }
            if (res.status === 404) {
                setRows([]);
                setNotFound(true);
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch Customer SO by Material");

            const json = await res.json();
            const arr = Array.isArray(json.data) ? json.data : [];

            // Filter out the metadata row { MaterialCode: "..." } — keep only rows with customerName
            const customerRows = arr.filter((item: any) => item.customerName != null);

            setRows(customerRows.map(normalizeCustomerSOByMaterialRow));
            setNotFound(customerRows.length === 0);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load Customer SO by Material");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Exposed as `fetch` to make it clear this is manually triggered
    return { rows, loading, refreshing, error, notFound, fetch: fetchData };
}