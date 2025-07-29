"use client";

import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import { CheckCircle, XCircle, Eye, EyeClosed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AnimatedPage from "@/components/common/AnimatedPage";
import axios from "axios";
import Cookies from "js-cookie";
import { API } from "@/lib/api";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const passwordChecks = [
  {
    label: "At least 8 characters",
    check: (pw: string) => pw.length >= 8,
  },
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

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignupForm>({
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [emailStatus, setEmailStatus] = useState<
    null | "checking" | "available" | "exists" | "error"
  >(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const email = watch("email") || "";

  const passwordStatus = passwordChecks.map(({ check }) => check(password));
  const allSatisfied = passwordStatus.every(Boolean);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  useEffect(() => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailStatus(null);
      return;
    }
    setEmailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(API.AUTH.CHECK_EMAIL(email));
        setEmailStatus(res.data.exists ? "exists" : "available");
      } catch {
        setEmailStatus("error");
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email]);

  const onSubmit = async (data: SignupForm) => {
    if (!allSatisfied || !passwordsMatch || emailStatus !== "available") return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post(API.AUTH.SIGNUP, {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "sales",
      });
      const { accessToken } = res.data;
      Cookies.set("token", accessToken, { expires: 1 });
      localStorage.setItem("token", accessToken);
      setSuccess(true);
    } catch (err) {
      let message = "Signup failed";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        sx={{
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(to bottom right, #1e1e1e, #121212)"
              : "linear-gradient(to bottom right, #f5f5f5, #ffffff)",
        }}
      >
        <Card
          sx={{ maxWidth: 480, width: "100%", borderRadius: 3, boxShadow: 4 }}
        >
          <CardHeader
            title={
              <Typography variant="h5" fontWeight={600} textAlign="center">
                Create an Account
              </Typography>
            }
            subheader={
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Signup as a Sales User
              </Typography>
            }
          />
          <CardContent>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Account created successfully! Redirecting to login...
              </Alert>
            )}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Name Field */}
                <TextField
                  label="Name"
                  type="text"
                  autoFocus
                  fullWidth
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

                {/* Email */}
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="username"
                  fullWidth
                  {...register("email", { required: true })}
                  error={!!errors.email}
                  helperText={errors.email ? "Email is required" : ""}
                  disabled={loading}
                  InputProps={{
                    endAdornment: email && (
                      <InputAdornment position="end">
                        {emailStatus === "checking" && (
                          <Loader2
                            className="animate-spin text-gray-400"
                            size={18}
                          />
                        )}
                        {emailStatus === "available" && (
                          <CheckCircle className="text-green-600" size={18} />
                        )}
                        {emailStatus === "exists" && (
                          <XCircle className="text-red-600" size={18} />
                        )}
                        {emailStatus === "error" && (
                          <XCircle className="text-orange-500" size={18} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
                {emailStatus === "exists" && (
                  <Typography color="error" variant="body2">
                    Email already exists
                  </Typography>
                )}
                {emailStatus === "available" && (
                  <Typography color="success.main" variant="body2">
                    Email can be registered
                  </Typography>
                )}
                {emailStatus === "error" && (
                  <Typography color="warning.main" variant="body2">
                    Could not validate email
                  </Typography>
                )}

                {/* Password */}
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  fullWidth
                  {...register("password", { required: true })}
                  error={!!errors.password}
                  helperText={errors.password ? "Password is required" : ""}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? (
                            <Eye size={20} />
                          ) : (
                            <EyeClosed size={20} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password Strength */}
                <Box>
                  {password && (
                    <Box mt={1}>
                      {passwordChecks.map(({ label }, i) => (
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          key={label}
                        >
                          {passwordStatus[i] ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-red-600" />
                          )}
                          <Typography
                            variant="caption"
                            color={passwordStatus[i] ? "success.main" : "error"}
                          >
                            {label}
                          </Typography>
                        </Box>
                      ))}

                      {allSatisfied && (
                        <Box mt={1} display="flex" alignItems="center" gap={1}>
                          <CheckCircle size={18} className="text-green-600" />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="success.main"
                          >
                            All password conditions satisfied!
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>

                {/* Confirm Password */}
                <TextField
                  label="Retype Password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  fullWidth
                  {...register("confirmPassword", { required: true })}
                  error={!!errors.confirmPassword}
                  helperText={
                    confirmPassword && !passwordsMatch
                      ? "Passwords do not match"
                      : errors.confirmPassword
                        ? "Retype password is required"
                        : ""
                  }
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm((v) => !v)}
                          edge="end"
                        >
                          {showConfirm ? (
                            <Eye size={20} />
                          ) : (
                            <EyeClosed size={20} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {confirmPassword && passwordsMatch && allSatisfied && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <CheckCircle size={18} /> Passwords match!
                  </Typography>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  disabled={
                    loading ||
                    !isValid ||
                    !allSatisfied ||
                    !passwordsMatch ||
                    emailStatus !== "available"
                  }
                  sx={(theme) => {
                    const isDark = theme.palette.mode === "dark";
                    const mainBlue = "#1877F2";
                    return {
                      textTransform: "none",
                      fontWeight: 600,
                      borderWidth: 2,
                      borderColor: mainBlue,
                      color: mainBlue,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: isDark ? "#0d47a1" : "#0d47a1",
                        color: isDark ? "#ffffff" : "#ffffff",
                        borderColor: mainBlue,
                      },
                    };
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <Typography variant="body2" align="center" mt={1}>
                  Already have an account?{" "}
                  <Link href="/login" underline="hover" color="primary">
                    Log in
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </AnimatedPage>
  );
}
