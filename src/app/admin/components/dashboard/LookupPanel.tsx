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
} from "lucide-react";
import { authFetch } from "@/common/lib/authFetch";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import LookupCrudTable, {
  LookupRow,
} from "@/app/admin/components/dashboard/LookupCrudTable";
import LookupFormDialog from "@/app/admin/components/dashboard/LookupFormDialog";
import { API_BASE_URL, API } from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";
import { Button, Paper, useTheme, InputBase, IconButton } from "@mui/material";
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

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: MasterLookupKey,
  ) => {
    setSelectedType(newValue);
    setSearchQuery("");
    setLocalSearch("");
  };

  const getSearchKey = React.useCallback((): string => {
    switch (selectedType) {
      case "products":
        return "name";
      case "transporters":
        return "name";
      case "plantCodes":
        return "code";
      case "salesZones":
        return "name";
      case "packConfigs":
        return "configName";
      case "customers":
        return "name";
      case "printers":
        return "name";
      case "materialBarcodes":
        return "erpCode";
      case "users":
        return "name";
      default:
        return "name";
    }
  }, [selectedType]);

  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const key = getSearchKey();
    return data.filter((row) => {
      const val = row[key];
      return val
        ? String(val).toLowerCase().includes(searchQuery.toLowerCase())
        : false;
    });
  }, [data, searchQuery, getSearchKey]);

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
        throw new Error(err.message || "Operation failed");
      }

      showSnackbar("Saved successfully!", "success");
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      showSnackbar(message, "error");
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
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }

      showSnackbar("Deleted successfully", "success");
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      showSnackbar(message, "error");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setActionLoading(false);
    }
  };

  const handleDownloadBulk = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API.LOOKUP.BULK_TEMPLATE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      secureDownload(blob, "master_data_bulk.xlsx");
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
      {selectedType !== "users" && (
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
              placeholder={`Search ${getSearchKey() === "erpCode"
                ? "ERP Code"
                : getSearchKey()
                  .replace(/([A-Z])/g, " $1")
                  .toLowerCase()
                }...`}
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
          <CommonButton component="label"  startIcon={<CloudUpload size={18} />}>
            UPLOAD BULK
            <input
              type="file"
              hidden
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleUploadBulk}
            />
          </CommonButton>
          <CommonButton startIcon={<PlusCircle size={18} />} onClick={openAddDialog}>
            ADD NEW
          </CommonButton>
          <CommonButton startIcon={<RefreshCcw size={18} />} onClick={fetchData}>
            REFRESH
          </CommonButton>
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
    </Box>
  );
}
