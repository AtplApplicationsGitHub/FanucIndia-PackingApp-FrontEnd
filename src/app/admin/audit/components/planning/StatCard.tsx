"use client";

import { Paper, Typography } from "@mui/material";

type Props = {
  label: string;
  value: string | number;
  caption?: string;
  accent?: "primary" | "warning" | "info";
};

export default function StatCard({
  label,
  value,
  caption,
  accent = "primary",
}: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 0.9,
        height: "100%",
        borderRadius: 2,
        borderLeft: (theme) => `4px solid ${theme.palette[accent].main}`,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        sx={{
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
        {value}
      </Typography>

      {caption && (
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          display="block"
        >
          {caption}
        </Typography>
      )}
    </Paper>
  );
}
