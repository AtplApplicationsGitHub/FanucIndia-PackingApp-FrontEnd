"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ReconDecisionFields from "./ReconDecisionFields";
import {
  ISSUE_COLORS,
  ISSUE_LABELS,
  ISSUE_ORDER,
} from "../../utils/reconLabels";
import type {
  ReconDecision,
  ReconSapAction,
  ReconVariance,
} from "../../types/reconciliation";

type Props = {
  open: boolean;
  variances: ReconVariance[];
  saving: boolean;
  onClose: () => void;
  onSave: (
    decision: ReconDecision,
    sapAction: ReconSapAction,
    remarks: string,
  ) => void;
};

export default function BulkReviewDialog({
  open,
  variances,
  saving,
  onClose,
  onSave,
}: Props) {
  const [decision, setDecision] = useState<ReconDecision | "">("");
  const [sapAction, setSapAction] = useState<ReconSapAction>("NONE");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!open) return;
    setDecision("");
    setSapAction("NONE");
    setRemarks("");
  }, [open]);

  // Selected lines per category, e.g. Mismatch 2 / Missing 9
  const breakdown = useMemo(
    () =>
      ISSUE_ORDER.map((type) => ({
        type,
        total: variances.filter((v) => v.issueType === type).length,
      })).filter((c) => c.total > 0),
    [variances],
  );

  const count = variances.length;

  const resolvedCount = variances.filter((v) => v.status === "RESOLVED").length;

  const canSave = Boolean(decision) && Boolean(remarks.trim()) && count > 0;

  return (
    <Dialog
      open={open}
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
        BULK REVIEW
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

      <DialogContent sx={{ pt: "16px !important", pb: 2 }}>
        {/* Category badges - no outer container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {breakdown.map(({ type, total }) => (
            <Chip
              key={type}
              size="small"
              variant="outlined"
              color={ISSUE_COLORS[type]}
              label={`${ISSUE_LABELS[type]} · ${total}`}
            />
          ))}
        </Box>

        {/* Warning for already reviewed materials */}
        {resolvedCount > 0 && (
          <Alert severity="warning" sx={{ mt: 1.5, py: 0 }}>
            {resolvedCount} of {count} already{" "}
            {resolvedCount === 1 ? "has" : "have"} a review - saving will
            replace {resolvedCount === 1 ? "it" : "them"}.
          </Alert>
        )}

        {/* Decision, SAP Action and Remarks */}
        <Box sx={{ mt: 2 }}>
          <ReconDecisionFields
            decision={decision}
            sapAction={sapAction}
            remarks={remarks}
            disabled={saving}
            onDecisionChange={setDecision}
            onSapActionChange={setSapAction}
            onRemarksChange={setRemarks}
          />
        </Box>
      </DialogContent>

      <Divider />

      {/* Footer actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 3,
          py: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button color="inherit" onClick={onClose} disabled={saving}>
            CANCEL
          </Button>

          <CommonButton
            variant="contained"
            disabled={!canSave || saving}
            onClick={() =>
              decision && onSave(decision, sapAction, remarks.trim())
            }
          >
            {saving ? "SAVING..." : `SAVE ${count}`}
          </CommonButton>
        </Box>
      </Box>
    </Dialog>
  );
}
