"use client";

import { useEffect, useState } from "react";

import {
  alpha,
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";

import type { PlanCandidate } from "../../types/cycleCount";
import { MOVEMENT_LEVEL_LABELS, movementLevelColor } from "../../utils/cycleCountLabels";

type Props = {
  rows: PlanCandidate[];
  /** MANUAL: tick boxes in the first column */
  selectable?: boolean;
  selected?: Set<string>;
  onToggle?: (bin: string) => void;
  onToggleAll?: (bins: string[], checked: boolean) => void;
  showCnc: boolean;
  showClass: boolean;
};

/** Planned / candidate locations with their movement in the selected period. */
export default function CycleCountPlanTable({
  rows,
  selectable = false,
  selected,
  onToggle,
  onToggleAll,
  showCnc,
  showClass,
}: Props) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // New data (new plan) -> back to the first page
  useEffect(() => setPage(0), [rows]);

  const pageRows = rows.slice(page * perPage, page * perPage + perPage);
  const pageBins = pageRows.map((r) => r.storageBin);
  const allOnPage = selectable && pageBins.length > 0 && pageBins.every((b) => selected?.has(b));
  const someOnPage = selectable && pageBins.some((b) => selected?.has(b));
  const headSx = { fontWeight: "bold", color: theme.palette.primary.contrastText, whiteSpace: "nowrap" as const };
  const cols = 8 + (selectable ? 1 : 0) + (showClass ? 1 : 0) + (showCnc ? 1 : 0);

  return (
    <>
      <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allOnPage}
                    indeterminate={!allOnPage && someOnPage}
                    onChange={(e) => onToggleAll?.(pageBins, e.target.checked)}
                    inputProps={{ "aria-label": "Select all locations on this page" }}
                  />
                </TableCell>
              )}
              <TableCell sx={headSx}>#</TableCell>
              <TableCell sx={headSx}>Storage Bin</TableCell>
              <TableCell sx={headSx} align="right">Movements</TableCell>
              <TableCell sx={headSx} align="right">Transfer Orders</TableCell>
              <TableCell sx={headSx} align="right">From Archive</TableCell>
              <TableCell sx={headSx}>Movement</TableCell>
              <TableCell sx={headSx} align="right">Packages</TableCell>
              <TableCell sx={headSx} align="right">Stock Lines</TableCell>
              {showClass && <TableCell sx={headSx}>Classes</TableCell>}
              {showCnc && <TableCell sx={headSx}>CNC</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={cols} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No locations match the selected criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((r, i) => (
                <TableRow
                  key={r.storageBin}
                  hover
                  sx={{
                    backgroundColor: i % 2 === 1 ? alpha(theme.palette.primary.main, 0.12) : "inherit",
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selected?.has(r.storageBin) ?? false}
                        onChange={() => onToggle?.(r.storageBin)}
                        inputProps={{ "aria-label": `Select ${r.storageBin}` }}
                      />
                    </TableCell>
                  )}
                  <TableCell>{page * perPage + i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{r.storageBin}</TableCell>
                  <TableCell align="right">{r.movementLines}</TableCell>
                  <TableCell align="right">{r.transferOrders}</TableCell>
                  <TableCell align="right">{r.archivedLines}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={MOVEMENT_LEVEL_LABELS[r.movementLevel] ?? r.movementLevel}
                      color={movementLevelColor(r.movementLevel)}
                      variant={r.movementLevel === "NONE" ? "outlined" : "filled"}
                    />
                  </TableCell>
                  <TableCell align="right">{r.packages}</TableCell>
                  <TableCell align="right">{r.lines}</TableCell>
                  {showClass && <TableCell>{r.classes.length ? r.classes.join(", ") : "–"}</TableCell>}
                  {showCnc && <TableCell>{r.hasCnc === null ? "–" : r.hasCnc ? "Yes" : "No"}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        rowsPerPage={perPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </>
  );
}
