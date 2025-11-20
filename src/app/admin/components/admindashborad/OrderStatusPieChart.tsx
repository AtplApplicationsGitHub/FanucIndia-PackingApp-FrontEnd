"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import { useOrderOverallStatus, OrderOverallStatus } from "../hooks/useOrderStatusPieChart";
import { useTheme } from "@mui/material";

type DataItem = {
  name: string;
  value: number;
  code?: string;
  display: string;
  color?: string;
};

// Stable mapping between status -> color & display
const STATUS_CONFIG: Record<
  string,
  { color: string; display: string; code?: string }
> = {
  Assigned: { color: "#3B82F6", display: "Assigned (R105)", code: "R105" }, // Blue
  Issued: { color: "#F97316", display: "Issued (W105)", code: "W105" }, // Orange
  Packed: { color: "#8B5CF6", display: "Packed (F105)", code: "F105" }, // Purple
  Dispatched: { color: "#10B981", display: "Dispatched" }, // Green
};

// Helper to make rgba from hex
const hexToRgba = (hex: string, alpha = 1) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(
    normalized.length === 3
      ? normalized.split("").map((c) => c + c).join("")
      : normalized,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const renderLabel = (entry: { percent?: number }) => {
  const percent = Math.round((entry.percent ?? 0) * 100);
  return percent >= 5 ? `${percent}%` : "";
};

/**
 * Recharts passes an array of payload entries of the form:
 * { payload: <original data item>, name?: string, value?: number }
 * We'll type that structure explicitly and intersect with TooltipProps
 * to satisfy TypeScript without using `any`.
 */
type RechartsTooltipEntry = {
  payload: DataItem;
  name?: string;
  value?: number;
};
type RechartsPayload = RechartsTooltipEntry[];

// Properly typed Custom Tooltip: TooltipProps + explicit payload shape
const CustomTooltip: React.FC<
  TooltipProps<number, string> & { payload?: RechartsPayload }
> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as DataItem;
  const color = data.color || "#000";
  const value = data.value ?? 0;
  const display = data.display ?? data.name;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(0,0,0,0.08)",
        padding: 8,
        borderRadius: 4,
        boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
        fontSize: 13,
        color: "#0f172a",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 12,
            height: 12,
            background: color,
            borderRadius: 2,
            display: "inline-block",
            boxShadow: "0 1px 0 rgba(0,0,0,0.06) inset",
          }}
        />
        <div style={{ fontWeight: 600 }}>{display}</div>
      </div>
      <div style={{ marginTop: 6 }}>
        {value.toLocaleString()} {value === 1 ? "order" : "orders"}
      </div>
    </div>
  );
};

export default function OrderStatusPieChart() {
  const theme = useTheme();
  const { data, loading, error } = useOrderOverallStatus();

  const transformRows = (api: OrderOverallStatus | null): DataItem[] => {
    if (!api) return [];

    return [
      {
        name: "Assigned",
        value: api.r105Count ?? 0,
        code: "R105",
        display: STATUS_CONFIG.Assigned.display,
        color: STATUS_CONFIG.Assigned.color,
      },
      {
        name: "Issued",
        value: api.w105Count ?? 0,
        code: "W105",
        display: STATUS_CONFIG.Issued.display,
        color: STATUS_CONFIG.Issued.color,
      },
      {
        name: "Packed",
        value: api.f105Count ?? 0,
        code: "F105",
        display: STATUS_CONFIG.Packed.display,
        color: STATUS_CONFIG.Packed.color,
      },
      {
        name: "Dispatched",
        value: api.dispatchedCount ?? 0,
        display: STATUS_CONFIG.Dispatched.display,
        color: STATUS_CONFIG.Dispatched.color,
      },
    ];
  };

  if (loading) {
    return (
      <div className="w-full bg-white/90 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800 min-h-[500px] flex items-center justify-center">
        <div className="text-slate-500">Loading order status...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-white/90 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800 min-h-[500px] flex items-center justify-center">
        <div className="text-red-500">Error: {error || "No data"}</div>
      </div>
    );
  }

  const rows = transformRows(data);
  const chartData = rows.filter((r) => r.value > 0);
  const legendRows = rows;

  const total =
    typeof data.totalOrders === "number"
      ? data.totalOrders
      : rows.reduce((s, d) => s + d.value, 0);

  return (
    <div className="w-full">
      <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-md p-8 border border-gray-100 dark:border-slate-800 min-h-[543px]">
        {/* Title & Subtitle */}
        <div className="mb-6">
          <h3 
            className="text-lg uppercase font-semibold"
            style={{ color: theme.palette.secondary.main }}
          >
            Overall Order Status Count
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time breakdown of order lifecycle
          </p>
        </div>

        {/* Chart */}
        <div className="relative h-85 -mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="display"
                cx="50%"
                cy="50%"
                innerRadius={84}
                outerRadius={140}
                paddingAngle={3}
                labelLine={false}
                label={renderLabel}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || STATUS_CONFIG[entry.name]?.color || "#ccc"}
                    stroke="transparent"
                  />
                ))}
              </Pie>

              {/* Center Total */}
              <text
                x="50%"
                y="44%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-800 dark:fill-slate-200 text-3xl font-bold"
              >
                {total.toLocaleString()}
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-500 dark:fill-slate-400 text-sm font-medium"
              >
                Total Orders
              </text>

              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap  gap-5 mt-6 w-full">
          {legendRows.map((r) => {
            const color = r.color || STATUS_CONFIG[r.name]?.color || "#ccc";
            const bg = hexToRgba(color, 0.10);
            const border = hexToRgba(color, 0.20);

            return (
              <span
                key={r.name}
                className="inline-flex items-center gap-2 text-xs px-1 py-1.5 rounded-full shadow-sm w-full sm:w-auto "
                style={{
                  backgroundColor: bg,
                  color: color,
                  border: `1px solid ${border}`,
                  justifyContent: "center",
                  opacity: r.value === 0 ? 0.65 : 1,
                }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {r.display}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
