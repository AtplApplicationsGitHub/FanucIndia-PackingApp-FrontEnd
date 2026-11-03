"use client";

import { useEffect, useMemo, useState } from "react";

import {
  alpha,
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
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
import {
  ClipboardCheck,
  Download,
  Eye,
  MapPinned,
  Pencil,
  PencilLine,
  X,
} from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CommonButton from "@/common/components/CommonButton";
import BulkReviewDialog from "./BulkReviewDialog";
import DiscrepancyReviewDialog from "./DiscrepancyReviewDialog";
import LocationVarianceDialog from "./LocationVarianceDialog";
import ReconDetailStatCards from "./ReconDetailStatCards";
import ReconMetricCard from "./ReconMetricCard";
import { IssueChip, ReconStatusChip, VarianceStatusChip } from "./ReconChips";
import { useDownloadBomReport } from "../../hooks/useDownloadBomReport";
import { useReconciliationDetail } from "../../hooks/useReconciliationDetail";
import {
  CATEGORY_ALL,
  CATEGORY_ALL_EXCEPT_VALID,
  CATEGORY_DEFAULT,
  CATEGORY_GROUP_LABELS,
  ISSUE_LABELS,
  ISSUE_ORDER,
  formatDateTime,
  isReviewable,
  matchesCategory,
} from "../../utils/reconLabels";
import type { AuditRow, AuditType } from "../../types/audit";
import type {
  ReconAuditDetail,
  ReconCategoryFilter,
  ReconDecision,
  ReconSapAction,
  ReconVariance,
  ReconVarianceStatus,
} from "../../types/reconciliation";

const toast = (message: string, severity: "success" | "error" | "info") =>
  window.dispatchEvent(
    new CustomEvent("show-global-message", { detail: { message, severity } }),
  );

// Shown while there is nothing to reconcile yet (same layout, values "—")
const EMPTY_RECON_DETAIL: ReconAuditDetail = {
  id: 0,
  auditNo: "",
  auditName: "",
  auditType: "",
  status: "",
  reviewStatus: "NOT_STARTED",
  operatorId: 0,
  operatorName: "",
  fileName: "",
  createdAt: "",
  submittedAt: null,
  totalLocations: 0,
  expectedComponents: 0,
  scannedComponents: 0,
  matchedComponents: 0,
  accuracy: 0,
  totalVariances: 0,
  openVariances: 0,
  resolvedVariances: 0,
  locations: [],
  variances: [],
  closedAt: null,
  closedByName: null,
  canClose: false,
};

const NO_ROWS: AuditRow[] = [];

// One layout for every status (assigned / in progress / reconciliation / closed):
// the header, the rows and the empty state all read from this list, so the
// columns keep the same width and the rows the same height in every state.
const SELECT_COL_WIDTH = 44;
const ROW_HEIGHT = 41;
const COLUMNS: {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width: number;
}[] = [
  { key: "sno", label: "S.No", align: "right", width: 64 },
  { key: "bin", label: "Storage Bin", width: 110 },
  { key: "material", label: "Material Code", width: 200 },
  { key: "expected", label: "Expected", align: "right", width: 90 },
  { key: "scanned", label: "Scanned", align: "right", width: 90 },
  { key: "diff", label: "Difference", align: "right", width: 100 },
  { key: "category", label: "Category", width: 130 },
  { key: "status", label: "Status", width: 100 },
  { key: "lastScanned", label: "Last Scanned", width: 170 },
  { key: "completed", label: "Location Completed", width: 170 },
  { key: "actions", label: "Actions", align: "center", width: 80 },
];

type Props = {
  auditType: AuditType;
  auditId: number;
  pendingRows?: AuditRow[];
  onAuditStatusChange?: (status: string) => void;
  /** true = not submitted yet / type has no reconciliation: no API call, values show "—" */
  pending?: boolean;
  /** Expected lines, known from the audit file even while pending */
  expectedLines?: number;
  onClosedAtChange?: (closedAt: string | null) => void;
};

export default function ReconciliationPanel({
  auditType,
  auditId,
  onAuditStatusChange,
  pending = false,
  expectedLines = 0,
  pendingRows = NO_ROWS,
  onClosedAtChange,
}: Props) {
  const theme = useTheme();
  const {
    detail: loadedDetail,
    loading: loadingRaw,
    error: errorRaw,
    saveDecision,
    saveBulkDecision,
    closeAudit,
  } = useReconciliationDetail(
    auditType,
    !pending && Number.isFinite(auditId) ? auditId : null,
  );

  const pendingDetail = useMemo<ReconAuditDetail>(
    () => ({
      ...EMPTY_RECON_DETAIL,
      variances: pendingRows.map(
        (r): ReconVariance => ({
          id: r.excelRow,
          storageBin: r.storage,
          materialCode: r.materialCode,
          expectedQty: r.quantity,
          scannedQty: 0,
          issueType: "MISSING",
          status: "OPEN",
          decision: null,
          sapAction: "NONE",
          remarks: "",
          scannedAt: null,
          locationCompletedAt: null,
          resolvedAt: null,
          resolvedByName: null,
        }),
      ),
    }),
    [pendingRows],
  );

  const detail = pending ? pendingDetail : loadedDetail;
  const loading = pending ? false : loadingRaw;
  const error = pending ? "" : errorRaw;

  const [search, setSearch] = useState("");
  const [binFilter, setBinFilter] = useState("ALL");
  const [issueFilter, setIssueFilter] =
    useState<ReconCategoryFilter>(CATEGORY_DEFAULT);
  const [statusFilter, setStatusFilter] = useState<ReconVarianceStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const { downloadReport, loading: downloading } = useDownloadBomReport();

  const headCellSx = {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText,
    textTransform: "uppercase",
  } as const;

  const bins = useMemo(
    () =>
      Array.from(new Set((detail?.variances ?? []).map((v) => v.storageBin))),
    [detail],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (detail?.variances ?? []).filter(
      (v) =>
        (binFilter === "ALL" || v.storageBin === binFilter) &&
        matchesCategory(v.issueType, issueFilter) &&
        (statusFilter === "ALL" ||
          (isReviewable(v.issueType) && v.status === statusFilter)) &&
        (!q ||
          v.storageBin.toLowerCase().includes(q) ||
          v.materialCode.toLowerCase().includes(q)),
    );
  }, [detail, search, binFilter, issueFilter, statusFilter]);

  const pageRows = useMemo(
    () => rows.slice(page * perPage, page * perPage + perPage),
    [rows, page, perPage],
  );

  const selectedVariances = useMemo(
    () => (detail?.variances ?? []).filter((v) => selectedIds.includes(v.id)),
    [detail, selectedIds],
  );

  useEffect(() => {
    setSelectedIds([]);
  }, [search, binFilter, issueFilter, statusFilter, page, perPage]);

  useEffect(() => {
    onClosedAtChange?.(detail?.closedAt ?? null);
  }, [detail?.closedAt, onClosedAtChange]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !detail) {
    return <Alert severity="error">{error || "Audit not found."}</Alert>;
  }

  const isClosed = detail.status === "CLOSED";
  const reviewing = detail.variances.find((v) => v.id === reviewId) ?? null;

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

  const pageIds = pageRows
    .filter((v) => isReviewable(v.issueType))
    .map((v) => v.id);
  const pageSelectedCount = pageIds.filter((rowId) =>
    selectedIds.includes(rowId),
  ).length;
  const allPageSelected =
    pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const somePageSelected = pageSelectedCount > 0 && !allPageSelected;

  const toggleSelectPage = () => setSelectedIds(allPageSelected ? [] : pageIds);

  const toggleSelectOne = (rowId: number) =>
    setSelectedIds((prev) =>
      prev.includes(rowId) ? prev.filter((x) => x !== rowId) : [...prev, rowId],
    );

  const handleBulkSave = async (
    decision: ReconDecision,
    sapAction: ReconSapAction,
    remarks: string,
  ) => {
    const ids = selectedVariances.map((v) => v.id);
    if (ids.length === 0) return;
    setBulkSaving(true);

    try {
      await saveBulkDecision(ids, decision, sapAction, remarks);
      toast(
        `${ids.length} ${ids.length === 1 ? "discrepancy" : "discrepancies"} reviewed.`,
        "success",
      );
      setBulkOpen(false);
      setSelectedIds([]);
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Failed to save reconciliation.",
        "error",
      );
    } finally {
      setBulkSaving(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);

    try {
      const closed = await closeAudit();
      if (closed) onAuditStatusChange?.(closed.status);
      toast(`${detail.auditNo} closed.`, "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to close audit.", "error");
    } finally {
      setClosing(false);
      setConfirmClose(false);
    }
  };

  const locationsWithVariance = detail.locations.filter(
    (l) => l.totalVariances > 0,
  ).length;

  const actionFor = (status: ReconVarianceStatus) => {
    if (isClosed) return { label: "View", icon: <Eye size={18} /> };
    if (status === "OPEN") {
      return { label: "Review", icon: <PencilLine size={18} /> };
    }
    return { label: "Edit", icon: <ClipboardCheck size={18} /> };
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Metrics */}
      <ReconDetailStatCards
        expected={pending ? expectedLines : detail.expectedComponents}
        metrics={
          pending
            ? null
            : {
                scanned: detail.scannedComponents,
                matched: detail.matchedComponents,
                totalVariances: detail.totalVariances,
                openVariances: detail.openVariances,
              }
        }
        extraCard={
          <ReconMetricCard
            title="Location Wise Variance"
            value={
              pending
                ? "—"
                : `${detail.locations.length} ${detail.locations.length === 1 ? "Location" : "Locations"}`
            }
            caption={
              pending ? undefined : `${locationsWithVariance} with variance`
            }
            icon={<MapPinned size={18} />}
            onClick={pending ? undefined : () => setLocationsOpen(true)}
          />
        }
      />

      {/* Discrepancies */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            px: 1.5,
            pt: 1.25,
            pb: 1.25,
          }}
        >
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

            <FormControl size="small" sx={{ minWidth: 100 }}>
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

            <FormControl size="small" sx={{ minWidth: 190 }}>
              <Select
                value={issueFilter}
                onChange={(e) => {
                  setIssueFilter(e.target.value as ReconCategoryFilter);
                  setPage(0);
                }}
                inputProps={{ "aria-label": "Category filter" }}
              >
                <MenuItem value={CATEGORY_ALL}>
                  {CATEGORY_GROUP_LABELS[CATEGORY_ALL]}
                </MenuItem>
                <MenuItem value={CATEGORY_ALL_EXCEPT_VALID}>
                  {CATEGORY_GROUP_LABELS[CATEGORY_ALL_EXCEPT_VALID]}
                </MenuItem>
                {[...ISSUE_ORDER, "VALID" as const].map((t) => (
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              ml: "auto",
            }}
          >
            {!isClosed && (
              <CommonButton
                variant="contained"
                startIcon={<Pencil size={16} />}
                disabled={pending || selectedVariances.length === 0}
                onClick={() => setBulkOpen(true)}
              >
                {selectedVariances.length > 0
                  ? `REVIEW (${selectedVariances.length})`
                  : "REVIEW"}
              </CommonButton>
            )}

            <CommonButton
              variant="contained"
              startIcon={<Download size={16} />}
              disabled={downloading || pending}
              onClick={() => void downloadReport(detail.id, detail.auditNo)}
            >
              {downloading ? "DOWNLOADING..." : "DOWNLOAD REPORT"}
            </CommonButton>

            {!isClosed && (
              <Tooltip
                title={
                  detail.canClose
                    ? ""
                    : "Close Audit is enabled once all discrepancies are resolved."
                }
              >
                <span>
                  <CommonButton
                    variant="contained"
                    color="error"
                    disabled={!detail.canClose}
                    onClick={() => setConfirmClose(true)}
                  >
                    CLOSE AUDIT
                  </CommonButton>
                </span>
              </Tooltip>
            )}
            {isClosed && detail.closedAt && (
              <Typography variant="caption" color="text.secondary">
                Closed by {detail.closedByName ?? "-"} on{" "}
                {formatDateTime(detail.closedAt)}
              </Typography>
            )}
            {!pending && <ReconStatusChip status={detail.reviewStatus} />}
          </Box>
        </Box>

        <TableContainer>
          <Table
            size="small"
            sx={{
              tableLayout: "fixed",
              minWidth:
                COLUMNS.reduce((sum, c) => sum + c.width, 0) +
                (isClosed ? 0 : SELECT_COL_WIDTH),
              "& .MuiTableCell-root": {
                px: 1,
                py: 0.75,
                fontSize: 13,
                lineHeight: 1.35,
              },
              "& .MuiTableCell-head": { fontSize: 12, letterSpacing: 0.2 },
            }}
          >
            <colgroup>
              {!isClosed && <col style={{ width: SELECT_COL_WIDTH }} />}
              {COLUMNS.map((c) => (
                <col key={c.key} style={{ width: c.width }} />
              ))}
            </colgroup>
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                {!isClosed && (
                  <TableCell
                    padding="checkbox"
                    sx={{ ...headCellSx, width: 44 }}
                  >
                    <Checkbox
                      size="small"
                      indeterminate={somePageSelected}
                      checked={allPageSelected}
                      disabled={pageIds.length === 0 || pending}
                      onChange={toggleSelectPage}
                      inputProps={{
                        "aria-label": "Select all rows on this page",
                      }}
                      sx={{
                        p: 0.5,
                        color: theme.palette.primary.contrastText,
                        "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    />
                  </TableCell>
                )}
                {COLUMNS.map((c) => (
                  <TableCell key={c.key} align={c.align} sx={headCellSx}>
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length + (isClosed ? 0 : 1)}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {pending ? "—" : "No discrepancies found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((v, index) => {
                  const diff = v.scannedQty - v.expectedQty;
                  const action = actionFor(v.status);
                  const reviewable = isReviewable(v.issueType);

                  return (
                    <TableRow
                      key={v.id}
                      sx={{
                        height: ROW_HEIGHT,
                        backgroundColor:
                          index % 2 === 1
                            ? alpha(theme.palette.primary.main, 0.2)
                            : "inherit",
                      }}
                    >
                      {!isClosed && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={selectedIds.includes(v.id)}
                            disabled={pending || !reviewable}
                            onChange={() => toggleSelectOne(v.id)}
                            inputProps={{
                              "aria-label": `Select ${v.materialCode}`,
                            }}
                            sx={{ p: 0.5 }}
                          />
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {page * perPage + index + 1}
                      </TableCell>
                      <TableCell>{v.storageBin}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {v.materialCode}
                      </TableCell>
                      <TableCell align="right">{v.expectedQty}</TableCell>
                      <TableCell align="right">
                        {pending ? "-" : v.scannedQty}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: pending
                            ? "text.secondary"
                            : diff < 0
                              ? "error.main"
                              : diff > 0
                                ? "warning.main"
                                : "text.secondary",
                        }}
                      >
                        {pending ? "-" : diff > 0 ? `+${diff}` : diff}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {pending ? "-" : <IssueChip type={v.issueType} />}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {pending || !reviewable ? (
                          "-"
                        ) : (
                          <VarianceStatusChip status={v.status} />
                        )}
                      </TableCell>
                      <TableCell>
                        {v.scannedAt ? formatDateTime(v.scannedAt) : "-"}
                      </TableCell>
                      <TableCell>
                        {v.locationCompletedAt
                          ? formatDateTime(v.locationCompletedAt)
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {pending ? (
                          "-"
                        ) : !reviewable ? null : (
                          <Tooltip title={action.label}>
                            <IconButton
                              size="small"
                              aria-label={action.label}
                              onClick={() => setReviewId(v.id)}
                              sx={{
                                color: "text.primary",
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.35,
                                  ),
                                },
                              }}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        )}
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

      <BulkReviewDialog
        open={bulkOpen}
        variances={selectedVariances}
        saving={bulkSaving}
        onClose={() => setBulkOpen(false)}
        onSave={handleBulkSave}
      />

      <LocationVarianceDialog
        open={locationsOpen}
        locations={detail.locations}
        onClose={() => setLocationsOpen(false)}
      />

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
            py: 1.25,
            position: "relative",
          }}
        >
          CLOSE AUDIT
          <IconButton
            onClick={() => setConfirmClose(false)}
            size="small"
            aria-label="close"
            disabled={closing}
            sx={{ position: "absolute", right: 12 }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: "16px !important", pb: 2 }}>
          <Typography variant="body2">
            Close <strong>{detail.auditNo}</strong>? Once closed, its
            discrepancies can no longer be edited.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <CommonButton
              variant="contained"
              color="error"
              disabled={closing}
              onClick={handleClose}
            >
              {closing ? "CLOSING..." : "CLOSE AUDIT"}
            </CommonButton>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
