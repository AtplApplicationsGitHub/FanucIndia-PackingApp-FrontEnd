"use client";

import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { usePaymentClearanceBarchart } from "../hooks/usePaymentClearanceBarchart";
import { useTheme } from "@mui/material";

/**
 * Data type for each chart row.
 * Same as before.
 */
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

  // Preserve the same assumption about the hook shape as before
  const data = (rawData as unknown as ChartDatum[]) ?? [];

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Payment Clearance by Sales Zone
          </h3>
          <div className="w-full h-[340px] md:h-[420px] flex items-center justify-center">
            <div className="text-slate-500">Loading chart data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
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
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-lg uppercase font-semibold"
            style={{ color: theme.palette.secondary.main }}
          >
            Payment Clearance by Sales Zone
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cleared vs Pending payments across sales zones
          </p>
        </div>
      </div>

      <div className="w-full h-[340px] md:h-[420px]">
        <BarChart
          aria-label="Payment clearance by sales zone"
          dataset={data}
          height={380}
          margin={{ top: 20, right: 24, left: 48, bottom: 70 }}
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

                // Circle indicators for legend
                "& .MuiChartsLegend-marker": {
                  borderRadius: "50%",
                  width: 12,
                  height: 12,
                },

                // Bold legend text
                "& .MuiChartsLegend-series tspan": {
                  fontSize: 13,
                  fontWeight: 600,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
