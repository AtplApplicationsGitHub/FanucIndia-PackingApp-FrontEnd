"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FreeStockFilters, FreeStockList, FreeStockStatus } from "../../types/freeStock";
import { freeStockApi } from "../../services/freeStock.service";
export function useFreeStock() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<FreeStockFilters["status"]>("ALL");
  const [mine, setMine] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<FreeStockList | null>(null);
  const [counts, setCounts] = useState<Record<FreeStockStatus, number>>({ OPEN: 0, RESERVED: 0, CLOSED: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef(new Map<string, FreeStockList>());
  const refresh = useCallback(() => { cache.current.clear(); setVersion((value) => value + 1); }, []);
  useEffect(() => {
    if (search === debounced) return;
    const timer = window.setTimeout(() => { setDebounced(search); setPage(0); }, 300);
    return () => window.clearTimeout(timer);
  }, [search, debounced]);
  const filters = useMemo<FreeStockFilters>(() => ({ search: debounced, page: page + 1, limit: size, status, mine }), [debounced, page, size, status, mine]);
  useEffect(() => {
    const key = JSON.stringify(filters);
    const existing = cache.current.get(key);
    setError(null);
    if (existing) { setData(existing); setCounts(existing.statusCounts); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    void freeStockApi.list(filters, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (cache.current.size >= 50) cache.current.clear();
      cache.current.set(key, result);
      setData(result); setCounts(result.statusCounts);
      if (filters.page > 1 && !result.data.length) setPage(Math.max(0, result.pagination.totalPages - 1));
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) { setError(reason instanceof Error ? reason : new Error("Unable to load stock.")); setData(null); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, version]);
  const changeStatus = (value: FreeStockFilters["status"]) => { if (value !== status) { setStatus(value); setPage(0); } };
  const changeMine = (value: boolean) => { if (value !== mine) { setMine(value); setPage(0); } };
  const changeSize = (value: number) => { if (value !== size) { setSize(value); setPage(0); } };
  const clear = () => { setSearch(""); setDebounced(""); setStatus("ALL"); setMine(false); setPage(0); };
  return { search, setSearch, status, changeStatus, mine, changeMine, page, setPage, size, changeSize, filters, data, counts, loading, error, refresh, clear };
}
