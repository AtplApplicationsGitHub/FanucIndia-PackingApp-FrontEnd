"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Link as MuiLink,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridEventListener,
} from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from "dayjs";
import { API } from '@/common/lib/endpoints';
import { authFetch } from "@/common/lib/authFetch";
import { format } from "date-fns";
import Link from "next/link";
import axios from "axios";

interface FgDashboardRow {
  id: number;
  deliveryDate: string;
  saleOrderNumber: string;
  product: string;
  customerName: string;
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
  const [rows, setRows] = useState<FgDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [inlineEdit, setInlineEdit] = useState<InlineEdit>(null);

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
      const res = await authFetch(`${API.FG_DASHBOARD}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setRows(data);
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
  }, [search, date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      // prevent DataGrid from hijacking text-edit keys
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

  const columns: GridColDef<FgDashboardRow>[] = [
    {
      field: "deliveryDate",
      headerName: "Delivery Date",
      width: 130,
      valueGetter: (_value, row) => formatDate(row.deliveryDate),
    },
    {
      field: "saleOrderNumber",
      headerName: "SO",
      width: 120,
      renderCell: (params: GridRenderCellParams<FgDashboardRow>) => (
        <MuiLink
          component={Link}
          href={`/so-search/${params.row.saleOrderNumber}`}
          underline="hover"
          sx={{ fontWeight: 500 }}
        >
          {params.value}
        </MuiLink>
      ),
    },
    { field: "product", headerName: "Product", width: 150 },
    { field: "customerName", headerName: "Customer Name", width: 150 },
    {
      field: "payment",
      headerName: "Payment",
      width: 100,
      valueGetter: (_value, row) => (row.payment ? "Yes" : "No"),
    },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "fgLocation",
      headerName: "FG Location",
      width: 150,
      renderCell: (params: GridRenderCellParams<FgDashboardRow>) => {
        const row = params.row;
        return inlineEdit &&
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
              cursor: "pointer",
              textDecoration: "underline dotted",
              width: "100%",
            }}
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "fgLocation",
                value: row.fgLocation || "",
                original: row.fgLocation || "",
              })
            }
            title="Click to edit"
          >
            {row.fgLocation || "-"}
          </Box>
        );
      },
    },
    { field: "specialRemarks", headerName: "Special Remarks", flex: 1 },
    {
      field: "updatedBy",
      headerName: "Updated By",
      width: 130,
      valueGetter: (_value, row) => row.updatedBy || "-",
    },
    {
      field: "updatedDate",
      headerName: "Updated Date",
      width: 180,
      valueGetter: (_value, row) =>
      row.updatedDate
        ? new Date(row.updatedDate).toLocaleString('en-IN', { 
            day: '2-digit',   
            month: '2-digit', 
            year: 'numeric',  
            hour: '2-digit',  
            minute: '2-digit',
            second: '2-digit',
            hour12: true      
          })
        : "-",
    },
  ];

  const handleCellKeyDown: GridEventListener<"cellKeyDown"> = (
    params,
    event
  ) => {
    const isCtrlA =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a";
    if (isCtrlA && params.isEditable) {
      event.stopPropagation();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          FG Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="SEARCH"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: 200,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
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
                size: "small",
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
        <Paper sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            onCellKeyDown={handleCellKeyDown}
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
