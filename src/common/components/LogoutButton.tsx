// src/common/components/LogoutButton.tsx

"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/common/lib/auth";
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
      size="medium"
      disabled={loading}
      onClick={handleLogout}
      startIcon={!loading && <LogOut size={18} />}
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper, // White
        color: theme.palette.text.primary,       // Dark text
        borderRadius: 0, // No border radius
        clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)", // Chamfered corners
        fontWeight: 600,
        fontSize: 15,
        minWidth: 120,
        height: 40,
        px: 3,
        textTransform: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "#ef4444", // Red background on hover
          color: "#ffffff", // White text on hover
          boxShadow: "0 4px 8px rgba(239,68,68,0.3)", // Red shadow
          "& .MuiSvgIcon-root, & svg": {
            color: "#ffffff", // White icon on hover
          },
        },
        "&:disabled": {
          opacity: 0.6,
        },
        ...sx,
      })}
    >
      {loading ? (
        <CircularProgress size={18} thickness={4.5} color="inherit" />
      ) : (
        "LOGOUT"
      )}
    </Button>
  );
}