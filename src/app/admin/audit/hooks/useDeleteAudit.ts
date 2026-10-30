"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { AuditType } from "../types/audit";

/** DELETE endpoint of each audit type (permanent delete, only while ASSIGNED). */
const DELETE_URL: Partial<Record<AuditType, (id: number) => string>> = {
  bom: API.BOM_AUDIT.BY_ID,
  cycle_count: API.CYCLE_COUNT.BY_ID,
};

export function useDeleteAudit(auditType: AuditType) {
  const [loading, setLoading] = useState(false);

  /** Resolves with the server message; throws an Error with the server message on failure. */
  const deleteAudit = async (id: number): Promise<string> => {
    const url = DELETE_URL[auditType]?.(id);
    if (!url) throw new Error("This audit type cannot be deleted yet.");

    setLoading(true);
    try {
      const res = await fetchWithAuth(url, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getBomAuditError(json, "Failed to delete the audit."));
      }
      return (json.message as string) ?? "Audit deleted.";
    } finally {
      setLoading(false);
    }
  };

  return { deleteAudit, loading };
}
