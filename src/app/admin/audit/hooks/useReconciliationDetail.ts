"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import { AUDIT_TYPE_API } from "../utils/auditLabels";
import { notifyAuditsUpdated } from "../utils/auditEvents";
import type { AuditType } from "../types/audit";
import type {
  ReconAuditDetail,
  ReconDecision,
  ReconSapAction,
} from "../types/reconciliation";

const readDetail = async (res: Response, fallback: string) => {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getBomAuditError(json, fallback));
  return json.data as ReconAuditDetail;
};

export function useReconciliationDetail(auditType: AuditType, id: number | null) {
  const [detail, setDetail] = useState<ReconAuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const apiType = AUDIT_TYPE_API[auditType];

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    if (id === null) {
      setDetail(null);
      setError("Audit not found.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(API.AUDIT.RECONCILIATION.DETAIL(apiType, id), {
        signal: controller.signal,
      });
      const data = await readDetail(res, "Failed to load reconciliation details.");
      if (!controller.signal.aborted) setDetail(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setDetail(null);
      setError(e instanceof Error ? e.message : "Failed to load reconciliation details.");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, [apiType, id]);

  useEffect(() => {
    void load();
    return () => controllerRef.current?.abort();
  }, [load]);

  const saveDecision = useCallback(
    async (
      varianceId: number,
      decision: ReconDecision,
      sapAction: ReconSapAction,
      remarks: string,
    ) => {
      if (id === null) return;
      const res = await fetchWithAuth(
        API.AUDIT.RECONCILIATION.REVIEW(apiType, id, varianceId),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, sapAction, remarks }),
        },
      );
      setDetail(await readDetail(res, "Failed to save reconciliation."));
    },
    [apiType, id],
  );

  const saveBulkDecision = useCallback(
    async (
      varianceIds: number[],
      decision: ReconDecision,
      sapAction: ReconSapAction,
      remarks: string,
    ) => {
      if (id === null) return;
      const res = await fetchWithAuth(
        API.AUDIT.RECONCILIATION.BULK_REVIEW(apiType, id),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ varianceIds, decision, sapAction, remarks }),
        },
      );
      setDetail(await readDetail(res, "Failed to save reconciliation."));
    },
    [apiType, id],
  );

  const closeAudit = useCallback(async () => {
    if (id === null) return null;
    const res = await fetchWithAuth(API.AUDIT.RECONCILIATION.CLOSE(apiType, id), {
      method: "POST",
    });
    const data = await readDetail(res, "Failed to close the audit.");
    setDetail(data);
    notifyAuditsUpdated();
    return data;
  }, [apiType, id]);

  return {
    detail,
    loading,
    error,
    reload: load,
    saveDecision,
    saveBulkDecision,
    closeAudit,
  };
}
