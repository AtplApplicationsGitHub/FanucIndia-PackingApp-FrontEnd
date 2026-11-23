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
  useTheme,
} from "@mui/material";
import { X } from "lucide-react";
import type {
  ReconLine,
  ReconLocationSummary,
} from "../../types/reconciliation";
import { formatDateTime } from "../../utils/reconLabels";

function RemarksDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
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
  const fields: [string, string | null | undefined][] = line
    ? [
        ["Storage Bin", line.storageBin],
        ["Material Code", line.materialCode],
        ["Cert. No. (YD)", line.certNo || line.ydNumber],
        ["SO Number", line.soNumber],
        ["Operator Remarks", line.operatorRemarks],
      ]
    : [];

  return (
    <RemarksDialog
      open={line !== null}
      title="UNEXPECTED MATERIAL REMARKS"
      onClose={onClose}
    >
      {line && (
        <>
          <TableContainer
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1.5,
            }}
          >
            <Table
              size="small"
              aria-label="Unexpected material operator remarks"
            >
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: "#FFDD00",
                      color: "#111827",
                      fontWeight: 700,
                    },
                  }}
                >
                  <TableCell sx={{ width: "30%" }}>Field</TableCell>
                  <TableCell>Operator Details</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {fields.map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        verticalAlign: "top",
                      }}
                    >
                      {label}
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </RemarksDialog>
  );
}
