"use client";

import React, { useMemo, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { usePaymentClearance } from "../hooks/PaymentMethodsChart";
import { Table, BarChart3 } from "lucide-react";

type ChartItem = {
  zone: string;
  cleared: number;
  pending: number;
};

export default function PaymentMethodsChart() {
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
    <div
      className="bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] w-full h-full flex flex-col font-sans transition-all"
      aria-label="Payment clearance chart card"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <p className="text-lg uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            PAYMENT CLEARANCE BY SALES ZONE
          </p>

          <p className="mt-1 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Number of cleared vs pending payments across regions
          </p>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 dark:bg-[#2C3540] hover:bg-gray-200 dark:hover:bg-[#374151]
            text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all duration-200 focus:outline-none text-sm border border-transparent dark:border-[#4B5563]"
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
          <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
            No payment data available.
          </div>
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
                  className="text-[#1F2933] dark:text-[#F7F7F7]"
                  sx={{
                     // Apply currentColor to axis labels and ticks so they adapt to dark mode
                    "& .MuiChartsAxis-tickLabel": {
                      fill: "currentColor !important",
                    },
                    "& .MuiChartsAxis-label": {
                      fill: "currentColor !important",
                    },
                    "& .MuiChartsLegend-label": {
                      fill: "currentColor !important",
                    },
                     // Make grid lines subtler in dark mode if needed (optional)
                    "& .MuiChartsGrid-line": {
                      stroke: "rgba(128, 128, 128, 0.2)",
                    }
                  }}
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
              <div className="overflow-x-auto mt-4 border-t border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-[#2C3540]">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
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
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {chartData.map((row) => (
                      <tr key={row.zone} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
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
    </div>
  );
}