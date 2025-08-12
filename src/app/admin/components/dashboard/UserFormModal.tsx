"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
} from "@mui/material";
import { Eye, EyeClosed, CheckCircle, XCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { User, UserRole } from "@/app/admin/components/types/admin";
import { API } from "@/common/lib/api";

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

const roles: UserRole[] = ["admin", "sales", "user"];
const passwordChecks = [
  { label: "At least 8 characters", check: (pw: string) => pw.length >= 8 },
  {
    label: "At least 2 special characters (!@#$%^&*)",
    check: (pw: string) => (pw.match(/[!@#$%^&*]/g) || []).length >= 2,
  },
  {
    label: "At least 2 numbers",
    check: (pw: string) => (pw.match(/\d/g) || []).length >= 2,
  },
  {
    label: "At least 1 uppercase letter",
    check: (pw: string) => /[A-Z]/.test(pw),
  },
];

type FormFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

const AdminUserFormModal: React.FC<Props> = ({
  open,
  setOpen,
  onSubmit,
  editingUser,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormFields>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "checking" | "available" | "exists" | null
  >(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const { ref: nameFieldRef, ...nameReg } = register("name", {
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

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);

  const passwordStatus = useMemo(
    () => passwordChecks.map(({ check }) => check(password || "")),
    [password]
  );
  const allSatisfied = passwordStatus.every(Boolean);
  const passwordsMatch = !password || password === confirmPassword;

  useEffect(() => {
    if (!email || !emailValid) {
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
  }, [email, editingUser, emailValid]);

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
    !emailValid ||
    emailStatus !== "available" ||
    (!editingUser && (!password || !allSatisfied || !passwordsMatch)) ||
    (!!password && (!allSatisfied || !passwordsMatch));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          mt={2}
          display="flex"
          flexDirection="column"
          gap={2}
          onSubmit={handleSubmit(submitHandler)}
        >
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
            label="Email"
            fullWidth
            size="small"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email format",
              },
            })}
            error={!!errors.email || emailStatus === "exists"}
            helperText={
              errors.email?.message ||
              (emailStatus === "exists" ? "Email already exists" : "")
            }
            slotProps={{
              input: {
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
              },
            }}
          />

          <TextField
            label={editingUser ? "New Password (optional)" : "Password"}
            fullWidth
            size="small"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={editingUser ? "Leave blank to keep unchanged" : ""}
            {...register("password", {
              validate: (val) => {
                if (!editingUser && !val) return "Password is required";
                if (val && val.length < 8) return "Min 8 characters";
                return true;
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <Eye /> : <EyeClosed />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {(password || !editingUser) && (
            <Box>
              {passwordChecks.map(({ label }, i) => (
                <Box key={label} display="flex" alignItems="center" gap={1}>
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
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((v) => !v)}>
                      {showConfirm ? <Eye /> : <EyeClosed />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              defaultValue="user"
              {...register("role", { required: true })}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          variant="text"
          sx={{
            color: (theme) => theme.palette.text.primary,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
            borderRadius: 0,
            textTransform: "none",
            px: 2.5,
            py: 1.25,
          }}
        >
          CANCEL
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit(submitHandler)}
          disabled={disableSubmit}
          variant="text"
          sx={{
            color: (theme) => theme.palette.text.primary,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
            borderRadius: 0,
            textTransform: "none",
            px: 2.5,
            py: 1.25,
          }}
        >
          {editingUser ? "UPDATE" : "CREATE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUserFormModal;
