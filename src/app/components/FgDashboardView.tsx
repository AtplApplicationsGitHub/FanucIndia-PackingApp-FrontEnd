"use client";

import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Link as MuiLink } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { API } from "@/common/lib/api";
import { authFetch } from "@/common/lib/authFetch";
import { format } from "date-fns";
import Link from "next/link";

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

const columns: GridColDef<FgDashboardRow>[] = [
  {
    field: "deliveryDate",
    headerName: "Delivery Date",
    width: 130,
    valueGetter: ( value ) => formatDate(value),
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
    valueGetter: ( value ) => (value ? "Yes" : "No"),
  },
  { field: "status", headerName: "Status", width: 100 },
  { field: "fgLocation", headerName: "FG Location", width: 120 },
  { field: "specialRemarks", headerName: "Special Remarks", flex: 1 },
  { field: "updatedBy", headerName: "Updated By", width: 130, valueGetter: ( value ) => value || "-" },
  {
    field: "updatedDate",
    headerName: "Updated Date",
    width: 130,
    valueGetter: ( value ) => formatDate(value),
  },
];

export default function FgDashboardView() {
  const [rows, setRows] = useState<FgDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authFetch(API.FG_DASHBOARD);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setRows(data);
      } catch (error) {
        console.error("Error fetching FG Dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        FG Dashboard
      </Typography>
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}