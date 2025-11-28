"use client";

import React, { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { usePaymentClearance } from "../hooks/PaymentMethodsChart";

type ChartItem = {
  zone: string;
  cleared: number;
  pending: number;
};

export default function PaymentMethodsChart() {
  const theme = useTheme();
  const { data, loading, error } = usePaymentClearance();

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

  const seriesValueFormatter = (value: number | null) => formatNumber(value ?? 0);

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
          <BarChart
            aria-label="Bar chart showing cleared vs pending payments by zone"
            dataset={chartData}
            height={350}
            margin={{ top: 20, right: 80, bottom: 70, left: 80 }}
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
                label: friendlyName("cleared"),
                valueFormatter: (v: number | null) => seriesValueFormatter(v),
                color: "#10B981", // green (Yes)
              },
              {
                dataKey: "pending",
                label: friendlyName("pending"),
                valueFormatter: (v: number | null) => seriesValueFormatter(v),
                color: "#EF4444", // red (No)
              },
            ]}
            slotProps={{
              legend: {
                position: { vertical: "bottom", horizontal: "center" },
                sx: {
                  mt: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  "& .MuiChartsLegend-series tspan": {
                    fontSize: 12,
                  },
                },
              },
            }}
          />
        )}
      </Box>
    </Paper>
  );
}
