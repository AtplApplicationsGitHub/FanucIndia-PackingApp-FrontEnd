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
    { id: "deliveryDate", label: "Delivery Date", width: 90 },
    { id: "saleOrderNumber", label: "Sales Order", width: 120 },
    { id: "transferOrder", label: "Transfer Order", width: 140 },
    { id: "product", label: "Product", width: 150 },
    { id: "customerName", label: "Customer Name", width: 150 },
    { id: "salesZone", label: "Sales Zone", width: 120 },
    { id: "payment", label: "Payment", width: 70 },
    { id: "fgLocation", label: "FG Location", width: 150 },
    { id: "specialRemarks", label: "Special Remarks", width: "auto" },
    { id: "updatedBy", label: "Updated By", width: 130 },
    { id: "updatedDate", label: "Updated Date", width: 180 },
    { id: "status", label: "Status", width: 100 },
    { id: "progress", label: "Progress", width: 180 },
  ];

  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  const headerBgColor = theme.palette.mode === "dark" ? "#000000" : "#FFFFFF";
  const headerTextColor = theme.palette.mode === "dark" ? "#FFFFFF" : "#000000";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 2 },
            width: { xs: "100%", md: "auto" },
            mx: { xs: 0, md: "auto" },
            alignItems: { md: "center" },
            justifyContent: "center",
            flexWrap: "wrap",
            mb: 3,
          }}
        >
          <Paper
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 220 },
              border: "1px solid #e0e0e0",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
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
                sx={{ p: "10px" }}
                aria-label="clear"
                onClick={() => {
                  setSearch("");
                  setPage(0);
                }}
              >
                <ClearIcon />
              </IconButton>
            )}
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>

          <FormControl
            size="small"
            sx={{ minWidth: 130, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <InputLabel>Payment</InputLabel>
            <Select
              value={paymentFilter}
              label="Payment"
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 150, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <InputLabel>Sales Zone</InputLabel>
            <Select
              value={zoneFilter}
              label="Sales Zone"
              onChange={(e) => {
                setZoneFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">
                <em>All Zones</em>
              </MenuItem>
              {salesZones.map((zone) => (
                <MenuItem key={zone.id} value={String(zone.id)}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 150, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="Delivery Date"
            value={date ? dayjs(date) : null}
            onChange={(newValue) => {
              setDate(newValue ? newValue.toDate() : null);
              setPage(0);
            }}
            slotProps={{
              field: {
                clearable: true,
                onClear: () => setDate(null),
              },
              textField: {
                size: "small",
                variant: "outlined",
                sx: {
                  minWidth: 150,
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": { borderRadius: 1 },
                },
              },
            }}
          />
          <Button
            onClick={handleClear}
            startIcon={<X size={18} />}
            sx={{
              bgcolor: (theme) => theme.palette.action.hover,
              color: (theme) => theme.palette.text.primary,
              borderRadius: 0,
              clipPath:
                "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              fontWeight: 600,
              fontSize: 15,
              minWidth: 100,
              height: 40,
              px: 2,
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
                "& .MuiSvgIcon-root, & svg": {
                  color: "#000",
                },
              },
            }}
          >
            CLEAR
          </Button>
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
                        <TableCell>{formatDate(row.deliveryDate)}</TableCell>
                        <TableCell>
                          <MuiLink
                            component={Link}
                            href={`/so-search/${row.saleOrderNumber}`}
                            underline="hover"
                            sx={{ fontWeight: 500 }}
                          >
                            {row.saleOrderNumber}
                          </MuiLink>
                        </TableCell>
                        <TableCell>{row.transferOrder}</TableCell>
                        <TableCell>{row.product}</TableCell>
                        <TableCell>{row.customerName}</TableCell>
                        <TableCell>{row.salesZone}</TableCell>
                        <TableCell>{row.payment ? "Yes" : "No"}</TableCell>

                        <TableCell>
                          {row.fgLocation
                            ? typeof row.fgLocation === "string"
                              ? row.fgLocation
                              : Array.isArray(row.fgLocation)
                                ? row.fgLocation.join(", ")
                                : JSON.stringify(row.fgLocation)
                            : "-"}
                        </TableCell>

                        <TableCell>{row.specialRemarks}</TableCell>
                        <TableCell>{row.updatedBy || "-"}</TableCell>

                        <TableCell>
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
                        <TableCell>{row.status}</TableCell>
                        <TableCell>
                          {(() => {
                            const { percent, current, next, color } =
                              getStatusInfo(row);
                            return (
                              <Box sx={{ width: "100%", minWidth: 120, py: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.primary"
                                  >
                                    {current}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.primary"
                                  >
                                    {percent}%
                                  </Typography>
                                </Box>

                                <LinearProgress
                                  variant="determinate"
                                  value={percent}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: alpha(color, 0.2),
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: color,
                                      borderRadius: 3,
                                    },
                                  }}
                                />

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    mt: 0.5,
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {next}
                                </Typography>
                              </Box>
                            );
                          })()}
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
