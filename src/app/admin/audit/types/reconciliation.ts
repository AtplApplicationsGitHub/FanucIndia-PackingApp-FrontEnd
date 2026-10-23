/**
 * BOM audit reconciliation (Stage C).
 * One audit = one operator (the server creates one audit per operator from the uploaded file).
 * A "variance" is a BomAuditMaterial line whose lineStatus is not VALID:
 *   backend lineStatus  ->  issueType
 *   MISSING             ->  MISSING            (expected, not scanned)
 *   UNEXPECTED          ->  EXCESS             (scanned, not in the audit file)
 *   MISMATCH            ->  QUANTITY_MISMATCH  (actualQty != expectedQty)
 */
export type ReconAuditStatus =
  | "PENDING_RECONCILIATION"
  | "IN_PROGRESS"
  | "RECONCILED"
  | "CLOSED";

export type ReconIssueType = "MISSING" | "EXCESS" | "QUANTITY_MISMATCH";

export type ReconVarianceStatus = "OPEN" | "RESOLVED";

export type ReconDecision =
  | "CORRECT_SYSTEM_RECORD" // physical count is right -> SAP / system record needs correcting
  | "CORRECT_PHYSICAL_STOCK"; // system record is right -> physical stock needs correcting

/** Optional SAP follow-up. Behaviour is not finalised - stored only, nothing is posted. */
export type ReconSapAction = "NONE" | "FLAG_FOR_ADJUSTMENT";

export type ReconAuditSummary = {
  id: number;
  auditNo: string;
  auditName: string;
  operatorName: string;
  fileName: string;
  uploadedAt: string; // BomAudit.submittedAt
  totalLocations: number;
  expectedComponents: number; // material lines expected
  scannedComponents: number; // lines with a scan (incl. unexpected)
  matchedComponents: number; // lines with lineStatus VALID
  totalVariances: number;
  openVariances: number;
  status: ReconAuditStatus;
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
  resolvedAt: string | null;
  resolvedByName: string | null;
};

export type ReconAuditDetail = ReconAuditSummary & {
  closedAt: string | null;
  closedByName: string | null;
  variances: ReconVariance[];
};

export type ReconStats = {
  pendingCount: number;
  totalAudits: number;
  oldestPendingDays: number;
  inProgressCount: number;
  inProgressResolved: number;
  inProgressTotal: number;
  openVariances: number;
  openVarianceAudits: number;
  accuracy: number;
  matchedComponents: number;
  expectedComponents: number;
  openByIssue: Record<ReconIssueType, number>;
};
