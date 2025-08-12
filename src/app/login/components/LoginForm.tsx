import React from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Eye, EyeClosed } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

export interface LoginFormInputs {
  email: string;
  password: string;
}

interface LoginFormProps {
  register: UseFormRegister<LoginFormInputs>;
  errors: FieldErrors<LoginFormInputs>;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  loading: boolean;
  successMsg: string;
  errorMsg: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export default function LoginForm({
  register,
  errors,
  showPassword,
  onToggleShowPassword,
  loading,
  successMsg,
  errorMsg,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          size="medium"
          autoFocus
          {...register("email", { required: true })}
          error={!!errors.email}
          helperText={errors.email ? "Email is required" : ""}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="outlined"
          size="medium"
          {...register("password", { required: true })}
          error={!!errors.password}
          helperText={errors.password ? "Password is required" : ""}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={onToggleShowPassword} edge="end">
                    {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Button
          type="submit"
          variant="outlined"
          size="large"
          fullWidth
          disabled={loading}
          sx={() => {
            const mainBlue = "#1877F2";
            return {
              textTransform: "none",
              fontWeight: 600,
              borderWidth: 2,
              borderColor: mainBlue,
              color: mainBlue,
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#0d47a1",
                color: "#ffffff",
                borderColor: mainBlue,
              },
            };
          }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "LOGIN"}
        </Button>
      </Box>
    </form>
  );
}
