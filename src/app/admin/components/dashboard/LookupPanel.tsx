"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import {
  CloudDownload,
  CloudUpload,
  PlusCircle,
  Plus,
  RefreshCcw,
  Download,
  Upload,
  Settings,
} from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { authFetch } from "@/common/lib/authFetch";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import LookupCrudTable, {
  LookupRow,
} from "@/app/admin/components/dashboard/LookupCrudTable";
import LookupFormDialog from "@/app/admin/components/dashboard/LookupFormDialog";
import { API_BASE_URL, API } from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";
import {
  Button,
  Paper,
  useTheme,
  InputBase,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AdminManageUsersPanel from "@/app/admin/components/dashboard/UsersPanel";
import { useAdminUsers } from "@/app/admin/components/hooks/useAdminUsers";
import CommonButton from "@/common/components/CommonButton";

// UPDATED: Products removed "code"
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

type MasterLookupKey =
  | keyof typeof TYPE_TO_API_PATH
  | "users"
  | "superPassword";

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
  { label: "SUPER PASSWORD", key: "superPassword" },
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

function SuperPasswordDialog({
  open,
  onClose,
  showSnackbar,
}: {
  open: boolean;
  onClose: () => void;
  showSnackbar: (msg: string, sev: AlertColor) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear inputs whenever the dialog opens/closes
  useEffect(() => {
    if (open) {
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  // Dynamic Validation Logic
  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isSubmitDisabled =
    !newPassword || !confirmPassword || passwordMismatch || loading;

  const handleUpdate = async () => {
    if (passwordMismatch) return;
    setLoading(true);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/admin/sales-orders/super-password`,
        {
          method: "POST",
          body: JSON.stringify({ password: newPassword }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update password");
      }
      showSnackbar("Super Password updated successfully!", "success");
      onClose(); // Close the modal upon success
    } catch (error: any) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
        SUPER ADMIN PASSWORD
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Retype New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            size="small"
            error={passwordMismatch} // Turns red if mismatch
            helperText={passwordMismatch ? "Passwords do not match" : ""} // Shows error text
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "flex-end" }}>
        <CommonButton onClick={handleUpdate} disabled={isSubmitDisabled}>
          {loading ? "UPDATING..." : "UPDATE"}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}

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
  const [superPasswordDialogOpen, setSuperPasswordDialogOpen] = useState(false);

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
    if (
      !selectedType ||
      selectedType === "users" ||
      selectedType === "superPassword"
    )
      return;
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

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: MasterLookupKey,
  ) => {
    if (newValue === "superPassword") {
      setSuperPasswordDialogOpen(true);
      return;
    }
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

  const openIpConfigDialog = async () => {
    setActionLoading(true);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/lookup/config/CUSTOMER_LABEL_PRINTER_IP`,
      );
      if (res.ok) {
        const data = await res.json();
        setPrinterIp(data?.value || "");
      } else {
        setPrinterIp(""); // Default if it doesn't exist yet
      }
      setIpDialogOpen(true);
    } catch (error) {
      showSnackbar("Failed to fetch current IP config", "error");
    } finally {
      setActionLoading(false);
    }
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
      {/* 1. Centered Tabs with Action Button on Right (Responsive) */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          mb: 2,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: { xs: "100%", md: "80%" },
            borderRadius: 1,
            bgcolor: theme.palette.primary.main,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            px: 2,
          }}
        >
          <Tabs
            value={selectedType}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="inherit"
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                fontWeight: 700,
                fontSize: 14,
                color: "#000",
                opacity: 0.6,
                minHeight: 48,
                "&.Mui-selected": {
                  opacity: 1,
                },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#000",
                height: 3,
              },
            }}
          >
            {MASTER_LOOKUP_OPTIONS.map((option) => (
              <Tab key={option.key} label={option.label} value={option.key} />
            ))}
          </Tabs>
        </Paper>

        {selectedType === "users" && (
          <Box
            sx={{
              position: { xs: "static", lg: "absolute" },
              right: { lg: 20 },
              top: { lg: "50%" },
              transform: { lg: "translateY(-50%)" },
              mt: { xs: 1.5, lg: 0 },
              width: { xs: "100%", lg: "auto" },
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CommonButton
              startIcon={<Plus size={18} />}
              onClick={() => {
                setEditingUser(null);
                setModalOpen(true);
              }}
            >
              NEW USER
            </CommonButton>
          </Box>
        )}
      </Box>

      {/* 2. Action Buttons (Moved Below Tabs - Hidden for Users as it has its own) */}
      {selectedType !== "users" && selectedType !== "superPassword" && (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 1.5 }}
        >
          <Paper
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              setSearchQuery(localSearch);
            }}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 250 },
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "none",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder={
                selectedType === "customers"
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
            {localSearch && ( // <--- Check localSearch instead
              <IconButton
                sx={{ p: "10px" }}
                aria-label="clear"
                onClick={() => {
                  setLocalSearch(""); // <--- Clear local state
                  setSearchQuery(""); // <--- Clear actual filter
                }}
              >
                <ClearIcon />
              </IconButton>
            )}
            <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          <CommonButton
            startIcon={<CloudDownload size={18} />}
            onClick={handleDownloadBulk}
          >
            DOWNLOAD TEMPLATE
          </CommonButton>
          <CommonButton component="label" startIcon={<CloudUpload size={18} />}>
            UPLOAD BULK
            <input
              type="file"
              hidden
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleUploadBulk}
            />
          </CommonButton>
          <CommonButton
            startIcon={<PlusCircle size={18} />}
            onClick={openAddDialog}
          >
            ADD NEW
          </CommonButton>
          <CommonButton
            startIcon={<RefreshCcw size={18} />}
            onClick={fetchData}
          >
            REFRESH
          </CommonButton>
          {selectedType === "printers" && (
            <CommonButton
              startIcon={<Settings size={18} />}
              onClick={openIpConfigDialog}
            >
              CUSTOMER LABEL IP
            </CommonButton>
          )}
        </Box>
      )}

      {/* 3. Table or Users Panel */}
      <Box sx={{ width: "100%" }}>
        {selectedType === "users" ? (
          <AdminManageUsersPanel
            showSnackbar={showSnackbar}
            usersState={usersState}
          />
        ) : (
          <>
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <LookupCrudTable
                data={filteredData}
                explicitKeys={SCHEMA_KEYS[selectedType]}
                onEdit={openEditDialog}
                onRequestDelete={(id) => handleRequestDelete(id)}
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
              placeholder="Printer IP Address"
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              disabled={actionLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, gap: 1 }}>
          <CommonButton onClick={savePrinterIp} disabled={actionLoading}>
            {actionLoading ? "SAVING..." : "SAVE"}
          </CommonButton>
        </DialogActions>
      </Dialog>

      <SuperPasswordDialog
        open={superPasswordDialogOpen}
        onClose={() => setSuperPasswordDialogOpen(false)}
        showSnackbar={showSnackbar}
      />
    </Box>
  );
}
