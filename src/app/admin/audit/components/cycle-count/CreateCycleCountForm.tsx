"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs";
import { Users } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../shared/ExcelUploadButton";
import BomAssignPreview from "../bom/BomAssignPreview";
import OperatorListDialog from "../bom/OperatorListDialog";
import { useAuditOperators } from "../../hooks/useAuditOperators";
import { useCreateCycleCount } from "../../hooks/useCreateCycleCount";
import { usePreviewCycleCount } from "../../hooks/usePreviewCycleCount";
import { planningRoute } from "../../utils/auditRoutes";
import type { CycleCountPreview, CycleCountSelection } from "../../types/cycleCount";
import { getCycleCountDateBounds, getCycleCountRangeError } from "../../utils/cycleCountDates";
import type { AuditOperator, AuditRow } from "../../types/audit";

const MAX_AUDIT_NAME = 255;
const DATE_FORMAT = "DD-MM-YYYY";
const API_DATE_FORMAT = "YYYY-MM-DD";

const showError = (message: string) =>
  window.dispatchEvent(
    new CustomEvent("show-global-message", {
      detail: { message, severity: "error" },
    }),
  );

const UPLOAD_HINT =
  "Upload the same Excel format as BOM Audit. Only storage bins matching qualifying Sales Orders are included. Operator ID is optional.";

type PreviewData = {
  rows: AuditRow[];
  fileOperators: Record<string, AuditOperator>;
  selection: CycleCountSelection;
};

const toPreviewData = (preview: CycleCountPreview, operatorList: AuditOperator[]): PreviewData => {
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
    fileOperators[location.storageBin] = operatorList.find((operator) => operator.id === location.operatorId)
      ?? { id: location.operatorId, name: location.operatorName ?? String(location.operatorId), email: "" };
  }
  return { rows, fileOperators, selection: preview.selection };
};

export default function CreateCycleCountForm() {
  const router = useRouter();

  const { createCycleCount, loading: creating } = useCreateCycleCount();
  const { previewCycleCount, loading } = usePreviewCycleCount();

  const [auditName, setAuditName] = useState("");
  const [error, setError] = useState("");
  const reportError = (message: string) => {
    setError(message);
    showError(message);
  };
  const [nameTouched, setNameTouched] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

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
  const rangeError = getCycleCountRangeError(fromDate, toDate);
  const busy = creating || loading;
  const locked = !!parsed;

  const { fromMin, fromMax, toMin, toMax } = getCycleCountDateBounds(fromDate, toDate);

  const goBack = () => {
    parseToken.current += 1;
    setError("");
    setParsed(null);
    setAssignments({});
  };

  const assignBin = (storageBin: string, operator: AuditOperator) =>
    setAssignments((prev) => ({ ...prev, [storageBin]: operator }));

  const handleFromChange = (value: Dayjs | null) => {
    if (locked || busy) return;
    setError("");
    setFromDate(value);

  };

  const handleToChange = (value: Dayjs | null) => {
    if (locked || busy) return;
    setError("");
    setToDate(value);
  };

  const handleFileChange = (selected: File | null) => {
    if (parsed || creating || loading) return;

    parseToken.current += 1;

    setError("");
    setFile(selected);
    setParsed(null);
  };

  const handlePreview = async () => {
    setNameTouched(true);
    setError("");

    if (busy) return;
    if (nameError) {
      reportError(nameError);
      return;
    }
    if (!file) {
      reportError("Please upload the Excel file.");
      return;
    }
    if (!fromDate || !toDate) {
      reportError("Please select the From and To dates.");
      return;
    }
    if (rangeError) {
      reportError(rangeError);
      return;
    }
    if (operatorsLoading) {
      reportError("Operators are still loading. Please try again in a moment.");
      return;
    }

    const token = ++parseToken.current;

    try {
      const result = toPreviewData(await previewCycleCount(file, {
        fromDate: fromDate.format(API_DATE_FORMAT),
        toDate: toDate.format(API_DATE_FORMAT),
      }), operatorList);

      if (token !== parseToken.current) return;

      setAssignments({ ...result.fileOperators });
      setParsed(result);
    } catch (err) {
      if (token !== parseToken.current) return;

      reportError(
        err instanceof Error ? err.message : "Unable to read the Excel file.",
      );
    }
  };

  const confirmAudit = async () => {
    setNameTouched(true);
    setError("");

    if (
      !parsed ||
      !file ||
      !fromDate ||
      !toDate ||
      nameError ||
      rangeError ||
      creating ||
      unassignedCount > 0
    )
      return;

    try {
      await createCycleCount({
        file,
        auditName: cleanName,
        fromDate: fromDate.format(API_DATE_FORMAT),
        toDate: toDate.format(API_DATE_FORMAT),
        binOperators: binsOfFile.map((storageBin) => ({
          storageBin,
          operatorId: assignments[storageBin].id,
        })),
      });

      router.replace(planningRoute("cycle_count"));
    } catch (err) {
      goBack();

      reportError(
        err instanceof Error
          ? err.message
          : "Failed to create Cycle Count audit.",
      );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ px: 2, pt: 0, pb: 2, mt: -1 }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Paper
              elevation={0}
              sx={(t) => ({
                width: "fit-content",
                maxWidth: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${t.palette.divider}`,
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
                    sx={(t) => ({
                      fontWeight: 600,
                      bgcolor: alpha(t.palette.primary.main, 0.3),
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
                    if (locked || busy) return;

                    setAuditName(e.target.value.slice(0, MAX_AUDIT_NAME));
                  }}
                  slotProps={{ input: { readOnly: locked } }}
                  sx={{
                    width: { xs: "100%", sm: 300 },
                    "& .MuiFormLabel-asterisk": { color: "error.main" },
                  }}
                />
                <DatePicker
                  label="FROM"
                  value={fromDate}
                  onChange={handleFromChange}
                  format={DATE_FORMAT}
                  minDate={fromMin}
                  maxDate={fromMax}
                  disabled={busy}
                  readOnly={locked}
                  slotProps={{
                    field: {
                      clearable: !locked,
                      onClear: () => handleFromChange(null),
                    },
                    textField: {
                      size: "small",
                      variant: "outlined",
                      error: !!rangeError,
                      helperText: rangeError || undefined,
                      sx: {
                        minWidth: 180,
                        width: 185,
                        bgcolor: "background.paper",
                      },
                    },
                  }}
                />
                <DatePicker
                  label="TO"
                  value={toDate}
                  onChange={handleToChange}
                  format={DATE_FORMAT}
                  minDate={toMin}
                  maxDate={toMax}
                  disabled={busy}
                  readOnly={locked}
                  slotProps={{
                    field: {
                      clearable: !locked,
                      onClear: () => handleToChange(null),
                    },
                    textField: {
                      size: "small",
                      variant: "outlined",
                      error: !!rangeError,
                      helperText: rangeError || undefined,
                      sx: {
                        minWidth: 180,
                        width: 185,
                        bgcolor: "background.paper",
                      },
                    },
                  }}
                />
                <Box
                  sx={{ minWidth: 0, display: "flex", alignItems: "center" }}
                >
                  <ExcelUploadButton
                    file={file}
                    onChange={handleFileChange}
                    onError={reportError}
                    disabled={busy}
                    readOnly={locked}
                    uploadTooltip={UPLOAD_HINT}
                  />
                </Box>

                {!parsed && (
                  <CommonButton
                    onClick={handlePreview}
                    disabled={
                      !file || !!nameError || !fromDate || !toDate || !!rangeError || busy || operatorsLoading
                    }
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

              {parsed && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  {[
                    ["SOs in range", parsed.selection.sourceSoCount],
                    ["Multi-bin SOs", parsed.selection.qualifyingSoCount],
                    ["DB bins", parsed.selection.sourceBinCount],
                    ["Excel bins", parsed.selection.uploadedBinCount],
                    ["Matched bins", parsed.selection.matchedBinCount],
                    ["Excluded bins", parsed.selection.excludedBinCount],
                  ].map(([label, count]) => (
                    <Chip
                      key={label}
                      size="small"
                      label={`${label}: ${count}`}
                      sx={(theme) => ({
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      })}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 1.5, whiteSpace: "pre-line" }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Checking matching storage bins and operators...
              </Typography>
            </Box>
          )}
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
    </LocalizationProvider>
  );
}
