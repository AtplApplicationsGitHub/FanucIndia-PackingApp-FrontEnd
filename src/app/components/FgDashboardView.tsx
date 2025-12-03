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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from "dayjs";
import { API } from "@/common/lib/endpoints";
import { authFetch } from "@/common/lib/authFetch";
import { format } from "date-fns";
import Link from "next/link";

// Defined Color Codes per requirements
const STATUS_COLORS = {
  toBeIssued: "#FF6B6B",       // Vibrant coral red
  underIssue: "#3B82F6",       // Professional blue
  issued: "#FFD93D",           // Golden yellow
  underPacking: "#3B82F6",     // Professional blue (Same as Under Issue)
  packed: "#6C5CE7",           // Purple
  wipStorage: "#CA7373",       // Fuzzy Wuzzy
  readyForDispatch: "#F08B51", // Big Foot Feet
  dispatched: "#00B894",       // Emerald green
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
  fgLocation: string;
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

export default function FgDashboardView() {
  const theme = useTheme();
  const [rows, setRows] = useState<FgDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

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
      // API expects 1-based page
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
  }, [search, date, page, rowsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusInfo = (row: FgDashboardRow) => {
    const s = (row.status || "").toUpperCase();
    const { assignedUserId, fgLocation, isReadyForDispatch, isWipStorage } = row;

    // 1. Dispatched (100%)
    if (s === "DISPATCHED") {
      return { 
        percent: 100, 
        current: "Dispatched", 
        next: "",
        color: STATUS_COLORS.dispatched 
      };
    }

    // 2. Ready for Dispatch (90%)
    if (isReadyForDispatch || s.includes("READY FOR DISPATCH")) {
      return { 
        percent: 90, 
        current: "Ready for Dispatch", 
        next: "Dispatched",
        color: STATUS_COLORS.readyForDispatch 
      };
    }

    // 3. WIP Storage (80%)
    if ((fgLocation && fgLocation.trim() !== "") || isWipStorage) {
      return { 
        percent: 80, 
        current: "WIP Storage", 
        next: "Ready for Dispatch",
        color: STATUS_COLORS.wipStorage 
      };
    }

    // 4. F105 = Packed (75%)
    if (s.includes("F105")) {
      return { 
        percent: 75, 
        current: "Packed", 
        next: "WIP Storage",
        color: STATUS_COLORS.packed 
      };
    }

    // 5. W105 = Issued (50%)
    if (s.includes("W105")) {
      // If User is Assigned -> Under Packing (Blue)
      if (assignedUserId) {
        return { 
          percent: 50, 
          current: "Under Packing", 
          next: "Packed",
          color: STATUS_COLORS.underPacking 
        };
      }
      // If No User Assigned -> Issued (Yellow)
      return { 
        percent: 50, 
        current: "Issued", 
        next: "Under Packing", 
        color: STATUS_COLORS.issued 
      };
    }

    // 6. R105 = Under Issue (25%)
    // REPLACED "Assigned" with "Under Issue" strictly as per request
    if (s.includes("R105")) {
      return { 
        percent: 25, 
        current: "Under Issue", 
        next: "Issued",
        color: STATUS_COLORS.underIssue 
      };
    }
    
    // 7. NULL = To be Issued (0%)
    // REPLACED "Assigned" next status with "Under Issue"
    return { 
      percent: 0, 
      current: "To be Issued", 
      next: "Under Issue", 
      color: STATUS_COLORS.toBeIssued 
    };
  };

  // Pagination Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
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
    { id: 'progress', label: 'Progress', width: 180 },
  ];

  const lightYellow = alpha(theme.palette.primary.main, 0.25); 
  const headerBgColor = theme.palette.mode === "dark" ? "#000000" : "#FFFFFF";
  const headerTextColor = theme.palette.mode === "dark" ? "#FFFFFF" : "#000000";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Paper
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 400 },
              border: "1px solid #e0e0e0",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search"
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <IconButton
                sx={{ p: "10px" }}
                aria-label="clear"
                onClick={() => setSearch("")}
              >
                <ClearIcon />
              </IconButton>
            )}
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          <DatePicker
            label="Delivery Date"
            value={date ? dayjs(date) : null}
            onChange={(newValue) =>
              setDate(newValue ? newValue.toDate() : null)
            }
            slotProps={{
              field: {
                clearable: true,
                onClear: () => setDate(null),
              },
              textField: {
                size: "medium",
                variant: "outlined",
                sx: {
                  minWidth: 170,
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": { borderRadius: 1 },
                },
              },
            }}
          />
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
                          {row.fgLocation || "-"}
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
                                }
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>
                        {(() => {
                          const { percent, current, next, color } = getStatusInfo(row);
                          return (
                            <Box sx={{ width: '100%', minWidth: 120, py: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" fontWeight={600} color="text.primary">
                                  {current}
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color="text.primary">
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
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: color,
                                    borderRadius: 3,
                                  }
                                }}
                              />

                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
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