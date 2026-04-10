"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  LinearProgress,
  Tooltip,
  TextField,
  CircularProgress,
  TableContainer,
  useTheme,
  alpha,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useDropzone } from "react-dropzone";
import {
  uploadMaterialFiles,
  getMaterialFilesBySaleOrder,
  deleteMaterialFile,
  updateMaterialFile,
} from "@/common/services/materialFile.service";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { UploadCloud } from "lucide-react";

type Row = {
  id: number;
  name: string;
  previewUrl?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string | null;
  dbId?: number;
  editing?: boolean;
  descDraft?: string;
  saving?: boolean;
  persisted?: boolean;
  file?: File;
};

export default function UploadAttachmentDialog({
  open,
  onClose,
  saleOrderNumber,
  onUploaded,
  onAttachedCountChange,
}: {
  open: boolean;
  onClose: () => void;
  saleOrderNumber: string;
  onUploaded?: () => void;
  onAttachedCountChange?: (count: number) => void;
}) {
  const theme = useTheme();
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (!open) onAttachedCountChange?.(0);
  }, [open, onAttachedCountChange]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || !saleOrderNumber) return;
      setLoadingList(true);
      try {
        const items = await getMaterialFilesBySaleOrder(saleOrderNumber);
        if (cancelled) return;
        const mapped: Row[] = items.map((it) => ({
          id: -it.ID,
          name: it.fileName,
          uploading: false,
          uploaded: true,
          error: null,
          dbId: it.ID,
          editing: false,
          descDraft: it.description || "",
          saving: false,
          persisted: true,
        }));
        setRows(mapped);
      } catch {
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, saleOrderNumber]);

  useEffect(() => {
    if (!onAttachedCountChange) return;
    if (!open) {
      onAttachedCountChange(0);
      return;
    }
    onAttachedCountChange(rows.length);
  }, [open, rows, onAttachedCountChange]);

  const startBatchUpload = useCallback(
    async (batchRows: Row[]) => {
      setRows((prev) =>
        prev.map((x) =>
          batchRows.some((b) => b.id === x.id)
            ? { ...x, uploading: true, error: null }
            : x
        )
      );

      try {
        const filesToUpload = batchRows
          .map((r) => r.file)
          .filter((f): f is File => !!f);

        if (filesToUpload.length === 0) return;

        const res = await uploadMaterialFiles(
          saleOrderNumber,
          undefined,
          filesToUpload
        );

        const createdItems = res.items || [];

        setRows((prev) =>
          prev.map((x) => {
            const indexInBatch = batchRows.findIndex((b) => b.id === x.id);
            if (indexInBatch !== -1) {
              const created = createdItems[indexInBatch];
              return {
                ...x,
                uploading: false,
                uploaded: true,
                dbId: created?.ID,
                descDraft: created?.description || "",
                persisted: true,
              };
            }
            return x;
          })
        );
        onUploaded?.();
        setSnackbarMessage("Files uploaded successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setRows((prev) =>
          prev.map((x) =>
            batchRows.some((b) => b.id === x.id)
              ? { ...x, uploading: false, uploaded: false, error: msg }
              : x
          )
        );
      }
    },
    [saleOrderNumber, onUploaded]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const now = Date.now();
      const newRows: Row[] = accepted.map((f, ix) => ({
        id: now + ix,
        name: f.name,
        file: f,
        previewUrl: URL.createObjectURL(f),
        uploading: false,
        uploaded: false,
        error: null,
        editing: false,
        descDraft: "",
        saving: false,
        persisted: false,
      }));

      setRows((prev) => [...newRows, ...prev]);

      if (newRows.length > 0) {
        void startBatchUpload(newRows);
      }
    },
    [startBatchUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const hasFiles = rows.length > 0;

  const handleDelete = async (r: Row) => {
    if (r.dbId) {
      try {
        await deleteMaterialFile(r.dbId);
        setRows((prev) => prev.filter((x) => x.id !== r.id));
        onUploaded?.();
        setSnackbarMessage("File deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch {
        return;
      }
    } else {
      setRows((prev) => prev.filter((x) => x.id !== r.id));
    }
  };

  const beginEdit = (r: Row) => {
    if (!r.uploaded || !r.dbId) return;
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, editing: true } : x))
    );
  };

  const saveDesc = async (r: Row, value: string) => {
    if (!r.dbId) return;
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, saving: true } : x))
    );
    try {
      await updateMaterialFile(r.dbId, { description: value });
      setRows((prev) =>
        prev.map((x) =>
          x.id === r.id
            ? { ...x, editing: false, saving: false, descDraft: value }
            : x
        )
      );
      onUploaded?.();
      setSnackbarMessage("File description saved successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } finally {
      setRows((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, saving: false } : x))
      );
    }
  };

  const openPersistedWithAuth = async (r: Row) => {
    if (!r.dbId) return;
    const url = `${API.ERP_MATERIAL_FILES.BY_ID(r.dbId)}/download`;
    const w = window.open("", "_blank");
    if (!w) return;

    try {
      const res = await fetchWithAuth(url, { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      w.location.href = objUrl;
      setTimeout(() => URL.revokeObjectURL(objUrl), 60_000);
    } catch {
      w.document.write(
        '<p style="font-family:sans-serif">Failed to open file.</p>'
      );
      w.document.close();
    }
  };

  const headerBg = theme.palette.primary.main;
  const headerText = theme.palette.primary.contrastText;
  const titleColor = theme.palette.secondary.main;
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle
        sx={{
          display: "flex", justifyContent: "center", alignItems: "center",
          fontWeight: 700, fontSize: "20px", letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}
      >
        ATTACHMENTS
        <IconButton size="small" onClick={onClose} sx={{ position: "absolute", right: 12 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            mb: 2,
            p: 8,
            border: (theme) => `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            transition: 'background-color 0.2s, border-color 0.2s',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          <input {...getInputProps()} />
          <UploadCloud size={30} color="grey" />
          <Typography fontSize={17} fontWeight={500} color="text.primary">
            Click or drag to upload
          </Typography>
          <Typography fontSize={15} color="text.secondary">
            Supports all file types
          </Typography>
          {loadingList && (
            <Box sx={{ mt: 1, width: '100%' }}>
              <LinearProgress />
            </Box>
          )}
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
          <Table
            size="small"
            sx={{
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                backgroundColor: lightYellow,
              },
            }}
          >
            <TableHead sx={{ bgcolor: headerBg }}>
              <TableRow>
                <TableCell sx={{ color: headerText, fontWeight: "bold" }}>S.No</TableCell>
                <TableCell sx={{ color: headerText, fontWeight: "bold" }}>File Name</TableCell>
                <TableCell sx={{ color: headerText, fontWeight: "bold" }}>Description</TableCell>
                <TableCell sx={{ color: headerText, fontWeight: "bold" }}>Status</TableCell>
                <TableCell align="center" sx={{ color: headerText, fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, idx) => {
                const canEdit = r.uploaded && !!r.dbId;
                const hasValue = !!r.descDraft && r.descDraft.trim().length > 0;

                return (
                  <TableRow key={r.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell sx={{ maxWidth: 420 }}>
                      {r.editing ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <TextField
                            variant="outlined"
                            multiline
                            minRows={2}
                            maxRows={6}
                            fullWidth
                            autoFocus
                            value={r.descDraft || ""}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((x) =>
                                  x.id === r.id
                                    ? { ...x, descDraft: e.target.value }
                                    : x
                                )
                              )
                            }
                            onBlur={(e) => void saveDesc(r, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void saveDesc(
                                  r,
                                  (e.target as HTMLInputElement).value
                                );
                              }
                            }}
                            placeholder="Type description… (Enter saves, Shift+Enter = new line)"
                          />
                          {r.saving && (
                            <CircularProgress size={18} sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: canEdit ? "text.primary" : "text.disabled",
                            cursor: canEdit
                              ? hasValue
                                ? "default"
                                : "text"
                              : "not-allowed",
                          }}
                          onClick={() => {
                            if (canEdit && !hasValue) beginEdit(r);
                          }}
                          onDoubleClick={() => {
                            if (canEdit && hasValue) beginEdit(r);
                          }}
                          title={
                            !canEdit
                              ? "Description becomes editable after upload"
                              : hasValue
                                ? "Double-click to edit"
                                : "Click to add description"
                          }
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {hasValue
                              ? r.descDraft
                              : canEdit
                                ? "Add a description…"
                                : "Uploading…"}
                          </Typography>
                          {r.saving && <CircularProgress size={16} />}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      {r.uploading && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LinearProgress sx={{ flex: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            Uploading…
                          </Typography>
                        </Box>
                      )}
                      {!r.uploading && r.uploaded && (
                        <Typography variant="body2" color="success.main">
                          Uploaded
                        </Typography>
                      )}
                      {!r.uploading && r.error && (
                        <Typography variant="body2" color="error.main">
                          {r.error}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="View">
                        <span>
                          <IconButton
                            size="small"
                            aria-label="view"
                            onClick={() => {
                              if (r.dbId) {
                                void openPersistedWithAuth(r);
                              } else if (r.previewUrl) {
                                window.open(r.previewUrl, "_blank");
                              }
                            }}
                            disabled={!r.dbId && !r.previewUrl}
                            sx={
                              !r.dbId && !r.previewUrl
                                ? { pointerEvents: "none" }
                                : undefined
                            }
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip
                        title={
                          r.dbId ? "Delete from server" : "Remove from list"
                        }
                      >
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => void handleDelete(r)}
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

              {rows.length === 0 && !loadingList && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No files added
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}