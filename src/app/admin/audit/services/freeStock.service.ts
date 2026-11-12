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
} from "../types/freeStock";
import { checked } from "../utils/free-stock/freeStockErrors";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await checked(
    await fetchWithAuth(url, { cache: "no-store", ...options }),
  );
  return response.json() as Promise<T>;
}
const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
function form(file: File, complete = false): FormData {
  const body = new FormData();
  body.set("file", file);
  if (complete) body.set("confirmFullSnapshot", "true");
  return body;
}
export const freeStockApi = {
  previewSelected: (lines: ReservationLine[]) =>
    request<{ data: BulkReservationPreview }>(API.FREE_STOCK.SELECTED_PREVIEW, post({ lines })),
  confirmSelected: (lines: ReservationLine[], previewToken: string) =>
    request<{ message: string; data: BulkReservationResult }>(API.FREE_STOCK.SELECTED_CONFIRM, post({ lines, previewToken })),
  previewBulk: (file: File) =>
    request<{ data: BulkReservationPreview }>(API.FREE_STOCK.BULK_PREVIEW, {
      method: "POST",
      body: form(file),
    }),
  confirmBulk: (file: File, preview: BulkReservationPreview) => {
    const body = form(file);
    body.set("previewToken", preview.previewToken ?? "");
    return request<{ message: string; data: BulkReservationResult }>(
      API.FREE_STOCK.BULK_CONFIRM,
      { method: "POST", body },
    );
  },
  list: (filters: FreeStockFilters, signal?: AbortSignal) =>
    request<FreeStockList>(API.FREE_STOCK.STOCKS(filters), { signal }),
  detail: (id: number, signal?: AbortSignal) =>
    request<{ data: FreeStockRow }>(API.FREE_STOCK.STOCK_BY_ID(id), { signal }),
  history: (id: number, page: number, signal?: AbortSignal) =>
    request<{ data: FreeStockHistory[]; pagination: FreeStockPagination }>(
      API.FREE_STOCK.RESERVATION_HISTORY(id, page),
      { signal },
    ),
  uploads: (page: number, signal?: AbortSignal) =>
    request<{ data: FreeStockUpload[]; pagination: FreeStockPagination }>(
      API.FREE_STOCK.UPLOADS(page),
      { signal },
    ),
  uploadDetail: (id: number, signal?: AbortSignal) =>
    request<{ data: FreeStockUpload }>(API.FREE_STOCK.UPLOAD_BY_ID(id), {
      signal,
    }),
  previewStock: (file: File) =>
    request<{ data: StockPreview }>(API.FREE_STOCK.PREVIEW_STOCK, {
      method: "POST",
      body: form(file),
    }),
  uploadStock: (file: File, preview: StockPreview, skipInvalidRows = false) => {
    const body = form(file, true);
    body.set("previewToken", preview.previewToken);
    body.set("skipInvalidRows", String(skipInvalidRows));
    return request<{ message: string; data: FreeStockUpload }>(API.FREE_STOCK.UPLOAD_STOCK, { method: "POST", body });
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
  release: (stockItemIds: number[]) =>
    request<{ message: string }>(
      API.FREE_STOCK.RELEASE,
      post({ stockItemIds }),
    ),
};
