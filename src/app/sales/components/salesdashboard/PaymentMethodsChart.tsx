// src/app/sales/components/salesdashboard/PaymentMethodsChart.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  Chip,
} from "@mui/material";
import { usePaymentClearance } from "../hooks/PaymentMethodsChart";

type ChartItem = {
  zone: string;
  cleared: number;
  pending: number;
};

/**
 * Types for Recharts payload entries we use.
 * Keep payload content generic but typed as Record<string, unknown> (no `any`).
 */
type RechartsPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: number;
  payload?: Record<string, unknown>;
};

type RechartsPayload = RechartsPayloadItem[];

/**
 * Props handed to our custom tooltip component
 */
type CustomTooltipProps = {
  active?: boolean;
  payload?: RechartsPayload;
  label?: string | number;
};

/**
 * Props handed to the custom legend component
 */
type LegendPayloadItem = {
  dataKey: string;
  value: number;
};

type CustomLegendProps = {
  payload?: LegendPayloadItem[] | undefined;
};

export default function PaymentMethodsChart() {
  const theme = useTheme();
  const { data, loading, error } = usePaymentClearance();
  const [isHover, setIsHover] = useState(false);

  const chartData: ChartItem[] | undefined = useMemo(
    () =>
      data?.map((item) => ({
        zone: item.zoneName?.replace?.(" Zone", "") ?? item.zoneName ?? "",
        cleared: Number(item.paymentCleared ?? 0),
        pending: Number(item.paymentPending ?? 0),
      })),
    [data]
  );

  const friendlyName = (key?: string | number | null) => {
    if (key === undefined || key === null) return "";
    const k = String(key);
    if (k === "cleared") return "Yes";
    if (k === "pending") return "No";
    return k;
  };

  const formatNumber = (n: number | string) => {
    const num = typeof n === "number" ? n : Number(n);
    if (Number.isNaN(num)) return String(n);
    return num.toLocaleString();
  };

  // Tooltip formatter — typed precisely
  const tooltipFormatter = (value: number | string, name: string) => {
    return [formatNumber(value as number), friendlyName(name)];
  };

  // Custom tooltip — typed without `any`
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const clearedItem = payload.find((p) => p.dataKey === "cleared");
    const pendingItem = payload.find((p) => p.dataKey === "pending");
    const cleared = clearedItem?.value ?? 0;
    const pending = pendingItem?.value ?? 0;

    return (
      <Box
        sx={{
          minWidth: 140,
          background: theme.palette.background.paper,
          borderRadius: 1.5,
          p: 1.5,
          boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
          fontSize: "0.875rem",
          color: "text.primary",
        }}
      >
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}>
          Zone: {label}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: 1.5,
                background: isHover ? "linear-gradient(90deg,#059669,#047857)" : "#10B981",
                boxShadow: "0 1px 4px rgba(16,185,129,0.18)",
                display: "inline-block",
              }}
            />
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
              Yes: <strong style={{ color: "#059669" }}>{formatNumber(cleared)}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: 1.5,
                background: isHover
                  ? "linear-gradient(90deg,#DC2626,#B91C1C)"
                  : "#EF4444",
                boxShadow: "0 1px 4px rgba(239,68,68,0.18)",
                display: "inline-block",
              }}
            />
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
              No: <strong style={{ color: "#DC2626" }}>{formatNumber(pending)}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
    const clearedItem = payload?.find((p) => p.dataKey === "cleared") ?? null;
    const pendingItem = payload?.find((p) => p.dataKey === "pending") ?? null;

    const pillBase = {
      borderRadius: "9999px",
      padding: "6px 14px",
      minWidth: 64,
      height: 32,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
      textTransform: "none",
    } as const;

    return (
      <Box
        role="group"
        aria-label="Payment status legend"
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 2,
          paddingBottom: 1,
        }}
      >
        <Chip
          label={friendlyName(clearedItem?.dataKey ?? "cleared")}
          variant="filled"
          sx={{
            ...pillBase,
            backgroundColor: "#D1FAE5",
            color: "#059669",
            border: "1px solid rgba(5,150,105,0.08)",
            boxShadow: "0px 1px 0px rgba(5,150,105,0.06)",
          }}
          aria-label={`Cleared payments (${formatNumber(clearedItem?.value ?? 0)})`}
        />

        <Chip
          label={friendlyName(pendingItem?.dataKey ?? "pending")}
          variant="filled"
          sx={{
            ...pillBase,
            backgroundColor: "#FEE2E2",
            color: "#B91C1C",
            border: "1px solid rgba(185,28,28,0.06)",
            boxShadow: "0px 1px 0px rgba(185,28,28,0.04)",
          }}
          aria-label={`Pending payments (${formatNumber(pendingItem?.value ?? 0)})`}
        />
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        padding: "24px",
        borderRadius: "8px",
        height: "100%",
        width: "100%",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        backgroundColor: theme.palette.background.paper,
      }}
      aria-label="Payment methods chart card"
    >
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
        Payment Status by Zone
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Number of cleared vs pending payments across regions
      </Typography>

      <Box sx={{ width: "100%", height: 400, mt: 5 }} aria-live="polite">
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (!chartData || chartData.length === 0) && (
          <Typography color="text.secondary" textAlign="center" mt={4}>
            No payment data available.
          </Typography>
        )}

        {!loading && chartData && chartData.length > 0 && (
          // Use a stable numeric height to avoid layout warnings in some environments
          <ResponsiveContainer width="100%" height="130%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              aria-label="Bar chart showing cleared vs pending payments by zone"
            >
              <defs>
                <linearGradient id="clearedNormal" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="clearedHover" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#059669" stopOpacity="1" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="pendingNormal" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F87171" stopOpacity="1" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="pendingHover" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity="1" />
                  <stop offset="100%" stopColor="#B91C1C" stopOpacity="1" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="zone"
                tick={{ fill: "#374383", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "#374383", fontSize: 12 }}
                tickFormatter={(v) => formatNumber(v)}
                width={72}
              />

              <Tooltip
                content={<CustomTooltip />}
                formatter={tooltipFormatter}
                labelFormatter={(l: unknown) => `${l}`}
              />

              {/* Cleared (Yes) */}
              <Bar
                dataKey="cleared"
                name="Yes"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
              >
                {chartData.map((_, idx) => (
                  <Cell
                    key={`cleared-${idx}`}
                    fill={isHover ? "url(#clearedHover)" : "url(#clearedNormal)"}
                  />
                ))}
              </Bar>

              {/* Pending (No) */}
              <Bar
                dataKey="pending"
                name="No"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
              >
                {chartData.map((_, idx) => (
                  <Cell
                    key={`pending-${idx}`}
                    fill={isHover ? "url(#pendingHover)" : "url(#pendingNormal)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>

      {!loading && chartData && chartData.length > 0 && (
        <Box>
          <LegendPillsFromData data={chartData} CustomLegend={CustomLegend} />
        </Box>
      )}
    </Paper>
  );
}

const LegendPillsFromData: React.FC<{
  data: ChartItem[];
  CustomLegend: React.FC<CustomLegendProps>;
}> = ({ data, CustomLegend }) => {
  const totalCleared = data.reduce((s, d) => s + (d.cleared ?? 0), 0);
  const totalPending = data.reduce((s, d) => s + (d.pending ?? 0), 0);

  const payload: LegendPayloadItem[] = [
    { dataKey: "cleared", value: totalCleared },
    { dataKey: "pending", value: totalPending },
  ];

  return <CustomLegend payload={payload} />;
};
