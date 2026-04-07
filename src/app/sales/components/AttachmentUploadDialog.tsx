"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, IconButton, Typography, List, Divider,
  ListItem, ListItemIcon, ListItemText, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CommonButton from "@/common/components/CommonButton";
import { UploadCloud } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { isDragging } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
};

export default function AttachmentUploadDialog({ open, onClose, onUpload }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles = Array.from(incoming);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !existingNames.has(f.name))];
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleRemove = (name: string) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleUpload = async () => {
    setUploading(true);
    await onUpload(files);
    setUploading(false);
    setFiles([]);
    onClose();
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{
        display: "flex", justifyContent: "center", alignItems: "center",
        fontWeight: 700, fontSize: "20px", letterSpacing: 0.5,
        color: "error.main",
        pb: 1,
        position: "relative",
      }}>
        UPLOAD ATTACHMENTS
        <IconButton onClick={handleClose} size="small" disabled={uploading} sx={{ position: "absolute", right: 12 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 1 }}>
        {/* Drop Zone */}
        <Box
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: (theme) => `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
            borderColor: dragging ? theme.palette.primary.main : "grey.300",
            borderRadius: 2,
            p: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: "pointer",
            bgcolor: dragging ? "action.hover" : "transparent",
            transition: 'background-color 0.2s, border-color 0.2s',
            mt: 1,
            '&:hover': {
              borderColor: 'primary.main',
            }
          }}
        >
          <UploadCloud size={30} color="#9e9e9e" style={{ marginBottom: 4 }} />
          <Typography fontSize={17} fontWeight={500} color="text.primary">
            Click or drag to upload
          </Typography>
          <Typography fontSize={15} color="text.secondary" >
            Supports all file types
          </Typography>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
        </Box>

        {/* File List */}
        {files.length > 0 && (
          <>
            <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.5 }}>
              Uploaded Files
            </Typography>
            <List dense disablePadding>
              {files.map((file) => (
                <ListItem
                  key={file.name}
                  disablePadding
                  sx={{ py: 0.5 }}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => handleRemove(file.name)} disabled={uploading}>
                      <DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AttachFileIcon fontSize="small" sx={{ color: "#7c3aed" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    primaryTypographyProps={{ fontSize: 13, noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, }}>
        <CommonButton
          disabled={files.length === 0 || uploading}
          onClick={handleUpload}
          startIcon={uploading ? <CircularProgress size={16} sx={{ color: "#000" }} /> : null}
        >
          {uploading ? "UPLOADING..." : `UPLOAD${files.length > 0 ? ` ${files.length} FILE(S)` : ""}`}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}