// src/components/common/ConfirmDeleteDialog.tsx

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  title?: string;
  description?: React.ReactNode;
};

export default function ConfirmDeleteDialog({
  open,
  onConfirm,
  onCancel,
  loading = false,
  title = "Delete Order",
  description = "Are you sure you want to delete this order? This action cannot be undone.",
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-delete-dialog-title"
      aria-describedby="confirm-delete-dialog-description"
    >
      <DialogTitle id="confirm-delete-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-delete-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ gap: 2, px: 3, pb: 2 }}>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="outlined"
          color="error"
          sx={{ minWidth: 120, fontWeight: 600 }}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
