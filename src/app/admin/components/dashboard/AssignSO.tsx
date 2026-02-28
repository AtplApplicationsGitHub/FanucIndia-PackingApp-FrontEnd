"use client";

import * as React from "react";
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
  TextField,
  Link as MuiLink,
  alpha,
  useTheme,
  Checkbox,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Link from "next/link";
import { findName, formatDate } from "@/app/admin/components/utils/admin";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { useAssign } from "@/app/admin/components/hooks/UseAssign";
import AssignOrdersToolbar from "./AssignOrdersToolbar";

type InlineEditField = "status" | "priority" | "assignedUserId";

type InlineEdit = {
  id: number;
  field: InlineEditField;
  value: string | number | null;
  original: string | number | null;
} | null;

export default function AssignSO() {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const {
    orders,
    lookup,
    loading,
    error,
    updateInline,
    bulkUpdate,
    bulkImportErpData,
    updateSkipStage,
  } = useAssign();

  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [inlineEdit, setInlineEdit] = React.useState<InlineEdit>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Reset selection when orders change
  React.useEffect(() => {
    setSelectedIds([]);
  }, [orders]);

  // Filter states
  const [searchInput, setSearchInput] = React.useState("");
  const [paymentFilter, setPaymentFilter] = React.useState("");
  const [zoneFilter, setZoneFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const onClear = () => {
    setSearchInput("");
    setPaymentFilter("");
    setZoneFilter("");
    setStatusFilter("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleAssignUser = async (userId: string) => {
    try {
      await bulkUpdate(selectedIds, userId);
      setSnackbar({
        open: true,
        message: `Successfully assigned ${selectedIds.length} orders`,
        severity: "success",
      });
      setSelectedIds([]);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to assign orders",
        severity: "error",
      });
    }
  };

  const handleSkipIssueStage = async (val: string) => {
    const shouldSkip = val === "yes";

    const ordersWithoutData: string[] = [];
    const ordersToUpdate: number[] = [];

    selectedIds.forEach((id) => {
      const order = orders.find((o) => o.id === id);
      if (order) {
        if (!order.hasMaterialData) {
          ordersWithoutData.push(order.saleOrderNumber || String(id));
        } else {
          ordersToUpdate.push(id);
        }
      }
    });

    if (ordersWithoutData.length > 0) {
      setSnackbar({
        open: true,
        message: `Material Data not yet imported for: ${ordersWithoutData.join(", ")}`,
        severity: "info",
      });
    }

    if (ordersToUpdate.length > 0) {
      try {
        await updateSkipStage(ordersToUpdate, shouldSkip);
        setSnackbar({
          open: true,
          message: shouldSkip
            ? `Updated skip issue stage for ${ordersToUpdate.length} orders`
            : `Canceled skip issue stage for ${ordersToUpdate.length} orders`,
          severity: "success",
        });
        setSelectedIds([]);
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err.message || "Failed to update",
          severity: "error",
        });
      }
    }
  };

  const handleImportERPData = async () => {
    if (selectedIds.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one order",
        severity: "warning",
      });
      return;
    }

    const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
    const saleOrderNumbers = selectedOrders
      .map((o) => o.saleOrderNumber)
      .filter((so): so is string => !!so);

    if (saleOrderNumbers.length === 0) {
      setSnackbar({
        open: true,
        message: "No valid Sale Order Numbers found in selection",
        severity: "error",
      });
      return;
    }

    setSnackbar({
      open: true,
      message: `Importing data for ${saleOrderNumbers.length} orders...`,
      severity: "info",
    });

    try {
      const result = await bulkImportErpData(saleOrderNumbers);
      const summary = result.summary || [];

      const failures = summary.filter((s: any) => s.status === "Failed");
      const successes = summary.filter((s: any) => s.status === "Success");
      const skipped = summary.filter((s: any) => s.status === "Skipped");

      if (failures.length > 0) {
        const msg =
          failures.length === 1
            ? failures[0].reason
            : `${failures.length} orders failed to import`;
        setSnackbar({ open: true, message: msg, severity: "error" });
      } else {
        // If no failures, show a clean success message without mentioning skips or "not found"
        const msg =
          successes.length > 0
            ? `Imported ${successes.length} order(s) successfully`
            : "ERP data import process completed";

        setSnackbar({
          open: true,
          message: msg,
          severity: "success",
        });
        setSelectedIds([]);
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Import failed",
        severity: "error",
      });
    }
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const searchStr = searchInput.toLowerCase();
      const matchesSearch =
        !searchInput ||
        order.saleOrderNumber?.toLowerCase().includes(searchStr) ||
        order.outboundDelivery?.toLowerCase().includes(searchStr) ||
        order.customerNameText?.toLowerCase().includes(searchStr);

      const matchesPayment =
        !paymentFilter ||
        (paymentFilter === "true"
          ? order.paymentClearance
          : !order.paymentClearance);

      const matchesZone =
        !zoneFilter || String(order.salesZoneId) === zoneFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "None"
          ? !order.status
          : order.status === statusFilter);

      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = order.deliveryDate
          ? new Date(order.deliveryDate)
          : null;
        if (!orderDate) {
          matchesDate = false;
        } else {
          const d = new Date(orderDate);
          d.setHours(0, 0, 0, 0);

          if (startDate) {
            const s = new Date(startDate);
            s.setHours(0, 0, 0, 0);
            if (d < s) matchesDate = false;
          }
          if (endDate) {
            const e = new Date(endDate);
            e.setHours(0, 0, 0, 0);
            if (d > e) matchesDate = false;
          }
        }
      }

      return (
        matchesSearch &&
        matchesPayment &&
        matchesZone &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    orders,
    searchInput,
    paymentFilter,
    zoneFilter,
    statusFilter,
    startDate,
    endDate,
  ]);

  const handleExcelExport = React.useCallback(async () => {
  const visibleRows = filteredOrders;

  const exportRows =
    selectedIds.length > 0
      ? visibleRows.filter((row) => selectedIds.includes(row.id))
      : visibleRows;

  if (!exportRows.length) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ASSIGN_SO");

  worksheet.columns = [
    { header: "ERP DATA", key: "erpData", width: 15 },
    { header: "PRODUCT", key: "product", width: 20 },
    { header: "SALE ORDER NUMBER", key: "saleOrderNumber", width: 20 },
    { header: "OUT BOUND DELIVERY", key: "outboundDelivery", width: 20 },
    { header: "TRANSFER ORDER", key: "transferOrder", width: 20 },
    { header: "REQUIRED DATE", key: "requiredDate", width: 18 },
    { header: "PAYMENT", key: "payment", width: 12 },
    { header: "SALES ZONE", key: "salesZone", width: 18 },
    { header: "CUSTOMER", key: "customer", width: 25 },
    { header: "STATUS", key: "status", width: 12 },
    { header: "PRIORITY", key: "priority", width: 12 },
    { header: "ASSIGNED USER", key: "assignedUser", width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };

  exportRows.forEach((row) => {
    worksheet.addRow({
      erpData: row.hasMaterialData ? "Imported" : "Pending",
      product:
        row.product?.name ||
        findName(lookup.products, row.productId ?? 0) ||
        "-",
      saleOrderNumber: row.saleOrderNumber || "-",
      outboundDelivery: row.outboundDelivery || "-",
      transferOrder: row.transferOrder || "-",
      requiredDate: row.deliveryDate
        ? formatDate(row.deliveryDate)
        : "-",
      payment: row.paymentClearance ? "Yes" : "No",
      salesZone:
        row.salesZone?.name ||
        findName(lookup.salesZones, row.salesZoneId ?? 0) ||
        "-",
      customer:
        row.customer?.name ||
        row.customerNameText ||
        row.customerName ||
        "-",
      status: row.status ?? "",
      priority: row.priority ?? "",
      assignedUser: row.assignedUser?.name || "-",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `ASSIGN_SO_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;

  saveAs(blob, fileName);
}, [filteredOrders, selectedIds, lookup]);

  const paginatedOrders = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const pageIds = paginatedOrders.map((n) => n.id);
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    } else {
      const pageIds = paginatedOrders.map((n) => n.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const numSelectedOnPage = paginatedOrders.filter((row) =>
    selectedIds.includes(row.id),
  ).length;
  const isAllSelectedOnPage =
    paginatedOrders.length > 0 && numSelectedOnPage === paginatedOrders.length;
  const isIndeterminate =
    numSelectedOnPage > 0 && numSelectedOnPage < paginatedOrders.length;

  const handleInlineSave = (overrideValue?: string | number | null) => {
    if (!inlineEdit) return;

    const normalize = (field: InlineEditField, val: any) => {
      if (field === "priority" || field === "assignedUserId") {
        if (val === "" || val === null || val === undefined) return null;
        const n = Number(val);
        return Number.isNaN(n) ? null : n;
      }
      return typeof val === "string" ? val.trim() : (val ?? "");
    };

    const nextValue = normalize(
      inlineEdit.field,
      overrideValue ?? inlineEdit.value,
    );

    updateInline(inlineEdit.id, inlineEdit.field, nextValue);
    setInlineEdit(null);
  };

  function CustomEditTextField({
    initialValue,
    onCommit,
    onCancel,
  }: {
    initialValue: string | number | null;
    onCommit: (val: string) => void;
    onCancel: () => void;
  }) {
    const [localValue, setLocalValue] = React.useState(initialValue ?? "");

    return (
      <TextField
        value={localValue}
        size="small"
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onCommit(localValue.toString())}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(localValue.toString());
          if (e.key === "Escape") onCancel();
        }}
        autoFocus
        variant="standard"
        sx={{ width: "100%" }}
      />
    );
  }

  React.useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: typeof error === "string" ? error : "An error occurred",
        severity: "error",
      });
    }
  }, [error]);

  return (
    <Box sx={{ width: "100%", borderRadius: 0, overflow: "visible", mt: 0 }}>
      <Box sx={{ mb: 1 }}>
        <AssignOrdersToolbar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          zoneFilter={zoneFilter}
          onZoneFilterChange={setZoneFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          salesZones={lookup.salesZones}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClear={onClear}
          selectedIds={selectedIds}
          assignableUsers={lookup.assignableUsers}
          onAssignUser={handleAssignUser}
          onSkipIssueStage={handleSkipIssueStage}
          onImportERPData={handleImportERPData}
          onExcelExport={handleExcelExport}
        />
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 0, width: "100%", overflowX: "auto" }}
      >
        <Table
          sx={{
            minWidth: 650,
            width: "100%",
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow,
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
            "& .MuiTableCell-root": {
              borderBottom: "none",
              py: 1,
              px: 2,
              fontSize: "0.875rem",
            },
          }}
        >
          <TableHead
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
            }}
          >
            <TableRow sx={{ height: 60 }}>
              <TableCell sx={{ width: 48 }}>
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelectedOnPage}
                  onChange={handleSelectAll}
                  sx={{
                    p: 0.5,
                    color:
                      theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                    "&.Mui-checked": { color: theme.palette.primary.main },
                  }}
                />
              </TableCell>
              {[
                "ERP DATA",
                "PRODUCT",
                "SALE ORDER NUMBER",
                "OUT BOUND DELIVERY",
                "TRANSFER ORDER",
                "REQUIRED DATE",
                "PAYMENT",
                "SALES ZONE",
                "CUSTOMER",
                "STATUS",
                "PRIORITY",
                "ASSIGNED USER",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color:
                      theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  align="center"
                  sx={{
                    bgcolor: lightYellow,
                    py: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((row) => {
                const isDispatched = row.status === "Dispatched";
                // const isAssignedUserLocked = isDispatched || row.status === "F105"; // unused for now

                return (
                  <TableRow
                    key={row.id}
                    selected={selectedIds.includes(row.id)}
                  >
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectOne(row.id)}
                        sx={{ p: 0.5 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Tooltip
                        title={
                          row.hasMaterialData
                            ? "ERP Data Imported"
                            : "Material Data Pending"
                        }
                      >
                        {row.hasMaterialData ? (
                          <CheckCircleIcon
                            sx={{ color: theme.palette.success.main }}
                            fontSize="small"
                          />
                        ) : (
                          <WarningAmberIcon
                            sx={{ color: theme.palette.warning.main }}
                            fontSize="small"
                          />
                        )}
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      {row.product?.name ||
                        findName(lookup.products, row.productId ?? 0) ||
                        "-"}
                    </TableCell>

                    <TableCell>
                      <MuiLink
                        component={Link}
                        href={`/so-search/${row.saleOrderNumber}`}
                        underline="hover"
                        sx={{ fontWeight: 500 }}
                      >
                        {row.saleOrderNumber || "-"}
                      </MuiLink>
                    </TableCell>

                    <TableCell>{row.outboundDelivery || "-"}</TableCell>

                    <TableCell>{row.transferOrder || "-"}</TableCell>

                    <TableCell>
                      {row.deliveryDate ? formatDate(row.deliveryDate) : "-"}
                    </TableCell>

                    <TableCell>{row.paymentClearance ? "Yes" : "No"}</TableCell>

                    <TableCell>
                      {row.salesZone?.name ||
                        findName(lookup.salesZones, row.salesZoneId ?? 0) ||
                        "-"}
                    </TableCell>

                    <TableCell>{row.customerNameText || "-"}</TableCell>

                    <TableCell sx={{ minWidth: 100 }}>
                      <Box>{row.status || "-"}</Box>
                    </TableCell>

                    <TableCell sx={{ minWidth: 80 }}>
                      {inlineEdit?.id === row.id &&
                      inlineEdit.field === "priority" ? (
                        <CustomEditTextField
                          initialValue={inlineEdit.value}
                          onCommit={(val) => handleInlineSave(val)}
                          onCancel={() => setInlineEdit(null)}
                        />
                      ) : (
                        <Box
                          sx={{
                            cursor: isDispatched ? "default" : "pointer",
                            textDecoration: isDispatched
                              ? "none"
                              : "underline dotted",
                          }}
                          onClick={() =>
                            !isDispatched &&
                            setInlineEdit({
                              id: row.id,
                              field: "priority",
                              value: row.priority ?? "",
                              original: row.priority ?? "",
                            })
                          }
                        >
                          {row.priority ?? "-"}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell sx={{ minWidth: 150 }}>
                      {row.assignedUser?.name ||
                        findName(
                          lookup.assignableUsers,
                          row.assignedUserId ?? 0,
                        ) ||
                        "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredOrders.length}
        page={currentPage - 1}
        onPageChange={(_, page) => setCurrentPage(page + 1)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setCurrentPage(1);
        }}
        rowsPerPageOptions={[10, 20, 50]}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
