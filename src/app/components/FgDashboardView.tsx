"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Link as MuiLink,
  TextField,
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
import axios from "axios";

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
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd-MMM-yyyy");
  } catch {
    return "Invalid Date";
  }
};

type InlineEdit = {
  id: number;
  field: "fgLocation";
  value: string | null;
  original: string | null;
} | null;

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

  const [inlineEdit, setInlineEdit] = useState<InlineEdit>(null);

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

  const getStatusInfo = (status: string, fgLocation?: string | null) => {
    const s = (status || "").toUpperCase();
    
    if (s === "DISPATCHED") {
      return { percent: 100, current: "Dispatched", next: "Completed" };
    }
    
    // New Status from Label Print
    if (s.includes("STORED") || s.includes("READY FOR DISPATCH")) {
      return { percent: 90, current: "Stored/Ready for Dispatch", next: "Next: Dispatched" };
    }

    if (s.includes("F105")) {
      // Logic: If FG Location is set, it's WIP Storage, otherwise it's Packed
      if (fgLocation && fgLocation.trim() !== "") {
        return { percent: 80, current: "WIP Storage", next: "Next: Stored/Ready for Dispatch" };
      }
      return { percent: 75, current: "Packed", next: "Next: WIP Storage" };
    }

    if (s.includes("W105")) {
      return { percent: 50, current: "Issued", next: "Next: Under Packing" };
    }

    if (s.includes("R105")) {
      return { percent: 25, current: "To be Issued", next: "Next: Under Issue" };
    }
    
    return { percent: 0, current: "Created", next: "Next: To be Issued" };
  };

  const handleInlineSave = async (id: number, value: string) => {
    if (inlineEdit?.original === value) {
      setInlineEdit(null);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        API.ADMIN.SALES_ORDER_BY_ID(id),
        { fgLocation: value },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: "FG Location updated successfully!",
        severity: "success",
      });
      fetchData();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to update FG Location",
        severity: "error",
      });
    } finally {
      setInlineEdit(null);
    }
  };

  function CustomEditTextField({
    initialValue,
    onCommit,
    onCancel,
  }: {
    initialValue: string | null;
    onCommit: (val: string) => void;
    onCancel: () => void;
  }) {
    const [localValue, setLocalValue] = React.useState(initialValue ?? "");

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") onCommit(localValue.toString());
      if (e.key === "Escape") onCancel();
      if (e.key === " " || (e.ctrlKey && e.key.toLowerCase() === "a")) {
        e.stopPropagation();
      }
    };

    return (
      <TextField
        value={localValue}
        size="small"
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onCommit(localValue.toString())}
        onKeyDown={handleKeyDown}
        autoFocus
        variant="standard"
        sx={{ width: "100%" }}
      />
    );
  }

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
    { id: "deliveryDate", label: "Delivery Date", width: 130 },
    { id: "saleOrderNumber", label: "Sales Order", width: 120 },
    { id: "transferOrder", label: "Transfer Order", width: 140 },
    { id: "product", label: "Product", width: 150 },
    { id: "customerName", label: "Customer Name", width: 150 },
    { id: "salesZone", label: "Sales Zone", width: 120 },
    { id: "payment", label: "Payment", width: 100 },
    { id: "fgLocation", label: "FG Location", width: 150 },
    { id: "specialRemarks", label: "Special Remarks", width: "auto" },
    { id: "updatedBy", label: "Updated By", width: 130 },
    { id: "updatedDate", label: "Updated Date", width: 180 },
    { id: "status", label: "Status", width: 100 },
    { id: 'progress', label: 'Progress', width: 140 },
  ];

  // Styling constants
  const lightYellow = alpha(theme.palette.primary.main, 0.1); // Light yellow for alternating rows
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
                    const isDispatched = row.status === "Dispatched";

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
                          {inlineEdit &&
                          inlineEdit.id === row.id &&
                          inlineEdit.field === "fgLocation" ? (
                            <CustomEditTextField
                              initialValue={inlineEdit.value}
                              onCommit={(val) => handleInlineSave(row.id, val)}
                              onCancel={() => setInlineEdit(null)}
                            />
                          ) : (
                            <Box
                              sx={{
                                cursor: isDispatched ? "default" : "pointer",
                                textDecoration: isDispatched
                                  ? "none"
                                  : "underline dotted",
                                width: "100%",
                              }}
                              onClick={() =>
                                !isDispatched &&
                                setInlineEdit({
                                  id: row.id,
                                  field: "fgLocation",
                                  value: row.fgLocation || "",
                                  original: row.fgLocation || "",
                                })
                              }
                              title={
                                isDispatched
                                  ? "Locked (Dispatched)"
                                  : "Click to edit"
                              }
                            >
                              {row.fgLocation || "-"}
                            </Box>
                          )}
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
                                  second: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>
                        {(() => {
                          const { percent, current, next } = getStatusInfo(row.status, row.fgLocation);
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
                                  backgroundColor: alpha(theme.palette.success.main, 0.2),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: theme.palette.success.main,
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
