"use client";

import { useMemo, useState } from "react";

import {
  Alert,
  alpha,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
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
import { X } from "lucide-react";

import { KVBox } from "@/app/so-search/components/KVBox";
import { useCycleCountDetail } from "../../hooks/useCycleCountDetail";
import {
  CNC_FILTER_LABELS,
  MOVEMENT_LEVEL_LABELS,
  SELECTION_METHOD_LABELS,
  cycleCountStatusColor,
  cycleCountStatusLabel,
  formatDateOnly,
  movementLevelColor,
} from "../../utils/cycleCountLabels";
import type { CncFilter, MovementLevel, SelectionMethod } from "../../types/cycleCount";

type Props = {
  auditId: number | null;
  onClose: () => void;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

/** Cycle Count audit: plan criteria + locations with the expected stock lines. */
export default function CycleCountDetailDialog({ auditId, onClose }: Props) {
  const theme = useTheme();
  const { detail, loading, error } = useCycleCountDetail(auditId);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const rows = useMemo(
    () =>
      detail
        ? detail.locations.flatMap((l) =>
            l.materials.map((m) => ({ ...m, seq: l.sequenceNo, storageBin: l.storageBin, level: l.movementLevel, moves: l.movementLines })),
          )
        : [],
    [detail],
  );
  const headSx = { fontWeight: "bold", color: theme.palette.primary.contrastText, whiteSpace: "nowrap" as const };

  return (
    <Dialog
      open={auditId !== null}
      onClose={() => {
        setPage(0);
        onClose();
      }}
      fullWidth
      maxWidth="md"
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
          position: "relative",
        }}
      >
        CYCLE COUNT – AUDIT DETAILS
        <IconButton onClick={onClose} size="small" sx={{ position: "absolute", right: 12 }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 0.5 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2, whiteSpace: "pre-line" }}>
            {error}
          </Alert>
        )}

        {detail && (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 3 }}>
              <KVBox label="Audit No" value={detail.auditNo} />
              <KVBox label="Audit Name" value={detail.auditName} />
              <KVBox label="Status">
                <Chip label={cycleCountStatusLabel(detail.status)} size="small" color={cycleCountStatusColor(detail.status)} />
              </KVBox>
              <KVBox label="Assigned To" value={detail.operatorName} />
              <KVBox
                label="Movement Period"
                value={`${formatDateOnly(detail.movementFrom)} – ${formatDateOnly(detail.movementTo)}${detail.includeArchived ? " (incl. archived)" : ""}`}
              />
              <KVBox label="Picked By" value={SELECTION_METHOD_LABELS[detail.selectionMethod as SelectionMethod] ?? detail.selectionMethod} />
              <KVBox label="CNC" value={CNC_FILTER_LABELS[detail.cncFilter as CncFilter] ?? detail.cncFilter} />
              <KVBox label="Material Class" value={detail.materialClasses.join(", ") || "–"} />
              <KVBox label="Stock File" value={detail.stockFileName} />
              <KVBox label="Locations" value={detail.totalLocations} />
              <KVBox label="Stock Lines" value={detail.totalLines} />
              <KVBox label="Created By" value={detail.createdByName} />
              <KVBox label="Created On" value={formatDateTime(detail.createdAt)} />
              {detail.cancelledAt && (
                <>
                  <KVBox label="Cancelled On" value={formatDateTime(detail.cancelledAt)} />
                  <KVBox label="Cancelled By" value={detail.cancelledByName} />
                </>
              )}
            </Box>

            <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
              <Typography fontWeight={700} mb={1}>
                Expected stock per location
              </Typography>
              <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                    <TableRow>
                      <TableCell sx={headSx}>Seq</TableCell>
                      <TableCell sx={headSx}>Storage Bin</TableCell>
                      <TableCell sx={headSx}>Movement</TableCell>
                      <TableCell sx={headSx}>Cert. No.</TableCell>
                      <TableCell sx={headSx}>Material</TableCell>
                      <TableCell sx={headSx}>Batch</TableCell>
                      <TableCell sx={headSx} align="right">Expected Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.slice(page * perPage, page * perPage + perPage).map((r, i) => (
                      <TableRow
                        key={r.id}
                        sx={{ backgroundColor: i % 2 === 1 ? alpha(theme.palette.primary.main, 0.12) : "inherit" }}
                      >
                        <TableCell>{r.seq}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{r.storageBin}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={`${MOVEMENT_LEVEL_LABELS[r.level as MovementLevel] ?? r.level} · ${r.moves}`}
                            color={movementLevelColor(r.level)}
                            variant={r.level === "NONE" ? "outlined" : "filled"}
                          />
                        </TableCell>
                        <TableCell>{r.certNo ?? "–"}</TableCell>
                        <TableCell>{r.materialCode}</TableCell>
                        <TableCell>{r.batch ?? "–"}</TableCell>
                        <TableCell align="right">{r.expectedQty}</TableCell>
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
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Paper>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
