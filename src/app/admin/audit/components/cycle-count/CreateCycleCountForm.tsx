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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { Users } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../shared/ExcelUploadButton";
import BomAssignPreview from "../bom/BomAssignPreview";
import OperatorListDialog from "../bom/OperatorListDialog";
import { useAuditOperators } from "../../hooks/useAuditOperators";
import { useCreateCycleCount } from "../../hooks/useCreateCycleCount";
import { usePreviewCycleCount } from "../../hooks/usePreviewCycleCount";
import { planningRoute } from "../../utils/auditRoutes";
import type { ParsedCycleCountFile } from "../../utils/cycleCountExcel";
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
  "Upload a .xlsx file with Location, Qty and Material columns. Operator ID is optional - operators can be assigned after uploading.";

/*
 * Date rules (e.g. today = 5 Nov):
 *  - no future dates (latest = 5 Nov)
 *  - nothing older than one month (earliest = 5 Oct)
 *  - the range itself can be at most one month
 */
const today = () => dayjs().startOf("day");
const earliestAllowed = () => today().subtract(1, "month");

const getRangeError = (from: Dayjs | null, to: Dayjs | null): string => {
  if (!from || !to) return "";
  if (!from.isValid() || !to.isValid()) return "Enter a valid date range";
  if (to.isBefore(from, "day")) return "To date cannot be before From date";
  if (from.isBefore(earliestAllowed(), "day"))
    return `Dates older than ${earliestAllowed().format(DATE_FORMAT)} are not allowed`;
  if (to.isAfter(today(), "day")) return "Future dates are not allowed";
  if (to.isAfter(from.add(1, "month"), "day"))
    return "Date range cannot be more than one month";
  return "";
};

type PreviewData = {
  rows: AuditRow[];
  fileOperators: Record<string, AuditOperator>;
};

// Matches the Operator IDs written in the file with the operator list
const toPreviewData = (
  parsedFile: ParsedCycleCountFile,
  operatorList: AuditOperator[],
): PreviewData => {
  const fileOperators: Record<string, AuditOperator> = {};
  for (const [storageBin, operatorId] of Object.entries(
    parsedFile.binOperatorIds,
  )) {
    const operator = operatorList.find((o) => o.id === operatorId);
    if (!operator) {
      throw new Error(
        `Operator ID ${operatorId} (location ${storageBin}) was not found.`,
      );
    }
    fileOperators[storageBin] = operator;
  }
  return { rows: parsedFile.rows, fileOperators };
};

export default function CreateCycleCountForm() {
  const router = useRouter();

  const { createCycleCount, loading: creating } = useCreateCycleCount();
  const { previewCycleCount, loading } = usePreviewCycleCount();

  const [auditName, setAuditName] = useState("");
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
  const rangeError = getRangeError(fromDate, toDate);
  const busy = creating || loading;
  const locked = !!parsed; // after UPLOAD: name, file and dates cannot be edited

  // FROM: between (today - 1 month) and today (or the chosen TO)
  const fromMin = earliestAllowed();
  const fromMax = toDate && toDate.isValid() ? toDate : today();
  // TO: from the chosen FROM, at most one month later and never in the future
  const toMin = fromDate && fromDate.isValid() ? fromDate : earliestAllowed();
  const toMax =
    fromDate && fromDate.isValid() && fromDate.add(1, "month").isBefore(today())
      ? fromDate.add(1, "month")
      : today();

  const goBack = () => {
    setParsed(null);
    setAssignments({});
  };

  const assignBin = (storageBin: string, operator: AuditOperator) =>
    setAssignments((prev) => ({ ...prev, [storageBin]: operator }));

  const handleFromChange = (value: Dayjs | null) => {
    if (locked || busy) return;
    setFromDate(value);
    // The chosen TO must stay inside the new one-month window
    if (
      value?.isValid() &&
      toDate?.isValid() &&
      (toDate.isBefore(value, "day") ||
        toDate.isAfter(value.add(1, "month"), "day"))
    ) {
      setToDate(null);
    }
  };

  const handleToChange = (value: Dayjs | null) => {
    if (locked || busy) return;
    setToDate(value);
  };

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

    if (nameError) {
      showError(nameError);
      return;
    }
    if (!file) {
      showError("Please upload the Excel file.");
      return;
    }
    if (!fromDate || !toDate) {
      showError("Please select the From and To dates.");
      return;
    }
    if (rangeError) {
      showError(rangeError);
      return;
    }
    if (operatorsLoading) {
      showError("Operators are still loading. Please try again in a moment.");
      return;
    }

    const token = ++parseToken.current;

    try {
      const result = toPreviewData(await previewCycleCount(file), operatorList);

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
        movementFrom: fromDate.format(API_DATE_FORMAT),
        movementTo: toDate.format(API_DATE_FORMAT),
        binOperators: binsOfFile.map((storageBin) => ({
          storageBin,
          operator: assignments[storageBin],
        })),
      });

      router.replace(planningRoute("cycle_count"));
    } catch (err) {
      goBack();

      showError(
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
                    if (locked || busy) return;

                    setAuditName(e.target.value.slice(0, MAX_AUDIT_NAME));
                  }}
                  slotProps={{ input: { readOnly: locked } }}
                  sx={{
                    width: { xs: "100%", sm: 300 },
                    "& .MuiFormLabel-asterisk": { color: "error.main" },
                  }}
                />

                {/* DATE RANGE (max one month, no future dates) */}
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
                      sx: {
                        minWidth: 180,
                        width: 185,
                        bgcolor: "background.paper",
                      },
                    },
                  }}
                />

                {/* EXCEL UPLOAD */}
                <Box
                  sx={{ minWidth: 0, display: "flex", alignItems: "center" }}
                >
                  <ExcelUploadButton
                    file={file}
                    onChange={handleFileChange}
                    onError={showError}
                    disabled={busy}
                    readOnly={locked}
                    uploadTooltip={UPLOAD_HINT}
                  />
                </Box>

                {!parsed && (
                  <CommonButton
                    onClick={handlePreview}
                    disabled={
                      !file || !!nameError || !fromDate || !toDate || busy
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
            </Paper>
          </Box>

          {loading && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}
            >
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
    </LocalizationProvider>
  );
}
