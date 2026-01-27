import * as React from "react";
import TextField from "@mui/material/TextField";

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const RemarksTextarea: React.FC<Props> = ({
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled,
}) => (
  <TextField
    fullWidth
    label="Special Remarks"
    name="specialRemarks"
    value={value}
    onChange={(e) => onChange("specialRemarks", e.target.value ?? "")}
    placeholder={placeholder || "Enter remarks"}
    multiline
    minRows={3}
    required={required}
    disabled={disabled}
    error={!!error}
    helperText={error}
    size="small"
    variant="outlined"
    autoComplete="off"
    sx={{
      mb: 1,
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
);

export default RemarksTextarea;