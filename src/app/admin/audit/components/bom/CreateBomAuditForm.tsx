"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../shared/ExcelUploadButton";
import BomAssignPreview from "./BomAssignPreview";
import TextInput from "@/app/sales/components/forms/TextInput";

import { planningRoute } from "../../utils/auditRoutes";
import { useCreateBomAudit } from "../../hooks/useCreateBomAudit";
import {
  parseAuditExcel,
  type AuditOperator,
  type ParsedAuditFile,
} from "../../utils/parseAuditExcel";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

const MAX_AUDIT_NAME = 255;

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

  const [error, setError] = useState("");
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
    setError("");
  };

  // Validate Excel and show preview
  const handlePreview = async () => {
    setNameTouched(true);
    setError("");

    if (!file) {
      setError("Please upload the Excel file.");
      return;
    }

    if (nameError) return;

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

      setError(
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
      setError("");

      await createBomAudit({
        file,
        auditName: cleanName,
      });

      router.replace(planningRoute("bom"));
    } catch (err) {
      setParsed(null);

      setError(
        err instanceof Error ? err.message : "Failed to create BOM audit.",
      );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ px: 2, pt: 2, pb: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 3fr) minmax(0, 7fr)",
            },
            gap: 2,
            alignItems: "end",
          }}
        >
          {/* AUDIT NAME */}
          <Box sx={{ minWidth: 0, alignSelf: "start" }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Audit name <span style={{ color: "#d32f2f" }}>*</span>
            </Typography>

            <TextInput
              label=""
              name="auditName"
              value={auditName}
              placeholder="Enter audit name"
              required
              disabled={creating || loading}
              readOnly={!!parsed}
              onChange={(_, value) => {
                if (parsed || creating || loading) return;

                setAuditName(value.slice(0, MAX_AUDIT_NAME));
                setParsed(null);
              }}
              error={nameTouched ? nameError : ""}
            />
          </Box>

          {/* EXCEL DRAG-AND-DROP */}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Upload Excel <span style={{ color: "#d32f2f" }}>*</span>
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              {/* Excel upload */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  pointerEvents:
                    creating || loading || parsed ? "none" : "auto",
                  opacity: creating || loading ? 0.6 : 1,
                }}
              >
                <ExcelUploadButton
                  file={file}
                  onChange={handleFileChange}
                  onError={setError}
                  disabled={creating || loading}
                  dragDropOnly
                  readOnly={!!parsed}
                />
              </Box>

              {/* Confirm & assign - same row as the upload box */}
              <CommonButton
                onClick={handlePreview}
                disabled={
                  !file || !!nameError || creating || loading || !!parsed
                }
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "CONFIRM & ASSIGN"
                )}
              </CommonButton>
            </Box>

            {loading && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}
              >
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Reading the file and checking operators...
                </Typography>
              </Box>
            )}

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
          </Box>
        </Box>
        {/* AUDIT PREVIEW - only after CONFIRM & ASSIGN */}
        {parsed && (
          <Box sx={{ mt: 2 }}>
            <BomAssignPreview
              rows={parsed.rows}
              onBack={() => setParsed(null)}
              onRelease={confirmAudit}
              releasing={creating}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
