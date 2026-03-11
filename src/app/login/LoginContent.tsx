"use client";

import { Box, Card, CardContent, Alert, AppBar, Toolbar, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API } from "@/common/lib/endpoints";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm, { LoginFormInputs } from "@/app/login/components/LoginForm";
import LoginSnackbar from "@/app/login/components/LoginSnackbar";
import LoginHeader from "@/app/login/components/LoginHeader";
import apiClient from "@/common/lib/apiClient";
import Image from "next/image";
import UserMenu from "@/common/components/UserMenu";

type UserRole = "ADMIN" | "SALES" | "USER";
type User = { role: UserRole; email: string } & Record<string, unknown>;

type LoginSuccessPayload = {
  accessToken: string;
  user: User;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybe = err as { message?: unknown };
    if (typeof maybe.message === "string") return maybe.message;
  }
  return "Something went wrong.";
}

export default function LoginContent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const [loggedOutSnackbar, setLoggedOutSnackbar] = useState<boolean>(false);
  const [sessionExpiredAlert, setSessionExpiredAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get("loggedout") === "1") {
      setLoggedOutSnackbar(true);
    }
    if (searchParams.get("reason") === "session-expired") {
      setSessionExpiredAlert(true);
    }
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

  const onSubmitData = async (data: LoginFormInputs) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      email: data.email.replace(/\s+/g, ''),
      password: data.password.replace(/\s+/g, ''),
    };

    // [Step 1] Capture previous user from LocalStorage before overwriting
    const prevUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let prevEmail = "";
    if (prevUserStr) {
      try {
        const prevUser = JSON.parse(prevUserStr);
        prevEmail = prevUser.email || "";
      } catch {
        // ignore parsing error
      }
    }

    try {
      const res = await apiClient.post<LoginSuccessPayload>(
        API.AUTH.LOGIN,
        payload
      );
      const { accessToken, user } = res.data;

      // [Step 2] Check if user changed. If so, clear view state.
      // This ensures a new/different user always lands on the Dashboard.
      if (user.email !== prevEmail) {
        sessionStorage.removeItem("adminView");
        sessionStorage.removeItem("salesDashboardView");
        sessionStorage.removeItem("userDashboardView");
      }

      Cookies.set("token", accessToken, { expires: 1 });
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMsg("LOGGING IN...");

      setTimeout(() => {
        if (user.role === "ADMIN") {
          window.location.replace("/admin/dashboard");
        } else if (user.role === "SALES") {
          window.location.replace("/sales/dashboard");
        } else if (user.role === "USER") {
          window.location.replace("/user/dashboard");
        } else {
          setErrorMsg("Unknown user role.");
          setSuccessMsg("");
          setLoading(false);
        }
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
      setSuccessMsg("");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LoginSnackbar
        open={loggedOutSnackbar}
        onClose={handleLoggedOutSnackbarClose}
      />

      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#FFCC00", // Fanuc Yellow
          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.4)", // Stronger shadow
          position: "relative",
          zIndex: 10, // Ensure shadow appears above content below
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pl: { xs: 2, md: 4 },
            pr: { xs: 1, md: 2 },
            py: 0.5,
            minHeight: 20,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/Fanuc_India.png"
              alt="Fanuc India Logo"
              width={85}
              height={21}
              priority
            />
          </Box>
        </Toolbar>
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
          <UserMenu variant="minimal" />
        </Box>
      </AppBar>

      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        sx={{
          bgcolor: 'background.default' // This uses the theme color
        }}
      >
        <Card
          sx={{
            maxWidth: 480,
            width: "100%",
            borderRadius: 0,
            clipPath:
              "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.15)",
            border: (theme) =>
              theme.palette.mode === "dark"
                ? "2px solid #333"
                : "2px solid #e0e0e0",
          }}
        >
          <LoginHeader />
          <CardContent sx={{ px: 4, pb: 4 }}>
            {sessionExpiredAlert && (
              <Alert
                severity="warning"
                onClose={() => setSessionExpiredAlert(false)}
                sx={{ mb: 2, width: "100%" }}
              >
                Your session expired due to inactivity. Please log in again.
              </Alert>
            )}
            <LoginForm
              register={register}
              errors={errors}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((v) => !v)}
              loading={loading}
              successMsg={successMsg}
              errorMsg={errorMsg}
              onSubmit={handleSubmit(onSubmitData)}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}