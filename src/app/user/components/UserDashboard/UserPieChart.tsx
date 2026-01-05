"use client";

import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useSalesKpis } from "../../hooks/useUserPieChart";

const COLORS = {
  toBeIssued: "#FF6B6B", // Vibrant coral red
  assigned: "#3B82F6", // Professional blue
  issued: "#FFD93D", // Golden yellow
  packed: "#6C5CE7", // Purple
  dispatched: "#00B894", // Emerald green
};

export default function OrderStatusChart() {
  const { data, totalSoCount, loading } = useSalesKpis();

  const total = Number.isFinite(totalSoCount as number)
    ? (totalSoCount as number)
    : 0;

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          height: "100%",
          minHeight: "520px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <CircularProgress />
        <span style={{ color: "#9ca3af", marginLeft: "12px" }}>
          Loading chart...
        </span>
      </Box>
    );
  }

  // Prepare data for MUI X Charts
  const chartData = [
    {
      id: 0,
      value: data?.toBeIssuedCount ?? 0,
      label: "To be Issued",
      color: COLORS.toBeIssued,
    },
    {
      id: 1,
      value: data?.r105Count ?? 0,
      label: "Assigned (R105)",
      color: COLORS.assigned,
    },
    {
      id: 2,
      value: data?.w105Count ?? 0,
      label: "Issued (W105)",
      color: COLORS.issued,
    },
    {
      id: 3,
      value: data?.f105Count ?? 0,
      label: "Packed (F105)",
      color: COLORS.packed,
    },
    {
      id: 4,
      value: data?.dispatchedSoCount ?? 0,
      label: "Dispatched",
      color: COLORS.dispatched,
    },
  ].filter((item) => item.value > 0); // Filter out zero values for a cleaner chart

  const hasData = chartData.length > 0;

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
        minHeight: "520px",
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
          Current status of all your sales orders (Total:{" "}
          {total.toLocaleString()})
        </p>
      </div>

      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: "320px",
          width: "100%",
        }}
      >
        {hasData ? (
          <PieChart
            series={[
              {
                data: chartData,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                valueFormatter: (item) => {
                  const value = item.value ?? 0;
                  const percentage = total > 0 ? (value / total) * 100 : 0;
                  return `${value.toLocaleString()} orders (${percentage.toFixed(1)}%)`;
                },

                innerRadius: 0,
                paddingAngle: 0,
                cornerRadius: 0,
              },
            ]}
            height={400}
            margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
            }}
          >
            No data available
          </div>
        )}
      </div>
      {/* Custom legend removed – using built-in MUI legend */}
    </div>
  );
}
