"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { showGlobalMessage } from "../../../audit/utils/auditEvents";
import type { AuditPagination } from "../../types/audit";
import type { IbdListParams, IbdUpload } from "../../types/ibd";

const EMPTY_PAGINATION: AuditPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export function ibdError(json: any, fallback: string): string {
  const lines: string[] = [];
  if (Array.isArray(json?.message)) lines.push(...json.message.map(String));
  else if (json?.message) lines.push(String(json.message));

  const d = json?.details;
  if (d?.missingHeaders?.length) {
    lines.push(`Missing: ${d.missingHeaders.join(", ")}`);
  }
  if (d?.unexpectedHeaders?.length) {
    lines.push(`Unexpected: ${d.unexpectedHeaders.join(", ")}`);
  }
  if (d?.duplicateHeaders?.length) {
    lines.push(`Duplicate: ${d.duplicateHeaders.join(", ")}`);
  }
  return lines.join("\n") || fallback;
}

export function useIbdUploads() {
  const [params, setParams] = useState<IbdListParams>({
    page: 1,
    limit: 10,
    search: "",
  });
  const [uploads, setUploads] = useState<IbdUpload[]>([]);
  const [pagination, setPagination] =
    useState<AuditPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchList = useCallback(async (p: IbdListParams) => {
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

      const res = await fetchWithAuth(`${API.IBD_PRINT.UPLOADS}?${qs}`, {
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(ibdError(json, "Failed to load uploads."));
      if (controller.signal.aborted) return;

      const list: IbdUpload[] = json.data ?? [];
      const meta: AuditPagination = json.pagination ?? EMPTY_PAGINATION;
      setUploads(list);
      setPagination(meta);

      // Current page became empty (e.g. after a delete) -> last page with data
      if (list.length === 0 && p.page > 1) {
        setParams((prev) => ({ ...prev, page: Math.max(1, meta.totalPages) }));
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setUploads([]);
      showGlobalMessage(
        e instanceof Error ? e.message : "Failed to load uploads.",
        "error",
      );
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList(params);
  }, [params, fetchList]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const updateParams = useCallback(
    (next: Partial<IbdListParams>) =>
      setParams((prev) => ({ ...prev, ...next })),
    [],
  );

  // BE reads the whole file and saves it in one step (no preview step)
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetchWithAuth(API.IBD_PRINT.UPLOADS, {
        method: "POST",
        body,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(ibdError(json, "Failed to upload file."));

      showGlobalMessage(
        `${file.name} uploaded (${json.rowCount ?? 0} rows).`,
        "success",
      );
      // Newest upload is first: clear the search and go to page 1
      setParams((prev) => ({ ...prev, page: 1, search: "" }));
    } catch (e) {
      showGlobalMessage(
        e instanceof Error ? e.message : "Failed to upload file.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  return {
    uploads,
    pagination,
    params,
    loading,
    uploading,
    updateParams,
    upload,
  };
}
