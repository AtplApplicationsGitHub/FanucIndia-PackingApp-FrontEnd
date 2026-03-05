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
  Button,
} from "@mui/material";
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
import { X } from "lucide-react";

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

interface FgDashboardRow {
  id: number;
  deliveryDate: string;
  saleOrderNumber: string;
  transferOrder: string;
  product: string;
  customerName: string;
  salesZone: string;
  payment: boolean;
  status: string;
  fgLocation: any;
  specialRemarks: string;
  updatedBy?: string;
  updatedDate?: string;
  assignedUserId?: number | null;
  isReadyForDispatch?: boolean;
  isWipStorage?: boolean;
  transporter?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd-MMM-yyyy");
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

export default function FgDashboardView() {
  const theme = useTheme();
  const [rows, setRows] = useState<FgDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [paymentFilter, setPaymentFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [salesZones, setSalesZones] = useState<{ id: number; name: string }[]>(
    [],
  );

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleClear = () => {
    setSearch("");
    setPaymentFilter("");
    setZoneFilter("");
    setStatusFilter("");
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
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    { id: "saleOrderNumber", label: "SO NUMBER", width: 90 },
    { id: "customerName", label: "CUSTOMER NAME", width: 180 },
    { id: "payment", label: "PAYMENT", width: 60 },
    { id: "progress", label: "PROGRESS", width: 250 },
    { id: "status", label: "STATUS", width: 100 },
    { id: "salesZone", label: "SALES ZONE", width: 90 },
    { id: "transporter", label: "TRANSPORTER", width: 110 },
    { id: "fgLocation", label: "FG LOCATION", width: 120 },
    { id: "specialRemarks", label: "SPECIAL REMARKS", width: 150 },
    { id: "updatedBy", label: "UPDATED BY", width: 110 },
    { id: "updatedDate", label: "UPDATED DATE", width: 140 },
  ];

  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  const headerBgColor = theme.palette.mode === "dark" ? "#000000" : "#FFFFFF";
  const headerTextColor = theme.palette.mode === "dark" ? "#FFFFFF" : "#000000";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", p: { xs: 1, sm: 2 }, boxSizing: "border-box" }}>
        <Box
          sx={{
            width: "100%",
            mt: 1,
            px: 1,
            pb: 0,
            mb: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Main Floating Toolbar */}
          <Paper
            elevation={2}
            sx={{
              mb: 0,
              borderRadius: 2,
              bgcolor: "background.paper",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              px: 2,
              py: 1.5,
              mx: "auto",
            }}
          >
            {/* Search Field */}
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => e.preventDefault()}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 220 },
                border: 1,
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : '#e0e0e0',
                borderRadius: "4px",
                height: 40,
                bgcolor: "background.paper",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: "14px" }}
                placeholder="Search"
                inputProps={{ "aria-label": "search" }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
              {search && (
                <IconButton
                  sx={{ p: "5px" }}
                  aria-label="clear"
                  onClick={() => {
                    setSearch("");
                    setPage(0);
                  }}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton type="button" sx={{ p: "5px" }} aria-label="search">
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Payment Filter */}
            <FormControl
              size="small"
              sx={{ minWidth: 120, bgcolor: "background.paper" }}
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
              sx={{ minWidth: 140, bgcolor: "background.paper" }}
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
              sx={{ minWidth: 140, bgcolor: "background.paper" }}
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
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="DELIVERY DATE"
              value={date ? dayjs(date) : null}
              onChange={(newValue) => {
                setDate(newValue ? newValue.toDate() : null);
                setPage(0);
              }}
              format="DD-MM-YYYY"
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => setDate(null),
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    minWidth: 140,
                    bgcolor: "background.paper",
                    "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
                  },
                },
              }}
            />

            {/* Clear Button (Icon Only) */}
            <IconButton
              onClick={handleClear}
              title="Clear Filters"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  opacity: 0.8,
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>

        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ height: 60 }}>
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
                {rows.length === 0 && !loading ? (
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
                  rows.map((row, index) => {
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
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          <MuiLink
                            component={Link}
                            href={`/so-search/${row.saleOrderNumber}`}
                            underline="hover"
                            sx={{ fontWeight: 500 }}
                          >
                            {row.saleOrderNumber}
                          </MuiLink>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>{row.customerName}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 1.5,
                              py: 0.25,
                              borderRadius: "16px",
                              border: "1px solid",
                              borderColor: row.payment ? "#4caf50" : "#ef5350",
                              backgroundColor: row.payment ? "#e8f5e9" : "#ffebee",
                              color: row.payment ? "#1b5e20" : "#c62828",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              textAlign: "center",
                              minWidth: "50px",
                            }}
                          >
                            {row.payment ? "Yes" : "No"}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: 1 }}>
                           {(() => {
                            const { percent, current, next, color } =
                              getStatusInfo(row);
                            return (
                              <Box sx={{ width: "100%", minWidth: 220, py: 0.5 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    mb: 0,
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      fontWeight={700}
                                      color="text.primary"
                                      sx={{ fontSize: "0.75rem", whiteSpace: "nowrap", lineHeight: 1 }}
                                    >
                                      {current}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                                      fontWeight: 500, // Not bold
                                      fontSize: "0.75rem",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      border: `1px solid ${alpha(color, 0.2)}`
                                    }}
                                  >
                                    {percent}%
                                  </Box>
                                </Box>
                                {next && (
                                  <Box sx={{ mt: 0 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#000", fontSize: "0.75rem", whiteSpace: "nowrap", fontWeight: 500, lineHeight: 1 }}
                                    >
                                      {next}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {(() => {
                            const getStatusStyles = (status: string) => {
                              const s = status ? status.toUpperCase() : "";
                              if (s.includes("W105")) return { borderColor: "#ffd54f", backgroundColor: "#fff8e1", color: "#ef6c00" };
                              if (s.includes("R105")) return { borderColor: "#90caf9", backgroundColor: "#e3f2fd", color: "#1976d2" };
                              if (s.includes("F105")) return { borderColor: "#ce93d8", backgroundColor: "#f3e5f5", color: "#9c27b0" };
                              if (s.includes("DISPATCHED")) return { borderColor: "#4db6ac", backgroundColor: "#e0f2f1", color: "#00897b" };
                              return { borderColor: "#e0e0e0", backgroundColor: "#f5f5f5", color: "#757575" };
                            };
                            const styles = getStatusStyles(row.status);

                            if (!row.status) return "-";

                            return (
                              <Box
                                sx={{
                                  display: "inline-block",
                                  px: 1.5,
                                  py: 0.25,
                                  borderRadius: "16px",
                                  border: "1px solid",
                                  ...styles,
                                  fontWeight: 700,
                                  fontSize: "0.85rem",
                                  textAlign: "center",
                                  minWidth: "60px",
                                }}
                              >
                                {row.status}
                              </Box>
                            );
                          })()}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>{row.salesZone}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>{row.transporter || "-"}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.fgLocation
                            ? typeof row.fgLocation === "string"
                              ? row.fgLocation
                              : Array.isArray(row.fgLocation)
                                ? row.fgLocation.join(", ")
                                : JSON.stringify(row.fgLocation)
                            : "-"}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{row.specialRemarks}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>{row.updatedBy || "-"}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.updatedDate
                            ? new Date(row.updatedDate).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )
                            : "-"}
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
      </Box>
    </LocalizationProvider>
  );
}
