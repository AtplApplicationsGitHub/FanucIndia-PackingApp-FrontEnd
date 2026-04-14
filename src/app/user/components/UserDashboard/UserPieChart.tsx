"use client";

import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useSalesKpis } from "../../hooks/useUserPieChart";

const COLORS = {
  toBeIssued: "#FF6B6B", // Vibrant coral red
  assigned: "#3B82F6", // Professional blue
  issued: "#FFD93D", // Golden yellow
  packed: "#6C5CE7", // Purple
  dispatched: "#00B894", // Emerald green
};

export default function OrderStatusChart() {
  const { data, totalSoCount, loading, error } = useSalesKpis();

  const total = Number.isFinite(totalSoCount) ? totalSoCount : 0;

  if (error) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full min-h-[520px] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <span className="text-red-500">Failed to load chart data.</span>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full min-h-[520px] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          <span className="text-gray-400 dark:text-gray-500">Loading chart...</span>
        </div>
      </div>
    );
  }

  // Prepare data for MUI X Charts
  const chartData = [
    {
      id: 0,
      value: data?.toBeIssuedCount ?? 0,
      label: "To be Issued",
      color: COLORS.toBeIssued,
    },
    {
      id: 1,
      value: data?.r105Count ?? 0,
      label: "Assigned (R105)",
      color: COLORS.assigned,
    },
    {
      id: 2,
      value: data?.w105Count ?? 0,
      label: "Issued (W105)",
      color: COLORS.issued,
    },
    {
      id: 3,
      value: data?.f105Count ?? 0,
      label: "Packed (F105)",
      color: COLORS.packed,
    },
    {
      id: 4,
      value: data?.dispatchedCount ?? 0,
      label: "Dispatched",
      color: COLORS.dispatched,
    },
  ].filter((item) => item.value > 0); // Filter out zero values for a cleaner chart

  const hasData = chartData.length > 0;

  return (
    <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full min-h-[520px] flex flex-col font-sans transition-all">
      <div className="mb-5">
        <h2 className="text-base font-semibold uppercase tracking-wide text-[#D00000] dark:text-[#FF6B6B]">
          Order Status Distribution
        </h2>

        <p className="mt-1 text-sm text-[#4B5563] dark:text-[#9CA3AF]">
          Current status of all your sales orders (Total:{" "}
          {total.toLocaleString()})
        </p>
      </div>

      <div className="flex-1 relative min-h-[320px] w-full flex items-center justify-center">
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
                sx: {
                  text: {
                    fill: "#9CA3AF",
                    fontSize: 12,
                  },
                },
              }
            }}
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
