"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { IconButton } from "@mui/material";
import {  Package, Truck, Grid, BarChart3, ArrowLeft } from "lucide-react";
import { UserDashboardView } from "@/app/user/hooks/useUserDashboard";
import { useTheme, Typography } from "@mui/material";
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
  {
    label: "PICK & PACK",
    icon: <Package className="mr-1 h-4 w-4" />,
    value: "pick_pack",
  },
  {
    label: "DISPATCH",
    icon: <Truck className="mr-1 h-4 w-4" />,
    value: "dispatch",
  },
  {
    label: "FG DASHBOARD",
    icon: <Grid className="mr-1 h-4 w-4" />,
    value: "fg_dashboard",
  },
];

export default function UserDashboardHeader({
  userName,
  view,
  setView,
  showBackButton,
}: Props) {
  const theme = useTheme();
  const router = useRouter();

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
          pr: { xs: 1, md: 2 },
          py: 0.5,
          minHeight: 20,
        }}
      >
        {showBackButton && (
          <IconButton
            onClick={() => router.back()}
            sx={{
              mr: 2,
              color: theme.palette.primary.contrastText,
              "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
            }}
          >
            <ArrowLeft size={24} />
          </IconButton>
        )}
        <Box
          sx={{ 
            flexGrow: 1, 
            mr: 3, 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "flex-end", 
            gap: 1 
          }}
          onClick={() => setView("home")}
        >
          <Image
            src="/Fanuc_India.png"
            alt="Fanuc India Logo"
            width={85}
            height={21}
            priority
          />
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.primary.contrastText,
              opacity: 0.7,
              fontWeight: 600,
              fontSize: "0.75rem",
              lineHeight: 1,
              mb: "2px", 
            }}
          >
            v{packageJson.version}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              justifyContent: "center",
              gap: 0.1,
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
                  {item.icon}
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ ml: 0 }}>
          <UserMenu username={userName} userRole="USER" variant="full" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}