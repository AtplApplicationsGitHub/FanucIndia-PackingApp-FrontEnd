"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  alpha,
  Alert,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
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
  Gauge,
  ListChecks,
  Menu as MenuIcon,
  PencilLine,
  X,
} from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CommonButton from "@/common/components/CommonButton";
import BulkReviewDialog from "./BulkReviewDialog";
import DiscrepancyReviewDialog from "./DiscrepancyReviewDialog";
import LocationVarianceDialog from "./LocationVarianceDialog";
import ReconDetailStatCards from "./ReconDetailStatCards";
import ReconMetricCard from "./ReconMetricCard";
import { IssueChip, VarianceStatusChip } from "./ReconChips";
import { useDownloadBomReport } from "../../hooks/useDownloadBomReport";
import { useReconciliationDetail } from "../../hooks/useReconciliationDetail";
import { useReconciliationLines } from "../../hooks/useReconciliationLines";
import {
  CATEGORY_ALL,
  CATEGORY_ALL_EXCEPT_VALID,
  CATEGORY_DEFAULT,
  formatDateTime,
  isReviewable,
  toReviewable,
} from "../../utils/reconLabels";
import type { AuditRow, AuditType } from "../../types/audit";
import type { AuditLocationUpload } from "../../types/auditDetail";
import type {
  ReconAuditDetail,
  ReconCategoryFilter,
  ReconDecision,
  ReconLine,
  ReconSapAction,
  ReconVariance,
  ReconIssueType,
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
  partial: false,
  canReview: false,
  operatorId: 0,
  operatorName: "",
  fileName: "",
  createdAt: "",
  submittedAt: null,
  totalLocations: 0,
  uploadedLocations: 0,
  auditExpectedComponents: 0,
  expectedComponents: 0,
  scannedComponents: 0,
  matchedComponents: 0,
  accuracy: null,
  qtyAccuracy: null,
  totalVariances: 0,
  openVariances: 0,
  resolvedVariances: 0,
  locations: [],
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
  auditStatus: string;
  pendingRows?: AuditRow[];
  locationUploads?: AuditLocationUpload[] | null;
  headerCards?: ReactNode;
  onAuditStatusChange?: (status: string) => void;
  /** true = not downloaded yet / type has no reconciliation: no API call, values show "—" (In Progress loads the uploaded data) */
  pending?: boolean;
  /** Expected lines, known from the audit file even while pending */
  expectedLines?: number;
  onClosedAtChange?: (closedAt: string | null) => void;
  onClosedByNameChange?: (closedByName: string | null) => void;
};

export default function ReconciliationPanel({
  auditType,
  auditId,
  auditStatus,
  onAuditStatusChange,
  pending = false,
  expectedLines = 0,
  pendingRows = NO_ROWS,
  locationUploads = null,
  headerCards,
  onClosedAtChange,
  onClosedByNameChange,
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

  const pendingLines = useMemo<ReconLine[]>(
    () =>
      pendingRows.map((r) => ({
        id: r.excelRow,
        storageBin: r.storage,
        materialCode: r.materialCode,
        expectedQty: r.quantity,
        scannedQty: null,
        pending: true,
        issueType: null,
        status: null,
        decision: null,
        sapAction: null,
        remarks: "",
        scannedAt: null,
        locationCompletedAt: null,
        resolvedAt: null,
        resolvedByName: null,
      })),
    [pendingRows],
  );

  const detail = pending ? EMPTY_RECON_DETAIL : loadedDetail;
  const loading = pending ? false : loadingRaw;
  const error = pending ? "" : errorRaw;

  const [search, setSearch] = useState("");
  const [binFilter, setBinFilter] = useState("ALL");

  const getDefaultCategory = (
    type: AuditType,
    status: string,
  ): ReconCategoryFilter => {
    if (type !== "bom") {
      return CATEGORY_DEFAULT;
    }

    switch (status) {
      case "ASSIGNED":
      case "IN_PROGRESS":
      case "CLOSED":
        return CATEGORY_ALL;

      case "RECONCILIATION_PENDING":
      default:
        return CATEGORY_ALL_EXCEPT_VALID;
    }
  };

  const [issueFilter, setIssueFilter] = useState<ReconCategoryFilter>(() =>
    getDefaultCategory(auditType, auditStatus),
  );

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
  const [actionsAnchorEl, setActionsAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const { downloadReport, loading: downloading } = useDownloadBomReport();

  useEffect(() => {
    setIssueFilter(getDefaultCategory(auditType, auditStatus));
    setPage(0);
    setSelectedIds([]);
  }, [auditType, auditId, auditStatus]);

  const headCellSx = {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText,
    textTransform: "none",
  } as const;

  const {
    rows: serverRows,
    total: serverTotal,
    loading: linesLoading,
    error: linesError,
    reload: reloadLines,
  } = useReconciliationLines(
    auditType,
    !pending && Number.isFinite(auditId) ? auditId : null,
    {
      search,
      storageBin: binFilter,
      category: issueFilter,
      status: statusFilter,
      page,
      limit: perPage,
    },
  );

  const bins = useMemo(
    () =>
      pending
        ? Array.from(new Set(pendingLines.map((v) => v.storageBin)))
        : (detail?.locations ?? []).map((l) => l.storageBin),
    [pending, pendingLines, detail],
  );

  // Not downloaded yet: the audit file rows are filtered here (only search / bin apply - they have no category or status yet)
  const localRows = useMemo(() => {
    if (!pending) return [];
    if (issueFilter !== CATEGORY_ALL || statusFilter !== "ALL") return [];
    const q = search.trim().toLowerCase();
    return pendingLines.filter(
      (v) =>
        (binFilter === "ALL" || v.storageBin === binFilter) &&
        (!q ||
          v.storageBin.toLowerCase().includes(q) ||
          v.materialCode.toLowerCase().includes(q)),
    );
  }, [pending, pendingLines, search, binFilter, issueFilter, statusFilter]);

  const pageRows = useMemo(
    () =>
      pending
        ? localRows.slice(page * perPage, page * perPage + perPage)
        : serverRows,
    [pending, localRows, serverRows, page, perPage],
  );
  const totalRows = pending ? localRows.length : serverTotal;

  // Full-audit counts, independent of the current category, search, status and page.
  // The detail API already includes location-wise category totals; no extra API calls.
  const categoryCounts = useMemo(() => {
    const totals = (detail?.locations ?? []).reduce(
      (acc, location) => ({
        valid: acc.valid + location.valid,
        mismatch: acc.mismatch + location.mismatch,
        missing: acc.missing + location.missing,
        unexpected: acc.unexpected + location.unexpected,
      }),
      { valid: 0, mismatch: 0, missing: 0, unexpected: 0 },
    );
    const exceptValid = totals.mismatch + totals.missing + totals.unexpected;
    return {
      ...totals,
      exceptValid,
      // In Progress includes materials from locations not yet uploaded.
      all: pending
        ? expectedLines
        : (detail?.auditExpectedComponents ?? 0) + totals.unexpected,
      expected: pending ? expectedLines : (detail?.expectedComponents ?? 0),
      scanned: pending ? 0 : (detail?.scannedComponents ?? 0),
    };
  }, [detail, pending, expectedLines]);

  const categoryPills: {
    value: ReconCategoryFilter;
    label: string;
    count: number;
    color: "primary" | "info" | "error" | "warning" | "success" | "secondary";
  }[] = [
    {
      value: CATEGORY_ALL,
      label: "All",
      count: categoryCounts.all,
      color: "primary",
    },
    {
      value: CATEGORY_ALL_EXCEPT_VALID,
      label: "Except Valid",
      count: categoryCounts.exceptValid,
      color: "secondary",
    },
    {
      value: "QUANTITY_MISMATCH",
      label: "Mismatch",
      count: categoryCounts.mismatch,
      color: "info",
    },
    {
      value: "MISSING",
      label: "Missing",
      count: categoryCounts.missing,
      color: "error",
    },
    {
      value: "EXCESS",
      label: "Unexpected",
      count: categoryCounts.unexpected,
      color: "warning",
    },
    {
      value: "VALID",
      label: "Valid",
      count: categoryCounts.valid,
      color: "success",
    },
  ];

  const selectedVariances = useMemo(
    () =>
      pageRows
        .filter((v) => selectedIds.includes(v.id))
        .map(toReviewable)
        .filter((v): v is ReconVariance => v !== null),
    [pageRows, selectedIds],
  );

  useEffect(() => {
    setSelectedIds([]);
  }, [search, binFilter, issueFilter, statusFilter, page, perPage]);

  useEffect(() => {
    onClosedAtChange?.(detail?.closedAt ?? null);
    onClosedByNameChange?.(detail?.closedByName ?? null);
  }, [
    detail?.closedAt,
    detail?.closedByName,
    onClosedAtChange,
    onClosedByNameChange,
  ]);

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
  const locked = pending || (!isClosed && !detail.canReview);
  const reviewingLine = pageRows.find((v) => v.id === reviewId);
  const reviewing = reviewingLine ? toReviewable(reviewingLine) : null;

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
      void reloadLines();
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Failed to save reconciliation.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const pageIds = locked
    ? []
    : pageRows.filter((v) => isReviewable(v.issueType)).map((v) => v.id);
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
      void reloadLines();
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
      void reloadLines();
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

  const actionFor = (status: ReconVarianceStatus | null) => {
    if (isClosed) return { label: "View", icon: <Eye size={18} /> };
    if (status === "OPEN") {
      return { label: "Review", icon: <PencilLine size={18} /> };
    }
    return { label: "Edit", icon: <ClipboardCheck size={18} /> };
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Metrics */}
      {auditType === "bom" ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(6, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {headerCards}
          <ReconMetricCard
            title="Accuracy"
            value={
              detail.accuracy === null || pending
                ? "—"
                : `${detail.accuracy.toFixed(1)}%`
            }
            icon={<Gauge size={18} />}
            caption={
              detail.qtyAccuracy === null || pending
                ? undefined
                : `Qty ${detail.qtyAccuracy.toFixed(1)}%`
            }
            progress={pending ? 0 : (detail.accuracy ?? 0)}
            progressColor={
              detail.accuracy === null
                ? "primary"
                : detail.accuracy >= 98
                  ? "success"
                  : detail.accuracy >= 95
                    ? "warning"
                    : "error"
            }
          />
          <ReconMetricCard
            title="Resolved"
            value={
              pending
                ? "—"
                : `${detail.resolvedVariances} / ${detail.totalVariances}`
            }
            icon={<ListChecks size={18} />}
            progress={
              pending
                ? 0
                : detail.totalVariances
                  ? (detail.resolvedVariances / detail.totalVariances) * 100
                  : 100
            }
            progressColor="success"
            caption={pending ? undefined : `${detail.openVariances} open`}
          />
          <ReconMetricCard
            title="Location Wise Variance"
            value={
              pending
                ? `${locationUploads?.length ?? 0} Locations`
                : `${detail.locations.length} ${detail.locations.length === 1 ? "Location" : "Locations"}`
            }
            caption={
              pending
                ? "Upload pending"
                : detail.partial
                  ? `${detail.uploadedLocations} uploaded · ${locationsWithVariance} with variance`
                  : `${locationsWithVariance} with variance`
            }
            icon={<MapPinned size={18} />}
            onClick={() => setLocationsOpen(true)}
          />
        </Box>
      ) : (
        <ReconDetailStatCards
          expected={pending ? expectedLines : detail.expectedComponents}
          metrics={
            pending
              ? null
              : {
                  scanned: detail?.scannedComponents ?? 0,
                  matched: detail.matchedComponents,
                  totalVariances: detail.totalVariances,
                  openVariances: detail.openVariances,
                  accuracy: detail.accuracy,
                  qtyAccuracy: detail.qtyAccuracy,
                  partial: detail.partial,
                  auditExpected: detail.auditExpectedComponents,
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
                pending
                  ? undefined
                  : detail.partial
                    ? `${detail.uploadedLocations} uploaded · ${locationsWithVariance} with variance`
                    : `${locationsWithVariance} with variance`
              }
              icon={<MapPinned size={18} />}
              onClick={pending ? undefined : () => setLocationsOpen(true)}
            />
          }
        />
      )}

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
            flexWrap: auditType === "bom" ? "nowrap" : "wrap",
            gap: auditType === "bom" ? 1 : 1.5,
            width: "100%",
            minWidth: 0,
            px: 1.5,
            pt: 1.25,
            pb: 1.25,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: auditType === "bom" ? "nowrap" : "wrap",
              gap: auditType === "bom" ? 0.9 : 1,
              minWidth: 0,
              flex: 1,
            }}
          >
            <Box
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: auditType === "bom" ? 230 : { xs: "100%", sm: 230 },
                flex: auditType === "bom" ? "0 0 230px" : undefined,
                minWidth: auditType === "bom" ? 230 : undefined,
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
                sx={{ ml: 1, flex: 1, minWidth: 0, fontSize: "14px" }}
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

            <FormControl
              size="small"
              sx={
                auditType === "bom"
                  ? { flex: "0 0 115px", minWidth: 115 }
                  : { minWidth: 100 }
              }
            >
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

            {auditType === "bom" ? (
              <>
                <FormControl
                  size="small"
                  sx={{ flex: "0 0 135px", minWidth: 135 }}
                >
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
                <Box
                  role="group"
                  aria-label="Audit material counts and category filters"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    flex: "0 0 auto",
                    minWidth: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Expected (${categoryCounts.expected})`}
                    sx={{
                      height: 30,
                      fontWeight: 600,
                      fontSize: "clamp(11px, 0.86vw, 13px)",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Scanned (${categoryCounts.scanned})`}
                    sx={{
                      height: 30,
                      fontWeight: 600,
                      fontSize: "clamp(11px, 0.86vw, 13px)",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                  {categoryPills.map((item) => {
                    const selected = issueFilter === item.value;
                    return (
                      <Chip
                        key={item.value}
                        size="small"
                        label={`${item.label} (${item.count})`}
                        color={
                          item.value === CATEGORY_ALL ||
                          item.value === CATEGORY_ALL_EXCEPT_VALID
                            ? undefined
                            : item.color
                        }
                        variant={selected ? "filled" : "outlined"}
                        clickable
                        onClick={() => {
                          setIssueFilter(item.value);
                          setPage(0);
                        }}
                        aria-pressed={selected}
                        sx={{
                          height: 30,
                          fontWeight: selected ? 700 : 500,
                          fontSize: "clamp(11px, 0.86vw, 13px)",
                          "& .MuiChip-label": { px: 1 },
                          ...(item.value === CATEGORY_ALL && {
                            bgcolor: selected ? "#D4A017" : "transparent",
                            color: selected ? "#FFFFFF" : "#9A7100",
                            borderColor: "#D4A017",
                            "&:hover": {
                              bgcolor: selected ? "#BE8D12" : "#FFF3CD",
                            },
                          }),
                          ...(item.value === CATEGORY_ALL_EXCEPT_VALID && {
                            bgcolor: selected ? "#7B1FA2" : "transparent",
                            color: selected ? "#FFFFFF" : "#7B1FA2",
                            borderColor: "#7B1FA2",
                            "&:hover": {
                              bgcolor: selected ? "#6A1B9A" : "#F3E5F5",
                            },
                          }),
                        }}
                      />
                    );
                  })}
                </Box>
              </>
            ) : (
              <>
                <FormControl size="small" sx={{ minWidth: 190 }}>
                  <Select
                    value={issueFilter}
                    onChange={(e) => {
                      setIssueFilter(e.target.value as ReconCategoryFilter);
                      setPage(0);
                    }}
                    inputProps={{ "aria-label": "Category filter" }}
                  >
                    <MenuItem value={CATEGORY_ALL}>{"All Categories"}</MenuItem>
                    <MenuItem value={CATEGORY_ALL_EXCEPT_VALID}>
                      {"All Except Valid"}
                    </MenuItem>
                    {(
                      [
                        "QUANTITY_MISMATCH",
                        "MISSING",
                        "EXCESS",
                        "VALID",
                      ] as ReconIssueType[]
                    ).map((t) => (
                      <MenuItem key={t} value={t}>
                        {
                          {
                            QUANTITY_MISMATCH: "Mismatch",
                            MISSING: "Missing",
                            EXCESS: "Unexpected",
                            VALID: "Valid",
                          }[t]
                        }
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
              </>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: auditType === "bom" ? "nowrap" : "wrap",
              gap: 1,
              ml: "auto",
              flexShrink: 0,
            }}
          >
            <Tooltip title="Actions">
              <IconButton
                aria-label="Discrepancy actions"
                aria-controls={
                  actionsAnchorEl ? "discrepancy-actions-menu" : undefined
                }
                aria-haspopup="true"
                aria-expanded={Boolean(actionsAnchorEl)}
                onClick={(event) => setActionsAnchorEl(event.currentTarget)}
                sx={{ color: "text.primary" }}
              >
                <MenuIcon size={22} />
              </IconButton>
            </Tooltip>
            <Menu
              id="discrepancy-actions-menu"
              anchorEl={actionsAnchorEl}
              open={Boolean(actionsAnchorEl)}
              onClose={() => setActionsAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {!isClosed && (
                <MenuItem
                  disabled={locked || selectedVariances.length === 0}
                  onClick={() => {
                    setActionsAnchorEl(null);
                    setBulkOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <RateReviewOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  {selectedVariances.length > 0
                    ? `Review (${selectedVariances.length})`
                    : "Review"}
                </MenuItem>
              )}
              <MenuItem
                disabled={downloading || pending || detail.partial}
                onClick={() => {
                  setActionsAnchorEl(null);
                  void downloadReport(detail.id, detail.auditNo);
                }}
              >
                <ListItemIcon>
                  <FileDownloadOutlinedIcon fontSize="small" />
                </ListItemIcon>
                {downloading ? "Downloading..." : "Download Report"}
              </MenuItem>
              {!isClosed && (
                <Tooltip
                  title={
                    detail.canClose
                      ? ""
                      : "Close Audit is enabled once all discrepancies are resolved."
                  }
                  placement="left"
                >
                  <span>
                    <MenuItem
                      disabled={!detail.canClose}
                      onClick={() => {
                        setActionsAnchorEl(null);
                        setConfirmClose(true);
                      }}
                      sx={{ color: detail.canClose ? "error.main" : undefined }}
                    >
                      <ListItemIcon sx={{ color: "inherit" }}>
                        <LockOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      Close Audit
                    </MenuItem>
                  </span>
                </Tooltip>
              )}
            </Menu>
          </Box>
        </Box>

        <TableContainer
          sx={{ opacity: linesLoading ? 0.6 : 1, transition: "opacity .15s" }}
        >
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
                      disabled={pageIds.length === 0}
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
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length + (isClosed ? 0 : 1)}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {pending
                        ? "—"
                        : linesLoading
                          ? "Loading..."
                          : linesError || "No records found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((v, index) => {
                  const rowPending = v.pending || v.scannedQty === null;
                  const diff = (v.scannedQty ?? 0) - v.expectedQty;
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
                            disabled={locked || !reviewable}
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
                        {rowPending ? "-" : v.scannedQty}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: rowPending
                            ? "text.secondary"
                            : diff < 0
                              ? "error.main"
                              : diff > 0
                                ? "warning.main"
                                : "text.secondary",
                        }}
                      >
                        {rowPending ? "-" : diff > 0 ? `+${diff}` : diff}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {rowPending || !v.issueType ? (
                          "-"
                        ) : (
                          <IssueChip type={v.issueType} />
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {rowPending || !reviewable || !v.status ? (
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
                        {rowPending || (locked && !isClosed) ? (
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
          count={totalRows}
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
        locationUploads={locationUploads}
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
