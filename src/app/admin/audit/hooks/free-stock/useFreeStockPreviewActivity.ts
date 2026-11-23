"use client";

import { useEffect, useState } from "react";
import { freeStockApi } from "../../services/freeStock.service";

const POLL_INTERVAL_MS = 5000;
const NO_ACTIVITY: ReadonlySet<number> = new Set();

export function useFreeStockPreviewActivity(
  stockItemIds: string,
  loading: boolean,
  onStockChanged: () => void,
): ReadonlySet<number> {
  const [activity, setActivity] = useState<{
    scope: string;
    ids: ReadonlySet<number>;
  } | null>(null);

  useEffect(() => {
    if (!stockItemIds || loading) return;

    const lifecycle = new AbortController();
    let timer: number | undefined;

    const poll = async () => {
      if (document.visibilityState === "visible") {
        const signal = AbortSignal.any([
          lifecycle.signal,
          AbortSignal.timeout(POLL_INTERVAL_MS),
        ]);
        try {
          const response = await freeStockApi.previewActivity(stockItemIds, signal);
          if (lifecycle.signal.aborted) return;

          setActivity({ scope: stockItemIds, ids: new Set(response.stockItemIds) });
          if (response.staleStockItemIds?.length) {
            // Refresh the current filters so rows, pagination and counts agree.
            onStockChanged();
          }
        } catch {
          if (!lifecycle.signal.aborted) {
            setActivity({ scope: stockItemIds, ids: NO_ACTIVITY });
          }
        }
      }

      if (!lifecycle.signal.aborted) {
        timer = window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
      }
    };

    void poll();
    return () => {
      lifecycle.abort();
      window.clearTimeout(timer);
    };
  }, [stockItemIds, loading, onStockChanged]);

  return activity?.scope === stockItemIds ? activity.ids : NO_ACTIVITY;
}

export function useClearFreeStockPreview(previewId?: string) {
  useEffect(() => {
    if (!previewId) return;

    return () => {
      void freeStockApi.cancelPreviewActivity(previewId).catch(() => {
        // The backend expires activity if the tab closes or the request fails.
      });
    };
  }, [previewId]);
}
