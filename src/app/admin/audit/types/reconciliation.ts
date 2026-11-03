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

export type ReconLocationSummary = {
  sequenceNo: number;
  storageBin: string;
  expectedMaterials: number;
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
  operatorId: number;
  operatorName: string;
  fileName: string;
  createdAt: string;
  submittedAt: string | null;
  totalLocations: number;
  expectedComponents: number;
  scannedComponents: number;
  matchedComponents: number;
  accuracy: number;
  totalVariances: number;
  openVariances: number;
  resolvedVariances: number;
  locations: ReconLocationSummary[];
  variances: ReconVariance[];
  closedAt: string | null;
  closedByName: string | null;
  canClose: boolean;
};
