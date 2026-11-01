"use client";

import { Chip } from "@mui/material";

import {
  ISSUE_COLORS,
  ISSUE_LABELS,
  RECON_STATUS_COLORS,
  RECON_STATUS_LABELS,
} from "../../utils/reconLabels";
import type {
  ReconAuditStatus,
  ReconIssueType,
  ReconVarianceStatus,
} from "../../types/reconciliation";

export function ReconStatusChip({ status }: { status: ReconAuditStatus }) {
  return (
    <Chip
      size="small"
      label={RECON_STATUS_LABELS[status]}
      color={RECON_STATUS_COLORS[status]}
    />
  );
}

export function IssueChip({ type }: { type: ReconIssueType }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={ISSUE_LABELS[type]}
      color={ISSUE_COLORS[type]}
    />
  );
}

export function VarianceStatusChip({
  status,
}: {
  status: ReconVarianceStatus;
}) {
  return (
    <Chip
      size="small"
      label={status === "OPEN" ? "Open" : "Resolved"}
      color={status === "OPEN" ? "warning" : "success"}
    />
  );
}
