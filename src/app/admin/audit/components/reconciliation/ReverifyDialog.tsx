"use client";

import { useState } from "react";

import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import OperatorSelect from "../shared/OperatorSelect";

type Props = {
  open: boolean;
  auditNo: string;
  storageBin: string | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: (operatorId: number, operatorName: string) => void;
};

export default function ReverifyDialog({
  open,
  auditNo,
  storageBin,
  saving,
  onClose,
  onConfirm,
}: Props) {
  const [operatorId, setOperatorId] = useState<number | "">("");
  const [operatorName, setOperatorName] = useState("");

  const handleClose = () => {
    setOperatorId("");
    setOperatorName("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : handleClose}
      fullWidth
      maxWidth="xs"
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
        REVERIFY LOCATION
        <IconButton
          onClick={handleClose}
          disabled={saving}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Assign an operator to count <strong>{storageBin}</strong> again. It
          will be created as a new audit linked to <strong>{auditNo}</strong>.
        </Typography>
        <OperatorSelect
          value={operatorId}
          onChange={(id, name) => {
            setOperatorId(id);
            setOperatorName(name);
          }}
        />
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <CommonButton onClick={handleClose} disabled={saving}>
          CANCEL
        </CommonButton>
        <CommonButton
          disabled={saving || operatorId === ""}
          onClick={() => {
            if (operatorId !== "") onConfirm(operatorId, operatorName);
          }}
        >
          {saving ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "CONFIRM & ASSIGN"
          )}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
}
