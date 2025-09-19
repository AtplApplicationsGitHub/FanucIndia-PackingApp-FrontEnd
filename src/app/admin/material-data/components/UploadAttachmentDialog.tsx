"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useDropzone } from "react-dropzone";
import {
  uploadMaterialFile,
  getMaterialFilesBySaleOrder,
  deleteMaterialFile,
  updateMaterialFile,
} from "@/common/services/materialFile.service";
import type { MaterialFile } from "@/app/admin/material-files/types/material-file";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

type Row = {
  id: number; // local row id
  name: string; // display name
  previewUrl?: string; // for new files only
  uploading: boolean;
  uploaded: boolean;
  error?: string | null;

  // DB linkage after upload or from preload
  dbId?: number;

  // local description draft (for editable cell)
  editing?: boolean;
  descDraft?: string;
  saving?: boolean;

  // differentiate items that came from server preload
  persisted?: boolean;

  // hold File only for brand-new (pre-upload) rows
  file?: File;
};

export default function UploadAttachmentDialog({
  open,
  onClose,
  saleOrderNumber,
  onUploaded, // parent should reload table; DO NOT close dialog here
  onAttachedCountChange, // NEW
}: {
  open: boolean;
  onClose: () => void;
  saleOrderNumber: string;
  onUploaded?: () => void;
  onAttachedCountChange?: (count: number) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (!open) onAttachedCountChange?.(0);
  }, [open, onAttachedCountChange]);

  // Load already-uploaded files when dialog opens
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || !saleOrderNumber) return;
      setLoadingList(true);
      try {
        const items = await getMaterialFilesBySaleOrder(saleOrderNumber);
        if (cancelled) return;
        const mapped: Row[] = items.map((it) => ({
          id: -it.ID, // negative to avoid clashing with local Date.now ids
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
        // optionally toast an error; keep dialog usable for new uploads
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, saleOrderNumber]);

  // Report the current visible file count to the parent
  useEffect(() => {
    if (!onAttachedCountChange) return;
    if (!open) {
      onAttachedCountChange(0); // reset when dialog closes
      return;
    }
    onAttachedCountChange(rows.length); // if you soft-delete: rows.filter(r => !r.deleted).length
  }, [open, rows, onAttachedCountChange]);

  // Begin upload of a single newly added file
  const startUpload = useCallback(
    async (r: Row) => {
      if (!r.file) return;
      // mark uploading
      setRows((prev) =>
        prev.map((x) =>
          x.id === r.id ? { ...x, uploading: true, error: null } : x
        )
      );
      try {
        const res = await uploadMaterialFile(
          r.file,
          saleOrderNumber,
          undefined
        );
        const created: MaterialFile | undefined = res?.items?.[0] ?? res;
        const newId = created?.ID;

        setRows((prev) =>
          prev.map((x) =>
            x.id === r.id
              ? {
                  ...x,
                  uploading: false,
                  uploaded: true,
                  dbId: newId,
                  descDraft: created?.description || "",
                  persisted: true,
                }
              : x
          )
        );
        onUploaded?.();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setRows((prev) =>
          prev.map((x) =>
            x.id === r.id
              ? {
                  ...x,
                  uploading: false,
                  uploaded: false,
                  error: msg,
                }
              : x
          )
        );
      }
    },
    [saleOrderNumber, onUploaded]
  );

  // Drop handler -> add rows locally and auto-upload
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
      newRows.forEach((r) => {
        void startUpload(r);
      });
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const hasFiles = rows.length > 0;
  const allDone = useMemo(
    () => rows.length > 0 && rows.every((r) => r.uploaded || r.error),
    [rows]
  );

  const handleDelete = async (r: Row) => {
    if (r.dbId) {
      try {
        await deleteMaterialFile(r.dbId);
        setRows((prev) => prev.filter((x) => x.id !== r.id));
        onUploaded?.();
      } catch {
        return;
      }
    } else {
      setRows((prev) => prev.filter((x) => x.id !== r.id));
    }
  };

  // Description editing inside the dialog
  const beginEdit = (r: Row) => {
    if (!r.uploaded || !r.dbId) return; // cannot edit until server row exists
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
      onUploaded?.(); // keep main table in sync
    } finally {
      setRows((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, saving: false } : x))
      );
    }
  };

  const openPersistedWithAuth = async (r: Row) => {
    if (!r.dbId) return;
    const url = `${API.ERP_MATERIAL_FILES.BY_ID(r.dbId)}/download`;

    // open a tab synchronously to avoid popup blockers
    const w = window.open("", "_blank");
    if (!w) return; // popup blocked

    try {
      const res = await fetchWithAuth(url, { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      w.location.href = objUrl;
      // clean up after awhile
      setTimeout(() => URL.revokeObjectURL(objUrl), 60_000);
    } catch {
      w.document.write(
        '<p style="font-family:sans-serif">Failed to open file.</p>'
      );
      w.document.close();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        ATTACHMENT
        <IconButton size="small" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Paper
          variant="outlined"
          {...getRootProps()}
          sx={{
            mt: 1,
            mb: 2,
            p: 3,
            borderStyle: "dashed",
            textAlign: "center",
            bgcolor: isDragActive ? "action.hover" : "background.paper",
            cursor: "pointer",
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon />
          <Typography sx={{ mt: 1, fontWeight: 600 }}>
            Drag your files here or click this area.
          </Typography>
          {!hasFiles && !loadingList && (
            <Typography variant="body2" color="text.secondary">
              Files start uploading automatically.
            </Typography>
          )}
          {loadingList && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress />
            </Box>
          )}
        </Paper>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sl. No</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
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

                  {/* Description */}
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

                  {/* Status */}
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

                  {/* Actions */}
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
                      title={r.dbId ? "Delete from server" : "Remove from list"}
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

        {allDone && rows.length > 0 && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              All uploads completed. You can close this dialog.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
