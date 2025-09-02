"use client";

import { FC, useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import UploadErpMaterialFileButton from "@/app/admin/material-data/components/UploadErpMaterialFileButton";
import UploadAttachmentDialog from "@/app/admin/material-data/components/UploadAttachmentDialog";

interface Props {
  onSubmit: (value: string) => void;
  saleOrderNumber: string;
  onFileCreated: () => void;
  disabled?: boolean;
}

const InputBoxSection: FC<Props> = ({
  onSubmit,
  saleOrderNumber,
  onFileCreated,
  disabled = false,
}) => {
  const [value, setValue] = useState("");
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = value.trim();
      if (!v) return;
      onSubmit(v);
      setValue("");
    }
  };

  return (
    <div className="w-full">
      <Box sx={{ maxWidth: 550, mx: "auto" }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          gap={3}
          alignItems="center"
          justifyContent="center"
        >
          <TextField
            fullWidth
            size="small"
            label="Scan / Enter Material Code"
            placeholder="e.g., ROB-HAND-001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            inputProps={{ autoFocus: true }}
            disabled={disabled}
          />

          {/* Ghost submit button (unchanged behavior) */}
          <Button
            type="submit"
            sx={(theme) => ({
              color: theme.palette.text.primary,
              "&:hover": { backgroundColor: theme.palette.action.hover },
              borderRadius: 0,
              minHeight: 40,
              minWidth: 112,
              whiteSpace: "nowrap",
              "& .MuiButton-startIcon": { mr: 1 },
            })}
            disabled={disabled}
          >
            Submit
          </Button>

          {/* Bulk Upload opens dialog */}
          <UploadErpMaterialFileButton
            saleOrderNumber={saleOrderNumber}
            onCreated={onFileCreated}
            onOpenDialog={() => setOpenUploadDialog(true)}
            buttonProps={{ type: "button", disabled: disabled }}
          />
        </Box>
      </Box>

      {/* The actual dialog with DnD area + table */}
      <UploadAttachmentDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        saleOrderNumber={saleOrderNumber}
        onUploaded={onFileCreated} 
      />
    </div>
  );
};

export default InputBoxSection;
