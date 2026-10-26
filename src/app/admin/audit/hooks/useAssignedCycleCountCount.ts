"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { CYCLE_COUNT_UPDATED_EVENT } from "../utils/cycleCountApi";

/** "N assigned audits" on the Cycle Count card (same as useAssignedBomAuditCount). */
export function useAssignedCycleCountCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetchWithAuth(API.CYCLE_COUNT.LIST({ status: "ASSIGNED", limit: 1 }));
        if (!res.ok) return;
        const json = await res.json();
        if (active) setCount(json.pagination?.total ?? 0);
      } catch {
        // count is only informational
      }
    };
    void load();
    window.addEventListener(CYCLE_COUNT_UPDATED_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(CYCLE_COUNT_UPDATED_EVENT, load);
    };
  }, []);

  return count;
}
