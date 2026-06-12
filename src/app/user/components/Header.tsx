"use client";

import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Package, Truck, Grid, BarChart3, ArrowLeft, Menu as MenuIcon, X, Activity as ActivityIcon } from "lucide-react";
import { UserDashboardView } from "@/app/user/hooks/useUserDashboard";
import { useTheme } from "@mui/material";
import Image from "next/image";
import UserMenu from "@/common/components/UserMenu";
import packageJson from "../../../../package.json";
import { useRouter } from "next/navigation";

type Props = {
  userName: string;
  view: UserDashboardView;
  setView: (view: UserDashboardView) => void;
  showBackButton?: boolean;
};

const menuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-1 h-4 w-4" />, value: "home" },
  { label: "PICK & PACK", icon: <Package className="mr-1 h-4 w-4" />, value: "pick_pack" },
  { label: "DISPATCH", icon: <Truck className="mr-1 h-4 w-4" />, value: "dispatch" },
  { label: "FG DASHBOARD", icon: <Grid className="mr-1 h-4 w-4" />, value: "fg_dashboard" },
  { label: "STATUS HUB", icon: <ActivityIcon className="mr-1 h-4 w-4" />, value: "status_hub" }, // ADD THIS

];

export default function UserDashboardHeader({ userName, view, setView, showBackButton }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuItemClick = (value: string) => {
    setView(value as UserDashboardView);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        color="primary"
        sx={{ px: 0, boxShadow: 2, bgcolor: theme.palette.primary.main }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            pl: { xs: 1.5, md: 4 },
            pr: { xs: 1, md: 2 },
            py: 0.5,
            minHeight: 20,
          }}
        >
          {/* Back Button */}
          {showBackButton && (
            <IconButton
              onClick={() => router.back()}
              sx={{ mr: 1, color: theme.palette.primary.contrastText, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}
            >
              <ArrowLeft size={24} />
            </IconButton>
          )}

          {/* Logo + Version */}
          <Box
            sx={{ flexGrow: 1, mr: 1, cursor: "pointer", display: "flex", alignItems: "flex-end", gap: 1 }}
            onClick={() => setView("home")}
          >
            <Image src="/Fanuc_India.png" alt="Fanuc India Logo" width={85} height={21} priority />
            <Typography
              variant="caption"
              sx={{ color: theme.palette.primary.contrastText, opacity: 0.7, fontWeight: 600, fontSize: "0.75rem", lineHeight: 1, mb: "2px" }}
            >
              v{packageJson.version}
            </Typography>
          </Box>

          {/* Desktop Nav — hidden on mobile */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "flex-end" }}>
            <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "center", gap: 0.1 }}>
              {menuItems.map((item) => {
                const isSelected = view === item.value;
                return (
                  <Button
                    key={item.value}
                    disableRipple
                    variant="text"
                    onClick={() => setView(item.value as UserDashboardView)}
                    sx={{
                      borderRadius: 0,
                      px: 1.5,
                      py: 1,
                      minWidth: 120,
                      fontWeight: isSelected ? 700 : 600,
                      color: theme.palette.primary.contrastText,
                      bgcolor: "transparent",
                      boxShadow: "none",
                      outline: "none",
                      border: "none",
                      borderBottom: isSelected
                        ? `3px solid ${theme.palette.primary.contrastText}`
                        : "3px solid transparent",
                      "&:hover": { bgcolor: "transparent", opacity: 0.8, textDecoration: "none", boxShadow: "none" },
                      "&:focus": { outline: "none" },
                      textTransform: "uppercase",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Right: UserMenu + Hamburger (mobile) */}
          <Box sx={{ ml: { xs: 0.5, md: 0 }, display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
            <UserMenu username={userName} userRole="USER" variant="full" />
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                display: { xs: "flex", md: "none" },
                color: theme.palette.primary.contrastText,
                p: 0.5,
                "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              }}
              aria-label="Open navigation menu"
            >
              <MenuIcon size={22} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 260, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
        }}
      >
        {/* Close button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            px: 1,
            py: 1,
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: theme.palette.primary.contrastText, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Nav Items */}
        <List disablePadding>
          {menuItems.map((item) => {
            const isSelected = view === item.value;
            return (
              <ListItem key={item.value} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.value)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderLeft: isSelected ? `4px solid ${theme.palette.primary.contrastText}` : "4px solid transparent",
                    bgcolor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: "0.85rem",
                      letterSpacing: 0.5,
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}