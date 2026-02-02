"use client";

import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Settings,
  ChevronDown,
  LogOut,
  Palette,
  KeyRound,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
} from "lucide-react";
import { ColorModeContext, ColorMode } from "@/common/lib/color-mode-context";
import { logoutUser } from "@/common/lib/auth";
import { useRouter } from "next/navigation";
import { UserRole } from "@/app/admin/components/types/admin";
import ResetPasswordDialog from "./ResetPasswordDialog";

interface UserMenuProps {
  username?: string;
  userRole?: UserRole; // Added strict typing for role
  variant?: "full" | "minimal";
}

export default function UserMenu({
  username,
  userRole, // Default to USER if not provided
  variant = "full",
}: UserMenuProps) {
  const router = useRouter();
  const Theme = useTheme();
  const { mode, setMode } = useContext(ColorModeContext);

  const [mainAnchor, setMainAnchor] = useState<null | HTMLElement>(null);
  const [themeAnchor, setThemeAnchor] = useState<null | HTMLElement>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState<UserRole | undefined>(userRole);

  useEffect(() => {
    if (userRole) {
      setDetectedRole(userRole);
    } else {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          if (userObj.role) setDetectedRole(userObj.role as UserRole);
        } catch (e) { console.error("Role detection failed", e); }
      }
    }
  }, [userRole]);

  const isMainOpen = Boolean(mainAnchor);
  const isThemeOpen = Boolean(themeAnchor);

  const handleMainOpen = (e: React.MouseEvent<HTMLElement>) =>
    setMainAnchor(e.currentTarget);
  
  const handleMainClose = () => {
    setMainAnchor(null);
    setThemeAnchor(null);
  };

  const handleThemeOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setThemeAnchor(e.currentTarget);
  };

  const handleThemeClose = () => setThemeAnchor(null);

  const handleThemeSelect = (newMode: ColorMode) => {
    setMode(newMode);
    handleMainClose();
  };

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
    <Box>
      <Button
        onClick={handleMainOpen}
        startIcon={variant === "minimal" ? <Settings size={22} /> : undefined}
        endIcon={variant === "full" ? <ChevronDown size={18} /> : undefined}
        sx={{
          color: Theme.palette.mode === 'dark' ? '#000000' : 'inherit',
          textTransform: "none",
          fontWeight: 600,
          minWidth: variant === "minimal" ? "auto" : "64px",
          p: variant === "minimal" ? 1 : "6px 16px",
          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          "& .MuiButton-startIcon": { margin: 0 },
        }}
      >
        {variant === "full" ? `Hi ${username || "User"}` : ""}
      </Button>

      <Menu
        anchorEl={mainAnchor}
        open={isMainOpen}
        onClose={handleMainClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleThemeOpen}>
          <ListItemIcon>
            <Palette size={18} />
          </ListItemIcon>
          <ListItemText>THEMES</ListItemText>
          <ChevronRight size={14} style={{ marginLeft: "auto" }} />
        </MenuItem>

        {variant === "full" && [
          <MenuItem 
            key="reset" 
            onClick={() => {
              setResetDialogOpen(true);
              handleMainClose();
            }}
          >
            <ListItemIcon>
              <KeyRound size={18} />
            </ListItemIcon>
            <ListItemText>RESET PASSWORD</ListItemText>
          </MenuItem>,
          <Divider key="div" />,
          <MenuItem
            key="logout"
            onClick={handleLogout}
            disabled={loading}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <LogOut size={18} color="red" />
              )}
            </ListItemIcon>
            <ListItemText>LOGOUT</ListItemText>
          </MenuItem>,
        ]}
      </Menu>

      {/* Nested Themes Sub-menu */}
      <Menu
        anchorEl={themeAnchor}
        open={isThemeOpen}
        onClose={handleThemeClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleThemeSelect("light")} selected={mode === "light"}>
          <ListItemIcon><Sun size={18} /></ListItemIcon>
          <ListItemText>LIGHT</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleThemeSelect("dark")} selected={mode === "dark"}>
          <ListItemIcon><Moon size={18} /></ListItemIcon>
          <ListItemText>DARK</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleThemeSelect("system")} selected={mode === "system"}>
          <ListItemIcon><Monitor size={18} /></ListItemIcon>
          <ListItemText>SYSTEM</ListItemText>
        </MenuItem>
      </Menu>

      <ResetPasswordDialog 
        open={resetDialogOpen} 
        onClose={() => setResetDialogOpen(false)} 
        userRole={detectedRole || "USER"}
      />
    </Box>
  );
}