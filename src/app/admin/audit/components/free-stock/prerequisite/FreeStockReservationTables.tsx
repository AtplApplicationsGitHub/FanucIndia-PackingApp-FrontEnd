"use client";

import { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  type Theme,
  Typography,
  IconButton,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BulkReservationRow } from "../../../types/freeStock";

export type ReservationFilter =
  | "ALL"
  | "ALLOCATED"
  | "PARTIAL"
  | "NOT_ALLOCATED";

type Props = {
  rows: BulkReservationRow[];
  filter: ReservationFilter;
  showReserved?: boolean;
  disabled?: boolean;
};

const PAGE_ROWS = 50; // Batch rows per page (material groups are never split).

const FILTERS: {
  value: ReservationFilter;
  label: string;
  color: "default" | "success" | "warning" | "error";
}[] = [
  { value: "ALL", label: "All", color: "default" },
  { value: "ALLOCATED", label: "Allocated", color: "success" },
  { value: "PARTIAL", label: "Partial", color: "warning" },
  { value: "NOT_ALLOCATED", label: "Not allocated", color: "error" },
];

type AllocationRow = BulkReservationRow["allocations"][number];

type DisplayRow = {
  allocation: AllocationRow | null;
  request: BulkReservationRow;
};

type Group = {
  key: string;
  request: BulkReservationRow;
  lines: DisplayRow[];
};

const asNum = (value: string) => Number(value) || 0;

function makeGroups(rows: BulkReservationRow[]): Group[] {
  // Each Excel request is one group; each selected batch becomes one display row.
  // Requests with no allocation still have one display row.
  return rows.map((request, index) => ({
    key: `${request.rowNo}-${index}`,
    request,
    lines: request.allocations.length
      ? request.allocations.map((allocation) => ({ request, allocation }))
      : [{ request, allocation: null }],
  }));
}

function makePages(groups: Group[]): Group[][] {
  const pages: Group[][] = [];
  let current: Group[] = [];
  let count = 0;

  for (const group of groups) {
    if (current.length && count + group.lines.length > PAGE_ROWS) {
      pages.push(current);
      current = [];
      count = 0;
    }

    current.push(group);
    count += group.lines.length;
  }

  if (current.length) pages.push(current);

  return pages;
}

function splitGroups(groups: Group[]): [Group[], Group[]] {
  const total = groups.reduce((sum, group) => sum + group.lines.length, 0);

  let running = 0;
  let splitAt = 0;

  for (let i = 0; i < groups.length; i++) {
    if (
      i > 0 &&
      Math.abs(total / 2 - running) <=
        Math.abs(total / 2 - running - groups[i].lines.length)
    ) {
      break;
    }

    running += groups[i].lines.length;
    splitAt = i + 1;
  }

  if (groups.length > 1) {
    splitAt = Math.min(groups.length - 1, Math.max(1, splitAt));
  }

  return [groups.slice(0, splitAt), groups.slice(splitAt)];
}

function ReservationTable({
  groups,
  showReserved,
  filter,
}: {
  groups: Group[];
  showReserved: boolean;
  filter: ReservationFilter;
}) {
  return (
    <TableContainer
      sx={{
        flex: 1,
        minWidth: 0,
        overflowX: "auto",
      }}
    >
      <Table
        size="small"
        sx={(theme) => ({
          tableLayout: "fixed",
          minWidth: showReserved ? 700 : 640,
          "& .MuiTableCell-root": {
            px: 0.5,
            py: 0.35,
            fontSize: "0.7rem",
            lineHeight: 1.3,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          "& thead th": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 700,
            whiteSpace: "nowrap",
            py: 0.8,
          },
        })}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: showReserved ? "22%" : "24%" }}>
              Material / SO
            </TableCell>
            <TableCell sx={{ width: showReserved ? "6%" : "7%" }}>
              Req
            </TableCell>
            <TableCell sx={{ width: showReserved ? "17%" : "18%" }}>
              Batch
            </TableCell>
            <TableCell sx={{ width: showReserved ? "13%" : "14%" }}>
              Bin
            </TableCell>
            <TableCell sx={{ width: showReserved ? "8%" : "10%" }}>
              Stock
            </TableCell>
            {showReserved && (
              <TableCell sx={{ width: "10%" }}>Allocated</TableCell>
            )}
            <TableCell sx={{ width: showReserved ? "9%" : "10%" }}>
              Pending
            </TableCell>
            <TableCell sx={{ width: showReserved ? "15%" : "17%" }}>
              Status
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {groups.flatMap((group, groupIndex) => {
            const { request } = group;
            const tone =
              request.status === "ALLOCATED"
                ? "success"
                : request.status === "PARTIAL"
                  ? "warning"
                  : "error";

            // One colour per material group (all its batch rows share it),
            const groupBg = (theme: Theme) =>
              groupIndex % 2 === 0
                ? alpha(theme.palette.primary.main, 0.12)
                : "transparent";

            return group.lines.map(({ allocation }, index) => (
              <TableRow
                key={`${group.key}-${index}`}
                sx={(theme) => ({
                  bgcolor: groupBg(theme),
                  // Light dashed line between batches of the same material;
                  ...(index < group.lines.length - 1 && {
                    "& td:not([rowspan])": {
                      borderBottomStyle: "dashed",
                    },
                  }),
                })}
              >
                {/* Material / SO (merged across batch rows) */}
                {index === 0 && (
                  <TableCell
                    rowSpan={group.lines.length}
                    sx={{ verticalAlign: "middle !important" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {request.materialCode}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.62rem", color: "text.secondary" }}
                    >
                      {request.soNumber || "—"}
                    </Typography>
                  </TableCell>
                )}

                {/* Req */}
                {index === 0 && (
                  <TableCell
                    rowSpan={group.lines.length}
                    sx={{ verticalAlign: "middle !important", fontWeight: 700 }}
                  >
                    {request.requestedQty}
                  </TableCell>
                )}

                {/* Batch (one per batch row) */}
                <TableCell sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                  {allocation?.batch || "—"}
                </TableCell>

                {/* Bin (one per batch row) */}
                <TableCell sx={{ overflowWrap: "anywhere" }}>
                  {allocation?.storageBin || "—"}
                </TableCell>

                {/* Stock (per batch) */}
                <TableCell>{allocation?.stockQty ?? "—"}</TableCell>

                {/* Allocated (per batch) */}
                {showReserved && (
                  <TableCell>{allocation?.allocatedQty ?? "—"}</TableCell>
                )}

                {/* Pending + Status (merged) */}
                {index === 0 && (
                  <>
                    <TableCell
                      rowSpan={group.lines.length}
                      sx={{
                        verticalAlign: "middle !important",
                        color:
                          asNum(request.pendingQty) > 0
                            ? "error.main"
                            : "text.secondary",
                        fontWeight: 400,
                      }}
                    >
                      {request.pendingQty}
                    </TableCell>
                    <TableCell
                      rowSpan={group.lines.length}
                      sx={{ verticalAlign: "middle !important" }}
                    >
                      <Chip
                        size="small"
                        label={
                          request.status === "ALLOCATED"
                            ? "Allocated"
                            : request.status === "PARTIAL"
                              ? "Partial"
                              : "Not allocated"
                        }
                        variant="outlined"
                        sx={(theme) => {
                          const statusColor = theme.palette[tone].main;

                          return {
                            height: 19,
                            maxWidth: "100%",
                            borderRadius: "999px",
                            border: `1px solid ${statusColor}`,
                            bgcolor: "transparent",
                            color: statusColor,
                            fontWeight: 400,
                            fontSize: "0.62rem",
                            "& .MuiChip-label": {
                              px: 0.65,
                              whiteSpace: "nowrap",
                            },
                          };
                        }}
                      />
                    </TableCell>
                  </>
                )}
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ReservationFilterChips({
  rows,
  filter,
  onFilterChange,
  disabled = false,
}: {
  rows: BulkReservationRow[];
  filter: ReservationFilter;
  onFilterChange: (filter: ReservationFilter) => void;
  disabled?: boolean;
}) {
  const counts = useMemo(
    () => ({
      ALL: rows.length,
      ALLOCATED: rows.filter((row) => row.status === "ALLOCATED").length,
      PARTIAL: rows.filter((row) => row.status === "PARTIAL").length,
      NOT_ALLOCATED: rows.filter((row) => row.status === "NOT_ALLOCATED")
        .length,
    }),
    [rows],
  );

  return (
    <>
      {FILTERS.map(({ value, label, color }) => {
        const selected = filter === value;

        return (
          <Chip
            key={value}
            size="small"
            clickable={!disabled}
            disabled={disabled}
            label={`${label} (${counts[value]})`}
            variant={selected ? "filled" : "outlined"}
            onClick={() => onFilterChange(value)}
            sx={(theme) => {
              const chipColor =
                color === "default"
                  ? theme.palette.primary.main
                  : theme.palette[color].main;

              return {
                height: 28,
                borderRadius: "999px",
                border: `1px solid ${chipColor}`,
                bgcolor: selected ? chipColor : "transparent",
                color: selected ? "#FFFFFF" : chipColor,
                fontWeight: selected ? 500 : 400,
                fontSize: "0.72rem",
                "& .MuiChip-label": {
                  px: 1.3,
                },
                "&:hover": {
                  bgcolor: selected ? chipColor : alpha(chipColor, 0.08),
                },
              };
            }}
          />
        );
      })}
    </>
  );
}

export default function FreeStockReservationTables({
  rows,
  filter,
  showReserved = false,
  disabled = false,
}: Props) {
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => rows.filter((row) => filter === "ALL" || row.status === filter),
    [rows, filter],
  );

  const pages = useMemo(() => makePages(makeGroups(filtered)), [filtered]);

  const currentPage = Math.min(page, Math.max(0, pages.length - 1));

  const visible = pages[currentPage] ?? [];

  const [left, right] = useMemo(() => splitGroups(visible), [visible]);

  useEffect(() => {
    setPage(0);
  }, [filter, rows]);

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {visible.length ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1fr) minmax(0, 1fr)",
            },
            gap: 1.5,
            alignItems: "start",
          }}
        >
          <ReservationTable
            groups={left}
            showReserved={showReserved}
            filter={filter}
          />

          {right.length > 0 && (
            <ReservationTable
              groups={right}
              showReserved={showReserved}
              filter={filter}
            />
          )}
        </Box>
      ) : (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No reservations match this filter.
        </Typography>
      )}

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
        sx={{ mt: 1.25 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
            Page {pages.length ? currentPage + 1 : 0} of {pages.length}
          </Typography>

          <IconButton
            size="small"
            aria-label="Previous page"
            disabled={disabled || currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={18} />
          </IconButton>

          <IconButton
            size="small"
            aria-label="Next page"
            disabled={disabled || currentPage >= pages.length - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={18} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
