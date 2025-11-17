"use client";

import { Box, Card, CardContent, Alert, AppBar, Toolbar } from "@mui/material";
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

type UserRole = "ADMIN" | "SALES" | "USER";
type User = { role: UserRole } & Record<string, unknown>;

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
    try {
      const res = await apiClient.post<LoginSuccessPayload>(
        API.AUTH.LOGIN,
        data
      );
      const { accessToken, user } = res.data;
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
            px: { xs: 2, md: 4 },
            py: 1.5,
            minHeight: 70,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/Fanuc_India.png"
              alt="Fanuc India Logo"
              width={140}
              height={32}
              priority
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        sx={{
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
              : "linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)",
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
