"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  useTheme, 
  Theme,
} from "@mui/material";
import { Eye, EyeClosed, CheckCircle, XCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { User, UserRole } from "@/app/admin/components/types/admin";
import { API } from '@/common/lib/endpoints';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (
    data: {
      name: string;
      email: string;
      role: UserRole;
      password?: string;
    },
    id?: number
  ) => void;
  editingUser: User | null;
}

const roles: UserRole[] = ["ADMIN", "SALES", "USER"];
const passwordChecks = [
  { label: "At least 8 characters", check: (pw: string) => pw.length >= 8 },
  {
    label: "At least 1 special character (!@#$%^&*)",
    check: (pw: string) => (pw.match(/[!@#$%^&*]/g) || []).length >= 1,
  },
  {
    label: "At least 1 number",
    check: (pw: string) => (pw.match(/\d/g) || []).length >= 1,
  },
  {
    label: "At least 1 uppercase letter",
    check: (pw: string) => /[A-Z]/.test(pw),
  },
];

const pinValidation = {
  label: "Password must be a 4-digit PIN",
  check: (pw: string) => /^\d{4}$/.test(pw),
};

type FormFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | "";
};

const AdminUserFormModal: React.FC<Props> = ({
  open,
  setOpen,
  onSubmit,
  editingUser,
}) => {
  const theme = useTheme(); // Initialize theme hook

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "checking" | "available" | "exists" | null
  >(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const { ref: nameFieldRef } = register("name", {
    required: "Name is required",
    minLength: { value: 3, message: "Name must be at least 3 characters" },
  });

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const name = watch("name");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const role = watch("role");

  const isUserRole = role === "USER";

  const passwordStatus = useMemo(() => {
    if (isUserRole) {
      return [pinValidation.check(password || "")];
    }
    return passwordChecks.map(({ check }) => check(password || ""));
  }, [password, isUserRole]);

  const allSatisfied = passwordStatus.every(Boolean);
  const passwordsMatch = !password || password === confirmPassword;

  useEffect(() => {
    if (!email) {
      setEmailStatus(null);
      return;
    }

    if (editingUser && email === editingUser.email) {
      setEmailStatus("available");
      return;
    }

    setEmailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(API.AUTH.CHECK_EMAIL(email));
        setEmailStatus(res.data.exists ? "exists" : "available");
      } catch {
        setEmailStatus(null);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email, editingUser]);

  useEffect(() => {
    if (editingUser) {
      setValue("name", editingUser.name);
      setValue("email", editingUser.email);
      setValue("password", "");
      setValue("confirmPassword", "");
      setValue("role", editingUser.role);
    } else {
      reset();
    }
  }, [editingUser, open, setValue, reset]);

  const handleClose = () => {
    setOpen(false);
  };

  const submitHandler = (data: FormFields) => {
    const { name, email, role, password } = data;
    if (!role) return;

    const payload: {
      name: string;
      email: string;
      role: UserRole;
      password?: string;
    } = {
      name: name.trim(),
      email: email.trim(),
      role,
    };
    if (password) payload.password = password;
    if (editingUser) {
      onSubmit(payload, editingUser.id);
    } else {
      onSubmit(payload);
    }
  };

  const disableSubmit =
    !name.trim() ||
    name.trim().length < 3 ||
    !email.trim() ||
    emailStatus !== "available" ||
    !role ||
    (!editingUser && (!password || !allSatisfied || !passwordsMatch)) ||
    (!!password && (!allSatisfied || !passwordsMatch));

  // Updated Reusable sx prop for buttons
  const buttonSx = {
    bgcolor: (theme: Theme) => theme.palette.action.hover, // Grey by default
    color: (theme: Theme) => theme.palette.text.primary,   // Dark text
    borderRadius: 0,
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
    fontWeight: 600,
    fontSize: 15,
    minWidth: 120,
    height: 40,
    px: 3,
    textTransform: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: (theme: Theme) => theme.palette.primary.main, // Fanuc Yellow on hover
      color: (theme: Theme) => theme.palette.primary.contrastText,
      boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
      "& .MuiSvgIcon-root, & svg": {
        color: "#000",
      },
    },
    "&:disabled": {
       opacity: 0.6,
       bgcolor: (theme: Theme) => theme.palette.action.disabledBackground,
       color: (theme: Theme) => theme.palette.text.disabled
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      {/* Updated Title Color to Fanuc Red */}
      <DialogTitle sx={{ 
        color: theme.palette.secondary.main, // Fanuc Red
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {editingUser ? "Edit User" : "Create User"}
      </DialogTitle>
      
      <DialogContent>
        <Box
          component="form"
          mt={2}
          display="flex"
          flexDirection="column"
          gap={2}
          onSubmit={handleSubmit(submitHandler)}
        >
          {/* ... existing TextFields for Name, Email, Role, etc. ... */}
          <TextField
            label="Name"
            fullWidth
            size="small"
            inputRef={(el) => {
              nameFieldRef(el);
              nameInputRef.current = el;
            }}
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            label="Email or Username"
            fullWidth
            size="small"
            {...register("email", {
              required: "Email or Username is required",
            })}
            error={!!errors.email || emailStatus === "exists"}
            helperText={
              errors.email?.message ||
              (emailStatus === "exists"
                ? "This email or username already exists"
                : "")
            }
            InputProps={{
              endAdornment: email && (
                <InputAdornment position="end">
                  {emailStatus === "checking" && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {emailStatus === "available" && (
                    <CheckCircle size={18} color="green" />
                  )}
                  {emailStatus === "exists" && (
                    <XCircle size={18} color="red" />
                  )}
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="role-label">Role</InputLabel>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select
                  labelId="role-label"
                  label="Role"
                  size="small"
                  {...field}
                >
                  {roles.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.role && (
              <Typography variant="caption" color="error.main" sx={{ mt: 1 }}>
                {errors.role.message}
              </Typography>
            )}
          </FormControl>

          {role && (
            <>
              <TextField
                label={editingUser ? "New Password (optional)" : "Password"}
                fullWidth
                size="small"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={
                  isUserRole
                    ? "Enter 4-digit PIN"
                    : editingUser
                    ? "Leave blank to keep unchanged"
                    : ""
                }
                {...register("password", {
                  validate: (val) => {
                    if (!editingUser && !val) return "Password is required";
                    if (val) {
                      if (isUserRole) {
                        return (
                          pinValidation.check(val) || pinValidation.label
                        );
                      }
                      if (val.length < 8) return "Min 8 characters";
                    }
                    return true;
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <Eye /> : <EyeClosed />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {!isUserRole && (password || !editingUser) && (
                <Box>
                  {passwordChecks.map(({ label }, i) => (
                    <Box
                      key={label}
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      {passwordStatus[i] ? (
                        <CheckCircle size={16} color="green" />
                      ) : (
                        <XCircle size={16} color="red" />
                      )}
                      <Typography
                        variant="caption"
                        color={passwordStatus[i] ? "success.main" : "error"}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <TextField
                label="Confirm Password"
                fullWidth
                size="small"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword", {
                  validate: (val) =>
                    !password || val === password || "Passwords do not match",
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((v) => !v)}>
                        {showConfirm ? <Eye /> : <EyeClosed />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={buttonSx} 
        >
          CANCEL
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit(submitHandler)}
          disabled={disableSubmit}
          sx={buttonSx}
        >
          {editingUser ? "UPDATE" : "CREATE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUserFormModal;