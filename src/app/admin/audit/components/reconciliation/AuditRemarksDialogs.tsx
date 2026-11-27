"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import type {
  ReconLine,
  ReconLocationSummary,
} from "../../types/reconciliation";
import FreeStockMetricCard from "../free-stock/prerequisite/FreeStockMetricCard";
import { formatDateTime } from "../../utils/reconLabels";
import AuditTableDialog from "../shared/AuditTableDialog";

function RemarksDialog({
  open,
  title,
  onClose,
  children,
  width,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: width,
          fontFamily: "inherit",
          "& .MuiTypography-root, & .MuiDialogTitle-root": {
            fontFamily: "inherit",
          },
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
          px: 6,
          position: "relative",
        }}
      >
        {title}
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
      <DialogContent sx={{ pt: 2, pb: 2.5 }}>{children}</DialogContent>
    </Dialog>
  );
}

export function SkippedRemarksDialog({
  open,
  locations,
  onClose,
}: {
  open: boolean;
  locations: ReconLocationSummary[];
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const perPage = 10;
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  useEffect(() => {
    setPage(0);
  }, [open]);

  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(locations.length / perPage) - 1),
  );

  const rows = locations.slice(safePage * perPage, (safePage + 1) * perPage);

  return (
    <RemarksDialog open={open} title="SKIPPED LOCATION" onClose={onClose}>
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table
            size="small"
            stickyHeader
            aria-label="Skipped location"
            sx={{
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                backgroundColor: lightYellow,
              },
              "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                {
                  borderBottom: 0,
                },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                  },
                }}
              >
                <TableCell sx={{ width: "20%" }}>Storage Bin</TableCell>
                <TableCell sx={{ width: "40%" }}>Remarks</TableCell>
                <TableCell sx={{ width: "40%" }}>Skipped On</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    No remarks found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((location) => (
                  <TableRow key={location.storageBin} hover>
                    <TableCell>{location.storageBin}</TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {location.skipReason}
                    </TableCell>

                    <TableCell>
                      {location.skippedAt
                        ? formatDateTime(location.skippedAt)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={locations.length}
          page={safePage}
          rowsPerPage={perPage}
          rowsPerPageOptions={[]}
          onPageChange={(_, next) => setPage(next)}
          showFirstButton={false}
          showLastButton={false}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            "& .MuiTablePagination-toolbar": {
              minHeight: 48,
              px: 1,
            },
          }}
        />
      </Box>
    </RemarksDialog>
  );
}

export function UnexpectedRemarksDialog({
  line,
  onClose,
}: {
  line: ReconLine | null;
  onClose: () => void;
}) {
  if (!line) return null;

  const details = [
    { title: "Storage Bin", value: line.storageBin },
    { title: "Cert. No. (YD)", value: line.certNo || line.ydNumber },
    { title: "SO Number", value: line.soNumber },
  ];

  return (
    <RemarksDialog open title={line.materialCode} onClose={onClose} width={600}>
      <Box sx={{ display: "grid", gap: 0.9 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1,
            "& .MuiPaper-root p:first-of-type": {
              fontSize: 11,
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "0.04em",
              lineHeight: 1.4,
              mb: 0.25,
            },
            "& .MuiPaper-root p:last-of-type": {
              fontSize: 14,
              fontWeight: 500,
              color: "text.primary",
              lineHeight: 1.4,
            },
          }}
        >
          {details.map(({ title, value }) => (
            <FreeStockMetricCard
              key={title}
              title={title}
              value={value || "—"}
            />
          ))}
        </Box>

        <Box
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "0.04em",
              lineHeight: 1.4,
              mb: 0.25,
            }}
          >
            OPERATOR REMARKS
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 500,
              color: "text.primary",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {line.operatorRemarks?.trim() ? line.operatorRemarks : "—"}
          </Typography>
        </Box>
      </Box>
    </RemarksDialog>
  );
}
