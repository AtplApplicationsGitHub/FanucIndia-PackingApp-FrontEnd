"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMPTY_RECON_STATS,
  getReconStats,
  listReconAudits,
} from "../mock/reconciliationMock";
import type { BomAuditPagination } from "../types/audit";
import type {
  ReconAuditStatus,
  ReconAuditSummary,
  ReconStats,
} from "../types/reconciliation";

export type ReconListParams = {
  page: number;
  limit: number;
  search: string;
  status: ReconAuditStatus | "";
};

// MOCK: swap the body for fetchWithAuth(API.RECONCILIATION.LIST(...)) later.
export function useReconciliationAudits() {
  const [params, setParams] = useState<ReconListParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });
  const [all, setAll] = useState<ReconAuditSummary[]>([]);
  const [stats, setStats] = useState<ReconStats>(EMPTY_RECON_STATS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setAll(listReconAudits());
    setStats(getReconStats());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("reconciliation-updated", refresh);

    return () => window.removeEventListener("reconciliation-updated", refresh);
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = params.search.toLowerCase();

    return all.filter(
      (a) =>
        (!params.status || a.status === params.status) &&
        (!q ||
          a.auditNo.toLowerCase().includes(q) ||
          a.auditName.toLowerCase().includes(q) ||
          a.operatorName.toLowerCase().includes(q)),
    );
  }, [all, params.search, params.status]);

  const pagination: BomAuditPagination = {
    page: params.page,
    limit: params.limit,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / params.limit),
  };

  const audits = filtered.slice(
    (params.page - 1) * params.limit,
    params.page * params.limit,
  );

  const updateParams = useCallback(
    (patch: Partial<ReconListParams>) =>
      setParams((prev) => ({ ...prev, ...patch })),
    [],
  );

  return { audits, pagination, stats, params, loading, updateParams };
}
