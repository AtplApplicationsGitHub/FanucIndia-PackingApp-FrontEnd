"use client";

import { FC, useState, useMemo } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import UploadErpMaterialFileButton from "@/app/admin/material-data/components/UploadErpMaterialFileButton";
import UploadAttachmentDialog from "@/app/admin/material-data/components/UploadAttachmentDialog";
import { MaterialRow } from "../types/material-row";

interface Props {
  onSubmit: (value: string) => void;
  saleOrderNumber: string;
  onFileCreated: () => void;
  disabled?: boolean;
  items: MaterialRow[];
}

const LastUpdatedInfo: FC<{ items: MaterialRow[] }> = ({ items }) => {
  const lastUpdatedItem = useMemo(() => {
    if (!items || items.length === 0) return null;

    const updatedItems = items.filter(item => item.updatedDate);
    if (updatedItems.length === 0) return null;

    return updatedItems.sort((a, b) => new Date(b.updatedDate!).getTime() - new Date(a.updatedDate!).getTime())[0];
  }, [items]);

  if (!lastUpdatedItem || !lastUpdatedItem.updatedBy || !lastUpdatedItem.updatedDate) {
    return <Box sx={{ flex: 1, minWidth: 300 }} />; 
  }

  const formattedDate = new Date(lastUpdatedItem.updatedDate).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <Box sx={{ flex: 1, minWidth: 300, textAlign: 'left' }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Last Updated By: {lastUpdatedItem.updatedBy}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Last Updated At: {formattedDate}
      </Typography>
    </Box>
  );
};

const InputBoxSection: FC<Props> = ({
  onSubmit,
  saleOrderNumber,
  onFileCreated,
  disabled = false,
  items,
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
      <Box display="flex" alignItems="center" justifyContent="center" gap={3} sx={{ mx: "auto" }}>
        <LastUpdatedInfo items={items} />
        
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          gap={2}
          alignItems="center"
          justifyContent="center"
          flex={1.5}
        >
          <TextField
            size="medium"
            label="Scan / Enter Material Code"
            placeholder="e.g., ROB-HAND-001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            inputProps={{ autoFocus: true }}
            disabled={disabled}
            sx={{ width: 350 }}
          />

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

          <UploadErpMaterialFileButton
            saleOrderNumber={saleOrderNumber}
            onCreated={onFileCreated}
            onOpenDialog={() => setOpenUploadDialog(true)}
            buttonProps={{ type: "button", disabled: disabled }}
          />
        </Box>

        <Box flex={1} /> 
      </Box>

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