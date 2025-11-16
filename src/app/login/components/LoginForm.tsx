import React from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Eye, EyeClosed, ArrowRight } from "lucide-react";
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
      <Box display="flex" flexDirection="column" gap={3}>
        <TextField
          label="Email or Username"
          type="text"
          fullWidth
          variant="outlined"
          size="medium"
          autoFocus
          {...register("email", { required: true })}
          error={!!errors.email}
          helperText={errors.email ? "Email is required" : ""}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#FFCC00',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#FFCC00',
            },
          }}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#FFCC00',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#FFCC00',
            },
          }}
        />

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          endIcon={!loading && !successMsg && <ArrowRight size={20} />}
          sx={{
            bgcolor: '#FFCC00',
            color: '#000000',
            borderRadius: 0,
            clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            textTransform: "none",
            fontWeight: 700,
            fontSize: '1rem',
            py: 1.5,
            letterSpacing: '1px',
            boxShadow: '0 4px 12px rgba(255,204,0,0.3)',
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: '#000000',
              color: '#FFCC00',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
            },
            "&:disabled": {
              bgcolor: '#e0e0e0',
              color: '#999',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#000000' }} />
          ) : successMsg ? (
            successMsg
          ) : (
            "LOGIN"
          )}
        </Button>
      </Box>
    </form>
  );
}