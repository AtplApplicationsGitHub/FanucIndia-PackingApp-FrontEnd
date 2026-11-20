"use client";
import {
  alpha,
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Package } from "lucide-react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LockOpen } from "lucide-react";
import { FREE_STOCK_TABLE_COLUMNS } from "../../../utils/free-stock/freeStockColumns";
import type { FreeStockRow, FreeStockSoGroup } from "../../../types/freeStock";
import { stockCell } from "../../../utils/free-stock/freeStockFormat";
import AuditStatusPill from "../../shared/AuditStatusPill";

type Props = {
  groups: FreeStockSoGroup[];
  total: number; // number of SO groups (the API paginates by SO)
  page: number;
  size: number;
  loading: boolean;
  selected: number[];
  onSelect: (ids: number[]) => void;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
  onView: (id: number) => void;
  onRelease: (row: FreeStockRow) => void;
};

const STATUS_PILL = {
  OPEN: { label: "Open", color: "success" },
  RESERVED: { label: "Reserved", color: "warning" },
  CLOSED: { label: "Closed", color: "default" },
} as const;

const NO_WRAP_COLUMNS = new Set<string>(["grDate", "reservedDate"]);

const isSelectable = (row: FreeStockRow) => row.canReserve || row.canRelease;

export default function FreeStockGroupedTable({
  groups,
  total,
  page,
  size,
  loading,
  selected,
  onSelect,
  onPage,
  onSize,
  onView,
  onRelease,
}: Props) {
  const theme = useTheme();

  const selectable = groups.flatMap((group) =>
    group.items.filter(isSelectable).map((row) => row.id),
  );
  const all =
    selectable.length > 0 && selectable.every((id) => selected.includes(id));

  // Same header cell style as the normal Free Stock table.
  const headCellSx = {
    fontWeight: 600,
    color: theme.palette.primary.contrastText,
    textTransform: "uppercase" as const,
    verticalAlign: "middle",
    fontSize: "0.87rem",
    lineHeight: 1.3,
  };

  // Ticking an SO ticks / unticks every eligible row under it.
  const toggleGroup = (ids: number[]) => {
    const allIn = ids.length > 0 && ids.every((id) => selected.includes(id));
    onSelect(
      allIn
        ? selected.filter((id) => !ids.includes(id))
        : [...selected, ...ids.filter((id) => !selected.includes(id))],
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        position: "relative",
        minWidth: 0,
      }}
    >
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 0,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            width: "100%",
            minWidth: { xs: 1700, xl: 1500 },
            tableLayout: "fixed",
            // Data rows stay white; only the SO group rows are tinted.
            "& .MuiTableBody-root .MuiTableRow-root.so-data-row:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              fontSize: "0.87rem",
            },
            "& .MuiTableCell-root": {
              borderBottom: "none",
              py: 0.5,
              px: 0.75,
              boxSizing: "border-box",
              wordBreak: "normal",
              fontSize: "0.8rem",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
            },
            "& .MuiTableCell-root[data-nowrap='true']": {
              whiteSpace: "nowrap",
              overflowWrap: "normal",
            },
          }}
        >
          <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
            <TableRow sx={{ height: 40 }}>
              <TableCell sx={{ ...headCellSx, width: "7%" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    minWidth: 0,
                  }}
                >
                  <Checkbox
                    size="small"
                    sx={{
                      p: 0.4,
                      color: "inherit",
                      "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                        color: "inherit",
                      },
                    }}
                    disabled={loading || !selectable.length}
                    checked={all}
                    indeterminate={!all && selected.length > 0}
                    onChange={() => onSelect(all ? [] : selectable)}
                    inputProps={{
                      "aria-label": "Select eligible rows on this page",
                    }}
                  />
                  Actions
                </Box>
              </TableCell>
              {FREE_STOCK_TABLE_COLUMNS.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{ ...headCellSx, width: column.width }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      maxWidth: "100%",
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {column.label}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={FREE_STOCK_TABLE_COLUMNS.length + 1}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {loading ? "Loading stock…" : "No stock found."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              groups.flatMap((group) => {
                const groupKey = group.soNumber ?? "-";
                const groupIds = group.items
                  .filter(isSelectable)
                  .map((row) => row.id);
                const groupSelected = groupIds.filter((id) =>
                  selected.includes(id),
                ).length;
                const groupAll =
                  groupIds.length > 0 && groupSelected === groupIds.length;
                const count = group.items.length;

                return [
                  // SO Header
                  <TableRow
                    key={`so-${groupKey}`}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    }}
                  >
                    <TableCell
                      colSpan={FREE_STOCK_TABLE_COLUMNS.length + 1}
                      sx={{ py: "2px !important" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minWidth: 0,
                        }}
                      >
                        <Checkbox
                          size="small"
                          sx={{ p: 0.4 }}
                          disabled={loading || !groupIds.length}
                          checked={groupAll}
                          indeterminate={!groupAll && groupSelected > 0}
                          onChange={() => toggleGroup(groupIds)}
                          inputProps={{
                            "aria-label": `Select all rows of SO ${group.soNumber ?? "without SO"}`,
                          }}
                        />
                        <Box
                          sx={{
                            color: "secondary.main",
                            display: "inline-flex",
                          }}
                        >
                          <Package size={18} />
                        </Box>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "0.87rem",
                            fontWeight: 600,
                            color: "secondary.main",
                          }}
                        >
                          {group.soNumber || "No SO"} ({count}{" "}
                          {count === 1 ? "row" : "rows"})
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>,

                  // stock rows of this SO 
                  ...group.items.map((row) => (
                    <TableRow key={row.id} className="so-data-row">
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            minWidth: 0,
                          }}
                        >
                          <Checkbox
                            size="small"
                            sx={{ p: 0.4 }}
                            disabled={loading || !isSelectable(row)}
                            checked={selected.includes(row.id)}
                            onChange={() =>
                              onSelect(
                                selected.includes(row.id)
                                  ? selected.filter((id) => id !== row.id)
                                  : [...selected, row.id],
                              )
                            }
                            inputProps={{
                              "aria-label": `Select ${row.materialCode} ${row.batch}`,
                            }}
                          />
                          <Tooltip title="View details">
                            <span>
                              <IconButton
                                aria-label={`View ${row.materialCode} ${row.batch}`}
                                size="small"
                                sx={{ p: 0.25 }}
                                disabled={loading}
                                onClick={() => onView(row.id)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          {row.canRelease && (
                            <Tooltip title="Release reservation">
                              <span>
                                <IconButton
                                  aria-label={`Release ${row.materialCode} ${row.batch}`}
                                  size="small"
                                  color="error"
                                  sx={{ p: 0.25 }}
                                  disabled={loading}
                                  onClick={() => onRelease(row)}
                                >
                                  <LockOpen size={18} strokeWidth={2} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {FREE_STOCK_TABLE_COLUMNS.map((column) => (
                        <TableCell
                          key={column.key}
                          data-nowrap={
                            NO_WRAP_COLUMNS.has(column.key) ? "true" : undefined
                          }
                        >
                          {column.key === "status" ? (
                            <Box
                              sx={{
                                minWidth: 0,
                                "& > .MuiBox-root": {
                                  minWidth: 0,
                                  maxWidth: "100%",
                                  boxSizing: "border-box",
                                  whiteSpace: "normal",
                                  overflowWrap: "anywhere",
                                  px: 0.5,
                                },
                              }}
                            >
                              <AuditStatusPill {...STATUS_PILL[row.status]} />
                            </Box>
                          ) : column.key === "name" ? (
                            <Typography
                              component="span"
                              title={
                                row.name
                                  ? `${row.name}${row.zone ? ` (${row.zone})` : ""}`
                                  : undefined
                              }
                              noWrap
                              sx={{
                                display: "block",
                                minWidth: 0,
                                maxWidth: "100%",
                                fontSize: "inherit",
                              }}
                            >
                              {row.name
                                ? `${row.name}${row.zone ? ` (${row.zone})` : ""}`
                                : "—"}
                            </Typography>
                          ) : column.key === "grDate" ? (
                            `${stockCell(row, column)}${row.grDate && row.ageFromGrDays !== null ? ` (${row.ageFromGrDays} days)` : ""}`
                          ) : column.key === "reservedDate" ? (
                            `${stockCell(row, column)}${row.reservedDate && row.reservedDays !== null ? ` (${row.reservedDays} days)` : ""}`
                          ) : column.key === "shortageQty" ? (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "inherit",
                                color: row.hasShortage
                                  ? "error.main"
                                  : "text.primary",
                                fontWeight: row.hasShortage ? 700 : 400,
                              }}
                            >
                              {stockCell(row, column)}
                            </Typography>
                          ) : (
                            stockCell(row, column)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )),
                ];
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          maxWidth: "100%",
          "& .MuiTablePagination-toolbar": {
            minWidth: 0,
            flexWrap: "wrap",
            px: 1,
          },
          "& .MuiTablePagination-spacer": { flex: "1 1 auto" },
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={total}
        rowsPerPage={size}
        page={Math.min(page, Math.max(0, Math.ceil(total / size) - 1))}
        onPageChange={(_, next) => {
          if (!loading) onPage(next);
        }}
        onRowsPerPageChange={(e) => onSize(Number(e.target.value))}
        slotProps={{ select: { disabled: loading } }}
      />
    </Box>
  );
}
