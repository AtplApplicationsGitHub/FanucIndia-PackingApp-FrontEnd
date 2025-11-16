"use client";

import React from "react";
import { AppBar, Toolbar, Box, useTheme, Button } from "@mui/material";
import LogoutButton from "@/common/components/LogoutButton";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
import { ClipboardList, BarChart3 } from "lucide-react";
import Image from "next/image"; 

type Props = {
  userName: string; 
  view: SalesDashboardView;
  setView: (view: SalesDashboardView) => void;
};

const menuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-2 h-4 w-4" />, value: "home" },
  { label: "ORDERS", icon: <ClipboardList className="mr-2 h-4 w-4" />, value: "orders" },
];

export default function SalesDashboardHeader({ userName, view, setView }: Props) {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      color="primary" 
      elevation={1}
      sx={{
        bgcolor: theme.palette.primary.main, 
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
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
          sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}
        >
          {menuItems.map((item) => {
            const isSelected = view === item.value;
            return (
              <Button
                key={item.value}
                disableRipple
                variant="text"
                onClick={() => setView(item.value as SalesDashboardView)}
                sx={{
                  position: "relative",
                  px: 3,
                  py: 1.5,
                  fontWeight: isSelected ? 700 : 600,
                  color: theme.palette.primary.contrastText, 
                  borderBottom: isSelected
                    ? `3px solid ${theme.palette.primary.contrastText}` 
                    : "3px solid transparent",
                  borderRadius: 0,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "transparent",
                    opacity: 0.8,
                  },
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ ml: 3 }}>
          <LogoutButton sx={{ px: 4, py: 1.5, height: 40 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}