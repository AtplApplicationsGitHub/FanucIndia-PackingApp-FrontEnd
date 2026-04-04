import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { CircularProgress } from "@mui/material";
import Divider from "@mui/material/Divider";
import CommonButton from "@/common/components/CommonButton";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  confirmColor?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
};

export default function ConfirmDeleteDialog({
  open,
  onConfirm,
  onCancel,
  loading = false,
  title = "Delete Confirmation",
  description = "Are you sure you want to proceed? This action may not be reversible.",
  confirmText = "CONFIRM",
  confirmColor = "primary",
}: Props) {


  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          fontWeight: 700,
          fontSize: 20,
          textAlign: "center",
          letterSpacing: 0,
          color: "secondary.main",
          textTransform: "uppercase",
          py: 1,
          px: 3,
        }}
      >
        {title}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ gap: 0.2, px: 3, py: 1.5 }}>
        <CommonButton onClick={onCancel} disabled={loading}>
          CANCEL
        </CommonButton>
        <CommonButton onClick={onConfirm} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : confirmText}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}