import type {
  ReconAuditStatus,
  ReconCategoryFilter,
  ReconDecision,
  ReconIssueType,
  ReconSapAction,
} from "../types/reconciliation";

type ChipColor = "default" | "error" | "warning" | "info" | "success";

export const RECON_STATUS_LABELS: Record<ReconAuditStatus, string> = {
  NOT_STARTED: "Not Started",
  REVIEWING: "Reviewing",
  ALL_REVIEWED: "All Reviewed",
  CLOSED: "Closed",
};

export const RECON_STATUS_COLORS: Record<ReconAuditStatus, ChipColor> = {
  NOT_STARTED: "warning",
  REVIEWING: "info",
  ALL_REVIEWED: "success",
  CLOSED: "default",
};

// Discrepancy types only (VALID is not a discrepancy, so it is not in this list)
export const ISSUE_ORDER: ReconIssueType[] = [
  "QUANTITY_MISMATCH",
  "MISSING",
  "EXCESS",
];

export const ISSUE_LABELS: Record<ReconIssueType, string> = {
  VALID: "Valid",
  MISSING: "Missing",
  EXCESS: "Unexpected",
  QUANTITY_MISMATCH: "Mismatch",
};

export const ISSUE_HINTS: Record<ReconIssueType, string> = {
  VALID: "Scanned quantity matches the expected quantity",
  MISSING: "Expected in the audit file but not scanned",
  EXCESS: "Scanned at the bin but not in the audit file",
  QUANTITY_MISMATCH: "Scanned quantity differs from the expected quantity",
};

export const ISSUE_COLORS: Record<ReconIssueType, ChipColor> = {
  VALID: "success",
  MISSING: "error",
  EXCESS: "warning",
  QUANTITY_MISMATCH: "info",
};

// Category dropdown: group options + the default
export const CATEGORY_ALL = "ALL";
export const CATEGORY_ALL_EXCEPT_VALID = "ALL_EXCEPT_VALID";
export const CATEGORY_DEFAULT: ReconCategoryFilter = CATEGORY_ALL_EXCEPT_VALID;

export const CATEGORY_GROUP_LABELS = {
  [CATEGORY_ALL]: "All Categories",
  [CATEGORY_ALL_EXCEPT_VALID]: "All Except Valid",
} as const;

/** A matched (VALID) line has nothing to review, edit or close. */
export const isReviewable = (issueType: ReconIssueType) => issueType !== "VALID";

export const matchesCategory = (
  issueType: ReconIssueType,
  filter: ReconCategoryFilter,
) =>
  filter === CATEGORY_ALL ||
  (filter === CATEGORY_ALL_EXCEPT_VALID
    ? isReviewable(issueType)
    : issueType === filter);

export const DECISION_LABELS: Record<ReconDecision, string> = {
  CORRECT_SYSTEM_RECORD: "Accept physical count (correct SAP / system record)",
  CORRECT_PHYSICAL_STOCK: "Keep system record (correct physical stock)",
};

export const SAP_ACTION_LABELS: Record<ReconSapAction, string> = {
  NONE: "No SAP action",
  FLAG_FOR_ADJUSTMENT: "Flag for SAP adjustment",
};

export const getAccuracy = (matched: number, expected: number) =>
  expected === 0 ? 100 : Math.round((matched / expected) * 1000) / 10;

export const formatDateTime = (value: string) =>
  new Date(value)
    .toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (meridiem) => meridiem.toUpperCase());
