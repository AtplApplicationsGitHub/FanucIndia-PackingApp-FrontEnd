"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useInactivityLogout } from "@/common/hooks/useInactivityLogout";

export default function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const publicRoutes = ["/login", "/signup"];

  const isProtectedRoute = !publicRoutes.includes(pathname);

  useInactivityLogout(10, isProtectedRoute);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {children}
    </LocalizationProvider>
  );
}