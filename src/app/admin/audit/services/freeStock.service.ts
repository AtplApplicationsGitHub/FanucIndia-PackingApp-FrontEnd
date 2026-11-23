import { API, fetchWithAuth } from "@/common/lib/endpoints";
import type {
  BulkReservationPreview,
  BulkReservationResult,
  FreeStockFilters,
  FreeStockHistory,
  FreeStockList,
  FreeStockPagination,
  FreeStockRow,
  FreeStockUpload,
  ReservationLine,
  ReservationPreview,
  StockPreview,
  FreeStockDistinctSoResponse,
} from "../types/freeStock";
import { checked } from "../utils/free-stock/freeStockErrors";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // Sends the req to the BE
  const response = await checked(
    await fetchWithAuth(url, { cache: "no-store", ...options }),
  );
  return response.json() as Promise<T>;
}

// Provides the req configuration
const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// For excel files
function form(file: File, complete = false): FormData {
  const body = new FormData();
  body.set("file", file);
  if (complete) body.set("confirmFullSnapshot", "true");
  return body;
}

export const freeStockApi = {
  previewActivity: (stockItemIds: string, signal: AbortSignal) =>
    request<{ stockItemIds: number[]; staleStockItemIds?: number[] }>(
      API.FREE_STOCK.PREVIEW_ACTIVITY(stockItemIds),
      { signal },
    ),
  cancelPreviewActivity: async (previewId: string) => {
    await checked(
      await fetchWithAuth(API.FREE_STOCK.CANCEL_PREVIEW_ACTIVITY(previewId), {
        method: "DELETE",
        keepalive: true,
      }),
    );
  },
  // Preview manually selected stock - SALES
  previewSelected: (lines: ReservationLine[]) =>
    request<{ data: BulkReservationPreview }>(
      API.FREE_STOCK.SELECTED_PREVIEW,
      post({ lines }),
    ),
  // Confirm manually selected stock - SALES
  confirmSelected: (lines: ReservationLine[], previewToken: string) =>
    request<{ message: string; data: BulkReservationResult }>(
      API.FREE_STOCK.SELECTED_CONFIRM,
      post({ lines, previewToken }),
    ),
  // Preview uploaded Excel - SALES
  previewBulk: (file: File) =>
    request<{ data: BulkReservationPreview }>(API.FREE_STOCK.BULK_PREVIEW, {
      method: "POST",
      body: form(file),
    }),
  // Confirm uploaded Excel- SALES
  confirmBulk: (file: File, preview: BulkReservationPreview) => {
    const body = form(file);
    body.set("previewToken", preview.previewToken ?? "");
    return request<{ message: string; data: BulkReservationResult }>(
      API.FREE_STOCK.BULK_CONFIRM,
      { method: "POST", body },
    );
  },
  // fetches the stock records
  list: (filters: FreeStockFilters, signal?: AbortSignal) =>
    request<FreeStockList>(API.FREE_STOCK.STOCKS(filters), { signal }),
  // Distinct SO count
  distinctSo: (
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {},
    signal?: AbortSignal,
  ) =>
    request<FreeStockDistinctSoResponse>(API.FREE_STOCK.DISTINCT_SO(params), {
      signal,
    }),
  // Download one SO's rows as Excel - ADMIN
  exportSo: async (soNumber: string): Promise<Blob> => {
    const response = await checked(
      await fetchWithAuth(API.FREE_STOCK.DISTINCT_SO_EXPORT(soNumber), {
        cache: "no-store",
      }),
    );
    return response.blob();
  },
  // View details
  detail: (id: number, signal?: AbortSignal) =>
    request<{ data: FreeStockRow }>(API.FREE_STOCK.STOCK_BY_ID(id), { signal }),
  // reservation history
  history: (id: number, page: number, signal?: AbortSignal) =>
    request<{ data: FreeStockHistory[]; pagination: FreeStockPagination }>(
      API.FREE_STOCK.RESERVATION_HISTORY(id, page),
      { signal },
    ),
  // Stock upload history
  uploads: (page: number, signal?: AbortSignal) =>
    request<{ data: FreeStockUpload[]; pagination: FreeStockPagination }>(
      API.FREE_STOCK.UPLOADS(page),
      { signal },
    ),
  // Excel upload preview - ADMIN
  previewStock: (file: File) =>
    request<{ data: StockPreview }>(API.FREE_STOCK.PREVIEW_STOCK, {
      method: "POST",
      body: form(file),
    }),
  // Excel upload confirm - ADMIN
  uploadStock: (file: File, preview: StockPreview, skipInvalidRows = false) => {
    const body = form(file, true);
    body.set("previewToken", preview.previewToken);
    body.set("skipInvalidRows", String(skipInvalidRows));
    return request<{ message: string; data: FreeStockUpload }>(
      API.FREE_STOCK.UPLOAD_STOCK,
      { method: "POST", body },
    );
  },
  previewReservation: (file: File) =>
    request<{ data: ReservationPreview }>(API.FREE_STOCK.PREVIEW_RESERVATION, {
      method: "POST",
      body: form(file),
    }),
  uploadReservation: (file: File) =>
    request<{ message: string }>(API.FREE_STOCK.UPLOAD_RESERVATIONS, {
      method: "POST",
      body: form(file),
    }),
  reserve: (lines: ReservationLine[]) =>
    request<{ message: string }>(API.FREE_STOCK.RESERVE, post({ lines })),
  // Release single or multiple reserved stock items for ADMIN and SALES.
  release: (stockItemIds: number[]) =>
    request<{ message: string }>(
      API.FREE_STOCK.RELEASE,
      post({ stockItemIds }),
    ),
};
