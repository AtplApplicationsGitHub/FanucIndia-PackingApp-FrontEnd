"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { BomAuditDetail } from "../types/audit";

export function useBomAuditDetail(id: number | null) {
  const [detail, setDetail] = useState<BomAuditDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id === null) {
      setDetail(null);
      setError("");
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");
      setDetail(null);
      try {
        const res = await fetchWithAuth(API.BOM_AUDIT.BY_ID(id), {
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            getBomAuditError(json, "Failed to load audit details."),
          );
        }
        setDetail(json.data as BomAuditDetail);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
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
