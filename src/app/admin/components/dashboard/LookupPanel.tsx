"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import { Check, CloudDownload, CloudUpload } from "lucide-react";
import { authFetch } from "@/common/lib/authFetch";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import LookupCrudTable, { LookupRow } from "@/app/admin/components/dashboard/LookupCrudTable";
import { API_BASE_URL, API } from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";
import { Button, Theme } from "@mui/material";

const SCHEMA_KEYS: Record<string, string[]> = {
  products: ["id", "name", "code"],
  transporters: ["id", "name"],
  plantCodes: ["id", "code", "description"],
  salesZones: ["id", "name"],
  packConfigs: ["id", "configName"],
  customers: ["id", "name", "address"],
  printers: ["id", "name"],
  materialBarcodes: [
    "id", 
    "erpCode", 
    "mappingBarcode", 
    "group", 
    "acceptBulkData", 
    "remarksRequired", 
    "classification"
  ],
};

const REQUIRED_KEYS: Record<string, string[]> = {
  products: ["name"], 
  transporters: ["name"],
  plantCodes: ["code"], 
  salesZones: ["name"],
  packConfigs: ["configName"],
  customers: ["name", "address"],
  printers: ["name"],
  materialBarcodes: ["erpCode"],
};

const sanitizePayload = (obj: Partial<LookupRow>) => {
  const boolKeys = ["acceptBulkData", "remarksRequired"];
  const newObj: Partial<LookupRow> = { ...obj };
  
  boolKeys.forEach((k) => {
    if (k in newObj && typeof newObj[k] === "string") {
      const val = (newObj[k] as string).toLowerCase().trim();
      if (val === "true") newObj[k] = true;
      if (val === "false") newObj[k] = false;
    }
  });
  return newObj;
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

type MasterLookupKey = keyof typeof TYPE_TO_API_PATH;

const MASTER_LOOKUP_OPTIONS: { label: string; key: MasterLookupKey }[] = [
  { label: "Products", key: "products" },
  { label: "Transporter", key: "transporters" },
  { label: "Delivery Plant Code", key: "plantCodes" },
  { label: "Sales Zone", key: "salesZones" },
  { label: "Packing Configuration", key: "packConfigs" },
  { label: "Customers", key: "customers" },
  { label: "Printers", key: "printers" },
  { label: "Material Barcode", key: "materialBarcodes" },
];

type DeleteTarget = {
  type: MasterLookupKey;
  id: number;
} | null;

type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

export default function AdminMasterLookupPanel() {
  const [selectedType, setSelectedType] = useState<MasterLookupKey | "">("");
  const [data, setData] = useState<LookupRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [adding, setAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [addObj, setAddObj] = useState<Partial<LookupRow>>({});
  const [editObj, setEditObj] = useState<Partial<LookupRow>>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "error",
  });

  const showSnackbar = (message: string, severity: AlertColor = "error") => {
    setSnackbar({ open: true, message, severity });
  };
  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const getApiPath = () =>
    selectedType ? TYPE_TO_API_PATH[selectedType] || selectedType : "";

  const fetchData = async () => {
    if (!selectedType) return;
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
  };

  useEffect(() => {
    setAdding(false);
    setEditingId(null);
    setAddObj({});
    setEditObj({});
    if (selectedType) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const handleAdd = () => {
    setAdding(true);
    setEditingId(null);
    setAddObj({});
  };

  const handleAddChange = (
    key: keyof LookupRow,
    value: string | number | boolean | null | undefined
  ) => setAddObj((prev) => ({ ...prev, [key]: value }));

  const handleEdit = (id: number, row: LookupRow) => {
    setEditingId(id);
    setEditObj(row);
  };

  const handleEditChange = (
    key: keyof LookupRow,
    value: string | number | boolean | null | undefined
  ) => setEditObj((prev) => ({ ...prev, [key]: value }));

  const handleCancel = () => {
    setAdding(false);
    setEditingId(null);
    setAddObj({});
    setEditObj({});
  };

  const handleSave = async (type: MasterLookupKey, id: number) => {
    setLoading(true);
    try {
      const apiPath = getApiPath();
      if (id === -1) {
        const res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}`, {
          method: "POST",
          body: JSON.stringify(sanitizePayload(addObj)),
        });
        if (!res.ok) throw await res.json();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...patchObj } = editObj;
        const res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(sanitizePayload(patchObj)),
        });
        if (!res.ok) throw await res.json();
      }
      handleCancel();
      await fetchData();
    } catch (err: unknown) {
      let errorMsg =
        "Failed to save. Ensure all required fields are filled as strings.";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        errorMsg = (err as { message: string }).message;
      }
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDelete = (type: MasterLookupKey, id: number) => {
    setDeleteTarget({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const apiPath = TYPE_TO_API_PATH[deleteTarget.type] || deleteTarget.type;
      const res = await authFetch(
        `${API_BASE_URL}/lookup/${apiPath}/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        let errMessage = "Failed to delete.";
        try {
          const errBody = await res.json();
          if (typeof errBody?.message === "string") {
            errMessage = errBody.message;
          } else if (
            errBody?.message &&
            typeof errBody.message === "object" &&
            typeof errBody.message.message === "string"
          ) {
            errMessage = errBody.message.message;
          }
        } catch {}
        showSnackbar(String(errMessage), "error");
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        setDeleteLoading(false);
        return;
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await fetchData();
    } catch (err: unknown) {
      let msg = "Failed to delete.";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      showSnackbar(msg, "error");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const buttonSx = {
    bgcolor: (theme: Theme) => theme.palette.action.hover,
    color: (theme: Theme) => theme.palette.text.primary,
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 120,
    height: 40,
    px: 3,
    textTransform: "none" as const,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: (theme: Theme) => theme.palette.primary.main,
      color: (theme: Theme) => theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
      "& .MuiSvgIcon-root, & svg": {
        color: "#000",
      },
    },
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
      // Refresh current view if selected
      if (selectedType) fetchData();
    } catch {
      showSnackbar("Failed to import data", "error");
    } finally {
      setLoading(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        mt: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          width: "100%",
          maxWidth: 800,
          mb: 1,
        }}
      >
        <FormControl sx={{ width: 320 }} size="medium" variant="outlined">
          <InputLabel id="master-lookup-type-label">Select Lookup</InputLabel>
          <Select
            labelId="master-lookup-type-label"
            id="master-lookup-type"
            value={selectedType}
            label="Select Lookup"
            onChange={(e: SelectChangeEvent<MasterLookupKey | "">) =>
              setSelectedType(e.target.value as MasterLookupKey | "")
            }
            sx={{
              borderRadius: 2,
              fontSize: 16,
              textAlign: "center",
              "& .MuiSelect-select": {
                textAlign: "center",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: (theme) => theme.palette.background.paper,
                },
              },
            }}
          >
            {MASTER_LOOKUP_OPTIONS.map((option) => (
              <MenuItem
                key={option.key}
                value={option.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                  fontSize: 16,
                }}
              >
                {selectedType === option.key && (
                  <Check
                    size={18}
                    style={{
                      color: "#1976d2",
                      display: "inline-block",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                )}
                <span
                  style={{
                    fontWeight: selectedType === option.key ? 600 : 400,
                  }}
                >
                  {option.label}
                </span>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" gap={1}>
          <Button
            startIcon={<CloudDownload size={18} />}
            onClick={handleDownloadBulk}
            sx={buttonSx} 
          >
            DOWNLOAD
          </Button>
          <Button
            component="label"
            startIcon={<CloudUpload size={18} />}
            sx={buttonSx} 
          >
            UPLOAD
            <input
              type="file"
              hidden
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleUploadBulk}
            />
          </Button>
        </Box>
      </Box>

      <Box sx={{ width: "100%", mt: 6, maxWidth: "90%" }}>
        {!selectedType ? (
          <Box sx={{ textAlign: "center", color: "#888", mt: 8, fontSize: 18 }}>
            Please select a lookup type to manage.
          </Box>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={38} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ py: 4, fontSize: 18, textAlign: "center" }}>
            {error}
          </Alert>
        ) : (
          <LookupCrudTable
            type={selectedType}
            data={data}
            explicitKeys={SCHEMA_KEYS[selectedType]}
            requiredKeys={REQUIRED_KEYS[selectedType]}
            editingId={editingId}
            editObj={editObj}
            onEdit={handleEdit}
            onEditChange={handleEditChange}
            onSave={handleSave}
            onRequestDelete={handleRequestDelete}
            onCancel={handleCancel}
            addObj={addObj}
            onAdd={handleAdd}
            onAddChange={handleAddChange}
            adding={adding}
            refresh={fetchData}
          />
        )}
      </Box>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteDialogClose}
        loading={deleteLoading}
        title="Delete Confirmation"
        description="Are you sure you want to delete this lookup value? This action cannot be undone."
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
