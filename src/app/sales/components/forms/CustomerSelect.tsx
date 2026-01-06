import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { LookupData } from "@/app/sales/components/types/sales";

type Customer = LookupData["customers"][number];

type Props = {
  valueId: string;
  valueName: string;
  onChange: (field: string, value: string) => void;
  options: Customer[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

const CustomerSelect: React.FC<Props> = ({
  valueId,
  valueName,
  onChange,
  options,
  error,
  required = true,
  disabled,
}) => {
  const selectedOption = options.find((opt) => String(opt.id) === valueId) || null;
  const value: Customer | string | null = selectedOption ?? (valueName ? valueName : null);

  return (
    <Autocomplete
      disablePortal
      fullWidth
      freeSolo
      disabled={disabled}
      options={options}
      getOptionLabel={(option) => (typeof option === "string" ? option : option?.name ?? "")}
      value={value}
      isOptionEqualToValue={(option, v) => {
        if (typeof v === "string") return option.name === v;
        return String(option.id) === String(v?.id);
      }}
      onChange={(_, newValue) => {
        if (typeof newValue === "string") {
          onChange("customerName", newValue);
          onChange("customerId", "");
          return;
        }

        if (newValue && typeof newValue === "object") {
          onChange("customerId", String(newValue.id));
          onChange("customerName", "");
          return;
        }

        onChange("customerId", "");
        onChange("customerName", "");
      }}
      noOptionsText="No results found."
      renderInput={(params) => (
        <TextField
          {...params}
          label="Customer Name"
          required={required}
          error={!!error}
          helperText={error}
          size="medium"
          disabled={disabled}
          placeholder="Select customer or type a new name"
          autoComplete="off"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "4px",
              backgroundColor: (theme) => theme.palette.background.paper,
            },
            "& .MuiInputLabel-root": {
              fontWeight: 500,
              fontSize: 15,
            },
            "& .MuiFormLabel-asterisk": {
              color: "#dc2626",
            },
          }}
        />
      )}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "0.5rem",
          backgroundColor: (theme) => theme.palette.background.paper,
        },
        "& .MuiInputLabel-root": {
          fontWeight: 500,
          fontSize: 15,
        },
        "& .MuiFormLabel-asterisk": {
          color: "#dc2626",
        },
      }}
    />
  );
};

export default CustomerSelect;
