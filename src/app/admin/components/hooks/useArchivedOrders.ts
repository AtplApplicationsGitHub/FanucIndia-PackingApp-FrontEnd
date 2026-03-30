"use client";

import { useState, useEffect, useCallback } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { format } from "date-fns";

export type ArchivedOrder = {
  id: number;
  product: string;
  saleOrderNumber: string | null;
  outboundDelivery: string | null;
  transferOrder: string | null;
  requiredDate: string | null;
  payment: boolean;
  salesZone: string;
  customer: string;
  status: string | null;
  archivedAt: string;
};

export type ArchivedOrderFilters = {
  search?: string;
  paymentFilter?: string;
  zoneFilter?: string;
  statusFilter?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  page?: number;
  limit?: number;
};

export function useArchivedOrders(filters?: ArchivedOrderFilters) {
  const [orders, setOrders] = useState<ArchivedOrder[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [salesZones, setSalesZones] = useState<{ id: number; name: string }[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const url = API.ADMIN.ARCHIVED_ORDERS({
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 10,
        search: filters?.search || undefined,
        paymentFilter: filters?.paymentFilter || undefined,
        zoneFilter: filters?.zoneFilter || undefined,
        statusFilter: filters?.statusFilter || undefined,
        startDate: filters?.startDate ? format(filters.startDate, "yyyy-MM-dd") : undefined,
        endDate: filters?.endDate ? format(filters.endDate, "yyyy-MM-dd") : undefined,
      });

      const res = await fetchWithAuth(url);

      if (res.status === 401 || res.status === 403) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch archived orders");

      const json = await res.json();

      setOrders(json.data ?? []);
      setRowCount(json.total ?? 0);
    } catch (err) {
      console.error("Failed to load archived orders");
    } finally {
      setLoading(false);
    }
  }, [
    filters?.search,
    filters?.paymentFilter,
    filters?.zoneFilter,
    filters?.statusFilter,
    filters?.startDate,
    filters?.endDate,
    filters?.page,
    filters?.limit,
  ]);

  const fetchLookups = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API.LOOKUP.SALES_ZONES);
      const data = await res.json();

      setSalesZones(Array.isArray(data) ? data : []);
    } catch {
      setSalesZones([]);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  return {
    orders,
    rowCount,
    loading,
    lookup: { salesZones, products: [], customers: [] },
  };
}