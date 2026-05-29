import * as React from "react";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { CircularProgress, TextField } from "@mui/material";
import Divider from "@mui/material/Divider";
import CommonButton from "@/common/components/CommonButton";

type Props = {
  open: boolean;
  onConfirm: (password?: string) => void;
  onCancel: () => void;
  loading?: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  confirmColor?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
  requirePassword?: boolean;
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
  requirePassword = false,
}: Props) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) setPassword("");
  }, [open]);

  const handleConfirm = () => {
    onConfirm(requirePassword ? password : undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
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
        <DialogContentText sx={{ textAlign: "center" }}>
          {description}
        </DialogContentText>
        {requirePassword && (
          <TextField
            margin="dense"
            label="Super Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 3 }}
          />
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, pb: 2}}>
        <CommonButton onClick={onCancel} disabled={loading}>
          CANCEL
        </CommonButton>
        <CommonButton 
          onClick={handleConfirm} 
          disabled={loading || (requirePassword && !password)}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : confirmText}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}