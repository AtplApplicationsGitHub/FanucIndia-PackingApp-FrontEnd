"use client";

import { useState } from "react";
import { notifyAuditsUpdated, showGlobalMessage } from "../utils/auditEvents";
import { releaseMockCycleCount } from "../utils/cycleCountMock";

type CreateCycleCountInput = Parameters<typeof releaseMockCycleCount>[0];

/**
 * Releases the Cycle Count audit(s).
 * MOCK for now (stored in the browser); replace releaseMockCycleCount with the real API call later.
 */
export function useCreateCycleCount() {
  const [loading, setLoading] = useState(false);

  const createCycleCount = async (data: CreateCycleCountInput) => {
    setLoading(true);
    try {
      const result = await releaseMockCycleCount(data);
      showGlobalMessage(result.message, "success");
      notifyAuditsUpdated();
      return result.audits;
    } finally {
      setLoading(false);
    }
  };

  return { createCycleCount, loading };
}
