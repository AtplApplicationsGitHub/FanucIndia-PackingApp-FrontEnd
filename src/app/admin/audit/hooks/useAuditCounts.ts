"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { AUDITS_UPDATED_EVENT } from "../utils/auditEvents";
import { auditTypeFromApi } from "../utils/auditLabels";
import type { AuditStatus, AuditType } from "../types/audit";

export type AuditCounts = Record<AuditType, number>;

export type AuditStatusCounts = Record<AuditStatus, number>;

const emptyStatusCounts = (): AuditStatusCounts => ({
  ASSIGNED: 0,
  IN_PROGRESS: 0,
  RECONCILIATION_PENDING: 0,
  CLOSED: 0,
});

const EMPTY_COUNTS: AuditCounts = {
  cycle_count: 0,
  bom: 0,
  location: 0,
  free_stock: 0,
};

const EMPTY_STATUS_COUNTS: Record<AuditType, AuditStatusCounts> = {
  cycle_count: emptyStatusCounts(),
  bom: emptyStatusCounts(),
  location: emptyStatusCounts(),
  free_stock: emptyStatusCounts(),
};

export function useAuditCounts() {
  const [counts, setCounts] = useState<AuditCounts>(EMPTY_COUNTS);

  const [statusCounts, setStatusCounts] =
    useState<Record<AuditType, AuditStatusCounts>>(EMPTY_STATUS_COUNTS);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetchWithAuth(API.AUDIT.STATUS_COUNTS);

        if (!res.ok) return;

        const json = await res.json();

        const nextCounts: AuditCounts = { ...EMPTY_COUNTS };

        const nextStatusCounts = {
          cycle_count: emptyStatusCounts(),
          bom: emptyStatusCounts(),
          location: emptyStatusCounts(),
          free_stock: emptyStatusCounts(),
        };

        for (const row of json.data ?? []) {
          const type = auditTypeFromApi(row.auditType);

          if (!type) continue;

          nextCounts[type] = Number(row.total) || 0;

          nextStatusCounts[type] = {
            ASSIGNED: Number(row.counts?.ASSIGNED) || 0,
            IN_PROGRESS: Number(row.counts?.IN_PROGRESS) || 0,
            RECONCILIATION_PENDING:
              Number(row.counts?.RECONCILIATION_PENDING) || 0,
            CLOSED: Number(row.counts?.CLOSED) || 0,
          };
        }

        if (active) {
          setCounts(nextCounts);
          setStatusCounts(nextStatusCounts);
        }
      } catch {
        // Counts are informational.
      }
    };

    void load();

    window.addEventListener(AUDITS_UPDATED_EVENT, load);

    return () => {
      active = false;
      window.removeEventListener(AUDITS_UPDATED_EVENT, load);
    };
  }, []);

  return { counts, statusCounts };
}
