"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { usePaymentClearanceBarchart } from "../hooks/usePaymentClearanceBarchart";

/**
 * Data type for each chart row.
 * Adjust if your hook returns different shapes.
 */
type ChartDatum = {
  zone: string;
  cleared: number;
  pending: number;
};

/**
 * Tooltip payload item shape coming from Recharts.
 * value may be number or string (or null) depending on chart config.
 */
type ChartPayloadItem = {
  dataKey?: string;
  value?: number | string | null;
  name?: string;
};

/**
 * Tooltip props used by the custom tooltip component.
 * No usage of `any`.
 */
type TooltipProps = {
  active?: boolean;
  payload?: ChartPayloadItem[]; // array of values per bar/entry
  label?: string | number;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  // Try to read values from payload; fallback to 0
  const clearedItem = payload.find((p) => p.dataKey === "cleared");
  const pendingItem = payload.find((p) => p.dataKey === "pending");

  // Normalize values to number for display (fallback to 0)
  const toNumber = (v?: number | string | null) =>
    typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) || 0 : 0;

  const cleared = toNumber(clearedItem?.value ?? 0);
  const pending = toNumber(pendingItem?.value ?? 0);

  return (
    <div
      style={{
        minWidth: 120,
        background: "white",
        borderRadius: 10,
        padding: 12,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
        fontSize: 13,
        color: "#111827",
      }}
    >
      <div style={{ fontSize: 12, color: "#374151", marginBottom: 8 }}>{label}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 6,
              background: "#10B981", // green for Yes
              boxShadow: "0 1px 4px rgba(16,185,129,0.25)",
            }}
          />
          <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <span style={{ color: "#374151" }}>Yes :</span>
            <strong style={{ color: "#10B981" }}>{cleared}</strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 6,
              background: "#EF4444", // red for No
              boxShadow: "0 1px 4px rgba(239,68,68,0.25)",
            }}
          />
          <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <span style={{ color: "#374151" }}>No :</span>
            <strong style={{ color: "#EF4444" }}>{pending}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentClearanceByZone() {
  // If your hook already types data, you can remove the type assertion below.
  const { data: rawData, loading, error } = usePaymentClearanceBarchart();

  // Ensure `data` has the expected ChartDatum[] type for the chart below.
  // If your hook returns a typed array, you can remove the `as` cast.
  const data = (rawData as unknown as ChartDatum[]) ?? [];

  const [isHover, setIsHover] = useState(false);

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
          <p className="text-lg text-slate-800 dark:text-slate-100 uppercase font-semibold">
            Payment Clearance by Sales Zone
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cleared vs Pending payments across sales zones
          </p>
        </div>

        {/* Header badges — Yes = green, No = red */}
        <div className="text-right">
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 mr-2">
            Yes
          </span>
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-800">
            No
          </span>
        </div>
      </div>

      <div className="w-full h-[340px] md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 24, left: 6, bottom: 12 }}
            barCategoryGap={24}
            className="font-medium"
          >
            <defs>
              {/* Yes - normal & hover */}
              <linearGradient id="gradYes" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="gradYesHover" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.98} />
                <stop offset="100%" stopColor="#047857" stopOpacity={0.98} />
              </linearGradient>

              {/* No (pending) - changed to red. normal & hover */}
              <linearGradient id="gradNo" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F87171" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.95} />
              </linearGradient>
              <linearGradient id="gradNoHover" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={0.98} />
                <stop offset="100%" stopColor="#B91C1C" stopOpacity={0.98} />
              </linearGradient>

              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.06" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E6E9EE" />

            <XAxis
              dataKey="zone"
              axisLine={false}
              tickLine={false}
              padding={{ left: 12, right: 12 }}
              tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              allowDecimals={false}
            />

            {/* Use the custom tooltip that shows colored Yes/No */}
            <Tooltip content={<CustomTooltip />} />

            {/* Yes (Cleared) */}
            <Bar
              dataKey="cleared"
              name="Yes"
              barSize={36}
              radius={[8, 8, 8, 8]}
              filter="url(#softShadow)"
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              {data.map((_, idx) => (
                <Cell
                  key={`yes-${idx}`}
                  fill={isHover ? "url(#gradYesHover)" : "url(#gradYes)"}
                  onMouseEnter={() => setIsHover(true)}
                  onMouseLeave={() => setIsHover(false)}
                />
              ))}
            </Bar>

            {/* No (Pending) */}
            <Bar
              dataKey="pending"
              name="No"
              barSize={36}
              radius={[6, 6, 6, 6]}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              {data.map((_, idx) => (
                <Cell
                  key={`no-${idx}`}
                  fill={isHover ? "url(#gradNoHover)" : "url(#gradNo)"}
                  onMouseEnter={() => setIsHover(true)}
                  onMouseLeave={() => setIsHover(false)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
