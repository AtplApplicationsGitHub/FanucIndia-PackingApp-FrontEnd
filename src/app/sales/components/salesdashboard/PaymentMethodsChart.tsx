"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Box, Typography, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from "@mui/material";

export default function PaymentMethodsChart({ selectedDate, displayDate }: { selectedDate: string, displayDate: string }) {
  const [chartData, setChartData] = useState<{ cleared: number; pending: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API.DASHBOARD.SALES_PAYMENT_CLEARANCE}?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          const zoneData = data.length > 0 ? data[0] : { paymentCleared: 0, paymentPending: 0 };
          setChartData({
            cleared: zoneData.paymentCleared,
            pending: zoneData.paymentPending,
          });
        }
      } catch (error) {
        console.error("Error loading payment clearance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 1,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 350,
      }}
    >
      {/* HEADER WITH TOGGLE BUTTONS */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0 }}>
        <Box>
          <p className="text- uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Payment Clearance ({displayDate})
          </p>
        </Box>

        {/* Toggle Switch */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            p: 0.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={() => setViewType("table")}
            disableRipple
            size="small"
            sx={{
              px: 1.6,
              py: 0.65,
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: 1.5,
              textTransform: "none",
              minWidth: "unset",
              bgcolor: viewType === "table" ? "background.paper" : "transparent",
              color: viewType === "table" ? "#D00000" : "text.secondary",
              boxShadow: viewType === "table" ? 1 : "none",
              "&:hover": {
                bgcolor: viewType === "table" ? "background.paper" : "transparent",
                color: viewType === "table" ? "#D00000" : "text.primary",
              },
            }}
          >
            Table
          </Button>
          <Button
            onClick={() => setViewType("chart")}
            disableRipple
            size="small"
            sx={{
              px: 1.6,
              py: 0.65,
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: 1.5,
              textTransform: "none",
              minWidth: "unset",
              bgcolor: viewType === "chart" ? "background.paper" : "transparent",
              color: viewType === "chart" ? "#D00000" : "text.secondary",
              boxShadow: viewType === "chart" ? 1 : "none",
              "&:hover": {
                bgcolor: viewType === "chart" ? "background.paper" : "transparent",
                color: viewType === "chart" ? "#D00000" : "text.primary",
              },
            }}
          >
            Chart
          </Button>
        </Box>
      </Box>

      {/* CONTENT AREA */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: 250,
        }}
      >
        {loading ? (
          <CircularProgress size={30} />
        ) : !chartData ? (
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        ) : viewType === "chart" ? (
          <BarChart
            xAxis={[{ scaleType: "band", data: ["Payment Status"] }]}
            series={[
              { data: [chartData.cleared], label: "Cleared", color: "#22C55E" },
              { data: [chartData.pending], label: "Pending", color: "#EF4444" },
            ]}
            slotProps={{
              legend: { position: { vertical: "bottom", horizontal: "center" } },
            }}
            margin={{ top: 10, bottom: 50, left: 40, right: 10 }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <TableContainer
              component={Paper}
              elevation={1}
              sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell
                      sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}
                    >
                      Payment Status
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}
                    >
                      Count
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.2s" }}>
                    <TableCell sx={{ fontWeight: 500, color: "#22C55E" }}>YES</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {chartData.cleared.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ "&:hover": { bgcolor: "action.hover" }, transition: "background-color 0.2s" }}>
                    <TableCell sx={{ fontWeight: 500, color: "#EF4444" }}>NO</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {chartData.pending.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Total Orders</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {(chartData.cleared + chartData.pending).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
}