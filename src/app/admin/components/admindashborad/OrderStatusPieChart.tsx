"use client";

import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { CircularProgress } from "@mui/material";
import { useOrderOverallStatus } from "../hooks/useOrderStatusPieChart";

// Finalized Colors - Updated to match new palette
const COLORS = {
  toBeIssued: "#FF6B6B", // Vibrant coral red
  assigned: "#3B82F6", // Professional blue
  issued: "#FFD93D", // Golden yellow
  packed: "#6C5CE7", // Purple
  dispatched: "#00B894", // Emerald green
};

export default function OrderStatusPieChart() {
  const { data, loading, error } = useOrderOverallStatus();

  if (loading) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full min-h-[500px] flex items-center justify-center font-sans">
        <CircularProgress className="text-[#FFD200]" />
        <span className="ml-3 text-[#4B5563] dark:text-[#E5E7EB]">
          Loading chart...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full min-h-[500px] flex items-center justify-center font-sans">
        <p className="text-[#D00000] dark:text-red-400">Error: {error || "No data"}</p>
      </div>
    );
  }

  // Transform data for MUI X Charts
  const chartData = [
    {
      id: 0,
      value: data.toBeIssuedCount ?? 0,
      label: "To be Issued",
      color: COLORS.toBeIssued,
    },
    {
      id: 1,
      value: data.r105Count ?? 0,
      label: "Assigned (R105)",
      color: COLORS.assigned,
    },
    {
      id: 2,
      value: data.w105Count ?? 0,
      label: "Issued (W105)",
      color: COLORS.issued,
    },
    {
      id: 3,
      value: data.f105Count ?? 0,
      label: "Packed (F105)",
      color: COLORS.packed,
    },
    {
      id: 4,
      value: data.dispatchedCount ?? 0,
      label: "Dispatched",
      color: COLORS.dispatched,
    },
  ].filter((d) => d.value > 0);

  const total =
    typeof data.totalOrders === "number"
      ? data.totalOrders
      : chartData.reduce((acc, curr) => acc + curr.value, 0);

  const hasData = chartData.length > 0;

  return (
    <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full flex flex-col font-sans">
      <div className="mb-5">
        <h2 className="text-lg font-semibold uppercase tracking-wider text-[#D00000] dark:text-[#FF6B6B]">
          Overall Order Status Count
        </h2>

        <p className="mt-1 text-sm text-[#4B5563] dark:text-[#E5E7EB]">
          Real-time breakdown of order lifecycle (Total:{" "}
          {total.toLocaleString()})
        </p>
      </div>

      <div className="flex-1 relative min-h-[320px] w-full text-gray-700 dark:text-gray-200">
        {hasData ? (
          <PieChart
            series={[
              {
                data: chartData,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                valueFormatter: (item) => {
                  const value = item.value ?? 0;
                  const percentage = total > 0 ? (value / total) * 100 : 0;
                  return `${value.toLocaleString()} orders (${percentage.toFixed(1)}%)`;
                },
                innerRadius: 0,
                paddingAngle: 0,
                cornerRadius: 0,
              },
            ]}
            height={400}
            margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
            slotProps={{
              legend: {
                position: { vertical: "middle", horizontal: "end" },
                sx: {
                  "& .MuiChartsLegend-label": {
                    fill: "currentColor",
                  },
                },
              },
            }}
            // MUI Charts dark mode support typically requires the ThemeProvider to be set up correctly with 'dark' mode
            // Since we fixed ThemeRegistry, this should auto-adapt if it consumes the MUI theme context.
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[#9ca3af] dark:text-[#6b7280]">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
