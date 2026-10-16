"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type {
  BomAuditPagination,
  BomAuditStatus,
  BomAuditSummary,
} from "../types/audit";

export type BomAuditListParams = {
  page: number;
  limit: number;
  search: string;
  status: BomAuditStatus | "";
};

const EMPTY_PAGINATION: BomAuditPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export function useBomAudits() {
  const [params, setParams] = useState<BomAuditListParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "ASSIGNED",
  });
  const [audits, setAudits] = useState<BomAuditSummary[]>([]);
  const [pagination, setPagination] =
    useState<BomAuditPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);

  const controllerRef = useRef<AbortController | null>(null);

  const fetchList = useCallback(async (p: BomAuditListParams) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    try {
      const res = await fetchWithAuth(API.BOM_AUDIT.LIST(p), {
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getBomAuditError(json, "Failed to load audits."));
      }

      const list: BomAuditSummary[] = json.data ?? [];
      const meta: BomAuditPagination = json.pagination ?? EMPTY_PAGINATION;
      setAudits(list);
      setPagination(meta);

      // Last row of the last page was removed -> go to the new last page
      if (list.length === 0 && p.page > 1) {
        setParams((prev) => ({ ...prev, page: Math.max(1, meta.totalPages) }));
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setAudits([]);
      window.dispatchEvent(
        new CustomEvent("show-global-message", {
          detail: {
            message: e instanceof Error ? e.message : "Failed to load audits.",
            severity: "error",
          },
        }),
      );
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList(params);
  }, [params, fetchList]);

  // Refresh after create / cancel
  useEffect(() => {
    const reload = () => void fetchList(params);
    window.addEventListener("bom-audits-updated", reload);
    return () => window.removeEventListener("bom-audits-updated", reload);
  }, [params, fetchList]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const updateParams = useCallback(
    (next: Partial<BomAuditListParams>) =>
      setParams((prev) => ({ ...prev, ...next })),
    [],
  );

  return { audits, pagination, params, loading, updateParams };
}
