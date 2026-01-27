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
  disabled?: boolean;
};

const TextInput: React.FC<Props> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = true,
  placeholder,
  disabled,
}) => (
  <TextField
    fullWidth
    label={label}
    name={name}
    value={value}
    required={required}
    disabled={disabled}
    onChange={(e) => onChange(name, e.target.value ?? "")}
    placeholder={placeholder || `Enter ${label}`}
    error={!!error}
    helperText={error}
    size="medium" 
    variant="outlined"
    autoComplete="off"
    sx={{
      "& .MuiInputBase-root": {
        borderRadius: "4px",
        backgroundColor: (theme) => theme.palette.background.paper,
      },
      "& .MuiInputLabel-root": {
        fontWeight: 500,
        fontSize: 16, 
      },
      "& .MuiFormLabel-asterisk": {
        color: "#dc2626",
      },
    }}
  />
);

export default TextInput;