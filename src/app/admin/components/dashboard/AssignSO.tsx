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
  MenuItem,
  Select,
  TextField,
  FormControl,
  Link as MuiLink,
  alpha,
  useTheme,
  Checkbox,
  Snackbar,
  Button,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { SalesOrder, Lookup } from "@/app/admin/components/types/admin";
import { findName, formatDate } from "@/app/admin/components/utils/admin";

import { useAssign } from "@/app/admin/components/hooks/UseAssign";
import AdminOrdersToolbar from "./OrdersToolbar";

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

  const { orders, lookup, loading, error, updateInline, bulkUpdate, bulkImportErpData, updateSkipStage } = useAssign();

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

  const [skipIssueStage, setSkipIssueStage] = React.useState("");

  const handleImportERPData = async () => {
    if (selectedIds.length === 0) {
      setSnackbar({ open: true, message: "Please select at least one order", severity: "warning" });
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
      } else if (successes.length > 0) {
        if (skipped.length > 0) {
          setSnackbar({
            open: true,
            message: `Imported ${successes.length} successfully, ${skipped.length} skipped`,
            severity: "warning",
          });
        } else {
          setSnackbar({ open: true, message: "Imported successfully", severity: "success" });
        }
        setSelectedIds([]);
      } else if (skipped.length > 0) {
        const msg =
          skipped.length === 1 ? skipped[0].reason : `${skipped.length} orders skipped`;
        setSnackbar({ open: true, message: msg, severity: "warning" });
        setSelectedIds([]);
      } else {
        setSnackbar({ open: true, message: "Process completed", severity: "success" });
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
        (paymentFilter === "true" ? order.paymentClearance : !order.paymentClearance);

      const matchesZone = !zoneFilter || String(order.salesZoneId) === zoneFilter;

      const matchesStatus = !statusFilter || order.status === statusFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = order.deliveryDate ? new Date(order.deliveryDate) : null;
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

      return matchesSearch && matchesPayment && matchesZone && matchesStatus && matchesDate;
    });
  }, [orders, searchInput, paymentFilter, zoneFilter, statusFilter, startDate, endDate]);

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
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const numSelectedOnPage = paginatedOrders.filter((row) => selectedIds.includes(row.id)).length;
  const isAllSelectedOnPage = paginatedOrders.length > 0 && numSelectedOnPage === paginatedOrders.length;
  const isIndeterminate = numSelectedOnPage > 0 && numSelectedOnPage < paginatedOrders.length;

  const handleInlineSave = (overrideValue?: string | number | null) => {
    if (!inlineEdit) return;

    const normalize = (field: InlineEditField, val: any) => {
      if (field === "priority" || field === "assignedUserId") {
        if (val === "" || val === null || val === undefined) return null;
        const n = Number(val);
        return Number.isNaN(n) ? null : n;
      }
      return typeof val === "string" ? val.trim() : val ?? "";
    };

    const nextValue = normalize(inlineEdit.field, overrideValue ?? inlineEdit.value);

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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Box sx={{ p: 3, textAlign: "center" }}>Loading orders...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Box sx={{ p: 3, textAlign: "center", color: "error.main" }}>Error: {error}</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ mb: 3 }}>
        <AdminOrdersToolbar
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
        />

        {selectedIds.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              mt: 2,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <Select
                value="placeholder"
                displayEmpty
                onChange={async (e) => {
                  const userId = e.target.value;
                  if (userId && userId !== "placeholder") {
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
                  }
                }}
                sx={{
                  height: 44,
                  borderRadius: "8px",
                  bgcolor: "#fdf7e7",
                  border: "1px solid #dcdcdc",
                  fontSize: "14px",
                  fontWeight: 500,
                  "& .MuiSelect-select": { py: 0, px: 2, display: "flex", alignItems: "center" },
                  "& fieldset": { border: "none" },
                }}
              >
                <MenuItem value="placeholder" disabled>
                  Assign {selectedIds.length} selected orders to...
                </MenuItem>
                <MenuItem value="unassign">
                  <em>Unassigned</em>
                </MenuItem>
                {lookup.assignableUsers.map((u: any) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Skip Issue Stage - kept but unused in logic for now */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Box
                sx={{
                  position: "absolute",
                  top: -10,
                  left: 10,
                  bgcolor: "#fff",
                  px: 0.5,
                  color: "#eab308",
                  fontSize: "12px",
                  fontWeight: 600,
                  zIndex: 1,
                }}
              >
                Skip Issue Stage
              </Box>
              <Select
                value={skipIssueStage || "placeholder"} // use placeholder value to allow resetting
                displayEmpty
                onChange={async (e) => {
                   const val = e.target.value;
                   if (val === "placeholder") return;
                   
                   // "yes" -> true, "no" -> false
                   const shouldSkip = val === "yes";
                   setSkipIssueStage(val); 

                   try {
                     await updateSkipStage(selectedIds, shouldSkip);
                     setSnackbar({
                        open: true,
                        message: shouldSkip
                          ? `Updated skip issue stage for ${selectedIds.length} orders`
                          : `Canceled skip issue stage for ${selectedIds.length} orders`,
                        severity: "success",
                     });
                     // Reset selection and dropdown
                     setSelectedIds([]);
                     setSkipIssueStage("");
                   } catch (err: any) {
                      setSnackbar({
                        open: true,
                        message: err.message || "Failed to update",
                        severity: "error",
                      });
                   }
                }}
                sx={{
                  height: 44,
                  borderRadius: "8px",
                  border: "2px solid #eab308",
                  "& fieldset": { border: "none" },
                }}
              >
                <MenuItem value="placeholder" disabled>
                  <em>None</em>
                </MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleImportERPData}
              sx={{
                height: 44,
                borderRadius: "8px",
                bgcolor: "#ffcc00",
                color: "#000",
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "none",
                px: 3,
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                "&:hover": { bgcolor: "#eab308" },
              }}
            >
              Import ERP Data
            </Button>
          </Box>
        )}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
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
                    color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                    "&.Mui-checked": { color: theme.palette.primary.main },
                  }}
                />
              </TableCell>
              {[
                "USER NAME",
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
                    color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
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
            {paginatedOrders.map((row) => {
              const isDispatched = row.status === "Dispatched";
              // const isAssignedUserLocked = isDispatched || row.status === "F105"; // unused for now

              return (
                <TableRow key={row.id} selected={selectedIds.includes(row.id)}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectOne(row.id)}
                        sx={{ p: 0.5 }}
                      />
                      {row.hasMaterialData ? (
                        <CheckCircleIcon color="success" sx={{ fontSize: "1.1rem" }} />
                      ) : (
                        <WarningIcon color="warning" sx={{ fontSize: "1.1rem" }} />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>{row.user?.name || "-"}</TableCell>

                  <TableCell>{row.product?.name || findName(lookup.products, row.productId ?? 0) || "-"}</TableCell>

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

                  <TableCell>{row.deliveryDate ? formatDate(row.deliveryDate) : "-"}</TableCell>

                  <TableCell>{row.paymentClearance ? "Yes" : "No"}</TableCell>

                  <TableCell>
                    {row.salesZone?.name || findName(lookup.salesZones, row.salesZoneId ?? 0) || "-"}
                  </TableCell>

                  <TableCell>{row.customerNameText || "-"}</TableCell>

                  <TableCell sx={{ minWidth: 100 }}>
                    <Box>{row.status || "-"}</Box>
                  </TableCell>

                  <TableCell sx={{ minWidth: 80 }}>
                    {inlineEdit?.id === row.id && inlineEdit.field === "priority" ? (
                      <CustomEditTextField
                        initialValue={inlineEdit.value}
                        onCommit={(val) => handleInlineSave(val)}
                        onCancel={() => setInlineEdit(null)}
                      />
                    ) : (
                      <Box
                        sx={{
                          cursor: isDispatched ? "default" : "pointer",
                          textDecoration: isDispatched ? "none" : "underline dotted",
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
                      findName(lookup.assignableUsers, row.assignedUserId ?? 0) ||
                      "-"}
                  </TableCell>
                </TableRow>
              );
            })}
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