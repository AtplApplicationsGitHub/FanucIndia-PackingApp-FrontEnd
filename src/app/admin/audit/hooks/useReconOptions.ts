"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "../utils/getBomAuditError";
import type { ReconOption, ReconOptions } from "../types/reconciliation";

let cached: ReconOptions | null = null;
let pending: Promise<ReconOptions> | null = null;

const fetchOptions = (): Promise<ReconOptions> => {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = (async () => {
      const res = await fetchWithAuth(API.AUDIT.RECONCILIATION.OPTIONS);
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(getBomAuditError(json, "Failed to load the review options."));
      cached = json.data as ReconOptions;
      return cached;
    })().finally(() => {
      pending = null;
    });
  }
  return pending;
};

export const optionLabel = (
  options: ReconOption[] | undefined,
  value: string | null | undefined,
) => (value ? (options?.find((o) => o.value === value)?.label ?? value) : "");

/** Decision / SAP follow-up options from the backend constants - loaded once and shared by every review popup. */
export function useReconOptions() {
  const [options, setOptions] = useState<ReconOptions | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cached) return;
    let active = true;
    fetchOptions()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Failed to load the review options.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { options, loading, error };
}
