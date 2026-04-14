"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Box,
  useTheme,
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
import { ClipboardList, BarChart3, Search, ArrowLeft, Menu, X } from "lucide-react";
import Image from "next/image";
import UserMenu from "@/common/components/UserMenu";
import packageJson from "../../../../package.json";

type Props = {
  userName: string;
  view: SalesDashboardView;
  salesZone: string;
  setView: (view: SalesDashboardView) => void;
  showBackButton?: boolean;
};

const menuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-1 h-4 w-4" />, value: "home" },
  { label: "ORDERS", icon: <ClipboardList className="mr-1 h-4 w-4" />, value: "orders" },
  { label: "DISPATCHED ORDERS", icon: <ClipboardList className="mr-1 h-4 w-4" />, value: "dispatched" },
  { label: "SO SEARCH", icon: <Search className="mr-1 h-4 w-4" />, value: "so_search" },
];

export default function SalesDashboardHeader({ userName, salesZone, view, setView, showBackButton }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    // Close drawer on mobile after selection
    setDrawerOpen(false);
  };

  return (
    <>
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
              sx={{
                mr: 1,
                color: theme.palette.primary.contrastText,
                "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              }}
            >
              <ArrowLeft size={24} />
            </IconButton>
          )}

          {/* Logo + Version */}
          <Box
            sx={{
              flexGrow: 1,
              mr: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
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

          {/* Desktop Nav Menu — hidden on mobile */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
            }}
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

          {/* Right Section: Zone + Hamburger (mobile only) + User */}
          <Box
            sx={{
              ml: { xs: 0.5, md: 0 },
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, md: 1 },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "white",
                bgcolor: "tomato",
                fontWeight: 700,
                px: { xs: 0.7, md: 1 },
                py: 0.7,
                borderRadius: 1,
                fontSize: { xs: "0.65rem", md: "0.75rem" },
                whiteSpace: "nowrap",
              }}
            >
              ZONE: {salesZone.toUpperCase()}
            </Typography>

            {/* Hamburger Menu Icon — visible only on mobile, sits between Zone and UserMenu */}
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
              <Menu size={22} />
            </IconButton>

            <UserMenu username={userName} userRole="SALES" variant="full" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
        }}
      >
        {/* Drawer Header — close button only */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 1,
            py: 1,
            borderBottom: `1px solid rgba(255,255,255,0.15)`,
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: theme.palette.primary.contrastText,
              "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
            }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Nav Items List */}
        <List disablePadding>
          {menuItems.map((item) => {
            const isSelected = getIsSelected(item.value);
            return (
              <ListItem key={item.value} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.value)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderLeft: isSelected
                      ? `4px solid ${theme.palette.primary.contrastText}`
                      : "4px solid transparent",
                    bgcolor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: theme.palette.primary.contrastText,
                      minWidth: 36,
                    }}
                  >
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