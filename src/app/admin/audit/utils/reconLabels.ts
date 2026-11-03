import type {
  ReconAuditStatus,
  ReconCategoryFilter,
  ReconIssueType,
  ReconLine,
  ReconVariance,
} from "../types/reconciliation";

type ChipColor = "default" | "error" | "warning" | "info" | "success";

export const RECON_STATUS_LABELS: Record<ReconAuditStatus, string> = {
  AWAITING_UPLOAD: "Awaiting Upload",
  NOT_STARTED: "Not Started",
  REVIEWING: "Reviewing",
  ALL_REVIEWED: "All Reviewed",
  CLOSED: "Closed",
};

export const RECON_STATUS_COLORS: Record<ReconAuditStatus, ChipColor> = {
  AWAITING_UPLOAD: "default",
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

/** A matched (VALID) line, or a line of a location not uploaded yet, has nothing to review, edit or close. */
export const isReviewable = (issueType: ReconIssueType | null) =>
  issueType !== null && issueType !== "VALID";

/** A table row as a discrepancy that can be reviewed (null for VALID / pending rows). */
export const toReviewable = (line: ReconLine): ReconVariance | null =>
  line.issueType &&
  line.issueType !== "VALID" &&
  line.status &&
  line.scannedQty !== null
    ? {
        ...line,
        issueType: line.issueType,
        status: line.status,
        scannedQty: line.scannedQty,
        sapAction: line.sapAction ?? "NONE",
      }
    : null;

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
