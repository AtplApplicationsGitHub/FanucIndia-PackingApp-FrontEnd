"use client";

import { Box, MenuItem, TextField } from "@mui/material";

import { DECISION_LABELS, SAP_ACTION_LABELS } from "../../utils/reconLabels";
import type { ReconDecision, ReconSapAction } from "../../types/reconciliation";

type Props = {
  decision: ReconDecision | "";
  sapAction: ReconSapAction;
  remarks: string;
  disabled: boolean;
  onDecisionChange: (value: ReconDecision) => void;
  onSapActionChange: (value: ReconSapAction) => void;
  onRemarksChange: (value: string) => void;
};

export default function ReconDecisionFields({
  decision,
  sapAction,
  remarks,
  disabled,
  onDecisionChange,
  onSapActionChange,
  onRemarksChange,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 1.5,
      }}
    >
      <TextField
        select
        size="small"
        fullWidth
        label="Decision"
        value={decision}
        disabled={disabled}
        onChange={(e) => onDecisionChange(e.target.value as ReconDecision)}
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
        disabled={disabled}
        onChange={(e) => onSapActionChange(e.target.value as ReconSapAction)}
      >
        {(Object.keys(SAP_ACTION_LABELS) as ReconSapAction[]).map((a) => (
          <MenuItem key={a} value={a}>
            {SAP_ACTION_LABELS[a]}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        fullWidth
        required
        multiline
        minRows={2}
        label="Remarks"
        value={remarks}
        disabled={disabled}
        onChange={(e) => onRemarksChange(e.target.value)}
        sx={{ gridColumn: "1 / -1" }}
      />
    </Box>
  );
}
