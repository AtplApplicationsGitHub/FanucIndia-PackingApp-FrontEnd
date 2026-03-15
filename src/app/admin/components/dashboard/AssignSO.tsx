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
  Select,
  MenuItem,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FlagIcon from "@mui/icons-material/Flag";
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
    uploadExcelUpdates,
    bulkUpdatePriority,
    downloadErpData,
    dynamicCounts,
    fetchDynamicCounts,
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

  // Filter states
  const [searchInput, setSearchInput] = React.useState("");
  const [paymentFilter, setPaymentFilter] = React.useState("");
  const [zoneFilter, setZoneFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | null>(
    dayjs().toDate(),
  );
  const [endDate, setEndDate] = React.useState<Date | null>(dayjs().toDate());
  const [customerFilter, setCustomerFilter] = React.useState("");
  const onClear = () => {
    setSearchInput("");
    setPaymentFilter("");
    setZoneFilter("");
    setStatusFilter("");
    setStartDate(null);
    setEndDate(null);
    setCustomerFilter("");
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExcelImportSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setSnackbar({
      open: true,
      message: "Uploading Excel updates...",
      severity: "info",
    });

    try {
      const result = await uploadExcelUpdates(formData);

      if (!result.success) {
        setSnackbar({
          open: true,
          message: result.message || "Failed to import excel",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: result.message || "Orders updated successfully",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred",
        severity: "error",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAssignUser = async (val: string, priorityVal?: string) => {
    const ordersToAssign: number[] = [];
    const skippedSOs: string[] = [];

    selectedIds.forEach((id) => {
      const order = orders.find((o) => o.id === id);
      if (order) {
        if (order.status === "Dispatched") {
          skippedSOs.push(order.saleOrderNumber || String(id));
        } else {
          ordersToAssign.push(id);
        }
      }
    });

    try {
      if (ordersToAssign.length > 0) {
        await bulkUpdate(ordersToAssign, val, priorityVal);
      }

      const messageParts = [];
      if (ordersToAssign.length > 0) {
        messageParts.push(`Assigned ${ordersToAssign.length} order(s)`);
      }
      if (skippedSOs.length > 0) {
        messageParts.push(
          `Skipped (Already Dispatched): ${skippedSOs.join(", ")}`,
        );
      }

      setSnackbar({
        open: true,
        message: messageParts.join(" | "),
        severity: "info",
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

  const handleSkipStage = async (val: string) => {
    const shouldSkip = val === "yes";
    const skippedSOs: string[] = [];
    const ordersWithoutData: string[] = [];
    const ordersToUpdate: number[] = [];

    selectedIds.forEach((id) => {
      const order = orders.find((o) => o.id === id);
      if (order) {
        if (order.status === "Dispatched") {
          skippedSOs.push(order.saleOrderNumber || String(id));
        } else if (
          shouldSkip &&
          (!order.status || order.status === "R105") &&
          !order.hasMaterialData
        ) {
          ordersWithoutData.push(order.saleOrderNumber || String(id));
        } else {
          ordersToUpdate.push(id);
        }
      }
    });

    try {
      if (ordersToUpdate.length > 0) {
        await updateSkipStage(ordersToUpdate, shouldSkip);
      }

      const messageParts = [];
      if (ordersToUpdate.length > 0) {
        messageParts.push(
          shouldSkip
            ? `Updated skip stage for ${ordersToUpdate.length} order(s)`
            : `Canceled skip stage for ${ordersToUpdate.length} order(s)`,
        );
      }
      if (ordersWithoutData.length > 0) {
        messageParts.push(
          `Material Data Pending: ${ordersWithoutData.join(", ")}`,
        );
      }
      if (skippedSOs.length > 0) {
        messageParts.push(`Skipped (Already Packed): ${skippedSOs.join(", ")}`);
      }

      setSnackbar({
        open: true,
        message: messageParts.join(" | "),
        severity: "info",
      });
      setSelectedIds([]);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update",
        severity: "error",
      });
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

    const validSaleOrderNumbers: string[] = [];
    const skippedSOs: string[] = [];

    selectedIds.forEach((id) => {
      const order = orders.find((o) => o.id === id);
      if (order && order.saleOrderNumber) {
        if (order.status === "Dispatched") {
          skippedSOs.push(order.saleOrderNumber);
        } else {
          validSaleOrderNumbers.push(order.saleOrderNumber);
        }
      }
    });

    // If ALL selected orders have crossed packing stage
    if (validSaleOrderNumbers.length === 0 && skippedSOs.length > 0) {
      setSnackbar({
        open: true,
        message: `Skipped (Packing Completed): ${skippedSOs.join(", ")}`,
        severity: "warning",
      });
      return;
    }

    setSnackbar({
      open: true,
      message: `Importing data for ${validSaleOrderNumbers.length} orders...`,
      severity: "info",
    });

    try {
      const result = await bulkImportErpData(validSaleOrderNumbers);
      const summary = result.summary || [];

      const failures = summary.filter((s: any) => s.status === "Failed");
      const successes = summary.filter((s: any) => s.status === "Success");
      const skipped = summary.filter((s: any) => s.status === "Skipped");

      // Construct combined message (incorporating the logic we added in the previous step)
      const messageParts = [];
      if (successes.length > 0) {
        messageParts.push(
          `Success: ${successes.map((s: any) => s.soNumber).join(", ")}`,
        );
      }
      if (skipped.length > 0) {
        messageParts.push(
          `Skipped ERP: ${skipped.map((s: any) => s.soNumber).join(", ")}`,
        );
      }
      if (failures.length > 0) {
        messageParts.push(
          `Failed: ${failures.map((s: any) => s.soNumber).join(", ")}`,
        );
      }
      if (skippedSOs.length > 0) {
        messageParts.push(
          `Skipped (Packing Completed): ${skippedSOs.join(", ")}`,
        );
      }

      setSnackbar({
        open: true,
        message: messageParts.join(" | "),
        severity: "info",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Import failed",
        severity: "error",
      });
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchDynamicCounts({
        search: searchInput,
        paymentFilter,
        zoneFilter,
        statusFilter,
        customerFilter,
        startDate,
        endDate
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, paymentFilter, zoneFilter, statusFilter, customerFilter, startDate, endDate, fetchDynamicCounts]);

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const searchStr = searchInput.toLowerCase();

      const productName = (
        order.product?.name ||
        findName(lookup.products, order.productId ?? 0) ||
        ""
      ).toLowerCase();
      const salesZoneName = (
        order.salesZone?.name ||
        findName(lookup.salesZones, order.salesZoneId ?? 0) ||
        ""
      ).toLowerCase();
      const assignedUserName = (
        order.assignedUser?.name ||
        findName(lookup.assignableUsers, order.assignedUserId ?? 0) ||
        ""
      ).toLowerCase();

      const paymentString = order.paymentClearance ? "yes" : "no";

      const matchesSearch =
        !searchInput ||
        (order.saleOrderNumber || "").toLowerCase().includes(searchStr) ||
        (order.outboundDelivery || "").toLowerCase().includes(searchStr) ||
        (order.customerNameText || "").toLowerCase().includes(searchStr) ||
        (order.transferOrder || "").toLowerCase().includes(searchStr) ||
        (order.status || "").toLowerCase().includes(searchStr) ||
        (order.priority !== null && order.priority !== undefined
          ? String(order.priority)
          : ""
        ).includes(searchStr) ||
        productName.includes(searchStr) ||
        salesZoneName.includes(searchStr) ||
        assignedUserName.includes(searchStr) ||
        paymentString.includes(searchStr);

      const matchesPayment =
        !paymentFilter ||
        (paymentFilter === "true"
          ? order.paymentClearance
          : !order.paymentClearance);

      const matchesZone =
        !zoneFilter || String(order.salesZoneId) === zoneFilter;

      const selectedCustomerName = customerFilter
        ? (
            lookup.customers.find((c) => String(c.id) === customerFilter)
              ?.name || ""
          ).toLowerCase()
        : "";

      const matchesCustomer =
        !customerFilter ||
        (order.customerNameText || "").toLowerCase() === selectedCustomerName;

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
        matchesDate &&
        matchesCustomer
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
    customerFilter,
    lookup.customers,
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
      { header: "PRODUCT", key: "product", width: 20 },
      { header: "SALE ORDER NUMBER", key: "saleOrderNumber", width: 20 },
      { header: "OUT BOUND DELIVERY", key: "outboundDelivery", width: 20 },
      { header: "TRANSFER ORDER", key: "transferOrder", width: 20 },
      { header: "DELIVERY DATE", key: "deliveryDate", width: 18 },
      { header: "TRANSPORTER", key: "transporter", width: 20 },
      { header: "PLANT CODE", key: "plantCode", width: 15 },
      { header: "PAYMENT CLEARANCE", key: "payment", width: 18 },
      { header: "PACKING CONFIG", key: "packingConfig", width: 20 },
      { header: "SPECIAL REMARKS", key: "specialRemarks", width: 25 },
      { header: "ADDITIONAL REMARKS", key: "additionalRemarks", width: 25 },
      { header: "LABEL REMARKS", key: "labelRemarks", width: 25 },
      { header: "PRIORITY", key: "priority", width: 12 },
      { header: "ASSIGNED USER", key: "assignedUser", width: 20 },
      { header: "SKIP ISSUE STAGE", key: "skipIssueStage", width: 18 },
      { header: "SKIP PACKING STAGE", key: "skipPackingStage", width: 18 },
    ];

    worksheet.getRow(1).font = { bold: true };

    exportRows.forEach((row: any) => {
      const clearHyphen = (val: any) => (val === "-" ? "" : val || "");
      const isSkipped = row.skipIssueStage ? "Yes" : "No";

      worksheet.addRow({
        product:
          row.product?.name ||
          findName(lookup.products, row.productId ?? 0) ||
          "",
        saleOrderNumber: clearHyphen(row.saleOrderNumber),
        outboundDelivery: clearHyphen(row.outboundDelivery),
        transferOrder: clearHyphen(row.transferOrder),
        deliveryDate: row.deliveryDate ? formatDate(row.deliveryDate) : "",
        transporter: clearHyphen(row.transporter?.name),
        plantCode: clearHyphen(row.plantCode),
        payment: row.paymentClearance ? "Yes" : "No",
        packingConfig: clearHyphen(row.packConfig?.configName),
        specialRemarks: clearHyphen(row.specialRemarks),
        additionalRemarks: clearHyphen(row.additionalRemarks),
        labelRemarks: clearHyphen(row.labelRemarks),
        priority: row.priority ?? "",
        assignedUser: clearHyphen(row.assignedUser?.name),
        skipIssueStage: isSkipped,
        skipPackingStage: isSkipped,
      });
    });

    const assignableUserNames =
      lookup.assignableUsers?.map((u: any) => u.name).join(",") || "Unassigned";
    const packConfigNames =
      lookup.packConfigs?.map((p: any) => p.configName).join(",") || "Default";

    for (let i = 2; i <= exportRows.length + 1; i++) {
      const paymentCell = worksheet.getCell(`H${i}`);
      paymentCell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"Yes,No"'],
      };

      if (assignableUserNames.length < 255) {
        const userCell = worksheet.getCell(`N${i}`);
        userCell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${assignableUserNames}"`],
        };
      }

      if (packConfigNames.length < 255) {
        const packCell = worksheet.getCell(`I${i}`);
        packCell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${packConfigNames}"`],
        };
      }

      const skipIssueCell = worksheet.getCell(`O${i}`);
      skipIssueCell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"Yes,No"'],
      };

      const skipPackingCell = worksheet.getCell(`P${i}`);
      skipPackingCell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"Yes,No"'],
      };
    }

    await worksheet.protect("admin_dims_2026", {
      selectLockedCells: true,
      selectUnlockedCells: true,
    });

    // 2. Define which columns should be strictly Read-Only
    const readOnlyColumns = ["PRODUCT", "SALE ORDER NUMBER", "TRANSFER ORDER"];

    // 3. Iterate through all columns and unlock the ones that are NOT in the readOnly array
    worksheet.columns.forEach((column) => {
      const headerName = column.header ? column.header.toString() : "";
      const isReadOnly = readOnlyColumns.includes(headerName);

      column.eachCell!({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) {
          // Always lock the header row so titles can't be changed
          cell.protection = { locked: true };
        } else {
          // Lock or unlock based on the column name
          cell.protection = { locked: isReadOnly };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `ASSIGN_SO_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
  }, [filteredOrders, selectedIds, lookup]);

  const paginatedOrders = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allFilteredIds = filteredOrders.map((n) => n.id);
      setSelectedIds((prev) => [...new Set([...prev, ...allFilteredIds])]);
    } else {
      const allFilteredIds = filteredOrders.map((n) => n.id);
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  // Count how many of the FILTERED items are currently selected
  const numSelectedTotal = filteredOrders.filter((row) =>
    selectedIds.includes(row.id),
  ).length;

  // Checkbox is checked if ALL filtered items are selected
  const isAllSelected =
    filteredOrders.length > 0 && numSelectedTotal === filteredOrders.length;

  // Checkbox shows a dash (-) if only SOME filtered items are selected
  const isIndeterminate =
    numSelectedTotal > 0 && numSelectedTotal < filteredOrders.length;

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

  function CustomEditSelect({
    initialValue,
    onCommit,
    onCancel,
    options,
  }: {
    initialValue: string | number | null;
    onCommit: (val: string | number) => void;
    onCancel: () => void;
    options: { id: number; name: string }[];
  }) {
    const [localValue, setLocalValue] = React.useState(initialValue ?? "");

    return (
      <Select
        value={localValue === null ? "" : localValue}
        size="small"
        onChange={(e) => {
          const val = e.target.value;
          setLocalValue(val as string);
          onCommit(val as string);
        }}
        onBlur={onCancel}
        autoFocus
        variant="standard"
        sx={{ width: "100%", fontSize: "0.875rem" }}
      >
        <MenuItem value="">Unassigned</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            {opt.name}
          </MenuItem>
        ))}
      </Select>
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

  const handleDownloadErpData = async () => {
    if (selectedIds.length === 0) {
      setSnackbar({ open: true, message: "Please select at least one order", severity: "warning" });
      return;
    }

    const validSaleOrderNumbers: string[] = [];
    const skippedSOs: string[] = []; // Orders that already have data imported

    selectedIds.forEach((id) => {
      const order = orders.find((o) => o.id === id);
      if (order && order.saleOrderNumber) {
        if (order.hasMaterialData) {
          skippedSOs.push(order.saleOrderNumber); // Skip if green tick exists
        } else {
          validSaleOrderNumbers.push(order.saleOrderNumber);
        }
      }
    });

    if (validSaleOrderNumbers.length === 0 && skippedSOs.length > 0) {
      setSnackbar({ open: true, message: "Selected orders already have ERP data imported.", severity: "warning" });
      return;
    }

    setSnackbar({ open: true, message: `Downloading ERP data for ${validSaleOrderNumbers.length} orders...`, severity: "info" });

    try {
      const result = await downloadErpData(validSaleOrderNumbers);

      if (!result.success) {
        setSnackbar({ open: true, message: result.message || "Download failed", severity: "error" });
        return;
      }

      const downloadedCount = validSaleOrderNumbers.length - result.missingSOs.length;
      let msg = downloadedCount > 0 ? `Successfully downloaded data for ${downloadedCount} orders.` : '';
      
      if (result.missingSOs.length > 0) {
        msg += ` Data not available for the SO(s): ${result.missingSOs.join(", ")}`;
      }

      setSnackbar({
        open: true,
        message: msg.trim(),
        severity: result.missingSOs.length === validSaleOrderNumbers.length ? "error" : "success"
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Failed to download ERP data", severity: "error" });
    }
  };

  return (
    <Box sx={{ width: "100%", borderRadius: 0, overflow: "visible", mt: 0 }}>
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleExcelImportSelect}
      />
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
          customerFilter={customerFilter}
          onCustomerFilterChange={setCustomerFilter}
          customers={lookup.customers}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClear={onClear}
          selectedIds={selectedIds}
          assignableUsers={lookup.assignableUsers}
          onAssignUser={handleAssignUser}
          onSkipStage={handleSkipStage}
          onImportERPData={handleImportERPData}
          onDownloadErpData={handleDownloadErpData}
          onExcelExport={handleExcelExport}
          onExcelImport={() => fileInputRef.current?.click()}
          statusCounts={dynamicCounts}
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
              py: 0.5,
              px: 1,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
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
                  checked={isAllSelected}
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
                "SALE ORDER NUMBER",
                "OUT BOUND DELIVERY",
                "TRANSFER ORDER",
                "REQUIRED DATE",
                "PAYMENT",
                "SALES ZONE",
                "CUSTOMER",
                "STATUS",
                "A/D/F",
                "BIN",
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
                  colSpan={13}
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
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleSelectOne(row.id)}
                          sx={{ p: 0.5 }}
                        />
                        <Tooltip
                          title={
                            row.hasMaterialData
                              ? "ERP Data Imported"
                              : "Material Data Pending"
                          }
                        >
                          {row.hasMaterialData ? (
                            <CheckCircleOutlineIcon
                              sx={{ color: theme.palette.success.main, ml: 1 }}
                              fontSize="small"
                            />
                          ) : (
                            <ErrorOutlineIcon
                              sx={{ color: theme.palette.warning.main, ml: 1 }}
                              fontSize="small"
                            />
                          )}
                        </Tooltip>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {row.skipIssueStage ? (
                          <Tooltip title="Skip Stages">
                            <FlagIcon
                              sx={{ color: theme.palette.error.main }}
                              fontSize="small"
                            />
                          </Tooltip>
                        ) : (
                          <FlagIcon
                            sx={{ visibility: "hidden" }}
                            fontSize="small"
                          />
                        )}
                        <MuiLink
                          component={Link}
                          href={`/so-search/${row.saleOrderNumber}`}
                          underline="hover"
                          sx={{ fontWeight: 500 }}
                        >
                          {row.saleOrderNumber || "-"}
                        </MuiLink>
                      </Box>
                    </TableCell>

                    <TableCell>{row.outboundDelivery || "-"}</TableCell>

                    <TableCell>{row.transferOrder || "-"}</TableCell>

                    <TableCell>
                      {row.deliveryDate ? formatDate(row.deliveryDate) : "-"}
                    </TableCell>

                    <TableCell>
                      {row.paymentClearance ? (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "3px 10px",
                            borderRadius: "16px",
                            border: "1px solid",
                            borderColor: alpha(theme.palette.success.main, 0.5),
                            backgroundColor: alpha(
                              theme.palette.success.main,
                              0.1,
                            ),
                            color: theme.palette.success.dark,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            minWidth: "50px",
                          }}
                        >
                          Yes
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "3px 10px",
                            borderRadius: "16px",
                            border: "1px solid",
                            borderColor: alpha(theme.palette.error.main, 0.5),
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              0.1,
                            ),
                            color: theme.palette.error.main,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            minWidth: "50px",
                          }}
                        >
                          No
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.salesZone?.name ||
                        findName(lookup.salesZones, row.salesZoneId ?? 0) ||
                        "-"}
                    </TableCell>

                    <TableCell>{row.customerNameText || "-"}</TableCell>

                    <TableCell sx={{ minWidth: 100 }}>
                      {(() => {
                        if (!row.status) return <Box>-</Box>;
                        let colorMain = theme.palette.grey[500];
                        let label = row.status;
                        if (row.status === "R105") {
                          colorMain = "#3b82f6";
                          label = "R105";
                        } else if (row.status === "W105") {
                          colorMain = "#eab308";
                          label = "W105";
                        } else if (row.status === "Dispatched") {
                          colorMain = "#10b981";
                          label = "Dispatched";
                        }

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
                                colorMain === "#eab308" ? "#b45309" : colorMain,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              minWidth: "50px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {label}
                          </Box>
                        );
                      })()}
                    </TableCell>

                    <TableCell sx={{ minWidth: 100 }}>
                      {row.materialData?.[0]?.A_D_F || "-"}
                    </TableCell>

                    <TableCell sx={{ minWidth: 60 }}>
                      {row.binCount ?? "-"}
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
                      {inlineEdit?.id === row.id &&
                      inlineEdit.field === "assignedUserId" ? (
                        <CustomEditSelect
                          initialValue={inlineEdit.value}
                          onCommit={(val: string | number) =>
                            handleInlineSave(val)
                          }
                          onCancel={() => setInlineEdit(null)}
                          options={lookup.assignableUsers || []}
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
                              field: "assignedUserId",
                              value: row.assignedUserId ?? "",
                              original: row.assignedUserId ?? "",
                            })
                          }
                        >
                          {row.assignedUser?.name ||
                            findName(
                              lookup.assignableUsers,
                              row.assignedUserId ?? 0,
                            ) ||
                            "-"}
                        </Box>
                      )}
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
