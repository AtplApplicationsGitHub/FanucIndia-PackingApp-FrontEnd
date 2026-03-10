"use client";

import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Box, useTheme, Menu, MenuItem } from "@mui/material";
import {
  BarChart3,
  ClipboardList,
  Database,
  Users,
  Truck,
  Grid,
  Search,
  ChevronDown,
} from "lucide-react";
import UserMenu from "@/common/components/UserMenu";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export type ViewType =
  | "home"
  | "orders"
  | "master"
  | "manage"
  | "dispatch"
  | "fg_dashboard"
  | "assignso";

type Props = {
  userName: string;
  view: ViewType;
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
};

const allMenuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-1 h-4 w-4" />, value: "home" },
  { label: "ASSIGN SO", icon: <ClipboardList className="mr-1 h-4 w-4" />, value: "assignso" },
  {
    label: "ORDER LIST",
    icon: <ClipboardList className="mr-1 h-4 w-4" />,
    value: "orders",
  },
  {
    label: "SO SEARCH",
    icon: <Search className="mr-1 h-4 w-4" />,
    value: "so_search",
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
  {
    label: "MASTER",
    icon: <Database className="mr-1 h-4 w-4" />,
    value: "master",
  },
];

const MAX_VISIBLE_ITEMS = 7;

export default function AdminDashboardHeader({
  userName,
  view,
  setView,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const visibleItems = allMenuItems.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenItems = allMenuItems.slice(MAX_VISIBLE_ITEMS);

  const getIsSelected = (itemValue: string) => {
    if (pathname.startsWith("/so-search")) {
      return itemValue === "so_search";
    }
    return itemValue === view;
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value: string) => {
    if (value === "so_search") {
      router.push("/so-search");
    } else {
      setView(value as ViewType);
    }
    handleMenuClose();
  };

  const isActiveItemHidden = hiddenItems.some((item) =>
    getIsSelected(item.value)
  );

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
          alignItems: "center",
          pl: { xs: 2, md: 4 },
          pr: { xs: 1, md: 2 },
          py: 0.5,
          minHeight: 20,
        }}
      >
        <Box
          sx={{ flexGrow: 1, mr: 3, cursor: "pointer" }}
          onClick={() => setView("home")}
        >
          <Image
            src="/Fanuc_India.png"
            alt="Fanuc India Logo"
            width={85}
            height={21}
            priority
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.1 }}>
            {visibleItems.map((item) => {
              const isSelected = getIsSelected(item.value);
              return (
                <Button
                  key={item.value}
                  disableRipple
                  variant="text"
                  onClick={() => handleMenuItemClick(item.value)}
                  sx={{
                    borderRadius: 0,
                    px: 1.5,
                    py: 1,
                    minWidth: "auto",
                    fontWeight: isSelected ? 700 : 600,
                    color: theme.palette.primary.contrastText,
                    bgcolor: "transparent",
                    boxShadow: "none",
                    borderBottom: isSelected
                      ? `3px solid ${theme.palette.primary.contrastText}`
                      : "3px solid transparent",
                    "&:hover": {
                      bgcolor: "transparent",
                      opacity: 0.8,
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

            {hiddenItems.length > 0 && (
              <>
                <Button
                  disableRipple
                  variant="text"
                  onClick={handleMoreClick}
                  endIcon={<ChevronDown size={20} />}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    minWidth: "auto",
                    fontWeight: isActiveItemHidden ? 700 : 600,
                    color: theme.palette.primary.contrastText,
                    borderBottom: isActiveItemHidden
                      ? `3px solid ${theme.palette.primary.contrastText}`
                      : "3px solid transparent",
                    "&:hover": {
                      bgcolor: "transparent",
                      opacity: 0.8,
                    },
                    textTransform: "uppercase",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  More
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{
                    style: { maxHeight: 48 * 4.5, width: "20ch" },
                    sx: {
                      bgcolor: theme.palette.primary.main, // Fanuc Yellow
                      boxShadow: 3,
                    }
                  }}
                >
                  {hiddenItems.map((item) => {
                    const isSelected = getIsSelected(item.value);
                    return (
                      <MenuItem
                        key={item.value}
                        selected={isSelected}
                        onClick={() => handleMenuItemClick(item.value)}
                        sx={{
                          fontWeight: isSelected ? 700 : 500,
                          color: theme.palette.primary.contrastText, // "Black" text
                          "& .lucide": {
                            marginRight: 1.5,
                            color: theme.palette.primary.contrastText, // "Black" icon
                            width: 18,
                            height: 18,
                          },
                          "&:hover": {
                            bgcolor: "rgba(0, 0, 0, 0.08)", // Slight darken on hover
                          },
                          "&.Mui-selected": {
                            bgcolor: "rgba(0, 0, 0, 0.08)", // Selected state
                            "&:hover": {
                              bgcolor: "rgba(0, 0, 0, 0.12)",
                            },
                          },
                        }}
                      >
                        {item.icon} {item.label}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </>
            )}
          </Box>
        </Box>
        <Box sx={{ ml: 0 }}>
          <UserMenu username={userName} userRole="ADMIN" variant="full" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}