"use client";

import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { CircularProgress } from "@mui/material";
import { useSalesKpis } from "../../components/hooks/OrderStatus";

const COLORS = {
  toBeIssued: "#FF6B6B", // Vibrant coral red
  assigned: "#3B82F6", // Professional blue
  issued: "#FFD93D", // Golden yellow
  packed: "#6C5CE7", // Purple
  dispatched: "#00B894", // Emerald green
};

export default function OrderStatusChart() {
  const { data, totalSoCount, loading } = useSalesKpis();

  const total = Number.isFinite(totalSoCount as number)
    ? (totalSoCount as number)
    : 0;

  if (loading) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full min-h-[500px] flex items-center justify-center font-sans">
        <CircularProgress />
        <span className="ml-3 text-gray-400 dark:text-gray-300">
          Loading chart...
        </span>
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
      value: data?.dispatchedSoCount ?? 0,
      label: "Dispatched",
      color: COLORS.dispatched,
    },
  ].filter((item) => item.value > 0); // Filter out zero values for a cleaner chart

  const hasData = chartData.length > 0;

  return (
    <div className="w-full max-w-[900px] mx-auto bg-white dark:bg-[#1F2933] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full flex flex-col font-sans transition-all">
      <div className="mb-5">
        <p className="text-lg uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
          Order Status Distribution
        </p>

        <p className="mt-1 text-sm text-[#4B5563] dark:text-[#E5E7EB]">
          Current status of all your sales orders (Total:{" "}
          <span className="font-semibold text-[#1F2933] dark:text-white">
            {total.toLocaleString()}
          </span>
          )
        </p>
      </div>

      <div className="flex-1 min-h-[320px] w-full relative">
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
            className="text-[#1F2933] dark:text-[#F7F7F7]"
            sx={{
              // Force legend text color to match the Tailwind text color using currentColor
              "& .MuiChartsLegend-label": {
                fill: "currentColor !important",
              },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No data available
          </div>
        )}
      </div>
      {/* Custom legend removed – using built-in MUI legend */}
    </div>
  );
}
