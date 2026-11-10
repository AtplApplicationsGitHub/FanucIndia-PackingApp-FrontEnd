import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";
export default function FreeStockMetricCard({ title, value, icon }: { title: string; value: ReactNode; icon: ReactNode }) {
  return <Paper elevation={0} sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, minHeight: 72, px: 1.5, py: 1.25, borderRadius: 2, border: 1, borderColor: "divider", boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)", bgcolor: "background.paper" }}>
    <Box sx={{ width: 36, height: 36, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 1.5, color: "primary.contrastText", bgcolor: "primary.main" }}>{icon}</Box>
    <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "text.secondary", lineHeight: 1.4, overflowWrap: "anywhere" }}>{title}</Typography><Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, overflowWrap: "anywhere" }}>{value}</Typography></Box>
  </Paper>;
}
