"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  sx?: object;
}

export default function LogoutButton({ sx = {} }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      router.replace("/login?loggedout=1");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
  variant="outlined"
  color="error"
  size="small" 
  sx={{
    borderColor: "error.main",
    color: "error.main",
    fontWeight: 700,
    minWidth: 120,
    minHeight: 32,
    height: 36,
    py: 0,
    px: 2.5,
    mr: 4,
    borderRadius: 1.5,
    fontSize: 16, 
    boxShadow: "none",
    "&:hover": {
      borderColor: "error.dark",
      color: "error.dark",
      background: "rgba(244, 67, 54, 0.04)",
      boxShadow: "none",
    },
    ...sx,
  }}
  onClick={handleLogout}
  startIcon={!loading && <LogOut size={18} />}
>
      {loading ? (
        <CircularProgress size={18} thickness={5} color="inherit" />
      ) : (
        "Logout"
      )}
    </Button>
  );
}
