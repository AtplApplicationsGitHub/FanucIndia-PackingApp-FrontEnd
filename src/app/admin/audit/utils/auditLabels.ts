import type { AuditType } from "../types/audit";

export const AUDIT_LABELS: Record<AuditType, string> = {
  cycle_count: "Cycle Count",
  bom: "BOM Completeness",
  location: "Location Audit",
  free_stock: "Free Stock / 4th Axis",
};

// Mapping of audit types to their API values
export const AUDIT_TYPE_API: Record<AuditType, string> = {
  cycle_count: "CYCLE_COUNT",
  bom: "BOM_COMPLETENESS",
  location: "LOCATION_AUDIT",
  free_stock: "FREE_STOCK",
};

export const AUDIT_TYPES = Object.keys(AUDIT_TYPE_API) as AuditType[];

export const auditTypeFromApi = (value: string): AuditType | undefined =>
  AUDIT_TYPES.find((type) => AUDIT_TYPE_API[type] === value);
