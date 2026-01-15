import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  useTheme,
} from "@mui/material";

type Props = {
  open: boolean;
  title: string;
  fields: string[];
  initialValues: Record<string, any>;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
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
  const [formData, setFormData] = useState<Record<string, any>>({});

  const buttonSx = {
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 100, // Slightly smaller min-width for dialog buttons if needed
    height: 40,
    px: 3,
    textTransform: "none" as const,
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

  useEffect(() => {
    if (open) {
      setFormData(initialValues || {});
    }
  }, [open, initialValues]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          {fields.map((key) => {
            const isBoolean = key === "acceptBulkData" || key === "remarksRequired";
            
            if (isBoolean) {
              return (
                <FormControl key={key}>
                  <FormLabel sx={{ textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, " $1")}
                  </FormLabel>
                  <RadioGroup
                    row
                    value={String(formData[key] ?? "false")}
                    onChange={(e) => handleChange(key, e.target.value === "true")}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Yes" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              );
            }

            return (
              <TextField
                key={key}
                label={key.replace(/([A-Z])/g, " $1")}
                value={formData[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ textTransform: "capitalize" }}
              />
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} sx={buttonSx}>
          Cancel
        </Button>
        <Button onClick={handleSave} sx={buttonSx} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}