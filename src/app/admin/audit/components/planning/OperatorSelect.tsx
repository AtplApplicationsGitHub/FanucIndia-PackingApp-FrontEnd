"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import { MOCK_OPERATORS } from "../../mock/auditMockData";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function OperatorSelect({ value, onChange }: Props) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Operator</InputLabel>

      <Select
        value={value}
        label="Operator"
        onChange={(e) => onChange(e.target.value)}
      >
        {MOCK_OPERATORS.map((operator) => (
          <MenuItem value={operator} key={operator}>
            {operator}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
