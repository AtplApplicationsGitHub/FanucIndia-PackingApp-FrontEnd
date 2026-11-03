"use client";

import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

import { X as CloseIcon } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";

type Props = {
  open: boolean;
  auditName?: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteAuditDialog({
  open,
  auditName,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={() => (deleting ? undefined : onClose())}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          transition: "max-width 0.2s ease",
        },
      }}
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
        DELETE AUDIT
        <IconButton
          onClick={onClose}
          disabled={deleting}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <CloseIcon size={18} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 1 }}>
        <Box mt={1}>
          <Typography variant="body1">
            Are you sure you want to delete audit <strong>{auditName}</strong>?
            The audit and its locations will be deleted permanently. This cannot
            be undone.
          </Typography>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 1, pb: 1, gap: 1 }}>
        <CommonButton disabled={deleting} onClick={onConfirm}>
          {deleting ? <CircularProgress size={22} color="inherit" /> : "DELETE"}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}
