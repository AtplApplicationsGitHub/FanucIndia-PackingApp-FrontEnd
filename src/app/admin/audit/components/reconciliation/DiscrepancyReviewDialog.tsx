"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";

import { KVBox } from "@/app/so-search/components/KVBox";
import { IssueChip, VarianceStatusChip } from "./ReconChips";
import {
  DECISION_LABELS,
  ISSUE_HINTS,
  SAP_ACTION_LABELS,
  formatDateTime,
} from "../../utils/reconLabels";
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
  const [decision, setDecision] = useState<ReconDecision | "">("");
  const [sapAction, setSapAction] = useState<ReconSapAction>("NONE");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    setDecision(variance?.decision ?? "");
    setSapAction(variance?.sapAction ?? "NONE");
    setRemarks(variance?.remarks ?? "");
  }, [variance]);

  const diff = variance ? variance.scannedQty - variance.expectedQty : 0;

  return (
    <Dialog
      open={variance !== null}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
        DISCREPANCY DETAIL
        <IconButton
          onClick={onClose}
          size="small"
          disabled={saving}
          sx={{ position: "absolute", right: 12 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <Divider />

      {variance && (
        <>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
              <IssueChip type={variance.issueType} />
              <VarianceStatusChip status={variance.status} />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              {ISSUE_HINTS[variance.issueType]}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Expected (audit file)
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <KVBox
                    fullWidth
                    label="Storage Bin"
                    value={variance.storageBin}
                  />
                  <KVBox
                    fullWidth
                    label="Material"
                    value={variance.materialCode}
                  />
                  <KVBox
                    fullWidth
                    label="Quantity"
                    value={variance.expectedQty}
                  />
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Actual scanned
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <KVBox
                    fullWidth
                    label="Storage Bin"
                    value={variance.storageBin}
                  />
                  <KVBox
                    fullWidth
                    label="Material"
                    value={variance.materialCode}
                  />
                  <KVBox
                    fullWidth
                    label="Quantity"
                    value={`${variance.scannedQty} (${diff > 0 ? "+" : ""}${diff})`}
                  />
                </Box>
              </Paper>
            </Box>

            {variance.scannedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                Scanned on {formatDateTime(variance.scannedAt)}
              </Typography>
            )}

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <TextField
                select
                size="small"
                fullWidth
                label="Decision"
                value={decision}
                disabled={readOnly || saving}
                onChange={(e) => setDecision(e.target.value as ReconDecision)}
              >
                {(Object.keys(DECISION_LABELS) as ReconDecision[]).map((d) => (
                  <MenuItem key={d} value={d}>
                    {DECISION_LABELS[d]}
                  </MenuItem>
                ))}
              </TextField>

              {/* Placeholder: SAP behaviour is not finalised, the choice is only stored. */}
              <TextField
                select
                size="small"
                fullWidth
                label="SAP follow-up (optional)"
                value={sapAction}
                disabled={readOnly || saving}
                onChange={(e) => setSapAction(e.target.value as ReconSapAction)}
              >
                {(Object.keys(SAP_ACTION_LABELS) as ReconSapAction[]).map(
                  (a) => (
                    <MenuItem key={a} value={a}>
                      {SAP_ACTION_LABELS[a]}
                    </MenuItem>
                  ),
                )}
              </TextField>

              <TextField
                size="small"
                fullWidth
                required
                multiline
                minRows={3}
                label="Remarks"
                value={remarks}
                disabled={readOnly || saving}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Box>

            {variance.resolvedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1.5 }}
              >
                Resolved by {variance.resolvedByName} on{" "}
                {formatDateTime(variance.resolvedAt)}
              </Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button disabled={saving} onClick={onClose}>
              {readOnly ? "Close" : "Cancel"}
            </Button>

            {!readOnly && (
              <Button
                variant="contained"
                disabled={!decision || !remarks.trim() || saving}
                onClick={() =>
                  decision && onSave(decision, sapAction, remarks.trim())
                }
              >
                {saving ? "Saving..." : "Save Reconciliation"}
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
