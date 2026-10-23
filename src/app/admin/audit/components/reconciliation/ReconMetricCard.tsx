"use client";

import type { ReactNode } from "react";

import { Box, LinearProgress, Paper, Typography } from "@mui/material";

type Props = {
  title: string;
  value: ReactNode;
  caption?: ReactNode;
  icon: ReactNode;
  progress?: number;
  progressColor?: "primary" | "success" | "warning" | "error" | "info";
};

export default function ReconMetricCard({
  title,
  value,
  caption,
  icon,
  progress,
  progressColor = "primary",
}: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        height: "100%",
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>
            {title}
          </Typography>

          <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.3 }}>
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>
      </Box>

      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={Math.min(100, progress)}
          color={progressColor}
          sx={{ height: 6, borderRadius: 3 }}
        />
      )}

      {caption && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: "auto" }}
        >
          {caption}
        </Typography>
      )}
    </Paper>
  );
}
