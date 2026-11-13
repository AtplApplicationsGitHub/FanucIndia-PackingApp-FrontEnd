/**
 * BOM audit reconciliation (Stage C).
 * One audit = one operator (the server creates one audit per operator from the uploaded file).
 * A "variance" is a BomAuditMaterial line whose lineStatus is not VALID
 * (VALID lines are also returned, as issueType VALID, for the Valid filter):
 *   backend lineStatus  ->  issueType
 *   MISSING             ->  MISSING            (expected, not scanned)
 *   UNEXPECTED          ->  EXCESS             (scanned, not in the audit file)
 *   MISMATCH            ->  QUANTITY_MISMATCH  (actualQty != expectedQty)
 */
export type ReconAuditStatus =
  | "AWAITING_UPLOAD"
  | "NOT_STARTED"
  | "REVIEWING"
  | "ALL_REVIEWED"
  | "CLOSED";

export type ReconIssueType =
  | "MISSING"
  | "EXCESS"
  | "QUANTITY_MISMATCH"
  | "VALID"; // matched line - nothing to review

/** Category dropdown: a real issue type, or one of the two "group" options. */
export type ReconCategoryFilter = ReconIssueType | "ALL" | "ALL_EXCEPT_VALID";

export type ReconVarianceStatus = "OPEN" | "RESOLVED";

export type ReconDecision =
  | "CORRECT_SYSTEM_RECORD" // physical count is right -> SAP / system record needs correcting
  | "CORRECT_PHYSICAL_STOCK"; // system record is right -> physical stock needs correcting

/** Optional SAP follow-up. Behaviour is not finalised - stored only, nothing is posted. */
export type ReconSapAction = "NONE" | "FLAG_FOR_ADJUSTMENT";

/** One dropdown option of the review form (GET /audit/reconciliation/options - backend constants) */
export type ReconOption<T extends string = string> = {
  value: T;
  label: string;
};

export type ReconOptions = {
  decisions: ReconOption<ReconDecision>[];
  sapActions: ReconOption<ReconSapAction>[];
  defaultSapAction: ReconSapAction;
};

export type ReconVariance = {
  id: number; // BomAuditMaterial.id
  storageBin: string;
  materialCode: string;
  expectedQty: number;
  scannedQty: number; // actualQty (0 when not scanned)
  issueType: ReconIssueType;
  status: ReconVarianceStatus;
  decision: ReconDecision | null;
  sapAction: ReconSapAction;
  remarks: string;
  scannedAt: string | null; // lastScannedAt
  locationCompletedAt: string | null;
  resolvedAt: string | null;
  resolvedByName: string | null;
};

/**
 * One row of the Discrepancy table (GET .../lines, filtered and paged on the server).
 * pending = location not uploaded yet (In Progress): scanned values are null and shown as "-".
 * VALID and pending rows have no review status.
 */
export type ReconLine = Omit<
  ReconVariance,
  "scannedQty" | "issueType" | "status" | "sapAction"
> & {
  scannedQty: number | null;
  issueType: ReconIssueType | null;
  status: ReconVarianceStatus | null;
  sapAction: ReconSapAction | null;
  pending: boolean;
  batch?: string | null;
  certNo?: string | null;
};

export type ReconLineFilters = {
  search: string;
  storageBin: string;
  category: ReconCategoryFilter;
  status: ReconVarianceStatus | "ALL";
  page: number;
  limit: number;
};

export type ReconLocationSummary = {
  sequenceNo: number;
  storageBin: string;
  expectedMaterials: number;
  uploaded?: boolean;
  uploadedAt?: string | null;
  valid: number;
  mismatch: number;
  missing: number;
  unexpected: number;
  completedAt: string | null;
  totalVariances: number;
  openVariances: number;
  resolvedVariances: number;
};

export type ReconAuditDetail = {
  id: number;
  auditNo: string;
  auditName: string;
  auditType: string;
  status: string;
  reviewStatus: ReconAuditStatus;
  /** true while In Progress: uploaded locations only, nothing can be reviewed yet */
  partial: boolean;
  /** Review / Bulk Review allowed (Reconciliation Pending only) */
  canReview: boolean;
  operatorId: number;
  operatorName: string;
  fileName: string;
  createdAt: string;
  submittedAt: string | null;
  totalLocations: number;
  uploadedLocations: number;
  /** Expected lines of the whole audit file (expectedComponents counts uploaded locations only) */
  auditExpectedComponents: number;
  expectedComponents: number;
  scannedComponents: number;
  matchedComponents: number;
  /** Line accuracy: valid / (expected + unexpected lines). null = nothing to judge yet */
  accuracy: number | null;
  /** Quantity accuracy: 1 - wrong pieces / expected pieces. null = nothing expected */
  qtyAccuracy: number | null;
  totalVariances: number;
  openVariances: number;
  resolvedVariances: number;
  locations: ReconLocationSummary[];
  closedAt: string | null;
  closedByName: string | null;
  canClose: boolean;
};
