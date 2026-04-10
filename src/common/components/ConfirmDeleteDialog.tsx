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
  title = "DELETE CONFIRMATION",
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
          display: "flex", justifyContent: "center", alignItems: "center",
          fontWeight: 700, fontSize: "20px", letterSpacing: 0.5,
          color: "error.main",
          pb: 1,
          position: "relative",
        }}
      >
        {title}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText id="confirm-dialog-description" sx={{ textAlign: "center" }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, pb: 2}}>
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