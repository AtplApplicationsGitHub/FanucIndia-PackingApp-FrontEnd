import type { AuditListParams, AuditType } from "../types/audit";
import { AUDIT_TYPES } from "./auditLabels";

const KEY = "audit_planning_state";
const STATUSES = [
  "ALL",
  "ASSIGNED",
  "IN_PROGRESS",
  "RECONCILIATION_PENDING",
  "CLOSED",
];

type Saved = { tab: AuditType; params: AuditListParams };

// Load the saved planning state from sessionStorage
export function loadPlanningState(): Saved | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return AUDIT_TYPES.includes(s?.tab) ? s : null;
  } catch {
    return null;
  }
}
//
export function savePlanningState(tab: AuditType, params: AuditListParams) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ tab, params }));
  } catch {}
}

export function clearPlanningState() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

// Function to load the saved params for the given tab
export function loadSavedParams(
  tab: AuditType,
  fallback: AuditListParams,
): AuditListParams {
  const s = loadPlanningState();
  if (!s || s.tab !== tab) return fallback;
  const p = s.params;
  return {
    page: Number(p.page) > 0 ? Number(p.page) : 1,
    limit: Number(p.limit) > 0 ? Number(p.limit) : 10,
    search: typeof p.search === "string" ? p.search : "",
    status: STATUSES.includes(p.status as string) ? p.status : "ALL",
    fromDate: p.fromDate || undefined,
    toDate: p.toDate || undefined,
  };
}
