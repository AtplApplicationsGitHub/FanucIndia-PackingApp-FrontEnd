"use client";

import { Box, MenuItem, TextField } from "@mui/material";

import { useReconOptions } from "../../hooks/useReconOptions";
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
  const { options, loading, error } = useReconOptions();
  const decisions = options?.decisions ?? [];
  const sapActions = options?.sapActions ?? [];
  const inList = (list: { value: string }[], value: string) =>
    list.some((o) => o.value === value) ? value : "";

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
        value={inList(decisions, decision)}
        disabled={disabled || loading}
        error={!!error}
        helperText={error || undefined}
        onChange={(e) => onDecisionChange(e.target.value as ReconDecision)}
      >
        {decisions.map((d) => (
          <MenuItem key={d.value} value={d.value}>
            {d.label}
          </MenuItem>
        ))}
      </TextField>

      {/* Placeholder: SAP behaviour is not finalised, the choice is only stored. */}
      <TextField
        select
        size="small"
        fullWidth
        label="SAP follow-up (optional)"
        value={inList(sapActions, sapAction)}
        disabled={disabled || loading}
        onChange={(e) => onSapActionChange(e.target.value as ReconSapAction)}
      >
        {sapActions.map((a) => (
          <MenuItem key={a.value} value={a.value}>
            {a.label}
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
