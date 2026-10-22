export type AuditType = "cycle_count" | "bom" | "location" | "free_stock";

export type AuditRow = {
  storage: string;
  materialCode: string;
  quantity: number;
  excelRow: number;
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
  cancelledAt: string | null;
  cancelledByName: string | null;
  totalRows: number;
  mergedRows: number;
  downloadedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  submittedAt?: string | null;
  uploadBatchId?: string | null;
};
export type BomAuditStatus =
  | "ASSIGNED"
  | "CANCELLED"
  | "DOWNLOADED"
  | "IN_PROGRESS"
  | "PENDING_RECONCILIATION";

export type BomAuditSummary = Omit<BomAudit, "totalRows" | "mergedRows">;

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
