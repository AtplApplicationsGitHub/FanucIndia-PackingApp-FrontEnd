import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, Alert, IconButton
} from '@mui/material';
import { UploadCloud, X as CloseIcon, File as FileIcon } from 'lucide-react';
import axios from 'axios';
import { API } from '@/common/lib/endpoints';
import { useTheme } from '@mui/material/styles';

export default function ErpUploadDialog({ open, onClose, onUploadSuccess, saleOrderNumber }: {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  saleOrderNumber: string | null;
}) {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const buttonSx = {
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 120,
    height: 40,
    px: 3,
    textTransform: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    bgcolor: theme.palette.action.hover, 
    color: theme.palette.text.primary,
    "&:hover": {
      bgcolor: theme.palette.primary.main, 
      color: theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Invalid file type. Please upload a .xlsx, .xls, or .csv file.');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (saleOrderNumber) {
      formData.append('saleOrderNumber', saleOrderNumber);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(API.ERP_IMPORTER.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      onUploadSuccess();
    } catch (err: unknown) {
      let msg = 'An unexpected error occurred.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setLoading(false);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ 
        fontWeight: 600, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: theme.palette.secondary.main, 
        textTransform: 'uppercase'
      }}>
        Upload Material Data
        <IconButton onClick={handleClose} size="small"><CloseIcon size={20} /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box my={1}>
          <Typography variant="body1">
            No material data found for Sales Order <strong>{saleOrderNumber}</strong>.
            Please upload the corresponding Excel or CSV file.
          </Typography>
        </Box>

        {!file ? (
          <Box
            component="label"
            htmlFor="erp-file-upload"
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            sx={{
              mt: 2,
              p: 4,
              border: (theme) => `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragging ? 'action.hover' : 'transparent',
              transition: 'background-color 0.2s, border-color 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
              }
            }}
          >
            <UploadCloud size={40} color="grey" />
            <Typography variant="h6" mt={1}>Click or drag to upload</Typography>
            <Typography variant="caption" color="text.secondary">Supports: .xlsx, .xls, .csv</Typography>
            <input
              id="erp-file-upload"
              type="file"
              hidden
              accept=".xlsx, .xls, .csv"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
            />
          </Box>
        ) : (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FileIcon size={24} />
              <Typography sx={{ fontWeight: 500 }}>{file.name}</Typography>
            </Box>
            <IconButton onClick={() => setFile(null)} size="small" aria-label="Remove file">
              <CloseIcon size={18} />
            </IconButton>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={buttonSx}>Cancel</Button>
        <Button 
          onClick={handleUpload} 
          disabled={!file || loading} 
          sx={buttonSx}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'UPLOAD & VIEW'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}