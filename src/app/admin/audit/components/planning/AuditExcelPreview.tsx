"use client";

import { useState } from "react";

import {
  alpha,
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

import type { AuditRow } from "../../types/audit";

export default function AuditExcelPreview({ rows }: { rows: AuditRow[] }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        Excel Preview — {rows.length} records
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
            <TableRow>
              {["Excel Row", "Storage Bin", "Material Code", "Quantity"].map(
                (label, index) => (
                  <TableCell
                    key={label}
                    align={index === 3 ? "right" : "left"}
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    {label}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * perPage, page * perPage + perPage)
              .map((row, index) => (
                <TableRow
                  key={row.excelRow}
                  sx={{
                    backgroundColor:
                      index % 2 === 1
                        ? alpha(theme.palette.primary.main, 0.2)
                        : "inherit",
                  }}
                >
                  <TableCell>{row.excelRow}</TableCell>
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
        rowsPerPageOptions={[10, 25, 50]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(e) => {
          setPerPage(Number(e.target.value));
          setPage(0);
        }}
      />
    </Paper>
  );
}
