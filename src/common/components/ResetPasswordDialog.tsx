"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Theme,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { Eye, EyeClosed, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { UserRole } from "@/app/admin/components/types/admin";
import CommonButton from "./CommonButton";

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userRole?: UserRole;
}

const passwordChecks = [
  { label: "At least 8 characters", check: (pw: string) => pw.length >= 8 },
  {
    label: "At least 1 special character (!@#$%^&*)",
    check: (pw: string) => /[!@#$%^&*]/.test(pw),
  },
  { label: "At least 1 number", check: (pw: string) => /\d/.test(pw) },
  {
    label: "At least 1 uppercase letter",
    check: (pw: string) => /[A-Z]/.test(pw),
  },
];

const pinValidation = {
  label: "Password must be a 4-digit PIN",
  check: (pw: string) => /^\d{4}$/.test(pw),
};

interface ResetPasswordFormData {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ResetPasswordDialog({
  open,
  onClose,
  userRole = "USER",
}: ResetPasswordDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actualRole, setActualRole] = useState<UserRole>(userRole || "USER");

  React.useEffect(() => {
    if (open) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          if (userObj && userObj.role) {
            setActualRole(userObj.role);
          }
        }
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, [open, userRole]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const newPassword = watch("newPassword", "");
  const isUserRole = actualRole === "USER";

  const passwordStatus = useMemo(() => {
    if (isUserRole) return [pinValidation.check(newPassword)];
    return passwordChecks.map((c) => c.check(newPassword));
  }, [newPassword, isUserRole]);

  const allSatisfied = passwordStatus.every(Boolean);

  const handleFormClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setSubmitting(true);
    try {
      const response = await fetchWithAuth(API.USER.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password");
      }

      setSnackbar({
        open: true,
        message: "Password updated successfully!",
        severity: "success",
      });

      setTimeout(() => {
        handleFormClose();
      }, 2000);

    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setSnackbar({
        open: true,
        message: message,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleFormClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{
        display: "flex", justifyContent: "center", alignItems: "center",
        fontWeight: 700, fontSize: "20px", letterSpacing: 0.5,
        color: "error.main",
        pb: 1,
        position: "relative",
      }} >
        RESET PASSWORD
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box
          component="form"
          mt={2}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            label="Old Password"
            type={showOld ? "text" : "password"}
            fullWidth
            size="small"
            {...register("oldPassword", {
              required: "Old password is required",
            })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOld(!showOld)}>
                    {showOld ? <Eye size={18} /> : <EyeClosed size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="New Password"
            type={showNew ? "text" : "password"}
            fullWidth
            size="small"
            {...register("newPassword", {
              required: "New password is required",
            })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew(!showNew)}>
                    {showNew ? <Eye size={18} /> : <EyeClosed size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box>
            {(isUserRole ? [pinValidation] : passwordChecks).map((check, i) => (
              <Box key={i} display="flex" alignItems="center" gap={1}>
                {passwordStatus[i] ? (
                  <CheckCircle size={14} color="green" />
                ) : (
                  <XCircle size={14} color="red" />
                )}
                <Typography
                  variant="caption"
                  color={passwordStatus[i] ? "success.main" : "error"}
                >
                  {check.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            size="small"
            {...register("confirmPassword", {
              validate: (val) =>
                val === newPassword || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message as string}
          />
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <CommonButton onClick={handleFormClose} >
          CANCEL
        </CommonButton>
        <CommonButton
          onClick={handleSubmit(onSubmit)}
          disabled={submitting || !allSatisfied}
        >
          {submitting ? "SUBMITTING..." : "SUBMIT"}
        </CommonButton>
      </DialogActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
