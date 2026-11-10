"use client";
import type { ReactNode } from "react";
import { alpha, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { Breakpoint } from "@mui/material";
export type FreeStockDataColumn<T> = { key: string; label: string; header?: ReactNode; width?: string; render: (row: T) => ReactNode };
type Props<T> = { columns: FreeStockDataColumn<T>[]; rows: T[]; rowKey: (row: T) => string | number; emptyText?: string; stackBelow?: Breakpoint | false; maxHeight?: number | string };
export default function FreeStockDataTable<T>({ columns, rows, rowKey, emptyText = "No records found.", stackBelow = "sm", maxHeight }: Props<T>) {
  return <TableContainer sx={{ maxHeight, width: "100%", maxWidth: "100%", overflowX: "hidden", border: 1, borderColor: "divider", borderRadius: 1 }}>
    <Table size="small" stickyHeader={Boolean(maxHeight)} sx={(theme) => ({
      tableLayout: "fixed", width: "100%", minWidth: 0,
      "& th": { bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700, fontSize: 12, py: 1, verticalAlign: "middle" },
      "& th, & td": { px: 1, whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal" },
      "& td": { fontSize: 12, py: 0.8, verticalAlign: "middle" },
      "& tbody tr:nth-of-type(odd)": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
      "& tbody tr:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) },
      ...(stackBelow ? { [theme.breakpoints.down(stackBelow)]: {
        "&, & tbody": { display: "block" }, "& thead, & colgroup": { display: "none" },
        "& tbody tr": { display: "block", p: 0.75, borderBottom: `1px solid ${theme.palette.divider}` },
        "& td": { display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.4fr)", gap: 1, width: "100%", boxSizing: "border-box", border: 0, px: 0.75, py: 0.6 },
        "& td[data-empty]": { display: "block" },
      } } : {}),
    })}>
      <colgroup>{columns.map((column) => <col key={column.key} style={{ width: column.width }} />)}</colgroup>
      <TableHead><TableRow>{columns.map((column) => <TableCell key={column.key}>{column.header ?? column.label}</TableCell>)}</TableRow></TableHead>
      <TableBody>{rows.map((row) => <TableRow key={rowKey(row)}>{columns.map((column) => <TableCell key={column.key}>
        {stackBelow && <Typography component="span" variant="caption" fontWeight={600} color="text.secondary" sx={(theme) => ({ display: "none", [theme.breakpoints.down(stackBelow)]: { display: "block" } })}>{column.label}</Typography>}
        <Box sx={{ minWidth: 0, overflowWrap: "anywhere", "& .MuiChip-root": { maxWidth: "100%", height: "auto", minHeight: 24 }, "& .MuiChip-label": { whiteSpace: "normal", overflowWrap: "anywhere", py: 0.25 } }}>{column.render(row)}</Box>
      </TableCell>)}</TableRow>)}
        {!rows.length && <TableRow><TableCell data-empty colSpan={columns.length} align="center" sx={{ py: "24px !important" }}>{emptyText}</TableCell></TableRow>}
      </TableBody>
    </Table>
  </TableContainer>;
}
