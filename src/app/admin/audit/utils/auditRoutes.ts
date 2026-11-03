import type { AuditType } from "../types/audit";
import { AUDIT_TYPES } from "./auditLabels";

export const AUDIT_PLANNING_ROUTE = "/admin/audit/planning";

// Defines the audit types are allowed as tabs
export type PlanningTab = AuditType;

// Selection of Default tab
export const DEFAULT_PLANNING_TAB: PlanningTab = "cycle_count";

// Checks whether an Audit type from the URL is valid
export const isPlanningTab = (value: string | null): value is PlanningTab =>
  value !== null && (AUDIT_TYPES as string[]).includes(value);

// Returns the valid Audit type; otherwise selects Cycle Count
export const parsePlanningTab = (value: string | null): PlanningTab =>
  isPlanningTab(value) ? value : DEFAULT_PLANNING_TAB;

export const planningRoute = (tab?: PlanningTab) =>
  tab ? `${AUDIT_PLANNING_ROUTE}?tab=${tab}` : AUDIT_PLANNING_ROUTE;

export const auditViewRoute = (auditId: number, type: AuditType) =>
  `${AUDIT_PLANNING_ROUTE}/view/${auditId}?type=${type}`;

export const AUDIT_CREATE_ROUTES: Record<AuditType, string> = {
  bom: `${AUDIT_PLANNING_ROUTE}/create/bom`,
  cycle_count: `${AUDIT_PLANNING_ROUTE}/create/cycle-count`,
  location: `${AUDIT_PLANNING_ROUTE}/create/location`,
  free_stock: `${AUDIT_PLANNING_ROUTE}/create/free-stock`,
};
