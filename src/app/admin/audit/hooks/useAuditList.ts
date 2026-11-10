"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import { cycleCountListRow } from "../utils/cycleCountView";
import type { CycleCountAuditListItem } from "../types/cycleCount";
import { AUDIT_TYPE_API } from "../utils/auditLabels";
import { AUDITS_UPDATED_EVENT, showGlobalMessage } from "../utils/auditEvents";
import type {
  AuditListParams,
  AuditListRow,
  AuditPagination,
  AuditType,
} from "../types/audit";
import {
  loadSavedParams,
  savePlanningState,
} from "../utils/auditPlanningState";


const EMPTY_STATUS_COUNTS = {
  ASSIGNED: 0,
  IN_PROGRESS: 0,
  RECONCILIATION_PENDING: 0,
  CLOSED: 0,
};

const EMPTY_PAGINATION: AuditPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export function useAuditList(auditType: AuditType) {
  const [params, setParams] = useState<AuditListParams>(() =>
    loadSavedParams(auditType, {
      page: 1,
      limit: 10,
      search: "",
      status: "ALL",
    }),
  );
  const [statusCounts, setStatusCounts] = useState(EMPTY_STATUS_COUNTS);
  const [audits, setAudits] = useState<AuditListRow[]>([]);
  const [pagination, setPagination] =
    useState<AuditPagination>(EMPTY_PAGINATION);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchList = useCallback(
    async (p: AuditListParams) => {
      // Abort any previous request
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          auditType === "cycle_count"
            ? API.CYCLE_COUNT.LIST(p)
            : API.AUDIT.LIST({ auditType: AUDIT_TYPE_API[auditType], ...p }),
          { signal: controller.signal },
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(getBomAuditError(json, "Failed to load audits."));
        }
        if (controller.signal.aborted) return;
        setStatusCounts(json.statusCounts ?? EMPTY_STATUS_COUNTS);
        const list: AuditListRow[] = auditType === "cycle_count"
          ? ((json.data ?? []) as CycleCountAuditListItem[]).map(cycleCountListRow)
          : json.data ?? [];
        const meta: AuditPagination = json.pagination ?? EMPTY_PAGINATION;
        setAudits(list);
        setPagination(meta);
        setAvailable(json.available !== false);

        // If the current page is now empty, go back to the last page with data
        if (list.length === 0 && p.page > 1) {
          setParams((prev) => ({
            ...prev,
            page: Math.max(1, meta.totalPages),
          }));
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setAudits([]);
        setStatusCounts(EMPTY_STATUS_COUNTS);
        showGlobalMessage(
          e instanceof Error ? e.message : "Failed to load audits.",
          "error",
        );
      } finally {
        if (controllerRef.current === controller) setLoading(false);
      }
    },
    [auditType],
  );
  useEffect(() => {
    savePlanningState(auditType, params);
  }, [auditType, params]);

  useEffect(() => {
    void fetchList(params);
  }, [params, fetchList]);

  // Refresh after create / delete
  useEffect(() => {
    const reload = () => void fetchList(params);
    window.addEventListener(AUDITS_UPDATED_EVENT, reload);
    return () => window.removeEventListener(AUDITS_UPDATED_EVENT, reload);
  }, [params, fetchList]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const updateParams = useCallback(
    (next: Partial<AuditListParams>) =>
      setParams((prev) => ({ ...prev, ...next })),
    [],
  );

  return {
    audits,
    pagination,
    params,
    loading,
    available,
    updateParams,
    statusCounts,
  };
}
