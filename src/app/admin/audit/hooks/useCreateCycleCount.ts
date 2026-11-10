"use client";

import { useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import type { CreateCycleCountInput, CreateCycleCountResult } from "../types/cycleCount";
import { getBomAuditError } from "../utils/getBomAuditError";
import { notifyAuditsUpdated } from "../utils/auditEvents";

export function useCreateCycleCount() {
  const [loading, setLoading] = useState(false);

  const createCycleCount = async (data: CreateCycleCountInput) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("auditName", data.auditName);
      formData.append("fromDate", data.fromDate);
      formData.append("toDate", data.toDate);
      if (data.binOperators?.length) {
        formData.append("binOperators", JSON.stringify(data.binOperators));
      }

      const res = await fetchWithAuth(API.CYCLE_COUNT.BASE, {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) throw new Error("File larger than 10 MB");

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(getBomAuditError(json, "Failed to create Cycle Count audit."));

      window.dispatchEvent(
        new CustomEvent("show-global-message", {
          detail: { message: json.message, severity: "success" },
        }),
      );
      notifyAuditsUpdated();
      return json.data as CreateCycleCountResult;
    } finally {
      setLoading(false);
    }
  };

  return { createCycleCount, loading };
}
