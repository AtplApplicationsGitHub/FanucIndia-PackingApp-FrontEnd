"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import { X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ReconDecisionFields from "./ReconDecisionFields";
import { IssueChip, VarianceStatusChip } from "./ReconChips";
import { ISSUE_HINTS, formatDateTime } from "../../utils/reconLabels";
import { optionLabel, useReconOptions } from "../../hooks/useReconOptions";
import type {
  ReconDecision,
  ReconSapAction,
  ReconVariance,
} from "../../types/reconciliation";

type Props = {
  variance: ReconVariance | null;
  readOnly: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (
    decision: ReconDecision,
    sapAction: ReconSapAction,
    remarks: string,
  ) => void;
};

export default function DiscrepancyReviewDialog({
  variance,
  readOnly,
  saving,
  onClose,
  onSave,
}: Props) {
  const { options } = useReconOptions();
  const [decision, setDecision] = useState<ReconDecision | "">("");
  const [sapAction, setSapAction] = useState<ReconSapAction>("NONE");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    setDecision(variance?.decision ?? "");
    setSapAction(variance?.sapAction ?? "NONE");
    setRemarks(variance?.remarks ?? "");
  }, [variance]);

  const diff = variance ? variance.scannedQty - variance.expectedQty : 0;
  // Closed audit = view only: saved values show as read-only cards, not input fields.
  // An audit that is still open keeps the editable fields + SAVE, even for resolved lines.
  const viewOnly = readOnly;

  return (
    <Dialog
      open={variance !== null}
      onClose={saving ? undefined : onClose}
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
          py: 1.25,
          position: "relative",
        }}
      >
        DISCREPANCY DETAIL
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          disabled={saving}
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      {variance && (
        <DialogContent sx={{ pt: "12px !important", pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              columnGap: 2,
              rowGap: 0.5,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
              }}
            >
              <IssueChip type={variance.issueType} />
              <VarianceStatusChip status={variance.status} />
              <Typography variant="caption" color="text.secondary">
                {ISSUE_HINTS[variance.issueType]}
              </Typography>
            </Box>
            {variance.scannedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: "auto" }}
              >
                Scanned on {formatDateTime(variance.scannedAt)}
              </Typography>
            )}
          </Box>

          <TableContainer
            sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}
          >
            <Table
              size="small"
              aria-label="Expected and actual scanned comparison"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": {
                  px: { xs: 1, sm: 1.5 },
                  py: 1,
                  borderColor: "divider",
                  overflowWrap: "anywhere",
                },
                // Vertical separators between Field, Expected, and Actual.
                "& .MuiTableCell-root:not(:last-child)": {
                  borderRight: "1px solid",
                  borderRightColor: "divider",
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "primary.main",
                    "& .MuiTableCell-head": { color: "primary.contrastText" },
                  }}
                >
                  <TableCell sx={{ width: "24%", fontWeight: 700 }}>
                    Field
                  </TableCell>
                  <TableCell sx={{ width: "38%", fontWeight: 700 }}>
                    Expected (audit file)
                  </TableCell>
                  <TableCell sx={{ width: "38%", fontWeight: 700 }}>
                    Actual scanned
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Storage Bin</TableCell>
                  <TableCell>{variance.storageBin}</TableCell>
                  <TableCell>{variance.storageBin}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                  <TableCell>{variance.materialCode}</TableCell>
                  <TableCell>{variance.materialCode}</TableCell>
                </TableRow>
                <TableRow sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell>{variance.expectedQty}</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: diff !== 0 ? "error.main" : "text.primary",
                    }}
                  >
                    {variance.scannedQty} ({diff > 0 ? "+" : ""}
                    {diff})
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            {viewOnly ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                <ReadOnlyField
                  label="Decision"
                  value={optionLabel(options?.decisions, variance.decision)}
                />
                <ReadOnlyField
                  label="SAP follow-up"
                  value={optionLabel(options?.sapActions, variance.sapAction)}
                />
                <ReadOnlyField
                  label="Remarks"
                  value={variance.remarks}
                  sx={{ gridColumn: "1 / -1" }}
                />
              </Box>
            ) : (
              <ReconDecisionFields
                decision={decision}
                sapAction={sapAction}
                remarks={remarks}
                disabled={saving}
                onDecisionChange={setDecision}
                onSapActionChange={setSapAction}
                onRemarksChange={setRemarks}
              />
            )}
          </Box>

          {(variance.resolvedAt || !readOnly) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
                mt: 1.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {variance.resolvedAt
                  ? `Resolved by ${variance.resolvedByName ?? "-"} on ${formatDateTime(variance.resolvedAt)}`
                  : ""}
              </Typography>

              {!readOnly && (
                <CommonButton
                  variant="contained"
                  disabled={!decision || !remarks.trim() || saving}
                  onClick={() =>
                    decision && onSave(decision, sapAction, remarks.trim())
                  }
                >
                  {saving ? "SAVING..." : "SAVE"}
                </CommonButton>
              )}
            </Box>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}

/** Read-only counterpart of a form input: label on top, the saved value below (wraps). */
function ReadOnlyField({
  label,
  value,
  sx,
}: {
  label: string;
  value: string;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          minWidth: 0,
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          border: "1px dashed",
          borderColor: "divider",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "text.secondary",
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}
