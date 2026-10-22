import type { ChipProps } from "@mui/material";
import type { BomAuditStatus } from "../types/audit";

/*
 * BOM audit statuses shown on the web (same values as the backend BOM_AUDIT_STATUS).
 * Flow: ASSIGNED -> DOWNLOADED -> IN_PROGRESS -> PENDING_RECONCILIATION (or CANCELLED while ASSIGNED)
 */
export const BOM_AUDIT_STATUS_OPTIONS: { value: BomAuditStatus; label: string }[] = [
  { value: "ASSIGNED", label: "Assigned" },
  { value: "DOWNLOADED", label: "Downloaded" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING_RECONCILIATION", label: "Pending Reconciliation" },
  { value: "CANCELLED", label: "Cancelled" },
];

/** "PENDING_RECONCILIATION" -> "Pending Reconciliation" (unknown values are shown as they come). */
export function bomAuditStatusLabel(status: string): string {
  return BOM_AUDIT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

/** Chip colour for a status. */
export function bomAuditStatusColor(status: string): ChipProps["color"] {
  switch (status) {
    case "ASSIGNED":
      return "warning";
    case "DOWNLOADED":
      return "info";
    case "IN_PROGRESS":
      return "secondary";
    case "PENDING_RECONCILIATION":
      return "success";
    default:
      return "default";
  }
}
