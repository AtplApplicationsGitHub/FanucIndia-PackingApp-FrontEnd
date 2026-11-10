"use client";

import { useCallback, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { CycleCountPreview, CycleCountDateInput } from "../types/cycleCount";

export function usePreviewCycleCount() {
  const [loading, setLoading] = useState(false);

  const previewCycleCount = useCallback(async (file: File, dates: CycleCountDateInput) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fromDate", dates.fromDate);
      formData.append("toDate", dates.toDate);

      const res = await fetchWithAuth(API.CYCLE_COUNT.PREVIEW, {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) throw new Error("File larger than 10 MB");

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          getBomAuditError(json, "Unable to read the Excel file."),
        );

      return json.data as CycleCountPreview;
    } finally {
      setLoading(false);
    }
  }, []);

  return { previewCycleCount, loading };
}
