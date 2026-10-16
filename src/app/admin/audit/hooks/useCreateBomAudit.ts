"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import type { BomAudit } from "../types/audit";
import { getBomAuditError } from "../utils/getBomAuditError";

export function useCreateBomAudit() {
  const [loading, setLoading] = useState(false);

  const createBomAudit = async (data: {
    file: File;
    auditName: string;
    operatorId: number;
  }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("auditName", data.auditName);
      formData.append("operatorId", String(data.operatorId));

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
      return json.data as BomAudit;
    } finally {
      setLoading(false);
    }
  };

  return { createBomAudit, loading };
}
