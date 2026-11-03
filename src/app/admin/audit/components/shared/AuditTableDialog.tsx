"use client";

import { useState, type ReactNode } from "react";
import {
  alpha,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type AuditTableColumn = {
  label: string;
  align?: "left" | "right" | "center";
  width?: number;
};

type Props = {
  open: boolean;
  title: string;
  columns: AuditTableColumn[];
  rows: ReactNode[][];
  emptyText?: string;
  onClose: () => void;
  serialColumnWidth?: number;
  showTotalCount?: boolean;
  showSerialNumber?: boolean;
};

const ROWS_PER_PAGE = 10;

/** Small popup with a paginated table (S.No + the given columns). Used for locations, location materials ... */
export default function AuditTableDialog({
  open,
  title,
  columns,
  rows,
  emptyText = "No records found.",
  onClose,
  serialColumnWidth,
  showTotalCount = false,
  showSerialNumber = true,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  const [page, setPage] = useState(0);

  const pageRows = rows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const handleClose = () => {
    setPage(0);
    onClose();
  };

  const headSx = {
    fontWeight: "bold",
    bgcolor: "primary.main",
    color: "primary.contrastText",
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { maxWidth: 540 } }}
      TransitionProps={{ onExited: () => setPage(0) }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "18px",
          pb: 0.5,
          pt: 1.5,
          px: 4,
          letterSpacing: 0.5,
          color: "error.main",
          position: "relative",
        }}
      >
        {title}

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: "absolute", right: 12 }}
          aria-label="close"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <Table
              size="small"
              stickyHeader
              sx={{
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: lightYellow,
                },
                "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                  { borderBottom: 0 },
              }}
            >
              <TableHead>
                <TableRow>
                  {showSerialNumber && (
                    <TableCell sx={{ ...headSx, width: serialColumnWidth }}>
                      S.No
                    </TableCell>
                  )}
                  {columns.map((c) => (
                    <TableCell
                      key={c.label}
                      align={c.align}
                      sx={{
                        ...headSx,
                        width: c.width,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {pageRows.length > 0 ? (
                  pageRows.map((cells, index) => (
                    <TableRow key={page * ROWS_PER_PAGE + index} hover>
                      {showSerialNumber && (
                        <TableCell sx={{ width: serialColumnWidth }}>
                          {page * ROWS_PER_PAGE + index + 1}
                        </TableCell>
                      )}
                      {cells.map((cell, i) => (
                        <TableCell
                          key={i}
                          align={columns[i]?.align}
                          sx={{ width: columns[i]?.width }}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (showSerialNumber ? 1 : 0)}
                      align="center"
                      sx={{ py: 3 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {emptyText}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Keep table height consistent across all pages */}
                {pageRows.length > 0 &&
                  rows.length > ROWS_PER_PAGE &&
                  Array.from(
                    { length: ROWS_PER_PAGE - pageRows.length },
                    (_, i) => (
                      <TableRow
                        key={`filler-${i}`}
                        sx={{
                          backgroundColor: "transparent !important",
                          height: 37,
                          "&:hover": {
                            backgroundColor: "transparent !important",
                          },
                        }}
                      >
                        <TableCell
                          colSpan={columns.length + 1}
                          sx={{
                            borderBottom: "none",
                          }}
                        >
                          &nbsp;
                        </TableCell>
                      </TableRow>
                    ),
                  )}
              </TableBody>
            </Table>
          </Box>

          {(rows.length > ROWS_PER_PAGE || showTotalCount) && (
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[ROWS_PER_PAGE]}
              onPageChange={(_, newPage) => setPage(newPage)}
              showFirstButton={false}
              showLastButton={false}
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                "& .MuiTablePagination-toolbar": { minHeight: 48, px: 1 },
                "& .MuiTablePagination-actions": {
                  display: rows.length <= ROWS_PER_PAGE ? "none" : undefined,
                },
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
