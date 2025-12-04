"use client";

import React, { useMemo, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { usePaymentClearance } from "../hooks/PaymentMethodsChart";
import { Table, BarChart3 } from "lucide-react";

type ChartItem = {
  zone: string;
  cleared: number;
  pending: number;
};

export default function PaymentMethodsChart() {
  const theme = useTheme();
  const { data, loading, error } = usePaymentClearance();
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const chartData: ChartItem[] | undefined = useMemo(
    () =>
      data?.map((item) => ({
        zone: item.zoneName?.replace?.(" Zone", "") ?? item.zoneName ?? "",
        cleared: Number(item.paymentCleared ?? 0),
        pending: Number(item.paymentPending ?? 0),
      })),
    [data]
  );

  const friendlyName = (key?: string | number | null) => {
    if (key === undefined || key === null) return "";
    const k = String(key);
    if (k === "cleared") return "Yes";
    if (k === "pending") return "No";
    return k;
  };

  const formatNumber = (n: number | string) => {
    const num = typeof n === "number" ? n : Number(n);
    if (Number.isNaN(num)) return String(n);
    return num.toLocaleString();
  };

  const seriesValueFormatter = (value: number | null) => formatNumber(value ?? 0);

  return (
    <Paper
      elevation={0}
      sx={{
        padding: "24px",
        borderRadius: "8px",
        height: "100%",
        width: "100%",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        backgroundColor: theme.palette.background.paper,
      }}
      aria-label="Payment clearance chart card"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <Typography
            variant="body2"
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "secondary.main",
            }}
          >
            PAYMENT CLEARANCE BY SALES ZONE
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Number of cleared vs pending payments across regions
          </Typography>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 
            text-gray-700 font-medium rounded-lg transition-all duration-200 focus:outline-none text-sm"
        >
          {viewMode === "chart" ? (
            <>
              <Table className="w-4 h-4" />
              <span>Table View</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              <span>Chart View</span>
            </>
          )}
        </button>
      </div>

      <Box sx={{ width: "100%", mt: 2 }} aria-live="polite">
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" height={350}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (!chartData || chartData.length === 0) && (
          <Typography color="text.secondary" textAlign="center" mt={4}>
            No payment data available.
          </Typography>
        )}

        {!loading && chartData && chartData.length > 0 && (
          <>
            {viewMode === "chart" ? (
              <Box sx={{ height: 400 }}>
                <BarChart
                  aria-label="Bar chart showing cleared vs pending payments by zone"
                  dataset={chartData}
                  height={350}
                  margin={{ top: 20, right: 20, bottom: 70, left: 50 }}
                  xAxis={[
                    {
                      dataKey: "zone",
                      scaleType: "band",
                    },
                  ]}
                  yAxis={[
                    {
                      valueFormatter: (v: number | null) => formatNumber(v ?? 0),
                    },
                  ]}
                  series={[
                    {
                      dataKey: "cleared",
                      label: friendlyName("cleared"),
                      valueFormatter: (v: number | null) => seriesValueFormatter(v),
                      color: "#10B981", // green (Yes)
                    },
                    {
                      dataKey: "pending",
                      label: friendlyName("pending"),
                      valueFormatter: (v: number | null) => seriesValueFormatter(v),
                      color: "#EF4444", // red (No)
                    },
                  ]}
                  slotProps={{
                    legend: {
                      position: { vertical: "bottom", horizontal: "center" },
                      sx: {
                        mt: 2,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        "& .MuiChartsLegend-series tspan": {
                          fontSize: 12,
                        },
                        "& .MuiChartsLegend-marker": {
                          borderRadius: "50%",
                        },
                      },
                    },
                  }}
                />
              </Box>
            ) : (
              /* Table View */
              <div className="overflow-x-auto mt-4 border-t border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider">
                        Zone
                      </th>
                      <th
                        className="px-6 py-4 text-center font-semibold"
                        style={{ color: "#10B981" }}
                      >
                        Yes
                      </th>
                      <th
                        className="px-6 py-4 text-center font-semibold"
                        style={{ color: "#EF4444" }}
                      >
                        No
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {chartData.map((row) => (
                      <tr key={row.zone} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {row.zone}
                        </td>
                        <td
                          className="px-6 py-4 text-center font-bold"
                          style={{ color: "#10B981" }}
                        >
                          {formatNumber(row.cleared)}
                        </td>
                        <td
                          className="px-6 py-4 text-center font-bold"
                          style={{ color: "#EF4444" }}
                        >
                          {formatNumber(row.pending)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}