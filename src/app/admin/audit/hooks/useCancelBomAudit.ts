"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { BomAuditSummary } from "../types/audit";

export function useCancelBomAudit() {
  const [loading, setLoading] = useState(false);

  const cancelBomAudit = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(API.BOM_AUDIT.CANCEL(id), {
        method: "PATCH",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getBomAuditError(json, "Failed to cancel BOM audit."));
      }

      window.dispatchEvent(
        new CustomEvent("show-global-message", {
          detail: { message: json.message, severity: "success" },
        }),
      );
      window.dispatchEvent(new Event("bom-audits-updated"));
      return json.data as BomAuditSummary;
    } finally {
      setLoading(false);
    }
  };

  return { cancelBomAudit, loading };
}
