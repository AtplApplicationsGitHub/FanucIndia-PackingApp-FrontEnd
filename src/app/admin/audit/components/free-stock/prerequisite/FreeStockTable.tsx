"use client";
import { Box, Checkbox, IconButton, LinearProgress, Tooltip, Typography } from "@mui/material";
import { Eye, Unlock } from "lucide-react";
import { FREE_STOCK_TABLE_COLUMNS } from "../../../utils/free-stock/freeStockColumns";
import type { FreeStockRow } from "../../../types/freeStock";
import { stockCell } from "../../../utils/free-stock/freeStockFormat";
import FreeStockStatusChip from "./FreeStockStatusChip";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockPagination from "./FreeStockPagination";
type Props = {
  rows: FreeStockRow[]; total: number; page: number; size: number; loading: boolean;
  selected: number[]; onSelect: (ids: number[]) => void; onPage: (page: number) => void; onSize: (size: number) => void;
  onView: (id: number) => void; onRelease: (row: FreeStockRow) => void;
};
export default function FreeStockTable({ rows, total, page, size, loading, selected, onSelect, onPage, onSize, onView, onRelease }: Props) {
  const selectable = rows.filter((r) => r.canReserve || r.canRelease).map((r) => r.id);
  const all = selectable.length > 0 && selectable.every((id) => selected.includes(id));
  const selection = <Checkbox size="small" sx={{ p: 0.4 }} disabled={loading || !selectable.length} checked={all} indeterminate={!all && selected.length > 0} onChange={() => onSelect(all ? [] : selectable)} inputProps={{ "aria-label": "Select eligible rows on this page" }} />;
  const widths = ["8%", "14%", "11%", "6%", "8%", "11%", "8%", "8%", "8%", "8%"];
  const columns: FreeStockDataColumn<FreeStockRow>[] = [
    { key: "actions", label: "Actions", width: "10%", header: <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>{selection}Actions</Box>, render: (row) => <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.1 }}>
      <Checkbox size="small" sx={{ p: 0.4 }} disabled={loading || (!row.canReserve && !row.canRelease)} checked={selected.includes(row.id)} onChange={() => onSelect(selected.includes(row.id) ? selected.filter((id) => id !== row.id) : [...selected, row.id])} inputProps={{ "aria-label": `Select ${row.materialCode} ${row.batch}` }} />
      <Tooltip title="View details"><span><IconButton aria-label={`View ${row.materialCode} ${row.batch}`} size="small" disabled={loading} onClick={() => onView(row.id)}><Eye size={16} /></IconButton></span></Tooltip>
      {row.canRelease && <Tooltip title="Release reservation"><span><IconButton aria-label={`Release ${row.materialCode} ${row.batch}`} size="small" disabled={loading} color="error" onClick={() => onRelease(row)}><Unlock size={16} /></IconButton></span></Tooltip>}
    </Box> },
    ...FREE_STOCK_TABLE_COLUMNS.map((column, index) => ({ key: column.key, label: column.label, width: widths[index], render: (row: FreeStockRow) => column.key === "status" ? <FreeStockStatusChip status={row.status} /> : <Box component="span" sx={{ fontWeight: ["materialCode", "batch", "stockQty"].includes(column.key) ? 600 : 400 }}>{stockCell(row, column)}</Box> })),
  ];
  return <Box sx={{ minWidth: 0, width: "100%" }}>
    <Box sx={{ height: 3 }}>{loading && <LinearProgress />}</Box>
    <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 0.5, px: 1, pb: 0.5 }}>{selection}<Typography variant="caption">Select eligible rows on this page</Typography></Box>
    <FreeStockDataTable columns={columns} rows={rows} rowKey={(row) => row.id} stackBelow="lg" maxHeight="65vh" emptyText={loading ? "Loading stock…" : "No stock found."} />
    <FreeStockPagination count={total} page={page} size={size} onPage={onPage} onSize={onSize} disabled={loading} />
  </Box>;
}
