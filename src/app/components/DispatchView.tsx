"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  TablePagination,
  Divider,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  Badge,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";

import {
  MoreVert,
  Edit,
  PictureAsPdf,
  Delete,
  Close,
  FilePresent,
  Visibility as VisibilityIcon,
  Download,
  Visibility,
} from "@mui/icons-material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { alpha, useTheme, Theme } from "@mui/material";
import {
  X as CloseIcon,
  Eye,
  Download as DownloadIcon,
  Trash2,
  CloudUpload,
  FileText,
  File as FileIcon,
  Search,
  Plus,
  Calendar,
  Truck,
  Package,
  Info,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import { formatDateTimeIST } from "@/common/utils/dateTime";
import VehicleEntries from "@/app/components/Vehicle-entries";

interface Transporter {
  id: number;
  name: string;
}
interface Dispatch {
  id: number;
  transporterId?: number | string | null;
  transporter?: { id?: number | string | null; name: string } | null;
  transporterName?: string | null;
  soCount: number;
  vehicleNumber: string;
  attachments: { fileName: string }[] | null;
  UpdatedBy?: string | null;
  UpdatedDate?: string | null;
  dispatchSOs?: DispatchSO[];
}
interface DispatchSO {
  id: number;
  dispatchId?: number;
  saleOrderNumber: string;
  LRnumber?: string | null;
  salesOrderId?: number;
  outboundDelivery?: string | null;
  salesOrder?: {
    customerNameText?: string | null;
    customer?: {
      name: string;
    };
  };
}

/** One dropdown entry per sale order number (prefers row that already has LR). */
const getUniqueDispatchSoOptions = (soList: DispatchSO[]): DispatchSO[] => {
  const map = new Map<string, DispatchSO>();
  for (const so of soList) {
    const existing = map.get(so.saleOrderNumber);
    if (!existing) {
      map.set(so.saleOrderNumber, so);
    } else if (!existing.LRnumber?.trim() && so.LRnumber?.trim()) {
      map.set(so.saleOrderNumber, so);
    }
  }
  return Array.from(map.values());
};

const getSharedLrNumber = (selectedSos: DispatchSO[]): string => {
  const lrNumbers = selectedSos
    .map((so) => so.LRnumber?.trim())
    .filter((lrNumber): lrNumber is string => Boolean(lrNumber));
  const uniqueLrNumbers = Array.from(new Set(lrNumbers));

  return uniqueLrNumbers.length === 1 ? uniqueLrNumbers[0] : "";
};

const getTransporterIdNumber = (
  transporterId?: number | string | null,
): number | null => {
  if (transporterId === null || transporterId === undefined) return null;

  const id = Number(transporterId);
  return Number.isFinite(id) ? id : null;
};

const buildDispatchCreatePayload = (
  transporter: Transporter | null,
  vehicleNumber: string,
) => ({
  ...(transporter
    ? {
        transporterId: String(transporter.id),
      }
    : {}),
  vehicleNumber: vehicleNumber.trim(),
});

const buildDispatchUpdatePayload = (
  transporter: Transporter | null,
  vehicleNumber: string,
) => ({
  ...(transporter
    ? {
        transporterId: String(transporter.id),
        transporterName: transporter.name,
      }
    : {}),
  vehicleNumber: vehicleNumber.trim(),
});

const mergeDispatchUpdate = (
  current: Dispatch,
  updated: Partial<Dispatch>,
  fallbackTransporter: Transporter | null,
): Dispatch => {
  const transporterName =
    updated.transporterName ??
    updated.transporter?.name ??
    fallbackTransporter?.name ??
    current.transporterName ??
    current.transporter?.name ??
    null;
  const transporterId =
    updated.transporterId ??
    updated.transporter?.id ??
    fallbackTransporter?.id ??
    current.transporterId ??
    null;

  return {
    ...current,
    ...updated,
    transporterId,
    transporterName,
    transporter: updated.transporter ??
      (transporterName
        ? {
            ...(current.transporter ?? {}),
            id: transporterId,
            name: transporterName,
          }
        : current.transporter),
    soCount:
      updated.soCount ??
      (Array.isArray(updated.dispatchSOs)
        ? updated.dispatchSOs.length
        : current.soCount),
    vehicleNumber: updated.vehicleNumber ?? current.vehicleNumber,
    attachments:
      updated.attachments === undefined
        ? current.attachments
        : updated.attachments,
  };
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!axios.isAxiosError(error)) return fallbackMessage;

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;

  const errorText = error.response?.data?.error;
  if (typeof errorText === "string" && errorText.trim()) return errorText;

  return fallbackMessage;
};

const AttachmentDialog = ({
  open,
  onClose,
  dispatch,
  onUpdate,
  showSnackbar,
}: {
  open: boolean;
  onClose: () => void;
  dispatch: Dispatch | null;
  onUpdate: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const headerBg = theme.palette.primary.main;
  const iconBlue = theme.palette.mode === "dark" ? "#60A5FA" : "#3B82F6";
  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  const [activeTab, setActiveTab] = useState(0);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!dispatch || files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API.DISPATCH.BASE + `/${dispatch.id}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      showSnackbar("Files uploaded successfully", "success");
      setFiles([]);
      onUpdate();
    } catch {
      showSnackbar("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!dispatch) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(API.DISPATCH.BASE + `/${dispatch.id}/attachments`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { fileName },
      });
      showSnackbar("Attachment deleted", "success");
      onUpdate();
    } catch {
      showSnackbar("Failed to delete attachment", "error");
    }
  };

  const handleDownload = async (fileName: string) => {
    if (!dispatch) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API.DISPATCH.BASE}/${dispatch.id}/attachments/${encodeURIComponent(fileName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      secureDownload(response.data, fileName);
    } catch {
      showSnackbar("Failed to download attachment", "error");
    }
  };

  const handleView = async (fileName: string) => {
    if (!dispatch) return;

    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    const viewableExtensions = [
      ".pdf",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".svg",
      ".txt",
      ".mp4",
      ".webm",
    ];

    if (!viewableExtensions.includes(ext)) {
      return handleDownload(fileName);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API.DISPATCH.BASE}/${dispatch.id}/attachments/${encodeURIComponent(fileName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      const safeBlob = new Blob([response.data], {
        type:
          (response.headers["content-type"] as string) ||
          "application/octet-stream",
      });
      const fileURL = URL.createObjectURL(safeBlob);

      if (fileURL.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = fileURL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        link.click();

        setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
      }
    } catch {
      showSnackbar("Failed to view attachment", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
        ATTACHMENTS
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 12 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        centered
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Upload New" />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              Uploaded Files
              <Chip
                label={dispatch?.attachments?.length ?? 0}
                size="small"
                sx={{ height: 20, fontSize: 11 }}
              />
            </Box>
          }
        />
      </Tabs>
      <DialogContent dividers>
        {activeTab === 0 && (
          <>
            <Box
              {...getRootProps()}
              sx={{
                mt: 3,
                p: 8,
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                bgcolor: "transparent",
                transition: "background-color 0.2s, border-color 0.2s",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <input {...getInputProps()} />
              <UploadCloud
                size={30}
                color="#9e9e9e"
                style={{ marginBottom: 4 }}
              />
              <Typography fontSize={17} fontWeight={500} color="text.primary">
                Click or drag to upload
              </Typography>
              <Typography fontSize={15} color="text.secondary">
                Supports all file types
              </Typography>
            </Box>
            {files.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    Files to Upload:
                  </Typography>
                  <CommonButton
                    onClick={handleUpload}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <CloudUpload size={20} />
                      )
                    }
                  >
                    {loading
                      ? "Uploading..."
                      : `Upload ${files.length} File(s)`}
                  </CommonButton>
                </Box>
                <Box
                  sx={{
                    mt: 1,
                    overflow: "hidden",
                  }}
                >
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.2,
                        px: 1,
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.action.hover, 0.04),
                        },
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Paperclip size={15} color="#7C3AED" />
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          color="textPrimary"
                        >
                          {file.name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                      >
                        <DeleteOutlineIcon
                          fontSize="small"
                          sx={{ color: "error.main" }}
                        />{" "}
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
        {activeTab === 1 && (
          <>
            <TableContainer component={Paper}>
              <Table
                sx={{
                  "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                    backgroundColor: lightYellow,
                  },
                  "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                    {
                      borderBottom: 0,
                    },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: "#F5C518",
                        color: "#333333",
                        fontWeight: "bold",
                      }}
                    >
                      S.No
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: "#F5C518",
                        color: "#333333",
                        fontWeight: 600,
                      }}
                    >
                      File Name
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: "#F5C518",
                        color: "#333333",
                        fontWeight: 600,
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!dispatch?.attachments ||
                    dispatch.attachments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography color="text.secondary" p={3}>
                          No attachments found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {dispatch?.attachments?.map((att, index) => (
                    <TableRow key={index}>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        {index + 1}
                      </TableCell>
                      <TableCell align="left" sx={{ py: 0.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Paperclip size={16} color="#7C3AED" />
                          {att.fileName}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.5 }}>
                        <Box display="flex" justifyContent="center" gap={0.5}>
                          <Tooltip title="View Attachment">
                            <IconButton
                              onClick={() => handleView(att.fileName)}
                              size="small"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                              onClick={() => handleDownload(att.fileName)}
                              size="small"
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete(att.fileName)}
                              size="small"
                            >
                              <DeleteOutlineIcon
                                fontSize="small"
                                sx={{ color: "error.main" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Main Component ---
export default function DispatchView() {
  const theme = useTheme();
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs().subtract(1, "day"),
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [form, setForm] = useState<{
    transporterId: Transporter | null;
    vehicleNumber: string;
    selectedSos: DispatchSO[];
    lrNumber: string;
  }>({
    transporterId: null,
    vehicleNumber: "",
    selectedSos: [],
    lrNumber: "",
  });
  const [editDialogSOs, setEditDialogSOs] = useState<DispatchSO[]>([]);
  const editDialogSoOptions = useMemo(
    () => getUniqueDispatchSoOptions(editDialogSOs),
    [editDialogSOs],
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const soInputRef = useRef<HTMLInputElement>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null,
  );
  const [dispatchSOs, setDispatchSOs] = useState<DispatchSO[]>([]);
  const [soInput, setSoInput] = useState("");
  const [multipleSoOptions, setMultipleSoOptions] = useState<
    { id: number; saleOrderNumber: string; outboundDelivery: string | null }[]
  >([]);
  const [soSelectionDialogOpen, setSoSelectionDialogOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [soLoading, setSoLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [vehicleEntriesDialogOpen, setVehicleEntriesDialogOpen] =
    useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [currentDispatchForAttachments, setCurrentDispatchForAttachments] =
    useState<Dispatch | null>(null);

  // --- Data Fetching ---
  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchTransporters = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API.LOOKUP.TRANSPORTERS);
      const data = await res.json();
      setTransporters(data);
    } catch {
      showSnackbar("Failed to load transporters", "error");
    }
  }, []);

  const fetchDispatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Use date filters
      if (startDate) params.append("startDate", startDate.format("YYYY-MM-DD"));
      if (endDate) params.append("endDate", endDate.format("YYYY-MM-DD"));

      const res = await fetchWithAuth(
        `${API.DISPATCH.BASE}?${params.toString()}`,
      );
      const data = await res.json();
      setDispatches(data);
    } catch {
      showSnackbar("Failed to load dispatches", "error");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setForm((prev) => ({ ...prev, vehicleNumber: val }));
  };

  const headerBg = theme.palette.primary.main;
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const fetchDispatchSOs = useCallback(async (dispatchId: number) => {
    setSoLoading(true);
    try {
      const res = await fetchWithAuth(API.DISPATCH.SO(dispatchId));
      const data = await res.json();
      setDispatchSOs(data);
    } catch {
      showSnackbar("Failed to load SO numbers for dispatch", "error");
    } finally {
      setSoLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransporters();
    fetchDispatches();
  }, [fetchTransporters, fetchDispatches]);

  useEffect(() => {
    if (selectedDispatch) {
      fetchDispatchSOs(selectedDispatch.id);
    } else {
      setDispatchSOs([]);
    }
  }, [selectedDispatch, fetchDispatchSOs]);

  const resetForm = () => {
    setForm({
      transporterId: null,
      vehicleNumber: "",
      selectedSos: [],
      lrNumber: "",
    });
    setEditDialogSOs([]);
    setAttachments([]);
    setEditingId(null);
  };

  const fetchEditDialogSOs = useCallback(async (dispatchId: number) => {
    try {
      const res = await fetchWithAuth(API.DISPATCH.SO(dispatchId));
      const data: DispatchSO[] = await res.json();
      setEditDialogSOs(data);
      return data;
    } catch {
      setEditDialogSOs([]);
      showSnackbar("Failed to load SO numbers for dispatch", "error");
      return [];
    }
  }, []);

  const syncUpdatedDispatch = useCallback(
    (updatedDispatch: Partial<Dispatch> & { id: number }) => {
      const applyUpdate = (dispatch: Dispatch) =>
        mergeDispatchUpdate(dispatch, updatedDispatch, form.transporterId);

      setDispatches((prev) =>
        prev.map((dispatch) =>
          dispatch.id === updatedDispatch.id ? applyUpdate(dispatch) : dispatch,
        ),
      );
      setSelectedDispatch((prev) =>
        prev?.id === updatedDispatch.id ? applyUpdate(prev) : prev,
      );
      setCurrentDispatchForAttachments((prev) =>
        prev?.id === updatedDispatch.id ? applyUpdate(prev) : prev,
      );
    },
    [form.transporterId],
  );

  const handleCreateClick = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!form.vehicleNumber.trim()) {
      showSnackbar("Vehicle Number is required.", "error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const authHeaders = { Authorization: `Bearer ${token}` };

      if (editingId) {
        const dispatchPayload = buildDispatchUpdatePayload(
          form.transporterId,
          form.vehicleNumber,
        );
        const lrTrimmed = form.lrNumber.trim();

        if (form.selectedSos.length > 0) {
          if (!lrTrimmed) {
            showSnackbar("LR Number is required.", "error");
            setLoading(false);
            return;
          }

          const selectedSoNumbers = new Set(
            form.selectedSos.map((so) => so.saleOrderNumber),
          );
          const rowsToUpdate = editDialogSOs.filter((so) =>
            selectedSoNumbers.has(so.saleOrderNumber),
          );

          await Promise.all(
            rowsToUpdate.map((so) =>
              axios.patch(
                API.DISPATCH.UPDATE_SO(so.id),
                { LRnumber: lrTrimmed },
                {
                  headers: {
                    ...authHeaders,
                    "Content-Type": "application/json",
                  },
                },
              ),
            ),
          );
        }

        const updateResponse = await axios.patch<Partial<Dispatch>>(
          API.DISPATCH.BY_ID(editingId),
          dispatchPayload,
          {
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
          },
        );

        if (attachments.length > 0) {
          const attachmentFormData = new FormData();
          attachments.forEach((file) => {
            attachmentFormData.append("attachments", file);
          });

          await axios.post(
            `${API.DISPATCH.BASE}/${editingId}/attachments`,
            attachmentFormData,
            {
              headers: authHeaders,
            },
          );
        }

        syncUpdatedDispatch({
          ...updateResponse.data,
          id: updateResponse.data.id ?? editingId,
        });

        const refreshedSos = await fetchEditDialogSOs(editingId);
        if (selectedDispatch?.id === editingId) {
          setDispatchSOs(refreshedSos);
        }

        showSnackbar("Dispatch updated successfully!");
        handleDialogClose();
        fetchDispatches();
        return;
      }

      const dispatchPayload = buildDispatchCreatePayload(
        form.transporterId,
        form.vehicleNumber,
      );
      const formData = new FormData();
      Object.entries(dispatchPayload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await axios.post(API.DISPATCH.BASE, formData, {
        headers: authHeaders,
      });

      showSnackbar("Dispatch saved successfully!");
      handleDialogClose();
      fetchDispatches();
    } catch (error: unknown) {
      showSnackbar(
        getApiErrorMessage(
          error,
          `Failed to ${editingId ? "update" : "save"} dispatch`,
        ),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSO = async (specificSalesOrderId?: number) => {
    if (!selectedDispatch) return;
    if (!specificSalesOrderId && !soInput.trim()) return;

    setSoLoading(true);

    try {
      const token = localStorage.getItem("token");
      let finalSalesOrderId = specificSalesOrderId;
      let finalSaleOrderNumber = soInput.trim();

      if (specificSalesOrderId && multipleSoOptions.length > 0) {
        const matchedOption = multipleSoOptions.find(
          (o) => o.id === specificSalesOrderId,
        );
        if (matchedOption) {
          finalSaleOrderNumber = matchedOption.saleOrderNumber;
        }
      }

      if (!finalSalesOrderId) {
        const searchRes = await axios.get(
          API.DISPATCH.SEARCH_SO(finalSaleOrderNumber),
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const orders = searchRes.data;

        if (orders.length > 1) {
          setMultipleSoOptions(orders);
          setSoSelectionDialogOpen(true);
          setSoLoading(false);
          return;
        } else if (orders.length === 1) {
          finalSalesOrderId = orders[0].id;
          finalSaleOrderNumber = orders[0].saleOrderNumber;
        }
      }

      await axios.post(
        API.DISPATCH.SO(selectedDispatch.id),
        {
          saleOrderNumber: finalSaleOrderNumber,
          salesOrderId: finalSalesOrderId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSoInput("");
      setSoSelectionDialogOpen(false);
      setMultipleSoOptions([]);

      fetchDispatchSOs(selectedDispatch.id);
      fetchDispatches();

      setTimeout(() => {
        soInputRef.current?.focus();
      }, 100);
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || `Failed to process SO number`;
      showSnackbar(errMsg, "error");
      setTimeout(() => {
        soInputRef.current?.focus();
      }, 100);
    } finally {
      setSoLoading(false);
    }
  };

  const handleDeleteSO = async (soId: number) => {
    setSoLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(API.DISPATCH.DELETE_SO(soId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDispatchSOs(selectedDispatch!.id);
      fetchDispatches();
    } catch {
      showSnackbar("Failed to delete SO number", "error");
    } finally {
      setSoLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    id: number,
  ) => {
    setMenuAnchor(event.currentTarget);
    setCurrentMenuId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setCurrentMenuId(null);
  };

  const handleEdit = async () => {
    const dispatchToEdit = dispatches.find((d) => d.id === currentMenuId);
    if (dispatchToEdit && currentMenuId) {
      const transporterName =
        dispatchToEdit.transporterName || dispatchToEdit.transporter?.name;
      const transporterId = getTransporterIdNumber(
        dispatchToEdit.transporterId ?? dispatchToEdit.transporter?.id,
      );
      const transporter =
        (transporterId !== null
          ? transporters.find((t) => t.id === transporterId)
          : undefined) ||
        (transporterName
          ? transporters.find((t) => t.name === transporterName)
          : undefined) ||
        (transporterId !== null && transporterName
          ? { id: transporterId, name: transporterName }
          : null);

      await fetchEditDialogSOs(currentMenuId);

      setForm({
        transporterId: transporter,
        vehicleNumber: dispatchToEdit.vehicleNumber,
        selectedSos: [],
        lrNumber: "",
      });
      setEditingId(currentMenuId);
      setAttachments([]);
      setCreateDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleGeneratePdf = async () => {
    if (!currentMenuId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API.DISPATCH.PDF(currentMenuId), {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      secureDownload(response.data, `dispatch_${currentMenuId}.pdf`);
    } catch {
      showSnackbar("Failed to generate PDF", "error");
    }
    handleMenuClose();
  };

  const handleOpenAttachmentDialog = (dispatch: Dispatch) => {
    setCurrentDispatchForAttachments(dispatch);
    setAttachmentDialogOpen(true);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setAttachments((prev) => [...prev, ...acceptedFiles]);
    },
  });

  useEffect(() => {
    if (selectedDispatch && soInputRef.current) {
      setTimeout(() => {
        soInputRef.current?.focus();
      }, 300);
    }
  }, [selectedDispatch]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          mt: 1,
          px: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Compact Full Width Filter Bar */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            width: "fit-content",
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            gap: 0.5,
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              gap: 1,
              alignItems: "center",
              flex: 1,
              width: "100%",
              minWidth: 0,
            }}
          >
            <Box>
              <DatePicker
                label="FROM"
                value={startDate}
                onChange={(val) => setStartDate(val)}
                format="DD-MM-YYYY"
                minDate={dayjs().subtract(3, "day")}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 190,
                      "& .MuiInputBase-input": {
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(0,0,0,0.15)",
                        },
                        "&:hover fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.3)"
                              : "rgba(0,0,0,0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#9CA3AF",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      },
                      "& .MuiIconButton-root": {
                        color: theme.palette.text.secondary,
                      },
                    },
                  },
                }}
              />
            </Box>
            <Box>
              <DatePicker
                label="TO"
                value={endDate}
                onChange={(val) => setEndDate(val)}
                format="DD-MM-YYYY"
                minDate={startDate ? startDate : dayjs().subtract(3, "day")}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 190,
                      "& .MuiInputBase-input": {
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(0,0,0,0.15)",
                        },
                        "&:hover fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.3)"
                              : "rgba(0,0,0,0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#9CA3AF",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      },
                      "& .MuiIconButton-root": {
                        color: theme.palette.text.secondary,
                      },
                    },
                  },
                }}
              />
            </Box>
            <Tooltip title="Clear Filters">
              <IconButton
                onClick={handleClearFilters}
                size="small"
                sx={{
                  color: "text.secondary",
                  flex: "0 0 auto",
                  "&:hover": { color: "error.main" },
                }}
              >
                <CloseIcon size={18} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <CommonButton
              variant="contained"
              onClick={() => setVehicleEntriesDialogOpen(true)}
              startIcon={<Truck size={16} />}
            >
              VEHICLE ENTRIES
            </CommonButton>
            <CommonButton
              variant="contained"
              onClick={handleCreateClick}
              startIcon={<Plus size={16} />}
            >
              CREATE
            </CommonButton>
          </Box>
        </Paper>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Left Column: Dispatch Entries */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                height: "calc(100vh - 185px)",
                width: "100%",
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)",
                bgcolor: theme.palette.mode === "dark" ? "#1F2933" : "#ffffff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TableContainer
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    borderRadius: 3,
                  },
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                      >
                        ACTION
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                      >
                        S.NO
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                      >
                        SO COUNT
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                      >
                        TRANSPORTER
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                      >
                        VEHICLE NUMBER
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                      >
                        UPDATED BY
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                      >
                        UPDATED DATE
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          color:
                            theme.palette.mode === "dark"
                              ? "#FFFFFF"
                              : "#000000",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#f8fafc",
                          py: 2,
                        }}
                        align="center"
                      >
                        ATTACHMENTS
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : dispatches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            gap={2}
                          >
                            <Typography variant="h6" fontWeight="700">
                              No rows found
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              There are no dispatch records matching the
                              criteria.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      dispatches
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        )
                        .map((row, index) => (
                          <TableRow
                            key={`${row.id}-${index}`}
                            hover
                            onClick={() => setSelectedDispatch(row)}
                            selected={selectedDispatch?.id === row.id}
                            sx={{
                              cursor: "pointer",
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? index % 2 === 0
                                    ? "#45451B"
                                    : "#1A1F26"
                                  : index % 2 === 0
                                    ? "#FFF2AF"
                                    : "#FFFFFF",
                              "&.Mui-selected": {
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.15)"
                                    : "rgba(0,0,0,0.06)",
                                "&:hover": {
                                  bgcolor:
                                    theme.palette.mode === "dark"
                                      ? "rgba(255,255,255,0.2)"
                                      : "rgba(0,0,0,0.08)",
                                },
                              },
                            }}
                          >
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuClick(e, row.id);
                                }}
                              >
                                <MoreVert />
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              {page * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell>{row.soCount}</TableCell>
                            <TableCell>
                              {row.transporterName ||
                                row.transporter?.name ||
                                "-"}
                            </TableCell>
                            <TableCell>{row.vehicleNumber}</TableCell>
                            <TableCell>{row.UpdatedBy || "-"}</TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                {row.UpdatedDate
                                  ? formatDateTimeIST(row.UpdatedDate)
                                  : "-"}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip
                                title={`View attachments (${row.attachments?.length ?? 0})`}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAttachmentDialog(row);
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={dispatches.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  borderTop: "1px solid",
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                }}
              />
            </Paper>
          </Box>

          {/* Right Column: SO Selection */}
          <Box sx={{ width: 400 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "calc(100vh - 185px)",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,180,0.1)",
                bgcolor: theme.palette.mode === "dark" ? "#1F2933" : "#ffffff",
                position: "relative",
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  fontWeight="700"
                  color="#9CA3AF"
                  sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
                >
                  Search Sales Orders ({dispatchSOs.length})
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder={
                    selectedDispatch
                      ? "Search SO Number or Customer..."
                      : "Select a dispatch first"
                  }
                  value={soInput}
                  onChange={(e) => setSoInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSO()}
                  disabled={!selectedDispatch || soLoading}
                  inputRef={soInputRef}
                  InputProps={{
                    startAdornment: (
                      <Search
                        size={18}
                        color={theme.palette.text.secondary}
                        style={{ marginRight: 8 }}
                      />
                    ),
                    endAdornment: (
                      <CommonButton
                        variant="contained"
                        size="small"
                        onClick={() => handleAddSO()}
                        disabled={
                          !selectedDispatch || !soInput.trim() || soLoading
                        }
                      >
                        {soLoading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          "ADD SO"
                        )}
                      </CommonButton>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.02)",
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                      "& fieldset": {
                        borderColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.2)",
                      },
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    borderRadius: 3,
                  },
                }}
              >
                {dispatchSOs.length === 0 ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    gap={1}
                    p={4}
                  >
                    <Info size={32} color="#374151" />
                    <Typography
                      variant="body2"
                      color="#6B7280"
                      textAlign="center"
                    >
                      {selectedDispatch
                        ? "No SOs added yet. Enter an SO number to begin."
                        : "Select a Dispatch from the table to view and manage SOs."}
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={1.5}
                    sx={{ pr: 1 }}
                  >
                    {dispatchSOs.map((so) => (
                      <Box
                        key={so.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.02)"
                              : "rgba(0,0,0,0.02)",
                          border: "1px solid",
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.05)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.15)"
                                : "rgba(0,0,0,0.15)",
                            transform: "translateX(4px)",
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(0,0,0,0.04)",
                            boxShadow:
                              theme.palette.mode === "dark"
                                ? "0 4px 12px rgba(0,0,0,0.2)"
                                : "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <Box>
                          <MuiLink
                            component={Link}
                            href={`/so-search/${so.saleOrderNumber}${so.outboundDelivery ? "/" + so.outboundDelivery : ""}`}
                            underline="hover"
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.875rem",
                              mb: 0.5,
                              display: "inline-block",
                            }}
                          >
                            {so.saleOrderNumber}
                          </MuiLink>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <FileText
                              size={12}
                              color={theme.palette.text.secondary}
                            />
                            <Typography
                              variant="caption"
                              fontWeight="700"
                              color={theme.palette.text.secondary}
                            >
                              {so.salesOrder?.customerNameText ||
                                so.salesOrder?.customer?.name ||
                                "Unknown Customer"}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSO(so.id)}
                          sx={{
                            color: "#EF4444",
                            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
                          }}
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>

        <Dialog
          open={createDialogOpen}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="md"
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
            {editingId ? "EDIT DISPATCH" : "CREATE DISPATCH"}
            <IconButton
              onClick={handleDialogClose}
              sx={{ position: "absolute", right: 12 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Box
              component="form"
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 2,
                  mb: 0,
                }}
              >
                <Autocomplete
                  options={transporters}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  value={form.transporterId}
                  onChange={(_, value) =>
                    setForm((prev) => ({ ...prev, transporterId: value }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Transporter" />
                  )}
                />

                <TextField
                  label="Vehicle Number"
                  required
                  value={form.vehicleNumber}
                  onChange={handleVehicleChange}
                  helperText="Alphanumeric only (e.g., KA01XY1234)"
                />
              </Box>

              {editingId ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                    gap: 2,
                  }}
                >
                  <Autocomplete<DispatchSO, true, false, false>
                    multiple
                    disableCloseOnSelect
                    options={editDialogSoOptions}
                    sx={{
                      minWidth: 0,
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        minHeight: 56,
                        maxHeight: 56,
                        alignItems: "center",
                        flexWrap: "nowrap",
                        overflow: "hidden",
                        minWidth: 0,
                      },
                      "& .MuiAutocomplete-inputRoot": {
                        flexWrap: "nowrap",
                        minWidth: 0,
                      },
                      "& .MuiAutocomplete-input": {
                        minWidth: "0 !important",
                        width: "0 !important",
                      },
                      "& .MuiAutocomplete-tag": {
                        flexShrink: 0,
                        maxWidth: 116,
                      },
                    }}
                    getOptionLabel={(option) => option.saleOrderNumber}
                    isOptionEqualToValue={(option, value) =>
                      option.saleOrderNumber === value.saleOrderNumber
                    }
                    value={form.selectedSos}
                    onChange={(_, value) =>
                      setForm((prev) => ({
                        ...prev,
                        selectedSos: value,
                        lrNumber: getSharedLrNumber(value),
                      }))
                    }
                    noOptionsText="No SO numbers linked to this dispatch"
                    renderOption={(props, option, { selected }) => {
                      const { key, ...optionProps } = props;

                      return (
                        <Box component="li" key={key} {...optionProps}>
                          <Checkbox
                            checked={selected}
                            size="small"
                            sx={{ mr: 1, p: 0.5 }}
                          />
                          {option.saleOrderNumber}
                        </Box>
                      );
                    }}
                    renderValue={(selected, getItemProps) => {
                      const visibleSos = selected.slice(0, 2);
                      const hiddenCount = selected.length - visibleSos.length;

                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "nowrap",
                            gap: 0.5,
                            py: 0.25,
                            minWidth: 0,
                            maxWidth: "100%",
                            overflow: "hidden",
                          }}
                        >
                          {visibleSos.map((so, index) => {
                            const { key, ...chipProps } = getItemProps({
                              index,
                            });

                            return (
                              <Chip
                                key={key}
                                label={so.saleOrderNumber}
                                size="small"
                                sx={{ flexShrink: 0 }}
                                {...chipProps}
                              />
                            );
                          })}
                          {hiddenCount > 0 && (
                            <Chip
                              label={`+${hiddenCount} selected`}
                              size="small"
                              sx={{
                                flexShrink: 0,
                                bgcolor: "action.selected",
                                color: "text.primary",
                                "& .MuiChip-label": {
                                  fontWeight: 400,
                                },
                              }}
                            />
                          )}
                        </Box>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="SO Number"
                        placeholder={
                          form.selectedSos.length === 0
                            ? "Select SO number"
                            : ""
                        }
                      />
                    )}
                  />

                  <TextField
                    label="LR Number"
                    value={form.lrNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        lrNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    disabled={form.selectedSos.length === 0}
                    placeholder="Enter LR number"
                    helperText={
                      form.selectedSos.length === 0
                        ? "Select an SO number first, then enter LR number"
                        : form.selectedSos.length === 1
                          ? `Updates all linked rows for ${form.selectedSos[0].saleOrderNumber}`
                          : `Updates all linked rows for ${form.selectedSos.length} selected SO numbers`
                    }
                  />
                </Box>
              ) : null}

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Attachments
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  mt: 0.5,
                  p: 8,
                  border: (theme) => `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: "transparent",
                  transition: "background-color 0.2s, border-color 0.2s",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <input {...getInputProps()} />
                <UploadCloud size={30} color="#888888" />
                <Typography fontWeight={500} fontSize={17} color="text.primary">
                  Click or drag to upload
                </Typography>
                <Typography fontSize={15} color="text.secondary">
                  Supports all file types
                </Typography>
              </Box>
              {attachments.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    overflow: "hidden",
                  }}
                >
                  {attachments.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        px: 1,
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.action.hover, 0.04),
                        },
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Paperclip
                          size={18}
                          color="#7C3AED" // Vibrant Purple/Violet
                        />
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          color="textPrimary"
                        >
                          {file.name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        sx={{
                          color: "#EF4444",
                          "&:hover": {
                            bgcolor: alpha("#EF4444", 0.1),
                          },
                        }}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <CommonButton onClick={handleSave} disabled={loading}>
              {loading ? (
                <CircularProgress size={24} />
              ) : editingId ? (
                "UPDATE"
              ) : (
                "SAVE"
              )}
            </CommonButton>
          </DialogActions>
        </Dialog>

        {/* Specific SO Selection Dialog */}
        <Dialog
          open={soSelectionDialogOpen}
          onClose={() => setSoSelectionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
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
            SELECT OUTBOUND DELIVERY
            <IconButton
              onClick={() => setSoSelectionDialogOpen(false)}
              sx={{ position: "absolute", right: 12 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Multiple orders found for{" "}
              <Typography
                component="span"
                fontWeight="bold"
                color="text.primary"
              >
                {soInput}
              </Typography>
              . <br />
              Please select the correct Outbound Delivery (OBD):
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {multipleSoOptions.map((option) => (
                <Box
                  key={option.id}
                  onClick={() => handleAddSO(option.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <Box>
                    <MuiLink
                      component={Link}
                      href={`/so-search/${option.saleOrderNumber}${option.outboundDelivery ? "/" + option.outboundDelivery : ""}`}
                      underline="hover"
                      sx={{ fontWeight: 700, fontSize: "0.875rem" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {option.saleOrderNumber}
                    </MuiLink>
                    <Typography variant="body2" color="text.secondary">
                      OBD: {option.outboundDelivery || "N/A"}
                    </Typography>
                  </Box>
                  <CommonButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSO(option.id);
                    }}
                  >
                    SELECT
                  </CommonButton>
                </Box>
              ))}
            </Box>
          </DialogContent>
        </Dialog>

        <AttachmentDialog
          open={attachmentDialogOpen}
          onClose={() => setAttachmentDialogOpen(false)}
          dispatch={currentDispatchForAttachments}
          onUpdate={() => {
            setAttachmentDialogOpen(false);
            fetchDispatches();
          }}
          showSnackbar={showSnackbar}
        />

        <Dialog
          open={vehicleEntriesDialogOpen}
          onClose={() => setVehicleEntriesDialogOpen(false)}
          fullWidth
          maxWidth="xl"
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: "hidden",
            },
          }}
        >
          <VehicleEntries onClose={() => setVehicleEntriesDialogOpen(false)} />
        </Dialog>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={handleGeneratePdf}>
            <PictureAsPdf sx={{ mr: 1 }} /> PDF
          </MenuItem>
        </Menu>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
