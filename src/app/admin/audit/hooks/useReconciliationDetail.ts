"use client";
import { useCallback, useEffect, useState } from "react";
import {
  assignBinReverification,
  closeReconAudit,
  getReconAudit,
  listBinReverifications,
  saveVarianceDecision,
  type ReconReverification,
} from "../mock/reconciliationMock";
import type {
  ReconAuditDetail,
  ReconDecision,
  ReconSapAction,
} from "../types/reconciliation";

const getUserName = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").name || "Admin";
  } catch {
    return "Admin";
  }
};

// MOCK: swap the bodies for fetchWithAuth(API.RECONCILIATION.*) later.
export function useReconciliationDetail(id: number | null) {
  const [detail, setDetail] = useState<ReconAuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reverifications, setReverifications] = useState<ReconReverification[]>(
    [],
  );
  const load = useCallback(() => {
    if (id === null) {
      setDetail(null);
      setError("Audit not found.");
      setLoading(false);

      return;
    }
    setReverifications(listBinReverifications(id));
    const found = getReconAudit(id);

    setDetail(found);
    setError(found ? "" : "Audit not found.");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    window.addEventListener("reconciliation-updated", load);

    return () => window.removeEventListener("reconciliation-updated", load);
  }, [load]);

  const saveDecision = useCallback(
    async (
      varianceId: number,
      decision: ReconDecision,
      sapAction: ReconSapAction,
      remarks: string,
    ) => {
      if (id === null) return;
      saveVarianceDecision(
        id,
        varianceId,
        decision,
        sapAction,
        remarks,
        getUserName(),
      );
    },
    [id],
  );

  const closeAudit = useCallback(async () => {
    if (id === null) return;
    closeReconAudit(id, getUserName());
  }, [id]);

  const assignReverify = useCallback(
    async (storageBin: string, operatorId: number, operatorName: string) => {
      if (id === null) return;
      assignBinReverification(id, storageBin, operatorId, operatorName);
    },
    [id],
  );

  return {
    detail,
    loading,
    error,
    saveDecision,
    closeAudit,
    reverifications,
    assignReverify,
  };
}
