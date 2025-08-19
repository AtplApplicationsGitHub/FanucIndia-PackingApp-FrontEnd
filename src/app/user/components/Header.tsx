"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Home, Package } from "lucide-react";
import LogoutButton from "@/common/components/LogoutButton";
import { getGreeting } from "@/app/sales/components/utils/sales";
import { UserDashboardView } from "@/app/user/hooks/useUserDashboard";

const FANUC_BLUE = "#3b579d";

type Props = {
  userName: string;
  view: UserDashboardView;
  setView: (view: UserDashboardView) => void; // Corrected the type here
};

const menuItems = [
  { label: "HOME", icon: <Home className="mr-2 h-4 w-4" />, value: "home" },
  { label: "PICK & PACK", icon: <Package className="mr-2 h-4 w-4" />, value: "pick_pack" },
];

export default function UserDashboardHeader({ userName, view, setView }: Props) {
  return (
    <AppBar
      position="static"
      elevation={1}
      color="default"
      sx={{ px: 0, boxShadow: 2, bgcolor: "background.paper" }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 2, md: 8 },
          py: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ display: "flex", alignItems: "center" }}
        >
          {getGreeting()}
          {userName && (
            <>
              ,&nbsp;
              <Box
                component="span"
                sx={{
                  color: FANUC_BLUE,
                  fontWeight: 600,
                }}
              >
                {userName}
              </Box>
            </>
          )}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {menuItems.map(item => {
            const isSelected = view === item.value;
            return (
              <Button
                key={item.value}
                disableRipple
                variant="text"
                startIcon={item.icon}
                onClick={() => setView(item.value as UserDashboardView)}
                sx={{
                  borderRadius: 0,
                  px: 2.5,
                  py: 1.2,
                  minWidth: 120,
                  fontWeight: isSelected ? 700 : 500,
                  color: FANUC_BLUE,
                  bgcolor: isSelected ? "rgba(59,87,157,0.08)" : "transparent",
                  boxShadow: isSelected ? "0 0 0 2px #3b579d22" : "none",
                  "&:hover": {
                    background: isSelected
                      ? "rgba(59,87,157,0.12)"
                      : "rgba(59,87,157,0.06)",
                  },
                  textTransform: "none",
                  transition: "all 0.15s",
                }}
              >
                {item.label}
              </Button>
            );
          })}

          <Box sx={{ ml: 4 }}>
            <LogoutButton sx={{ px: 6, py: 2 }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
