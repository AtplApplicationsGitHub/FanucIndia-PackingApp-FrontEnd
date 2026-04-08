'use client';
import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, LinearProgress, Tooltip, TextField
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';
import { uploadMaterialFiles } from '@/common/services/materialFile.service';

type Row = {
  id: number;
  file: File;
  previewUrl?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string | null;
};

export default function MultiFileUploadDialog({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void; // parent reloads the table
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [saleOrderNumber, setSaleOrderNumber] = useState('');

  const getErrorMessage = (e: unknown): string => {
    if (typeof e === 'string') return e;
    if (e instanceof Error) return e.message;
    // Some APIs return JSON text; keep generic fallback
    return 'Upload failed';
  };

  const beginUploadBatch = useCallback(async (batch: Row[]) => {
    try {
      // mark uploading
      setRows(prev =>
        prev.map(r =>
          batch.some(b => b.id === r.id)
            ? { ...r, uploading: true, error: null }
            : r
        )
      );

      await uploadMaterialFiles(
        saleOrderNumber.trim() || null,
        null,
        batch.map(b => b.file),
      );

      // mark success
      setRows(prev =>
        prev.map(r =>
          batch.some(b => b.id === r.id)
            ? { ...r, uploading: false, uploaded: true }
            : r
        )
      );

      onUploaded(); // refresh the table so files appear live
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setRows(prev =>
        prev.map(r =>
          batch.some(b => b.id === r.id)
            ? { ...r, uploading: false, uploaded: false, error: msg }
            : r
        )
      );
    }
  }, [saleOrderNumber, onUploaded]);

  const onDrop = useCallback((accepted: File[]) => {
    const now = Date.now();
    const newRows: Row[] = accepted.map((f, ix) => ({
      id: now + ix,
      file: f,
      previewUrl: URL.createObjectURL(f),
      uploading: false,
      uploaded: false,
      error: null,
    }));
    setRows(prev => [...newRows, ...prev]);
    // Auto-upload as one batch (so SO+desc apply once)
    void beginUploadBatch(newRows);
  }, [beginUploadBatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const hasFiles = rows.length > 0;
  const allDone = useMemo(
    () => rows.length > 0 && rows.every(r => r.uploaded || !!r.error),
    [rows]
  );

  const handleView = (r: Row) => {
    if (r.previewUrl) window.open(r.previewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRemove = (id: number) => {
    setRows(prev => {
      const row = prev.find(r => r.id === id);
      if (row?.previewUrl) {
        URL.revokeObjectURL(row.previewUrl);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  // Revoke any remaining object URLs on unmount
  useEffect(() => {
    return () => {
      rows.forEach(r => {
        if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      });
    };
  }, [rows]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Upload files
        <IconButton size="small" onClick={onClose} aria-label="close"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField
            label="Sale Order Number (optional)"
            value={saleOrderNumber}
            onChange={(e) => setSaleOrderNumber(e.target.value)}
            size="small"
            fullWidth
            helperText="If blank, files go to the 'misc' folder"
          />
        </Box>

        <Paper
          variant="outlined"
          {...getRootProps()}
          sx={{
            mt: 1,
            mb: 2,
            p: 3,
            borderStyle: 'dashed',
            textAlign: 'center',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon />
          <Typography sx={{ mt: 1, fontWeight: 600 }}>
            Drag your files here or click this area.
          </Typography>
          {!hasFiles && (
            <Typography variant="body2" color="text.secondary">
              Files will upload automatically.
            </Typography>
          )}
        </Paper>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{r.file.name}</TableCell>
                <TableCell>
                  {r.uploading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress sx={{ flex: 1 }} />
                      <Typography variant="caption" color="text.secondary">Uploading…</Typography>
                    </Box>
                  )}
                  {!r.uploading && r.uploaded && (
                    <Typography variant="body2" color="success.main">Uploaded</Typography>
                  )}
                  {!r.uploading && r.error && (
                    <Typography variant="body2" color="error.main">{r.error}</Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Preview">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleView(r)}
                        aria-label="view"
                        disabled={!r.previewUrl}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Remove from list">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(r.id)}
                      aria-label="delete"
                      sx={{ ml: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No files added
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {allDone && rows.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              All uploads completed. You can close this dialog.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
