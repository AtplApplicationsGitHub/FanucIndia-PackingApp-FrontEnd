"use client";

import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { usePaymentClearanceBarchart } from "../hooks/usePaymentClearanceBarchart";
import { useTheme } from "@mui/material";
import { Table, BarChart3 } from "lucide-react";

type ChartDatum = {
  zone: string;
  cleared: number;
  pending: number;
};

const formatNumber = (n: number | string) => {
  const num = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString();
};

export default function PaymentClearanceByZone() {
  const theme = useTheme();
  const { data: rawData, loading, error } = usePaymentClearanceBarchart();
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const data = (rawData as unknown as ChartDatum[]) ?? [];

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Payment Clearance by Sales Zone
          </h3>
          <div className="w-full h-[340px] md:h-[420px] flex items-center justify-center">
            <div className="text-slate-500 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 animate-spin" />
              Loading chart data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6 border border-gray-200">
        <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Payment Clearance by Sales Zone
        </h3>
        <div className="w-full h-[340px] md:h-[420px] flex items-center justify-center text-red-600">
          Error loading data: {String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6 border border-gray-200 select-none h-full chart-no-focus">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <p
            className="text-lg uppercase font-semibold"
            style={{ color: theme.palette.secondary.main }}
          >
            Payment Clearance by Sales Zone
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cleared vs Pending payments across sales zones
          </p>
        </div>

        {/* Toggle Button */}
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

      {/* Content */}
      {viewMode === "chart" ? (
        <>
          <style>
            {`
              .chart-no-focus *:focus {
                outline: none !important;
                box-shadow: none !important;
              }
            `}
          </style>
          {/* FIXED: Added negative margins and specific height wrapper to contain legend inside card */}
          <div className="h-[450px] -mx-6 -mb-6">
            <BarChart
              aria-label="Payment clearance by sales zone"
              dataset={data}
              height={380}
              margin={{ top: 20, right: 40, left: 50, bottom: 60 }}
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
                  label: "Yes",
                  valueFormatter: (v: number | null) => formatNumber(v ?? 0),
                  color: "#10B981", // green
                },
                {
                  dataKey: "pending",
                  label: "No",
                  valueFormatter: (v: number | null) => formatNumber(v ?? 0),
                  color: "#EF4444", // red
                },
              ]}
              slotProps={{
                legend: {
                  position: { vertical: "bottom", horizontal: "center" },
                  sx: {
                    mt: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    "& .MuiChartsLegend-marker": {
                      borderRadius: "50%",
                      width: 12,
                      height: 12,
                    },
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
        /* Table View */
        /* FIXED: Added negative margins to flush table with card bottom/sides */
        <div className="overflow-x-auto -mx-6 -mb-6 mt-4">
          <table className="w-full text-sm border-t border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider">
                  Zone
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: "#10B981" }}
                >
                  Yes (Cleared)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: "#EF4444" }}
                >
                  No (Pending)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row) => (
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
    </div>
  );
}