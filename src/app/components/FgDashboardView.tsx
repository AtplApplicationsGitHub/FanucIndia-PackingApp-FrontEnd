"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Link as MuiLink,
  IconButton,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  alpha,
  InputBase,
  LinearProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogTitle,
  Divider,
  Tooltip,
  Dialog,
  DialogContent,
  CircularProgress,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Visibility, Download, AccessTime, Refresh } from "@mui/icons-material";
import { secureDownload, secureView } from "@/common/lib/secure-download";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { API, API_BASE_URL } from "@/common/lib/endpoints";
import { authFetch } from "@/common/lib/authFetch";
import { format } from "date-fns";
import Link from "next/link";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { formatDateTimeIST, formatDateIST } from "@/common/utils/dateTime";

// Defined Color Codes per requirements
const STATUS_COLORS = {
  toBeIssued: "#FF6B6B", // Vibrant coral red
  underIssue: "#3B82F6", // Professional blue
  issued: "#FFD93D", // Golden yellow
  underPacking: "#3B82F6", // Professional blue (Same as Under Issue)
  packed: "#6C5CE7", // Purple
  wipStorage: "#CA7373", // Fuzzy Wuzzy
  readyForDispatch: "#F08B51", // Big Foot Feet
  dispatched: "#00B894", // Emerald green
};

interface PaymentAttachment {
  id: number;
  fileName: string;
  saleOrderNumber: string;
  outboundDelivery: string;
  user?: {
    name: string;
  };
}

interface FgDashboardRow {
  id: number;
  deliveryDate: string;
  saleOrderNumber: string;
  outboundDelivery?: string;
  transferOrder: string;
  product: string;
  customerName: string;
  salesZone: string;
  payment: boolean;
  status: string;
  fgLocation: any;
  createdBy?: string;
  createdByEmail?: string;
  updatedDate?: string;
  assignedUserId?: number | null;
  isReadyForDispatch?: boolean;
  isWipStorage?: boolean;
  transporter?: string;
  vehicleNumber?: string;
  salesUser?: string;
  specialRemarks?: string;
  additionalRemarks?: string;
  attachments?: PaymentAttachment[];
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return formatDateIST(dateString);
  } catch {
    return "Invalid Date";
  }
};

type StepLabel =
  | "To be Issued"
  | "Under Issue"
  | "Issued"
  | "Under Packing"
  | "Packed"
  | "WIP Storage"
  | "Ready for Dispatch"
  | "Dispatched";

interface StepConfig {
  percent: number;
  next: string;
  color: string;
}

const PROGRESS_CONFIG: Record<StepLabel, StepConfig> = {
  "To be Issued": {
    percent: 0,
    next: "Under Issue",
    color: STATUS_COLORS.toBeIssued,
  },
  "Under Issue": {
    percent: 0,
    next: "Issued",
    color: STATUS_COLORS.underIssue,
  },
  Issued: {
    percent: 25,
    next: "Under Packing",
    color: STATUS_COLORS.issued,
  },
  "Under Packing": {
    percent: 25,
    next: "Packed",
    color: STATUS_COLORS.underPacking,
  },
  Packed: {
    percent: 50,
    next: "WIP Storage",
    color: STATUS_COLORS.packed,
  },
  "WIP Storage": {
    percent: 75,
    next: "Ready for Dispatch",
    color: STATUS_COLORS.wipStorage,
  },
  "Ready for Dispatch": {
    percent: 90,
    next: "Dispatched",
    color: STATUS_COLORS.readyForDispatch,
  },
  Dispatched: {
    percent: 100,
    next: "",
    color: STATUS_COLORS.dispatched,
  },
};

const STATUS_OPTIONS = ["None", "R105", "W105", "F105", "Dispatched"];
const AUTO_REFRESH_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "1 min", value: 1 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
];
const DEFAULT_AUTO_REFRESH_MINUTES = 5;
const AUTO_REFRESH_STORAGE_KEY = "fgDashboardAutoRefreshMinutes";
const LAST_REFRESH_STORAGE_KEY = "fgDashboardLastRefreshTime";
const getValidAutoRefreshMinutes = (value: number) =>
  AUTO_REFRESH_OPTIONS.some((option) => option.value === value)
    ? value
    : DEFAULT_AUTO_REFRESH_MINUTES;
const formatIstTime = (date?: Date | null) =>
  date
    ? date.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "--";
const formatAutoRefreshLabel = (minutes: number) =>
  minutes > 0 ? `Auto refresh every ${minutes} min` : "Auto refresh off";

export default function FgDashboardView() {
  const theme = useTheme();
  const [rows, setRows] = useState<FgDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [autoRefreshMinutes, setAutoRefreshMinutes] = useState(
    DEFAULT_AUTO_REFRESH_MINUTES,
  );
  const [autoRefreshDialogOpen, setAutoRefreshDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [paymentFilter, setPaymentFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hideDispatched, setHideDispatched] = useState(true);
  const [remarksPopup, setRemarksPopup] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const [salesZones, setSalesZones] = useState<{ id: number; name: string }[]>(
    [],
  );

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAttachments, setPaymentAttachments] = useState<
    PaymentAttachment[]
  >([]);
  const [paymentAttachmentsLoading, setPaymentAttachmentsLoading] =
    useState(false);

  const isViewable = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["pdf", "jpg", "jpeg", "png", "txt", "gif", "webp"].includes(
      ext || "",
    );
  };

  const handleOpenPaymentAttachments = (attachments?: PaymentAttachment[]) => {
    setPaymentAttachmentsLoading(true);
    setPaymentDialogOpen(true);
    setPaymentAttachments(attachments || []);
    setPaymentAttachmentsLoading(false);
  };

  const handlePaymentAttachmentAction = async (
    fileId: number,
    fileName: string,
    action: "view" | "download",
  ) => {
    try {
      const res = await authFetch(API.SALES.ATTACHMENT_DOWNLOAD(fileId));

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();

      if (action === "view" && isViewable(fileName)) {
        secureView(blob);
      } else {
        secureDownload(blob, fileName);
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to open attachment",
        severity: "error",
      });
    }
  };

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleClear = () => {
    setSearch("");
    setLocalSearch("");
    setPaymentFilter("");
    setZoneFilter("");
    setStatusFilter("");
    setHideDispatched(true);
    setDate(null);
    setPage(0);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/lookup/sales-zones`);
        if (res.ok) {
          const data = await res.json();
          setSalesZones(data);
        }
      } catch (e) {
        console.error("Failed to fetch sales zones", e);
      }
    };
    fetchZones();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append("search", search);
      }
      if (date) {
        params.append("date", dayjs(date).format("YYYY-MM-DD"));
      }
      if (paymentFilter) params.append("payment", paymentFilter);
      if (zoneFilter) params.append("zone", zoneFilter);
      if (statusFilter) params.append("status", statusFilter);
      params.append("hideDispatched", String(hideDispatched));

      params.append("page", (page + 1).toString());
      params.append("limit", rowsPerPage.toString());

      const res = await authFetch(`${API.FG_DASHBOARD}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const { data, totalCount } = await res.json();
      setRows(data);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error fetching FG Dashboard data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    search,
    date,
    paymentFilter,
    zoneFilter,
    statusFilter,
    hideDispatched,
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const storedAutoRefreshMinutes = window.localStorage.getItem(
      AUTO_REFRESH_STORAGE_KEY,
    );

    if (storedAutoRefreshMinutes !== null) {
      setAutoRefreshMinutes(
        getValidAutoRefreshMinutes(Number(storedAutoRefreshMinutes)),
      );
    }

    const storedLastRefreshTime = window.localStorage.getItem(
      LAST_REFRESH_STORAGE_KEY,
    );
    if (storedLastRefreshTime) {
      const parsedLastRefreshTime = new Date(storedLastRefreshTime);
      if (!Number.isNaN(parsedLastRefreshTime.getTime())) {
        setLastRefreshTime(parsedLastRefreshTime);
      }
    }
  }, []);

  useEffect(() => {
    if (hideDispatched && statusFilter === "Dispatched") {
      setStatusFilter("");
      setPage(0);
    }
  }, [hideDispatched, statusFilter]);

  useEffect(() => {
    setCurrentTime(new Date());

    const clockTimer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (autoRefreshMinutes <= 0) return;

    const refreshTimer = window.setInterval(
      () => {
        void fetchData().then(() => {
          const refreshedAt = new Date();
          setLastRefreshTime(refreshedAt);
          window.localStorage.setItem(
            LAST_REFRESH_STORAGE_KEY,
            refreshedAt.toISOString(),
          );
        });
      },
      autoRefreshMinutes * 60 * 1000,
    );

    return () => window.clearInterval(refreshTimer);
  }, [autoRefreshMinutes, fetchData]);

  const getStatusInfo = (row: FgDashboardRow) => {
    const s = (row.status || "").toUpperCase();
    const { assignedUserId, fgLocation, isReadyForDispatch, isWipStorage } =
      row;

    let step: StepLabel;

    const hasFgLocation =
      fgLocation &&
      ((typeof fgLocation === "string" && fgLocation.trim() !== "") ||
        (Array.isArray(fgLocation) && fgLocation.length > 0) ||
        (typeof fgLocation === "object" &&
          !Array.isArray(fgLocation) &&
          Object.keys(fgLocation).length > 0));

    if (s === "DISPATCHED") {
      step = "Dispatched";
    } else if (isReadyForDispatch || s.includes("READY FOR DISPATCH")) {
      step = "Ready for Dispatch";
    } else if (hasFgLocation || isWipStorage) {
      step = "WIP Storage";
    } else if (s.includes("F105")) {
      step = "Packed";
    } else if (s.includes("W105")) {
      if (assignedUserId) {
        step = "Under Packing";
      } else {
        step = "Issued";
      }
    } else if (s.includes("R105")) {
      step = "Under Issue";
    } else {
      step = "To be Issued";
    }

    const cfg = PROGRESS_CONFIG[step];

    return {
      percent: cfg.percent,
      current: step,
      next: cfg.next,
      color: cfg.color,
    };
  };

  const statusOptions = hideDispatched
    ? STATUS_OPTIONS.filter((status) => status !== "Dispatched")
    : STATUS_OPTIONS;

  const tableRows = rows;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    { id: "saleOrderNumber", label: "SO", width: 90 },
    { id: "outboundDelivery", label: "OBD", width: 90 },
    { id: "customerName", label: "CUSTOMER NAME", width: 180 },
    { id: "salesZone", label: "SALES ZONE", width: 90 },
    { id: "deliveryDate", label: "REQUIRED DATE", width: 120 },
    { id: "progress", label: "STAGE STATUS ", width: 250 },
    { id: "payment", label: "PAY", width: 60 },
    { id: "transporter", label: "TRANSPORTER", width: 110 },
    { id: "vehicleNumber", label: "VEHICLE NUMBER", width: 120 },
    { id: "fgLocation", label: "FG LOCATION", width: 120 },
    { id: "specialRemarks", label: "REMARKS", width: 150 },
    { id: "salesUser", label: "SALES USER", width: 110 },
  ];
  const lightYellow = alpha(theme.palette.primary.main, 0.15);
  const headerBgColor = theme.palette.mode === "dark" ? "#000000" : "#FFFFFF";
  const headerTextColor = theme.palette.mode === "dark" ? "#FFFFFF" : "#000000";
  const dispatchInfoPillSx = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    px: 1.25,
    py: 0.25,
    color: "green",
    fontSize: "0.9rem",
    fontWeight: 700,
    lineHeight: 1.4,
    whiteSpace: "nowrap",
  };
  const renderDispatchInfoPill = (value?: string | null) =>
    value ? (
      <Box component="span" sx={dispatchInfoPillSx}>
        {value}
      </Box>
    ) : (
      "-"
    );
  const filterFieldSx = {
    bgcolor: "background.paper",
    flexShrink: 0,
    "& .MuiInputBase-root": {
      height: 40,
      borderRadius: 1,
      fontSize: "14px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
        borderWidth: 1,
      },
    },
  };
  const toolbarIconButtonSx = {
    width: 38,
    height: 38,
    borderRadius: 1,
    color: "text.secondary",
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    },
  };

  const handleExport = async () => {
    try {
      setSnackbar({
        open: true,
        message: "Generating Excel file...",
        severity: "success", // Using success to look like info
      });

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (date) params.append("date", dayjs(date).format("YYYY-MM-DD"));
      if (paymentFilter) params.append("payment", paymentFilter);
      if (zoneFilter) params.append("zone", zoneFilter);
      if (statusFilter) params.append("status", statusFilter);
      params.append("hideDispatched", String(hideDispatched));

      // Construct export URL
      const exportUrl = `${API.FG_DASHBOARD}/export?${params.toString()}`;

      // Use authFetch to get the file blob
      const res = await authFetch(exportUrl);

      if (!res.ok) throw new Error("Export failed");

      // Process the download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `FG_Dashboard_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "Excel export successful",
        severity: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: "Failed to export data",
        severity: "error",
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", p: { xs: 1, sm: 2 }, boxSizing: "border-box" }}>
        <Box
          sx={{
            width: "100%",
            mt: 0,
            px: 1,
            pb: 0,
            mb: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Main Floating Toolbar */}
          <Paper
            elevation={2}
            sx={{
              mb: 0,
              borderRadius: 2,
              bgcolor: "background.paper",
              width: "100%",
              display: "flex",
              alignItems: "center",
              flexWrap: { xs: "wrap", sm: "nowrap" },
              overflowX: { xs: "visible", sm: "auto" },
              gap: 1,
              px: 2,
              py: 1.5,
              mx: "auto",
            }}
          >
            <Tooltip
              title={
                hideDispatched
                  ? "Dispatched Orders are hidden"
                  : "Dispatched Orders are visible"
              }
            >
              <FormControlLabel
                label=""
                sx={{
                  width: 30,
                  height: 30,
                  m: 0,
                  p: 0,
                  justifyContent: "center",
                  borderRadius: 1,
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                  },
                }}
                control={
                  <Radio
                    size="small"
                    checked={hideDispatched}
                    onClick={() => {
                      setHideDispatched((prev) => !prev);
                      setPage(0);
                    }}
                    sx={{
                      p: 0.5,
                      color: "warning.main",
                      "&.Mui-checked": {
                        color: "warning.main",
                      },
                    }}
                  />
                }
              />
            </Tooltip>
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                setSearch(localSearch.trim().replace(/\s+/g, " "));
                setPage(0);
              }}
              sx={{
                p: "1px 2px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 220 },
                flexShrink: 0, 
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
                inputProps={{ "aria-label": "search" }}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              {localSearch && (
                <IconButton
                  sx={{ p: "5px" }}
                  aria-label="clear"
                  onClick={() => {
                    setLocalSearch("");
                    setSearch("");
                    setPage(0);
                  }}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            {/* Payment Filter */}
            <FormControl
              size="small"
              sx={{ ...filterFieldSx, minWidth: { xs: "100%", sm: 128 } }}
            >
              <Select
                value={paymentFilter}
                displayEmpty
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">PAYMENT</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
            {/* Zone Filter */}
            <FormControl
              size="small"
              sx={{ ...filterFieldSx, minWidth: { xs: "100%", sm: 150 } }}
            >
              <Select
                value={zoneFilter}
                displayEmpty
                onChange={(e) => {
                  setZoneFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">SALES ZONE</MenuItem>
                {salesZones.map((zone) => (
                  <MenuItem key={zone.id} value={String(zone.id)}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Status Filter */}
            <FormControl
              size="small"
              sx={{ ...filterFieldSx, minWidth: { xs: "100%", sm: 142 } }}
            >
              <Select
                value={statusFilter}
                displayEmpty
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">STATUS</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DatePicker
              label="DATE"
              value={date ? dayjs(date) : null}
              onChange={(newValue) => {
                setDate(newValue ? newValue.toDate() : null);
                setPage(0);
              }}
              format="DD-MM-YYYY"
              minDate={dayjs().subtract(3, "day")}
              slotProps={{
                field: {
                  clearable: false,
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    ...filterFieldSx,
                    width: { xs: "100%", sm: 190 },
                    minWidth: { xs: "100%", sm: 190 },
                  },
                },
              }}
            />
            {/* Clear Button (Icon Only) */}
            <Tooltip title="Clear Filters">
              <IconButton
                onClick={handleClear}
                sx={{
                  ...toolbarIconButtonSx,
                  "&:hover": {
                    ...toolbarIconButtonSx["&:hover"],
                    color: "error.main",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* 3. ADD THIS: Export Button next to the Clear button */}
            <Tooltip title="Export to Excel">
              <IconButton
                onClick={handleExport}
                sx={{
                  ...toolbarIconButtonSx,
                  color: "success.main",
                  "&:hover": {
                    ...toolbarIconButtonSx["&:hover"],
                    color: "success.dark",
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  },
                }}
              >
                <FileDownloadOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 0,
                display: { xs: "none", lg: "block" },
              }}
            />
            <Box
              component="button"
              type="button"
              onClick={() => setAutoRefreshDialogOpen(true)}
              sx={{
                ml: 0,
                mt: { xs: 1, sm: 0 },
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", sm: "flex-end" },
                width: { xs: "100%", sm: "auto" },
                flexShrink: 0,
                flexWrap: "nowrap",
                gap: 0.5,
                px: 1,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.16),
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: "inherit",
                cursor: "pointer",
                font: "inherit",
                overflow: "hidden",
                textAlign: "left",
                "&:hover": {
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  borderColor: alpha(theme.palette.warning.main, 0.45),
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AccessTime sx={{ fontSize: 18, color: "warning.main" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatIstTime(currentTime)} IST
                </Typography>
              </Box>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" } }}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Refresh sx={{ fontSize: 18, color: "success.main" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatAutoRefreshLabel(autoRefreshMinutes)}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Last: {formatIstTime(lastRefreshTime)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
          <TableContainer>
            <Table
              size="small"
              stickyHeader
              sx={{
                "& .MuiTableCell-root": {
                  fontSize: { xs: "0.8rem", xl: "1.05rem" },
                  py: { xs: 0, xl: 1 },
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ height: 50 }}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{
                        backgroundColor: headerBgColor,
                        color: headerTextColor,
                        fontWeight: 700,
                        width: col.width,
                        whiteSpace: "nowrap",
                        px: 1, // Reduced padding
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{ py: 3 }}
                    >
                      <Box sx={{ color: "text.secondary" }}>
                        No records found.
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows.map((row, index) => {
                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          backgroundColor:
                            index % 2 === 0 ? "inherit" : lightYellow,
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        {/* SO NUMBER */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1, py: 0 }}>
                          <MuiLink
                            component={Link}
                            href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? "/" + row.outboundDelivery : ""}`}
                            underline="hover"
                            sx={{ fontWeight: 500 }}
                          >
                            {row.saleOrderNumber}
                          </MuiLink>
                        </TableCell>

                        {/* OBD */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.outboundDelivery || "-"}
                        </TableCell>

                        {/* CUSTOMER NAME */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.customerName}
                        </TableCell>

                        {/* SALES ZONE */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.salesZone}
                        </TableCell>

                        {/* REQUIRED DATE */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {formatDate(row.deliveryDate)}
                        </TableCell>

                        {/* STAGE STATUS (progress) */}
                        <TableCell sx={{ px: 1, py: 0 }}>
                          {(() => {
                            const { percent, current, next, color } =
                              getStatusInfo(row);
                            return (
                              <Box
                                sx={{ width: "100%", minWidth: 220, py: 0.25 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                    mb: 0,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color="text.primary"
                                    sx={{
                                      fontSize: "0.75rem",
                                      whiteSpace: "nowrap",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {current}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Box sx={{ flexGrow: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={percent}
                                      sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: alpha(color, 0.15),
                                        "& .MuiLinearProgress-bar": {
                                          backgroundColor: color,
                                          borderRadius: 4,
                                          boxShadow: `0 0 8px ${alpha(color, 0.4)}`,
                                        },
                                      }}
                                    />
                                  </Box>
                                  <Box
                                    sx={{
                                      backgroundColor: alpha(color, 0.1),
                                      color: color,
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: "12px",
                                      fontWeight: 500,
                                      fontSize: "0.75rem",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      border: `1px solid ${alpha(color, 0.2)}`,
                                    }}
                                  >
                                    {percent}%
                                  </Box>
                                </Box>
                                {next && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.primary",
                                      fontSize: "0.75rem",
                                      whiteSpace: "nowrap",
                                      fontWeight: 500,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {next}
                                  </Typography>
                                )}
                                {row.updatedDate && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: "0.7rem",
                                      whiteSpace: "nowrap",
                                      lineHeight: 1,
                                      ml: 1,
                                    }}
                                  >
                                    {" "}
                                    {formatDateTimeIST(row.updatedDate)}
                                  </Typography>
                                )}
                              </Box>
                            );
                          })()}
                        </TableCell>

                        {/* PAYMENT */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {Array.isArray(row.attachments) &&
                          row.attachments.length > 0 ? (
                            <MuiLink
                              component="button"
                              variant="body2"
                              underline="hover"
                              onClick={() =>
                                handleOpenPaymentAttachments(row.attachments)
                              }
                              sx={{ fontWeight: 600, cursor: "pointer" }}
                            >
                              {row.payment ? "Yes" : "No"}
                            </MuiLink>
                          ) : (
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ fontWeight: 600 }}
                            >
                              {row.payment ? "Yes" : "No"}
                            </Typography>
                          )}
                        </TableCell>

                        {/* TRANSPORTER */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {renderDispatchInfoPill(row.transporter)}
                        </TableCell>

                        {/* VEHICLE NUMBER */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {renderDispatchInfoPill(row.vehicleNumber)}
                        </TableCell>

                        {/* FG LOCATION */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.fgLocation
                            ? typeof row.fgLocation === "string"
                              ? row.fgLocation
                              : Array.isArray(row.fgLocation)
                                ? row.fgLocation.join(", ")
                                : JSON.stringify(row.fgLocation)
                            : "-"}
                        </TableCell>
                        {/* REMARKS */}
                        <TableCell sx={{ px: 1, maxWidth: 200 }}>
                          {(() => {
                            const special = row.specialRemarks || "";
                            const additional = row.additionalRemarks || "";

                            if (!special && !additional) return "-";

                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 0.25,
                                }}
                              >
                                {special &&
                                  (special.length > 20 ? (
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: 150,
                                        cursor: "pointer",
                                        color: "#3B82F6",
                                      }}
                                      onClick={() =>
                                        setRemarksPopup({
                                          title: "Special Remark",
                                          content: special,
                                        })
                                      }
                                    >
                                      {special}
                                    </Typography>
                                  ) : (
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                        color: "#3B82F6",
                                      }}
                                    >
                                      {special}
                                    </Typography>
                                  ))}
                                {additional &&
                                  (additional.length > 20 ? (
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: 150,
                                        cursor: "pointer",
                                        color: "#00B894",
                                      }}
                                      onClick={() =>
                                        setRemarksPopup({
                                          title: "Additional Remark",
                                          content: additional,
                                        })
                                      }
                                    >
                                      {additional}
                                    </Typography>
                                  ) : (
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                        color: "#00B894",
                                      }}
                                    >
                                      {additional}
                                    </Typography>
                                  ))}
                              </Box>
                            );
                          })()}
                        </TableCell>
                        {/* SALES USER */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.createdByEmail || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {snackbar && (
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar(null)}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        )}
        {/* Remarks Popup */}
        {remarksPopup && (
          <Box
            onClick={() => setRemarksPopup(null)}
            sx={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 1300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Paper
              onClick={(e) => e.stopPropagation()}
              sx={{
                minWidth: 340,
                maxWidth: 480,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 6,
              }}
            >
              {/* <Box
                sx={{
                  backgroundColor: "background.paper",
                  px: 3,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              > */}
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
                  textTransform: "uppercase",
                }}
              >
                {remarksPopup.title}
                <IconButton
                  size="small"
                  onClick={() => setRemarksPopup(null)}
                  sx={{ position: "absolute", right: 12 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </DialogTitle>
              <Divider />
              {/* </Box> */}
              <Box sx={{ px: 3, py: 3, backgroundColor: "background.paper" }}>
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    backgroundColor: "action.hover",
                  }}
                >
                  <Typography
                    fontSize="0.9rem"
                    color="text.primary"
                    sx={{
                      wordBreak: "break-word", // <--- ADD THIS
                      overflowWrap: "break-word", // <--- ADD THIS
                      whiteSpace: "pre-wrap", // <--- ADD THIS
                    }}
                  >
                    {remarksPopup.content}
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          </Box>
        )}

        <Dialog
          open={autoRefreshDialogOpen}
          onClose={() => setAutoRefreshDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              textAlign: "center",
              position: "relative",
            }}
          >
            AUTO REFRESH
            <IconButton
              size="small"
              onClick={() => setAutoRefreshDialogOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="auto-refresh-select-label">
                  Refresh time
                </InputLabel>
                <Select
                  labelId="auto-refresh-select-label"
                  label="Refresh time"
                  value={autoRefreshMinutes}
                  onChange={(event) => {
                    const minutes = getValidAutoRefreshMinutes(
                      Number(event.target.value),
                    );
                    setAutoRefreshMinutes(minutes);
                    window.localStorage.setItem(
                      AUTO_REFRESH_STORAGE_KEY,
                      String(minutes),
                    );
                  }}
                >
                  {AUTO_REFRESH_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              color: "secondary.main",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            PAYMENT ATTACHMENTS
            <IconButton
              onClick={() => setPaymentDialogOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <TableContainer component={Paper}>
              <Table
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
                <TableHead sx={{ bgcolor: "primary.main" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "primary.contrastText",
                        fontWeight: "bold",
                      }}
                    >
                      SO Number
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "primary.contrastText",
                        fontWeight: "bold",
                      }}
                    >
                      Outbound Delivery
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "primary.contrastText",
                        fontWeight: "bold",
                      }}
                    >
                      File Name
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        color: "primary.contrastText",
                        fontWeight: "bold",
                        width: "150px",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paymentAttachmentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Box display="flex" justifyContent="center" p={4}>
                          <CircularProgress />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : paymentAttachments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary" p={3}>
                          No attachments found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentAttachments.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.saleOrderNumber}</TableCell>
                        <TableCell>{file.outboundDelivery}</TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {file.fileName}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handlePaymentAttachmentAction(
                                  file.id,
                                  file.fileName,
                                  "view",
                                )
                              }
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handlePaymentAttachmentAction(
                                  file.id,
                                  file.fileName,
                                  "download",
                                )
                              }
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
