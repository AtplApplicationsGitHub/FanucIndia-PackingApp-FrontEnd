"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { CycleCountAuditDetail } from "../types/cycleCount";

export function useCycleCountDetail(id: number | null) {
  const [detail, setDetail] = useState<CycleCountAuditDetail | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id === null) {
      setDetail(null);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");
      setDetail(null);
      try {
        const res = await fetchWithAuth(API.CYCLE_COUNT.BY_ID(id), {
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            getBomAuditError(json, "Failed to load audit details."),
          );
        }
        if (!controller.signal.aborted) setDetail(json.data as CycleCountAuditDetail);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(
          e instanceof Error ? e.message : "Failed to load audit details.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [id]);

  return { detail, loading, error };
}
