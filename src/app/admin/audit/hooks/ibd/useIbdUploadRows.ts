"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { showGlobalMessage } from "../../utils/auditEvents";
import { ibdError } from "./useIbdUploads";
import type { AuditPagination } from "../../types/audit";
import type { IbdRow, IbdRowsParams, IbdUpload } from "../../types/ibd";

const EMPTY_PAGINATION: AuditPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

/** Rows of one IBD upload (search + pagination) and the checkbox selection. */
export function useIbdUploadRows(uploadId: number) {
  const [params, setParams] = useState<IbdRowsParams>({
    page: 1,
    limit: 10,
    search: "",
  });
  const [upload, setUpload] = useState<IbdUpload | null>(null);
  const [rows, setRows] = useState<IbdRow[]>([]);
  const [pagination, setPagination] =
    useState<AuditPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  // Selected row ids are kept across pages
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const controllerRef = useRef<AbortController | null>(null);

  const fetchRows = useCallback(
    async (p: IbdRowsParams) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          page: String(p.page),
          limit: String(p.limit),
        });
        if (p.search) qs.set("search", p.search);

        const res = await fetchWithAuth(
          `${API.IBD_PRINT.UPLOAD_BY_ID(uploadId)}?${qs}`,
          { signal: controller.signal },
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(ibdError(json, "Failed to load rows."));
        if (controller.signal.aborted) return;

        setUpload(json.upload ?? null);
        setRows(json.data ?? []);
        setPagination(json.pagination ?? EMPTY_PAGINATION);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setRows([]);
        showGlobalMessage(
          e instanceof Error ? e.message : "Failed to load rows.",
          "error",
        );
      } finally {
        if (controllerRef.current === controller) setLoading(false);
      }
    },
    [uploadId],
  );

  useEffect(() => {
    if (Number.isInteger(uploadId) && uploadId > 0) void fetchRows(params);
  }, [params, fetchRows, uploadId]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const updateParams = useCallback(
    (next: Partial<IbdRowsParams>) =>
      setParams((prev) => ({ ...prev, ...next })),
    [],
  );

  const toggleRow = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Header checkbox: select / unselect every row on the current page
  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = rows.length > 0 && rows.every((r) => next.has(r.id));
      rows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  return {
    upload,
    rows,
    pagination,
    params,
    loading,
    selected,
    updateParams,
    toggleRow,
    togglePage,
    clearSelection,
  };
}
