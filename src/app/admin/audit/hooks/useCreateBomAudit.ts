"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import type { CreateBomAuditResult } from "../types/audit";
import { getBomAuditError } from "../utils/getBomAuditError";

export function useCreateBomAudit() {
  const [loading, setLoading] = useState(false);

  // Template upload: the file carries the Audit Name and the Operator of every storage bin
  const createBomAudit = async (data: {
    file: File;
    auditName?: string;
    operatorId?: number;
  }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      if (data.auditName) formData.append("auditName", data.auditName);
      if (data.operatorId) formData.append("operatorId", String(data.operatorId));

      // Do NOT set Content-Type here; the browser sets it for multipart
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
      window.dispatchEvent(new Event("bom-audits-updated"));
      return json.data as CreateBomAuditResult;
    } finally {
      setLoading(false);
    }
  };

  return { createBomAudit, loading };
}
