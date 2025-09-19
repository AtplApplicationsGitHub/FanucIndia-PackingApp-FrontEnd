"use client";

import { Box, Card, CardContent, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API } from '@/common/lib/endpoints';
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm, { LoginFormInputs } from "@/app/login/components/LoginForm";
import LoginSnackbar from "@/app/login/components/LoginSnackbar";
import LoginHeader from "@/app/login/components/LoginHeader";
import apiClient from "@/common/lib/apiClient";

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
      const res = await apiClient.post<LoginSuccessPayload>(API.AUTH.LOGIN, data);
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
    <>
      <LoginSnackbar
        open={loggedOutSnackbar}
        onClose={handleLoggedOutSnackbarClose}
      />

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
          sx={{
            maxWidth: 450,
            width: "100%",
            borderRadius: 3,
            boxShadow: 4,
          }}
        >
          <LoginHeader />
          <CardContent>
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
      </>
  );
}
