"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Home, Package, Truck, Grid } from "lucide-react";
import { UserDashboardView } from "@/app/user/hooks/useUserDashboard";
import { useTheme } from "@mui/material";
import Image from "next/image"; 
import UserMenu from "@/common/components/UserMenu";
import SoNotificationBell from "@/common/components/SoNotificationBell";

type Props = {
  userName: string;
  view: UserDashboardView;
  setView: (view: UserDashboardView) => void;
};

const menuItems = [
  { label: "DASHBOARD", icon: <Home className="mr-2 h-4 w-4" />, value: "home" },
  {
    label: "PICK & PACK",
    icon: <Package className="mr-2 h-4 w-4" />,
    value: "pick_pack",
  },
  {
    label: "DISPATCH",
    icon: <Truck className="mr-2 h-4 w-4" />,
    value: "dispatch",
  },
  {
    label: "FG DASHBOARD",
    icon: <Grid className="mr-2 h-4 w-4" />,
    value: "fg_dashboard",
  },
];

export default function UserDashboardHeader({
  userName,
  view,
  setView,
}: Props) {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      elevation={1}
      color="primary" 
      sx={{
        px: 0,
        boxShadow: 2,
        bgcolor: theme.palette.primary.main,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pl: { xs: 2, md: 4 },
          pr: { xs: '64px', md: '80px' },
          py: 1,
          minHeight: 64,
        }}
      >
        <Box
          sx={{ flexGrow: 1, mr: 3, cursor: "pointer" }}
          onClick={() => setView("home")}
        >
          <Image
            src="/Fanuc_India.png" 
            alt="Fanuc India Logo"
            width={120} 
            height={28}
            priority
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              justifyContent: "center",
              gap: 2,
            }}
          >
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
                    px: 2.5,
                    py: 1.5,
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
                    "&:hover": {
                      bgcolor: "transparent",
                      opacity: 0.8,
                      textDecoration: "none",
                      boxShadow: "none",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    textTransform: "uppercase",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Box>
            <SoNotificationBell />
        <Box sx={{ ml: 3 }}>
          <UserMenu username={userName} userRole="USER" variant="full" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}