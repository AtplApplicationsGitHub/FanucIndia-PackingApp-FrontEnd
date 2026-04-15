"use client";

import {
  Box,
  Card,
  CardContent,
  Alert,
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Button,
  Divider,
} from "@mui/material";
import { ChevronDown, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { API } from "@/common/lib/endpoints";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm, { LoginFormInputs } from "@/app/login/components/LoginForm";
import LoginSnackbar from "@/app/login/components/LoginSnackbar";
import LoginHeader from "@/app/login/components/LoginHeader";
import apiClient from "@/common/lib/apiClient";
import packageJson from "../../../package.json";
import Image from "next/image";
import UserMenu from "@/common/components/UserMenu";
import { API_BASE_URL } from "@/common/lib/endpoints";

interface ApkDetails {
  appName: string;
  latestVersion: string;
  fileName: string;
  downloadUrl: string;
}

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
  const [alertMessage, setAlertMessage] = useState<string>("");

  // APK Dropdown state
  const [apkAnchorEl, setApkAnchorEl] = useState<null | HTMLElement>(null);
  const apkMenuOpen = Boolean(apkAnchorEl);
  const handleApkClick = (event: React.MouseEvent<HTMLElement>) => {
    setApkAnchorEl(event.currentTarget);
  };
  const handleApkClose = () => {
    setApkAnchorEl(null);
  };

  // APK Info state
  const [apkInfo, setApkInfo] = useState<{
    dispatch: ApkDetails | null;
    pickPack: ApkDetails | null;
  }>({ dispatch: null, pickPack: null });

  useEffect(() => {
    const fetchApkInfo = async () => {
        try {
          const baseUrl = API_BASE_URL;
          const [dispatchRes, pickPackRes] = await Promise.all([
            apiClient.get<ApkDetails>(`${baseUrl}/app-update/dispatch/latest-version`).catch(() => null),
            apiClient.get<ApkDetails>(`${baseUrl}/app-update/pick-pack/latest-version`).catch(() => null),
          ]);

        setApkInfo({
          dispatch: dispatchRes?.data || null,
          pickPack: pickPackRes?.data || null,
        });
      } catch (err) {
        console.error("Failed to fetch APK info:", err);
      }
    };

    fetchApkInfo();
  }, []);

  useEffect(() => {
    if (searchParams.get("loggedout") === "1") {
      setLoggedOutSnackbar(true);
    }
    
    const reason = searchParams.get("reason");
    if (reason === "session-expired") {
      setAlertMessage("Your session was revoked because this account was accessed from another device. Please log in again.");
    } else if (reason === "inactivity") {
      setAlertMessage("Your session expired due to inactivity. Please log in again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("loggedout") === "1" || searchParams.get("reason") === "session-expired") {
      return;
    }

    const token = Cookies.get("token") || localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        
        if (user.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else if (user.role === "SALES") {
          router.replace("/sales/dashboard");
        } else if (user.role === "USER") {
          router.replace("/user/dashboard");
        }
      } catch (err: unknown) {
        console.warn("Failed to parse user session data", err);
      }
    }
  }, [router, searchParams]);

  const handleLoggedOutSnackbarClose = (
    _e?: React.SyntheticEvent | Event,
    reason?: string,
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
      email: data.email.replace(/\s+/g, ""),
      password: data.password.replace(/\s+/g, ""),
    };

    // [Step 1] Capture previous user from LocalStorage before overwriting
    const prevUserStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
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
        payload,
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
          {/* Logo & Version */}
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
            <Image
              src="/Fanuc_India.png"
              alt="Fanuc India Logo"
              width={85}
              height={21}
              priority
            />
            <Typography
              variant="caption"
              sx={{
                color: "#000000",
                opacity: 0.7,
                fontWeight: 600,
                fontSize: "0.75rem",
                lineHeight: 1,
                mb: "2px", 
              }}
            >
              v{packageJson.version}
            </Typography>
          </Box>

          {/* App Download Links using Dropdown */}
          <Box sx={{ mr: 6 }}>
            <Button
              onClick={handleApkClick}
              endIcon={<ChevronDown size={16} />}
              sx={{
                color: "#000000",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.9rem",
                borderRadius: "8px",
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.05)",
                },
              }}
            >
              Get APK
            </Button>
            <Menu
              anchorEl={apkAnchorEl}
              open={apkMenuOpen}
              onClose={handleApkClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1,
                  borderRadius: "12px",
                  minWidth: 220,
                  "& .MuiMenuItem-root": {
                    borderRadius: "8px",
                    mx: 0.5,
                    my: 0.5,
                  },
                },
              }}
            >
              <MenuItem
                component="a"
                href={apkInfo.pickPack?.downloadUrl || `${process.env.NEXT_PUBLIC_API_URL}/app-update/pick-pack/download`}
                onClick={handleApkClose}
                sx={{ py: 1.5 }}
              >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: "text.primary", textTransform: "capitalize" }}
                    >
                      {apkInfo.pickPack?.appName || "Pick & Pack APK"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      {apkInfo.pickPack?.latestVersion 
                        ? `Version ${apkInfo.pickPack.latestVersion}` 
                        : "Latest Version"}
                    </Typography>
                  </Box>
                <ListItemIcon sx={{ minWidth: "auto", ml: 2 }}>
                  <Download size={20} color="#1976d2" />
                </ListItemIcon>
              </MenuItem>

              <Divider sx={{ my: "0 !important", opacity: 0.6 }} />

              <MenuItem
                component="a"
                href={apkInfo.dispatch?.downloadUrl || `${process.env.NEXT_PUBLIC_API_URL}/app-update/dispatch/download`}
                onClick={handleApkClose}
                sx={{ py: 1.5 }}
              >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: "text.primary", textTransform: "capitalize" }}
                    >
                      {apkInfo.dispatch?.appName || "Dispatch APK"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      {apkInfo.dispatch?.latestVersion 
                        ? `Version ${apkInfo.dispatch.latestVersion}` 
                        : "Latest Version"}
                    </Typography>
                  </Box>
                <ListItemIcon sx={{ minWidth: "auto", ml: 2 }}>
                  <Download size={20} color="#1976d2" />
                </ListItemIcon>
              </MenuItem>
            </Menu>
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
          bgcolor: "background.default", // This uses the theme color
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
            {alertMessage && (
              <Alert
                severity="warning"
                onClose={() => setAlertMessage("")}
                sx={{ mb: 2, width: "100%" }}
              >
                {alertMessage}
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
