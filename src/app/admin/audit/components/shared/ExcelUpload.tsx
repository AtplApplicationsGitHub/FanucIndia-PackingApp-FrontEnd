"use client";

import { useRef } from "react";
import { alpha, Box, Button, Chip, Tooltip } from "@mui/material";
import { FileSpreadsheet, Upload } from "lucide-react";

const MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  showUploadButton?: boolean;
};

export default function ExcelUploadButton({
  file,
  onChange,
  onError,
  disabled = false,
  showUploadButton = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (selected: File | null) => {
    if (!selected) return;

    // Allow only .xlsx files
    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      onError?.("Invalid file type. Please upload a .xlsx file.");
      return;
    }

    // Maximum file size: 10 MB
    if (selected.size > MAX_BYTES) {
      onError?.("File larger than 10 MB");
      return;
    }

    onChange(selected);
  };

  return (
    <>
      {/* HIDDEN FILE INPUT */}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".xlsx"
        onChange={(e) => {
          handlePick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          minWidth: 0,
        }}
      >
        {/* UPLOAD BUTTON */}
        {(!file || showUploadButton) && (
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            disabled={disabled}
            startIcon={<Upload size={16} />}
            onClick={() => inputRef.current?.click()}
            sx={{
              height: 34,
              textTransform: "none",
              fontWeight: 600,
              whiteSpace: "nowrap",
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            Upload Excel
          </Button>
        )}

        {/* SELECTED FILE */}
        {file && (
          <Tooltip title={`${file.name} · ${(file.size / 1024).toFixed(1)} KB`}>
            <Chip
              icon={<FileSpreadsheet size={16} />}
              label={file.name}
              onDelete={disabled ? undefined : () => onChange(null)}
              variant="outlined"
              sx={{
                maxWidth: 280,
                fontWeight: 600,
                borderColor: "primary.main",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                "& .MuiChip-icon": {
                  ml: 1,
                },
              }}
            />
          </Tooltip>
        )}
      </Box>
    </>
  );
}
