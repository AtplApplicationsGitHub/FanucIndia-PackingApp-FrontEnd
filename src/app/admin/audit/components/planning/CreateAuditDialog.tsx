"use client";

import { useState } from "react";

import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ExcelUpload from "./ExcelUpload";
import OperatorSelect from "./OperatorSelect";
import AuditExcelPreview from "./AuditExcelPreview";

import { parseAuditExcel } from "../../utils/parseAuditExcel";
import { useAuditPlans } from "../../hooks/useAuditPlans";
import { AUDIT_LABELS } from "../../mock/auditMockData";

import type { AuditRow, AuditType } from "../../types/audit";

type Props = {
  open: boolean;
  auditType: AuditType;
  onClose: () => void;
};

export default function CreateAuditDialog({ open, auditType, onClose }: Props) {
  const { savePlan } = useAuditPlans();

  const [name, setName] = useState("");
  const [operator, setOperator] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPreview = () => {
    setRows(null);
    setError("");
  };

  const handleClose = () => {
    setName("");
    setOperator("");
    setFile(null);
    setRows(null);
    setError("");
    setLoading(false);
    onClose();
  };

  const generateAudit = async () => {
    resetPreview();

    if (!name.trim() || !operator || !file) {
      setError("Audit Name, Excel Upload and Operator are required.");
      return;
    }

    try {
      setLoading(true);
      setRows(await parseAuditExcel(file, auditType));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to read the Excel file.",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmAudit = () => {
    if (!rows || !file || !operator || !name.trim()) return;

    try {
      savePlan({
        id: crypto.randomUUID(),
        name: name.trim(),
        type: auditType,
        operator,
        fileName: file.name,
        createdAt: new Date().toISOString(),
        status: "Assigned",
        rows,
      });

      handleClose();
    } catch {
      setError("Unable to save the mock audit.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        {AUDIT_LABELS[auditType].toUpperCase()} – CREATE AUDIT
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 0.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mt: 3,
          }}
        >
          <TextField
            label="Audit Name"
            required
            fullWidth
            size="small"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              resetPreview();
            }}
          />

          <OperatorSelect
            value={operator}
            onChange={(value) => {
              setOperator(value);
              resetPreview();
            }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <ExcelUpload
            file={file}
            onChange={(selectedFile) => {
              setFile(selectedFile);
              resetPreview();
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {rows && <AuditExcelPreview rows={rows} />}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {rows && (
          <Typography variant="body2" sx={{ mr: "auto" }}>
            Assign {rows.length} records to <strong>{operator}</strong>
          </Typography>
        )}

        {rows ? (
          <>
            <CommonButton onClick={resetPreview}>BACK</CommonButton>
            <CommonButton onClick={confirmAudit}>CONFIRM & ASSIGN</CommonButton>
          </>
        ) : (
          <CommonButton onClick={generateAudit} disabled={loading}>
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "GENERATE AUDIT PLAN"
            )}
          </CommonButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
