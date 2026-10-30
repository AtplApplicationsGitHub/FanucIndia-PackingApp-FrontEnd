"use client";

import { useMemo } from "react";

import {
  bomDetailToView,
  cycleCountDetailToView,
} from "../utils/auditDetailView";
import { useBomAuditDetail } from "./useBomAuditDetail";
import { useCycleCountDetail } from "./useCycleCountDetail";
import type { AuditType } from "../types/audit";
import type { AuditDetailView } from "../types/auditDetail";

/**
 * Loads one audit of any type and returns it in one shape (AuditDetailView).
 * Only the hook of the requested type sends a request (the other one gets null).
 * Add a new audit type here (+ a mapper in utils/auditDetailView.ts) when its detail API exists.
 */
export function useAuditDetailView(auditType: AuditType, auditId: number) {
  const bom = useBomAuditDetail(auditType === "bom" ? auditId : null);
  const cycle = useCycleCountDetail(
    auditType === "cycle_count" ? auditId : null,
  );

  const source =
    auditType === "bom" ? bom : auditType === "cycle_count" ? cycle : null;

  const view = useMemo<AuditDetailView | null>(() => {
    if (auditType === "bom" && bom.detail) return bomDetailToView(bom.detail);
    if (auditType === "cycle_count" && cycle.detail)
      return cycleCountDetailToView(cycle.detail);
    return null;
  }, [auditType, bom.detail, cycle.detail]);

  return {
    view,
    loading: source?.loading ?? false,
    error: source
      ? source.error
      : "Detail view is not available for this audit type yet.",
  };
}
