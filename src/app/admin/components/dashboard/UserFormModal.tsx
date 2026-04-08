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
  Box,
  Typography,
  InputAdornment,
  IconButton,
  useTheme,
  Theme,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { Eye, EyeClosed, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import axios from "axios";
import { User, UserRole } from "@/app/admin/components/types/admin";
import { API, fetchWithAuth } from '@/common/lib/endpoints';
import CommonButton from "@/common/components/CommonButton";

// data sent on form submission
export interface UserSubmitData {
  name: string;
  email: string;
  role: UserRole;
  salesZoneId?: number;
  password?: string;
  accessPickPack?: boolean;
  accessLabelPrint?: boolean;
  accessMaterialFgTransfer?: boolean;
  accessMaterialDispatch?: boolean;
  accessVehicleEntry?: boolean;
  accessLocationAccuracy?: boolean;
  accessContentAccuracy?: boolean;
  accessPutAway?: boolean;
  accessErpBarcode?: boolean;
  accessAttachment?: boolean;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (data: UserSubmitData, id?: number) => void;
  editingUser: User | null;
}

const MOBILE_MODULES = [
  { label: "Pick & Pack", key: "accessPickPack" },
  { label: "Customer Label Print", key: "accessLabelPrint" },
  { label: "Material FG/Transfer", key: "accessMaterialFgTransfer" },
  { label: "Material Dispatch", key: "accessMaterialDispatch" },
  { label: "Vehicle Entry", key: "accessVehicleEntry" },
  { label: "Location Accuracy", key: "accessLocationAccuracy" },
  { label: "Content Accuracy", key: "accessContentAccuracy" },
  { label: "Put Away", key: "accessPutAway" },
  { label: "ERP Barcode", key: "accessErpBarcode" },
  { label: "Attachment", key: "accessAttachment" },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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
  zone: number | "";
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
      zone: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "checking" | "available" | "exists" | null
  >(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [salesZones, setSalesZones] = useState<{ id: number; name: string }[]>([]);

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

  useEffect(() => {
    fetchWithAuth(API.LOOKUP.SALES_ZONES)
      .then((res) => res.json())
      .then((data) => setSalesZones(data))
      .catch((err) => console.error("Sales zones fetch failed:", err));
  }, []);

  const name = watch("name");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const role = watch("role");
  const isUserRole = role === "USER";
  const isSalesRole = role === "SALES";

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
      setValue("zone", editingUser.salesZoneId ?? "");

      const currentAccess: string[] = [];
      if (editingUser.accessPickPack) currentAccess.push("accessPickPack");
      if (editingUser.accessLabelPrint) currentAccess.push("accessLabelPrint");
      if (editingUser.accessMaterialFgTransfer) currentAccess.push("accessMaterialFgTransfer");
      if (editingUser.accessMaterialDispatch) currentAccess.push("accessMaterialDispatch");
      if (editingUser.accessVehicleEntry) currentAccess.push("accessVehicleEntry");
      if (editingUser.accessLocationAccuracy) currentAccess.push("accessLocationAccuracy");
      if (editingUser.accessContentAccuracy) currentAccess.push("accessContentAccuracy");
      if (editingUser.accessPutAway) currentAccess.push("accessPutAway");
      if (editingUser.accessErpBarcode) currentAccess.push("accessErpBarcode");
      if (editingUser.accessAttachment) currentAccess.push("accessAttachment");
      setSelectedModules(currentAccess);
    } else {
      reset();
      setSelectedModules([]);
    }
  }, [editingUser, open, setValue, reset]);

  const handleModuleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setSelectedModules(typeof value === 'string' ? value.split(',') : value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const submitHandler = (data: FormFields) => {
    const { name, email, role, password } = data;
    if (!role) return;

    const payload: UserSubmitData = {
      name: name.trim(),
      email: email.trim(),
      role,
      accessPickPack: false,
      accessLabelPrint: false,
      accessMaterialFgTransfer: false,
      accessMaterialDispatch: false,
      accessVehicleEntry: false,
      accessLocationAccuracy: false,
      accessContentAccuracy: false,
      accessPutAway: false,
      accessErpBarcode: false,
      accessAttachment: false,
    };

    if (role === "SALES" && data.zone) {
      payload.salesZoneId = data.zone as number;
    }
    if (password) {
      payload.password = password;
    }

    if (role === 'USER') {
      payload.accessPickPack = selectedModules.includes("accessPickPack");
      payload.accessLabelPrint = selectedModules.includes("accessLabelPrint");
      payload.accessMaterialFgTransfer = selectedModules.includes("accessMaterialFgTransfer");
      payload.accessMaterialDispatch = selectedModules.includes("accessMaterialDispatch");
      payload.accessVehicleEntry = selectedModules.includes("accessVehicleEntry");
      payload.accessLocationAccuracy = selectedModules.includes("accessLocationAccuracy");
      payload.accessContentAccuracy = selectedModules.includes("accessContentAccuracy");
      payload.accessPutAway = selectedModules.includes("accessPutAway");
      payload.accessErpBarcode = selectedModules.includes("accessErpBarcode");
      payload.accessAttachment = selectedModules.includes("accessAttachment");
    }

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
    (isSalesRole && !watch("zone")) ||
    (!editingUser && (!password || !allSatisfied || !passwordsMatch)) ||
    (!!password && (!allSatisfied || !passwordsMatch))


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      {/* Updated Title Color to Fanuc Red */}
      <DialogTitle sx={{
        color: theme.palette.secondary.main,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 20,
        textAlign: 'center',
        pb: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        position: 'relative',
      }}>
        {editingUser ? "Edit User Credentials" : "Create User Credentials"}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
            '&:hover': {
              color: theme.palette.error.main,
            }
          }}
        >
          <X size={20} />
        </IconButton>
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
          {isSalesRole && (
            <FormControl fullWidth size="small" error={!!errors.zone}>
              <InputLabel id="zone-label">Zone</InputLabel>
              <Controller
                name="zone"
                control={control}
                rules={{ required: isSalesRole ? "Zone is required" : false }}
                render={({ field }) => (
                  <Select
                    labelId="zone-label"
                    label="Zone"
                    size="small"
                    {...field}
                  >
                    {salesZones.map((z) => (
                      <MenuItem key={z.id} value={z.id}>
                        {z.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.zone && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1 }}>
                  {errors.zone.message}
                </Typography>
              )}
            </FormControl>
          )}

          {isUserRole && (
            <FormControl fullWidth size="small">
              <InputLabel id="mobile-access-label">Module Access</InputLabel>
              <Select
                labelId="mobile-access-label"
                multiple
                value={selectedModules}
                onChange={handleModuleChange}
                input={<OutlinedInput label="Module Access" />}
                renderValue={(selected) =>
                  MOBILE_MODULES
                    .filter(m => selected.includes(m.key))
                    .map(m => m.label)
                    .join(', ')
                }
                MenuProps={MenuProps}
              >
                {MOBILE_MODULES.map((module) => (
                  <MenuItem key={module.key} value={module.key}>
                    <Checkbox checked={selectedModules.indexOf(module.key) > -1} />
                    <ListItemText primary={module.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, justifyContent: 'flex-end' }}>
        <CommonButton onClick={handleSubmit(submitHandler)} disabled={disableSubmit}>
          {editingUser ? "UPDATE USER" : "CREATE USER"}
        </CommonButton>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUserFormModal;