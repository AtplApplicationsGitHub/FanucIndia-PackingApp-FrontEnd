"use client";

import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { useSalesOrderStatusByCustomer } from "../hooks/useSalesOrderStatusByCustomer";
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress } from "@mui/material";

interface CustomerOrderStatus {
  customerName: string;
  toBeIssuedCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
  dispatchedCount: number;
}

interface Props {
  selectedDate: string;
  displayDate: string;
}

export default function SalesOrderStatusByCustomerChart({ selectedDate, displayDate }: Props) {
  const { data, loading, error, refetch } = useSalesOrderStatusByCustomer(selectedDate);
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const COLORS = {
    toBeIssued: "#FF6B6B",
    assigned: "#3B82F6",
    issued: "#D97706",
    packed: "#6C5CE7",
    dispatched: "#00B894",
  };

  const chartData = (data || []).map((item: CustomerOrderStatus) => ({
    customer: item.customerName,
    toBeIssued: item.toBeIssuedCount,
    assigned: item.r105Count,
    issued: item.w105Count,
    packed: item.f105Count,
    dispatched: item.dispatchedCount,
  }));

  const paginatedData = chartData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] h-full">
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="text-[#4B5563] dark:text-[#E5E7EB] flex items-center gap-3">
            <CircularProgress size={24} />
            Loading order status by customer...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#D00000] dark:text-red-400 mb-4">Error loading data: {error}</p>
          <button onClick={refetch} className="px-5 py-2 bg-[#D00000] text-white rounded-lg hover:bg-red-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: 1, p: 2, border: "1px solid", borderColor: "divider", height: "100%", display: "flex", flexDirection: "column", minHeight: viewMode === "chart" ? 350 : "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <p className="text- uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Order Status by Customer ({displayDate})
          </p>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", bgcolor: "action.hover", borderRadius: 2, p: 0.5, border: "1px solid", borderColor: "divider" }}>
          <Button
            onClick={() => setViewMode("table")}
            disableRipple
            size="small"
            sx={{
              px: 1.6, py: 0.65, fontSize: "0.875rem", fontWeight: 500, borderRadius: 1.5,
              textTransform: "none", minWidth: "unset",
              bgcolor: viewMode === "table" ? "background.paper" : "transparent",
              color: viewMode === "table" ? "#D00000" : "text.secondary",
              boxShadow: viewMode === "table" ? 1 : "none",
              "&:hover": { bgcolor: viewMode === "table" ? "background.paper" : "transparent", color: viewMode === "table" ? "#D00000" : "text.primary" },
            }}
          >
            Table
          </Button>
          <Button
            onClick={() => setViewMode("chart")}
            disableRipple
            size="small"
            sx={{
              px: 1.6, py: 0.65, fontSize: "0.875rem", fontWeight: 500, borderRadius: 1.5,
              textTransform: "none", minWidth: "unset",
              bgcolor: viewMode === "chart" ? "background.paper" : "transparent",
              color: viewMode === "chart" ? "#D00000" : "text.secondary",
              boxShadow: viewMode === "chart" ? 1 : "none",
              "&:hover": { bgcolor: viewMode === "chart" ? "background.paper" : "transparent", color: viewMode === "chart" ? "#D00000" : "text.primary" },
            }}
          >
            Chart
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", alignItems: viewMode === "chart" ? "center" : "flex-start", width: "100%", minHeight: viewMode === "chart" ? 250 : "auto" }}>
        {viewMode === "chart" ? (
          <Box sx={{ width: "100%", height: 350 }}>
            <BarChart
              dataset={paginatedData}
              width={undefined}
              height={320}
              margin={{ top: 20, right: 40, left: 50, bottom: 60 }}
              xAxis={[{ dataKey: "customer", scaleType: "band", tickLabelStyle: { angle: 0, textAnchor: 'middle', fontSize: 11 } }]}
              series={[
                { dataKey: "toBeIssued", label: "To be Issued", color: COLORS.toBeIssued },
                { dataKey: "assigned", label: "Assigned", color: COLORS.assigned },
                { dataKey: "issued", label: "Issued", color: COLORS.issued },
                { dataKey: "packed", label: "Packed", color: COLORS.packed },
                { dataKey: "dispatched", label: "Dispatched", color: COLORS.dispatched },
              ]}
              slotProps={{ legend: { position: { vertical: "bottom", horizontal: "center" } } }}
            />
          </Box>
        ) : (
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>Customer</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.toBeIssued }}>To be Issued</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.assigned }}>Assigned</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.issued }}>Issued</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.packed }}>Packed</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.dispatched }}>Dispatched</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>No data available</TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => (
                      <TableRow key={row.customer} sx={{ "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.2s" }}>
                        <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>{row.customer}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: COLORS.toBeIssued }}>{row.toBeIssued}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: COLORS.assigned }}>{row.assigned}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: COLORS.issued }}>{row.issued}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: COLORS.packed }}>{row.packed}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: COLORS.dispatched }}>{row.dispatched}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1, mt: 1 }}>
        <TablePagination
          component="div"
          count={chartData.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ color: 'text.primary' }}
        />
      </Box>
    </Box>
  );
}