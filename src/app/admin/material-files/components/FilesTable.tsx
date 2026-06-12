import * as React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Typography, Box, TextField, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MaterialFile } from '@/app/admin/material-files/types/material-file';
import { updateMaterialFile } from '@/common/services/materialFile.service';
import { formatDateTimeIST } from "@/common/utils/dateTime";

type Props = {
  rows: MaterialFile[];
  onEdit?: (row: MaterialFile) => void;   // keep if used elsewhere
  onDelete: (row: MaterialFile) => void;
};

const formatBytes = (n?: number | null) => {
  if (!n && n !== 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default function FilesTable({ rows, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<string>('');
  const [savingId, setSavingId] = React.useState<number | null>(null);

  const startEdit = (row: MaterialFile) => {
    setEditingId(row.ID);
    setDraft(row.description || '');
  };

  const stopEdit = () => {
    setEditingId(null);
    setDraft('');
  };

  const save = async (row: MaterialFile, value: string) => {
    // no-op if unchanged
    if ((row.description || '') === value) return stopEdit();
    try {
      setSavingId(row.ID);
      await updateMaterialFile(row.ID, { description: value });
    } finally {
      setSavingId(null);
      stopEdit();
    }
  };

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table size="small" aria-label="ERP material files">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 160 }}>Sale Order #</TableCell>
            <TableCell>File Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell sx={{ width: 120 }}>Size</TableCell>
            <TableCell sx={{ width: 160 }}>MIME Type</TableCell>
            <TableCell sx={{ width: 170 }}>Created At</TableCell>
            <TableCell align="right" sx={{ width: 110 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No files found. Try changing filters or upload new files.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => {
            const isEditing = editingId === row.ID;
            const hasValue = !!row.description && row.description.trim().length > 0;

            return (
              <TableRow key={row.ID} hover>
                <TableCell>{row.saleOrderNumber || '—'}</TableCell>
                <TableCell>{row.fileName}</TableCell>

                <TableCell sx={{ maxWidth: 480 }}>
                  {/* EDIT MODE */}
                  {isEditing ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <TextField
                        variant="outlined"
                        multiline
                        minRows={2}
                        maxRows={8}
                        fullWidth
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => void save(row, draft)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void save(row, draft);
                          }
                        }}
                        placeholder="Type description… (Enter saves, Shift+Enter = new line)"
                      />
                      {savingId === row.ID && <CircularProgress size={18} sx={{ mt: 0.5 }} />}
                    </Box>
                  ) : (
                    // VIEW MODE
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: hasValue ? 'default' : 'text',
                      }}
                      onClick={() => {
                        // Single-click to edit only when empty
                        if (!hasValue) startEdit(row);
                      }}
                      onDoubleClick={() => {
                        // Double-click to edit when it has value
                        if (hasValue) startEdit(row);
                      }}
                      title={hasValue ? 'Double-click to edit' : 'Click to add description'}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          whiteSpace: 'pre-wrap',
                        }}
                        color={hasValue ? 'text.primary' : 'text.disabled'}
                      >
                        {hasValue ? row.description : 'Add a description…'}
                      </Typography>
                      {savingId === row.ID && <CircularProgress size={16} />}
                    </Box>
                  )}
                </TableCell>

                <TableCell>{formatBytes(row.fileSizeBytes)}</TableCell>
                <TableCell>{row.mimeType || '—'}</TableCell>
                <TableCell>{formatDateTimeIST(row.createdAt)}</TableCell>

                <TableCell align="right">
                  {onEdit && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(row)} aria-label="edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(row)}
                      aria-label="delete"
                      sx={{ ml: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
