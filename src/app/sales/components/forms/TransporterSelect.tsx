import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { LookupData } from "@/app/sales/components/types/sales";

type Transporter = LookupData["transporters"][number];

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  options: Transporter[];
  error?: string;
  required?: boolean;
};

const TransporterSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  error,
  required = true,
}) => {
  const selected = options.find((opt) => String(opt.id) === value) || null;

  return (
    <Autocomplete
      disablePortal
      fullWidth
      options={options}
      getOptionLabel={(option) => option?.name ?? ""}
      value={selected}
      isOptionEqualToValue={(option, v) => String(option.id) === String(v?.id)}
      onChange={(_, option) =>
        onChange("transporterId", option ? String(option.id) : "")
      }
      noOptionsText="No results found."
      renderInput={(params) => (
        <TextField
          {...params}
          label="Transporter"
          required={required}
          error={!!error}
          helperText={error}
          size="medium"
          placeholder="Select transporter"
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

export default TransporterSelect;
