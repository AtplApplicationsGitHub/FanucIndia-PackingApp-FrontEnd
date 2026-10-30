import type { AuditRow } from "./audit";

/** One audit (any type) in the shape the audit detail page needs - built by utils/auditDetailView.ts */
export type AuditDetailView = {
  auditNo: string;
  auditName: string;
  /** ASSIGNED | IN_PROGRESS | RECONCILIATION_PENDING | CLOSED */
  status: string;
  operatorName: string;
  createdByName: string;
  createdAt: string;
  sourceFile: string;
  totalLocations: number;
  /** BOM: materials, Cycle Count: stock lines */
  totalItems: number;
  itemsLabel: string;
  /** Fields only this audit type has (label / value pairs shown as extra cards) */
  extraFields: { label: string; value: string }[];
  /** Handheld timeline (null until it happens, always null for types without it) */
  downloadedAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  /** Expected stock, one row per location + material */
  rows: AuditRow[];
};
