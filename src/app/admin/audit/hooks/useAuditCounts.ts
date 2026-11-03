"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { AUDITS_UPDATED_EVENT } from "../utils/auditEvents";
import { auditTypeFromApi } from "../utils/auditLabels";
import type { AuditStatus, AuditType } from "../types/audit";

export type AuditCounts = Record<AuditType, number>;

export type AuditStatusCounts = Record<AuditStatus, number>;

// Empty counts for all audit statuses
const emptyStatusCounts = (): AuditStatusCounts => ({
  ASSIGNED: 0,
  IN_PROGRESS: 0,
  RECONCILIATION_PENDING: 0,
  CLOSED: 0,
});

// Empty total counts for all audit types
const EMPTY_COUNTS: AuditCounts = {
  cycle_count: 0,
  bom: 0,
  location: 0,
  free_stock: 0,
};

// Create independent status count objects for each audit type
const createEmptyStatusCounts = (): Record<AuditType, AuditStatusCounts> => ({
  cycle_count: emptyStatusCounts(),
  bom: emptyStatusCounts(),
  location: emptyStatusCounts(),
  free_stock: emptyStatusCounts(),
});

export function useAuditCounts() {
  const [counts, setCounts] = useState<AuditCounts>(EMPTY_COUNTS);

  const [statusCounts, setStatusCounts] = useState<
    Record<AuditType, AuditStatusCounts>
  >(createEmptyStatusCounts);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const load = async () => {
      const currentRequest = ++requestId;

      if (active) {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetchWithAuth(API.AUDIT.STATUS_COUNTS);

        if (!res.ok) {
          throw new Error(`Failed to fetch audit counts: ${res.status}`);
        }

        const json = await res.json();

        // Prepare fresh count objects
        const nextCounts: AuditCounts = { ...EMPTY_COUNTS };
        const nextStatusCounts = createEmptyStatusCounts();

        // Process each audit type returned by the API
        for (const row of json.data ?? []) {
          const type = auditTypeFromApi(row.auditType);

          if (!type) continue;

          // Total audit count
          nextCounts[type] = Number(row.total) || 0;

          // Status-wise audit counts
          nextStatusCounts[type] = {
            ASSIGNED: Number(row.counts?.ASSIGNED) || 0,
            IN_PROGRESS: Number(row.counts?.IN_PROGRESS) || 0,
            RECONCILIATION_PENDING:
              Number(row.counts?.RECONCILIATION_PENDING) || 0,
            CLOSED: Number(row.counts?.CLOSED) || 0,
          };
        }

        // Only the latest request can update state
        if (active && currentRequest === requestId) {
          setCounts(nextCounts);
          setStatusCounts(nextStatusCounts);
        }
      } catch (err) {
        if (active && currentRequest === requestId) {
          const message =
            err instanceof Error ? err.message : "Unable to fetch audit counts";

          console.error("Failed to load audit counts:", err);
          setError(message);
        }
      } finally {
        if (active && currentRequest === requestId) {
          setLoading(false);
        }
      }
    };

    // Fetch counts when the component mounts
    void load();

    // Refresh counts when audit data changes
    window.addEventListener(AUDITS_UPDATED_EVENT, load);

    // Cleanup when the component unmounts
    return () => {
      active = false;
      window.removeEventListener(AUDITS_UPDATED_EVENT, load);
    };
  }, []);

  return { counts, statusCounts, loading, error };
}
