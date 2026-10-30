"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { showGlobalMessage } from "../utils/auditEvents";
import type { AuditOperator } from "../types/audit";

/**
 * Operators for the inline "Assigned To" editor (GET /audit/operators).
 * Loaded ONCE, the first time `enabled` becomes true (= the table has a row that can be reassigned);
 * the editor filters this list on the client after 3 typed characters.
 */
export function useAuditOperators(enabled: boolean) {
  const [operators, setOperators] = useState<AuditOperator[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled || loaded) return;
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetchWithAuth(API.AUDIT.OPERATORS);
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (active) setOperators(json.data ?? []);
      } catch {
        if (active) showGlobalMessage("Unable to load operators.", "error");
      } finally {
        if (active) {
          setLoaded(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [enabled, loaded]);

  return { operators, loading };
}
