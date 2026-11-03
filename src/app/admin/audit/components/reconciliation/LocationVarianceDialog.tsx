"use client";

import { useState } from "react";

import {
  alpha,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
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
import { X } from "lucide-react";

import { formatDateTime } from "../../utils/reconLabels";
import type { ReconLocationSummary } from "../../types/reconciliation";

type Props = {
  open: boolean;
  locations: ReconLocationSummary[];
  onClose: () => void;
};

type Column = {
  label: string;
  align: "left" | "right";
  color?: "success" | "warning" | "error" | "secondary" | "info";
  render: (location: ReconLocationSummary) => string | number;
};

const COLUMNS: Column[] = [
  { label: "Sequence No", align: "left", render: (l) => l.sequenceNo },
  { label: "Storage Bin", align: "left", render: (l) => l.storageBin },
  {
    label: "Expected Quantity",
    align: "left",
    render: (l) => l.expectedMaterials,
  },
  { label: "Valid", align: "left", color: "success", render: (l) => l.valid },
  {
    label: "Mismatch",
    align: "left",
    color: "info",
    render: (l) => l.mismatch,
  },
  { label: "Missing", align: "left", color: "error", render: (l) => l.missing },
  {
    label: "Unexpected",
    align: "left",
    color: "warning",
    render: (l) => l.unexpected,
  },
  {
    label: "Open",
    align: "left",
    color: "secondary",
    render: (l) => l.openVariances,
  },
  {
    label: "Completed On",
    align: "left",
    render: (l) => (l.completedAt ? formatDateTime(l.completedAt) : "-"),
  },
];

export default function LocationVarianceDialog({
  open,
  locations,
  onClose,
}: Props) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const pageRows = locations.slice(page * perPage, page * perPage + perPage);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 1050,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "20px",
          letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}
      >
        LOCATION WISE VARIANCE
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2, pb: 2.5 }}>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          <TableContainer
            sx={{
              maxHeight: 460,
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.18),
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                  px: 1,
                  py: 0.75,
                  fontSize: 13,
                  lineHeight: 1.35,
                },
                "& .MuiTableCell-head": {
                  fontSize: 12,
                  letterSpacing: 0.2,
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  {COLUMNS.map((column) => (
                    <TableCell
                      key={column.label}
                      align={column.align}
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      align="center"
                      sx={{ py: 3 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No locations found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((location) => (
                    <TableRow key={location.storageBin} hover>
                      {COLUMNS.map((column) => {
                        const value = column.render(location);
                        const highlight = column.color && Number(value) > 0;
                        return (
                          <TableCell
                            key={column.label}
                            align={column.align}
                            sx={{
                              whiteSpace: "nowrap",
                              fontWeight: highlight ? 700 : undefined,
                              color: highlight
                                ? `${column.color}.main`
                                : undefined,
                            }}
                          >
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={locations.length}
            page={page}
            rowsPerPage={perPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onPageChange={(_, next) => setPage(next)}
            onRowsPerPageChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(0);
            }}
            sx={{ borderTop: 1, borderColor: "divider" }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
