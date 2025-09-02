import React from "react";
import { Autocomplete, TextField } from "@mui/material";

type Option<V> = { value: V; label: string };

interface SearchableSelectProps<V extends string | number> {
  label: string;
  options: Option<V>[];
  value: V | null;
  onChange: (value: V | null) => void;
  name: string;
}

export default function SearchableSelect<V extends string | number>({
  label,
  options,
  value,
  onChange,
  name,
}: SearchableSelectProps<V>) {
  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  return (
    <Autocomplete<Option<V>, false, false, false>
      options={options}
      value={selectedOption}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.value : null);
      }}
      renderInput={(params) => <TextField {...params} label={label} name={name} />}
    />
  );
}
