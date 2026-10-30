"use client";

import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { AuditType } from "../types/audit";

/** Reassign endpoint of each audit type (add Cycle Count here when the backend has it). */
const REASSIGN_URL: Partial<Record<AuditType, (id: number) => string>> = {
  bom: API.BOM_AUDIT.REASSIGN,
};

export function useReassignAudit(auditType: AuditType) {
  /** Resolves with the server message; throws an Error with the server message on failure. */
  const reassignAudit = async (
    id: number,
    operatorId: number,
  ): Promise<string> => {
    const url = REASSIGN_URL[auditType]?.(id);
    if (!url) throw new Error("This audit type cannot be reassigned yet.");

    const res = await fetchWithAuth(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operatorId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(getBomAuditError(json, "Failed to reassign the audit."));
    }
    return (json.message as string) ?? "Audit reassigned.";
  };

  return { reassignAudit };
}
