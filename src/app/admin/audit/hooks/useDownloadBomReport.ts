"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";

/**
 * Downloads the report Excel of a submitted BOM audit (GET /bom-audit/:id/report).
 * The server returns the file saved on SFTP (or builds it again if it is not there).
 */
export function useDownloadBomReport() {
  const [loading, setLoading] = useState(false);

  const downloadReport = async (auditId: number, auditNo: string) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(API.BOM_AUDIT.REPORT(auditId));
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(getBomAuditError(json, "Failed to download the report."));
      }

      // File name from the server (Content-Disposition), else <Audit No>_Report.xlsx
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="?([^";]+)"?/i.exec(disposition);
      const fileName = match?.[1] ?? `${auditNo}_Report.xlsx`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("show-global-message", {
          detail: {
            message:
              err instanceof Error ? err.message : "Failed to download the report.",
            severity: "error",
          },
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return { downloadReport, loading };
}
