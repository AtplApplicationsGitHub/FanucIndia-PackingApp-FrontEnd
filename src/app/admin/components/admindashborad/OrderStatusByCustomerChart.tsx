"use client";

import { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { BarChart3 } from "lucide-react";
import { TablePagination } from "@mui/material";
import { useOrderStatusByCustomer } from "../hooks/useOrderStatusByCustomer";
import { Box, Button } from "@mui/material";

interface CustomerOrderStatus {
  customerName: string;
  toBeIssuedCount: number;
  r105Count: number;
  w105Count: number;
  f105Count: number;
  dispatchedCount: number;
}

interface Props {
  selectedDate: string;
  displayDate: string;
}

export default function OrderStatusByCustomerChart({
  selectedDate,
  displayDate,
}: Props) {
  const { data, loading, error, refetch } =
    useOrderStatusByCustomer(selectedDate);
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

  const chartData = (data || []).map((item: CustomerOrderStatus) => ({
    customer: item.customerName,
    toBeIssued: item.toBeIssuedCount,
    assigned: item.r105Count,
    issued: item.w105Count,
    packed: item.f105Count,
    dispatched: item.dispatchedCount,
  }));

  // Apply Pagination Slice
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
            Loading order status by customer...
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
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] select-none h-full chart-no-focus">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Order Status by Customer ({displayDate})
          </h2>
          <p className="text-sm text-[#4B5563] dark:text-[#E5E7EB] mt-1">
            Top volume customers — Assigned, Issued, Packed, Dispatched
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

      {viewMode === "chart" ? (
        <div className="h-112.5 -mx-6 -mb-6 text-gray-700 dark:text-gray-200">
          <BarChart
            dataset={chartData}
            height={380}
            margin={{ top: 20, right: 40, left: 50, bottom: 60 }}
            xAxis={[
              {
                dataKey: "customer",
                scaleType: "band",
                tickLabelStyle: {
                  angle: 0,
                  textAnchor: "middle",
                  fontSize: 11,
                },
              },
            ]}
            series={[
              {
                dataKey: "toBeIssued",
                label: "To be Issued",
                color: COLORS.toBeIssued,
              },
              {
                dataKey: "assigned",
                label: "Assigned",
                color: COLORS.assigned,
              },
              { dataKey: "issued", label: "Issued", color: COLORS.issued },
              { dataKey: "packed", label: "Packed", color: COLORS.packed },
              {
                dataKey: "dispatched",
                label: "Dispatched",
                color: COLORS.dispatched,
              },
            ]}
            slotProps={{
              legend: {
                position: { vertical: "bottom", horizontal: "center" },
              },
            }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 mt-4">
          <table className="w-full text-sm border-t border-[#E5E7EB] dark:border-[#4B5563]">
            <thead className="bg-[#F7F7F7] dark:bg-[#2C3540]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#1F2933] dark:text-[#E5E7EB] uppercase tracking-wider">
                  Customer
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.toBeIssued }}
                >
                  To be Issued
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.assigned }}
                >
                  Assigned (R105)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.issued }}
                >
                  Issued (W105)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
                  style={{ color: COLORS.packed }}
                >
                  Packed (F105)
                </th>
                <th
                  className="px-6 py-4 text-center font-semibold"
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
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={`${row.customer}-${page}-${index}`}
                    className="hover:bg-[#F7F7F7] dark:hover:bg-[#2C3540] transition bg-white dark:bg-[#1F2933]"
                  >
                    <td className="px-6 py-4 font-medium text-[#1F2933] dark:text-[#E5E7EB]">
                      {row.customer}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-bold"
                      style={{ color: COLORS.toBeIssued }}
                    >
                      {row.toBeIssued}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-bold"
                      style={{ color: COLORS.assigned }}
                    >
                      {row.assigned}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-bold"
                      style={{ color: COLORS.issued }}
                    >
                      {row.issued}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-bold"
                      style={{ color: COLORS.packed }}
                    >
                      {row.packed}
                    </td>
                    <td
                      className="px-6 py-4 text-center font-bold"
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
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ color: "text.primary" }}
          />
        </div>
      )}
    </div>
  );
}
