"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import {
  PlusCircle,
  RefreshCcw,
  Download,
  Upload,
  Settings,
} from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import KeyIcon from "@mui/icons-material/Key";
import { authFetch } from "@/common/lib/authFetch";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import LookupCrudTable, {
  LookupRow,
} from "@/app/admin/components/dashboard/LookupCrudTable";
import LookupFormDialog from "@/app/admin/components/dashboard/LookupFormDialog";
import { API_BASE_URL, API } from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";
import {
  Paper,
  useTheme,
  InputBase,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Divider,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AdminManageUsersPanel from "@/app/admin/components/dashboard/UsersPanel";
import { useAdminUsers } from "@/app/admin/components/hooks/useAdminUsers";
import CommonButton from "@/common/components/CommonButton";

const SCHEMA_KEYS: Record<string, string[]> = {
  products: ["id", "name"],
  transporters: ["id", "name"],
  plantCodes: ["id", "code", "description"],
  salesZones: ["id", "name"],
  packConfigs: ["id", "configName"],
  customers: ["id", "name", "address", "contactNumber"],
  printers: ["id", "name"],
  materialBarcodes: [
    "id",
    "erpCode",
    "mappingBarcode",
    "group",
    "acceptBulkData",
    "remarksRequired",
    "classification",
  ],
};

const TYPE_TO_API_PATH: Record<string, string> = {
  products: "products",
  transporters: "transporters",
  plantCodes: "plant-codes",
  salesZones: "sales-zones",
  packConfigs: "pack-configs",
  customers: "customers",
  printers: "printers",
  materialBarcodes: "material-barcodes",
};

type MasterLookupKey = keyof typeof TYPE_TO_API_PATH | "users";

const MASTER_LOOKUP_OPTIONS: { label: string; key: MasterLookupKey }[] = [
  { label: "Products", key: "products" },
  { label: "Transporter", key: "transporters" },
  { label: "Delivery Plant Code", key: "plantCodes" },
  { label: "Sales Zone", key: "salesZones" },
  { label: "Packing Configuration", key: "packConfigs" },
  { label: "Customers", key: "customers" },
  { label: "Printers", key: "printers" },
  { label: "Material Barcode", key: "materialBarcodes" },
  { label: "Users", key: "users" },
];

const TYPE_TO_SHEET_NAME: Record<string, string> = {
  products: "Products",
  transporters: "Transporters",
  plantCodes: "Plant Codes",
  salesZones: "Sales Zones",
  packConfigs: "Packing Configs",
  customers: "Customers",
  printers: "Printers",
  materialBarcodes: "Material Barcodes",
};

export default function AdminMasterLookupPanel() {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<MasterLookupKey>("products");
  const [data, setData] = useState<LookupRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [localSearch, setLocalSearch] = useState("");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedRow, setSelectedRow] = useState<Partial<LookupRow>>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: MasterLookupKey;
    id: number;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [ipDialogOpen, setIpDialogOpen] = useState(false);
  const [printerIp, setPrinterIp] = useState("");
  const [ipFetching, setIpFetching] = useState(false);

  const [orderDeletePasswordDialogOpen, setOrderDeletePasswordDialogOpen] =
    useState(false);
  const [orderDeletePassword, setOrderDeletePassword] = useState("");
  const [orderDeletePasswordOriginal, setOrderDeletePasswordOriginal] =
    useState("");
  const [orderDeletePasswordFetching, setOrderDeletePasswordFetching] =
    useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "error",
  });

  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = "error") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const usersState = useAdminUsers(showSnackbar);
  const { setModalOpen, setEditingUser } = usersState;

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getApiPath = React.useCallback(
    () => TYPE_TO_API_PATH[selectedType] || selectedType,
    [selectedType],
  );

  const fetchData = React.useCallback(async () => {
    if (!selectedType || selectedType === "users") return;
    setLoading(true);
    setError("");
    try {
      const apiPath = getApiPath();
      const res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = (await res.json()) as LookupRow[];
      setData(json);
    } catch {
      setError("Failed to load lookup data.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, getApiPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTypeChange = (newValue: MasterLookupKey) => {
    setSelectedType(newValue);
    setSearchQuery("");
    setLocalSearch("");
  };

  const getSearchKeys = React.useCallback((): string[] => {
    switch (selectedType) {
      case "products":
        return ["name"];
      case "transporters":
        return ["name"];
      case "plantCodes":
        return ["code"];
      case "salesZones":
        return ["name"];
      case "packConfigs":
        return ["configName"];
      case "customers":
        return ["name", "address"];
      case "printers":
        return ["name"];
      case "materialBarcodes":
        return ["erpCode"];
      case "users":
        return ["name"];
      default:
        return ["name"];
    }
  }, [selectedType]);

  const filteredData = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    const keys = getSearchKeys();

    return data.filter((row) =>
      keys.some((key) => {
        const val = row[key];
        return val ? String(val).toLowerCase().includes(query) : false;
      }),
    );
  }, [data, searchQuery, getSearchKeys]);

  const openAddDialog = () => {
    setDialogMode("add");
    setSelectedRow({});
    setDialogOpen(true);
  };

  const openEditDialog = (row: LookupRow) => {
    setDialogMode("edit");
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleDialogSave = async (formData: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const apiPath = getApiPath();
      let res;

      if (dialogMode === "add") {
        res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}`, {
          method: "POST",
          body: JSON.stringify(formData),
        });
      } else {
        const bodyData = { ...formData };
        delete bodyData.id;
        const updateId = selectedRow.id;
        res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}/${updateId}`, {
          method: "PATCH",
          body: JSON.stringify(bodyData),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        if (err.message === "") throw new Error("SILENT_ERROR");
        throw new Error(err.message || "Operation failed");
      }

      showSnackbar("Saved successfully!", "success");
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      if (message !== "SILENT_ERROR") {
        showSnackbar(message, "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestDelete = (id: number) => {
    setDeleteTarget({ type: selectedType, id });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const apiPath = TYPE_TO_API_PATH[deleteTarget.type];
      const res = await authFetch(
        `${API_BASE_URL}/lookup/${apiPath}/${deleteTarget.id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const err = await res.json();
        if (err.message === "") throw new Error("SILENT_ERROR");
        throw new Error(err.message || "Failed to delete");
      }

      showSnackbar("Deleted successfully", "success");
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      if (message !== "SILENT_ERROR") {
        showSnackbar(message, "error");
      }
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setActionLoading(false);
    }
  };

  const openIpConfigDialog = () => {
    setIpDialogOpen(true);
    setPrinterIp("");
    setIpFetching(true);

    (async () => {
      try {
        const res = await authFetch(
          `${API_BASE_URL}/lookup/config/CUSTOMER_LABEL_PRINTER_IP`,
        );
        if (res.ok) {
          const data = await res.json();
          setPrinterIp(data?.value || "");
        } else {
          setPrinterIp("");
        }
      } catch (error) {
        showSnackbar("Failed to fetch current IP config", "error");
      } finally {
        setIpFetching(false);
      }
    })();
  };

  const savePrinterIp = async () => {
    if (!printerIp.trim()) {
      showSnackbar("IP address cannot be empty", "error");
      return;
    }
    setActionLoading(true);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/lookup/config/CUSTOMER_LABEL_PRINTER_IP`,
        {
          method: "PATCH",
          body: JSON.stringify({ value: printerIp.trim() }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        if (err.message === "") throw new Error("SILENT_ERROR");
        throw new Error("Failed to save IP");
      }

      showSnackbar(
        "Customer Label Printer IP updated successfully!",
        "success",
      );
      setIpDialogOpen(false);
    } catch (error: any) {
      if (error.message !== "SILENT_ERROR") {
        showSnackbar("Failed to save configuration", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openOrderDeletePasswordDialog = () => {
    setOrderDeletePasswordDialogOpen(true);
    setOrderDeletePassword("");
    setOrderDeletePasswordOriginal("");
    setOrderDeletePasswordFetching(true);

    (async () => {
      try {
        const res = await authFetch(
          `${API_BASE_URL}/admin/sales-orders/super-password`,
        );
        if (res.ok) {
          const data = await res.json();
          setOrderDeletePassword(data?.password || "");
          setOrderDeletePasswordOriginal(data?.password || "");
        } else {
          setOrderDeletePassword("");
          setOrderDeletePasswordOriginal("");
        }
      } catch (error) {
        showSnackbar("Failed to fetch current Order Delete Password", "error");
      } finally {
        setOrderDeletePasswordFetching(false);
      }
    })();
  };

  const saveOrderDeletePassword = async () => {
    if (!orderDeletePassword.trim()) {
      showSnackbar("Password cannot be empty", "error");
      return;
    }
    setActionLoading(true);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/admin/sales-orders/super-password`,
        {
          method: "POST",
          body: JSON.stringify({ password: orderDeletePassword.trim() }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        if (err.message === "") throw new Error("SILENT_ERROR");
        throw new Error(err.message || "Failed to save password");
      }

      showSnackbar("Order Delete Password updated successfully!", "success");
      setOrderDeletePasswordDialogOpen(false);
    } catch (error: any) {
      if (error.message !== "SILENT_ERROR") {
        showSnackbar(
          error.message || "Failed to save Order Delete Password",
          "error",
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadBulk = async () => {
    try {
      const token = localStorage.getItem("token");
      const sheetName = TYPE_TO_SHEET_NAME[selectedType] ?? "";
      const res = await fetch(`${API.LOOKUP.BULK_TEMPLATE}?type=${sheetName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      secureDownload(blob, `${selectedType}_master_data.xlsx`);
    } catch {
      showSnackbar("Failed to download template", "error");
    }
  };

  const handleUploadBulk = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await fetch(API.LOOKUP.BULK_IMPORT, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      showSnackbar("Bulk import successful!", "success");
      fetchData();
    } catch {
      showSnackbar("Failed to import data", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };
  return (
    <Box
      sx={{
        width: "100%",
        mt: 1,
        px: 1,
        pb: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 2. Modern Action Toolbar (Universal for all tabs) */}
      <Box
        sx={{ display: "flex", width: "100%", justifyContent: "center", mb: 2 }}
      >
        <Paper
          elevation={2}
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          {/* Master Type Dropdown */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedType}
              onChange={(e) =>
                handleTypeChange(e.target.value as MasterLookupKey)
              }
              sx={{
                height: 40,
                fontSize: "14px",
                fontWeight: 600,
                "& .MuiSelect-select": { py: 0.75 },
              }}
            >
              {MASTER_LOOKUP_OPTIONS.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search Bar (Always Visible) */}
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              setSearchQuery(localSearch);
            }}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 280 },
              border: 1,
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.23)"
                  : "#e0e0e0",
              borderRadius: "4px",
              height: 40,
              bgcolor: "background.paper",
              mr: 1,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "14px" }}
              placeholder={
                selectedType === "users"
                  ? "Search users..."
                  : selectedType === "customers"
                    ? "Search name or address..."
                    : `Search ${
                        getSearchKeys()[0] === "erpCode"
                          ? "ERP Code"
                          : getSearchKeys()[0]
                              .replace(/([A-Z])/g, " $1")
                              .toLowerCase()
                      }...`
              }
              inputProps={{ "aria-label": "search" }}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <IconButton
                sx={{ p: "5px" }}
                aria-label="clear"
                onClick={() => {
                  setLocalSearch("");
                  setSearchQuery("");
                }}
              >
                <ClearIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
            <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5, display: { xs: "none", sm: "block" } }}
          />

          {/* Master-Specific Actions (Hidden for Users Tab) */}
          {selectedType !== "users" && (
            <>
              <Tooltip title="Download Template" arrow>
                <IconButton
                  onClick={handleDownloadBulk}
                  sx={{ color: "#10b981" }}
                >
                  <Download size={20} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Upload Bulk Excel" arrow>
                <IconButton component="label" sx={{ color: "#3b82f6" }}>
                  <Upload size={20} />
                  <input
                    type="file"
                    hidden
                    accept=".xlsx"
                    ref={fileInputRef}
                    onChange={handleUploadBulk}
                  />
                </IconButton>
              </Tooltip>

              <Tooltip title="Refresh Data" arrow>
                <IconButton
                  onClick={fetchData}
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  <RefreshCcw size={20} />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* Add New Button (Always Visible) */}
          <Tooltip
            title={selectedType === "users" ? "Add New User" : "Add New Record"}
            arrow
          >
            <IconButton
              onClick={() => {
                if (selectedType === "users") {
                  setEditingUser(null);
                  setModalOpen(true); // <--- Triggers the User Modal instead of Master Modal
                } else {
                  openAddDialog();
                }
              }}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <PlusCircle size={20} />
            </IconButton>
          </Tooltip>

          {/* Order Delete Password (Users Tab Only) */}
          {selectedType === "users" && (
            <Tooltip title="Order Delete Password" arrow>
              <IconButton
                onClick={openOrderDeletePasswordDialog}
                sx={{ color: "#22c55e" }}
              >
                <KeyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Printer-only Actions */}
          {selectedType === "printers" && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, display: { xs: "none", sm: "block" } }}
              />
              <Tooltip title="Customer Label IP Settings" arrow>
                <IconButton
                  onClick={openIpConfigDialog}
                  sx={{ color: "error.main" }}
                >
                  <Settings size={20} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Paper>
      </Box>

      {/* 3. Table or Users Panel */}
      <Box sx={{ width: "100%" }}>
        {selectedType === "users" ? (
          <AdminManageUsersPanel
            showSnackbar={showSnackbar}
            usersState={usersState}
            searchQuery={searchQuery}
          />
        ) : (
          <>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <LookupCrudTable
                data={filteredData}
                explicitKeys={SCHEMA_KEYS[selectedType]}
                onEdit={openEditDialog}
                onRequestDelete={(id) => handleRequestDelete(id)}
                loading={loading}
              />
            )}
          </>
        )}
      </Box>

      {/* Dialogs */}
      {selectedType !== "users" && (
        <>
          <LookupFormDialog
            open={dialogOpen}
            title={(dialogMode === "add"
              ? `Add New ${selectedType.replace(/([A-Z])/g, " $1")}`
              : `Edit ${selectedType.replace(/([A-Z])/g, " $1")}`
            ).toUpperCase()}
            fields={SCHEMA_KEYS[selectedType]?.filter((k) => k !== "id") || []}
            initialValues={selectedRow}
            onClose={() => setDialogOpen(false)}
            onSave={handleDialogSave}
            loading={actionLoading}
          />

          <ConfirmDeleteDialog
            open={deleteDialogOpen}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteDialogOpen(false)}
            loading={actionLoading}
            title="DELETE CONFIRMATION"
            description="Are you sure you want to delete this item?"
          />
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* IP Configuration Dialog */}
      <Dialog
        open={ipDialogOpen}
        onClose={() => setIpDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "20px",
            letterSpacing: 0.5,
            color: "error.main",
            pb: 1,
            position: "relative",
          }}
        >
          CUSTOMER LABEL PRINTER IP
          <IconButton
            aria-label="close"
            onClick={() => setIpDialogOpen(false)}
            size="small"
            sx={{ position: "absolute", right: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={1}>
            <TextField
              autoFocus
              margin="dense"
              size="small"
              label="Printer IP Address"
              type="text"
              fullWidth
              variant="outlined"
              placeholder={ipFetching ? "Loading..." : "Printer IP Address"}
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              disabled={actionLoading || ipFetching}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, gap: 1 }}>
          <CommonButton
            onClick={savePrinterIp}
            disabled={actionLoading || ipFetching}
          >
            {actionLoading ? "SAVING..." : "SAVE"}
          </CommonButton>
        </DialogActions>
      </Dialog>

      {/* Order Delete Password Dialog */}
      <Dialog
        open={orderDeletePasswordDialogOpen}
        onClose={() => setOrderDeletePasswordDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "20px",
            letterSpacing: 0.5,
            color: "error.main",
            pb: 1,
            position: "relative",
          }}
        >
          ORDER DELETE PASSWORD
          <IconButton
            aria-label="close"
            onClick={() => setOrderDeletePasswordDialogOpen(false)}
            size="small"
            sx={{ position: "absolute", right: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={1}>
            <TextField
              autoFocus
              margin="dense"
              size="small"
              label="Order Delete Password"
              type="text"
              fullWidth
              variant="outlined"
              placeholder={
                orderDeletePasswordFetching ? "Loading..." : "Order Delete Password"
              }
              value={orderDeletePassword}
              onChange={(e) => setOrderDeletePassword(e.target.value)}
              disabled={actionLoading || orderDeletePasswordFetching}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, gap: 1 }}>
          <CommonButton
            onClick={saveOrderDeletePassword}
            disabled={
              actionLoading ||
              orderDeletePasswordFetching ||
              orderDeletePassword === orderDeletePasswordOriginal
            }
          >
            {actionLoading ? "SAVING..." : "SAVE"}
          </CommonButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}