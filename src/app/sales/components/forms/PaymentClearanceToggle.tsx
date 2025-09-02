import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

type Option = {
  label: string;
  value: string;
};

const options: Option[] = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
  required?: boolean;
};

const PaymentClearanceToggle: React.FC<Props> = ({
  value,
  onChange,
  error,
  required = true,
}) => {
  const selected = options.find((opt) => opt.value === value) || null;

  return (
    <Autocomplete
      disablePortal
      fullWidth
      options={options}
      getOptionLabel={(option) => option.label}
      value={selected}
      isOptionEqualToValue={(option, v) => option.value === v?.value}
      onChange={(_, option) =>
        onChange("paymentClearance", option ? option.value : "")
      }
      noOptionsText="No results found."
      renderInput={(params) => (
        <TextField
          {...params}
          label="Payment Clearance"
          required={required}
          error={!!error}
          helperText={error}
          size="medium"
          placeholder="Select clearance status"
          autoComplete="off"
          sx={{
            "& .MuiFormLabel-asterisk": {
              color: "#dc2626",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "4px", // This matches the inner TextField style
              backgroundColor: (theme) => theme.palette.background.paper,
            },
            "& .MuiInputLabel-root": {
              fontWeight: 500,
              fontSize: 15,
            },
          }}
        />
      )}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px", // This matches the outer Autocomplete style
          backgroundColor: (theme) => theme.palette.background.paper,
        },
      }}
    />
  );
};

export default PaymentClearanceToggle;
