"use client";

import { useMemo, useState } from "react";

import {
  Autocomplete,
  CircularProgress,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import type { AuditListRow, AuditOperator } from "../../types/audit";

/** Characters the admin must type before the operator list opens */
const MIN_SEARCH_CHARS = 3;

type Props = {
  audit: AuditListRow;
  operators: AuditOperator[];
  operatorsLoading: boolean;
  /** Saves the change and shows the result message; never rejects. */
  onReassign: (audit: AuditListRow, operator: AuditOperator) => Promise<void>;
};

/**
 * "ASSIGNED TO" cell.
 *  - not reassignable: plain text
 *  - reassignable: borderless field with a dashed underline. Click, type 3+ characters,
 *    pick an operator -> reassign. Blur / Escape reverts without saving.
 */
export default function AssignedToCell({
  audit,
  operators,
  operatorsLoading,
  onReassign,
}: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState<AuditOperator | null>(null);

  // Stable references: a new object on every render makes Autocomplete reset the typed text.
  // Hooks must stay above the early return below.
  const current = useMemo<AuditOperator>(
    () => ({
      id: audit.operatorId,
      name: audit.operatorName,
      email: "",
    }),
    [audit.operatorId, audit.operatorName],
  );

  const options = useMemo(
    () =>
      operators.some((o) => o.id === current.id)
        ? operators
        : [current, ...operators],
    [operators, current],
  );

  if (!audit.actions.canReassign) {
    return <>{audit.operatorName}</>;
  }

  const saving = pending !== null;
  const value = pending ?? current;

  const showList = open && typed.trim().length >= MIN_SEARCH_CHARS;

  const handleSelect = async (operator: AuditOperator | null) => {
    if (!operator || operator.id === audit.operatorId) return;
    setPending(operator);
    try {
      await onReassign(audit, operator);
    } finally {
      setPending(null);
    }
  };

  return (
    <Tooltip
      title={`Click and type ${MIN_SEARCH_CHARS}+ characters to reassign`}
      placement="top"
      enterDelay={500}
    >
      <Autocomplete
        size="small"
        disableClearable
        forcePopupIcon={false}
        autoHighlight
        blurOnSelect
        disabled={saving}
        options={options}
        loading={operatorsLoading}
        value={value}
        open={showList}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
          setTyped("");
        }}
        onInputChange={(_, text, reason) =>
          setTyped(reason === "input" ? text : "")
        }
        onChange={(_, operator) => void handleSelect(operator)}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        filterOptions={(opts, { inputValue }) => {
          const q = inputValue.trim().toLowerCase();
          return opts.filter(
            (o) =>
              o.name.toLowerCase().includes(q) ||
              o.email.toLowerCase().includes(q),
          );
        }}
        noOptionsText="No operators found."
        loadingText="Loading operators..."
        sx={{
          minWidth: 140,
          width: 140,
          "& .MuiInput-root": {
            fontSize: "0.875rem",
            "&:before": {
              borderBottomStyle: "dashed",
              borderBottomColor: "primary.dark",
            },
            "&:hover:not(.Mui-disabled):before": {
              borderBottomStyle: "dashed",
              borderBottomColor: "primary.dark",
            },
            "&:after": { borderBottomColor: "primary.main" },
          },
        }}
        slotProps={{ paper: { sx: { fontSize: "0.875rem" } } }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li {...optionProps} key={option.id}>
              <Typography variant="body2">{option.name}</Typography>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            placeholder="Type 3+ letters"
            inputProps={{
              ...params.inputProps,
              "aria-label": `Reassign ${audit.auditName}`,
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: saving ? (
                <CircularProgress size={14} />
              ) : (
                params.InputProps.endAdornment
              ),
            }}
          />
        )}
      />
    </Tooltip>
  );
}
