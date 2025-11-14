"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Box, Typography, Paper } from "@mui/material";
import { useSalesKpis } from "../../components/hooks/OrderStatus";

/* ── Colours ─────────────────────────────── */
const COLORS = ["#3B82F6", "#F97316", "#10B981", "#8B5CF6"] as const;

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  total: number;
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
      <Box
        sx={{
          bgcolor: "background.paper",
          p: 1.25,
          borderRadius: 2,
          boxShadow: 3,
          border: "1px solid",
          borderColor: "divider",
          minWidth: 140,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color={d.color}>
          {d.name}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {d.value.toLocaleString()} orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {pct}% of total
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function OrderStatusChart() {
  const { data, totalSoCount, loading } = useSalesKpis();

  // Safe total orders value
  const total = Number.isFinite(totalSoCount as number)
    ? (totalSoCount as number)
    : 0;

  // Build raw chart data from API (or empty when loading / no data)
  const rawData =
    loading || !data
      ? []
      : [
          {
            name: "Assigned (R105)",
            value: data.r105Count ?? 0,
            color: COLORS[0],
          },
          {
            name: "Issued (W105)",
            value: data.w105Count ?? 0,
            color: COLORS[1],
          },
          {
            name: "Packed (F105)",
            value: data.f105Count ?? 0,
            color: COLORS[2],
          },
          {
            name: "Dispatched",
            value: data.dispatchedSoCount ?? 0,
            color: COLORS[3],
          },
        ];

  // Attach total to each item for percentage calculation
  const chartData: ChartDataItem[] = rawData.map((item) => ({
    ...item,
    total,
  }));

  // Fallback data if everything is zero / empty
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
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        bgcolor: "#F9FAFB",
        borderRadius: 3,
        p: 3,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700}>
          Order Status Distribution
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current status of all your sales orders
        </Typography>
      </Box>

      {/* Chart Container */}
      <Box sx={{ flex: 1, position: "relative", minHeight: 320 }}>
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">Loading chart...</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={displayData} // ✅ always a valid array
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

        {/* Center Text */}
        {!loading && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Typography variant="h5" fontWeight={800} color="#111827">
              {total.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Orders
            </Typography>
          </Box>
        )}
      </Box>

      {/* Legend */}
      {!loading && chartData.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
            mt: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {chartData.map((item) => (
            <Box
              key={item.name}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: item.color,
                  border: "2px solid white",
                  boxShadow: 1,
                }}
              />
              <Typography variant="caption" fontWeight={600}>
                {item.name} ({item.value.toLocaleString()})
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
