import type { ChipProps } from "@mui/material";

/** Colour of an audit status (shared by every audit type). The label comes from the API (statusLabel / /audit/statuses). */
export function auditStatusColor(status: string): ChipProps["color"] {
  switch (status) {
    case "ASSIGNED":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "RECONCILIATION_PENDING":
      return "secondary";
    case "CLOSED":
      return "success";
    default:
      return "default";
  }
}

/** Fallback label for screens that only have the status code (detail dialogs). */
export function auditStatusLabel(status: string): string {
  switch (status) {
    case "ASSIGNED":
      return "Assigned";
    case "IN_PROGRESS":
      return "In Progress";
    case "RECONCILIATION_PENDING":
      return "Reconciliation Pending";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}
