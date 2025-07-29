"use client";

import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import AnimatedPage from "@/components/common/AnimatedPage";
import { Eye, EyeClosed } from "lucide-react";
import { API } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

type LoginForm = { email: string; password: string };

function extractErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (!data) return "Login failed. Please try again.";
    if (typeof data === "string") return data;
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (data.error) return data.error;
    return "Invalid Email/Password, Please try again.";
  }
  return "Login failed. Please try again.";
}

export default function LoginContent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ─── useSearchParams lives here ────────────────────────────────
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loggedOutSnackbar, setLoggedOutSnackbar] = useState(false);

  useEffect(() => {
    if (searchParams.get("loggedout") === "1") setLoggedOutSnackbar(true);
  }, [searchParams]);

  const handleLoggedOutSnackbarClose = (
    _e?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setLoggedOutSnackbar(false);
    const params = new URLSearchParams(window.location.search);
    params.delete("loggedout");
    router.replace(`/login${params.toString() ? "?" + params : ""}`);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await axios.post(API.AUTH.LOGIN, data);
      const { accessToken, user } = res.data;

      Cookies.set("token", accessToken, { expires: 1 });
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMsg("Logging in...");

      setTimeout(() => {
        if (user.role === "admin") {
          window.location.replace("/admin/dashboard");
        } else if (user.role === "sales") {
          window.location.replace("/sales/dashboard");
        } else {
          setErrorMsg("Unknown user role.");
          setSuccessMsg("");
        }
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      {/* Logged out snackbar */}
      <Snackbar
        open={loggedOutSnackbar}
        autoHideDuration={2000}
        onClose={handleLoggedOutSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={handleLoggedOutSnackbarClose}
        >
          You have been logged out.
        </Alert>
      </Snackbar>

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
          sx={{ maxWidth: 400, width: "100%", borderRadius: 3, boxShadow: 4 }}
        >
          <CardHeader
            title={
              <Typography variant="h5" fontWeight={600} textAlign="center">
                Welcome Back
              </Typography>
            }
            subheader={
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Sign in to your account
              </Typography>
            }
          />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  size="medium"
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

                {successMsg && (
                  <Alert severity="success" sx={{ mb: 1 }}>
                    {successMsg}
                  </Alert>
                )}
                {errorMsg && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {errorMsg}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="outlined"
                  size="large"
                  fullWidth
                  disabled={loading}
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
                    "Login"
                  )}
                </Button>

                <Typography
                  variant="caption"
                  align="center"
                  color="text.secondary"
                >
                  Admin Demo: admin@fanuc.com / FanucAdmin123 <br />
                  Sales Demo: user1@example.com / Demo123!@#
                </Typography>

                <Typography variant="body2" align="center" mt={1}>
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" underline="hover" color="primary">
                    Sign up
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
