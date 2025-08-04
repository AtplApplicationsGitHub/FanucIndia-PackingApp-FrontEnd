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
      color="error"
      size="medium"
      disabled={loading}
      onClick={handleLogout}
      startIcon={!loading && <LogOut size={18} />}
      sx={{
        borderRadius: 0,
        fontWeight: 600,
        fontSize: 15,
        minWidth: 120,
        height: 40,
        px: 3,
        textTransform: "none",
        boxShadow: "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(244, 67, 54, 0.10)", 
          boxShadow: "none",
        },
        "&:disabled": {
          opacity: 0.6,
        },
        ...sx,
      }}
    >
      {loading ? (
        <CircularProgress size={18} thickness={4.5} color="inherit" />
      ) : (
        "LOGOUT"
      )}
    </Button>
  );
}
