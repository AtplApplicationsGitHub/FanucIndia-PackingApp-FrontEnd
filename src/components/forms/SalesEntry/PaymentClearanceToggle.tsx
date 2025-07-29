import * as React from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import FormHelperText from "@mui/material/FormHelperText";

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
}) => (
  <FormControl
    required={required}
    error={!!error}
    component="fieldset"
    sx={{
      mb: 1,
      "& .MuiFormLabel-root": {
        fontWeight: 500,
        fontSize: 15,
      },
      "& .MuiFormLabel-asterisk": {
        color: "#dc2626",
      },
    }}
  >
    <FormLabel component="legend" required={required}>
      Payment Clearance
    </FormLabel>
    <RadioGroup
      row
      value={value}
      onChange={(e) => onChange("paymentClearance", e.target.value)}
      sx={{ mt: 1, gap: 3 }}
      name="payment-clearance"
    >
      <FormControlLabel
        value="true"
        control={<Radio size="small" />}
        label="Yes"
      />
      <FormControlLabel
        value="false"
        control={<Radio size="small" />}
        label="No"
      />
    </RadioGroup>
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

export default PaymentClearanceToggle;
