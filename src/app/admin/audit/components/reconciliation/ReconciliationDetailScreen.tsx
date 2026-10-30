"use client";

import { useMemo, useState } from "react";

import {
  alpha,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useParams, useRouter } from "next/navigation";

import CommonButton from "@/common/components/CommonButton";
import { KVBox } from "@/app/so-search/components/KVBox";
import ReverifyDialog from "./ReverifyDialog";
import DiscrepancyReviewDialog from "./DiscrepancyReviewDialog";
import ReconDetailStatCards from "./ReconDetailStatCards";
import { IssueChip, ReconStatusChip, VarianceStatusChip } from "./ReconChips";
import { useReconciliationDetail } from "../../hooks/useReconciliationDetail";
import {
  DECISION_LABELS,
  ISSUE_LABELS,
  ISSUE_ORDER,
  formatDateTime,
} from "../../utils/reconLabels";
import type {
  ReconDecision,
  ReconIssueType,
  ReconSapAction,
  ReconVarianceStatus,
} from "../../types/reconciliation";

const toast = (message: string, severity: "success" | "error" | "info") =>
  window.dispatchEvent(
    new CustomEvent("show-global-message", { detail: { message, severity } }),
  );

const csvCell = (value: string | number | null) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function ReconciliationDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const routeParams = useParams<{ auditId: string }>();
  const auditId = Number(routeParams.auditId);
  const {
    detail,
    loading,
    error,
    saveDecision,
    closeAudit,
    reverifications,
    assignReverify,
  } = useReconciliationDetail(Number.isFinite(auditId) ? auditId : null);

  const [reverifyBin, setReverifyBin] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState("");
  const [binFilter, setBinFilter] = useState("ALL");
  const [issueFilter, setIssueFilter] = useState<ReconIssueType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ReconVarianceStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);

  const headCellSx = {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText,
  };

  const bins = useMemo(
    () =>
      Array.from(new Set((detail?.variances ?? []).map((v) => v.storageBin))),
    [detail],
  );

  // Location-wise variance summary (one row per storage bin that has variances)
  const binSummary = useMemo(
    () =>
      bins.map((bin) => {
        const list = (detail?.variances ?? []).filter(
          (v) => v.storageBin === bin,
        );

        return {
          bin,
          missing: list.filter((v) => v.issueType === "MISSING").length,
          excess: list.filter((v) => v.issueType === "EXCESS").length,
          qty: list.filter((v) => v.issueType === "QUANTITY_MISMATCH").length,
          open: list.filter((v) => v.status === "OPEN").length,
          reverify: reverifications.find((r) => r.storageBin === bin) ?? null,
        };
      }),
    [bins, detail, reverifications],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (detail?.variances ?? []).filter(
      (v) =>
        (binFilter === "ALL" || v.storageBin === binFilter) &&
        (issueFilter === "ALL" || v.issueType === issueFilter) &&
        (statusFilter === "ALL" || v.status === statusFilter) &&
        (!q ||
          v.storageBin.toLowerCase().includes(q) ||
          v.materialCode.toLowerCase().includes(q)),
    );
  }, [detail, search, binFilter, issueFilter, statusFilter]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !detail) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Alert severity="error">{error || "Audit not found."}</Alert>
        <Button
          sx={{ alignSelf: "flex-start" }}
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/audit/reconciliation")}
        >
          Back to list
        </Button>
      </Box>
    );
  }

  const isClosed = detail.status === "CLOSED";
  const reviewing = detail.variances.find((v) => v.id === reviewId) ?? null;

  const handleReverify = async (operatorId: number, operatorName: string) => {
    if (!reverifyBin) return;
    setAssigning(true);

    try {
      await assignReverify(reverifyBin, operatorId, operatorName);
      toast(
        `${reverifyBin} reverification assigned to ${operatorName}.`,
        "success",
      );
      setReverifyBin(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to assign.", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleSave = async (
    decision: ReconDecision,
    sapAction: ReconSapAction,
    remarks: string,
  ) => {
    if (reviewId === null) return;
    setSaving(true);

    try {
      await saveDecision(reviewId, decision, sapAction, remarks);
      toast("Reconciliation saved.", "success");
      setReviewId(null);
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Failed to save reconciliation.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);

    try {
      await closeAudit();
      toast(`${detail.auditNo} closed.`, "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to close audit.", "error");
    } finally {
      setClosing(false);
      setConfirmClose(false);
    }
  };

  // Variance report - downloads a CSV of every discrepancy of this audit.
  const handleReport = () => {
    const header = [
      "Audit No",
      "Operator",
      "Storage Bin",
      "Material",
      "Expected Qty",
      "Scanned Qty",
      "Variance",
      "Issue Type",
      "Status",
      "Decision",
      "Remarks",
    ];
    const lines = detail.variances.map((v) =>
      [
        detail.auditNo,
        detail.operatorName,
        v.storageBin,
        v.materialCode,
        v.expectedQty,
        v.scannedQty,
        v.scannedQty - v.expectedQty,
        ISSUE_LABELS[v.issueType],
        v.status === "OPEN" ? "Open" : "Resolved",
        v.decision ? DECISION_LABELS[v.decision] : "",
        v.remarks,
      ]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob(
      [[header.map(csvCell).join(","), ...lines].join("\n")],
      {
        type: "text/csv;charset=utf-8;",
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${detail.auditNo}_variance_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Variance report downloaded.", "success");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {detail.auditNo} – {detail.auditName}
        </Typography>
        <ReconStatusChip status={detail.status} />
      </Box>

      {/* Audit info */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        <KVBox label="Assigned To" value={detail.operatorName} />
        <KVBox label="Uploaded On" value={formatDateTime(detail.uploadedAt)} />
        <KVBox label="Source File" value={detail.fileName} />
        <KVBox label="Total Locations" value={detail.totalLocations} />
        {detail.closedAt && (
          <>
            <KVBox label="Closed On" value={formatDateTime(detail.closedAt)} />
            <KVBox label="Closed By" value={detail.closedByName} />
          </>
        )}
      </Box>

      {/* Metrics */}
      <ReconDetailStatCards
        expected={detail.expectedComponents}
        metrics={{
          scanned: detail.scannedComponents,
          matched: detail.matchedComponents,
          totalVariances: detail.totalVariances,
          openVariances: detail.openVariances,
        }}
      />

      {/* Location-wise variance */}
      {binSummary.length > 0 && (
        <Accordion
          disableGutters
          variant="outlined"
          sx={{ borderRadius: 2, "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>Location-wise variance</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Storage Bin</TableCell>
                    <TableCell align="right">Missing</TableCell>
                    <TableCell align="right">Excess</TableCell>
                    <TableCell align="right">Qty Mismatch</TableCell>
                    <TableCell align="right">Open</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {binSummary.map((b) => (
                    <TableRow key={b.bin} hover>
                      <TableCell>{b.bin}</TableCell>
                      <TableCell align="right">{b.missing}</TableCell>
                      <TableCell align="right">{b.excess}</TableCell>
                      <TableCell align="right">{b.qty}</TableCell>
                      <TableCell align="right">{b.open}</TableCell>
                      <TableCell align="right">
                        {b.reverify ? (
                          <Chip
                            size="small"
                            color="info"
                            variant="outlined"
                            label={`Reverify assigned – ${b.reverify.operatorName}`}
                          />
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: "none" }}
                            disabled={b.open > 0 || isClosed}
                            onClick={() => setReverifyBin(b.bin)}
                          >
                            Reverify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Discrepancies */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
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
          <Typography fontWeight={700}>Discrepancies</Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box
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
                placeholder="Search bin / material"
                inputProps={{ "aria-label": "search discrepancies" }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
              {search ? (
                <IconButton
                  sx={{ p: "5px" }}
                  aria-label="clear search"
                  onClick={() => setSearch("")}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              ) : (
                <SearchIcon
                  sx={{ fontSize: 20, mr: 0.75, color: "action.active" }}
                />
              )}
            </Box>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={binFilter}
                onChange={(e) => {
                  setBinFilter(e.target.value);
                  setPage(0);
                }}
                inputProps={{ "aria-label": "Storage bin filter" }}
              >
                <MenuItem value="ALL">All bins</MenuItem>
                {bins.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={issueFilter}
                onChange={(e) => {
                  setIssueFilter(e.target.value as ReconIssueType | "ALL");
                  setPage(0);
                }}
                inputProps={{ "aria-label": "Issue type filter" }}
              >
                <MenuItem value="ALL">All issue types</MenuItem>
                {ISSUE_ORDER.map((t) => (
                  <MenuItem key={t} value={t}>
                    {ISSUE_LABELS[t]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as ReconVarianceStatus | "ALL",
                  );
                  setPage(0);
                }}
                inputProps={{ "aria-label": "Discrepancy status filter" }}
              >
                <MenuItem value="ALL">All statuses</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={headCellSx}>Storage Bin</TableCell>
                <TableCell sx={headCellSx}>Material</TableCell>
                <TableCell align="right" sx={headCellSx}>
                  Expected Qty
                </TableCell>
                <TableCell align="right" sx={headCellSx}>
                  Scanned Qty
                </TableCell>
                <TableCell align="right" sx={headCellSx}>
                  Variance
                </TableCell>
                <TableCell sx={headCellSx}>Issue Type</TableCell>
                <TableCell sx={headCellSx}>Status</TableCell>
                <TableCell align="center" sx={headCellSx}>
                  Review
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No discrepancies found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows
                  .slice(page * perPage, page * perPage + perPage)
                  .map((v, index) => {
                    const diff = v.scannedQty - v.expectedQty;

                    return (
                      <TableRow
                        key={v.id}
                        sx={{
                          backgroundColor:
                            index % 2 === 1
                              ? alpha(theme.palette.primary.main, 0.2)
                              : "inherit",
                        }}
                      >
                        <TableCell>{v.storageBin}</TableCell>
                        <TableCell>{v.materialCode}</TableCell>
                        <TableCell align="right">{v.expectedQty}</TableCell>
                        <TableCell align="right">{v.scannedQty}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color:
                              diff < 0
                                ? "error.main"
                                : diff > 0
                                  ? "warning.main"
                                  : "text.secondary",
                          }}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </TableCell>
                        <TableCell>
                          <IssueChip type={v.issueType} />
                        </TableCell>
                        <TableCell>
                          <VarianceStatusChip status={v.status} />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant={
                              v.status === "OPEN" && !isClosed
                                ? "contained"
                                : "outlined"
                            }
                            color={
                              v.status === "OPEN" && !isClosed
                                ? "primary"
                                : "inherit"
                            }
                            sx={{ textTransform: "none", fontWeight: 600 }}
                            onClick={() => setReviewId(v.id)}
                          >
                            {isClosed
                              ? "View"
                              : v.status === "OPEN"
                                ? "Review"
                                : "Edit"}
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
          count={rows.length}
          rowsPerPage={perPage}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          onRowsPerPageChange={(e) => {
            setPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Actions */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <CommonButton variant="contained" onClick={handleReport}>
            Download Variance Report
          </CommonButton>
          <CommonButton
            variant="contained"
            color="error"
            disabled={detail.status !== "RECONCILED"}
            onClick={() => setConfirmClose(true)}
          >
            Close Audit
          </CommonButton>
        </Box>

        {detail.status !== "RECONCILED" && !isClosed && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Close Audit is enabled once all discrepancies are resolved.
          </Typography>
        )}
      </Paper>

      <DiscrepancyReviewDialog
        variance={reviewing}
        readOnly={isClosed}
        saving={saving}
        onClose={() => setReviewId(null)}
        onSave={handleSave}
      />

      <Dialog
        open={confirmClose}
        onClose={() => (closing ? undefined : setConfirmClose(false))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Close Audit</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Close <strong>{detail.auditNo}</strong>? Once closed, its
            discrepancies can no longer be edited.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={closing} onClick={() => setConfirmClose(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={closing}
            onClick={handleClose}
          >
            {closing ? "Closing..." : "Close Audit"}
          </Button>
        </DialogActions>
      </Dialog>
      <ReverifyDialog
        open={reverifyBin !== null}
        auditNo={detail.auditNo}
        storageBin={reverifyBin}
        saving={assigning}
        onClose={() => setReverifyBin(null)}
        onConfirm={handleReverify}
      />
    </Box>
  );
}
