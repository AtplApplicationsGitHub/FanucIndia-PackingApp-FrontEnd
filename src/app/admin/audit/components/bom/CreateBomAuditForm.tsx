"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../shared/ExcelUploadButton";
import BomAssignPreview from "./BomAssignPreview";

import { planningRoute } from "../../utils/auditRoutes";
import { useCreateBomAudit } from "../../hooks/useCreateBomAudit";
import {
  parseAuditExcel,
  type AuditOperator,
  type ParsedAuditFile,
} from "../../utils/parseAuditExcel";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

const MAX_AUDIT_NAME = 255;

const showError = (message: string) =>
  window.dispatchEvent(
    new CustomEvent("show-global-message", {
      detail: { message, severity: "error" },
    }),
  );

const UPLOAD_HINT =
  "Upload a .xlsx file with Location, Qty, Material and Operator ID columns.";

async function loadOperators(): Promise<AuditOperator[]> {
  const res = await fetchWithAuth(API.AUDIT.OPERATORS);
  const json = await res.json().catch(() => ({}));

  if (!res.ok || !Array.isArray(json.data)) {
    throw new Error("Unable to load operators. Please try again.");
  }

  return json.data as AuditOperator[];
}

export default function CreateBomAuditForm() {
  const router = useRouter();

  const { createBomAudit, loading: creating } = useCreateBomAudit();

  const [auditName, setAuditName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [parsed, setParsed] = useState<ParsedAuditFile | null>(null);

  const [loading, setLoading] = useState(false);

  const parseToken = useRef(0);

  const cleanName = auditName.replace(/\s+/g, " ").trim();

  const nameError = !cleanName
    ? "Audit name is required"
    : cleanName.length > MAX_AUDIT_NAME
      ? `Audit name must be at most ${MAX_AUDIT_NAME} characters`
      : "";

  // Handle Excel file selection
  const handleFileChange = (selected: File | null) => {
    if (parsed || creating || loading) return;

    parseToken.current += 1;

    setFile(selected);
    setParsed(null);
  };

  // Validate Excel and show preview
  const handlePreview = async () => {
    setNameTouched(true);

    if (!file) {
      showError("Please upload the Excel file.");
      return;
    }

    if (nameError) {
      showError(nameError);
      return;
    }

    const token = ++parseToken.current;

    try {
      setLoading(true);

      const operators = await loadOperators();

      const result = await parseAuditExcel(file, operators, {
        requireAuditNameInFile: false,
      });

      if (token !== parseToken.current) return;

      setParsed(result);
    } catch (err) {
      if (token !== parseToken.current) return;

      showError(
        err instanceof Error ? err.message : "Unable to read the Excel file.",
      );
    } finally {
      if (token === parseToken.current) {
        setLoading(false);
      }
    }
  };

  // Release audit after successful preview
  const confirmAudit = async () => {
    setNameTouched(true);

    if (!parsed || !file || nameError || creating) return;

    try {
      await createBomAudit({
        file,
        auditName: cleanName,
      });

      router.replace(planningRoute("bom"));
    } catch (err) {
      setParsed(null);

      showError(
        err instanceof Error ? err.message : "Failed to create BOM audit.",
      );
    }
  };

  const showNameError = nameTouched && !!nameError;
  const busy = creating || loading;
  const locationCount = useMemo(
    () => new Set((parsed?.rows ?? []).map((row) => row.storage)).size,
    [parsed],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ px: 2, pt: 0, pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              width: "fit-content",
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              bgcolor: "background.paper",
            })}
          >
            {parsed && (
              <Typography
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 0.5,
                  color: "error.main",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                AUDIT PREVIEW
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              {/* AUDIT NAME */}
              <TextField
                size="small"
                label="Audit name"
                name="auditName"
                required
                autoComplete="off"
                value={auditName}
                disabled={busy}
                error={showNameError}
                onChange={(e) => {
                  if (parsed || busy) return;

                  setAuditName(e.target.value.slice(0, MAX_AUDIT_NAME));
                  setParsed(null);
                }}
                slotProps={{ input: { readOnly: !!parsed } }}
                sx={{
                  width: { xs: "100%", sm: 360 },
                  "& .MuiFormLabel-asterisk": { color: "error.main" },
                }}
              />

              {/* EXCEL UPLOAD */}
              <Box sx={{ minWidth: 0, display: "flex", alignItems: "center" }}>
                <ExcelUploadButton
                  file={file}
                  onChange={handleFileChange}
                  onError={showError}
                  disabled={busy}
                  readOnly={!!parsed}
                  uploadTooltip={UPLOAD_HINT}
                />
              </Box>

              {/* Confirm & assign - same row as the upload */}
              <CommonButton
                onClick={handlePreview}
                disabled={!file || !!nameError || busy || !!parsed}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "CONFIRM & ASSIGN"
                )}
              </CommonButton>

              <Chip
                size="small"
                disabled={!parsed}
                label={`${locationCount} ${locationCount === 1 ? "location" : "locations"}`}
                sx={(theme) => ({
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.primary.main, 0.3),
                })}
              />

              <CommonButton
                onClick={() => setParsed(null)}
                disabled={!parsed || creating}
              >
                BACK
              </CommonButton>

              <CommonButton
                onClick={confirmAudit}
                disabled={!parsed || creating}
              >
                {creating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "RELEASE AUDIT"
                )}
              </CommonButton>
            </Box>
          </Paper>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Reading the file and checking operators...
            </Typography>
          </Box>
        )}

        {/* AUDIT PREVIEW - disabled and empty until CONFIRM & ASSIGN */}
        <Box sx={{ mt: 1.5 }}>
          <BomAssignPreview
            key={parsed ? "parsed" : "empty"}
            rows={parsed?.rows ?? []}
            disabled={!parsed}
          />
        </Box>
      </Box>
    </Box>
  );
}
