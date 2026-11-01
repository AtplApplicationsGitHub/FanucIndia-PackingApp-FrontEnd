"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";

import AuditExcelPreview from "../bom/AuditExcelPreview";
import type { AuditRow } from "../../types/audit";

type Props = {
  open: boolean;
  title: string;
  rows: AuditRow[];
  onClose: () => void;
};

export default function AuditMaterialsDialog({
  open,
  title,
  rows,
  onClose,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
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
        {title.toUpperCase()}
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 0.5, pb: 2.5 }}>
        <AuditExcelPreview
          title={title}
          rows={rows}
          headers={["Storage", "Material Code", "Expected Qty"]}
        />
      </DialogContent>
    </Dialog>
  );
}
