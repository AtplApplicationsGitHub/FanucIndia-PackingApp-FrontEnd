import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { LookupData } from "@/app/sales/components/types/sales";

type Product = LookupData["products"][number];

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  options: Product[];
  error?: string;
};

const ProductSelect: React.FC<Props> = ({ value, onChange, options, error }) => {
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
        onChange("productId", option ? String(option.id) : "")
      }
      noOptionsText="No results found."
      renderInput={(params) => (
        <TextField
          {...params}
          label="Product"
          required
          error={!!error}
          helperText={error}
          size="small"
          placeholder="Select product"
          autoComplete="off"
          sx={{
            "& .MuiFormLabel-asterisk": {
              color: "#dc2626",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.5rem",
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

export default ProductSelect;
