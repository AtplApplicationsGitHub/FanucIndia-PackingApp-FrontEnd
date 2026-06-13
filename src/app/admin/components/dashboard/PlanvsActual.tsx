"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Download as DownloadIcon } from "lucide-react";
import { exportToExcel } from "@/app/admin/components/utils/exportExcel";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { Tooltip } from "@mui/material";
import {
  Box,
  IconButton,
  Paper,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import { TableChart } from "@mui/icons-material";
import { useReport, ReportRow } from "@/app/admin/components/hooks/useReport";
import type { Theme } from "@mui/material/styles";

type StageKey =
  | "erpImport"
  | "r105"
  | "w105"
  | "f105"
  | "storage"
  | "labelPrint"
  | "dispatched";

type StageDef = {
  key: StageKey;
  line1: string;
};

// STAGE DEFINITION
const STAGE_DEFS: StageDef[] = [
  { key: "erpImport", line1: "ERP" },
  { key: "r105", line1: "R105" },
  { key: "w105", line1: "W105" },
  { key: "f105", line1: "F105" },
  { key: "storage", line1: "Storage" },
  { key: "labelPrint", line1: "Label Print" },
  { key: "dispatched", line1: "Dispatched" },
];

//  STAGE STEPPER — all grey, green tick when done

function StageStepper({ stages }: { stages: Record<StageKey, boolean> }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const GREEN = "#22c55e";
  const pendingBorder = isDark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.18)";
  const pendingIcon = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.26)";
  const pendingText = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const pendingBg = isDark ? "rgba(255,255,255,0.05)" : "#f2f2ed";
  const pendingLine = isDark ? "rgba(255,255,255,0.14)" : "#d8d6c7";
  const circleSize = 20;
  const nodeWidth = 36;
  const connectorWidth = 10;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        width: "max-content",
        maxWidth: "100%",
        overflow: "visible",
      }}
    >
      {STAGE_DEFS.map((stage, idx) => {
        const isDone = stages[stage.key] === true;
        const isLast = idx === STAGE_DEFS.length - 1;

        const labelColor = isDone
          ? isDark
            ? "#ffffff"
            : "#111111"
          : pendingText;

        const nextStage = !isLast ? STAGE_DEFS[idx + 1] : null;
        const nextDone = nextStage ? stages[nextStage.key] : false;
        const lineColor =
          isDone && nextDone ? "#86efac" : isDone ? "#bbf7d0" : pendingLine;
        return (
          <Box
            key={stage.key}
            sx={{ display: "flex", alignItems: "flex-start" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: nodeWidth,
                minWidth: nodeWidth,
              }}
            >
              <Box
                aria-label={`${stage.line1} ${isDone ? "completed" : "pending"}`}
                sx={{
                  width: circleSize,
                  height: circleSize,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  bgcolor: isDone ? GREEN : pendingBg,
                  border: "2px solid",
                  borderColor: isDone ? GREEN : pendingBorder,
                  color: isDone ? "#ffffff" : pendingIcon,
                  boxShadow: isDone ? `0 0 0 2px ${GREEN}18` : "none",
                }}
              >
                <CheckIcon sx={{ fontSize: 11 }} />
              </Box>
              <Box sx={{ mt: 0.5, textAlign: "center", lineHeight: 1.2 }}>
                <Typography
                  sx={{
                    color: labelColor,
                    fontSize: "7px",
                    fontWeight: isDone ? 700 : 500,
                    lineHeight: 1.1,
                    maxWidth: nodeWidth,
                    overflow: "visible",
                    textAlign: "center",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  }}
                  title={stage.line1}
                >
                  {stage.line1}
                </Typography>
              </Box>
            </Box>

            {!isLast && (
              <Box
                sx={{
                  mt: `${circleSize / 2 - 1}px`,
                  width: connectorWidth,
                  height: 2,
                  borderRadius: 1,
                  flexShrink: 0,
                  bgcolor: lineColor,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
type GroupedRows = {
  customerName: string;
  salesZone: string;
  rows: ReportRow[];
}[];

function PaymentBadge({
  paid,
  theme,
  isDark,
}: {
  paid: boolean;
  theme: Theme;
  isDark: boolean;
}) {
  const palette = paid ? theme.palette.success : theme.palette.error;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: alpha(palette.main, 0.5),
        backgroundColor: alpha(palette.main, 0.1),
        color: isDark ? "#ffffff" : paid ? palette.dark : palette.main,
        fontSize: "0.75rem",
        fontWeight: 600,
        minWidth: "50px",
      }}
    >
      {paid ? "Yes" : "No"}
    </Box>
  );
}

function SectionTable({
  items,
  columns,
  theme,
  isDark,
  lightYellow,
  handleOpenRemarks,
}: {
  items: RenderItem[];
  columns: { id: string; label: string; width: number; headerPl?: number }[];
  theme: Theme;
  isDark: boolean;
  lightYellow: string;
  handleOpenRemarks: (special: string, additional: string) => void;
}) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 2, overflowX: "auto", flex: "1 1 0", minWidth: 0 }}
    >
      <Table
        sx={{
          minWidth: 580,
          tableLayout: "fixed",
          "& .MuiTableBody-root .MuiTableRow-root:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
          },
          "& .MuiTableCell-root": {
            borderBottom: "none",
            py: 0.5,
            px: 1,
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      >
        <TableHead
          sx={{
            bgcolor: (t) => (t.palette.mode === "dark" ? "#000000" : "#ffffff"),
          }}
        >
          <TableRow sx={{ height: 52 }}>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                sx={{
                  width: col.width,
                  minWidth: col.width,
                  color: (t) =>
                    t.palette.mode === "dark" ? "#ffffff" : "#000000",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  ...(col.id === "stages" && { fontSize: "0.7rem" }),
                  ...(col.headerPl !== undefined && { pl: col.headerPl }),
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => {
            if (item.type === "header") {
              return (
                <TableRow
                  key={item.key}
                  sx={{
                    bgcolor: lightYellow,
                    "&:hover": { bgcolor: lightYellow },
                  }}
                >
                  <TableCell
                    colSpan={columns.length}
                    sx={{ py: 1, borderBottom: "1px solid #E0E0E0" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TableChart
                        sx={{
                          color: isDark ? "#FFF" : "#D00000",
                          fontSize: 20,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: isDark ? "#FFF" : "#D00000",
                        }}
                      >
                        {item.customerName} - {item.salesZone}
                        {item.continued
                          ? " (contd.)"
                          : ` (${item.count} order${item.count !== 1 ? "s" : ""})`}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            }

            const row = item.row;
            return (
              <TableRow
                key={item.key}
                sx={{
                  backgroundColor: "background.paper",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <TableCell>
                  <MuiLink
                    component={Link}
                    href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? "/" + row.outboundDelivery : ""}`}
                    underline="hover"
                    sx={{ fontWeight: 500 }}
                  >
                    {row.saleOrderNumber}
                  </MuiLink>
                </TableCell>
                <TableCell
                  sx={{
                    color: isDark ? "rgba(255,255,255,0.65)" : "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {row.outboundDelivery}
                </TableCell>
                <TableCell>
                  <PaymentBadge
                    paid={row.paymentClearance}
                    theme={theme}
                    isDark={isDark}
                  />
                </TableCell>
                <TableCell
                  sx={{ whiteSpace: "normal", wordWrap: "break-word" }}
                >
                  {row.vehicleNumber}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    fontSize: "0.75rem",
                  }}
                >
                  {row.remarks &&
                  row.remarks.length > 15 &&
                  row.remarks !== "-" ? (
                    <span
                      onClick={() =>
                        handleOpenRemarks(
                          row.specialRemarks,
                          row.additionalRemarks,
                        )
                      }
                      style={{
                        color:
                          theme.palette.mode === "dark"
                            ? theme.palette.primary.main
                            : "#0000FF",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      {row.remarks.substring(0, 15)}...
                    </span>
                  ) : (
                    row.remarks
                  )}
                </TableCell>
                <TableCell
                  sx={{ py: 1.5, overflow: "visible", whiteSpace: "normal" }}
                >
                  <StageStepper stages={row.stages} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function groupRowsByCustomer(rows: ReportRow[]): GroupedRows {
  const map = new Map<
    string,
    { customerName: string; salesZone: string; rows: ReportRow[] }
  >();
  for (const row of rows) {
    const key = `${row.customerNameText}__${row.salesZone}`;
    if (!map.has(key)) {
      map.set(key, {
        customerName: row.customerNameText,
        salesZone: row.salesZone,
        rows: [],
      });
    }
    map.get(key)!.rows.push(row);
  }
  return Array.from(map.values());
}

type FlatRow = { customerName: string; salesZone: string; row: ReportRow };

function flattenGroups(groups: GroupedRows): FlatRow[] {
  const flat: FlatRow[] = [];
  for (const g of groups) {
    for (const row of g.rows) {
      flat.push({ customerName: g.customerName, salesZone: g.salesZone, row });
    }
  }
  return flat;
}

type RenderItem =
  | {
      type: "header";
      key: string;
      customerName: string;
      salesZone: string;
      count: number;
      continued: boolean;
    }
  | { type: "row"; key: string; row: ReportRow };

function buildColumnItems(
  flatRows: FlatRow[],
  prevGroupKey: string | null,
  groupCountMap: Map<string, number>,
): RenderItem[] {
  const items: RenderItem[] = [];
  let lastKey: string | null = null;
  for (const fr of flatRows) {
    const key = `${fr.customerName}__${fr.salesZone}`;
    if (key !== lastKey) {
      const continued = items.length === 0 && key === prevGroupKey;
      items.push({
        type: "header",
        key: `${key}__hdr__${items.length}`,
        customerName: fr.customerName,
        salesZone: fr.salesZone,
        count: groupCountMap.get(key) ?? 0,
        continued,
      });
      lastKey = key;
    }
    items.push({ type: "row", key: `row__${fr.row.rowIndex}`, row: fr.row });
  }
  return items;
}

export default function ReportPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [searchInput, setSearchInput] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [openRemarks, setOpenRemarks] = React.useState(false);
  const [currentRemarks, setCurrentRemarks] = React.useState({
    special: "",
    additional: "",
  });

  const handleOpenRemarks = (special: string, additional: string) => {
    setCurrentRemarks({ special: special || "", additional: additional || "" });
    setOpenRemarks(true);
  };

  const handleCloseRemarks = () => {
    setOpenRemarks(false);
    setCurrentRemarks({ special: "", additional: "" });
  };

  const { rows, loading, error, lookup, totalCount } = useReport({
    search: searchInput || undefined,
    payment: paymentFilter || undefined,
    salesZoneId: zoneFilter || undefined,
    customerId: customerFilter || undefined,
    date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined,
    status: statusFilter || undefined,
    page: currentPage,
    limit: pageSize,
  });
  const groupedRows = useMemo(() => groupRowsByCustomer(rows), [rows]);

  const AUTO_PAGE_INTERVAL_MS = 15000;

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (totalPages <= 1) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, AUTO_PAGE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [totalCount, pageSize]);

  function handleClear() {
    setSearchInput("");
    setPaymentFilter("");
    setZoneFilter("");
    setStatusFilter("");
    setCustomerFilter("");
    setStartDate(null);
    setCurrentPage(0);
  }

  // --- NEW EXPORT FUNCTION ---
  const handleExport = async () => {
    try {
      // 1. Construct the API URL to fetch ALL matching records (limit = 100000)
      const url = API.ADMIN.REPORT_ANALYSIS({
        search: searchInput || undefined,
        payment: paymentFilter || undefined,
        salesZoneId: zoneFilter || undefined,
        customerId: customerFilter || undefined,
        date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined,
        status: statusFilter || undefined,
        page: 1,
        limit: 100000,
      });

      const res = await fetchWithAuth(url);
      const data = await res.json();

      const allGrouped = data?.data?.groupedOrders || [];
      const exportData: any[] = [];

      // Helper for timeline status
      const hasCompletedStep = (statusStepper: any[], statuses: string[]) => {
        if (!Array.isArray(statusStepper)) return false;
        const wanted = new Set(statuses.map((s) => s.toLowerCase()));
        return statusStepper.some((step) => {
          const status = String(step.status ?? "").toLowerCase();
          return wanted.has(status) && Boolean(step.createdDateTime);
        });
      };

      // 2. Format the data for Excel
      allGrouped.forEach((group: any) => {
        (group.orders || []).forEach((order: any) => {
          const statusStepper = order.statusStepper;

          exportData.push({
            "SALE ORDER NUMBER": order.saleOrderNumber || "-",
            "OUTBOUND DELIVERY": order.outboundDelivery || "-",
            "CUSTOMER NAME": order.customerName || "-",
            "SALES ZONE": order.salesZone || "-",
            PAYMENT: order.paymentClearance ? "Yes" : "No",
            VEHICLE: order.vehicleNumber || "-",
            "SPECIAL REMARKS": order.specialRemarks || "-",
            "ADDITIONAL REMARKS": order.additionalRemarks || "-",
            ERP:
              order.isErpImported === true || order.isErpImported === 1
                ? "Yes"
                : "Skip",
            R105:
              order.priority !== null && order.priority !== undefined
                ? "Yes"
                : "Skip",
            W105: hasCompletedStep(statusStepper, ["Issued"]) ? "Yes" : "Skip",
            F105: hasCompletedStep(statusStepper, ["Packed"]) ? "Yes" : "Skip",
            Storage: hasCompletedStep(statusStepper, ["WIP Storage"])
              ? "Yes"
              : "Skip",
            "Label Print": hasCompletedStep(statusStepper, [
              "Ready for Dispatch",
            ])
              ? "Yes"
              : "Skip",
            Dispatched: hasCompletedStep(statusStepper, ["Dispatched"])
              ? "Yes"
              : "Skip",
          });
        });
      });

      // 3. Generate the Excel file
      await exportToExcel(
        exportData,
        `Status_Hub_Report_${dayjs().format("YYYY-MM-DD")}`,
      );
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const COLUMNS = [
    { id: "so", label: "SO", width: 85 },
    { id: "obd", label: "OBD", width: 85 },
    { id: "payment", label: "PAY", width: 50 },
    { id: "vehicle", label: "VEHICLE", width: 90 },
    { id: "remarks", label: "REMARKS", width: 100 },
    { id: "stages", label: "STATUS", width: 280, headerPl: 1 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ bgcolor: "background.default" }}>
        {/* TOOLBAR */}
        <Box
          sx={{
            width: "100%",
            mt: 1,
            px: { xs: 1, sm: 2 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={2}
            sx={{
              width: "fit-content",
              maxWidth: "100%",
              mx: "auto",
              borderRadius: 2,
              bgcolor: "background.paper",
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              overflowX: "auto",
              "&::-webkit-scrollbar": { height: 6 },
            }}
          >
            {/* Search */}
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => e.preventDefault()}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                width: 160,
                border: 1,
                borderColor: isDark ? "rgba(255,255,255,0.23)" : "#e0e0e0",
                borderRadius: "4px",
                height: 40,
                bgcolor: "background.paper",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: "14px" }}
                placeholder="Search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(0);
                }}
              />
              {searchInput && (
                <IconButton
                  sx={{ p: "5px" }}
                  onClick={() => setSearchInput("")}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton type="button" sx={{ p: "5px" }}>
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Payment */}
            <FormControl
              size="small"
              sx={{ minWidth: 90, flexShrink: 0, bgcolor: "background.paper" }}
            >
              <Select
                value={paymentFilter}
                displayEmpty
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPage(0);
                }}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">PAYMENT</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>

            {/* Zone */}
            <FormControl
              size="small"
              sx={{ minWidth: 110, flexShrink: 0, bgcolor: "background.paper" }}
            >
              <Select
                value={zoneFilter}
                displayEmpty
                onChange={(e) => {
                  setZoneFilter(e.target.value);
                  setCurrentPage(0);
                }}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">SALES ZONE</MenuItem>
                {lookup.salesZones.map((z) => (
                  <MenuItem key={z.id} value={String(z.id)}>
                    {z.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl
              size="small"
              sx={{ minWidth: 90, flexShrink: 0, bgcolor: "background.paper" }}
            >
              <Select
                value={statusFilter}
                displayEmpty
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">STATUS</MenuItem>
                {["R105", "W105", "F105", "Dispatched"].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Customer */}
            <FormControl
              size="small"
              sx={{ minWidth: 110, flexShrink: 0, bgcolor: "background.paper" }}
            >
              <Select
                value={customerFilter}
                displayEmpty
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setCurrentPage(0);
                }}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">CUSTOMER</MenuItem>
                {lookup.customers.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date */}
            <DatePicker
              label="DATE"
              value={startDate ? dayjs(startDate) : null}
              onChange={(val) => {
                setStartDate(val ? val.toDate() : null);
                setCurrentPage(0);
              }}
              format="DD-MM-YYYY"
              minDate={dayjs().subtract(3, "day")}
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: 155,
                    flexShrink: 0,
                    bgcolor: "background.paper",
                    "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
                  },
                },
              }}
            />

            {/* Clear + Export */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <IconButton
                onClick={handleClear}
                title="Clear Filters"
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "error.main" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <Tooltip title="Export to Excel" arrow>
                <IconButton
                  onClick={handleExport}
                  sx={{
                    color: "#10b981",
                    "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
                  }}
                >
                  <DownloadIcon size={20} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalCount}
              page={currentPage}
              onPageChange={(_, p) => setCurrentPage(p)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(0);
              }}
              rowsPerPageOptions={[20, 40, 60, 100]}
              sx={{
                flexShrink: 0,
                // ml: "auto",
                ".MuiTablePagination-toolbar": {
                  minHeight: 40,
                  paddingLeft: 0,
                  flexWrap: "nowrap",
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  {
                    fontSize: "0.75rem",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  },
                ".MuiTablePagination-select": {
                  fontSize: "0.75rem",
                },
              }}
            />
          </Paper>
        </Box>

        {/* TABLE */}
        <Box sx={{ mt: 2, px: 2 }}>
          {error && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {groupedRows.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <AssessmentOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: "text.disabled",
                  mb: 1,
                  display: "block",
                  mx: "auto",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                No report data found.
              </Typography>
            </Box>
          ) : (
            (() => {
              const flat = flattenGroups(groupedRows);
              const leftCapacity = Math.ceil(pageSize / 2);
              const splitAt = Math.min(leftCapacity, flat.length);
              const leftFlat = flat.slice(0, splitAt);
              const rightFlat = flat.slice(splitAt);

              const groupCountMap = new Map<string, number>();
              groupedRows.forEach((g) =>
                groupCountMap.set(
                  `${g.customerName}__${g.salesZone}`,
                  g.rows.length,
                ),
              );

              const leftItems = buildColumnItems(leftFlat, null, groupCountMap);
              const lastLeftKey = leftFlat.length
                ? `${leftFlat[leftFlat.length - 1].customerName}__${leftFlat[leftFlat.length - 1].salesZone}`
                : null;
              const rightItems = buildColumnItems(
                rightFlat,
                lastLeftKey,
                groupCountMap,
              );

              return (
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: { xs: "wrap", lg: "nowrap" },
                  }}
                >
                  <SectionTable
                    items={leftItems}
                    columns={COLUMNS}
                    theme={theme}
                    isDark={isDark}
                    lightYellow={lightYellow}
                    handleOpenRemarks={handleOpenRemarks}
                  />
                  <SectionTable
                    items={rightItems}
                    columns={COLUMNS}
                    theme={theme}
                    isDark={isDark}
                    lightYellow={lightYellow}
                    handleOpenRemarks={handleOpenRemarks}
                  />
                </Box>
              );
            })()
          )}
        </Box>
        {/* REMARKS DIALOG */}
        <Dialog
          open={openRemarks}
          onClose={handleCloseRemarks}
          maxWidth="sm"
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
              position: "relative",
            }}
          >
            REMARKS
            <IconButton
              aria-label="close"
              onClick={handleCloseRemarks}
              size="small"
              sx={{ position: "absolute", right: 12 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent
            sx={{
              pt: 3,
              pb: 4,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <TextField
              label="Special Remarks"
              value={currentRemarks.special || "-"}
              fullWidth
              multiline
              minRows={2}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Additional Remarks"
              value={currentRemarks.additional || "-"}
              fullWidth
              multiline
              minRows={2}
              InputProps={{ readOnly: true }}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
