"use client";
import {
  alpha,
  Box,
  Checkbox,
  IconButton,
  LinearProgress,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LockOpen } from "lucide-react";
import { FREE_STOCK_TABLE_COLUMNS } from "../../../utils/free-stock/freeStockColumns";
import type { FreeStockRow } from "../../../types/freeStock";
import { stockCell } from "../../../utils/free-stock/freeStockFormat";
import AuditStatusPill from "../../shared/AuditStatusPill";

type Props = {
  rows: FreeStockRow[];
  total: number;
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

export default function FreeStockTable({
  rows,
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
  const selectable = rows
    .filter((r) => r.canReserve || r.canRelease)
    .map((r) => r.id);
  const all =
    selectable.length > 0 && selectable.every((id) => selected.includes(id));

  // Same header cell style as the Audit Planning table
  const headCellSx = {
    fontWeight: 700,
    color: theme.palette.primary.contrastText,
    textTransform: "uppercase" as const,
    verticalAlign: "middle",
  };

  return (
    <Box
      sx={{ width: "100%", bgcolor: "background.paper", position: "relative" }}
    >
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 0,
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            minWidth: 1500,

            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
            },

            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },

            "& .MuiTableCell-root": {
              borderBottom: "none",
              py: 0.5,
              px: 1,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
            },
          }}
        >
          <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
            <TableRow sx={{ height: 40 }}>
              <TableCell sx={{ ...headCellSx, width: "8%" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
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
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        size="small"
                        sx={{ p: 0.4 }}
                        disabled={
                          loading || (!row.canReserve && !row.canRelease)
                        }
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
                            disabled={loading}
                            onClick={() => onView(row.id)}
                          >
                            <VisibilityIcon fontSize="small" />{" "}
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
                    <TableCell key={column.key}>
                      {column.key === "status" ? (
                        <AuditStatusPill {...STATUS_PILL[row.status]} />
                      ) : (
                        stockCell(row, column)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
        rowsPerPageOptions={[10, 25, 50, 100, 200]}
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
