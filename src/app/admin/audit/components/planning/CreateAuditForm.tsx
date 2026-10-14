"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ExcelUpload from "./ExcelUpload";
import OperatorSelect from "./OperatorSelect";
import AuditExcelPreview from "./AuditExcelPreview";

import { parseAuditExcel } from "../../utils/parseAuditExcel";
import { useAuditPlans } from "../../hooks/useAuditPlans";
import { AUDIT_LABELS } from "../../mock/auditMockData";

import type { AuditRow, AuditType } from "../../types/audit";

export default function CreateAuditForm({
  auditType,
}: {
  auditType: AuditType;
}) {
  const router = useRouter();
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

  const generateAudit = async () => {
    resetPreview();

    if (!name.trim() || !operator || !file) {
      setError("Audit Name, Excel Upload and Operator are required.");
      return;
    }

    try {
      setLoading(true);

      const result = await parseAuditExcel(file, auditType);

      setRows(result);
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

      router.push("/admin/audit/planning");
    } catch {
      setError("Unable to save the mock audit.");
    }
  };

  return (
    <Box>
      <Button
        onClick={() => router.push("/admin/audit/planning")}
        sx={{ mb: 1 }}
      >
        Back to Audit Planning
      </Button>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        {AUDIT_LABELS[auditType]} – Create Audit
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload stock data, generate a preview and assign an operator.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
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

          <ExcelUpload
            file={file}
            onChange={(selectedFile) => {
              setFile(selectedFile);
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

          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Button
              variant="contained"
              disabled={loading}
              onClick={generateAudit}
              sx={{
                bgcolor: "#ffd000",
                color: "#111",
                "&:hover": { bgcolor: "#e8be00" },
              }}
            >
              {loading ? "Reading Excel..." : "Generate Audit Plan"}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {rows && (
        <>
          <AuditExcelPreview rows={rows} />

          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography sx={{ mb: 2 }}>
              Confirm assigning {rows.length} records to{" "}
              <strong>{operator}</strong>?
            </Typography>

            <Button
              variant="contained"
              onClick={confirmAudit}
              sx={{
                bgcolor: "#ffd000",
                color: "#111",
                "&:hover": { bgcolor: "#e8be00" },
              }}
            >
              Confirm & Assign (Mock)
            </Button>
          </Paper>
        </>
      )}
    </Box>
  );
}
