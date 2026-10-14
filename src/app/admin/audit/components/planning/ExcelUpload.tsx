"use client";

import { Button, Stack, Typography } from "@mui/material";
import { UploadFile } from "@mui/icons-material";

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
};

export default function ExcelUpload({ file, onChange }: Props) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2">Excel Upload</Typography>

      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadFile />}
        sx={{ alignSelf: "flex-start" }}
      >
        Choose Excel
        <input
          hidden
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            onChange(e.target.files?.[0] ?? null);
          }}
        />
      </Button>

      <Typography variant="caption" color="text.secondary">
        {file ? file.name : "No Excel file selected"}
      </Typography>
    </Stack>
  );
}
