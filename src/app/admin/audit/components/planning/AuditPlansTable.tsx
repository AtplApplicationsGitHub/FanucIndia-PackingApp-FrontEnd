"use client";

import { useState } from "react";

import {
  alpha,
  Box,
  Button,
  Chip,
  FormControl,
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
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useBomAudits } from "../../hooks/useBomAudits";
import { useCancelBomAudit } from "../../hooks/useCancelBomAudit";
import { AUDIT_LABELS } from "../../utils/auditLabels";
import {
  BOM_AUDIT_STATUS_OPTIONS,
  bomAuditStatusColor,
  bomAuditStatusLabel,
} from "../../utils/bomAuditStatus";
import type { BomAuditStatus, BomAuditSummary } from "../../types/audit";
import {
  STALE_AFTER_DAYS,
  formatAge,
  getAgeInDays,
} from "../../utils/auditAge";

import BomAuditDetailDialog from "./BomAuditDetailDialog";

export default function AuditPlansTable() {
  const theme = useTheme();
  const { audits, pagination, params, loading, updateParams } = useBomAudits();
  const { cancelBomAudit, loading: cancelling } = useCancelBomAudit();

  const [searchInput, setSearchInput] = useState("");
  const [viewId, setViewId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BomAuditSummary | null>(
    null,
  );

  const headCellSx = {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText,
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await cancelBomAudit(deleteTarget.id);
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("show-global-message", {
          detail: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to cancel audit.",
            severity: "error",
          },
        }),
      );
      // list may be stale (e.g. already cancelled) -> refresh it
      window.dispatchEvent(new Event("bom-audits-updated"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box
      sx={{
        mt: 2,
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            p: 2,
          }}
        >
          <Typography fontWeight={700}>Audit Tracker</Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({
                  search: searchInput.trim().replace(/\s+/g, " "),
                  page: 1,
                });
              }}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 230 },
                border: 1,
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.23)"
                    : "#e0e0e0",
                borderRadius: "4px",
                height: 40,
                bgcolor: "background.paper",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: "14px" }}
                placeholder="Search"
                inputProps={{ "aria-label": "search audits" }}
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

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={params.status || "ALL"}
                onChange={(e) => {
                  const next = e.target.value;
                  updateParams({
                    status: next === "ALL" ? "" : (next as BomAuditStatus),
                    page: 1,
                  });
                }}
                inputProps={{ "aria-label": "Audit status filter" }}
              >
                <MenuItem value="ALL">All statuses</MenuItem>
                {BOM_AUDIT_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer sx={{ flex: 1 }}>
          <Table size="small">
            <TableHead
              sx={{
                bgcolor: theme.palette.primary.main,
              }}
            >
              <TableRow>
                <TableCell sx={headCellSx}>Audit ID</TableCell>
                <TableCell sx={headCellSx}>Audit Name</TableCell>
                <TableCell sx={headCellSx}>Type</TableCell>
                <TableCell sx={headCellSx}>Assigned To</TableCell>
                <TableCell sx={headCellSx}>Created On</TableCell>
                <TableCell sx={headCellSx}>Source File</TableCell>
                <TableCell sx={headCellSx}>Status</TableCell>
                <TableCell align="center" sx={headCellSx}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? "Loading audits..." : "No audits found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                audits.map((audit, index) => {
                  const isAssigned = audit.status === "ASSIGNED";
                  const ageDays = getAgeInDays(audit.createdAt);
                  const isStale = isAssigned && ageDays >= STALE_AFTER_DAYS;

                  return (
                    <TableRow
                      key={audit.id}
                      sx={{
                        backgroundColor:
                          index % 2 === 1
                            ? alpha(theme.palette.primary.main, 0.2)
                            : "inherit",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.action.hover,
                            0.05,
                          ),
                        },
                      }}
                    >
                      <TableCell>{audit.auditNo}</TableCell>

                      <TableCell>{audit.auditName}</TableCell>

                      <TableCell>{AUDIT_LABELS.bom}</TableCell>

                      <TableCell>{audit.operatorName}</TableCell>

                      <TableCell>
                        {new Date(audit.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </TableCell>

                      <TableCell>{audit.fileName}</TableCell>

                      <TableCell>
                        <Chip
                          label={bomAuditStatusLabel(audit.status)}
                          color={bomAuditStatusColor(audit.status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="View Audit">
                          <IconButton
                            size="small"
                            aria-label={`View ${audit.auditName}`}
                            onClick={() => setViewId(audit.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            isAssigned
                              ? "Delete Audit"
                              : "Only assigned audits can be deleted"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={!isAssigned}
                              aria-label={`Delete ${audit.auditName}`}
                              onClick={() => setDeleteTarget(audit)}
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
          onRowsPerPageChange={(e) =>
            updateParams({ limit: parseInt(e.target.value, 10), page: 1 })
          }
        />
      </Paper>

      <BomAuditDetailDialog auditId={viewId} onClose={() => setViewId(null)} />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => (cancelling ? undefined : setDeleteTarget(null))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Audit</DialogTitle>

        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.auditName}</strong>? The audit will be marked
            CANCELLED.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button disabled={cancelling} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={cancelling}
            onClick={handleConfirmDelete}
          >
            {cancelling ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
