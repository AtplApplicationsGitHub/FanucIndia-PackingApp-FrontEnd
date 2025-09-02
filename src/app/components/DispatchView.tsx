"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar, GridRenderCellParams } from '@mui/x-data-grid';
import { MoreVert, Edit, PictureAsPdf, Delete, UploadFile, Close, FilePresent, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { API, fetchWithAuth } from '@/common/lib/api';

// --- Types ---
interface Attachment {
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
}
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
  customer: { name: string };
  transporter?: { name: string };
  soCount: number;
  vehicleNumber: string;
  attachments: any[];
}
interface DispatchSO {
    id: number;
    saleOrderNumber: string;
}

const AttachmentDialog = ({ open, onClose, dispatch, onUpdate, showSnackbar }: { 
    open: boolean; 
    onClose: () => void;
    dispatch: Dispatch | null; 
    onUpdate: () => void;
    showSnackbar: (message: string, severity: 'success' | 'error') => void;
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
          setFiles(prev => [...prev, ...acceptedFiles]);
        },
    });

    const handleUpload = async () => {
        if (!dispatch || files.length === 0) return;
        setLoading(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            const token = localStorage.getItem('token');
            await axios.post(API.DISPATCH.BASE + `/${dispatch.id}/attachments`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                },
            });
            showSnackbar('Files uploaded successfully', 'success');
            setFiles([]);
            onUpdate();
        } catch (error) {
            showSnackbar('Upload failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!dispatch) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(API.DISPATCH.BASE + `/${dispatch.id}/attachments`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { fileName }
            });
            showSnackbar('Attachment deleted', 'success');
            onUpdate();
        } catch (error) {
            showSnackbar('Failed to delete attachment', 'error');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                Attachments
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><Close/></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box {...getRootProps()} sx={{ p: 4, my: 2, border: '2px dashed #ccc', textAlign: 'center', cursor: 'pointer' }}>
                    <input {...getInputProps()} />
                    <Typography>Drag 'n' drop files here, or click to select files</Typography>
                </Box>
                {files.length > 0 && (
                    <Box>
                        <Typography variant="subtitle1">New Files to Upload:</Typography>
                        <List>
                            {files.map((file, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon><FilePresent/></ListItemIcon>
                                    <ListItemText primary={file.name} />
                                </ListItem>
                            ))}
                        </List>
                        <Button onClick={handleUpload} variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : `Upload ${files.length} File(s)`}
                        </Button>
                    </Box>
                )}
                <Typography variant="h6" sx={{mt: 3, mb: 1}}>Uploaded Files:</Typography>
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
                                    <TableCell colSpan={3} align="center">No attachments found.</TableCell>
                                </TableRow>
                            )}
                            {dispatch?.attachments?.map((att, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{att.fileName}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleDelete(att.fileName)}>
                                            <Delete/>
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
  const [form, setForm] = useState({
    customerId: null as Customer | null,
    address: '',
    transporterId: null as Transporter | null,
    vehicleNumber: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [dispatchSOs, setDispatchSOs] = useState<DispatchSO[]>([]);
  const [soInput, setSoInput] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [soLoading, setSoLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [currentDispatchForAttachments, setCurrentDispatchForAttachments] = useState<Dispatch | null>(null);

  // --- Data Fetching ---
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API.LOOKUP.CUSTOMERS);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      showSnackbar('Failed to load customers', 'error');
    }
  }, []);

  const fetchTransporters = useCallback(async () => {
    try {
        const res = await fetchWithAuth(API.LOOKUP.TRANSPORTERS);
        const data = await res.json();
        setTransporters(data);
    } catch (error) {
        showSnackbar('Failed to load transporters', 'error');
    }
  }, []);

  const fetchDispatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(API.DISPATCH.BASE);
      const data = await res.json();
      setDispatches(data);
    } catch (error) {
      showSnackbar('Failed to load dispatches', 'error');
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
    } catch (error) {
        showSnackbar('Failed to load SO numbers for dispatch', 'error');
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


  // --- Handlers ---
  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'customerId' && value) {
      setForm(prev => ({ ...prev, address: (value as Customer).address || '' }));
    } else if (field === 'customerId' && !value) {
        setForm(prev => ({...prev, address: ''}));
    }
  };

  const resetForm = () => {
    setForm({
        customerId: null,
        address: '',
        transporterId: null,
        vehicleNumber: '',
    });
    setAttachments([]);
    setEditingId(null);
  }

  const handleSave = async () => {
    if (!form.customerId || !form.address || !form.vehicleNumber) {
        showSnackbar('Please fill all mandatory fields.', 'error');
        return;
    }
    setLoading(true);
    
    try {
        const token = localStorage.getItem('token');
        
        if (editingId) {
            const payload = {
                customerId: String(form.customerId.id),
                transporterId: form.transporterId ? String(form.transporterId.id) : undefined,
                vehicleNumber: form.vehicleNumber,
            };
            await axios.patch(API.DISPATCH.BY_ID(editingId), payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

        } else {
            const formData = new FormData();
            formData.append('customerId', String(form.customerId.id));
            formData.append('address', form.address);
            if(form.transporterId) formData.append('transporterId', String(form.transporterId.id));
            formData.append('vehicleNumber', form.vehicleNumber);
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
            await axios.post(API.DISPATCH.BASE, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                },
            });
        }

        showSnackbar(`Dispatch ${editingId ? 'updated' : 'saved'} successfully!`);
        resetForm();
        fetchDispatches();
    } catch (error: any) {
        const errMsg = error.response?.data?.message || `Failed to ${editingId ? 'update' : 'save'} dispatch`;
        showSnackbar(errMsg, 'error');
    } finally {
        setLoading(false);
    }
  };
  
  const handleAddSO = async () => {
    if (!selectedDispatch || !soInput.trim()) return;
    setSoLoading(true);
    try {
        const token = localStorage.getItem('token');
        await axios.post(API.DISPATCH.SO(selectedDispatch.id), 
        { saleOrderNumber: soInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSoInput('');
      fetchDispatchSOs(selectedDispatch.id);
      fetchDispatches();
    } catch (error: any) {
        const errMsg = error.response?.data?.message || 'Failed to add SO number';
        showSnackbar(errMsg, 'error');
    } finally {
        setSoLoading(false);
    }
  }

  const handleDeleteSO = async (soId: number) => {
    setSoLoading(true);
    try {
        const token = localStorage.getItem('token');
        await axios.delete(API.DISPATCH.DELETE_SO(soId), {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchDispatchSOs(selectedDispatch!.id);
        fetchDispatches();
    } catch (error) {
        showSnackbar('Failed to delete SO number', 'error');
    } finally {
        setSoLoading(false);
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setMenuAnchor(event.currentTarget);
    setCurrentMenuId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setCurrentMenuId(null);
  };
  
  const handleEdit = () => {
    const dispatchToEdit = dispatches.find(d => d.id === currentMenuId);
    if(dispatchToEdit) {
        const customer = customers.find(c => c.name === dispatchToEdit.customer.name) || null;
        const transporter = transporters.find(t => t.name === dispatchToEdit.transporter?.name) || null;
        setForm({
            customerId: customer,
            address: customer?.address || '',
            transporterId: transporter,
            vehicleNumber: dispatchToEdit.vehicleNumber
        });
        setEditingId(currentMenuId);
        setAttachments([]);
    }
    handleMenuClose();
  };

  const handleGeneratePdf = async () => {
    if(!currentMenuId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API.DISPATCH.PDF(currentMenuId), {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dispatch_${currentMenuId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showSnackbar('Failed to generate PDF', 'error');
    }
    handleMenuClose();
  }

  const handleOpenAttachmentDialog = (dispatch: Dispatch) => {
    setCurrentDispatchForAttachments(dispatch);
    setAttachmentDialogOpen(true);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      setAttachments(prev => [...prev, ...acceptedFiles]);
    }
  });

  const columns: GridColDef<Dispatch>[] = [
    {
      field: 'actions',
      headerName: 'Action',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Dispatch>) => (
          <IconButton onClick={(e) => handleMenuClick(e, params.row.id)}>
            <MoreVert />
          </IconButton>
      ),
    },
    { 
      field: 'siNo', 
      headerName: 'SiNo', 
      width: 70,
      valueGetter: (value, row) => dispatches.findIndex(d => d.id === row.id) + 1,
    },
    { 
        field: 'customerName', 
        headerName: 'Customer Name', 
        flex: 1, 
        valueGetter: (value, row) => row.customer.name 
    },
    { 
        field: 'soCount', 
        headerName: 'SO Count', 
        width: 100 
    },
    { 
      field: 'transporterName', 
      headerName: 'Transporter', 
      flex: 1, 
      valueGetter: (value, row) => row.transporter?.name || '-' 
    },
    { 
        field: 'vehicleNumber', 
        headerName: 'Vehicle Number', 
        flex: 1 
    },
    {
        field: 'attachments',
        headerName: 'Attachments',
        width: 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<Dispatch>) => (
            <IconButton onClick={() => handleOpenAttachmentDialog(params.row)}>
              <VisibilityIcon />
            </IconButton>
        )
    }
  ];


  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Dispatch' : 'Create Dispatch'}</Typography>
        <Box component="form" noValidate autoComplete="off">
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => option.name}
                    value={form.customerId}
                    onChange={(_, value) => handleFormChange('customerId', value)}
                    sx={{ width: '50%' }}
                    renderInput={(params) => <TextField {...params} label="Customer Name*" />}
                />
                <TextField
                    label="Address"
                    multiline
                    rows={3}
                    value={form.address}
                    sx={{ width: '50%' }}
                    InputProps={{
                        readOnly: true,
                    }}
                />
            </Box>
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Autocomplete
                    options={transporters}
                    getOptionLabel={(option) => option.name}
                    value={form.transporterId}
                    onChange={(_, value) => handleFormChange('transporterId', value)}
                    sx={{ width: '50%' }}
                    renderInput={(params) => <TextField {...params} label="Transporter" />}
                />
                <TextField
                    label="Vehicle Number*"
                    value={form.vehicleNumber}
                    sx={{ width: '50%' }}
                    onChange={(e) => handleFormChange('vehicleNumber', e.target.value)}
                />
            </Box>
            <Box sx={{ mb: 3 }}>
                <Button startIcon={<UploadFile />} onClick={() => setUploadDialogOpen(true)}>
                    Attachments ({attachments.length})
                </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={resetForm} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : (editingId ? 'Update' : 'Save')}
                </Button>
            </Box>
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ width: '60%' }}>
            <Paper elevation={3} sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={dispatches}
                    columns={columns}
                    getRowId={(row) => row.id}
                    loading={loading}
                    onRowClick={(params) => setSelectedDispatch(params.row as Dispatch)}
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
          <Box sx={{ width: '40%' }}>
            <Paper elevation={3} sx={{ p: 2, height: 500, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">Sale Order Numbers</Typography>
                <Box display="flex" gap={1} my={2}>
                    <TextField 
                        fullWidth
                        size="small"
                        placeholder={selectedDispatch ? "Enter SO Number" : "Select a dispatch first"}
                        value={soInput}
                        onChange={(e) => setSoInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSO()}
                        disabled={!selectedDispatch || soLoading}
                    />
                    <Button variant="contained" onClick={handleAddSO} disabled={!selectedDispatch || soLoading}>
                        {soLoading ? <CircularProgress size={24}/> : 'Add'}
                    </Button>
                </Box>
                <Box flexGrow={1} overflow="auto">
                    <List>
                        {soLoading && dispatchSOs.length === 0 ? (
                             <Box sx={{ display: 'flex', justifyContent: 'center', p: 2}}><CircularProgress/></Box>
                        ) : dispatchSOs.length === 0 ? (
                            <Typography sx={{textAlign: 'center', color: 'text.secondary', mt: 2}}>
                                Select a Dispatch first
                            </Typography>
                        ) : dispatchSOs.map(so => (
                            <ListItem key={so.id} secondaryAction={
                                <IconButton edge="end" onClick={() => handleDeleteSO(so.id)}>
                                    <Delete/>
                                </IconButton>
                            }>
                                <ListItemText primary={so.saleOrderNumber}/>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Paper>
          </Box>
      </Box>
      
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} fullWidth>
        <DialogTitle>
          Upload Attachments
          <IconButton onClick={() => setUploadDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><Close/></IconButton>
        </DialogTitle>
        <DialogContent>
            <Box {...getRootProps()} sx={{ p: 4, border: '2px dashed #ccc', textAlign: 'center', cursor: 'pointer' }}>
                <input {...getInputProps()} />
                <Typography>Drag 'n' drop some files here, or click to select files</Typography>
            </Box>
            <List>
                {attachments.map((file, index) => (
                    <ListItem key={index} secondaryAction={
                        <IconButton edge="end" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}>
                            <Delete/>
                        </IconButton>
                    }>
                        <ListItemIcon><FilePresent /></ListItemIcon>
                        <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                    </ListItem>
                ))}
            </List>
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}><Edit sx={{mr: 1}}/> Edit</MenuItem>
        <MenuItem onClick={handleGeneratePdf}><PictureAsPdf sx={{mr: 1}}/> PDF</MenuItem>
      </Menu>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}