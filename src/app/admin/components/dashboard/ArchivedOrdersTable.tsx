"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";
import { Link as MuiLink } from "@mui/material";
import Link from "next/link";
import AdminOrdersToolbar from "@/app/admin/components/dashboard/OrdersToolbar";
import { useArchivedOrders } from "@/app/admin/components/hooks/useArchivedOrders";
import { formatDate, formatDateTime } from "@/app/admin/components/utils/admin";
import { exportToExcel } from "@/app/admin/components/utils/exportExcel";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { format } from "date-fns";

export default function ArchivedOrdersTable() {
  const [filters, setFilters] = useState({
    search: "",
    paymentFilter: "",
    zoneFilter: "",
    // statusFilter: "",
    startDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ) as Date | null,
    endDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ) as Date | null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { orders, rowCount, lookup, loading } = useArchivedOrders({
    ...filters,
    page: currentPage,
    limit: pageSize,
  });
  const setSearch = (val: string) => {
    setFilters((f) => ({ ...f, search: val.trim().replace(/\s+/g, " ") }));
    setCurrentPage(1);
  };

  const setPaymentFilter = (val: string) => {
    setFilters((f) => ({ ...f, paymentFilter: val }));
    setCurrentPage(1);
  };

  const setZoneFilter = (val: string) => {
    setFilters((f) => ({ ...f, zoneFilter: val }));
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      // Fetch all filtered rows for export, bypassing pagination
      const url = API.ADMIN.ARCHIVED_ORDERS({
        page: 1,
        limit: 1000000,
        search: filters.search || undefined,
        paymentFilter: filters.paymentFilter || undefined,
        zoneFilter: filters.zoneFilter || undefined,
        startDate: filters.startDate
          ? format(filters.startDate, "yyyy-MM-dd")
          : undefined,
        endDate: filters.endDate
          ? format(filters.endDate, "yyyy-MM-dd")
          : undefined,
      });

      const res = await fetchWithAuth(url);
      const json = await res.json();

      const formatted = (json.data || []).map((row: any) => ({
        PRODUCT: row.product,
        "SALE ORDER NUMBER": row.saleOrderNumber,
        "OUT BOUND DELIVERY": row.outboundDelivery || "-",
        "TRANSFER ORDER": row.transferOrder || "-",
        "REQUIRED DATE": row.requiredDate
          ? format(new Date(row.requiredDate), "dd-MM-yyyy")
          : "-",
        PAYMENT: row.payment ? "Yes" : "No",
        "SALES ZONE": row.salesZone,
        CUSTOMER: row.customer,
        STATUS: row.status || "-",
        "ARCHIVED AT": format(new Date(row.archivedAt), "dd-MM-yyyy HH:mm"),
      }));

      await exportToExcel(
        formatted,
        `Archived_Data_${new Date().toISOString().split("T")[0]}`,
      );
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const setStartDate = (val: Date | null) => {
    setFilters((f) => ({ ...f, startDate: val }));
    setCurrentPage(1);
  };

  const setEndDate = (val: Date | null) => {
    setFilters((f) => ({ ...f, endDate: val }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      paymentFilter: "",
      zoneFilter: "",
      // statusFilter: "",
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
  };
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* TOOLBAR */}
      <AdminOrdersToolbar
        searchInput={filters.search}
        onSearchInputChange={setSearch}
        paymentFilter={filters.paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        zoneFilter={filters.zoneFilter}
        onZoneFilterChange={setZoneFilter}
        // statusFilter={filters.statusFilter}
        // onStatusFilterChange={setStatusFilter}
        salesZones={lookup.salesZones}
        startDate={filters.startDate}
        onStartDateChange={setStartDate}
        endDate={filters.endDate}
        onEndDateChange={setEndDate}
        onClear={clearFilters}
        onExport={handleExport}
        isArchiveView={true}
      />

      {/* TABLE */}
      <Box sx={{ mt: 2, px: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table
            sx={{
              minWidth: 650,
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                backgroundColor: lightYellow,
              },
              "& .MuiTableBody-root .MuiTableRow-root:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
              "& .MuiTableCell-root": {
                borderBottom: "none",
                py: 0.5,
                px: 1,
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableHead
              sx={{ bgcolor: theme.palette.mode === "dark" ? "#000" : "#fff" }}
            >
              <TableRow sx={{ height: 60 }}>
                {[
                  "PRODUCT",
                  "SALE ORDER NUMBER",
                  "OUT BOUND DELIVERY",
                  "TRANSFER ORDER",
                  "REQUIRED DATE",
                  "PAYMENT",
                  "SALES ZONE",
                  "CUSTOMER",
                  "STATUS",
                  "ARCHIVED AT",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>
                    <MuiLink
                      component={Link}
                      href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? "/" + row.outboundDelivery : ""}`}
                      underline="hover"
                      sx={{ fontWeight: 500 }}
                    >
                      {row.saleOrderNumber}
                    </MuiLink>
                  </TableCell>
                  <TableCell>{row.outboundDelivery ?? "-"}</TableCell>
                  <TableCell>{row.transferOrder ?? "-"}</TableCell>
                  <TableCell>
                    {row.requiredDate ? formatDate(row.requiredDate) : "-"}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "3px 10px",
                        borderRadius: "16px",
                        border: "1px solid",
                        minWidth: "50px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderColor: alpha(
                          row.payment
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          0.5,
                        ),
                        backgroundColor: alpha(
                          row.payment
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          0.1,
                        ),
                        color:
                          theme.palette.mode === "dark"
                            ? "#ffffff"
                            : row.payment
                              ? theme.palette.success.dark
                              : theme.palette.error.main,
                      }}
                    >
                      {row.payment ? "Yes" : "No"}
                    </Box>
                  </TableCell>
                  <TableCell>{row.salesZone}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>
                    {(() => {
                      if (!row.status) return <>-</>;
                      const colorMap: Record<string, string> = {
                        R105: "#3b82f6",
                        W105: "#eab308",
                        F105: "#8b5cf6",
                        Dispatched: "#10b981",
                      };
                      const colorMain =
                        colorMap[row.status] ?? theme.palette.grey[500];
                      return (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "3px 10px",
                            borderRadius: "16px",
                            border: "1px solid",
                            borderColor: alpha(colorMain, 0.5),
                            backgroundColor: alpha(colorMain, 0.1),
                            color:
                              theme.palette.mode === "dark"
                                ? "#ffffff"
                                : colorMain === "#eab308"
                                  ? "#b45309"
                                  : colorMain,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            minWidth: "50px",
                          }}
                        >
                          {row.status}
                        </Box>
                      );
                    })()}
                  </TableCell>

                  <TableCell sx={{ color: "text.secondary" }}>
                    {formatDateTime(row.archivedAt)}
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    {loading ? "Loading..." : "No archived orders found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={rowCount}
          page={currentPage - 1}
          onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setCurrentPage(1);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        />
      </Box>
    </Box>
  );
}
