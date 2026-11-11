import type { AuditStatus, BomAuditPreview, BomAuditLocation } from "./audit";

export type CycleCountDateInput = {
  fromDate: string;
  toDate: string;
};

export type CycleCountSelection = CycleCountDateInput & {
  sourceSoCount: number;
  qualifyingSoCount: number;
  sourceBinCount: number;
  uploadedBinCount: number;
  matchedBinCount: number;
  excludedBinCount: number;
};

export type CycleCountPreview = Pick<BomAuditPreview, "fileName" | "totalLocations" | "totalMaterials" | "locations"> & {
  uploadedRows: number;
  uploadedMergedRows: number;
  selection: CycleCountSelection;
};

export type CreateCycleCountInput = CycleCountDateInput & {
  file: File;
  auditName: string;
  binOperators?: { storageBin: string; operatorId: number }[];
};

export type CycleCountAuditSummary = {
  id: number;
  auditNo: string;
  auditName: string;
  fileName: string;
  status: AuditStatus;
  operatorId: number;
  operatorName: string;
  totalLocations: number;
  totalMaterials: number;
  createdByName: string;
  createdAt: string;
  downloadedAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  closedAt: string | null;
  closedByName: string | null;
  uploadBatchId: string;
  issueFromDate: string;
  issueToDate: string;
  sourceSoCount: number;
  qualifyingSoCount: number;
  sourceBinCount: number;
  uploadedBinCount: number;
  matchedBinCount: number;
};

export type CreateCycleCountResult = Pick<CycleCountPreview, "totalLocations" | "totalMaterials" | "uploadedRows" | "uploadedMergedRows" | "selection"> & {
  auditName: string;
  uploadBatchId: string;
  audits: CycleCountAuditSummary[];
};

export type CycleCountAuditListItem = CycleCountAuditSummary & {
  storageBinCount: number;
  storageBins: { sequenceNo: number; storageBin: string }[];
  uploadedLocations: number;
};

export type CycleCountAuditDetail = CycleCountAuditSummary & {
  updatedAt: string;
  locations: Pick<BomAuditLocation, "id" | "sequenceNo" | "storageBin" | "expectedMaterials" | "materials" | "verifiedAt" | "uploadedAt">[];
};
