"use client";

import { useState } from "react";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { Download, X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ExcelUpload from "./ExcelUpload";
import AuditExcelPreview from "./AuditExcelPreview";

import { useCreateBomAudit } from "../../hooks/useCreateBomAudit";
import { useDownloadBomTemplate } from "../../hooks/useDownloadBomTemplate";
import {
  parseAuditExcel,
  type AuditOperator,
  type ParsedAuditFile,
} from "../../utils/parseAuditExcel";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { AUDIT_LABELS } from "../../utils/auditLabels";

import type { AuditType } from "../../types/audit";

type Props = {
  open: boolean;
  auditType: AuditType;
  onClose: () => void;
};

/*
 * Create BOM audit from the Excel TEMPLATE.
 * Audit Name (row 1 of the template) and the Operator of every storage bin (dropdown column)
 * now come from the file - the "Audit Name" text box and the Operator dropdown were removed
 * from this form (OperatorSelect.tsx is kept for other screens).
 * One file = one Audit Name; the server creates ONE AUDIT PER OPERATOR.
 */
/** Current USER-role operators - the Operator column of the file is checked against this list */
async function loadOperators(): Promise<AuditOperator[]> {
  const res = await fetchWithAuth(API.BOM_AUDIT.OPERATORS);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(json.data)) {
    throw new Error("Unable to load operators. Please try again.");
  }
  return json.data as AuditOperator[];
}

export default function CreateAuditDialog({ open, auditType, onClose }: Props) {
  const { createBomAudit, loading: creating } = useCreateBomAudit();
  const { downloadTemplate, loading: downloading } = useDownloadBomTemplate();

  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedAuditFile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rows = parsed?.rows ?? null;

  const resetPreview = () => {
    setParsed(null);
    setError("");
  };

  const handleClose = () => {
    setFile(null);
    setParsed(null);
    setError("");
    setLoading(false);
    onClose();
  };

  const handleDownloadTemplate = async () => {
    setError("");
    try {
      await downloadTemplate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download the template.",
      );
    }
  };

  const generateAudit = async () => {
    resetPreview();

    if (!file) {
      setError("Please upload the filled BOM audit template.");
      return;
    }

    try {
      setLoading(true);
      // Operators are checked here, so a wrong operator is shown BEFORE the preview
      const operators = await loadOperators();
      setParsed(await parseAuditExcel(file, operators));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to read the Excel file.",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmAudit = async () => {
    if (!parsed || !file) return;

    try {
      // Audit Name + operators are read from the file by the server
      await createBomAudit({ file });
      handleClose();
    } catch (err) {
      // Back to the upload step: don't show "N audits will be created" next to an error
      setParsed(null);
      setError(
        err instanceof Error ? err.message : "Failed to create BOM audit.",
      );
    }
  };

  const busy = creating || downloading;

  return (
    <Dialog
      open={open}
      onClose={creating ? undefined : handleClose}
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
          disabled={creating}
          size="small"
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 0.5 }}>
        {/* Step 1 - template */}
        <Box
          sx={{
            mt: 3,
            p: 1.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1.5,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700}>
              1. Download the template and fill it
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Type the Audit Name in row 1 and pick an Operator for every
              storage bin from the dropdown. One audit is created per operator.
            </Typography>
          </Box>
          <CommonButton
            onClick={handleDownloadTemplate}
            disabled={busy}
            startIcon={downloading ? undefined : <Download size={16} />}
          >
            {downloading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "DOWNLOAD TEMPLATE"
            )}
          </CommonButton>
        </Box>

        {/* Step 2 - upload */}
        <Typography variant="body2" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
          2. Upload the filled template
        </Typography>
        <ExcelUpload
          file={file}
          onChange={(selectedFile) => {
            setFile(selectedFile);
            resetPreview();
          }}
        />

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              whiteSpace: "pre-line",
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {error}
          </Alert>
        )}

        {parsed && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Audit Name: <strong>{parsed.auditName}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, mb: 0.5 }}>
              {parsed.operators.length} audit
              {parsed.operators.length === 1 ? "" : "s"} will be created (one
              per operator):
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {parsed.operators.map((op) => (
                <Chip
                  key={op.label}
                  size="small"
                  variant="outlined"
                  label={`${op.label} – ${op.bins} bin${op.bins === 1 ? "" : "s"}, ${op.records} records`}
                />
              ))}
            </Box>
          </Box>
        )}

        {rows && (
          <AuditExcelPreview
            rows={rows}
            showOperator
            headers={["Operator", "Storage", "Material Code", "Qty"]}
          />
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {parsed && (
          <Typography variant="body2" sx={{ mr: "auto" }}>
            Assign {parsed.rows.length} records to{" "}
            <strong>
              {parsed.operators.length} operator
              {parsed.operators.length === 1 ? "" : "s"}
            </strong>
          </Typography>
        )}

        {rows ? (
          <>
            <CommonButton onClick={resetPreview} disabled={creating}>
              BACK
            </CommonButton>
            <CommonButton onClick={confirmAudit} disabled={creating}>
              {creating ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "CONFIRM & ASSIGN"
              )}
            </CommonButton>
          </>
        ) : (
          <CommonButton onClick={generateAudit} disabled={loading || busy}>
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
