"use client";

import { Box, Chip, Paper, Tooltip, Typography, useTheme } from "@mui/material";

import {
  ISSUE_COLORS,
  ISSUE_LABELS,
  ISSUE_ORDER,
} from "../../utils/reconLabels";
import type { ReconIssueType } from "../../types/reconciliation";

export default function IssueBreakdown({
  counts,
}: {
  counts: Record<ReconIssueType, number>;
}) {
  const theme = useTheme();
  const total = ISSUE_ORDER.reduce((n, t) => n + counts[t], 0);

  const colorOf = (type: ReconIssueType) => {
    const key = ISSUE_COLORS[type];

    return key === "default"
      ? theme.palette.grey[500]
      : theme.palette[key].main;
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography fontWeight={700}>Open variances by issue</Typography>
        <Chip size="small" label={total} sx={{ fontWeight: 600 }} />
      </Box>

      <Box
        sx={{
          display: "flex",
          height: 10,
          borderRadius: 5,
          overflow: "hidden",
          bgcolor: "action.hover",
        }}
      >
        {ISSUE_ORDER.filter((t) => counts[t] > 0).map((type) => (
          <Tooltip key={type} title={`${ISSUE_LABELS[type]}: ${counts[type]}`}>
            <Box
              sx={{
                width: `${(counts[type] / total) * 100}%`,
                bgcolor: colorOf(type),
              }}
            />
          </Tooltip>
        ))}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 1.5 }}>
        {ISSUE_ORDER.filter((type) => counts[type] > 0).map((type) => (
          <Box
            key={type}
            sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: colorOf(type),
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {ISSUE_LABELS[type]}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {counts[type]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
