export type AuditType = "cycle_count" | "bom" | "location" | "free_stock";

export type AuditRow = {
  storage: string;
  materialCode: string;
  quantity: number;
  excelRow: number;
  /** Template upload: operator of this row's storage bin, as written in the file ("Name (email)") */
  operator?: string;
};
export type BomAudit = {
  id: number;
  auditNo: string;
  auditName: string;
  fileName: string;
  status: string;
  operatorId: number;
  operatorName: string;
  totalLocations: number;
  totalMaterials: number;
  createdByName: string;
  createdAt: string;
  totalRows: number;
  mergedRows: number;
  // Stage B - handheld timeline (null until it happens)
  downloadedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  submittedAt?: string | null;
  /** Audits created from the same uploaded file share this id (one audit per operator) */
  uploadBatchId?: string | null;
  /** Report Excel saved on the SFTP server after submit (null until the upload worked) */
  reportPath?: string | null;
  reportGeneratedAt?: string | null;
};
export type BomAuditStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RECONCILIATION_PENDING"
  | "CLOSED";

/** The 4 statuses shared by every audit type. */
export type AuditStatus = BomAuditStatus;

export type AuditStatusOption = {
  value: BomAuditStatus;
  label: string;
  canReassign: boolean;
  canDelete: boolean;
};

export type BomAuditSummary = Omit<BomAudit, "totalRows" | "mergedRows">;

/** data of POST /bom-audit - one audit per operator in the uploaded template */
export type CreateBomAuditResult = {
  auditName: string;
  uploadBatchId: string;
  totalLocations: number;
  totalMaterials: number;
  totalRows: number;
  mergedRows: number;
  audits: BomAuditSummary[];
};

export type BomAuditPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/* ---- GET /audit/list : one row shape for every audit type ---- */

export type AuditPagination = BomAuditPagination;

export type AuditListRow = {
  /** Backend enum: BOM_COMPLETENESS | CYCLE_COUNT | LOCATION_AUDIT | FREE_STOCK */
  auditType: string;
  id: number;
  auditNo: string;
  auditName: string;
  status: AuditStatus | string;
  statusLabel: string;
  operatorId: number;
  operatorName: string;
  storageBinCount: number;
  storageBins: { sequenceNo: number; storageBin: string }[];
  createdByName: string;
  createdAt: string;
  /** Which row buttons to show */
  actions: {
    canReassign: boolean;
    canDelete: boolean;
    canDownloadReport: boolean;
  };
  /** Fields only this audit type has (BOM: fileName ...; Cycle Count: stockFileName, movementFrom ...) */
  details: Record<string, unknown>;
};
/** Operator (role USER) from GET /audit/operators */
export type AuditOperator = {
  id: number;
  name: string;
  email: string;
};
export type AuditListParams = {
  page: number;
  limit: number;
  search: string;
  status: AuditStatus | "";
  fromDate?: string;
  toDate?: string;
};

export type BomAuditMaterial = {
  id: number;
  materialCode: string;
  expectedQty: number;
};

export type BomAuditLocation = {
  id: number;
  sequenceNo: number;
  storageBin: string;
  expectedMaterials: number;
  materials: BomAuditMaterial[];
};

export type BomAuditDetail = BomAuditSummary & {
  updatedAt: string;
  locations: BomAuditLocation[];
};
