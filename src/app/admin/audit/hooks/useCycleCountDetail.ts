"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { CycleCountDetail } from "../types/cycleCount";

/** Loads one Cycle Count audit when auditId is set (null = dialog closed). */
export function useCycleCountDetail(auditId: number | null) {
  const [detail, setDetail] = useState<CycleCountDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auditId === null) {
      setDetail(null);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setDetail(null);

    fetchWithAuth(API.CYCLE_COUNT.BY_ID(auditId), { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(getBomAuditError(json, "Failed to load the audit."));
        setDetail(json.data as CycleCountDetail);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load the audit.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [auditId]);

  return { detail, loading, error };
}
