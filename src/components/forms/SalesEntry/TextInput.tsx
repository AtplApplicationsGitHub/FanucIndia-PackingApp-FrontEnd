import React from "react";
import TextField from "@mui/material/TextField";

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
};

const TextInput: React.FC<Props> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = true,
  placeholder,
}) => (
  <TextField
    fullWidth
    label={label}
    name={name}
    value={value}
    required={required}
    onChange={(e) => onChange(name, e.target.value ?? "")}
    placeholder={placeholder || `Enter ${label}`}
    error={!!error}
    helperText={error}
    size="small"
    variant="outlined"
    autoComplete="off"
    sx={{
      mb: 1,
      "& .MuiInputBase-root": {
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

export default TextInput;
