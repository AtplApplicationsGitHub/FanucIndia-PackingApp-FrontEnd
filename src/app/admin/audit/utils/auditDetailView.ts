import type { AuditRow, BomAuditDetail } from "../types/audit";
import type { AuditDetailView } from "../types/auditDetail";
import type {
  CncFilter,
  CycleCountDetail,
  SelectionMethod,
} from "../types/cycleCount";
import {
  CNC_FILTER_LABELS,
  SELECTION_METHOD_LABELS,
  formatDateOnly,
} from "./cycleCountLabels";

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
});

export const cycleCountDetailToView = (
  d: CycleCountDetail,
): AuditDetailView => ({
  auditNo: d.auditNo,
  auditName: d.auditName,
  status: d.status,
  operatorName: d.operatorName,
  createdByName: d.createdByName,
  createdAt: d.createdAt,
  sourceFile: d.stockFileName,
  totalLocations: d.totalLocations,
  totalItems: d.totalLines,
  itemsLabel: "Stock Lines",
  extraFields: [
    {
      label: "Movement Period",
      value: `${formatDateOnly(d.movementFrom)} – ${formatDateOnly(d.movementTo)}${d.includeArchived ? " (incl. archived)" : ""}`,
    },
    {
      label: "Picked By",
      value:
        SELECTION_METHOD_LABELS[d.selectionMethod as SelectionMethod] ??
        d.selectionMethod,
    },
    {
      label: "CNC",
      value: CNC_FILTER_LABELS[d.cncFilter as CncFilter] ?? d.cncFilter,
    },
    { label: "Material Class", value: d.materialClasses.join(", ") || "–" },
  ],
  downloadedAt: null,
  startedAt: null,
  submittedAt: null,
  rows: toRows(d.locations),
});
