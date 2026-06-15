"use client";

import { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { BarChart3 } from "lucide-react";
import {
  useOrderZoneBarChart,
  ZoneStatus,
} from "../hooks/useOrderzoneBarchart";
import { Box, Button, TablePagination } from "@mui/material";

interface Props {
  selectedDate: string;
  displayDate: string;
}

export default function OrderStatusByZone({
  selectedDate,
  displayDate,
}: Props) {
  const { data, loading, error, refetch } = useOrderZoneBarChart(selectedDate);
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const COLORS = {
    toBeIssued: "#FF6B6B",
    assigned: "#3B82F6",
    issued: "#D97706",
    packed: "#6C5CE7",
    dispatched: "#00B894",
  };

  const chartData = (data || [])
    .map((item: ZoneStatus) => {
      const toBeIssued = item.toBeIssuedCount;
      const assigned = item.r105Count;
      const issued = item.w105Count;
      const packed = item.f105Count;
      const dispatched = item.dispatchedCount;
      return {
        zone: item.zoneName,
        total: toBeIssued + assigned + issued + packed + dispatched,
        toBeIssued,
        assigned,
        issued,
        packed,
        dispatched,
      };
    })
    .filter(
      (item) =>
        item.toBeIssued > 0 ||
        item.assigned > 0 ||
        item.issued > 0 ||
        item.packed > 0 ||
        item.dispatched > 0,
    )
    .sort((a, b) => b.total - a.total);

  const paginatedData = chartData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <div className="flex items-center justify-center h-96">
          <div className="text-[#4B5563] dark:text-[#E5E7EB] flex items-center gap-3">
            <BarChart3 className="w-6 h-6 animate-spin" />
            Loading order status by zone...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <div className="text-center">
          <p className="text-[#D00000] dark:text-red-400 mb-4">
            Error loading data: {error}
          </p>
          <button
            onClick={refetch}
            className="px-5 py-2 bg-[#D00000] text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-5 border border-[#E5E7EB] dark:border-[#4B5563] select-none h-full chart-no-focus">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Order Status by Sales Zone ({displayDate})
          </h2>
        </div>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={() => {
              setViewMode("table");
              setPage(0);
            }}
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
              bgcolor:
                viewMode === "table" ? "background.paper" : "transparent",
              color: viewMode === "table" ? "#D00000" : "text.secondary",
              boxShadow: viewMode === "table" ? 1 : "none",
              "&:hover": {
                bgcolor:
                  viewMode === "table" ? "background.paper" : "transparent",
                color: viewMode === "table" ? "#D00000" : "text.primary",
              },
            }}
          >
            Table
          </Button>
          <Button
            onClick={() => {
              setViewMode("chart");
              setPage(0);
            }}
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
              bgcolor:
                viewMode === "chart" ? "background.paper" : "transparent",
              color: viewMode === "chart" ? "#D00000" : "text.secondary",
              boxShadow: viewMode === "chart" ? 1 : "none",
              "&:hover": {
                bgcolor:
                  viewMode === "chart" ? "background.paper" : "transparent",
                color: viewMode === "chart" ? "#D00000" : "text.primary",
              },
            }}
          >
            Chart
          </Button>
        </Box>
      </div>

      {/* Chart View */}
      {viewMode === "chart" ? (
        <>
          <style>
            {`
              /* Remove yellow border when clicking chart */
              .chart-no-focus *:focus {
                outline: none !important;
                box-shadow: none !important;
              }
            `}
          </style>

          <div className="h-112.5 -mx-6 -mb-6 text-gray-700 dark:text-gray-200">
            <BarChart
              aria-label="Order status by sales zone"
              dataset={chartData}
              height={380}
              margin={{ top: 20, right: 40, left: 50, bottom: 60 }}
              xAxis={[
                {
                  dataKey: "zone",
                  scaleType: "band",
                  tickLabelStyle: {
                    angle: 0,
                    textAnchor: "middle",
                    fontSize: 12,
                  },
                },
              ]}
              yAxis={[
                {
                  scaleType: "linear",
                  tickMinStep: 1,
                },
              ]}
              series={[
                {
                  dataKey: "toBeIssued",
                  label: "To be Issued",
                  color: COLORS.toBeIssued,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "assigned",
                  label: "Assigned (R105)",
                  color: COLORS.assigned,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "issued",
                  label: "Issued (W105)",
                  color: COLORS.issued,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "packed",
                  label: "Packed (F105)",
                  color: COLORS.packed,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
                {
                  dataKey: "dispatched",
                  label: "Dispatched",
                  color: COLORS.dispatched,
                  valueFormatter: (v: number | null) => (v ?? 0).toString(),
                },
              ]}
              slotProps={{
                legend: {
                  position: { vertical: "bottom", horizontal: "center" },
                  sx: {
                    gap: 2, // Use gap in sx if it's a flex container, or rely on default spacing
                    "& .MuiChartsLegend-label": {
                      fontSize: 12,
                      fontWeight: 600,
                      fill: "currentColor",
                    },
                  },
                },
              }}
              sx={{
                "& .MuiChartsAxis-tickLabel": {
                  fill: "currentColor !important",
                },
                "& .MuiChartsAxis-line": {
                  stroke: "currentColor !important",
                },
                "& .MuiChartsAxis-tick": {
                  stroke: "currentColor !important",
                },
                "& .MuiChartsLegend-label": {
                  fill: "currentColor !important",
                },
              }}
              className="dark:text-[#E5E7EB] text-[#4B5563]"
            />
          </div>
        </>
      ) : (
        /* Table View */
        <div className="overflow-x-auto -mx-5 mt-2">
          <table className="w-full text-sm border-t border-[#E5E7EB] dark:border-[#4B5563]">
            <thead className="bg-[#F7F7F7] dark:bg-[#2C3540]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-[#1F2933] dark:text-[#E5E7EB] uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-3 py-2 text-center font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                  Total
                </th>
                <th
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: COLORS.toBeIssued }}
                >
                  To be Issued
                </th>
                <th
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: COLORS.assigned }}
                >
                  Assigned (R105)
                </th>
                <th
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: COLORS.issued }}
                >
                  Issued (W105)
                </th>
                <th
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: COLORS.packed }}
                >
                  Packed (F105)
                </th>
                <th
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: COLORS.dispatched }}
                >
                  Dispatched
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#4B5563]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.zone}
                    className="hover:bg-[#F7F7F7] dark:hover:bg-[#2C3540] transition bg-white dark:bg-[#1F2933]"
                  >
                    <td className="px-3 py-2 font-medium text-[#1F2933] dark:text-[#E5E7EB]">
                      {row.zone}
                    </td>
                    <td className="px-3 py-2 text-center font-extrabold text-[#7C3AED] dark:text-[#C4B5FD]">
                      {row.total}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold"
                      style={{ color: COLORS.toBeIssued }}
                    >
                      {row.toBeIssued}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold"
                      style={{ color: COLORS.assigned }}
                    >
                      {row.assigned}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold"
                      style={{ color: COLORS.issued }}
                    >
                      {row.issued}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold"
                      style={{ color: COLORS.packed }}
                    >
                      {row.packed}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold"
                      style={{ color: COLORS.dispatched }}
                    >
                      {row.dispatched}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {viewMode === "table" && (
        <div className="flex justify-end pt-2 border-t border-[#E5E7EB] dark:border-[#4B5563] mt-2">
          <TablePagination
            component="div"
            count={chartData.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            sx={{ color: "text.primary" }}
          />
        </div>
      )}
    </div>
  );
}
