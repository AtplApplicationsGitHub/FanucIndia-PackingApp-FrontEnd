/*
 * Phase 2 - Cycle Count (Phase A: create audit on the web).
 * Same shapes as the backend cycle-count module responses.
 */

export type CycleCountStatus = "ASSIGNED" | "CANCELLED";

export type SelectionMethod = "BUSIEST" | "RANDOM" | "MANUAL";
export type CncFilter = "BOTH" | "WITH_CNC" | "WITHOUT_CNC";
export type MaterialClass = "A" | "B" | "C";
export type MovementLevel = "HIGH" | "MEDIUM" | "LOW" | "NONE";

/** data of POST /cycle-count/stock-uploads and GET /cycle-count/stock-uploads/:id */
export type StockUpload = {
  id: number;
  fileName: string;
  totalRows: number;
  validRows: number;
  excludedRows: number;
  totalLocations: number;
  totalPackages: number;
  hasCertNoColumn: boolean;
  hasCncColumn: boolean;
  hasClassColumn: boolean;
  uploadedByName: string;
  createdAt: string;
  excludedByReason: { reason: string; label: string; count: number }[];
  /** First excluded rows (up to 500); excludedRows is the full count */
  excludedSample: {
    rowNo: number;
    storageBin: string;
    materialCode: string;
    qty: number | null;
    certNo: string | null;
    excludeReason: string;
    reasonLabel: string;
  }[];
};

/** Criteria sent to plan-preview and create (A2 + A4). */
export type PlanCriteria = {
  stockUploadId: number;
  fromDate: string;
  toDate: string;
  includeArchived: boolean;
  selectionMethod: SelectionMethod;
  cncFilter: CncFilter;
  materialClasses: MaterialClass[];
};

export type PlanCandidate = {
  storageBin: string;
  movementLines: number;
  transferOrders: number;
  archivedLines: number;
  movementLevel: MovementLevel;
  packages: number;
  lines: number;
  totalQty: number;
  classes: string[];
  hasCnc: boolean | null;
};

/** data of POST /cycle-count/plan-preview */
export type PlanPreview = {
  stockUpload: { id: number; fileName: string; totalLocations: number };
  movement: {
    fromDate: string;
    toDate: string;
    includeArchived: boolean;
    dateColumn: string;
    lines: number;
    liveLines: number;
    archivedLines: number;
    locationsMoved: number;
  };
  filters: { cncApplied: boolean; classApplied: boolean; notes: string[] };
  candidateCount: number;
  candidates?: PlanCandidate[];
  plan: PlanCandidate[];
  planTotals: { locations: number; lines: number; packages: number };
};

export type CycleCountOperator = { id: number; name: string; email: string };

export type CycleCountSummary = {
  id: number;
  auditNo: string;
  auditName: string;
  status: CycleCountStatus | string;
  operatorId: number;
  operatorName: string;
  stockUploadId: number;
  stockFileName: string;
  movementFrom: string;
  movementTo: string;
  includeArchived: boolean;
  selectionMethod: SelectionMethod | string;
  cncFilter: CncFilter | string;
  materialClasses: string[];
  totalLocations: number;
  totalLines: number;
  uploadBatchId: string;
  createdByName: string;
  createdAt: string;
  cancelledAt: string | null;
  cancelledByName: string | null;
};

export type CycleCountDetail = CycleCountSummary & {
  updatedAt: string;
  locations: {
    id: number;
    sequenceNo: number;
    storageBin: string;
    movementLines: number;
    movementLevel: MovementLevel | string;
    expectedLines: number;
    materials: {
      id: number;
      materialCode: string;
      certNo: string | null;
      batch: string | null;
      expectedQty: number;
    }[];
  }[];
};

export type CycleCountPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
