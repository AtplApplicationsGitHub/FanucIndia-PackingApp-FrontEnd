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
}: {
  rows: AuditRow[];
  headers?: string[];
  title?: string;
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
        <Table size="small" stickyHeader>
          <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
            <TableRow>
              {headers.map((label, index) => (
                <TableCell
                  key={label}
                  align={index === 2 ? "right" : "left"}
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.primary.contrastText,
                    bgcolor: theme.palette.primary.main,
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
        rowsPerPageOptions={[10, 20]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(e) => {
          setPerPage(Number(e.target.value));
          setPage(0);
        }}
      />
    </Paper>
  );
}
