"use client";
import * as React from "react";
import { API, fetchWithAuth } from "@/common/lib/api";
import type { MaterialFile } from "@/app/admin/material-files/types/material-file";

export type ListParams = {
  page: number;
  limit: number;
  sortBy: keyof MaterialFile | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  search?: string;
  saleOrderNumber?: string;
};

export type ListResponse = {
  items: MaterialFile[];
  meta: { page: number; limit: number; total: number; pages: number };
};

function buildQuery(params: Partial<ListParams>) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.sortBy) q.set("sortBy", String(params.sortBy));
  if (params.sortOrder) q.set("sortOrder", params.sortOrder);
  if (params.search) q.set("search", params.search);
  if (params.saleOrderNumber) q.set("saleOrderNumber", params.saleOrderNumber);
  return q.toString();
}

export function useFilesList(initial: Partial<ListParams>) {
  const [params, setParams] = React.useState<ListParams>({
    page: initial.page ?? 1,
    limit: initial.limit ?? 20,
    sortBy: (initial.sortBy ?? "createdAt") as ListParams["sortBy"],
    sortOrder: initial.sortOrder ?? "desc",
    search: initial.search ?? "",
    saleOrderNumber: initial.saleOrderNumber ?? "",
  });

  const [data, setData] = React.useState<ListResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const controllerRef = React.useRef<AbortController | null>(null);

  const getErrorMessage = (e: unknown): string => {
    if (typeof e === "string") return e;
    if (e instanceof Error) return e.message;
    return "Failed to load files";
  };

  const fetchList = React.useCallback(async (p: ListParams) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(p);
      const res = await fetchWithAuth(`${API.ERP_MATERIAL_FILES.BASE}?${qs}`, {
        method: "GET",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as ListResponse;
      setData(json);
    } catch (e: unknown) {
      // Abort: in browsers this is a DOMException('AbortError')
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchList(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder,
    params.search,
    params.saleOrderNumber,
  ]);

  const reload = React.useCallback(() => {
    void fetchList(params);
  }, [fetchList, params]);

  return { data, loading, error, params, setParams, reload };
}

type UpdateDto = Partial<
  Pick<MaterialFile, "saleOrderNumber" | "fileName" | "description">
>;

export function useFileMutations(onDone?: () => void) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const getErrorMessage = (e: unknown): string => {
    if (typeof e === "string") return e;
    if (e instanceof Error) return e.message;
    return "Operation failed";
  };

  const update = React.useCallback(
    async (id: number, dto: UpdateDto) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(
          `${API.ERP_MATERIAL_FILES.BASE}/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
          }
        );
        if (!res.ok) throw new Error(await res.text());
        onDone?.();
      } catch (e: unknown) {
        setError(getErrorMessage(e) || "Failed to update file");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [onDone]
  );

  const remove = React.useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(
          `${API.ERP_MATERIAL_FILES.BASE}/${id}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) throw new Error(await res.text());
        onDone?.();
      } catch (e: unknown) {
        setError(getErrorMessage(e) || "Failed to delete file");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [onDone]
  );

  return { update, remove, loading, error };
}
