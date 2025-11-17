// src/app/sales/components/Header.tsx

"use client";

import React from "react";
// Import useRouter and usePathname
import { useRouter, usePathname } from "next/navigation"; 
import { AppBar, Toolbar, Box, useTheme, Button } from "@mui/material";
import LogoutButton from "@/common/components/LogoutButton";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
// Import Search icon
import { ClipboardList, BarChart3, Search } from "lucide-react"; 
import Image from "next/image";

type Props = {
  userName: string;
  view: SalesDashboardView;
  setView: (view: SalesDashboardView) => void;
};

// Add "SO SEARCH" to the menu
const menuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-2 h-4 w-4" />, value: "home" },
  { label: "ORDERS", icon: <ClipboardList className="mr-2 h-4 w-4" />, value: "orders" },
  { label: "SO SEARCH", icon: <Search className="mr-2 h-4 w-4" />, value: "so_search" },
];

export default function SalesDashboardHeader({ userName, view, setView }: Props) {
  const theme = useTheme();
  const router = useRouter(); // Add router
  const pathname = usePathname(); // Add pathname

  // Add logic to check if SO_SEARCH is active via URL
  const getIsSelected = (itemValue: string) => {
    if (pathname.startsWith("/so-search")) {
      return itemValue === "so_search";
    }
    return itemValue === view;
  };

  // Add logic to handle navigation
  const handleMenuItemClick = (value: string) => {
    if (value === "so_search") {
      router.push("/so-search");
    } else {
      setView(value as SalesDashboardView);
    }
  };

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
            // Use the new logic to check if selected
            const isSelected = getIsSelected(item.value); 
            return (
              <Button
                key={item.value}
                disableRipple
                variant="text"
                // Use the new click handler
                onClick={() => handleMenuItemClick(item.value)} 
                sx={{
                  position: "relative",
                  px: 3,
                  py: 1.5,
                  fontWeight: isSelected ? 700 : 600, // Use isSelected
                  color: theme.palette.primary.contrastText,
                  borderBottom: isSelected // Use isSelected
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