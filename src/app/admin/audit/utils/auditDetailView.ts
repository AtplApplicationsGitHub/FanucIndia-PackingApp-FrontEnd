import type { AuditRow, BomAuditDetail } from "../types/audit";
import type { AuditDetailView } from "../types/auditDetail";

type LocationWithMaterials = {
  storageBin: string;
  materials: { id: number; materialCode: string; expectedQty: number }[];
};

const toRows = (locations: LocationWithMaterials[]): AuditRow[] =>
  locations.flatMap((l) =>
    l.materials.map((m) => ({
      storage: l.storageBin,
      materialCode: m.materialCode,
      quantity: m.expectedQty,
      excelRow: m.id,
    })),
  );

export const bomDetailToView = (d: BomAuditDetail): AuditDetailView => ({
  auditNo: d.auditNo,
  auditName: d.auditName,
  status: d.status,
  operatorName: d.operatorName,
  createdByName: d.createdByName,
  createdAt: d.createdAt,
  sourceFile: d.fileName,
  totalLocations: d.totalLocations,
  totalItems: d.totalMaterials,
  itemsLabel: "Total Materials",
  extraFields: [],
  downloadedAt: d.downloadedAt ?? null,
  startedAt: d.startedAt ?? null,
  submittedAt: d.submittedAt ?? null,
  rows: toRows(d.locations),
  locationUploads: d.locations.map((l) => ({
    sequenceNo: l.sequenceNo,
    storageBin: l.storageBin,
    expectedMaterials: l.expectedMaterials,
    completedAt: l.verifiedAt ?? null,
    uploadedAt: l.uploadedAt ?? null,
  })),
});
