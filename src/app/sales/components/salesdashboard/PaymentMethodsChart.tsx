// src/app/sales/components/salesdashboard/PaymentMethodsChart.tsx
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Box, Paper, Typography, CircularProgress, Alert } from "@mui/material";
import { usePaymentClearance } from "../hooks/PaymentMethodsChart";

type ChartItem = {
  zone: string;
  cleared: number;
  pending: number;
};

export default function PaymentMethodsChart() {
  const { data, loading, error } = usePaymentClearance();

  const chartData: ChartItem[] | undefined = data?.map((item) => ({
    zone: item.zoneName.replace(" Zone", ""),
    cleared: item.paymentCleared,
    pending: item.paymentPending,
  }));

  // helper to map dataKey -> friendly label
  const friendlyName = (key?: string | number | null) => {
    if (key === undefined || key === null) return "";
    const k = String(key);
    if (k === "cleared") return "Yes";
    if (k === "pending") return "No";
    return k;
  };

  // Formatter typed for numeric values (cleared/pending are numbers)
  const tooltipFormatter: NonNullable<
    TooltipProps<number, string | number>["formatter"]
  > = (value, name) => {
    // value is number (or possibly string depending on Recharts usage) - returning it as ReactNode is fine
    return [value as React.ReactNode, friendlyName(name)];
  };

  return (
    <Paper
      elevation={0}
      sx={{
                padding: "24px",

        borderRadius: "8px",
        height: "100%",
        width: "100%",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#ffffff"
      }}
    >

      <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
        Payment Status by Zone
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Number of cleared vs pending payments across regions
      </Typography>

      <Box sx={{ width: "100%", height: 400, mt: 5 }}>
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="zone"
                tick={{ fill: "#374383", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: "#374383", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                formatter={tooltipFormatter}
                labelFormatter={(label: string) => `Zone: ${label}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (value === "cleared" ? "Yes" : value === "pending" ? "No" : value)}
              />
              <Bar dataKey="cleared" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
}
