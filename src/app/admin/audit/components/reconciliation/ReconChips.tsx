"use client";

import { Box, Chip, LinearProgress, Typography } from "@mui/material";

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

// >= 98 good, >= 95 watch, below that needs attention
export function AccuracyBar({
  value,
  width = 72,
}: {
  value: number;
  width?: number;
}) {
  const color = value >= 98 ? "success" : value >= 95 ? "warning" : "error";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, value)}
        color={color}
        sx={{ width, height: 6, borderRadius: 3 }}
      />
      <Typography variant="body2" fontWeight={600}>
        {value.toFixed(1)}%
      </Typography>
    </Box>
  );
}
