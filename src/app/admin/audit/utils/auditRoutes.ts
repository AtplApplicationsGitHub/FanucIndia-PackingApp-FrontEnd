import type { AuditType } from "../types/audit";
import { AUDIT_TYPES } from "./auditLabels";

export const AUDIT_PLANNING_ROUTE = "/admin/audit/planning";

/** The selected stat card (= the audit type listed below it) lives in the URL: ?tab= */
export type PlanningTab = AuditType;
/** Audit type shown when the planning page opens without ?tab= */
export const DEFAULT_PLANNING_TAB: PlanningTab = "cycle_count";

export const isPlanningTab = (value: string | null): value is PlanningTab =>
  value !== null && (AUDIT_TYPES as string[]).includes(value);

export const parsePlanningTab = (value: string | null): PlanningTab =>
  isPlanningTab(value) ? value : DEFAULT_PLANNING_TAB;
export const planningRoute = (tab?: PlanningTab) =>
  tab ? `${AUDIT_PLANNING_ROUTE}?tab=${tab}` : AUDIT_PLANNING_ROUTE;

export const AUDIT_RECONCILIATION_ROUTE = "/admin/audit/reconciliation";

/**
 * Detail page of one audit.
 * - from the Reconciliation list: no type (reconciliation audits)
 * - from Audit Planning: pass the audit type, the page then shows the view of the audit's status
 */
export const reconciliationDetailRoute = (auditId: number, type?: AuditType) =>
  type
    ? `${AUDIT_RECONCILIATION_ROUTE}/${auditId}?type=${type}`
    : `${AUDIT_RECONCILIATION_ROUTE}/${auditId}`;

export const AUDIT_CREATE_ROUTES: Record<AuditType, string> = {
  bom: `${AUDIT_PLANNING_ROUTE}/create/bom`,
  cycle_count: `${AUDIT_PLANNING_ROUTE}/create/cycle-count`,
  location: `${AUDIT_PLANNING_ROUTE}/create/location`,
  free_stock: `${AUDIT_PLANNING_ROUTE}/create/free-stock`,
};
