"use client";

import { useMemo } from "react";

import { bomDetailToView } from "../utils/auditDetailView";
import { useBomAuditDetail } from "./useBomAuditDetail";
import type { AuditType } from "../types/audit";
import type { AuditDetailView } from "../types/auditDetail";

export function useAuditDetailView(auditType: AuditType, auditId: number) {
  const bom = useBomAuditDetail(auditType === "bom" ? auditId : null);

  const source = auditType === "bom" ? bom : null;

  const view = useMemo<AuditDetailView | null>(() => {
    if (auditType === "bom" && bom.detail) return bomDetailToView(bom.detail);
    return null;
  }, [auditType, bom.detail]);

  return {
    view,
    loading: source?.loading ?? false,
    error: source
      ? source.error
      : "Detail view is not available for this audit type yet.",
  };
}
