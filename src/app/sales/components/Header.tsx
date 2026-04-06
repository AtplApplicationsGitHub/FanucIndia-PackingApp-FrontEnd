"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppBar, Toolbar, Box, useTheme, Button, Typography } from "@mui/material";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
import { ClipboardList, BarChart3, Search } from "lucide-react";
import Image from "next/image";
import UserMenu from "@/common/components/UserMenu";

type Props = {
  userName: string;
  view: SalesDashboardView;
  salesZone: string;
  setView: (view: SalesDashboardView) => void;
};

const menuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-1 h-4 w-4" />, value: "home" },
  { label: "ORDERS", icon: <ClipboardList className="mr-1 h-4 w-4" />, value: "orders" },
  { label: "DISPATCHED ORDERS", icon: <ClipboardList className="mr-1 h-4 w-4" />, value: "dispatched" },
  { label: "SO SEARCH", icon: <Search className="mr-1 h-4 w-4" />, value: "so_search" },
];

export default function SalesDashboardHeader({ userName, salesZone, view, setView }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const getIsSelected = (itemValue: string) => {
    if (pathname.startsWith("/so-search")) {
      return itemValue === "so_search";
    }
    return itemValue === view;
  };

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
          pr: { xs: 1, md: 2 },
          py: 0.5,
          minHeight: 20,
        }}
      >
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
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </Typography>
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.1 }}>
            {menuItems.map((item) => {
              const isSelected = getIsSelected(item.value);
              return (
                <Button
                  key={item.value}
                  disableRipple
                  variant="text"
                  onClick={() => handleMenuItemClick(item.value)}
                  sx={{
                    position: "relative",
                    px: 1.5,
                    py: 1,
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
                  {item.icon}
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Box>
        <Box sx={{ ml: 0, mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: "white",
              bgcolor: "tomato",
              fontWeight: 700,
              px: 1,
              py: 0.7,
              borderRadius: 1,
              fontSize: "0.75rem",
            }}
          >
            ZONE: {salesZone.toUpperCase()}
          </Typography>
          <UserMenu username={userName} userRole="SALES" variant="full" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}