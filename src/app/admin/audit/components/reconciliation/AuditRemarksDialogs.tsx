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
import { FileText, MapPin, ScanLine, X } from "lucide-react";
import ReconMetricCard from "./ReconMetricCard";
import type {
  ReconLine,
  ReconLocationSummary,
} from "../../types/reconciliation";
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
      PaperProps={{ sx: { borderRadius: 2, maxWidth: width } }}
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
    {
      title: "Storage Bin",
      value: line.storageBin,
      icon: <MapPin size={16} />,
    },
    {
      title: "Cert. No. (YD)",
      value: line.certNo || line.ydNumber,
      icon: <ScanLine size={16} />,
    },
    {
      title: "SO Number",
      value: line.soNumber,
      icon: <FileText size={16} />,
    },
  ];

  return (
    <RemarksDialog open title={line.materialCode} onClose={onClose} width={600}>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {details.map(({ title, value, icon }) => (
            <ReconMetricCard
              key={title}
              title={title}
              icon={icon}
              compact
              value={
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  }}
                >
                  {value || "—"}
                </Box>
              }
            />
          ))}
        </Box>

        <Box
          sx={(theme) => ({
            p: 1.5,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.45),
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.15),
          })}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Operator Remarks
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {line.operatorRemarks?.trim() ? line.operatorRemarks : "—"}
          </Typography>
        </Box>
      </Box>
    </RemarksDialog>
  );
}
