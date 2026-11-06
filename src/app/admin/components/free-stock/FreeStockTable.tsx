"use client";

import {
  alpha,
  Box,
  Chip,
  Paper,
  Stack,
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
import CommonButton from "@/common/components/CommonButton";
import { FREE_STOCK_COLUMNS, type FreeStockRow } from "../types/freeStock";

type Props = {
  rows: FreeStockRow[];
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;
  onView: (id: string) => void;
  onRelease: (id: string) => void;
};

const holdColor = (days: number) =>
  days > 7 ? "error" : days >= 3 ? "warning" : "success";

/** Uses the same MUI table, primary header, alternating rows and pagination pattern as AuditPlansTable. */
export default function FreeStockTable({
  rows,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onRelease,
}: Props) {
  const theme = useTheme();
  const headCellSx = {
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
    color: theme.palette.primary.contrastText,
  };
  return (
    <Box
      sx={{ width: "100%", overflow: "hidden", bgcolor: "background.paper" }}
    >
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 0, overflowX: "auto" }}
      >
        <Table
          sx={{
            minWidth: 1700,
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              bgcolor: alpha(theme.palette.primary.main, 0.25),
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
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
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow sx={{ height: 50 }}>
              {[
                ...FREE_STOCK_COLUMNS,
                "Status",
                "Held by",
                "Days held",
                "Actions",
              ].map((heading) => (
                <TableCell key={heading} sx={headCellSx}>
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {FREE_STOCK_COLUMNS.map((column) => (
                  <TableCell
                    key={column}
                    sx={{
                      fontWeight:
                        column === "Material" || column === "Batch" ? 700 : 400,
                    }}
                  >
                    {row[column] === "" || row[column] == null
                      ? "—"
                      : row[column]}
                  </TableCell>
                ))}
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === "Open" ? "success" : "default"}
                    />
                    {row.isNew && (
                      <Chip label="New" size="small" color="warning" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {row.heldBy
                    ? `${row.heldBy} · ${row.heldQty} of ${row.Stock}`
                    : "—"}
                </TableCell>
                <TableCell>
                  {row.heldBy && row.daysHeld !== null ? (
                    <Chip
                      size="small"
                      label={`${row.daysHeld} d`}
                      color={holdColor(row.daysHeld)}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.75}>
                    <CommonButton size="small" onClick={() => onView(row.id)}>
                      View
                    </CommonButton>
                    {row.heldBy && (
                      <CommonButton
                        size="small"
                        onClick={() => onRelease(row.id)}
                        sx={{ color: "error.main" }}
                      >
                        Release
                      </CommonButton>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={18} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2">No matching rows.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, next) => onPageChange(next)}
        onRowsPerPageChange={(event) =>
          onRowsPerPageChange(Number(event.target.value))
        }
        rowsPerPageOptions={[10, 20, 50, 100]}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      />
    </Box>
  );
}
