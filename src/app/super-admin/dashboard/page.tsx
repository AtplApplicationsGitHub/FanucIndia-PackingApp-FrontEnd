"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import SuperAdminDashboardHeader, {
  SuperAdminDashboardView,
} from "@/app/super-admin/components/Header";
import AdminMasterLookupPanel from "@/app/admin/components/dashboard/LookupPanel";

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [userName, setUserName] = useState("");
  const [view, setView] = useState<SuperAdminDashboardView>("master");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "SUPER_ADMIN") {
        router.replace("/login");
        return;
      }
      setUserName(user.name || "");
      setAuthorized(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <SuperAdminDashboardHeader userName={userName} view={view} setView={setView} />

      <Box sx={{ px: { xs: 1.5, md: 4 }, py: 2 }}>
        {view === "master" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "0.5% 0 2rem 0" }}
          >
            <AdminMasterLookupPanel />
          </motion.div>
        )}
      </Box>
    </Box>
  );
}
