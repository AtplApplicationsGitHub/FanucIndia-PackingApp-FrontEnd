// components/charts/OrderStatusByZone.tsx
"use client";

import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Table, BarChart3 } from "lucide-react";
import { useOrderZoneBarChart, ZoneStatus } from "../hooks/useOrderzoneBarchart";
import { useTheme } from "@mui/material";

export default function OrderStatusByZone() {
  const theme = useTheme();
  const { data, loading, error, refetch } = useOrderZoneBarChart();
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // Finalized Colors - Updated to match new palette
  const COLORS = {
    toBeIssued: "#FF6B6B", // Vibrant coral red
    assigned: "#3B82F6", // Professional blue
    issued: "#FFD93D", // Golden yellow
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
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 animate-spin" />
            Loading order status by zone...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <button
            onClick={refetch}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-300 select-none h-full chart-no-focus">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2
            className="text-lg uppercase font-semibold"
            style={{ color: theme.palette.secondary.main }}
          >
            Order Status by Sales Zone
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time counts per zone — Assigned, Issued, Packed, Dispatched
          </p>
        </div>

        {/* Toggle Button WITHOUT yellow focus ring */}
        <button
          onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 
            text-gray-700 font-medium rounded-lg transition-all duration-200 focus:outline-none"
        >
          {viewMode === "chart" ? (
            <>
              <Table className="w-5 h-5" />
              <span>Table View</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5" />
              <span>Chart View</span>
            </>
          )}
        </button>
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

          <div className="h-[450px] -mx-6 -mb-6">
            <BarChart
              aria-label="Order status by sales zone"
              dataset={chartData}
              height={380}
              margin={{ top: 20, right: 40, left: 50, bottom: 60 }}
              xAxis={[
                {
                  dataKey: "zone",
                  scaleType: "band",
                  // keep default tick style so labels render reliably
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
                    mt: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    // circular color indicators
                    "& .MuiChartsLegend-marker": {
                      borderRadius: "50%",
                      width: 12,
                      height: 12,
                    },
                    // bold legend text
                    "& .MuiChartsLegend-series tspan": {
                      fontSize: 12,
                      fontWeight: 600,
                    },
                  },
                },
              }}
            />
          </div>
        </>
      ) : (
        /* Table View (unchanged) */
        <div className="overflow-x-auto -mx-6 -mb-6 mt-4">
          <table className="w-full text-sm border-t border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider">
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
            <tbody className="divide-y divide-gray-200">
              {chartData.map((row) => (
                <tr key={row.zone} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
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
