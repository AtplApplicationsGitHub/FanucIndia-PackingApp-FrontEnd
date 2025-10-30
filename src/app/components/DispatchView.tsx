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
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  MoreVert,
  Edit,
  PictureAsPdf,
  Delete,
  Close,
  FilePresent,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";

interface Customer {
  id: number;
  name: string;
  address: string;
}
interface Transporter {
  id: number;
  name: string;
}
interface Dispatch {
  id: number;
  customer: { name: string } | null;
  customerName?: string | null;
  address: string;
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

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
        }
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
            border: "2px dashed #ccc",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <input {...getInputProps()} />
          <Typography>
            Drag &#39;n&#39; drop files here, or click to select files
          </Typography>
        </Box>
        {files.length > 0 && (
          <Box>
            <Typography variant="subtitle1">New Files to Upload:</Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <FilePresent />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                `Upload ${files.length} File(s)`
              )}
            </Button>
          </Box>
        )}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Uploaded Files:
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SiNo</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell align="right">Action</TableCell>
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
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{att.fileName}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDelete(att.fileName)}>
                      <Delete />
                    </IconButton>
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
  // --- State ---
  const [form, setForm] = useState<{
    customerId: Customer | null | string;
    address: string;
    transporterId: Transporter | null;
    vehicleNumber: string;
  }>({
    customerId: null,
    address: "",
    transporterId: null,
    vehicleNumber: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const soInputRef = useRef<HTMLInputElement>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null
  );
  const [dispatchSOs, setDispatchSOs] = useState<DispatchSO[]>([]);
  const [soInput, setSoInput] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
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
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API.LOOKUP.CUSTOMERS);
      const data = await res.json();
      setCustomers(data);
    } catch {
      showSnackbar("Failed to load customers", "error");
    }
  }, []);

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
      const res = await fetchWithAuth(API.DISPATCH.BASE);
      const data = await res.json();
      setDispatches(data);
    } catch {
      showSnackbar("Failed to load dispatches", "error");
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchCustomers();
    fetchTransporters();
    fetchDispatches();
  }, [fetchCustomers, fetchTransporters, fetchDispatches]);

  useEffect(() => {
    if (selectedDispatch) {
      fetchDispatchSOs(selectedDispatch.id);
    } else {
      setDispatchSOs([]);
    }
  }, [selectedDispatch, fetchDispatchSOs]);

  const handleFormChange = (
    field: "customerId" | "address" | "transporterId" | "vehicleNumber",
    value: Customer | Transporter | string | null
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (
      field === "customerId" &&
      value &&
      typeof value === "object" &&
      "address" in value
    ) {
      setForm((prev) => ({
        ...prev,
        address: (value as Customer).address || "",
      }));
    } else if (field === "customerId" && !value) {
      setForm((prev) => ({ ...prev, address: "" }));
    }
  };

  const resetForm = () => {
    setForm({
      customerId: null,
      address: "",
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
    // --- Validation ---
    const isCustomerObject =
      typeof form.customerId === "object" && form.customerId !== null;
    const customerValue = form.customerId; // Can be object, string, or null
    const customerNameString =
      typeof customerValue === "string"
        ? customerValue.trim()
        : (customerValue as Customer)?.name;

    if (!customerValue || !customerNameString) {
      showSnackbar("Please select or enter a customer name.", "error");
      return;
    }
    if (!form.address.trim()) {
      showSnackbar("Address is required.", "error");
      return;
    }
    if (!form.vehicleNumber.trim()) {
      showSnackbar("Vehicle Number is required.", "error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const customerId = isCustomerObject
        ? (form.customerId as Customer).id
        : undefined;
      const customerName = !isCustomerObject
        ? String(form.customerId || "").trim()
        : undefined;

      const formData = new FormData();

      if (customerId) {
        formData.append("customerId", String(customerId));
      } else if (customerName) {
        formData.append("customerName", customerName);
      }
      formData.append("address", form.address.trim());

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

  const handleAddSO = async () => {
    if (!selectedDispatch || !soInput.trim()) return;

    setSoLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API.DISPATCH.SO(selectedDispatch.id),
        { saleOrderNumber: soInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSoInput("");
      fetchDispatchSOs(selectedDispatch.id);
      fetchDispatches();
    } catch (error: unknown) {
      setSoInput("");
      if (axios.isAxiosError(error)) {
        const errMsg =
          error.response?.data?.message || `Failed to add SO number`;
        showSnackbar(errMsg, "error");
      } else {
        showSnackbar("Unexpected error occurred", "error");
      }
    } finally {
      setSoLoading(false);
      setTimeout(() => {
        soInputRef.current?.focus();
      }, 100);
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
    id: number
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
      const customerName = dispatchToEdit.customerName || dispatchToEdit.customer?.name;
      const customer =
        customers.find((c) => c.name === customerName) || null;
      const transporterName = dispatchToEdit.transporterName || dispatchToEdit.transporter?.name;
      const transporter =
        transporters.find((t) => t.name === transporterName) ||
        null;
      setForm({
        customerId: customer || customerName || null,
        address: dispatchToEdit.address || customer?.address || "",
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

  const columns: GridColDef<Dispatch>[] = [
    {
      field: "actions",
      headerName: "Action",
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Dispatch>) => (
        <IconButton onClick={(e) => handleMenuClick(e, params.row.id)}>
          <MoreVert />
        </IconButton>
      ),
    },
    {
      field: "siNo",
      headerName: "SiNo",
      width: 70,
      valueGetter: (value, row) =>
        dispatches.findIndex((d) => d.id === row.id) + 1,
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 1,
      valueGetter: (value, row) => row.customerName || row.customer?.name || "-",
    },
    {
      field: "soCount",
      headerName: "SO Count",
      width: 100,
    },
    {
      field: "transporterName",
      headerName: "Transporter",
      flex: 1,
      valueGetter: (value, row) => row.transporterName || row.transporter?.name || "-",
    },
    {
      field: "vehicleNumber",
      headerName: "Vehicle Number",
      flex: 1,
    },
    {
      field: "UpdatedBy",
      headerName: "Updated By",
      flex: 0.8, 
      minWidth: 100, 
      valueGetter: (_value, row) => row.UpdatedBy || "-", 
    },
    {
      field: "UpdatedDate",
      headerName: "Updated Date",
      flex: 1,
      minWidth: 180, 
      valueGetter: (_value, row) =>
      row.UpdatedDate
        ? new Date(row.UpdatedDate).toLocaleString('en-IN', { 
            day: '2-digit',    
            month: '2-digit',   
            year: 'numeric',   
            hour: '2-digit',   
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true       
          })
        : "-",
    },
    {
      field: "attachments",
      headerName: "Attachments",
      width: 120,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<Dispatch>) => (
        <IconButton onClick={() => handleOpenAttachmentDialog(params.row)}>
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    if (selectedDispatch && soInputRef.current) {
      setTimeout(() => {
        soInputRef.current?.focus();
      }, 300);
    }
  }, [selectedDispatch]);

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          Dispatch
        </Typography>
        <Button variant="contained" onClick={handleCreateClick}>
          Create Dispatch
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
        <Box sx={{ width: "60%" }}>
          <Paper elevation={3} sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={dispatches}
              columns={columns}
              getRowId={(row) => row.id}
              loading={loading}
              onRowClick={(params) =>
                setSelectedDispatch(params.row as Dispatch)
              }
              pageSizeOptions={[5, 10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
            />
          </Paper>
        </Box>
        <Box sx={{ width: "40%" }}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: 600, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h6">Sale Order Numbers</Typography>
            <Box display="flex" gap={1} my={2}>
              <TextField
                fullWidth
                size="small"
                placeholder={
                  selectedDispatch
                    ? "Enter SO Number"
                    : "Select a dispatch first"
                }
                value={soInput}
                onChange={(e) => setSoInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSO()}
                disabled={!selectedDispatch || soLoading}
                inputRef={soInputRef}
              />
              <Button
                variant="contained"
                onClick={handleAddSO}
                disabled={!selectedDispatch || soLoading}
              >
                {soLoading ? <CircularProgress size={24} /> : "Add"}
              </Button>
            </Box>
            <Box flexGrow={1} overflow="auto">
              <List>
                {soLoading && dispatchSOs.length === 0 ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : dispatchSOs.length === 0 ? (
                  <Typography
                    sx={{ textAlign: "center", color: "text.secondary", mt: 2 }}
                  >
                    Select a Dispatch first
                  </Typography>
                ) : (
                  dispatchSOs.map((so) => (
                    <ListItem
                      key={so.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteSO(so.id)}
                        >
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={so.saleOrderNumber} />
                    </ListItem>
                  ))
                )}
              </List>
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
          {editingId ? "Edit Dispatch" : "Dispatch Details"}
          <IconButton
            onClick={handleDialogClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate autoComplete="off" sx={{ pt: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              <Autocomplete
                freeSolo
                options={customers}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.name
                }
                value={form.customerId}
                onChange={(_, value) => {
                  handleFormChange("customerId", value);
                }}
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === "input") {
                    handleFormChange("customerId", newInputValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="  Customer*" />
                )}
                filterOptions={(options, params) => {
                  const filtered = options.filter((option) =>
                    option.name
                      .toLowerCase()
                      .includes(params.inputValue.toLowerCase())
                  );

                  const { inputValue } = params;
                  const isExisting = options.some(
                    (option) => option.name === inputValue
                  );
                  if (
                    inputValue !== "" &&
                    !isExisting &&
                    filtered.length === 0
                  ) {
                  }
                  return filtered;
                }}
              />
              <TextField
                label="Address"
                value={form.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
              />
              <Autocomplete
                options={transporters}
                getOptionLabel={(option) => option.name}
                value={form.transporterId}
                onChange={(_, value) =>
                  handleFormChange("transporterId", value)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Transporter" />
                )}
              />
              <TextField
                label="Vehicle Number*"
                value={form.vehicleNumber}
                onChange={(e) =>
                  handleFormChange("vehicleNumber", e.target.value)
                }
              />
            </Box>

            <Typography variant="subtitle2" color="text.secondary">
              Attachments
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                p: 3,
                mt: 1,
                border: "2px dashed #ccc",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <input {...getInputProps()} />
              <Typography>
                Drop files here or <strong>browse</strong>
              </Typography>
            </Box>
            {attachments.length > 0 && (
              <List>
                {attachments.map((file, index) => (
                  <ListItem
                    key={index}
                    dense
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: "32px" }}>
                      <FilePresent fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : editingId ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
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
  );
}
