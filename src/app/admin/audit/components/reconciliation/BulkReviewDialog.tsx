"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";

import CommonButton from "@/common/components/CommonButton";
import ReconDecisionFields from "./ReconDecisionFields";
import { IssueChip } from "./ReconChips";
import { ISSUE_ORDER } from "../../utils/reconLabels";
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

  const categories = useMemo(
    () =>
      ISSUE_ORDER.filter((type) => variances.some((v) => v.issueType === type)),
    [variances],
  );
  const resolvedCount = variances.filter((v) => v.status === "RESOLVED").length;
  const count = variances.length;

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

      <DialogContent sx={{ pt: "12px !important", pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            columnGap: 2,
            rowGap: 0.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {categories.map((type) => (
              <IssueChip key={type} type={type} />
            ))}
            <Typography variant="caption" color="text.secondary">
              {count} {count === 1 ? "discrepancy" : "discrepancies"} selected
            </Typography>
          </Box>
          {resolvedCount > 0 && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ ml: "auto" }}
            >
              {resolvedCount} already resolved - their review will be replaced
            </Typography>
          )}
        </Box>

        <ReconDecisionFields
          decision={decision}
          sapAction={sapAction}
          remarks={remarks}
          disabled={saving}
          onDecisionChange={setDecision}
          onSapActionChange={setSapAction}
          onRemarksChange={setRemarks}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
          <CommonButton
            variant="contained"
            disabled={!decision || !remarks.trim() || saving || count === 0}
            onClick={() =>
              decision && onSave(decision, sapAction, remarks.trim())
            }
          >
            {saving ? "SAVING..." : "SAVE"}
          </CommonButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
