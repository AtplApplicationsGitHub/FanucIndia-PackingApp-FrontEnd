"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useInactivityLogout } from "@/common/hooks/useInactivityLogout";
import GlobalSnackbar from "./GlobalSnackbar";
import apiClient from "@/common/lib/apiClient";
import { API } from "@/common/lib/endpoints";

export default function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const publicRoutes = ["/login", "/signup"];

  const isProtectedRoute = !publicRoutes.includes(pathname);

  useInactivityLogout(120, isProtectedRoute);

  useEffect(() => {
    if (!isProtectedRoute) return;

    const pingSession = async () => {
      try {
        await apiClient.get(API.AUTH.CHECK_SESSION);
      } catch (error) {
      }
    };

    const intervalId = setInterval(pingSession, 10000);

    return () => clearInterval(intervalId);
  }, [isProtectedRoute]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {children}
      <GlobalSnackbar />
    </LocalizationProvider>
  );
}
