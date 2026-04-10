"use client";

import React, { useState } from "react";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  useTheme,
  alpha,
  Typography,
  Tooltip,
} from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";

export type LookupRow = {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
};

type Props = {
  data: LookupRow[];
  explicitKeys?: string[];
  onEdit: (row: LookupRow) => void;
  onRequestDelete: (id: number) => void;
};

const LookupCrudTable: React.FC<Props> = ({
  data,
  explicitKeys,
  onEdit,
  onRequestDelete,
}) => {
  const theme = useTheme();
  
  // Columns
  const keys = explicitKeys && explicitKeys.length > 0 
    ? explicitKeys 
    : (data[0] ? Object.keys(data[0]).filter(k => !['createdAt','updatedAt'].includes(k)) : []);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const formatValue = (key: string, value: string | number | boolean | null | undefined) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value;
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {keys.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col === "id" ? "ID" : col.replace(/([A-Z])/g, " $1")}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: "bold",
                  width: 120,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={keys.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No items found.</Typography>
                </TableCell>
              </TableRow>
            )}
            {visibleRows.map((row, index) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  backgroundColor: index % 2 === 1 ? alpha(theme.palette.primary.main, 0.2) : "inherit",
                }}
              >
                {keys.map((key) => (
                  <TableCell key={key}>
                    {formatValue(key, row[key])}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => onEdit(row)}
                      >
                        <Pencil size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRequestDelete(row.id)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default LookupCrudTable;