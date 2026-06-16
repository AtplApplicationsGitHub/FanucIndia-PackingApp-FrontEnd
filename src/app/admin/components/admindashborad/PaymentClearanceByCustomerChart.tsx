"use client";

import { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { BarChart3 } from "lucide-react";
import { TablePagination } from "@mui/material";
import { usePaymentClearanceByCustomer } from "../hooks/usePaymentClearanceByCustomer";
import { Tooltip, IconButton, Box, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Download } from "lucide-react";
import { exportToExcel } from "@/app/admin/components/utils/exportExcel";

interface CustomerPaymentClearance {
  customerName: string;
  paymentCleared: number;
  paymentPending: number;
}

interface Props {
  selectedDate: string;
  displayDate: string;
}

export default function PaymentClearanceByCustomerChart({
  selectedDate,
  displayDate,
}: Props) {
  const { data, loading, error, refetch } =
    usePaymentClearanceByCustomer(selectedDate);
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const COLORS = {
    cleared: "#00B894",
    pending: "#FF6B6B",
  };

  const chartData = (data || [])
    .map((item: CustomerPaymentClearance) => ({
      customer: item.customerName,
      total: item.paymentCleared + item.paymentPending,
      cleared: item.paymentCleared,
      pending: item.paymentPending,
    }))
    .sort((a, b) => b.total - a.total);

  const paginatedData = chartData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleExport = async () => {
    const formatted = chartData.map((row) => ({
      Customer: row.customer,
      Total: row.total,
      "Payment Cleared": row.cleared,
      "Payment Pending": row.pending,
    }));
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const dt = ist.toISOString().replace(/[-:T]/g, "_").slice(0, 19);
    await exportToExcel(formatted, `PAY_CLEARANCE_CUSTOMER_${dt}`);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <div className="flex items-center justify-center h-96">
          <div className="text-[#4B5563] dark:text-[#E5E7EB] flex items-center gap-3">
            <BarChart3 className="w-6 h-6 animate-spin" />
            Loading payment clearance by customer...
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
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] select-none h-full chart-no-focus">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-2 p-3">
          <h2 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Payment Clearance by Customer ({displayDate})
          </h2>
          <Tooltip title="Export to Excel">
            <IconButton
              onClick={handleExport}
              size="small"
              sx={{
                color: "#10B981",
                bgcolor: alpha("#10B981", 0.1),
                borderRadius: 1.5,
                "&:hover": { bgcolor: alpha("#10B981", 0.2) },
              }}
            >
              <Download size={16} />
            </IconButton>
          </Tooltip>
        </div>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            mt: 1,
            mr: 1,
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
                dataKey: "cleared",
                label: "Payment Cleared",
                color: COLORS.cleared,
              },
              {
                dataKey: "pending",
                label: "Payment Pending",
                color: COLORS.pending,
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
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-t border-[#E5E7EB] dark:border-[#4B5563]">
            <thead className="bg-[#F7F7F7] dark:bg-[#2C3540]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-[#1F2933] dark:text-[#E5E7EB] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 py-2 text-center font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                  Total ({chartData.reduce((sum, row) => sum + row.total, 0)})
                </th>
                <th
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: COLORS.cleared }}
                >
                  Payment Cleared
                </th>
                <th
                  className="px-3 py-2 text-center font-semibold"
                  style={{ color: COLORS.pending }}
                >
                  Payment Pending
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#4B5563]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-gray-500"
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
                    <td className="px-3 py-2 font-medium text-[#1F2933] dark:text-[#E5E7EB]">
                      {row.customer}
                    </td>
                    <td className="px-3 py-2 text-center font-extrabold text-[#7C3AED] dark:text-[#C4B5FD]">
                      {row.total}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold"
                      style={{ color: COLORS.cleared }}
                    >
                      {row.cleared}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold"
                      style={{ color: COLORS.pending }}
                    >
                      {row.pending}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "table" && (
        <div className="flex justify-end border-t border-[#E5E7EB] dark:border-[#4B5563]">
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
