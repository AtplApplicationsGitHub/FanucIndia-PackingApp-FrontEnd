"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
} from "@mui/material";

import {
  MoreVert,
  Edit,
  PictureAsPdf,
  Delete,
  Close,
  FilePresent,
  Visibility as VisibilityIcon,
  Download,
} from "@mui/icons-material";
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
  X,
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
} from "lucide-react";
import CommonButton from "@/common/components/CommonButton";

const buttonSx = {
  height: 40,
  fontSize: "13px",
  fontWeight: 700,
  bgcolor: "#FFD100", // Fanuc Yellow
  color: "#1B254B", // Dark Blue
  px: 2.5,
  minWidth: "100px",
  whiteSpace: "nowrap",
  borderRadius: 0,
  clipPath:
    "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
  boxShadow: "none",
  "&:hover": {
    bgcolor: "#FFC107",
    boxShadow: "none",
  },
  "& .MuiButton-startIcon": {
    color: "inherit",
  },
  "&:disabled": {
    bgcolor: "rgba(255, 209, 0, 0.4)",
    color: "rgba(27, 37, 75, 0.4)",
  },
};

interface Transporter {
  id: number;
  name: string;
}
interface Dispatch {
  id: number;
  transporter?: { name: string } | null;
  transporterName?: string | null;
  soCount: number;
  vehicleNumber: string;
  attachments: { fileName: string }[];
  UpdatedBy?: string | null;
  UpdatedDate?: string | null;
}
interface DispatchSO {
  id: number;
  saleOrderNumber: string;
  salesOrder?: {
    customerNameText?: string | null;
    customer?: {
      name: string;
    };
  };
}

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
        type: response.headers["content-type"],
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
      <DialogTitle>
        Attachments
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          {...getRootProps()}
          sx={{
            p: 4,
            my: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            cursor: "pointer",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload
            size={48}
            color={theme.palette.text.secondary}
            style={{ marginBottom: 16 }}
          />
          <Typography
            variant="h6"
            color="textPrimary"
            fontWeight="500"
            textAlign="center"
          >
            Drag 'n' drop files here
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            or click to select files from your computer
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
                <Paperclip size={20} color="#7C3AED" /> New Files to Upload:
              </Typography>
              <Button
                onClick={handleUpload}
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CloudUpload size={20} />
                  )
                }
                sx={{
                  ...buttonSx,
                  textTransform: "none",
                  clipPath:
                    "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                }}
              >
                {loading ? "Uploading..." : `Upload ${files.length} File(s)`}
              </Button>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Paperclip
                      size={20}
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
                    onClick={() => removeFile(index)}
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
          </Box>
        )}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Uploaded Files:
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: headerBg,
                    color: "primary.contrastText",
                    fontWeight: 600,
                  }}
                >
                  Sl.No
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: headerBg,
                    color: "primary.contrastText",
                    fontWeight: 600,
                  }}
                >
                  File Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: headerBg,
                    color: "primary.contrastText",
                    fontWeight: 600,
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dispatch?.attachments?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No attachments found.
                  </TableCell>
                </TableRow>
              )}
              {dispatch?.attachments?.map((att, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="left">
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Paperclip size={18} color="#7C3AED" />
                      {att.fileName}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <Tooltip title="View Attachment">
                        <IconButton
                          onClick={() => handleView(att.fileName)}
                          size="small"
                          sx={{
                            color: iconBlue,
                            "&:hover": { bgcolor: alpha(iconBlue, 0.1) },
                          }}
                        >
                          <Eye size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          onClick={() => handleDownload(att.fileName)}
                          size="small"
                          sx={{
                            color: iconBlue,
                            "&:hover": { bgcolor: alpha(iconBlue, 0.1) },
                          }}
                        >
                          <DownloadIcon size={20} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(att.fileName)}
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <Delete sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
  }>({
    transporterId: null,
    vehicleNumber: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const soInputRef = useRef<HTMLInputElement>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null,
  );
  const [dispatchSOs, setDispatchSOs] = useState<DispatchSO[]>([]);
  const [soInput, setSoInput] = useState("");
  const [multipleSoOptions, setMultipleSoOptions] = useState<{id: number, saleOrderNumber: string, outboundDelivery: string | null}[]>([]);
  const [soSelectionDialogOpen, setSoSelectionDialogOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [soLoading, setSoLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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
    });
    setAttachments([]);
    setEditingId(null);
  };

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
      const formData = new FormData();

      if (form.transporterId)
        formData.append("transporterId", String(form.transporterId.id));

      formData.append("vehicleNumber", form.vehicleNumber.trim());

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const apiUrl = editingId
        ? API.DISPATCH.BY_ID(editingId)
        : API.DISPATCH.BASE;
      const method = editingId ? "patch" : "post";

      await axios({
        method: method,
        url: apiUrl,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSnackbar(`Dispatch ${editingId ? "updated" : "saved"} successfully!`);
      handleDialogClose();
      fetchDispatches();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errMsg =
          error.response?.data?.message ||
          `Failed to ${editingId ? "update" : "save"} dispatch`;
        showSnackbar(errMsg, "error");
      } else {
        showSnackbar("Unexpected error occurred", "error");
      }
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
        const matchedOption = multipleSoOptions.find(o => o.id === specificSalesOrderId);
        if (matchedOption) {
          finalSaleOrderNumber = matchedOption.saleOrderNumber;
        }
      }

      if (!finalSalesOrderId) {
        const searchRes = await axios.get(
          API.DISPATCH.SEARCH_SO(finalSaleOrderNumber),
          { headers: { Authorization: `Bearer ${token}` } }
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
          salesOrderId: finalSalesOrderId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSoInput("");
      setSoSelectionDialogOpen(false);
      setMultipleSoOptions([]);
      
      fetchDispatchSOs(selectedDispatch.id);
      fetchDispatches();
      
      setTimeout(() => { soInputRef.current?.focus(); }, 100);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || `Failed to process SO number`;
      showSnackbar(errMsg, "error");
      setTimeout(() => { soInputRef.current?.focus(); }, 100);
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

  const handleEdit = () => {
    const dispatchToEdit = dispatches.find((d) => d.id === currentMenuId);
    if (dispatchToEdit) {
      const transporterName =
        dispatchToEdit.transporterName || dispatchToEdit.transporter?.name;
      const transporter =
        transporters.find((t) => t.name === transporterName) || null;

      setForm({
        transporterId: transporter,
        vehicleNumber: dispatchToEdit.vehicleNumber,
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
          px: 4,
          pb: 2,
          pt: 1.5,
          bgcolor: theme.palette.mode === "dark" ? "#1F2933" : "#f9fafb",
          height: "calc(100vh - 75px)",
          overflow: "hidden",
          color: theme.palette.text.primary,
        }}
      >
        {/* Compact Full Width Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            px: 4,
            mb: 1.5,
            width: "fit-content",
            mx: "auto",
            borderRadius: 3.5,
            display: "flex",
            alignItems: "center",
            gap: 4,
            bgcolor: theme.palette.mode === "dark" ? "#1F2933" : "#ffffff",
            border: "1px solid",
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)"
                : "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Box display="flex" gap={3} alignItems="center">
            <Box>
              <DatePicker
                label="FROM"
                value={startDate}
                onChange={(val) => setStartDate(val)}
                format="DD-MM-YYYY"
                minDate={dayjs().subtract(3, 'day')}
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
                minDate={startDate ? startDate : dayjs().subtract(3, 'day')}
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
                  color: theme.palette.text.secondary,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? ""
                      : "",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.08)",
                    color: "#EF4444",
                  },
                }}
              >
                <X size={18} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <CommonButton
              variant="contained"
              onClick={handleCreateClick}
              startIcon={<Plus size={18} />}
            >
              Create
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
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2, }} >ACTION</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2 }}>S.NO</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2 }}>SO COUNT</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2 }}>TRANSPORTER</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2 }}>VEHICLE NUMBER</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2 }}>UPDATED BY</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2 }}>UPDATED DATE</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000", bgcolor: theme.palette.mode === "dark" ? "#000000" : "#f8fafc", py: 2 }} align="center">ATTACHMENTS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                    ) : dispatches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            gap={2}
                          >
                            <Package
                              size={64}
                              color={theme.palette.text.disabled}
                            />
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
                          <TableRow key={row.id} hover onClick={() => setSelectedDispatch(row)} selected={selectedDispatch?.id === row.id} sx={{ cursor: "pointer", bgcolor: theme.palette.mode === "dark" ? (index % 2 === 0 ? "#45451B" : "#1A1F26") : (index % 2 === 0 ? "#FFF2AF" : "#FFFFFF"), "&.Mui-selected": { bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)", "&:hover": { bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)" } } }}>
                            <TableCell><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuClick(e, row.id); }}><MoreVert /></IconButton></TableCell>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{row.soCount}</TableCell>
                            <TableCell>{row.transporterName || row.transporter?.name || "-"}</TableCell>
                            <TableCell>{row.vehicleNumber}</TableCell>
                            <TableCell>{row.UpdatedBy || "-"}</TableCell>
                            <TableCell><Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>{row.UpdatedDate ? new Date(row.UpdatedDate).toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : "-"}</Typography></TableCell>
                            <TableCell align="center"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenAttachmentDialog(row); }}><VisibilityIcon /></IconButton></TableCell>
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
                      ? "Search by SO Number or Customer..."
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
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddSO()}
                        disabled={
                          !selectedDispatch || !soInput.trim() || soLoading
                        }
                        sx={{
                          ...buttonSx,
                          height: 32,
                          minWidth: "80px",
                          px: 1.5,
                          fontSize: "0.75rem",
                          ml: 1,
                          display: selectedDispatch ? "flex" : "none",
                        }}
                      >
                        {soLoading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          "ADD SO"
                        )}
                      </Button>
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
                          <Typography
                            variant="body2"
                            fontWeight="800"
                            color={theme.palette.text.primary}
                            sx={{ mb: 0.5 }}
                          >
                            {so.saleOrderNumber}
                          </Typography>
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
          <DialogTitle>
            {editingId ? "EDIT DISPATCH" : "CREATE DISPATCH"}
            <IconButton
              onClick={handleDialogClose}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box
              component="form"
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Autocomplete
                  options={transporters}
                  getOptionLabel={(option) => option.name}
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

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600, mt: 1 }}
              >
                Attachments
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  p: 4,
                  my: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  cursor: "pointer",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload
                  size={40}
                  color={theme.palette.text.secondary}
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="body1" fontWeight="500">
                  Drag 'n' drop files here
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  or click to select files
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
          <DialogActions sx={{ p: 2 }}>
            <Button sx={buttonSx} onClick={handleDialogClose}>
              CANCEL
            </Button>
            <Button sx={buttonSx} onClick={handleSave} disabled={loading}>
              {loading ? (
                <CircularProgress size={24} />
              ) : editingId ? (
                "UPDATE"
              ) : (
                "SAVE"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Specific SO Selection Dialog */}
        <Dialog open={soSelectionDialogOpen} onClose={() => setSoSelectionDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Select Specific Order
            <IconButton onClick={() => setSoSelectionDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Multiple orders found for <Typography component="span" fontWeight="bold" color="text.primary">{soInput}</Typography>. Please select the correct Outbound Delivery (OBD):
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {multipleSoOptions.map((option) => (
                <Box
                  key={option.id}
                  onClick={() => handleAddSO(option.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700">{option.saleOrderNumber}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      OBD: {option.outboundDelivery || 'N/A'}
                    </Typography>
                  </Box>
                  <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); handleAddSO(option.id); }} sx={{ ...buttonSx, minWidth: '80px', height: 32 }}>
                    SELECT
                  </Button>
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
