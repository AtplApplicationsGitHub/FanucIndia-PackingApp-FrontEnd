export type AuditType = "cycle_count" | "bom" | "location" | "free_stock";

export type AuditRow = {
  storage: string;
  materialCode: string;
  quantity: number;
  excelRow: number;
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
};
export type BomAuditStatus = "ASSIGNED" | "CANCELLED";

export type BomAuditSummary = Omit<BomAudit, "totalRows" | "mergedRows">;

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
