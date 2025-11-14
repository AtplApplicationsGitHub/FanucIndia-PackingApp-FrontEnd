// app/sales/components/Header.tsx
"use client";

import React from "react";
import { AppBar, Toolbar, Typography, Box, useTheme, Button } from "@mui/material";
import LogoutButton from "@/common/components/LogoutButton";
import { getGreeting } from "@/app/sales/components/utils/sales";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
import { Home, ClipboardList, BarChart3 } from "lucide-react";

type Props = {
  userName: string;
  view: SalesDashboardView;
  setView: (view: SalesDashboardView) => void;
};

const FANUC_BLUE = "#3b579d";

const menuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-2 h-4 w-4" />, value: "home" },
  { label: "ORDERS", icon: <ClipboardList className="mr-2 h-4 w-4" />, value: "orders" },
];

export default function SalesDashboardHeader({ userName, view, setView }: Props) {
  const theme = useTheme();

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: "background.paper", borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 }, py: 1.5, minHeight: 64 }}>
        <Typography variant="h6" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
          {getGreeting()}
          {userName && (
            <>
              ,{" "}
              <Box component="span" sx={{ color: FANUC_BLUE, fontWeight: 600 }}>
                {userName}
              </Box>
            </>
          )}
        </Typography>

        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "center", gap: 3 }}>
          {menuItems.map((item) => {
            const isSelected = view === item.value;
            return (
              <Button
                key={item.value}
                disableRipple
                variant="text"
                startIcon={item.icon}
                onClick={() => setView(item.value as SalesDashboardView)}
                sx={{
                  position: "relative",
                  px: 3,
                  py: 1.5,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? FANUC_BLUE : "text.secondary",
                  borderBottom: isSelected ? `3px solid ${FANUC_BLUE}` : "3px solid transparent",
                  borderRadius: 0,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: FANUC_BLUE,
                    bgcolor: "action.hover",
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ ml: 2 }}>
          <LogoutButton sx={{ px: 4, py: 1.5 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}