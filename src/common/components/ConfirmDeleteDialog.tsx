import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

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
  confirmText = "Confirm",
  confirmColor = "primary",
}: Props) {
  const theme = useTheme();

  const baseButtonSx = {
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 120,
    height: 40,
    px: 3,
    textTransform: "uppercase",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    bgcolor: theme.palette.action.hover, 
    color: theme.palette.text.primary,
    "&:disabled": {
      opacity: 0.6,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ color: theme.palette.secondary.main, textTransform: 'uppercase', fontWeight: 'bold' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ gap: 2, px: 3, pb: 3 }}>
        
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            ...baseButtonSx,
            "&:hover": {
              bgcolor: theme.palette.primary.main, 
              color: theme.palette.primary.contrastText,
              boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
            },
          }}
        >
          CANCEL
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          sx={{
            ...baseButtonSx,
            "&:hover": {
              bgcolor: confirmColor === 'error' ? theme.palette.secondary.main : theme.palette.primary.main,
              color: confirmColor === 'error' ? '#fff' : theme.palette.primary.contrastText,
              boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}