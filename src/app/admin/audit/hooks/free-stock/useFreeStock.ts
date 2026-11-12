"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FreeStockFilters,
  FreeStockList,
  FreeStockStatus,
  FreeStockReservedDays,
  FreeStockZone,
} from "../../types/freeStock";
import { freeStockApi } from "../../services/freeStock.service";
export function useFreeStock() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<FreeStockFilters["status"]>("ALL");
  const [mine, setMine] = useState(false);
  const [zoneId, setZoneId] = useState<number | "">("");
  const [reservedDays, setReservedDays] = useState<FreeStockReservedDays>("ALL");
  const [zones, setZones] = useState<FreeStockZone[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<FreeStockList | null>(null);
  const [counts, setCounts] = useState<Record<FreeStockStatus, number>>({
    OPEN: 0,
    RESERVED: 0,
    CLOSED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef(new Map<string, FreeStockList>());
  const refresh = useCallback(() => {
    cache.current.clear();
    setVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    if (search === debounced) return;
    const timer = window.setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, debounced]);

  const filters = useMemo<FreeStockFilters>(
    () => ({ search: debounced, page: page + 1, limit: size, status, mine,
      zoneId: zoneId === "" ? undefined : zoneId, reservedDays }),
    [debounced, page, size, status, mine, zoneId, reservedDays],
  );

  useEffect(() => {
    const key = JSON.stringify(filters);
    const existing = cache.current.get(key);
    setError(null);
    if (existing) {
      setData(existing);
      setCounts(existing.statusCounts);
      setZones(existing.filterOptions?.zones ?? []);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void freeStockApi
      .list(filters, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (cache.current.size >= 50) cache.current.clear();
        cache.current.set(key, result);
        setData(result);
        setCounts(result.statusCounts);
        setZones(result.filterOptions?.zones ?? []);
        if (filters.page > 1 && !result.data.length)
          setPage(Math.max(0, result.pagination.totalPages - 1));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason
              : new Error("Unable to load stock."),
          );
          setData(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, version]);

  const changeStatus = (value: FreeStockFilters["status"]) => {
    setMine(false);

    setStatus((current) => (mine ? value : current === value ? "ALL" : value));

    setPage(0);
  };

  const changeMine = (value: boolean) => {
    if (value !== mine) {
      setMine(value);
      setStatus(value ? "RESERVED" : "ALL");
      setPage(0);
    }
  };
  const changeSize = (value: number) => {
    if (value !== size) {
      setSize(value);
      setPage(0);
    }
  };
  const changeZone = (value: number | "") => { setZoneId(value); setPage(0); };
  const changeReservedDays = (value: FreeStockReservedDays) => { setReservedDays(value); setPage(0); };
  const clearReservationFilters = () => { setZoneId(""); setReservedDays("ALL"); setPage(0); };
  return {
    zoneId, zones, changeZone,
    reservedDays, changeReservedDays, clearReservationFilters,
    search,
    setSearch,
    status,
    changeStatus,
    mine,
    changeMine,
    page,
    setPage,
    size,
    changeSize,
    filters,
    data,
    counts,
    statusSummary: data?.statusSummary ?? null,
    myReservations: data?.myReservations ?? null,
    loading,
    error,
    refresh,
  };
}
