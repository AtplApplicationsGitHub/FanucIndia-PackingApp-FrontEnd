import type {
  ReconAuditStatus,
  ReconDecision,
  ReconIssueType,
  ReconSapAction,
} from "../types/reconciliation";

type ChipColor = "default" | "error" | "warning" | "info" | "success";

export const RECON_STATUS_LABELS: Record<ReconAuditStatus, string> = {
  PENDING_RECONCILIATION: "Pending Reconciliation",
  IN_PROGRESS: "In Progress",
  RECONCILED: "Reconciled",
  CLOSED: "Closed",
};

export const RECON_STATUS_COLORS: Record<ReconAuditStatus, ChipColor> = {
  PENDING_RECONCILIATION: "warning",
  IN_PROGRESS: "info",
  RECONCILED: "success",
  CLOSED: "default",
};

export const ISSUE_ORDER: ReconIssueType[] = [
  "MISSING",
  "EXCESS",
  "QUANTITY_MISMATCH",
];

export const ISSUE_LABELS: Record<ReconIssueType, string> = {
  MISSING: "Missing",
  EXCESS: "Excess",
  QUANTITY_MISMATCH: "Quantity Mismatch",
};

export const ISSUE_HINTS: Record<ReconIssueType, string> = {
  MISSING: "Expected in the audit file but not scanned",
  EXCESS: "Scanned at the bin but not in the audit file",
  QUANTITY_MISMATCH: "Scanned quantity differs from the expected quantity",
};

export const ISSUE_COLORS: Record<ReconIssueType, ChipColor> = {
  MISSING: "error",
  EXCESS: "warning",
  QUANTITY_MISMATCH: "info",
};

export const DECISION_LABELS: Record<ReconDecision, string> = {
  CORRECT_SYSTEM_RECORD: "Accept physical count (correct SAP / system record)",
  CORRECT_PHYSICAL_STOCK: "Keep system record (correct physical stock)",
};

export const SAP_ACTION_LABELS: Record<ReconSapAction, string> = {
  NONE: "No SAP action",
  FLAG_FOR_ADJUSTMENT: "Flag for SAP adjustment",
};

export const isActiveStatus = (status: ReconAuditStatus) =>
  status === "PENDING_RECONCILIATION" || status === "IN_PROGRESS";

export const getAccuracy = (matched: number, expected: number) =>
  expected === 0 ? 100 : Math.round((matched / expected) * 1000) / 10;

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
