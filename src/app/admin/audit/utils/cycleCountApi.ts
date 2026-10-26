import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { getBomAuditError } from "./getBomAuditError";
import type {
  CycleCountOperator,
  CycleCountSummary,
  PlanCriteria,
  PlanPreview,
  StockUpload,
} from "../types/cycleCount";

/*
 * Cycle Count API calls (Phase A). Every function throws an Error with the server message
 * (same error body as BOM: { code, message, errors? }), so screens can show it as-is.
 */

/** Refresh event for the tracker table and the card count (same idea as "bom-audits-updated"). */
export const CYCLE_COUNT_UPDATED_EVENT = "cycle-count-audits-updated";

async function readJson(res: Response, fallback: string) {
  if (res.status === 413) throw new Error("File larger than 10 MB");
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getBomAuditError(json, fallback));
  return json;
}

const jsonPost = (url: string, body: unknown) =>
  fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/** A1 + A3: upload the LX03 file; the server validates it and keeps it for planning. */
export async function uploadCycleCountStock(file: File): Promise<StockUpload> {
  const formData = new FormData();
  formData.append("file", file);
  // Do NOT set Content-Type here; the browser sets it for multipart
  const res = await fetchWithAuth(API.CYCLE_COUNT.STOCK_UPLOADS, {
    method: "POST",
    body: formData,
  });
  const json = await readJson(res, "Failed to upload the stock file.");
  return json.data as StockUpload;
}

/** A2 + A4: movement analysis + planned locations. Nothing is saved. */
export async function previewCycleCountPlan(
  body: PlanCriteria & { locationCount?: number; storageBins?: string[] },
): Promise<PlanPreview> {
  const res = await jsonPost(API.CYCLE_COUNT.PLAN_PREVIEW, body);
  const json = await readJson(res, "Failed to generate the plan.");
  return json.data as PlanPreview;
}

/** A5: release the previewed plan - one audit per operator. */
export async function createCycleCount(
  body: PlanCriteria & {
    auditName: string;
    storageBins: string[];
    operatorIds: number[];
  },
): Promise<{ message: string; audits: CycleCountSummary[] }> {
  const res = await jsonPost(API.CYCLE_COUNT.BASE, body);
  const json = await readJson(res, "Failed to release the Cycle Count audit.");
  return { message: json.message, audits: json.data?.audits ?? [] };
}

export async function loadCycleCountOperators(): Promise<CycleCountOperator[]> {
  const res = await fetchWithAuth(API.CYCLE_COUNT.OPERATORS);
  const json = await readJson(res, "Unable to load operators. Please try again.");
  return Array.isArray(json.data) ? (json.data as CycleCountOperator[]) : [];
}

export async function cancelCycleCount(id: number): Promise<string> {
  const res = await fetchWithAuth(API.CYCLE_COUNT.CANCEL(id), { method: "PATCH" });
  const json = await readJson(res, "Failed to cancel the audit.");
  return json.message as string;
}

/** Same global snackbar the rest of DIMS uses. */
export function showGlobalMessage(message: string, severity: "success" | "error" | "info" | "warning") {
  window.dispatchEvent(
    new CustomEvent("show-global-message", { detail: { message, severity } }),
  );
}
