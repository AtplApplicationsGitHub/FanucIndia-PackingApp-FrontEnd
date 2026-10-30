"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import { AUDIT_TYPE_API } from "../utils/auditLabels";
import { AUDITS_UPDATED_EVENT, showGlobalMessage } from "../utils/auditEvents";
import type {
  AuditListParams,
  AuditListRow,
  AuditPagination,
  AuditType,
} from "../types/audit";

const EMPTY_PAGINATION: AuditPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

/**
 * Rows of the Audit Planning table for ONE audit type (GET /audit/list?auditType=...).
 * The table is mounted with key={auditType}, so clicking another card starts with fresh params.
 */
export function useAuditList(auditType: AuditType) {
  const [params, setParams] = useState<AuditListParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "ASSIGNED", // same default as the BOM table
  });
  const [audits, setAudits] = useState<AuditListRow[]>([]);
  const [pagination, setPagination] =
    useState<AuditPagination>(EMPTY_PAGINATION);
  // false = the BE module of this audit type is not built yet
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchList = useCallback(
    async (p: AuditListParams) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          API.AUDIT.LIST({ auditType: AUDIT_TYPE_API[auditType], ...p }),
          { signal: controller.signal },
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(getBomAuditError(json, "Failed to load audits."));
        }
        const list: AuditListRow[] = json.data ?? [];
        const meta: AuditPagination = json.pagination ?? EMPTY_PAGINATION;
        setAudits(list);
        setPagination(meta);
        setAvailable(json.available !== false);

        // Last row of the last page was removed -> go to the new last page
        if (list.length === 0 && p.page > 1) {
          setParams((prev) => ({
            ...prev,
            page: Math.max(1, meta.totalPages),
          }));
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setAudits([]);
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

  return { audits, pagination, params, loading, available, updateParams };
}
