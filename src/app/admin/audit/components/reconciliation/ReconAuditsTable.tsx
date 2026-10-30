"use client";

import { useState } from "react";

import {
  alpha,
  Box,
  Button,
  Chip,
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
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useRouter } from "next/navigation";

import { AccuracyBar, ReconStatusChip } from "./ReconChips";
import type { ReconListParams } from "../../hooks/useReconciliationAudits";
import type { BomAuditPagination } from "../../types/audit";
import type {
  ReconAuditStatus,
  ReconAuditSummary,
} from "../../types/reconciliation";
import { STALE_AFTER_DAYS, getAgeInDays } from "../../utils/auditAge";
import {
  RECON_STATUS_LABELS,
  getAccuracy,
  isActiveStatus,
} from "../../utils/reconLabels";
import { reconciliationDetailRoute } from "../../utils/auditRoutes";
type Props = {
  audits: ReconAuditSummary[];
  pagination: BomAuditPagination;
  params: ReconListParams;
  loading: boolean;
  updateParams: (patch: Partial<ReconListParams>) => void;
};

export default function ReconAuditsTable({
  audits,
  pagination,
  params,
  loading,
  updateParams,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  const headCellSx = {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText,
  };

  return (
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
        <Typography fontWeight={700}>Reconciliation Tracker</Typography>

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
              borderColor: (t) =>
                t.palette.mode === "dark"
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
              inputProps={{ "aria-label": "search reconciliations" }}
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

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <Select
              value={params.status || "ALL"}
              onChange={(e) => {
                const next = e.target.value;

                updateParams({
                  status: next === "ALL" ? "" : (next as ReconAuditStatus),
                  page: 1,
                });
              }}
              inputProps={{ "aria-label": "Reconciliation status filter" }}
            >
              <MenuItem value="ALL">All statuses</MenuItem>
              {(Object.keys(RECON_STATUS_LABELS) as ReconAuditStatus[]).map(
                (s) => (
                  <MenuItem key={s} value={s}>
                    {RECON_STATUS_LABELS[s]}
                  </MenuItem>
                ),
              )}
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
              <TableCell sx={headCellSx}>Uploaded On</TableCell>
              <TableCell align="right" sx={headCellSx}>
                Locations
              </TableCell>
              <TableCell align="right" sx={headCellSx}>
                Expected
              </TableCell>
              <TableCell align="right" sx={headCellSx}>
                Scanned
              </TableCell>
              <TableCell sx={headCellSx}>Accuracy</TableCell>
              <TableCell align="right" sx={headCellSx}>
                Open Variances
              </TableCell>
              <TableCell sx={headCellSx}>Status</TableCell>
              <TableCell align="center" sx={headCellSx}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {audits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading ? "Loading audits..." : "No audits found."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              audits.map((audit, index) => {
                const active = isActiveStatus(audit.status);
                const ageDays = getAgeInDays(audit.uploadedAt);
                const isStale = active && ageDays >= STALE_AFTER_DAYS;

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
                    <TableCell>{audit.operatorName}</TableCell>

                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(audit.uploadedAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                      {isStale && (
                        <Chip
                          size="small"
                          color="warning"
                          variant="outlined"
                          label={`${ageDays}d waiting`}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="right">{audit.totalLocations}</TableCell>
                    <TableCell align="right">
                      {audit.expectedComponents}
                    </TableCell>
                    <TableCell align="right">
                      {audit.scannedComponents}
                    </TableCell>

                    <TableCell>
                      <AccuracyBar
                        value={getAccuracy(
                          audit.matchedComponents,
                          audit.expectedComponents,
                        )}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        component="span"
                        variant="body2"
                        fontWeight={700}
                        color={
                          audit.openVariances > 0
                            ? "error.main"
                            : "text.primary"
                        }
                      >
                        {audit.openVariances}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {" "}
                        / {audit.totalVariances}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <ReconStatusChip status={audit.status} />
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant={active ? "contained" : "outlined"}
                        color={active ? "primary" : "inherit"}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                        onClick={() =>
                          router.push(reconciliationDetailRoute(audit.id))
                        }
                      >
                        {active ? "Reconcile" : "View"}
                      </Button>
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
  );
}
