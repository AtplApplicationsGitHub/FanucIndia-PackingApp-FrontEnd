"use client";

import React, { useState, useMemo } from "react";
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
  const circleSize = 22;
  const nodeWidth = 44;
  const connectorWidth = 12;
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
                <CheckIcon sx={{ fontSize: 12 }} />
              </Box>
              <Box sx={{ mt: 0.5, textAlign: "center", lineHeight: 1.2 }}>
                <Typography
                  sx={{
                    color: labelColor,
                    fontSize: "7.5px",
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
type GroupedRows = { customerName: string; rows: ReportRow[] }[];

function groupRowsByCustomer(rows: ReportRow[]): GroupedRows {
  const map = new Map<string, ReportRow[]>();
  for (const row of rows) {
    const key = row.customerNameText;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return Array.from(map.entries()).map(([customerName, rows]) => ({
    customerName,
    rows,
  }));
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
  const [pageSize, setPageSize] = useState(10);

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
            // The 7 separate columns for Status Timeline
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

  // Column Names
  const COLUMNS = [
    { id: "so", label: "SALE ORDER NUMBER", width: 160 },
    { id: "obd", label: "OUT BOUND DELIVERY", width: 170 },
    { id: "customer", label: "CUSTOMER NAME", width: 160 },
    { id: "zone", label: "SALES ZONE", width: 100 },
    { id: "payment", label: "PAYMENT", width: 90 },
    { id: "stages", label: "STATUS TIMELINE", width: 380 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* TOOLBAR */}
        <Box
          sx={{
            width: "100%",
            mt: 1,
            px: { xs: 1, sm: 2 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={2}
            sx={{
              maxWidth: 1200,
              borderRadius: 2,
              bgcolor: "background.paper",
              width: "fit-content", 
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: { xs: "stretch", lg: "center" },
              gap: 2,
              px: { xs: 1.5, sm: 2 },
              py: 1.5,
            }}
          >
            {/* Filters */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                alignItems: "center",
                flex: 1,
                justifyContent: "flex-start",
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
                  width: { xs: "100%", sm: 180 },
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
                sx={{
                  minWidth: 100,
                  bgcolor: "background.paper",
                  flexShrink: 0,
                }}
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
                sx={{
                  minWidth: 100,
                  bgcolor: "background.paper",
                  flexShrink: 0,
                }}
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
                sx={{
                  minWidth: 100,
                  bgcolor: "background.paper",
                  flexShrink: 0,
                }}
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
                sx={{
                  minWidth: 120,
                  bgcolor: "background.paper",
                  flexShrink: 0,
                }}
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
                      minWidth: 160,
                      flexShrink: 0,
                      bgcolor: "background.paper",
                      "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
                    },
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexShrink: 0,
                }}
              >
                {/* Clear all */}
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

                {/* Export to Excel Button */}
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
            </Box>
          </Paper>
        </Box>

        {/* TABLE */}
        <Box sx={{ mt: 2, px: 2 }}>
          {error && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 2, overflowX: "auto" }}
          >
            <Table
              sx={{
                minWidth: 980,
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
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "#000000" : "#ffffff",
                }}
              >
                <TableRow sx={{ height: 52 }}>
                  {COLUMNS.map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{
                        width: col.width,
                        minWidth: col.width,
                        color: (theme) =>
                          theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                        ...(col.id === "stages" && {
                          fontSize: "0.7rem",
                        }),
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {groupedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
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
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedRows.map((group) => {
                    return (
                      <React.Fragment key={group.customerName}>
                        {/* GROUP HEADER ROW */}
                        <TableRow
                          sx={{
                            bgcolor: lightYellow,
                            "&:hover": { bgcolor: lightYellow },
                          }}
                        >
                          <TableCell
                            colSpan={6}
                            sx={{ py: 1, borderBottom: "1px solid #E0E0E0" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
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
                                {group.customerName} ({group.rows.length} order
                                {group.rows.length !== 1 ? "s" : ""})
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                        {group.rows.map((row) => (
                          <TableRow
                            key={row.rowIndex}
                            sx={{
                              backgroundColor: "background.paper",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.2,
                                ),
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
                                color: isDark
                                  ? "rgba(255,255,255,0.65)"
                                  : "text.secondary",
                                fontWeight: 500,
                              }}
                            >
                              {row.outboundDelivery}
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 500, fontSize: "0.8rem" }}
                            >
                              {row.customerNameText}
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 500, fontSize: "0.8rem" }}
                            >
                              {row.salesZone}
                            </TableCell>
                            <TableCell>
                              {row.paymentClearance ? (
                                <Box
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "3px 10px",
                                    borderRadius: "16px",
                                    border: "1px solid",
                                    borderColor: alpha(
                                      theme.palette.success.main,
                                      0.5,
                                    ),
                                    backgroundColor: alpha(
                                      theme.palette.success.main,
                                      0.1,
                                    ),
                                    color:
                                      theme.palette.mode === "dark"
                                        ? "#ffffff"
                                        : theme.palette.success.dark,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    minWidth: "50px",
                                  }}
                                >
                                  Yes
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "3px 10px",
                                    borderRadius: "16px",
                                    border: "1px solid",
                                    borderColor: alpha(
                                      theme.palette.error.main,
                                      0.5,
                                    ),
                                    backgroundColor: alpha(
                                      theme.palette.error.main,
                                      0.1,
                                    ),
                                    color:
                                      theme.palette.mode === "dark"
                                        ? "#ffffff"
                                        : theme.palette.error.main,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    minWidth: "50px",
                                  }}
                                >
                                  No
                                </Box>
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                py: 1.5,
                                overflow: "visible",
                                whiteSpace: "normal",
                              }}
                            >
                              <StageStepper stages={row.stages} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

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
            rowsPerPageOptions={[10, 20, 50, 100]}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
