"use client";

import { useCallback, useState } from "react";
import { parseCycleCountExcel } from "../utils/cycleCountExcel";

/**
 * Reads the Excel and returns the distinct locations for the preview.
 * Parsed in the browser for now; replace the body with the preview API call when the backend is ready.
 */
export function usePreviewCycleCount() {
  const [loading, setLoading] = useState(false);

  const previewCycleCount = useCallback(async (file: File) => {
    setLoading(true);
    try {
      return await parseCycleCountExcel(file);
    } finally {
      setLoading(false);
    }
  }, []);

  return { previewCycleCount, loading };
}
