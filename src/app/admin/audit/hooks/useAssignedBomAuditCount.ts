"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

export function useAssignedBomAuditCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetchWithAuth(
          `${API.BOM_AUDIT.BASE}?status=ASSIGNED&limit=1`,
        );
        if (!res.ok) return;
        const json = await res.json();
        if (active) setCount(json.pagination?.total ?? 0);
      } catch {
        // count is only informational
      }
    };

    void load();
    window.addEventListener("bom-audits-updated", load);
    return () => {
      active = false;
      window.removeEventListener("bom-audits-updated", load);
    };
  }, []);

  return count;
}
