"use client";

import { useState } from "react";

import { Autocomplete, TextField, Tooltip, Typography } from "@mui/material";

import type { AuditOperator } from "../../types/audit";

const MIN_SEARCH_CHARS = 3;

type Props = {
  storageBin: string;
  value: AuditOperator | null;
  operators: AuditOperator[];
  operatorsLoading: boolean;
  disabled?: boolean;
  onChange: (operator: AuditOperator) => void;
};

export default function BinOperatorCell({
  storageBin,
  value,
  operators,
  operatorsLoading,
  disabled = false,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  if (disabled) return <>{value?.name ?? "-"}</>;

  const showList = open && typed.trim().length >= MIN_SEARCH_CHARS;

  return (
    <Tooltip
      title={`Click and type ${MIN_SEARCH_CHARS}+ characters to ${value ? "change" : "assign"} the operator`}
      placement="top"
      enterDelay={500}
    >
      <Autocomplete
        size="small"
        disableClearable={value !== null}
        forcePopupIcon={false}
        autoHighlight
        blurOnSelect
        options={operators}
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
        onChange={(_, operator) => {
          if (operator && operator.id !== value?.id) onChange(operator);
        }}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        filterOptions={(opts, { inputValue }) => {
          const q = inputValue.trim().toLowerCase();
          return opts.filter(
            (o) =>
              o.name.toLowerCase().includes(q) ||
              o.email.toLowerCase().includes(q) ||
              String(o.id) === q,
          );
        }}
        noOptionsText="No operators found."
        loadingText="Loading operators..."
        sx={{
          minWidth: 160,
          width: 180,
          "& .MuiInput-root": {
            fontSize: "0.875rem",
            "&:before": {
              borderBottomStyle: "dashed",
              borderBottomColor: value ? "primary.dark" : "error.main",
            },
            "&:hover:not(.Mui-disabled):before": {
              borderBottomStyle: "dashed",
              borderBottomColor: value ? "primary.dark" : "error.main",
            },
            "&:after": { borderBottomColor: "primary.main" },
          },
        }}
        slotProps={{ paper: { sx: { fontSize: "0.875rem" } } }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li {...optionProps} key={key ?? option.id}>
              <Typography variant="body2">
                {option.name} ({option.id})
              </Typography>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            placeholder="-"
            inputProps={{
              ...params.inputProps,
              "aria-label": `Operator for ${storageBin}`,
            }}
          />
        )}
      />
    </Tooltip>
  );
}
