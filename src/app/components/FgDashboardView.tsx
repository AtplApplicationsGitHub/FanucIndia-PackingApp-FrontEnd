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
  const [localSearch, setLocalSearch] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [paymentFilter, setPaymentFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [remarksPopup, setRemarksPopup] = useState<{
    title: string;
    content: string;
  } | null>(null);

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
    setLocalSearch("");
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
    { id: "saleOrderNumber", label: "SALE ORDER NUMBER", width: 90 },
    { id: "outboundDelivery", label: "OUT BOUND DELIVERY	", width: 130 },
    { id: "customerName", label: "CUSTOMER NAME", width: 180 },
    { id: "salesZone", label: "SALES ZONE", width: 90 },
    { id: "deliveryDate", label: "REQUIRED DATE", width: 120 },
    { id: "progress", label: "STAGE STATUS ", width: 250 },
    { id: "payment", label: "PAYMENT", width: 60 },
    { id: "transporter", label: "TRANSPORTER", width: 110 },
    { id: "vehicleNumber", label: "VEHICLE NUMBER", width: 120 },
    { id: "fgLocation", label: "FG LOCATION", width: 120 },
    { id: "specialRemarks", label: "REMARKS", width: 150 },
    { id: "salesUser", label: "SALES USER", width: 110 },
  ];
  const lightYellow = alpha(theme.palette.primary.main, 0.15);
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
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                setSearch(localSearch); // Trigger data fetch only on Enter
                setPage(0);
              }}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 220 },
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
              minDate={dayjs().subtract(3, 'day')}
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
                        {/* SO NUMBER */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
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
                        <TableCell sx={{ px: 1 }}>
                          {(() => {
                            const { percent, current, next, color } =
                              getStatusInfo(row);
                            return (
                              <Box
                                sx={{ width: "100%", minWidth: 220, py: 0.5 }}
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
                                    {new Date(row.updatedDate).toLocaleString(
                                      "en-IN",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      },
                                    )}
                                  </Typography>
                                )}
                              </Box>
                            );
                          })()}
                        </TableCell>

                        {/* PAYMENT */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "3px 10px",
                              borderRadius: "16px",
                              border: "1px solid",
                              borderColor: row.payment
                                ? alpha(theme.palette.success.main, 0.5)
                                : alpha(theme.palette.error.main, 0.5),
                              backgroundColor: row.payment
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.error.main, 0.1),
                              color: row.payment
                                ? theme.palette.success.dark
                                : theme.palette.error.main,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              minWidth: "50px",
                            }}
                          >
                            {row.payment ? "Yes" : "No"}
                          </Box>
                        </TableCell>

                        {/* TRANSPORTER */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.transporter || "-"}
                        </TableCell>

                        {/* VEHICLE NUMBER */}
                        <TableCell sx={{ whiteSpace: "nowrap", px: 1 }}>
                          {row.vehicleNumber || "-"}
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
              <Box
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
              >
                <Typography
                  fontWeight={700}
                  fontSize="1rem"
                  sx={{
                    color: "#d32f2f",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {remarksPopup.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setRemarksPopup(null)}
                  sx={{ position: "absolute", right: 12 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
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
                  <Typography fontSize="0.9rem" color="text.primary">
                    {remarksPopup.content}
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}
