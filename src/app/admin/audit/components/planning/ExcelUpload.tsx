"use client";

import { useState } from "react";

import { alpha, Alert, Box, IconButton, Typography } from "@mui/material";
import { UploadCloud, X as CloseIcon, FileSpreadsheet } from "lucide-react";

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
};

export default function ExcelUpload({ file, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      setError(null);
      onChange(selectedFile);
    } else {
      setError("Invalid file type. Please upload a .xlsx file.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <Box>
      <input
        id="audit-file-upload"
        type="file"
        hidden
        accept=".xlsx"
        onChange={(e) => {
          handleFileChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {!file ? (
        <Box
          component="label"
          htmlFor="audit-file-upload"
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          sx={{
            py: 3,
            px: 2,
            border: (theme) =>
              `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: "pointer",
            bgcolor: isDragging ? "action.hover" : "transparent",
            transition: "background-color 0.2s, border-color 0.2s",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
        >
          <UploadCloud size={26} color="grey" />
          <Typography fontSize={15} fontWeight={500} color="text.primary">
            Click or drag to upload
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Supports: .xlsx
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            border: (theme) => `1px solid ${theme.palette.primary.main}`,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              flexShrink: 0,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
            }}
          >
            <FileSpreadsheet size={15} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>
              {file.name}
            </Typography>
          </Box>

          <IconButton
            onClick={() => onChange(null)}
            size="small"
            aria-label="Remove file"
          >
            <CloseIcon size={18} />
          </IconButton>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
