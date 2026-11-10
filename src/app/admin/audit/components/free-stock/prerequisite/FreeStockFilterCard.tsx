"use client";
import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";
export default function FreeStockFilterCard({ title, count, icon, selected, onSelect }: { title: string; count: number; icon: ReactNode; selected: boolean; onSelect: () => void }) {
  return <Paper variant="outlined" role="button" tabIndex={0} aria-pressed={selected} onClick={onSelect} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(); } }} sx={(theme) => ({ px: 1.5, py: 1.2, borderRadius: 2, height: "100%", display: "flex", alignItems: "center", gap: 1, cursor: "pointer", borderColor: selected ? theme.palette.primary.main : undefined, boxShadow: selected ? `0 0 0 1px ${theme.palette.primary.main}` : "none", transition: "border-color 0.15s, box-shadow 0.15s", "&:hover": { borderColor: theme.palette.primary.main } })}>
    <Box sx={{ width: 38, height: 40, flexShrink: 0, bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 1, display: "grid", placeItems: "center" }}>{icon}</Box>
    <Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={700} noWrap title={title}>{title}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{count.toLocaleString()} items</Typography></Box>
  </Paper>;
}
