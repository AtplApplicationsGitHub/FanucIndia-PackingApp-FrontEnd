"use client";

import { Box, Card, CardContent } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import AnimatedPage from "@/common/components/AnimatedPage";
import { API } from "@/common/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm, { LoginFormInputs } from "@/app/login/components/LoginForm";
import LoginSnackbar from "@/app/login/components/LoginSnackbar";
import LoginHeader from "@/app/login/components/LoginHeader";
import LoginDemoCredentials from "@/app/login/components/LoginDemoCredentials";
import LoginSignupLink from "@/app/login/components/LoginSignupLink";
import apiClient from "@/common/lib/apiClient";

// If you already have a global User type, use that instead.
type UserRole = "admin" | "sales";
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

  useEffect(() => {
    if (searchParams.get("loggedout") === "1") {
      setLoggedOutSnackbar(true);
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
      setErrorMsg(getErrorMessage(err));
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
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
            <LoginDemoCredentials />
            <LoginSignupLink />
          </CardContent>
        </Card>
      </Box>
    </AnimatedPage>
  );
}
