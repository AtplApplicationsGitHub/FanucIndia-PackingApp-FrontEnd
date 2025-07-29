import * as React from "react";
import TextField from "@mui/material/TextField";

type Props = {
  value: string;
  onChange: (field: string, value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
};

const RemarksTextarea: React.FC<Props> = ({
  value,
  onChange,
  error,
  required = false,
  placeholder,
}) => (
  <TextField
    fullWidth
    label="Remarks"
    name="specialRemarks"
    value={value}
    onChange={(e) => onChange("specialRemarks", e.target.value ?? "")}
    placeholder={placeholder || "Enter remarks"}
    multiline
    minRows={3}
    required={required}
    error={!!error}
    helperText={error}
    size="small"
    variant="outlined"
    autoComplete="off"
    InputLabelProps={{ required }}
    sx={{
      mb: 1,
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

export default RemarksTextarea;
