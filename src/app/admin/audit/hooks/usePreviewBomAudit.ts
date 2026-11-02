"use client";

import { useCallback, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { BomAuditPreview } from "../types/audit";

export function usePreviewBomAudit() {
  const [loading, setLoading] = useState(false);

  const previewBomAudit = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithAuth(API.BOM_AUDIT.PREVIEW, {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) throw new Error("File larger than 10 MB");

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          getBomAuditError(json, "Unable to read the Excel file."),
        );

      return json.data as BomAuditPreview;
    } finally {
      setLoading(false);
    }
  }, []);

  return { previewBomAudit, loading };
}
