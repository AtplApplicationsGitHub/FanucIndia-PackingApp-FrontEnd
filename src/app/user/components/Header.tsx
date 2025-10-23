"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Home, Package, Truck, Grid } from "lucide-react";
import LogoutButton from "@/common/components/LogoutButton";
import { getGreeting } from "@/app/sales/components/utils/sales";
import { UserDashboardView } from "@/app/user/hooks/useUserDashboard";
import { useTheme } from "@mui/material";

const FANUC_BLUE = "#3b579d";

type Props = {
  userName: string;
  view: UserDashboardView;
  setView: (view: UserDashboardView) => void; 
};

const menuItems = [
  { label: "HOME", icon: <Home className="mr-2 h-4 w-4" />, value: "home" },
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
      color="default"
      sx={{ px: 0, boxShadow: 2, bgcolor: "background.paper" }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 2, md: 8 },
          pr: { xs: 8, md: 10 },
          py: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            mr: 3,
          }}
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            justifyContent: "flex-end",
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
                  startIcon={item.icon}
                  onClick={() => setView(item.value as UserDashboardView)}
                  sx={{
                    borderRadius: 0,
                    px: 2.5,
                    py: 1.5,
                    minWidth: 120,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected
                      ? FANUC_BLUE
                      : theme.palette.text.secondary,
                    bgcolor: "transparent",
                    boxShadow: "none",
                    outline: "none",
                    border: "none",
                    borderBottom: isSelected
                      ? `3px solid ${FANUC_BLUE}`
                      : "3px solid transparent",
                    "&:hover": {
                      color: FANUC_BLUE,
                      background: theme.palette.action.hover,
                      textDecoration: "none",
                      boxShadow: "none",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    textTransform: "none",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ ml: 2, whiteSpace: "nowrap" }}>
            <LogoutButton sx={{ px: 6, py: 2 }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
