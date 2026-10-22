"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";

const FALLBACK_FILE_NAME = "BOM_Audit_Template.xlsx";

export function useDownloadBomTemplate() {
  const [loading, setLoading] = useState(false);

  const downloadTemplate = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(API.BOM_AUDIT.TEMPLATE);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          getBomAuditError(json, "Failed to download the template."),
        );
      }

      // File name from the server (Content-Disposition), else the default one
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="?([^";]+)"?/i.exec(disposition);
      const fileName = match?.[1] ?? FALLBACK_FILE_NAME;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setLoading(false);
    }
  };

  return { downloadTemplate, loading };
}
