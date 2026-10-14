"use client";

import { useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import { Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

import AdminDashboardHeader, {
  type ViewType,
} from "@/app/admin/components/dashboard/Header";

const AUDIT_ROUTES: Record<string, string> = {
  audit_planning: "/admin/audit/planning",
  reconciliation_discrepancy: "/admin/audit/reconciliation",
  audit_history: "/admin/audit/history",
};

export default function AuditLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      setUserName(user.name || "");
    } catch {
      setUserName("");
    }
  }, []);

  const selected = (
    pathname.includes("/history")
      ? "audit_history"
      : pathname.includes("/reconciliation")
        ? "reconciliation_discrepancy"
        : "audit_planning"
  ) as ViewType;

  const setView: Dispatch<SetStateAction<ViewType>> = (next) => {
    const value = typeof next === "function" ? next(selected) : next;

    router.push(AUDIT_ROUTES[value] || `/admin/dashboard?view=${value}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <AdminDashboardHeader
        userName={userName}
        view={selected}
        setView={setView}
        showBackButton
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          px: { xs: 2, md: 4 },
          py: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
