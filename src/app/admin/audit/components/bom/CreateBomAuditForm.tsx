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
  Tooltip,
  Typography,
} from "@mui/material";
import { Users } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../shared/ExcelUploadButton";
import BomAssignPreview from "./BomAssignPreview";
import OperatorListDialog from "./OperatorListDialog";
import { useAuditOperators } from "../../hooks/useAuditOperators";

import { planningRoute } from "../../utils/auditRoutes";
import { useCreateBomAudit } from "../../hooks/useCreateBomAudit";
import { usePreviewBomAudit } from "../../hooks/usePreviewBomAudit";
import type {
  AuditOperator,
  AuditRow,
  BomAuditPreview,
} from "../../types/audit";

const MAX_AUDIT_NAME = 255;

const showError = (message: string) =>
  window.dispatchEvent(
    new CustomEvent("show-global-message", {
      detail: { message, severity: "error" },
    }),
  );

const UPLOAD_HINT =
  "Upload a .xlsx file with Location, Qty and Material columns. Operator ID is optional - operators can be assigned after uploading.";

type PreviewData = {
  rows: AuditRow[];
  fileOperators: Record<string, AuditOperator>;
};

const toPreviewData = (
  preview: BomAuditPreview,
  operatorList: AuditOperator[],
): PreviewData => {
  let rowNo = 0;
  const rows: AuditRow[] = preview.locations.flatMap((location) =>
    location.materials.map((material) => ({
      storage: location.storageBin,
      materialCode: material.materialCode,
      quantity: material.expectedQty,
      excelRow: ++rowNo,
    })),
  );
  const fileOperators: Record<string, AuditOperator> = {};
  for (const location of preview.locations) {
    if (location.operatorId === null) continue;
    fileOperators[location.storageBin] = operatorList.find(
      (o) => o.id === location.operatorId,
    ) ?? {
      id: location.operatorId,
      name: location.operatorName ?? String(location.operatorId),
      email: "",
    };
  }
  return { rows, fileOperators };
};

export default function CreateBomAuditForm() {
  const router = useRouter();

  const { createBomAudit, loading: creating } = useCreateBomAudit();
  const { previewBomAudit, loading } = usePreviewBomAudit();

  const [auditName, setAuditName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [parsed, setParsed] = useState<PreviewData | null>(null);
  const [assignments, setAssignments] = useState<Record<string, AuditOperator>>(
    {},
  );
  const [operatorsOpen, setOperatorsOpen] = useState(false);
  const { operators: operatorList, loading: operatorsLoading } =
    useAuditOperators(true);

  const parseToken = useRef(0);

  const binsOfFile = useMemo(
    () => [...new Set((parsed?.rows ?? []).map((row) => row.storage))],
    [parsed],
  );
  const locationCount = binsOfFile.length;
  const unassignedCount = binsOfFile.filter((bin) => !assignments[bin]).length;

  const cleanName = auditName.replace(/\s+/g, " ").trim();

  const nameError = !cleanName
    ? "Audit name is required"
    : cleanName.length > MAX_AUDIT_NAME
      ? `Audit name must be at most ${MAX_AUDIT_NAME} characters`
      : "";

  const showNameError = nameTouched && !!nameError;
  const busy = creating || loading;

  const goBack = () => {
    setParsed(null);
    setAssignments({});
  };

  const assignBin = (storageBin: string, operator: AuditOperator) =>
    setAssignments((prev) => ({ ...prev, [storageBin]: operator }));

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
      const result = toPreviewData(await previewBomAudit(file), operatorList);

      if (token !== parseToken.current) return;

      setAssignments({ ...result.fileOperators });
      setParsed(result);
    } catch (err) {
      if (token !== parseToken.current) return;

      showError(
        err instanceof Error ? err.message : "Unable to read the Excel file.",
      );
    }
  };

  // Release audit after successful preview
  const confirmAudit = async () => {
    setNameTouched(true);

    if (!parsed || !file || nameError || creating || unassignedCount > 0)
      return;

    try {
      await createBomAudit({
        file,
        auditName: cleanName,
        binOperators: binsOfFile.map((storageBin) => ({
          storageBin,
          operatorId: assignments[storageBin].id,
        })),
      });

      router.replace(planningRoute("bom"));
    } catch (err) {
      goBack();

      showError(
        err instanceof Error ? err.message : "Failed to create BOM audit.",
      );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ px: 2, pt: 0, pb: 2, mt: -1 }}>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                <Chip
                  size="small"
                  label={`${locationCount} ${locationCount === 1 ? "location" : "locations"}`}
                  sx={(theme) => ({
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.primary.main, 0.3),
                  })}
                />
              </Box>
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

              {!parsed && (
                <CommonButton
                  onClick={handlePreview}
                  disabled={!file || !!nameError || busy}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "UPLOAD"
                  )}
                </CommonButton>
              )}

              <CommonButton onClick={goBack} disabled={!parsed || creating}>
                BACK
              </CommonButton>

              <Tooltip
                arrow
                title={
                  parsed && unassignedCount > 0
                    ? `Assign an operator to every storage bin (${unassignedCount} left)`
                    : ""
                }
              >
                <span>
                  <CommonButton
                    onClick={confirmAudit}
                    disabled={!parsed || creating || unassignedCount > 0}
                  >
                    {creating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "RELEASE AUDIT"
                    )}
                  </CommonButton>
                </span>
              </Tooltip>

              <Tooltip arrow title="Operator list (User IDs)">
                <span>
                  <CommonButton
                    aria-label="Operator list"
                    onClick={() => setOperatorsOpen(true)}
                    sx={{ minWidth: 40, px: 1 }}
                  >
                    <Users size={18} />
                  </CommonButton>
                </span>
              </Tooltip>
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

        {/* AUDIT PREVIEW */}
        <Box sx={{ mt: 1.5 }}>
          <BomAssignPreview
            key={parsed ? "parsed" : "empty"}
            rows={parsed?.rows ?? []}
            disabled={!parsed}
            assignments={assignments}
            operators={operatorList}
            operatorsLoading={operatorsLoading}
            onAssign={assignBin}
          />
        </Box>

        <OperatorListDialog
          open={operatorsOpen}
          operators={operatorList}
          loading={operatorsLoading}
          onClose={() => setOperatorsOpen(false)}
        />
      </Box>
    </Box>
  );
}
