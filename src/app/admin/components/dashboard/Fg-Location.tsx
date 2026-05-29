"use client";

import * as React from "react";
import Link from "next/link";
import {
  alpha,
  Box,
  Link as MuiLink,
  Paper,
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
import { useFgStorageReport } from "@/app/admin/components/hooks/useFgStorageReport";
import { formatDateTimeIST } from "@/common/utils/dateTime";

function formatDate(iso: string) {
  if (!iso || iso === "-") return "-";
  try {
    return formatDateTimeIST(iso);
  } catch {
    return iso;
  }
}

export default function FgLocation() {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { rows, totalCount, loading, error } = useFgStorageReport(
    page,
    rowsPerPage,
    "",
  );

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pt: 1,
        pb: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {error && (
          <Typography color="error" variant="body2" sx={{ px: 3, pt: 1 }}>
            {error}
          </Typography>
        )}

        <TableContainer>
          <Table
            sx={{
              minWidth: 650,
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                backgroundColor: lightYellow,
              },
              "& .MuiTableBody-root .MuiTableRow-root:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
              "& .MuiTableCell-root": {
                borderBottom: "none",
                py: 1.5,
                px: 2,
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableHead
              sx={{
                bgcolor: (t) =>
                  t.palette.mode === "dark" ? "#000000" : "#ffffff",
              }}
            >
              <TableRow sx={{ height: 60 }}>
                {[
                  "SALES ORDER NUMBER",
                  "FG LOCATION",
                  "USER",
                  "DATE & TIME",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      color: (t) =>
                        t.palette.mode === "dark" ? "#ffffff" : "#000000",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 4, bgcolor: lightYellow }}
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow
                    key={`${row.saleOrderNumber}-${row.dateTime}-${index}`}
                  >
                    <TableCell>
                      {row.saleOrderNumber ? (
                        <MuiLink
                          component={Link}
                          href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? "/" + row.outboundDelivery : ""}`}
                          underline="hover"
                          sx={{ fontWeight: 500 }}
                        >
                          {row.saleOrderNumber}
                        </MuiLink>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{row.fgLocation || "-"}</TableCell>
                    <TableCell>{row.user || "-"}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {formatDate(row.dateTime)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50, 100]}
        sx={{ bgcolor: "transparent" }}
      />
    </Box>
  );
}
