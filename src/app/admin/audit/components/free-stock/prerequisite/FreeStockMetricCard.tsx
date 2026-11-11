import type { ReactNode } from "react";
import { Box, Paper, Typography, alpha } from "@mui/material";
export default function FreeStockMetricCard({
  title,
  value,
  icon,
  highlight = false,
  mono = false,
}: {
  title: string;
  value: ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        minHeight: 54,
        px: 1,
        py: 0.75,
        borderRadius: 2,
        border: 1,
        borderColor: highlight ? "primary.main" : "divider",
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
        bgcolor: highlight
          ? (theme) => alpha(theme.palette.primary.main, 0.08)
          : "background.paper",
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            lineHeight: 1.3,
            overflowWrap: "anywhere",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: mono ? 14 : 16,
            fontWeight: 600,
            lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
