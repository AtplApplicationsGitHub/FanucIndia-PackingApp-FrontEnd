"use client";

import { useRef, useState } from "react";
import {
  alpha,
  Box,
  Chip,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import { FileSpreadsheet, Upload, X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  showUploadButton?: boolean;
  dragDropOnly?: boolean;
  readOnly?: boolean;
  uploadTooltip?: string;
  hint?: string;
};

export default function ExcelUploadButton({
  file,
  onChange,
  onError,
  disabled = false,
  showUploadButton = false,
  dragDropOnly = false,
  readOnly = false,
  uploadTooltip = "",
  hint = "Required: .xlsx file with Location, Stock, Material and Operator ID (optional)",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (selected: File | null) => {
    if (disabled || readOnly || !selected) return;

    // Validate file type
    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      onError?.("Invalid file type. Please upload a .xlsx file.");
      return;
    }

    onChange(selected);
  };

  const [dragging, setDragging] = useState(false);

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".xlsx"
        disabled={disabled || readOnly}
        onChange={(e) => {
          handlePick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {dragDropOnly ? (
        file ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              minWidth: 0,
            }}
          >
            <FileSpreadsheet size={24} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
                title={file.name}
              >
                {file.name}
              </Typography>
            </Box>
            {!readOnly && (
              <IconButton
                size="small"
                aria-label="Remove file"
                disabled={disabled}
                onClick={() => onChange(null)}
              >
                <X size={17} />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Drag and drop Excel file"
            onClick={() => {
              if (!disabled) inputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (!disabled && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setDragging(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!disabled) handlePick(e.dataTransfer.files?.[0] ?? null);
            }}
            sx={{
              border: "2px dashed",
              borderColor: dragging ? "primary.main" : "divider",
              bgcolor: dragging
                ? (theme) => alpha(theme.palette.primary.main, 0.08)
                : "transparent",
              borderRadius: 2,
              minHeight: 76,
              px: 2,
              py: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              textAlign: "center",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <FileSpreadsheet size={20} style={{ flexShrink: 0 }} />

            <Typography variant="body2" fontWeight={600}>
              Drag & drop Excel file here
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.75rem", textAlign: "center" }}
            >
              {hint}
            </Typography>
          </Box>
        )
      ) : (
        <>
          {/* Upload button and selected file */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              minWidth: 0,
            }}
          >
            {/* Keep upload button visible when requested */}
            {(!file || showUploadButton) && (
              <Tooltip title={uploadTooltip} arrow>
                <span>
                  <CommonButton
                    disabled={disabled}
                    startIcon={<Upload size={16} />}
                    onClick={() => inputRef.current?.click()}
                  >
                    UPLOAD EXCEL
                  </CommonButton>
                </span>
              </Tooltip>
            )}

            {/* Display selected filename */}
            {file && (
              <Tooltip
                title={`${file.name} · ${(file.size / 1024).toFixed(1)} KB`}
              >
                <Chip
                  icon={<FileSpreadsheet size={16} />}
                  label={file.name}
                  onDelete={
                    disabled || readOnly ? undefined : () => onChange(null)
                  }
                  variant="outlined"
                  sx={{
                    maxWidth: 280,
                    height: 34,
                    borderRadius: 1,
                    fontWeight: 600,
                    borderColor: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    "& .MuiChip-icon": {
                      ml: 1,
                    },
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </>
      )}
    </>
  );
}
