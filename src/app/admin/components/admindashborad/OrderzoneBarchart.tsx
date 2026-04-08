// components/charts/OrderStatusByZone.tsx
"use client";

import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Table, BarChart3 } from "lucide-react";
import { useOrderZoneBarChart, ZoneStatus } from "../hooks/useOrderzoneBarchart";
import { Box, Button } from "@mui/material";

interface Props {
  selectedDate: string;
  displayDate: string;
}

export default function OrderStatusByZone({ selectedDate, displayDate }: Props) {
  const { data, loading, error, refetch } = useOrderZoneBarChart(selectedDate);
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");

  // Finalized Colors - Updated to match new palette
  const COLORS = {
    toBeIssued: "#FF6B6B", // Vibrant coral red
    assigned: "#3B82F6", // Professional blue
    issued: "#D97706", // Dark Amber
    packed: "#6C5CE7", // Purple
    dispatched: "#00B894", // Emerald green
  };

  // Transform API data (business logic unchanged)
  const chartData = (data || []).map((item: ZoneStatus) => ({
    zone: item.zoneName,
    toBeIssued: item.toBeIssuedCount,
    assigned: item.r105Count,
    issued: item.w105Count,
    packed: item.f105Count,
    dispatched: item.dispatchedCount,
  }));

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <div className="flex items-center justify-center h-96">
          <div className="text-[#4B5563] dark:text-[#E5E7EB] flex items-center gap-3">
            <BarChart3 className="w-6 h-6 animate-spin" />
            Loading order status by zone...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <div className="text-center">
          <p className="text-[#D00000] dark:text-red-400 mb-4">Error loading data: {error}</p>
          <button
            onClick={refetch}
            className="px-5 py-2 bg-[#D00000] text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] select-none h-full chart-no-focus">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Order Status by Sales Zone ({displayDate})
          </h2>
          <p className="text-sm text-[#4B5563] dark:text-[#E5E7EB] mt-1">
            Real-time counts per zone — Assigned, Issued, Packed, Dispatched
          </p>
        </div>

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
      </div>

      {/* Chart View */}
      {viewMode === "chart" ? (
        <>
          <style>
            {`
              /* Remove yellow border when clicking chart */
              .chart-no-focus *:focus {
                outline: none !important;
                box-shadow: none !important;
              }
            `}
          </style>

          <div className="h-[450px] -mx-6 -mb-6 text-gray-700 dark:text-gray-200">
            <BarChart
              aria-label="Order status by sales zone"
              dataset={chartData}
              height={380}
              margin={{ top: 20, right: 40, left: 50, bottom: 60 }}
              xAxis={[
                {
                  dataKey: "zone",
                   scaleType: "band",
                   tickLabelStyle: {
                     angle: 0,
                     textAnchor: 'middle',
                     fontSize: 12,
                     // We rely on MUI ThemeProvider to swap text color in dark mode
                     // or we can pass explicit fill if the theme provider isn't enough
                   },
                },
              ]}
              yAxis={[
                {
                  scaleType: "linear",
                  tickMinStep: 1,
                },
              ]}
              series={[
                {
                  dataKey: "toBeIssued",
                  label: "To be Issued",
                  color: COLORS.toBeIssued,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "assigned",
                  label: "Assigned (R105)",
                  color: COLORS.assigned,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "issued",
                  label: "Issued (W105)",
                  color: COLORS.issued,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "packed",
                  label: "Packed (F105)",
                  color: COLORS.packed,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "dispatched",
                  label: "Dispatched",
                  color: COLORS.dispatched,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
              ]}
              slotProps={{
                legend: {
                  position: { vertical: "bottom", horizontal: "center" },
                  sx: {
                    gap: 2, // Use gap in sx if it's a flex container, or rely on default spacing
                    "& .MuiChartsLegend-label": {
                      fontSize: 12,
                      fontWeight: 600,
                      fill: "currentColor",
                    },
                  },
                },
              }}

              sx={{
                // Ensure text colors adapt to theme context if inherited
                "& .MuiChartsAxis-tickLabel": {
                   fill: "currentColor !important"
                },
                "& .MuiChartsAxis-line": {
                  stroke: "currentColor !important"
                },
                "& .MuiChartsAxis-tick": {
                  stroke: "currentColor !important"
                },
                "& .MuiChartsLegend-label": {
                   fill: "currentColor !important"
                }
              }}
              className="dark:text-[#E5E7EB] text-[#4B5563]"
            />
          </div>
        </>
      ) : (
        /* Table View */
        <div className="overflow-x-auto -mx-6 -mb-6 mt-4">
          <table className="w-full text-sm border-t border-[#E5E7EB] dark:border-[#4B5563]">
            <thead className="bg-[#F7F7F7] dark:bg-[#2C3540]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#1F2933] dark:text-[#E5E7EB] uppercase tracking-wider">
                  Zone
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.toBeIssued }}
                >
                  To be Issued
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.assigned }}
                >
                  Assigned (R105)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.issued }}
                >
                  Issued (W105)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.packed }}
                >
                  Packed (F105)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.dispatched }}
                >
                  Dispatched
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#4B5563]">
              {chartData.map((row) => (
                <tr key={row.zone} className="hover:bg-[#F7F7F7] dark:hover:bg-[#2C3540] transition bg-white dark:bg-[#1F2933]">
                  <td className="px-6 py-4 font-medium text-[#1F2933] dark:text-[#E5E7EB]">
                    {row.zone}
                  </td>
                  <td
                    className="px-6 py-4 text-center font-bold"
                    style={{ color: COLORS.toBeIssued }}
                  >
                    {row.toBeIssued}
                  </td>
                  <td
                    className="px-6 py-4 text-center font-bold"
                    style={{ color: COLORS.assigned }}
                  >
                    {row.assigned}
                  </td>
                  <td
                    className="px-6 py-4 text-center font-bold"
                    style={{ color: COLORS.issued }}
                  >
                    {row.issued}
                  </td>
                  <td
                    className="px-6 py-4 text-center font-bold"
                    style={{ color: COLORS.packed }}
                  >
                    {row.packed}
                  </td>
                  <td
                    className="px-6 py-4 text-center font-bold"
                    style={{ color: COLORS.dispatched }}
                  >
                    {row.dispatched}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
