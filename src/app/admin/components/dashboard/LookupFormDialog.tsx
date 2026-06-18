import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  useTheme,
  IconButton,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CommonButton from "@/common/components/CommonButton";

type Props = {
  open: boolean;
  title: string;
  fields: string[];
  initialValues: Record<string, string | number | boolean | null | undefined>;
  onClose: () => void;
  onSave: (
    data: Record<string, string | number | boolean | null | undefined>,
  ) => void;
  loading: boolean;
};

export default function LookupFormDialog({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSave,
  loading,
}: Props) {
  const theme = useTheme();
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean | null | undefined>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFormData(initialValues || {});
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, initialValues]);

  const handleChange = (
    key: string,
    value: string | number | boolean | null | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const normalizedData = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [
        k,
        typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v,
      ]),
    );
    onSave(normalizedData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 700,
          fontSize: "20px",
          letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}
      >
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={1}>
          {(() => {
            const rendered: React.ReactNode[] = [];
            for (let i = 0; i < fields.length; i++) {
              const key = fields[i];
              const isBoolean =
                key === "acceptBulkData" || key === "remarksRequired";
              const nextKey = fields[i + 1];
              const nextIsBoolean =
                nextKey === "acceptBulkData" || nextKey === "remarksRequired";

              if (isBoolean && nextIsBoolean) {
                rendered.push(
                  <Box key={`${key}-${nextKey}`} display="flex" gap={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label={key.replace(/([A-Z])/g, " $1")}
                      variant="outlined"
                      value={String(formData[key] ?? "false")}
                      onChange={(e) =>
                        handleChange(key, e.target.value === "true")
                      }
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label={nextKey.replace(/([A-Z])/g, " $1")}
                      variant="outlined"
                      value={String(formData[nextKey] ?? "false")}
                      onChange={(e) =>
                        handleChange(nextKey, e.target.value === "true")
                      }
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </TextField>
                  </Box>,
                );
                i++; // skip next since we handled it
              } else if (isBoolean) {
                rendered.push(
                  <TextField
                    key={key}
                    select
                    fullWidth
                    size="small"
                    label={key.replace(/([A-Z])/g, " $1")}
                    variant="outlined"
                    value={String(formData[key] ?? "false")}
                    onChange={(e) =>
                      handleChange(key, e.target.value === "true")
                    }
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </TextField>,
                );
              } else {
                rendered.push(
                  <TextField
                    key={key}
                    inputRef={i === 0 ? inputRef : undefined}
                    margin="dense"
                    size="small"
                    label={key.replace(/([A-Z])/g, " $1")}
                    value={formData[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />,
                );
              }
            }
            return rendered;
          })()}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1, gap: 1 }}>
        <CommonButton onClick={handleSave} disabled={loading}>
          {loading ? "SAVING..." : "SAVE"}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}
