"use client";

import { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { usePaymentClearanceBarchart } from "../hooks/usePaymentClearanceBarchart";
import { BarChart3 } from "lucide-react";
import { Box, Button, TablePagination } from "@mui/material";

type ChartDatum = {
  zone: string;
  cleared: number;
  pending: number;
  total?: number;
};

interface Props {
  selectedDate: string;
  displayDate: string;
}

const formatNumber = (n: number | string) => {
  const num = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString();
};

export default function PaymentClearanceByZone({
  selectedDate,
  displayDate,
}: Props) {
  const {
    data: rawData,
    loading,
    error,
  } = usePaymentClearanceBarchart(selectedDate);
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const data = ((rawData as unknown as ChartDatum[]) ?? [])
    .map((item) => ({ ...item, total: item.cleared + item.pending }))
    .filter((item) => item.cleared > 0 || item.pending > 0)
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0));

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <div className="flex flex-col">
          <h3 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B] mb-2">
            Payment Clearance by Sales Zone
          </h3>
          <div className="w-full h-85 md:h-105 flex items-center justify-center">
            <div className="text-[#4B5563] dark:text-[#E5E7EB] flex items-center gap-3">
              <BarChart3 className="w-6 h-6 animate-spin" />
              Loading chart data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <h3 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B] mb-2">
          Payment Clearance by Sales Zone
        </h3>
        <div className="w-full h-85 md:h-105 flex items-center justify-center text-[#D00000] dark:text-[#FF6B6B]">
          Error loading data: {String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] select-none h-full chart-no-focus">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <p className="text- uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Payment Clearance by Sales Zone ({displayDate})
          </p>
          <p className="text-sm text-[#4B5563] dark:text-[#E5E7EB] mt-1">
            Cleared vs Pending payments across sales zones
          </p>
        </div>

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
            onClick={() => setViewMode("table")}
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
            onClick={() => setViewMode("chart")}
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

      {/* Content */}
      {viewMode === "chart" ? (
        <>
          <style>
            {`
              .chart-no-focus *:focus {
                outline: none !important;
                box-shadow: none !important;
              }
            `}
          </style>
          <div className="h-112.5 -mx-6 -mb-6 text-gray-700 dark:text-gray-200">
            <BarChart
              aria-label="Payment clearance by sales zone"
              dataset={data}
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
                  valueFormatter: (v: number | null) => formatNumber(v ?? 0),
                },
              ]}
              series={[
                {
                  dataKey: "cleared",
                  label: "Yes",
                  valueFormatter: (v: number | null) => formatNumber(v ?? 0),
                  color: "#00B894", // Emerald green matches Orderzone
                },
                {
                  dataKey: "pending",
                  label: "No",
                  valueFormatter: (v: number | null) => formatNumber(v ?? 0),
                  color: "#FF6B6B", // Coral red matches Orderzone
                },
              ]}
              slotProps={{
                legend: {
                  position: { vertical: "bottom", horizontal: "center" },
                  sx: {
                    mt: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    "& .MuiChartsLegend-marker": {
                      borderRadius: "50%",
                      width: 12,
                      height: 12,
                    },
                    "& .MuiChartsLegend-series tspan": {
                      fontSize: 12,
                      fontWeight: 600,
                      fill: "currentColor",
                    },
                    "& .MuiChartsLegend-label": {
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
              }}
              className="dark:text-[#E5E7EB] text-[#4B5563]"
            />
          </div>
        </>
      ) : (
        <div className="overflow-x-auto -mx-6 mt-4">
          <table className="w-full text-sm border-t border-[#E5E7EB] dark:border-[#4B5563]">
            <thead className="bg-[#F7F7F7] dark:bg-[#2C3540]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#1F2933] dark:text-[#E5E7EB] uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-4 text-center font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                  Total
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: "#00B894" }}
                >
                  Yes (Cleared)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: "#FF6B6B" }}
                >
                  No (Pending)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#4B5563]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
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
                    <td className="px-6 py-4 font-medium text-[#1F2933] dark:text-[#E5E7EB]">
                      {row.zone}
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-[#7C3AED] dark:text-[#C4B5FD]">
                      {formatNumber(row.total ?? 0)}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-bold"
                      style={{ color: "#00B894" }}
                    >
                      {formatNumber(row.cleared)}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-bold"
                      style={{ color: "#FF6B6B" }}
                    >
                      {formatNumber(row.pending)}
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
            count={data.length}
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
