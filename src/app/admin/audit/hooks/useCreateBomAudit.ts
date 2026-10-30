"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import type { CreateBomAuditResult } from "../types/audit";
import { getBomAuditError } from "../utils/getBomAuditError";
import { notifyAuditsUpdated } from "../utils/auditEvents";

export function useCreateBomAudit() {
  const [loading, setLoading] = useState(false);

  // The Excel contains Operator IDs; auditName is sent separately.
  const createBomAudit = async (data: { file: File; auditName: string }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("auditName", data.auditName);

      const res = await fetchWithAuth(API.BOM_AUDIT.BASE, {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) throw new Error("File larger than 10 MB");

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(getBomAuditError(json, "Failed to create BOM audit."));

      window.dispatchEvent(
        new CustomEvent("show-global-message", {
          detail: { message: json.message, severity: "success" },
        }),
      );
      notifyAuditsUpdated();
      return json.data as CreateBomAuditResult;
    } finally {
      setLoading(false);
    }
  };

  return { createBomAudit, loading };
}
