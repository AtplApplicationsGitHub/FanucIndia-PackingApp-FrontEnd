"use client";
import type { ReactNode } from "react";
import {
  alpha,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import type { Breakpoint } from "@mui/material";
export type FreeStockDataColumn<T> = {
  key: string;
  label: string;
  header?: ReactNode;
  width?: number | string;
  render: (row: T) => ReactNode;
};
type PaginationProps = {
  count: number;
  page: number;
  size: number;
  onPage: (page: number) => void;
  onSize?: (size: number) => void;
  disabled?: boolean;
};
type Props<T> = {
  columns: FreeStockDataColumn<T>[];
  rows: T[];
  compactIssueHeader?: boolean;
  rowKey: (row: T) => string | number;
  emptyText?: string;
  stackBelow?: Breakpoint | false;
  maxHeight?: number | string;
  pagination?: PaginationProps;
};
export default function FreeStockDataTable<T>({
  columns,
  rows,
  compactIssueHeader = false,
  rowKey,
  emptyText = "No records found.",
  stackBelow = "sm",
  maxHeight,
  pagination,
}: Props<T>) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <TableContainer
        sx={{
          maxHeight,
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          borderRadius: 0,
        }}
      >
        <Table
          size="small"
          stickyHeader={Boolean(maxHeight)}
          sx={(theme) => ({
            width: "100%",
            tableLayout: "fixed",
            minWidth: 0,
            "& .MuiTableCell-root": {
              borderBottom: "none",
              py: 0.5,
              px: 1,
              fontSize: "0.875rem",
              fontFamily: "inherit",
              verticalAlign: "middle",
            },
            "& th": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 700,
              textTransform: compactIssueHeader ? "capitalize" : "uppercase",
              height: compactIssueHeader ? 30 : 40,
              py: compactIssueHeader ? "4px !important" : undefined,
              fontSize: compactIssueHeader ? 12 : undefined,
              verticalAlign: "middle",
            },
            "& th, & td": {
              px: 1,
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "normal",
            },
            "& tbody tr:nth-of-type(odd)": {
              bgcolor: alpha(theme.palette.primary.main, 0.25),
            },
            "& tbody tr:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
            ...(stackBelow
              ? {
                  [theme.breakpoints.down(stackBelow)]: {
                    "&, & tbody": { display: "block" },
                    "& thead, & colgroup": { display: "none" },
                    "& tbody tr": {
                      display: "block",
                      p: 0.75,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                    "& td": {
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.4fr)",
                      gap: 1,
                      width: "100%",
                      boxSizing: "border-box",
                      border: 0,
                      px: 0.75,
                      py: 0.6,
                    },
                    "& td[data-empty]": { display: "block" },
                  },
                }
              : {}),
          })}
        >
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.header ?? column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {stackBelow && (
                      <Typography
                        component="span"
                        variant="caption"
                        fontWeight={600}
                        color="text.secondary"
                        sx={(theme) => ({
                          display: "none",
                          [theme.breakpoints.down(stackBelow)]: {
                            display: "block",
                          },
                        })}
                      >
                        {column.label}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        minWidth: 0,
                        overflowWrap: "anywhere",
                        "& .MuiChip-root": {
                          maxWidth: "100%",
                          height: "auto",
                          minHeight: 24,
                        },
                        "& .MuiChip-label": {
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                          py: 0.25,
                        },
                      }}
                    >
                      {column.render(row)}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell
                  data-empty
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: "24px !important" }}
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.count}
          page={Math.min(
            pagination.page,
            Math.max(0, Math.ceil(pagination.count / pagination.size) - 1),
          )}
          rowsPerPage={pagination.size}
          rowsPerPageOptions={
            pagination.onSize ? [10, 25, 50, 100, 200] : [pagination.size]
          }
          labelRowsPerPage="Rows:"
          onPageChange={(_, page) => {
            if (!pagination.disabled) {
              pagination.onPage(page);
            }
          }}
          onRowsPerPageChange={(event) =>
            pagination.onSize?.(Number(event.target.value))
          }
          slotProps={{
            select: { disabled: pagination.disabled },
            actions: {
              nextButton: {
                disabled:
                  pagination.disabled ||
                  (pagination.page + 1) * pagination.size >= pagination.count,
              },
              previousButton: {
                disabled: pagination.disabled || pagination.page === 0,
              },
            },
          }}
          sx={{
            width: "100%",
            overflow: "visible",
            bgcolor: "transparent",
            borderTop: "1px solid",
            borderColor: "divider",
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              justifyContent: "flex-end",
              px: { xs: 0.5, sm: 1 },
              gap: 0.5,
            },
            "& .MuiTablePagination-spacer": {
              display: "none",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                whiteSpace: "normal",
                my: 1,
                fontSize: 12,
              },
            "& .MuiTablePagination-input": { mx: 0.5 },
            "& .MuiTablePagination-actions": { ml: 0.5 },
          }}
        />
      )}
    </Box>
  );
}
