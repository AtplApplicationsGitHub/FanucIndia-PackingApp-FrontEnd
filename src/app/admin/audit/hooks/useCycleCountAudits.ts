"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import { CYCLE_COUNT_UPDATED_EVENT, showGlobalMessage } from "../utils/cycleCountApi";
import type {
  CycleCountPagination,
  CycleCountStatus,
  CycleCountSummary,
} from "../types/cycleCount";

export type CycleCountListParams = {
  page: number;
  limit: number;
  search: string;
  status: CycleCountStatus | "";
};

const EMPTY_PAGINATION: CycleCountPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

/** Cycle Count tracker list (same behaviour as useBomAudits). */
export function useCycleCountAudits() {
  const [params, setParams] = useState<CycleCountListParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });
  const [audits, setAudits] = useState<CycleCountSummary[]>([]);
  const [pagination, setPagination] = useState<CycleCountPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchList = useCallback(async (p: CycleCountListParams) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    try {
      const res = await fetchWithAuth(API.CYCLE_COUNT.LIST(p), { signal: controller.signal });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(getBomAuditError(json, "Failed to load audits."));
      const list: CycleCountSummary[] = json.data ?? [];
      const meta: CycleCountPagination = json.pagination ?? EMPTY_PAGINATION;
      setAudits(list);
      setPagination(meta);
      // Last row of the last page was removed -> go to the new last page
      if (list.length === 0 && p.page > 1) {
        setParams((prev) => ({ ...prev, page: Math.max(1, meta.totalPages) }));
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setAudits([]);
      showGlobalMessage(e instanceof Error ? e.message : "Failed to load audits.", "error");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList(params);
  }, [params, fetchList]);

  // Refresh after release / cancel
  useEffect(() => {
    const reload = () => void fetchList(params);
    window.addEventListener(CYCLE_COUNT_UPDATED_EVENT, reload);
    return () => window.removeEventListener(CYCLE_COUNT_UPDATED_EVENT, reload);
  }, [params, fetchList]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const updateParams = useCallback(
    (next: Partial<CycleCountListParams>) => setParams((prev) => ({ ...prev, ...next })),
    [],
  );

  return { audits, pagination, params, loading, updateParams };
}
