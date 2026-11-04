"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import { AUDIT_TYPE_API } from "../utils/auditLabels";
import type { AuditType } from "../types/audit";
import type { ReconLine, ReconLineFilters, ReconCategoryFilter } from "../types/reconciliation";

const SEARCH_DELAY_MS = 350;
const EMPTY_CATEGORY_COUNTS: Record<ReconCategoryFilter, number> = {
  ALL: 0, ALL_EXCEPT_VALID: 0, QUANTITY_MISMATCH: 0, MISSING: 0, EXCESS: 0, VALID: 0,
};

export function useReconciliationLines(
  auditType: AuditType,
  id: number | null,
  filters: ReconLineFilters,
) {
  const [categoryCounts, setCategoryCounts] = useState(EMPTY_CATEGORY_COUNTS);
  const [rows, setRows] = useState<ReconLine[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(filters.search);
  const controllerRef = useRef<AbortController | null>(null);
  const apiType = AUDIT_TYPE_API[auditType];

  useEffect(() => {
    const timer = setTimeout(() => setSearch(filters.search), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const { storageBin, category, status, page, limit } = filters;

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    if (id === null) {
      setRows([]);
      setTotal(0);
      setCategoryCounts(EMPTY_CATEGORY_COUNTS);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      category,
      status,
      page: String(page + 1),
      limit: String(limit),
    });
    if (search.trim()) params.set("search", search.trim());
    if (storageBin !== "ALL") params.set("storageBin", storageBin);

    try {
      const res = await fetchWithAuth(
        `${API.AUDIT.RECONCILIATION.LINES(apiType, id)}?${params.toString()}`,
        { signal: controller.signal },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(getBomAuditError(json, "Failed to load audit lines."));
      if (controller.signal.aborted) return;
      setCategoryCounts(json.categoryCounts ?? EMPTY_CATEGORY_COUNTS);
      setRows((json.data ?? []) as ReconLine[]);
      setTotal(Number(json.pagination?.total ?? 0));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setRows([]);
      setTotal(0);
      setCategoryCounts(EMPTY_CATEGORY_COUNTS);
      setError(e instanceof Error ? e.message : "Failed to load audit lines.");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, [apiType, id, search, storageBin, category, status, page, limit]);

  useEffect(() => {
    void load();
    return () => controllerRef.current?.abort();
  }, [load]);

  return { rows, total, categoryCounts, loading, error, reload: load };
}
