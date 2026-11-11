import dayjs from "dayjs";
import type { AuditListRow } from "../types/audit";
import type { AuditDetailView } from "../types/auditDetail";
import type { CycleCountAuditDetail, CycleCountAuditListItem } from "../types/cycleCount";
import { auditStatusLabel } from "./auditStatus";

export function cycleCountListRow(audit: CycleCountAuditListItem): AuditListRow {
  const { id, auditNo, auditName, status, operatorId, operatorName, createdByName, createdAt,
    storageBinCount, storageBins, ...details } = audit;
  return {
    auditType: "CYCLE_COUNT",
    id, auditNo, auditName, status, operatorId, operatorName, createdByName, createdAt,
    storageBinCount, storageBins,
    statusLabel: auditStatusLabel(status),
    actions: { canReassign: status === "ASSIGNED", canDelete: false, canDownloadReport: status === "RECONCILIATION_PENDING" || status === "CLOSED" },
    details,
  };
}

export function cycleCountDetailToView(detail: CycleCountAuditDetail): AuditDetailView {
  return {
    auditNo: detail.auditNo,
    auditName: detail.auditName,
    status: detail.status,
    operatorName: detail.operatorName,
    createdByName: detail.createdByName,
    createdAt: detail.createdAt,
    sourceFile: detail.fileName,
    totalLocations: detail.totalLocations,
    totalItems: detail.totalMaterials,
    itemsLabel: "Total Materials",
    extraFields: [
      { label: "Issue Updated Date From", value: dayjs(detail.issueFromDate.slice(0, 10)).format("DD-MM-YYYY") },
      { label: "Issue Updated Date To", value: dayjs(detail.issueToDate.slice(0, 10)).format("DD-MM-YYYY") },
    ],
    issueDateRange: {
      from: dayjs(detail.issueFromDate.slice(0, 10)).format("DD-MM-YYYY"),
      to: dayjs(detail.issueToDate.slice(0, 10)).format("DD-MM-YYYY"),
    },
    downloadedAt: detail.downloadedAt ?? null,
    startedAt: detail.startedAt ?? null,
    submittedAt: detail.submittedAt ?? null,
    rows: detail.locations.flatMap((location) => location.materials.map((material) => ({
      storage: location.storageBin,
      materialCode: material.materialCode,
      quantity: material.expectedQty,
      excelRow: material.id,
    }))),
    locationUploads: detail.locations.map((location) => ({
      sequenceNo: location.sequenceNo,
      storageBin: location.storageBin,
      expectedMaterials: location.expectedMaterials,
      completedAt: location.verifiedAt ?? null,
      uploadedAt: location.uploadedAt ?? null,
    })),
  };
}
