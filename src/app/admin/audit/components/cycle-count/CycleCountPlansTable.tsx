"use client";

import { useState } from "react";

import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useCycleCountAudits } from "../../hooks/useCycleCountAudits";
import {
  CYCLE_COUNT_UPDATED_EVENT,
  cancelCycleCount,
  showGlobalMessage,
} from "../../utils/cycleCountApi";
import {
  CYCLE_COUNT_STATUS_OPTIONS,
  cycleCountStatusColor,
  cycleCountStatusLabel,
  formatDateOnly,
} from "../../utils/cycleCountLabels";
import type { CycleCountStatus, CycleCountSummary } from "../../types/cycleCount";
import CycleCountDetailDialog from "./CycleCountDetailDialog";

/** Cycle Count audit tracker (same layout as the BOM Audit Tracker). */
export default function CycleCountPlansTable() {
  const theme = useTheme();
  const { audits, pagination, params, loading, updateParams } = useCycleCountAudits();
  const [searchInput, setSearchInput] = useState("");
  const [viewId, setViewId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CycleCountSummary | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const headCellSx = { fontWeight: "bold", color: theme.palette.primary.contrastText, whiteSpace: "nowrap" as const };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      showGlobalMessage(await cancelCycleCount(cancelTarget.id), "success");
    } catch (error) {
      showGlobalMessage(error instanceof Error ? error.message : "Failed to cancel audit.", "error");
    } finally {
      // refresh in both cases (the list may be stale, e.g. already cancelled)
      window.dispatchEvent(new Event(CYCLE_COUNT_UPDATED_EVENT));
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  return (
    <Box sx={{ mt: 2, flex: 1, display: "flex", flexDirection: "column" }}>
      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, p: 2 }}>
          <Typography fontWeight={700}>Cycle Count Tracker</Typography>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ search: searchInput.trim().replace(/\s+/g, " "), page: 1 });
              }}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 230 },
                border: 1,
                borderColor: (t) => (t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.23)" : "#e0e0e0"),
                borderRadius: "4px",
                height: 40,
                bgcolor: "background.paper",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: "14px" }}
                placeholder="Search"
                inputProps={{ "aria-label": "search cycle count audits" }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <IconButton
                  sx={{ p: "5px" }}
                  aria-label="clear search"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: "", page: 1 });
                  }}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={params.status || "ALL"}
                onChange={(e) => {
                  const next = e.target.value;
                  updateParams({ status: next === "ALL" ? "" : (next as CycleCountStatus), page: 1 });
                }}
                inputProps={{ "aria-label": "Cycle Count status filter" }}
              >
                <MenuItem value="ALL">All statuses</MenuItem>
                {CYCLE_COUNT_STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer sx={{ flex: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={headCellSx}>Audit ID</TableCell>
                <TableCell sx={headCellSx}>Audit Name</TableCell>
                <TableCell sx={headCellSx}>Assigned To</TableCell>
                <TableCell sx={headCellSx} align="right">Locations</TableCell>
                <TableCell sx={headCellSx}>Movement Period</TableCell>
                <TableCell sx={headCellSx}>Created On</TableCell>
                <TableCell sx={headCellSx}>Status</TableCell>
                <TableCell sx={headCellSx} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? "Loading audits..." : "No Cycle Count audits found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                audits.map((audit, index) => {
                  const isAssigned = audit.status === "ASSIGNED";
                  return (
                    <TableRow
                      key={audit.id}
                      sx={{
                        backgroundColor: index % 2 === 1 ? alpha(theme.palette.primary.main, 0.2) : "inherit",
                        "&:hover": { backgroundColor: alpha(theme.palette.action.hover, 0.05) },
                      }}
                    >
                      <TableCell>{audit.auditNo}</TableCell>
                      <TableCell>{audit.auditName}</TableCell>
                      <TableCell>{audit.operatorName}</TableCell>
                      <TableCell align="right">{audit.totalLocations}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateOnly(audit.movementFrom)} – {formatDateOnly(audit.movementTo)}
                        {audit.includeArchived && (
                          <Typography component="span" variant="caption" color="text.secondary" display="block">
                            incl. archived
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(audit.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip label={cycleCountStatusLabel(audit.status)} color={cycleCountStatusColor(audit.status)} size="small" />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="View Audit">
                          <IconButton size="small" aria-label={`View ${audit.auditName}`} onClick={() => setViewId(audit.id)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isAssigned ? "Cancel Audit" : "Only assigned audits can be cancelled"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={!isAssigned}
                              aria-label={`Cancel ${audit.auditName}`}
                              onClick={() => setCancelTarget(audit)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={params.limit}
          page={params.page - 1}
          onPageChange={(_, nextPage) => updateParams({ page: nextPage + 1 })}
          onRowsPerPageChange={(e) => updateParams({ limit: parseInt(e.target.value, 10), page: 1 })}
        />
      </Paper>

      <CycleCountDetailDialog auditId={viewId} onClose={() => setViewId(null)} />

      <Dialog open={Boolean(cancelTarget)} onClose={() => (cancelling ? undefined : setCancelTarget(null))} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Audit</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to cancel <strong>{cancelTarget?.auditNo}</strong> ({cancelTarget?.auditName})? The audit will be marked CANCELLED.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={cancelling} onClick={() => setCancelTarget(null)}>
            Keep
          </Button>
          <Button color="error" variant="contained" disabled={cancelling} onClick={handleConfirmCancel}>
            {cancelling ? "Cancelling..." : "Cancel Audit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
