"use client";

import { useState } from "react";

import {
  alpha,
  Paper,
  Box,
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

import type { AuditRow } from "../../types/audit";

export default function AuditExcelPreview({
  rows,
  headers = ["Storage Bin", "Material Code", "Quantity"],
  title = "Excel Preview",
  showOperator = false,
}: {
  rows: AuditRow[];
  headers?: string[];
  title?: string;
  showOperator?: boolean;
}) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, mt: 1.2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography fontWeight={700}>{title}</Typography>
        <Chip
          size="small"
          label={`${rows.length} records`}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
          }}
        />
      </Box>

      <TableContainer sx={{ maxHeight: perPage > 10 ? 360 : "none" }}>
        <Table
          size="small"
          stickyHeader
          sx={{
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
            "& .MuiTableCell-root": {
              borderBottom: "none",
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {headers.map((label, index) => (
                <TableCell
                  key={label}
                  align={index === headers.length - 1 ? "right" : "left"}
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                    bgcolor: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * perPage, page * perPage + perPage)
              .map((row) => (
                <TableRow key={row.excelRow}>
                  {showOperator && <TableCell>{row.operator ?? "–"}</TableCell>}
                  <TableCell>{row.storage}</TableCell>
                  <TableCell>{row.materialCode}</TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        rowsPerPage={perPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(e) => {
          setPerPage(Number(e.target.value));
          setPage(0);
        }}
        sx={{ borderTop: "1px solid", borderColor: "divider" }}
      />
    </Paper>
  );
}
