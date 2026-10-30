"use client";

import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { API, fetchWithAuth } from "@/common/lib/endpoints";

type Operator = { id: number; name: string; email: string };

type Props = {
  value: number | "";
  onChange: (id: number | "", name: string) => void;
};

export default function OperatorSelect({ value, onChange }: Props) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth(API.AUDIT.OPERATORS);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setOperators(json.data ?? []);
      } catch {
        setOperators([]);
        window.dispatchEvent(
          new CustomEvent("show-global-message", {
            detail: { message: "Unable to load operators.", severity: "error" },
          }),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <Autocomplete
      fullWidth
      size="small"
      options={operators}
      loading={loading}
      value={operators.find((o) => o.id === value) ?? null}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, v) => option.id === v.id}
      onChange={(_, op) => onChange(op ? op.id : "", op ? op.name : "")}
      noOptionsText="No results found."
      loadingText="Loading operators..."
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li {...optionProps} key={option.id}>
            {option.name}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label="Operator" required />
      )}
    />
  );
}
