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
import AuditStatusPill from "../shared/AuditStatusPill";

import { formatDateTime } from "../../utils/reconLabels";
import type { ReconLocationSummary } from "../../types/reconciliation";
import type { AuditLocationUpload } from "../../types/auditDetail";

type Props = {
  open: boolean;
  locations: ReconLocationSummary[];
  locationUploads?: AuditLocationUpload[] | null;
  onClose: () => void;
};

type Column = {
  label: string;
  align: "left" | "right";
  color?: "success" | "warning" | "error" | "secondary" | "info";
  width: string;
  render: (location: ReconLocationSummary) => string | number;
};

const COLUMNS: Column[] = [
  { label: "S.No", align: "left", width: "5%", render: (l) => l.sequenceNo },
  { label: "Storage Bin", align: "left", width: "15%", render: (l) => l.storageBin },
  {
    label: "Status",
    align: "left",
    width: "11%",
    render: (l) => l.uploadedAt || l.uploaded ? "Uploaded" : "Pending",
  },
  { label: "Exp.", align: "left", width: "6%", render: (l) => l.expectedMaterials },
  { label: "Valid", align: "left", width: "7%", color: "success", render: (l) => l.valid },
  { label: "Mismatch", align: "left", width: "9%", color: "info", render: (l) => l.mismatch },
  { label: "Missing", align: "left", width: "8%", color: "error", render: (l) => l.missing },
  { label: "Unexpected", align: "left", width: "11%", color: "warning", render: (l) => l.unexpected },
  { label: "Open", align: "left", width: "8%", color: "secondary", render: (l) => l.openVariances },
  {
    label: "Uploaded On",
    align: "left",
    width: "20%",
    render: (l) => (l.uploadedAt ? formatDateTime(l.uploadedAt) : "-"),
  },
];

export default function LocationVarianceDialog({
  open,
  locations,
  locationUploads,
  onClose,
}: Props) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  // ASSIGNED audits have no reconciliation response; use planning location data.
  // For other statuses, the reconciliation response supplies variance counts.
  const displayLocations: ReconLocationSummary[] = locations.length
    ? locations
    : (locationUploads ?? []).map((l) => ({
        sequenceNo: l.sequenceNo,
        storageBin: l.storageBin,
        expectedMaterials: l.expectedMaterials,
        uploaded: Boolean(l.uploadedAt),
        uploadedAt: l.uploadedAt,
        valid: 0,
        mismatch: 0,
        missing: 0,
        unexpected: 0,
        completedAt: l.completedAt,
        totalVariances: 0,
        openVariances: 0,
        resolvedVariances: 0,
      }));
  const pageRows = displayLocations.slice(page * perPage, page * perPage + perPage);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: "min(1320px, calc(100vw - 32px))",
          maxWidth: "calc(100vw - 32px)",
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
              overflowX: "hidden",
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.18),
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                  px: 0.6,
                  py: 0.75,
                  fontSize: { xs: 10, md: 12 },
                  lineHeight: 1.35,
                },
                "& .MuiTableCell-head": {
                  fontSize: { xs: 11, md: 13 },
                  letterSpacing: 0,
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                },
              }}
            >
              <colgroup>
                {COLUMNS.map((column) => (
                  <col key={column.label} style={{ width: column.width }} />
                ))}
              </colgroup>
              <TableHead>
                <TableRow>
                  {COLUMNS.map((column) => (
                    <TableCell
                      key={column.label}
                      align={column.align}
                      sx={{
                        fontWeight: 700,
                        textTransform: "none",
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
                              whiteSpace: column.label.endsWith(" On") ? "normal" : "nowrap",
                              overflowWrap: "anywhere",
                              fontWeight: highlight ? 700 : undefined,
                              color: highlight
                                ? `${column.color}.main`
                                : undefined,
                            }}
                          >
                            {column.label === "Status" ? (
                              <AuditStatusPill
                                label={String(value)}
                                color={value === "Uploaded" ? "success" : "warning"}
                              />
                            ) : (
                              value
                            )}
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
            count={displayLocations.length}
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
