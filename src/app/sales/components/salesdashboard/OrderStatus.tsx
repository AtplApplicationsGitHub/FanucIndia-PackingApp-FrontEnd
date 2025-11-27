"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Typography } from "@mui/material";
import { useSalesKpis } from "../../components/hooks/OrderStatus";

//
// Color palette (matches image):
// To be Issued = Indigo, Assigned = Blue, Issued = Orange, Packed = Purple, Dispatched = Green
//
const COLORS = ["#6366F1", "#3B82F6", "#F97316", "#8B5CF6", "#10B981"] as const;

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  total: number;
  [key: string]: unknown;
}

interface TooltipPayloadItem {
  payload?: ChartDataItem;
  name?: string;
  value?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload?.length) {
    const first = payload[0];

    const d: ChartDataItem = first.payload ?? {
      name: first.name ?? "Unknown",
      value: first.value ?? 0,
      color: COLORS[0],
      total: 0,
    };

    const pct = d.total ? ((d.value / d.total) * 100).toFixed(1) : "0";

    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "10px 12px",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          minWidth: "140px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <span
          style={{
            display: "block",
            fontWeight: 700,
            fontSize: "14px",
            color: d.color,
            marginBottom: "4px",
          }}
        >
          {d.name}
        </span>
        <span
          style={{
            display: "block",
            fontWeight: 600,
            fontSize: "13px",
            marginBottom: "2px",
          }}
        >
          {d.value.toLocaleString()} orders
        </span>
        <span
          style={{
            display: "block",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          {pct}% of total
        </span>
      </div>
    );
  }
  return null;
};

export default function OrderStatusChart() {
  const { data, totalSoCount, loading } = useSalesKpis();

  const total = Number.isFinite(totalSoCount as number)
    ? (totalSoCount as number)
    : 0;

  const rawData =
    loading || !data
      ? []
      : [
          {
            name: "To be Issued",
            value: data.toBeIssuedCount ?? 0,
            color: COLORS[0], // Indigo
          },
          {
            name: "Assigned (R105)",
            value: data.r105Count ?? 0,
            color: COLORS[0], // Blue
          },
          {
            name: "Issued (W105)",
            value: data.w105Count ?? 0,
            color: COLORS[1], // Orange
          },
          {
            name: "Packed (F105)",
            value: data.f105Count ?? 0,
            color: COLORS[2], // Purple
          },
          {
            name: "Dispatched",
            value: data.dispatchedSoCount ?? 0,
            color: COLORS[3], // Green
          },
        ];

  const chartData: ChartDataItem[] = rawData.map((item) => ({
    ...item,
    total,
  }));

  const displayData: ChartDataItem[] =
    chartData.length > 0 && chartData.some((d) => d.value > 0)
      ? chartData
      : [
          {
            name: "No data",
            value: 1,
            color: "#E5E7EB",
            total: 1,
          },
        ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "secondary.main",
          }}
        >
          Order Status Distribution
        </Typography>

        <p
          style={{
            margin: "4px 0 0",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Current status of all your sales orders
        </p>
      </div>

      <div style={{ flex: 1, position: "relative", minHeight: "320px" }}>
        {loading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#9ca3af" }}>Loading chart...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={displayData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={72}
                paddingAngle={2}
                labelLine={false}
                isAnimationActive={false}
              >
                {displayData.map((entry, i) => (
                  <Cell
                    key={`cell-${entry.name}-${i}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {!loading && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {total.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Total Orders
            </span>
          </div>
        )}
      </div>

      {/* Legend pills — order & colors now match the chart */}
      <div className="flex flex-wrap justify-center gap-5 mt-8">
        <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
          <span className="w-3 h-3 rounded-full bg-[#6366F1]" />
          To be Issued
        </span>

        <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 shadow-sm">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          Assigned (R105)
        </span>

        <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
          <span className="w-3 h-3 rounded-full bg-[#F97316]" />
          Issued (W105)
        </span>

        <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
          <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
          Packed (F105)
        </span>

        <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
          <span className="w-3 h-3 rounded-full bg-[#10B981]" />
          Dispatched
        </span>
      </div>
    </div>
  );
}
