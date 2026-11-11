"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import type { CreateBomAuditResult } from "../types/audit";
import { getBomAuditError } from "../utils/getBomAuditError";
import { notifyAuditsUpdated } from "../utils/auditEvents";

export function useCreateBomAudit() {
  const [loading, setLoading] = useState(false);

  // The Excel may contain Operator IDs; auditName and the operators chosen on the screen are sent separately.
  const createBomAudit = async (data: {
    file: File;
    auditName: string;
    binOperators?: { storageBin: string; operatorId: number }[];
  }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("auditName", data.auditName);
      if (data.binOperators?.length) {
        formData.append("binOperators", JSON.stringify(data.binOperators));
      }

      const res = await fetchWithAuth(API.BOM_AUDIT.BASE, {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) {
        throw new Error("The server or proxy rejected the upload. Please check its upload settings.");
      }

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
