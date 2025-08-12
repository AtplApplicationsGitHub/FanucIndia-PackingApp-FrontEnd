"use client";

import { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAutoLogout } from "@/common/hooks/useAutoLogout";

export default function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  const logoutSnack = useAutoLogout(10);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
      {logoutSnack}
    </>
  );
}
